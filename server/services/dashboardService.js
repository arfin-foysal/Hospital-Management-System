const prisma = require('../config/prisma');

class DashboardService {
  async getDashboardSummary() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);

    const [
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
      totalBeds,
      availableBeds,
      occupiedBeds,
      activeAdmissions,
      lowStockMedicinesAll,
      pendingLabTests,
      invoicesAggregate,
      todayRevenueAggregate,
      recentAppointments,
      recentAdmissions
    ] = await Promise.all([
      prisma.patients.count(),
      prisma.doctors.count(),
      prisma.appointments.count({ where: { appointment_date: today } }),
      prisma.appointments.count({ where: { appointment_date: today, status: { in: ['Scheduled', 'In_Queue'] } } }),
      prisma.wards_and_beds.count(),
      prisma.wards_and_beds.count({ where: { status: 'Available' } }),
      prisma.wards_and_beds.count({ where: { status: 'Occupied' } }),
      prisma.admissions.count({ where: { status: 'Admitted' } }),
      prisma.medicines.findMany({
        where: {},
        select: {
          id: true,
          name: true,
          generic_name: true,
          stock_quantity: true,
          reorder_level: true,
          unit_price: true,
          expiry_date: true
        }
      }),
      prisma.lab_requests.count({ where: { status: { in: ['Pending', 'Sample_Collected'] } } }),
      prisma.invoices.aggregate({
        _sum: {
          paid_amount: true,
          due_amount: true
        }
      }),
      prisma.invoices.aggregate({
        where: { billing_date: today },
        _sum: { paid_amount: true }
      }),
      prisma.appointments.findMany({
        take: 5,
        orderBy: { id: 'desc' },
        include: {
          patients: { select: { name: true, patient_id: true } },
          doctors: { select: { name: true, department: true } }
        }
      }),
      prisma.admissions.findMany({
        where: { status: 'Admitted' },
        take: 5,
        orderBy: { admission_date: 'desc' },
        include: {
          patients: { select: { name: true, patient_id: true } },
          wards_and_beds: { select: { bed_number: true, ward_type: true } },
          doctors: { select: { name: true } }
        }
      })
    ]);

    const lowStockMedicines = lowStockMedicinesAll
      .filter(m => m.stock_quantity <= m.reorder_level)
      .slice(0, 5)
      .map(m => ({
        ...m,
        expiry_date: m.expiry_date.toISOString().slice(0, 10)
      }));

    const lowStockCount = lowStockMedicinesAll.filter(m => m.stock_quantity <= m.reorder_level).length;

    const wardReverseMap = {
      'General_Male': 'General Male',
      'General_Female': 'General Female',
      'ICU': 'ICU',
      'CCU': 'CCU',
      'Cabin': 'Cabin',
      'VIP_Cabin': 'VIP Cabin',
      'Pediatric': 'Pediatric'
    };

    return {
      totalPatients,
      totalDoctors,
      todayAppointments,
      pendingAppointments,
      totalBeds,
      availableBeds,
      occupiedBeds,
      activeAdmissions,
      lowStockCount,
      pendingLabTests,
      totalRevenue: parseFloat(invoicesAggregate._sum.paid_amount || 0),
      totalReceivable: parseFloat(invoicesAggregate._sum.due_amount || 0),
      todayRevenue: parseFloat(todayRevenueAggregate._sum.paid_amount || 0),
      recentAppointments: recentAppointments.map(a => ({
        ...a,
        appointment_date: a.appointment_date.toISOString().slice(0, 10),
        patient_name: a.patients.name,
        patient_code: a.patients.patient_id,
        doctor_name: a.doctors.name,
        department: a.doctors.department
      })),
      lowStockMedicines,
      recentAdmissions: recentAdmissions.map(adm => ({
        ...adm,
        admission_date: adm.admission_date.toISOString().slice(0, 10),
        patient_name: adm.patients.name,
        patient_code: adm.patients.patient_id,
        bed_number: adm.wards_and_beds.bed_number,
        ward_type: wardReverseMap[adm.wards_and_beds.ward_type] || adm.wards_and_beds.ward_type,
        doctor_name: adm.doctors.name
      }))
    };
  }
}

module.exports = new DashboardService();

