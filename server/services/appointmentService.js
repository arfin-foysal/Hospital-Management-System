const prisma = require('../config/prisma');

class AppointmentService {
  async getAppointments({ doctor_id, patient_id, date, status }, user) {
    const where = {};

    if (user?.role === 'doctor' && user.doctor_id) {
      where.doctor_id = user.doctor_id;
    } else if (doctor_id) {
      where.doctor_id = parseInt(doctor_id);
    }

    if (user?.role === 'patient' && user.patient_id) {
      where.patient_id = user.patient_id;
    } else if (patient_id) {
      where.patient_id = parseInt(patient_id);
    }

    if (date) {
      where.appointment_date = new Date(date);
    }

    if (status) {
      const statusMap = {
        'Scheduled': 'Scheduled',
        'In-Queue': 'In_Queue',
        'In-Consultation': 'In_Consultation',
        'Completed': 'Completed',
        'Cancelled': 'Cancelled'
      };
      where.status = statusMap[status] || status;
    }

    const appointments = await prisma.appointments.findMany({
      where,
      include: {
        patients: { select: { name: true, patient_id: true, phone: true, gender: true, age: true } },
        doctors: { select: { name: true, department: true, room_no: true, consultation_fee: true } }
      },
      orderBy: [{ appointment_date: 'desc' }, { token_number: 'asc' }]
    });

    const statusDisplayMap = {
      'Scheduled': 'Scheduled',
      'In_Queue': 'In-Queue',
      'In_Consultation': 'In-Consultation',
      'Completed': 'Completed',
      'Cancelled': 'Cancelled'
    };

    return appointments.map(a => ({
      ...a,
      appointment_date: a.appointment_date.toISOString().slice(0, 10),
      status: statusDisplayMap[a.status] || a.status,
      patient_name: a.patients.name,
      patient_code: a.patients.patient_id,
      patient_phone: a.patients.phone,
      patient_gender: a.patients.gender,
      patient_age: a.patients.age,
      doctor_name: a.doctors.name,
      doctor_department: a.doctors.department,
      doctor_room: a.doctors.room_no,
      consultation_fee: a.doctors.consultation_fee
    }));
  }

  async getLiveOpdQueue({ doctor_id }) {
    const todayStr = new Date().toISOString().slice(0, 10);
    const today = new Date(todayStr);

    const where = {
      appointment_date: today
    };

    if (doctor_id) {
      where.doctor_id = parseInt(doctor_id);
    }

    const queueItems = await prisma.appointments.findMany({
      where,
      include: {
        patients: { select: { name: true, patient_id: true, phone: true, gender: true, age: true } },
        doctors: { select: { name: true, department: true, room_no: true } }
      },
      orderBy: { token_number: 'asc' }
    });

    const statusDisplayMap = {
      'Scheduled': 'Scheduled',
      'In_Queue': 'In-Queue',
      'In_Consultation': 'In-Consultation',
      'Completed': 'Completed',
      'Cancelled': 'Cancelled'
    };

    const formatted = queueItems.map(item => ({
      ...item,
      appointment_date: todayStr,
      status: statusDisplayMap[item.status] || item.status,
      patient_name: item.patients.name,
      patient_code: item.patients.patient_id,
      patient_phone: item.patients.phone,
      patient_gender: item.patients.gender,
      patient_age: item.patients.age,
      doctor_name: item.doctors.name,
      department: item.doctors.department,
      room_no: item.doctors.room_no
    }));

    const summary = {
      total: formatted.length,
      waiting: formatted.filter(q => q.status === 'In-Queue' || q.status === 'Scheduled').length,
      inConsultation: formatted.find(q => q.status === 'In-Consultation') || null,
      completed: formatted.filter(q => q.status === 'Completed').length
    };

    return { date: todayStr, summary, queue: formatted };
  }

  async createAppointment(data) {
    const { patient_id, doctor_id, appointment_date, appointment_time = '10:00 AM', type = 'OPD', symptoms, notes } = data;

    if (!patient_id || !doctor_id || !appointment_date) {
      throw { status: 400, message: 'Patient, Doctor, and Appointment Date are required.' };
    }

    const targetDate = new Date(appointment_date);

    // Calculate max token
    const lastApt = await prisma.appointments.findFirst({
      where: {
        doctor_id: parseInt(doctor_id),
        appointment_date: targetDate
      },
      orderBy: { token_number: 'desc' },
      select: { token_number: true }
    });

    const tokenNumber = (lastApt?.token_number || 0) + 1;
    const dateFormatted = appointment_date.replace(/-/g, '');
    const rand = Math.floor(100 + Math.random() * 900);
    const appointmentNumber = `APT-${dateFormatted}-${tokenNumber}-${rand}`;

    const typeMap = {
      'OPD': 'OPD',
      'Follow-up': 'Follow_up',
      'Emergency': 'Emergency',
      'Routine': 'Routine'
    };

    const newAppointment = await prisma.appointments.create({
      data: {
        appointment_number: appointmentNumber,
        patient_id: parseInt(patient_id),
        doctor_id: parseInt(doctor_id),
        appointment_date: targetDate,
        appointment_time,
        token_number: tokenNumber,
        type: typeMap[type] || 'OPD',
        status: 'Scheduled',
        symptoms: symptoms || null,
        notes: notes || null
      },
      include: {
        patients: { select: { name: true } },
        doctors: { select: { name: true, room_no: true, consultation_fee: true } }
      }
    });

    return {
      ...newAppointment,
      appointment_date,
      patient_name: newAppointment.patients.name,
      doctor_name: newAppointment.doctors.name,
      room_no: newAppointment.doctors.room_no,
      consultation_fee: newAppointment.doctors.consultation_fee
    };
  }

  async updateAppointmentStatus(id, { status, notes }) {
    const statusMap = {
      'Scheduled': 'Scheduled',
      'In-Queue': 'In_Queue',
      'In-Consultation': 'In_Consultation',
      'Completed': 'Completed',
      'Cancelled': 'Cancelled'
    };

    const prismaStatus = statusMap[status];
    if (!prismaStatus) {
      throw { status: 400, message: 'Invalid status value' };
    }

    const updated = await prisma.appointments.update({
      where: { id: parseInt(id) },
      data: {
        status: prismaStatus,
        notes: notes !== undefined ? notes : undefined
      },
      include: {
        patients: { select: { name: true } },
        doctors: { select: { name: true } }
      }
    });

    return {
      ...updated,
      status,
      patient_name: updated.patients.name,
      doctor_name: updated.doctors.name
    };
  }

  async getDoctorsList() {
    return await prisma.doctors.findMany({
      include: {
        users: { select: { email: true } }
      },
      orderBy: [{ department: 'asc' }, { name: 'asc' }]
    });
  }
}

module.exports = new AppointmentService();

