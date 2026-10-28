const prisma = require('../config/prisma');

class LabService {
  async getCatalog() {
    return await prisma.lab_tests_catalog.findMany({
      orderBy: [{ category: 'asc' }, { test_name: 'asc' }]
    });
  }

  async addCatalogItem(data) {
    const { test_code, test_name, category, standard_charge, normal_range, unit, turnaround_time } = data;
    if (!test_code || !test_name || !category || !standard_charge) {
      throw { status: 400, message: 'Test code, name, category, and charge are required.' };
    }

    return await prisma.lab_tests_catalog.create({
      data: {
        test_code,
        test_name,
        category,
        standard_charge: parseFloat(standard_charge),
        normal_range: normal_range || null,
        unit: unit || null,
        turnaround_time: turnaround_time || '24 Hours'
      }
    });
  }

  async getRequests({ status, patient_id, doctor_id, date }, user) {
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

    if (status) {
      const statusMap = {
        'Pending': 'Pending',
        'Sample Collected': 'Sample_Collected',
        'Completed': 'Completed',
        'Delivered': 'Delivered'
      };
      where.status = statusMap[status] || status;
    }

    if (date) {
      where.test_date = new Date(date);
    }

    const requests = await prisma.lab_requests.findMany({
      where,
      include: {
        patients: true,
        doctors: true,
        lab_tests_catalog: true,
        users: { select: { name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const statusReverseMap = {
      'Pending': 'Pending',
      'Sample_Collected': 'Sample Collected',
      'Completed': 'Completed',
      'Delivered': 'Delivered'
    };

    const formatted = requests.map(lr => ({
      ...lr,
      test_date: lr.test_date.toISOString().slice(0, 10),
      status: statusReverseMap[lr.status] || lr.status,
      patient_name: lr.patients.name,
      patient_code: lr.patients.patient_id,
      patient_phone: lr.patients.phone,
      patient_age: lr.patients.age,
      patient_gender: lr.patients.gender,
      doctor_name: lr.doctors.name,
      doctor_department: lr.doctors.department,
      test_name: lr.lab_tests_catalog.test_name,
      test_code: lr.lab_tests_catalog.test_code,
      category: lr.lab_tests_catalog.category,
      standard_charge: lr.lab_tests_catalog.standard_charge,
      normal_range: lr.lab_tests_catalog.normal_range,
      unit: lr.lab_tests_catalog.unit,
      technician_name: lr.users?.name || null
    }));

    const stats = {
      total: formatted.length,
      pending: formatted.filter(r => r.status === 'Pending').length,
      sampleCollected: formatted.filter(r => r.status === 'Sample Collected').length,
      completed: formatted.filter(r => r.status === 'Completed' || r.status === 'Delivered').length
    };

    return { stats, data: formatted };
  }

  async createRequest(data) {
    const { patient_id, doctor_id, test_id, priority = 'Normal', prescription_id } = data;

    if (!patient_id || !doctor_id || !test_id) {
      throw { status: 400, message: 'Patient, Doctor, and Test are required.' };
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const requisitionNumber = `REQ-${year}-${rand}`;
    const today = new Date();

    const request = await prisma.lab_requests.create({
      data: {
        requisition_number: requisitionNumber,
        patient_id: parseInt(patient_id),
        doctor_id: parseInt(doctor_id),
        prescription_id: prescription_id ? parseInt(prescription_id) : null,
        test_id: parseInt(test_id),
        priority,
        status: 'Pending',
        test_date: today
      }
    });

    return {
      requisitionId: request.id,
      requisitionNumber
    };
  }

  async updateResult(id, { result_value, remarks, status = 'Completed' }, file, userId) {
    const existing = await prisma.lab_requests.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existing) {
      throw { status: 404, message: 'Lab request not found' };
    }

    const reportFile = file ? `/uploads/${file.filename}` : existing.report_file;

    const statusMap = {
      'Pending': 'Pending',
      'Sample Collected': 'Sample_Collected',
      'Completed': 'Completed',
      'Delivered': 'Delivered'
    };

    const updated = await prisma.lab_requests.update({
      where: { id: parseInt(id) },
      data: {
        result_value: result_value !== undefined ? result_value : existing.result_value,
        remarks: remarks !== undefined ? remarks : existing.remarks,
        report_file: reportFile,
        status: statusMap[status] || status,
        technician_id: userId || existing.technician_id,
        completed_at: new Date()
      },
      include: {
        patients: true,
        doctors: true,
        lab_tests_catalog: true
      }
    });

    return {
      ...updated,
      test_date: updated.test_date.toISOString().slice(0, 10),
      test_name: updated.lab_tests_catalog.test_name,
      category: updated.lab_tests_catalog.category,
      normal_range: updated.lab_tests_catalog.normal_range,
      unit: updated.lab_tests_catalog.unit,
      patient_name: updated.patients.name,
      doctor_name: updated.doctors.name
    };
  }
}

module.exports = new LabService();

