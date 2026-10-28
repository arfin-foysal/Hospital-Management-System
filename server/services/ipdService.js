const prisma = require('../config/prisma');

class IPDService {
  async getBeds({ ward_type, status }) {
    const where = {};

    const wardMap = {
      'General Male': 'General_Male',
      'General Female': 'General_Female',
      'ICU': 'ICU',
      'CCU': 'CCU',
      'Cabin': 'Cabin',
      'VIP Cabin': 'VIP_Cabin',
      'Pediatric': 'Pediatric'
    };

    if (ward_type) {
      where.ward_type = wardMap[ward_type] || ward_type;
    }

    if (status) {
      where.status = status;
    }

    const beds = await prisma.wards_and_beds.findMany({
      where,
      include: {
        admissions: {
          where: { status: 'Admitted' },
          include: {
            patients: true,
            doctors: true
          }
        }
      },
      orderBy: [{ ward_type: 'asc' }, { bed_number: 'asc' }]
    });

    const wardReverseMap = {
      'General_Male': 'General Male',
      'General_Female': 'General Female',
      'ICU': 'ICU',
      'CCU': 'CCU',
      'Cabin': 'Cabin',
      'VIP_Cabin': 'VIP Cabin',
      'Pediatric': 'Pediatric'
    };

    const formatted = beds.map(b => {
      const activeAdm = b.admissions[0];
      return {
        id: b.id,
        bed_number: b.bed_number,
        ward_type: wardReverseMap[b.ward_type] || b.ward_type,
        floor: b.floor,
        daily_charge: b.daily_charge,
        status: b.status,
        description: b.description,
        active_admission_id: activeAdm?.id || null,
        admission_number: activeAdm?.admission_number || null,
        admission_date: activeAdm?.admission_date ? activeAdm.admission_date.toISOString().slice(0, 10) : null,
        initial_diagnosis: activeAdm?.initial_diagnosis || null,
        patient_id: activeAdm?.patient_id || null,
        patient_name: activeAdm?.patients?.name || null,
        patient_code: activeAdm?.patients?.patient_id || null,
        patient_gender: activeAdm?.patients?.gender || null,
        patient_age: activeAdm?.patients?.age || null,
        doctor_name: activeAdm?.doctors?.name || null
      };
    });

    const stats = {
      total: formatted.length,
      available: formatted.filter(b => b.status === 'Available').length,
      occupied: formatted.filter(b => b.status === 'Occupied').length,
      maintenance: formatted.filter(b => b.status === 'Maintenance' || b.status === 'Cleaning').length
    };

    return { stats, data: formatted };
  }

  async updateBedStatus(id, { status, description }) {
    return await prisma.wards_and_beds.update({
      where: { id: parseInt(id) },
      data: {
        status,
        description: description !== undefined ? description : undefined
      }
    });
  }

  async getAdmissions({ status, patient_id }) {
    const where = {};
    if (status) where.status = status;
    if (patient_id) where.patient_id = parseInt(patient_id);

    const admissions = await prisma.admissions.findMany({
      where,
      include: {
        patients: true,
        wards_and_beds: true,
        doctors: true
      },
      orderBy: { admission_date: 'desc' }
    });

    const wardReverseMap = {
      'General_Male': 'General Male',
      'General_Female': 'General Female',
      'ICU': 'ICU',
      'CCU': 'CCU',
      'Cabin': 'Cabin',
      'VIP_Cabin': 'VIP Cabin',
      'Pediatric': 'Pediatric'
    };

    return admissions.map(adm => ({
      ...adm,
      admission_date: adm.admission_date.toISOString().slice(0, 10),
      discharge_date: adm.discharge_date ? adm.discharge_date.toISOString().slice(0, 10) : null,
      patient_name: adm.patients.name,
      patient_code: adm.patients.patient_id,
      patient_phone: adm.patients.phone,
      blood_group: adm.patients.blood_group,
      age: adm.patients.age,
      gender: adm.patients.gender,
      bed_number: adm.wards_and_beds.bed_number,
      ward_type: wardReverseMap[adm.wards_and_beds.ward_type] || adm.wards_and_beds.ward_type,
      floor: adm.wards_and_beds.floor,
      daily_charge: adm.wards_and_beds.daily_charge,
      doctor_name: adm.doctors.name,
      doctor_department: adm.doctors.department
    }));
  }

  async admitPatient(data) {
    const { patient_id, bed_id, doctor_id, admission_reason, initial_diagnosis } = data;

    if (!patient_id || !bed_id || !doctor_id || !admission_reason) {
      throw { status: 400, message: 'Patient, Bed, Doctor, and Admission Reason are required.' };
    }

    const bed = await prisma.wards_and_beds.findUnique({
      where: { id: parseInt(bed_id) }
    });

    if (!bed) {
      throw { status: 404, message: 'Bed not found' };
    }

    if (bed.status !== 'Available') {
      throw { status: 400, message: `Bed is currently ${bed.status}. Please select an Available bed.` };
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const admissionNumber = `ADM-${year}-${rand}`;

    return await prisma.$transaction(async (tx) => {
      const admission = await tx.admissions.create({
        data: {
          admission_number: admissionNumber,
          patient_id: parseInt(patient_id),
          bed_id: parseInt(bed_id),
          doctor_id: parseInt(doctor_id),
          admission_reason,
          initial_diagnosis: initial_diagnosis || null,
          status: 'Admitted'
        }
      });

      await tx.wards_and_beds.update({
        where: { id: parseInt(bed_id) },
        data: { status: 'Occupied' }
      });

      return { admissionId: admission.id, admissionNumber };
    });
  }

  async dischargePatient(id, { discharge_summary, discharge_condition = 'Stable / Recovered' }) {
    const admission = await prisma.admissions.findUnique({
      where: { id: parseInt(id) },
      include: { wards_and_beds: true }
    });

    if (!admission) {
      throw { status: 404, message: 'Admission record not found' };
    }

    if (admission.status === 'Discharged') {
      throw { status: 400, message: 'Patient is already discharged' };
    }

    const now = new Date();
    const diffTime = Math.abs(now - new Date(admission.admission_date));
    const daysStayed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalBedCharges = daysStayed * parseFloat(admission.wards_and_beds.daily_charge);

    await prisma.$transaction(async (tx) => {
      await tx.admissions.update({
        where: { id: parseInt(id) },
        data: {
          status: 'Discharged',
          discharge_date: now,
          discharge_summary: discharge_summary || 'Discharged in stable condition. Advised follow-up.',
          discharge_condition
        }
      });

      await tx.wards_and_beds.update({
        where: { id: admission.bed_id },
        data: { status: 'Available' }
      });
    });

    return {
      daysStayed,
      dailyRate: admission.wards_and_beds.daily_charge,
      totalBedCharges
    };
  }
}

module.exports = new IPDService();

