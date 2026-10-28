const prisma = require('../config/prisma');

class RadiologyService {
  async getStudies({ modality, status, patient_id } = {}) {
    const where = {};
    if (modality) where.modality = modality;
    if (status) where.status = status;
    if (patient_id) where.patient_id = parseInt(patient_id);

    return await prisma.radiology_records.findMany({
      where,
      include: {
        patients: {
          select: {
            id: true,
            patient_id: true,
            name: true,
            age: true,
            gender: true,
            phone: true
          }
        },
        doctors: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: { imaging_date: 'desc' }
    });
  }

  async getStudyById(id) {
    const study = await prisma.radiology_records.findUnique({
      where: { id: parseInt(id) },
      include: {
        patients: true,
        doctors: true
      }
    });

    if (!study) throw { status: 404, message: 'Radiology study not found' };
    return study;
  }

  async createStudy(data) {
    const {
      patient_id,
      doctor_id,
      modality = 'X_Ray',
      body_part,
      radiologist_name,
      image_url,
      clinical_indication
    } = data;

    if (!patient_id || !body_part || !radiologist_name) {
      throw { status: 400, message: 'Patient, Body Part, and Radiologist Name are required' };
    }

    const count = await prisma.radiology_records.count();
    const studyId = `RAD-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    // Sample medical images fallback
    const defaultImages = {
      X_Ray: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80',
      CT_Scan: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80',
      MRI: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80',
      Ultrasound: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80',
      Echocardiogram: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80'
    };

    return await prisma.radiology_records.create({
      data: {
        study_id: studyId,
        patient_id: parseInt(patient_id),
        doctor_id: doctor_id ? parseInt(doctor_id) : null,
        modality,
        body_part,
        radiologist_name,
        image_url: image_url || defaultImages[modality] || defaultImages.X_Ray,
        clinical_indication: clinical_indication || 'Clinical investigation',
        status: 'Pending_Review'
      },
      include: {
        patients: true,
        doctors: true
      }
    });
  }

  async updateReport(id, data) {
    const studyId = parseInt(id);
    const existing = await prisma.radiology_records.findUnique({ where: { id: studyId } });
    if (!existing) throw { status: 404, message: 'Radiology study not found' };

    const { status, findings, impression, radiologist_name } = data;
    const updateData = {};
    if (status) updateData.status = status;
    if (findings !== undefined) updateData.findings = findings;
    if (impression !== undefined) updateData.impression = impression;
    if (radiologist_name) updateData.radiologist_name = radiologist_name;

    return await prisma.radiology_records.update({
      where: { id: studyId },
      data: updateData,
      include: {
        patients: true,
        doctors: true
      }
    });
  }

  async getStats() {
    const [total, pending, approved, xray, mri, ct] = await Promise.all([
      prisma.radiology_records.count(),
      prisma.radiology_records.count({ where: { status: 'Pending_Review' } }),
      prisma.radiology_records.count({ where: { status: 'Final_Approved' } }),
      prisma.radiology_records.count({ where: { modality: 'X_Ray' } }),
      prisma.radiology_records.count({ where: { modality: 'MRI' } }),
      prisma.radiology_records.count({ where: { modality: 'CT_Scan' } })
    ]);

    return { total, pending, approved, xray, mri, ct };
  }
}

module.exports = new RadiologyService();
