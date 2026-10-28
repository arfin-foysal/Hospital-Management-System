const prisma = require('../config/prisma');

class EMRService {
  async getPrescriptions({ patient_id, doctor_id, date }, user) {
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
      where.consultation_date = new Date(date);
    }

    const prescriptions = await prisma.prescriptions.findMany({
      where,
      include: {
        patients: true,
        doctors: true,
        prescription_items: true
      },
      orderBy: [{ consultation_date: 'desc' }, { id: 'desc' }]
    });

    return prescriptions.map(rx => ({
      ...rx,
      consultation_date: rx.consultation_date.toISOString().slice(0, 10),
      patient_name: rx.patients.name,
      patient_code: rx.patients.patient_id,
      patient_phone: rx.patients.phone,
      patient_age: rx.patients.age,
      patient_gender: rx.patients.gender,
      blood_group: rx.patients.blood_group,
      doctor_name: rx.doctors.name,
      doctor_department: rx.doctors.department,
      doctor_specialization: rx.doctors.specialization,
      doctor_qualification: rx.doctors.qualification,
      items: rx.prescription_items
    }));
  }

  async getPrescriptionById(id) {
    const rx = await prisma.prescriptions.findUnique({
      where: { id: parseInt(id) },
      include: {
        patients: true,
        doctors: true,
        prescription_items: true,
        lab_requests: {
          include: { lab_tests_catalog: true }
        }
      }
    });

    if (!rx) {
      throw { status: 404, message: 'Prescription not found' };
    }

    return {
      ...rx,
      consultation_date: rx.consultation_date.toISOString().slice(0, 10),
      patient_name: rx.patients.name,
      patient_code: rx.patients.patient_id,
      patient_phone: rx.patients.phone,
      patient_age: rx.patients.age,
      patient_gender: rx.patients.gender,
      blood_group: rx.patients.blood_group,
      allergies: rx.patients.allergies,
      doctor_name: rx.doctors.name,
      doctor_department: rx.doctors.department,
      doctor_specialization: rx.doctors.specialization,
      doctor_qualification: rx.doctors.qualification,
      room_no: rx.doctors.room_no,
      items: rx.prescription_items,
      labOrders: rx.lab_requests.map(lr => ({
        ...lr,
        test_name: lr.lab_tests_catalog.test_name,
        category: lr.lab_tests_catalog.category,
        standard_charge: lr.lab_tests_catalog.standard_charge
      }))
    };
  }

  async createPrescription(data) {
    const {
      patient_id,
      doctor_id,
      appointment_id,
      consultation_date = new Date().toISOString().slice(0, 10),
      symptoms,
      diagnosis,
      bp = '120/80 mmHg',
      pulse = '72 bpm',
      temperature = '98.6 °F',
      weight = '65 kg',
      lifestyle_advice,
      follow_up_date,
      medicines = [],
      lab_test_ids = []
    } = data;

    if (!patient_id || !doctor_id || !diagnosis || !symptoms) {
      throw { status: 400, message: 'Patient, Doctor, Symptoms, and Diagnosis are required.' };
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const rxNumber = `RX-${year}-${rand}`;

    return await prisma.$transaction(async (tx) => {
      const rx = await tx.prescriptions.create({
        data: {
          prescription_number: rxNumber,
          patient_id: parseInt(patient_id),
          doctor_id: parseInt(doctor_id),
          appointment_id: appointment_id ? parseInt(appointment_id) : null,
          consultation_date: new Date(consultation_date),
          symptoms,
          diagnosis,
          bp,
          pulse,
          temperature,
          weight,
          lifestyle_advice: lifestyle_advice || null,
          follow_up_date: follow_up_date ? new Date(follow_up_date) : null,
          prescription_items: {
            create: medicines.filter(m => m.medicine_name).map(m => ({
              medicine_name: m.medicine_name,
              dosage: m.dosage || '1 tablet',
              frequency: m.frequency || '1-0-1',
              duration: m.duration || '7 days',
              instructions: m.instructions || 'After meal'
            }))
          }
        }
      });

      // Direct lab requisitions linking
      if (Array.isArray(lab_test_ids) && lab_test_ids.length > 0) {
        for (const testId of lab_test_ids) {
          const randReq = Math.floor(1000 + Math.random() * 9000);
          const reqNumber = `REQ-${year}-${randReq}`;
          await tx.lab_requests.create({
            data: {
              requisition_number: reqNumber,
              patient_id: parseInt(patient_id),
              doctor_id: parseInt(doctor_id),
              prescription_id: rx.id,
              test_id: parseInt(testId),
              priority: 'Normal',
              status: 'Pending',
              test_date: new Date(consultation_date)
            }
          });
        }
      }

      // Mark linked appointment completed
      if (appointment_id) {
        await tx.appointments.update({
          where: { id: parseInt(appointment_id) },
          data: { status: 'Completed' }
        });
      }

      return { prescriptionId: rx.id, prescriptionNumber: rxNumber };
    });
  }
}

module.exports = new EMRService();

