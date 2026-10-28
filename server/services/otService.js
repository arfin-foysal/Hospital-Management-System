const prisma = require('../config/prisma');

class OTService {
  async getTheatres() {
    return await prisma.operation_theatres.findMany({
      orderBy: [{ ot_code: 'asc' }]
    });
  }

  async getSurgeries({ date, status, surgeon_id }) {
    const where = {};
    if (status) where.status = status;
    if (date) where.surgery_date = new Date(date);
    if (surgeon_id) where.lead_surgeon_id = parseInt(surgeon_id);

    const list = await prisma.surgeries.findMany({
      where,
      include: {
        patients: true,
        doctors: true,
        operation_theatres: true
      },
      orderBy: [{ surgery_date: 'asc' }, { scheduled_start_time: 'asc' }]
    });

    return list.map(s => ({
      ...s,
      surgery_date: s.surgery_date.toISOString().slice(0, 10),
      patient_name: s.patients.name,
      patient_code: s.patients.patient_id,
      patient_gender: s.patients.gender,
      patient_age: s.patients.age,
      lead_surgeon_name: s.doctors.name,
      department: s.doctors.department,
      ot_name: s.operation_theatres.name,
      ot_code: s.operation_theatres.ot_code
    }));
  }

  async bookSurgery(data) {
    const {
      patient_id,
      ot_id,
      lead_surgeon_id,
      anesthetist_name,
      assistant_surgeons,
      surgery_name,
      surgery_date,
      scheduled_start_time = '09:00 AM',
      estimated_duration_hours = 2.0,
      anesthesia_type = 'General_Anesthesia',
      pre_op_checklist_verified = false,
      surgical_notes
    } = data;

    if (!patient_id || !ot_id || !lead_surgeon_id || !surgery_name || !surgery_date) {
      throw { status: 400, message: 'Patient, OT, Surgeon, Surgery Name, and Date are required.' };
    }

    const count = await prisma.surgeries.count();
    const surgNumber = `SURG-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    return await prisma.surgeries.create({
      data: {
        surgery_number: surgNumber,
        patient_id: parseInt(patient_id),
        ot_id: parseInt(ot_id),
        lead_surgeon_id: parseInt(lead_surgeon_id),
        anesthetist_name,
        assistant_surgeons,
        surgery_name,
        surgery_date: new Date(surgery_date),
        scheduled_start_time,
        estimated_duration_hours: parseFloat(estimated_duration_hours) || 2.0,
        anesthesia_type: anesthesia_type.replace(/ /g, '_'),
        pre_op_checklist_verified: Boolean(pre_op_checklist_verified),
        surgical_notes,
        status: 'Scheduled'
      }
    });
  }

  async updateSurgeryStatus(id, { status, surgical_notes, post_op_care_instructions }) {
    const data = {};
    if (status) data.status = status;
    if (surgical_notes !== undefined) data.surgical_notes = surgical_notes;
    if (post_op_care_instructions !== undefined) data.post_op_care_instructions = post_op_care_instructions;

    return await prisma.surgeries.update({
      where: { id: parseInt(id) },
      data
    });
  }
}

module.exports = new OTService();

