const prisma = require('../config/prisma');

class PatientService {
  async getAllPatients({ search, blood_group, gender, page = 1, limit = 50 }) {
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { phone: { contains: search } },
        { patient_id: { contains: search } },
        { email: { contains: search } }
      ];
    }

    if (blood_group) {
      const bloodMap = {
        'A+': 'A_POS', 'A-': 'A_NEG',
        'B+': 'B_POS', 'B-': 'B_NEG',
        'AB+': 'AB_POS', 'AB-': 'AB_NEG',
        'O+': 'O_POS', 'O-': 'O_NEG'
      };
      where.blood_group = bloodMap[blood_group] || blood_group;
    }

    if (gender) {
      where.gender = gender;
    }

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    const [patients, total] = await Promise.all([
      prisma.patients.findMany({
        where,
        orderBy: { id: 'desc' },
        take,
        skip,
        include: {
          _count: {
            select: {
              appointments: true,
              admissions: { where: { status: 'Admitted' } }
            }
          }
        }
      }),
      prisma.patients.count({ where })
    ]);

    // Format for frontend
    const bloodReverseMap = {
      'A_POS': 'A+', 'A_NEG': 'A-',
      'B_POS': 'B+', 'B_NEG': 'B-',
      'AB_POS': 'AB+', 'AB_NEG': 'AB-',
      'O_POS': 'O+', 'O_NEG': 'O-'
    };

    const formatted = patients.map(p => ({
      ...p,
      blood_group: bloodReverseMap[p.blood_group] || p.blood_group,
      total_appointments: p._count.appointments,
      is_admitted: p._count.admissions
    }));

    return {
      data: formatted,
      total,
      page: parseInt(page),
      limit: take
    };
  }

  async getPatientById(id) {
    const searchId = isNaN(id) ? undefined : parseInt(id);

    const patient = await prisma.patients.findFirst({
      where: {
        OR: [
          ...(searchId ? [{ id: searchId }] : []),
          { patient_id: String(id) }
        ]
      },
      include: {
        users: { select: { email: true } },
        appointments: {
          include: {
            doctors: { select: { name: true, department: true, room_no: true } }
          },
          orderBy: [{ appointment_date: 'desc' }, { id: 'desc' }]
        },
        prescriptions: {
          include: {
            doctors: { select: { name: true, department: true, specialization: true } },
            prescription_items: true
          },
          orderBy: { consultation_date: 'desc' }
        },
        lab_requests: {
          include: {
            lab_tests_catalog: true,
            doctors: { select: { name: true } }
          },
          orderBy: { test_date: 'desc' }
        },
        admissions: {
          include: {
            wards_and_beds: true,
            doctors: { select: { name: true } }
          },
          orderBy: { admission_date: 'desc' }
        },
        invoices: {
          orderBy: { billing_date: 'desc' }
        }
      }
    });

    if (!patient) {
      throw { status: 404, message: 'Patient not found' };
    }

    const bloodReverseMap = {
      'A_POS': 'A+', 'A_NEG': 'A-',
      'B_POS': 'B+', 'B_NEG': 'B-',
      'AB_POS': 'AB+', 'AB_NEG': 'AB-',
      'O_POS': 'O+', 'O_NEG': 'O-'
    };

    const formattedPatient = {
      ...patient,
      blood_group: bloodReverseMap[patient.blood_group] || patient.blood_group,
      account_email: patient.users?.email || null
    };

    // Flatten history for clean frontend consumption
    const appointments = patient.appointments.map(a => ({
      ...a,
      appointment_date: a.appointment_date.toISOString().slice(0, 10),
      doctor_name: a.doctors.name,
      department: a.doctors.department,
      room_no: a.doctors.room_no
    }));

    const prescriptions = patient.prescriptions.map(pr => ({
      ...pr,
      consultation_date: pr.consultation_date.toISOString().slice(0, 10),
      doctor_name: pr.doctors.name,
      department: pr.doctors.department,
      specialization: pr.doctors.specialization,
      items: pr.prescription_items
    }));

    const labTests = patient.lab_requests.map(lr => ({
      ...lr,
      test_date: lr.test_date.toISOString().slice(0, 10),
      test_name: lr.lab_tests_catalog.test_name,
      category: lr.lab_tests_catalog.category,
      standard_charge: lr.lab_tests_catalog.standard_charge,
      normal_range: lr.lab_tests_catalog.normal_range,
      unit: lr.lab_tests_catalog.unit,
      doctor_name: lr.doctors.name
    }));

    const admissions = patient.admissions.map(adm => ({
      ...adm,
      admission_date: adm.admission_date.toISOString().slice(0, 10),
      bed_number: adm.wards_and_beds.bed_number,
      ward_type: adm.wards_and_beds.ward_type,
      floor: adm.wards_and_beds.floor,
      doctor_name: adm.doctors.name
    }));

    const invoices = patient.invoices.map(inv => ({
      ...inv,
      billing_date: inv.billing_date.toISOString().slice(0, 10)
    }));

    return {
      patient: formattedPatient,
      history: {
        appointments,
        prescriptions,
        labTests,
        admissions,
        invoices
      }
    };
  }

  async createPatient(data) {
    const { name, age, gender, blood_group, phone, email, address, emergency_contact, allergies, chronic_conditions } = data;

    if (!name || !phone || !gender || !age) {
      throw { status: 400, message: 'Name, age, gender, and phone number are required.' };
    }

    const year = new Date().getFullYear();
    const lastPatient = await prisma.patients.findFirst({
      orderBy: { id: 'desc' },
      select: { id: true }
    });
    const nextSeq = String((lastPatient?.id || 0) + 1).padStart(4, '0');
    const patientCode = `PAT-${year}-${nextSeq}`;

    const bloodMap = {
      'A+': 'A_POS', 'A-': 'A_NEG',
      'B+': 'B_POS', 'B-': 'B_NEG',
      'AB+': 'AB_POS', 'AB-': 'AB_NEG',
      'O+': 'O_POS', 'O-': 'O_NEG'
    };

    const newPatient = await prisma.patients.create({
      data: {
        patient_id: patientCode,
        name,
        age: parseInt(age),
        gender,
        blood_group: bloodMap[blood_group] || 'O_POS',
        phone,
        email: email || null,
        address: address || null,
        emergency_contact: emergency_contact || null,
        allergies: allergies || null,
        chronic_conditions: chronic_conditions || null
      }
    });

    return newPatient;
  }

  async updatePatient(id, data) {
    const { name, age, gender, blood_group, phone, email, address, emergency_contact, allergies, chronic_conditions } = data;

    const bloodMap = {
      'A+': 'A_POS', 'A-': 'A_NEG',
      'B+': 'B_POS', 'B-': 'B_NEG',
      'AB+': 'AB_POS', 'AB-': 'AB_NEG',
      'O+': 'O_POS', 'O-': 'O_NEG'
    };

    return await prisma.patients.update({
      where: { id: parseInt(id) },
      data: {
        name,
        age: age ? parseInt(age) : undefined,
        gender,
        blood_group: blood_group ? (bloodMap[blood_group] || blood_group) : undefined,
        phone,
        email,
        address,
        emergency_contact,
        allergies,
        chronic_conditions
      }
    });
  }

  async deletePatient(id) {
    return await prisma.patients.delete({
      where: { id: parseInt(id) }
    });
  }
}

module.exports = new PatientService();

