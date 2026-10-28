const prisma = require('../config/prisma');

class InsuranceService {
  async getClaims({ claim_status, claim_type, patient_id } = {}) {
    const where = {};
    if (claim_status) where.claim_status = claim_status;
    if (claim_type) where.claim_type = claim_type;
    if (patient_id) where.patient_id = parseInt(patient_id);

    return await prisma.insurance_claims.findMany({
      where,
      include: {
        patients: {
          select: {
            id: true,
            patient_id: true,
            name: true,
            phone: true,
            blood_group: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });
  }

  async getClaimById(id) {
    const claim = await prisma.insurance_claims.findUnique({
      where: { id: parseInt(id) },
      include: { patients: true }
    });

    if (!claim) throw { status: 404, message: 'Insurance claim not found' };
    return claim;
  }

  async createClaim(data) {
    const {
      patient_id,
      insurance_company,
      policy_number,
      tpa_name = 'CareSync Hospital TPA Desk',
      claim_type = 'Cashless_Hospitalization',
      estimated_amount,
      copay_percentage = 10,
      remarks
    } = data;

    if (!patient_id || !insurance_company || !policy_number || !estimated_amount) {
      throw { status: 400, message: 'Patient, Insurance Company, Policy Number, and Estimated Amount are required' };
    }

    const count = await prisma.insurance_claims.count();
    const claimNumber = `CLM-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    return await prisma.insurance_claims.create({
      data: {
        claim_number: claimNumber,
        patient_id: parseInt(patient_id),
        insurance_company,
        policy_number,
        tpa_name,
        claim_type,
        claim_status: 'Pre_Auth_Submitted',
        estimated_amount: parseFloat(estimated_amount),
        approved_amount: 0.00,
        copay_percentage: parseFloat(copay_percentage) || 10.00,
        remarks: remarks || 'Pre-authorization request filed at hospital TPA desk'
      },
      include: { patients: true }
    });
  }

  async updateClaim(id, data) {
    const claimId = parseInt(id);
    const existing = await prisma.insurance_claims.findUnique({ where: { id: claimId } });
    if (!existing) throw { status: 404, message: 'Insurance claim not found' };

    const { claim_status, approved_amount, approval_code, remarks } = data;
    const updateData = {};
    if (claim_status) updateData.claim_status = claim_status;
    if (approved_amount !== undefined) updateData.approved_amount = parseFloat(approved_amount);
    if (approval_code !== undefined) updateData.approval_code = approval_code;
    if (remarks !== undefined) updateData.remarks = remarks;

    return await prisma.insurance_claims.update({
      where: { id: claimId },
      data: updateData,
      include: { patients: true }
    });
  }

  async getStats() {
    const [total, approved, preAuth, settled, totalApprovedSum] = await Promise.all([
      prisma.insurance_claims.count(),
      prisma.insurance_claims.count({ where: { claim_status: 'Approved' } }),
      prisma.insurance_claims.count({ where: { claim_status: 'Pre_Auth_Submitted' } }),
      prisma.insurance_claims.count({ where: { claim_status: 'Settled' } }),
      prisma.insurance_claims.aggregate({
        _sum: { approved_amount: true }
      })
    ]);

    return {
      total,
      approved,
      preAuth,
      settled,
      totalApprovedSum: totalApprovedSum._sum.approved_amount || 0
    };
  }
}

module.exports = new InsuranceService();
