const prisma = require('../config/prisma');

class EmergencyService {
  async getEmergencyCases({ status, triage_level, search }) {
    const where = {};
    if (status) where.status = status;
    if (triage_level) where.triage_level = triage_level;
    if (search) {
      where.OR = [
        { case_number: { contains: search } },
        { patient_name: { contains: search } },
        { phone: { contains: search } }
      ];
    }

    const cases = await prisma.emergency_cases.findMany({
      where,
      include: {
        patients: true,
        doctors: true
      },
      orderBy: [{ arrived_at: 'desc' }]
    });

    return cases.map(c => ({
      ...c,
      arrived_at: c.arrived_at.toISOString(),
      doctor_name: c.doctors?.name || null,
      patient_code: c.patients?.patient_id || null
    }));
  }

  async getEmergencyCaseById(id) {
    const c = await prisma.emergency_cases.findUnique({
      where: { id: parseInt(id) },
      include: {
        patients: true,
        doctors: true
      }
    });
    if (!c) throw { status: 404, message: 'Emergency case not found' };
    return {
      ...c,
      arrived_at: c.arrived_at.toISOString(),
      doctor_name: c.doctors?.name || null,
      patient_code: c.patients?.patient_id || null
    };
  }

  async createEmergencyCase(data) {
    const {
      patient_id,
      patient_name,
      age,
      gender,
      phone,
      emergency_contact,
      triage_level = 'Yellow',
      arrival_mode = 'Walk-in',
      gcs_score = 15,
      spo2 = 98,
      bp = '120/80',
      pulse = '76',
      temperature = '98.6',
      condition_summary,
      initial_treatment,
      assigned_doctor_id,
      assigned_bed = 'ER-Trolley 01'
    } = data;

    if (!patient_name || !condition_summary) {
      throw { status: 400, message: 'Patient Name and Condition Summary are required.' };
    }

    const year = new Date().getFullYear();
    const count = await prisma.emergency_cases.count();
    const caseNumber = `EMG-${year}-${String(count + 1).padStart(3, '0')}`;

    return await prisma.emergency_cases.create({
      data: {
        case_number: caseNumber,
        patient_id: patient_id ? parseInt(patient_id) : null,
        patient_name,
        age: parseInt(age) || 30,
        gender: gender || 'Male',
        phone,
        emergency_contact,
        triage_level,
        arrival_mode,
        gcs_score: parseInt(gcs_score) || 15,
        spo2: parseInt(spo2) || 98,
        bp,
        pulse,
        temperature,
        condition_summary,
        initial_treatment,
        assigned_doctor_id: assigned_doctor_id ? parseInt(assigned_doctor_id) : null,
        assigned_bed,
        status: 'Triaged'
      }
    });
  }

  async updateTriageStatus(id, updateData) {
    const { status, initial_treatment, assigned_bed, assigned_doctor_id, gcs_score, spo2, bp, pulse, temperature } = updateData;
    const data = {};
    if (status) data.status = status;
    if (initial_treatment !== undefined) data.initial_treatment = initial_treatment;
    if (assigned_bed) data.assigned_bed = assigned_bed;
    if (assigned_doctor_id) data.assigned_doctor_id = parseInt(assigned_doctor_id);
    if (gcs_score !== undefined) data.gcs_score = parseInt(gcs_score);
    if (spo2 !== undefined) data.spo2 = parseInt(spo2);
    if (bp) data.bp = bp;
    if (pulse) data.pulse = pulse;
    if (temperature) data.temperature = temperature;

    if (status === 'Discharged') {
      data.discharged_at = new Date();
    }

    return await prisma.emergency_cases.update({
      where: { id: parseInt(id) },
      data
    });
  }

  async transferToIPD(id, { bed_id, doctor_id, admission_reason }) {
    return await prisma.$transaction(async (tx) => {
      const emg = await tx.emergency_cases.findUnique({
        where: { id: parseInt(id) },
        include: { patients: true }
      });
      if (!emg) throw { status: 404, message: 'Emergency case not found' };

      let patientId = emg.patient_id;
      // If walk-in trauma patient was not registered, auto-register as patient
      if (!patientId) {
        const year = new Date().getFullYear();
        const rand = Math.floor(1000 + Math.random() * 9000);
        const pCode = `PAT-${year}-${rand}`;
        const newPt = await tx.patients.create({
          data: {
            patient_id: pCode,
            name: emg.patient_name,
            age: emg.age,
            gender: emg.gender,
            phone: emg.phone || '+880 1700 000000',
            emergency_contact: emg.emergency_contact || 'ER Casualty Contact',
            blood_group: 'O_POS',
            medical_history: `Emergency Transfer: ${emg.condition_summary}`
          }
        });
        patientId = newPt.id;
      }

      // Check bed
      const bed = await tx.wards_and_beds.findUnique({ where: { id: parseInt(bed_id) } });
      if (!bed || bed.status !== 'Available') {
        throw { status: 400, message: 'Selected bed is not available' };
      }

      // Create admission
      const count = await tx.admissions.count();
      const admNumber = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;
      const admission = await tx.admissions.create({
        data: {
          admission_number: admNumber,
          patient_id: patientId,
          bed_id: parseInt(bed_id),
          doctor_id: parseInt(doctor_id),
          admission_reason: admission_reason || `Trauma ER Admission: ${emg.condition_summary}`,
          initial_diagnosis: emg.condition_summary,
          status: 'Admitted'
        }
      });

      // Update bed status to Occupied
      await tx.wards_and_beds.update({
        where: { id: parseInt(bed_id) },
        data: { status: 'Occupied' }
      });

      // Update emergency case status
      await tx.emergency_cases.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Transferred_to_IPD',
          discharged_at: new Date(),
          patient_id: patientId
        }
      });

      return { admission, emgCaseId: emg.id };
    });
  }
}

module.exports = new EmergencyService();

