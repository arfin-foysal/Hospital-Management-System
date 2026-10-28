const prisma = require('../config/prisma');
const notificationService = require('./notificationService');

class TelemedicineService {
  async getSessions({ doctor_id, patient_id, status } = {}) {
    const where = {};
    if (doctor_id) where.doctor_id = parseInt(doctor_id);
    if (patient_id) where.patient_id = parseInt(patient_id);
    if (status) where.status = status;

    return await prisma.telemedicine_sessions.findMany({
      where,
      include: {
        patients: {
          select: {
            id: true,
            patient_id: true,
            name: true,
            phone: true,
            blood_group: true,
            allergies: true
          }
        },
        doctors: {
          select: {
            id: true,
            name: true,
            department: true,
            specialization: true,
            room_no: true
          }
        }
      },
      orderBy: { scheduled_at: 'desc' }
    });
  }

  async getSessionById(id) {
    const session = await prisma.telemedicine_sessions.findUnique({
      where: { id: parseInt(id) },
      include: {
        patients: true,
        doctors: true
      }
    });

    if (!session) {
      throw { status: 404, message: 'Telemedicine consultation session not found' };
    }
    return session;
  }

  async createSession(data) {
    const {
      patient_id,
      doctor_id,
      scheduled_at,
      chief_complaint,
      consultation_fee = 800.00
    } = data;

    if (!patient_id || !doctor_id || !scheduled_at || !chief_complaint) {
      throw { status: 400, message: 'Patient, Doctor, Scheduled Time, and Chief Complaint are required' };
    }

    const patient = await prisma.patients.findUnique({ where: { id: parseInt(patient_id) } });
    if (!patient) throw { status: 404, message: 'Patient not found' };

    const doctor = await prisma.doctors.findUnique({ where: { id: parseInt(doctor_id) } });
    if (!doctor) throw { status: 404, message: 'Doctor not found' };

    const count = await prisma.telemedicine_sessions.count();
    const sessionCode = `TELE-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
    const roomUrl = `https://meet.caresync.internal/room/${sessionCode.toLowerCase()}`;

    const session = await prisma.telemedicine_sessions.create({
      data: {
        session_code: sessionCode,
        patient_id: parseInt(patient_id),
        doctor_id: parseInt(doctor_id),
        scheduled_at: new Date(scheduled_at),
        status: 'Scheduled',
        room_url: roomUrl,
        chief_complaint,
        consultation_fee: parseFloat(consultation_fee) || 800.00,
        payment_status: 'Paid',
        call_duration_seconds: 0
      },
      include: {
        patients: true,
        doctors: true
      }
    });

    // Send SMS with video call room link
    try {
      if (patient.phone) {
        await notificationService.sendNotification({
          recipient_name: patient.name,
          recipient_phone: patient.phone,
          event_type: 'Emergency_Alert',
          channel: 'SMS',
          message: `CareSync Telemedicine: Your video appointment (${sessionCode}) with Dr. ${doctor.name} is scheduled for ${new Date(scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Join room: ${roomUrl}`
        });
      }
    } catch (e) {
      console.warn('Telemedicine SMS notice warning:', e.message);
    }

    return session;
  }

  async updateSessionStatus(id, data) {
    const sessionId = parseInt(id);
    const existing = await prisma.telemedicine_sessions.findUnique({ where: { id: sessionId } });
    if (!existing) throw { status: 404, message: 'Telemedicine session not found' };

    const { status, call_duration_seconds, diagnosis, doctor_notes } = data;
    const updateData = {};
    if (status) updateData.status = status;
    if (call_duration_seconds !== undefined) updateData.call_duration_seconds = parseInt(call_duration_seconds);
    if (diagnosis !== undefined) updateData.diagnosis = diagnosis;
    if (doctor_notes !== undefined) updateData.doctor_notes = doctor_notes;

    return await prisma.telemedicine_sessions.update({
      where: { id: sessionId },
      data: updateData,
      include: {
        patients: true,
        doctors: true
      }
    });
  }

  async getStats() {
    const [total, inLobby, inCall, completed] = await Promise.all([
      prisma.telemedicine_sessions.count(),
      prisma.telemedicine_sessions.count({ where: { status: 'In_Lobby' } }),
      prisma.telemedicine_sessions.count({ where: { status: 'In_Call' } }),
      prisma.telemedicine_sessions.count({ where: { status: 'Completed' } })
    ]);

    return { total, inLobby, inCall, completed };
  }
}

module.exports = new TelemedicineService();
