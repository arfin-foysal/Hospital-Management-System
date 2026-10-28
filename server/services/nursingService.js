const prisma = require('../config/prisma');

class NursingService {
  async getActiveInpatients() {
    const admissions = await prisma.admissions.findMany({
      where: { status: 'Admitted' },
      include: {
        patients: true,
        doctors: true,
        wards_and_beds: true,
        bedside_vitals: {
          orderBy: { recorded_at: 'desc' },
          take: 1
        }
      },
      orderBy: { admission_date: 'desc' }
    });

    return admissions.map(a => ({
      ...a,
      admission_date: a.admission_date.toISOString().slice(0, 10),
      patient_name: a.patients.name,
      patient_code: a.patients.patient_id,
      patient_age: a.patients.age,
      patient_gender: a.patients.gender,
      blood_group: a.patients.blood_group,
      allergies: a.patients.allergies,
      doctor_name: a.doctors.name,
      department: a.doctors.department,
      bed_number: a.wards_and_beds.bed_number,
      ward_type: a.wards_and_beds.ward_type,
      latest_vitals: a.bedside_vitals[0] || null
    }));
  }

  async getBedsideVitals(admission_id) {
    const vitals = await prisma.bedside_vitals.findMany({
      where: { admission_id: parseInt(admission_id) },
      orderBy: [{ recorded_at: 'desc' }]
    });
    return vitals.map(v => ({
      ...v,
      recorded_at: v.recorded_at.toISOString()
    }));
  }

  async recordBedsideVitals(data) {
    const {
      admission_id,
      recorded_by_nurse,
      bp = '120/80',
      pulse = '76',
      temperature = '98.6',
      spo2 = 98,
      respiratory_rate = 18,
      blood_sugar_fbs,
      urine_output_ml,
      fluid_intake_ml,
      nurse_assessment_notes
    } = data;

    if (!admission_id || !recorded_by_nurse) {
      throw { status: 400, message: 'Admission ID and Nurse Name are required.' };
    }

    return await prisma.bedside_vitals.create({
      data: {
        admission_id: parseInt(admission_id),
        recorded_by_nurse,
        bp,
        pulse,
        temperature,
        spo2: parseInt(spo2) || 98,
        respiratory_rate: parseInt(respiratory_rate) || 18,
        blood_sugar_fbs,
        urine_output_ml: urine_output_ml ? parseInt(urine_output_ml) : null,
        fluid_intake_ml: fluid_intake_ml ? parseInt(fluid_intake_ml) : null,
        nurse_assessment_notes
      }
    });
  }

  async getEMAR(admission_id) {
    return await prisma.emar_medications.findMany({
      where: { admission_id: parseInt(admission_id) },
      orderBy: [{ scheduled_time: 'asc' }]
    });
  }

  async scheduleMedication(data) {
    const { admission_id, medicine_name, dosage, route = 'Oral', scheduled_time, notes } = data;
    if (!admission_id || !medicine_name || !scheduled_time) {
      throw { status: 400, message: 'Admission, Medicine name, and Scheduled time are required.' };
    }

    return await prisma.emar_medications.create({
      data: {
        admission_id: parseInt(admission_id),
        medicine_name,
        dosage: dosage || '1 tablet',
        route: route || 'Oral',
        scheduled_time,
        status: 'Scheduled',
        notes
      }
    });
  }

  async administerMedication(id, { nurse_name, notes }) {
    return await prisma.emar_medications.update({
      where: { id: parseInt(id) },
      data: {
        status: 'Administered',
        administered_at: new Date(),
        nurse_name: nurse_name || 'Staff Nurse',
        notes: notes || 'Medication administered as scheduled'
      }
    });
  }
}

module.exports = new NursingService();

