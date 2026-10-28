const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

class AmbulanceService {
  async getAmbulances({ status, ambulance_type } = {}) {
    const where = {};
    if (status) where.status = status;
    if (ambulance_type) where.ambulance_type = ambulance_type;

    return await prisma.ambulances.findMany({
      where,
      include: {
        ambulance_trips: {
          orderBy: { start_time: 'desc' },
          take: 3
        }
      },
      orderBy: { id: 'asc' }
    });
  }

  async getAmbulanceById(id) {
    const ambulance = await prisma.ambulances.findUnique({
      where: { id: parseInt(id) },
      include: {
        ambulance_trips: {
          orderBy: { start_time: 'desc' },
          take: 10
        }
      }
    });

    if (!ambulance) {
      throw { status: 404, message: 'Ambulance vehicle not found' };
    }
    return ambulance;
  }

  async addAmbulance(data) {
    const {
      vehicle_number,
      vehicle_model,
      ambulance_type = 'Basic_Life_Support__BLS_',
      driver_name,
      driver_phone,
      paramedic_name,
      current_location = 'CareSync Emergency Bay',
      base_charge = 1200,
      per_km_rate = 50
    } = data;

    if (!vehicle_number || !vehicle_model || !driver_name || !driver_phone) {
      throw { status: 400, message: 'Vehicle number, model, driver name, and driver phone are required' };
    }

    const existing = await prisma.ambulances.findUnique({
      where: { vehicle_number }
    });
    if (existing) {
      throw { status: 409, message: `Ambulance with vehicle number ${vehicle_number} already exists` };
    }

    return await prisma.ambulances.create({
      data: {
        vehicle_number,
        vehicle_model,
        ambulance_type,
        driver_name,
        driver_phone,
        paramedic_name: paramedic_name || null,
        current_location,
        status: 'Available',
        base_charge: parseFloat(base_charge) || 1200,
        per_km_rate: parseFloat(per_km_rate) || 50
      }
    });
  }

  async updateAmbulance(id, data) {
    const ambulanceId = parseInt(id);
    const existing = await prisma.ambulances.findUnique({ where: { id: ambulanceId } });
    if (!existing) {
      throw { status: 404, message: 'Ambulance vehicle not found' };
    }

    const updateData = {};
    if (data.vehicle_model) updateData.vehicle_model = data.vehicle_model;
    if (data.ambulance_type) updateData.ambulance_type = data.ambulance_type;
    if (data.driver_name) updateData.driver_name = data.driver_name;
    if (data.driver_phone) updateData.driver_phone = data.driver_phone;
    if (data.paramedic_name !== undefined) updateData.paramedic_name = data.paramedic_name;
    if (data.current_location) updateData.current_location = data.current_location;
    if (data.status) updateData.status = data.status;
    if (data.base_charge !== undefined) updateData.base_charge = parseFloat(data.base_charge);
    if (data.per_km_rate !== undefined) updateData.per_km_rate = parseFloat(data.per_km_rate);

    return await prisma.ambulances.update({
      where: { id: ambulanceId },
      data: updateData
    });
  }

  async getTrips({ trip_status, ambulance_id } = {}) {
    const where = {};
    if (trip_status) where.trip_status = trip_status;
    if (ambulance_id) where.ambulance_id = parseInt(ambulance_id);

    return await prisma.ambulance_trips.findMany({
      where,
      include: {
        ambulances: true,
        patients: {
          select: {
            id: true,
            patient_id: true,
            name: true,
            phone: true,
            blood_group: true
          }
        }
      },
      orderBy: { start_time: 'desc' }
    });
  }

  async getTripById(id) {
    const trip = await prisma.ambulance_trips.findUnique({
      where: { id: parseInt(id) },
      include: {
        ambulances: true,
        patients: true
      }
    });

    if (!trip) {
      throw { status: 404, message: 'Ambulance trip record not found' };
    }
    return trip;
  }

  async dispatchAmbulance(data) {
    const {
      ambulance_id,
      patient_id,
      caller_name,
      caller_phone,
      pickup_location,
      drop_location = 'CareSync Hospital Emergency ER Bay',
      urgency = 'Emergency_Critical___Red_Code',
      total_km = 10,
      remarks
    } = data;

    if (!ambulance_id || !caller_name || !caller_phone || !pickup_location) {
      throw { status: 400, message: 'Ambulance vehicle, caller name, phone, and pickup location are required' };
    }

    const ambulance = await prisma.ambulances.findUnique({
      where: { id: parseInt(ambulance_id) }
    });

    if (!ambulance) {
      throw { status: 404, message: 'Selected ambulance not found' };
    }

    // Auto-calculate fare based on vehicle tariff
    const estKm = parseFloat(total_km) || 10;
    const baseFare = parseFloat(ambulance.base_charge) || 1000;
    const perKm = parseFloat(ambulance.per_km_rate) || 50;
    const totalFare = baseFare + (estKm * perKm);

    // Generate Trip Number
    const count = await prisma.ambulance_trips.count();
    const tripNumber = `TRIP-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

    // Create trip and update ambulance status in a transaction
    const [trip, updatedAmbulance] = await prisma.$transaction([
      prisma.ambulance_trips.create({
        data: {
          trip_number: tripNumber,
          ambulance_id: ambulance.id,
          patient_id: patient_id ? parseInt(patient_id) : null,
          caller_name,
          caller_phone,
          pickup_location,
          drop_location,
          urgency,
          trip_status: 'Dispatched',
          start_time: new Date(),
          total_km: estKm,
          total_fare: totalFare,
          payment_status: 'Unpaid',
          remarks: remarks || 'Emergency dispatch initiated'
        },
        include: {
          ambulances: true,
          patients: true
        }
      }),
      prisma.ambulances.update({
        where: { id: ambulance.id },
        data: {
          status: 'Dispatched___On_Trip',
          current_location: `En Route to ${pickup_location}`
        }
      })
    ]);

    // Send SMS alert to caller
    try {
      await notificationService.sendNotification({
        recipient_name: caller_name,
        recipient_phone: caller_phone,
        event_type: 'Emergency_Alert',
        channel: 'SMS',
        message: `CareSync Emergency: Ambulance (${ambulance.vehicle_model} - ${ambulance.vehicle_number}) dispatched. Driver: ${ambulance.driver_name} (${ambulance.driver_phone}). EMT on board: ${ambulance.paramedic_name || 'Emergency Paramedic'}. ETA 10-15m.`
      });
    } catch (smsErr) {
      console.warn('Ambulance SMS dispatch notification warning:', smsErr.message);
    }

    return trip;
  }

  async updateTripStatus(id, data) {
    const tripId = parseInt(id);
    const existing = await prisma.ambulance_trips.findUnique({
      where: { id: tripId },
      include: { ambulances: true }
    });

    if (!existing) {
      throw { status: 404, message: 'Ambulance trip record not found' };
    }

    const {
      trip_status,
      total_km,
      payment_status,
      drop_location,
      remarks
    } = data;

    const updateData = {};
    if (trip_status) updateData.trip_status = trip_status;
    if (payment_status) updateData.payment_status = payment_status;
    if (drop_location) updateData.drop_location = drop_location;
    if (remarks !== undefined) updateData.remarks = remarks;

    // Fare calculation if km changed
    if (total_km !== undefined) {
      const km = parseFloat(total_km) || 0;
      updateData.total_km = km;
      const baseFare = parseFloat(existing.ambulances.base_charge) || 1000;
      const perKm = parseFloat(existing.ambulances.per_km_rate) || 50;
      updateData.total_fare = baseFare + (km * perKm);
    }

    let isCompletedOrCancelled = false;
    let ambulanceStatusUpdate = null;

    if (trip_status === 'Reached_Patient_Scene') {
      ambulanceStatusUpdate = {
        status: 'At_Patient_Scene',
        current_location: existing.pickup_location
      };
    } else if (trip_status === 'In_Transit_to_Hospital') {
      ambulanceStatusUpdate = {
        status: 'Dispatched___On_Trip',
        current_location: `In Transit to ${drop_location || existing.drop_location}`
      };
    } else if (trip_status === 'Completed') {
      isCompletedOrCancelled = true;
      updateData.end_time = new Date();
      ambulanceStatusUpdate = {
        status: 'Available',
        current_location: 'CareSync Hospital Emergency Bay'
      };
    } else if (trip_status === 'Cancelled') {
      isCompletedOrCancelled = true;
      updateData.end_time = new Date();
      ambulanceStatusUpdate = {
        status: 'Available',
        current_location: 'CareSync Hospital Emergency Bay'
      };
    }

    const operations = [
      prisma.ambulance_trips.update({
        where: { id: tripId },
        data: updateData,
        include: {
          ambulances: true,
          patients: true
        }
      })
    ];

    if (ambulanceStatusUpdate) {
      operations.push(
        prisma.ambulances.update({
          where: { id: existing.ambulance_id },
          data: ambulanceStatusUpdate
        })
      );
    }

    const [updatedTrip] = await prisma.$transaction(operations);

    // If completed and caller has phone, send completion SMS
    if (trip_status === 'Completed') {
      try {
        await notificationService.sendNotification({
          recipient_name: updatedTrip.caller_name,
          recipient_phone: updatedTrip.caller_phone,
          event_type: 'Emergency_Alert',
          channel: 'SMS',
          message: `CareSync Emergency: Trip ${updatedTrip.trip_number} successfully completed. Patient arrived safely at ER Bay. Total Fare: ৳${updatedTrip.total_fare}.`
        });
      } catch (smsErr) {
        console.warn('Ambulance SMS completion notification warning:', smsErr.message);
      }
    }

    return updatedTrip;
  }

  async getStats() {
    const [
      totalAmbulances,
      availableAmbulances,
      dispatchedAmbulances,
      maintenanceAmbulances,
      activeTrips,
      totalTrips
    ] = await Promise.all([
      prisma.ambulances.count(),
      prisma.ambulances.count({ where: { status: 'Available' } }),
      prisma.ambulances.count({ where: { status: { in: ['Dispatched___On_Trip', 'At_Patient_Scene', 'Returning_to_Base'] } } }),
      prisma.ambulances.count({ where: { status: 'Maintenance' } }),
      prisma.ambulance_trips.count({
        where: { trip_status: { in: ['Dispatched', 'Reached_Patient_Scene', 'In_Transit_to_Hospital'] } }
      }),
      prisma.ambulance_trips.count()
    ]);

    return {
      totalAmbulances,
      availableAmbulances,
      dispatchedAmbulances,
      maintenanceAmbulances,
      activeTrips,
      totalTrips
    };
  }
}

module.exports = new AmbulanceService();
