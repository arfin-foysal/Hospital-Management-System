const prisma = require('../config/prisma');

class BloodBankService {
  async getInventory({ blood_group, status }) {
    const where = {};
    if (status) where.status = status;
    if (blood_group) {
      const map = {
        'A+': 'A_POS', 'A-': 'A_NEG',
        'B+': 'B_POS', 'B-': 'B_NEG',
        'AB+': 'AB_POS', 'AB-': 'AB_NEG',
        'O+': 'O_POS', 'O-': 'O_NEG'
      };
      where.blood_group = map[blood_group] || blood_group;
    }

    const bags = await prisma.blood_inventory.findMany({
      where,
      include: { blood_donors: true },
      orderBy: [{ expiry_date: 'asc' }]
    });

    // Also calculate stock summary counts by group
    const summary = {};
    const groups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    for (const g of groups) summary[g] = 0;

    const availableBags = await prisma.blood_inventory.findMany({
      where: { status: 'Available' }
    });
    for (const b of availableBags) {
      const groupMap = {
        'A_POS': 'A+', 'A_NEG': 'A-',
        'B_POS': 'B+', 'B_NEG': 'B-',
        'AB_POS': 'AB+', 'AB_NEG': 'AB-',
        'O_POS': 'O+', 'O_NEG': 'O-'
      };
      const label = groupMap[b.blood_group] || b.blood_group;
      summary[label] = (summary[label] || 0) + 1;
    }

    return {
      bags: bags.map(b => ({
        ...b,
        collected_date: b.collected_date.toISOString().slice(0, 10),
        expiry_date: b.expiry_date.toISOString().slice(0, 10),
        donor_name: b.blood_donors?.name || 'Anonymous'
      })),
      stockSummary: summary
    };
  }

  async getDonors() {
    const donors = await prisma.blood_donors.findMany({
      orderBy: [{ total_donations: 'desc' }, { name: 'asc' }]
    });
    return donors.map(d => ({
      ...d,
      last_donation_date: d.last_donation_date ? d.last_donation_date.toISOString().slice(0, 10) : null
    }));
  }

  async registerDonor(data) {
    const { name, blood_group, gender, age, phone, email, address, total_donations = 0 } = data;
    if (!name || !blood_group || !phone) {
      throw { status: 400, message: 'Name, Blood Group and Phone are required.' };
    }

    const count = await prisma.blood_donors.count();
    const donorCode = `DNR-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const map = {
      'A+': 'A_POS', 'A-': 'A_NEG',
      'B+': 'B_POS', 'B-': 'B_NEG',
      'AB+': 'AB_POS', 'AB-': 'AB_NEG',
      'O+': 'O_POS', 'O-': 'O_NEG'
    };

    return await prisma.blood_donors.create({
      data: {
        donor_code: donorCode,
        name,
        blood_group: map[blood_group] || blood_group,
        gender: gender || 'Male',
        age: parseInt(age) || 25,
        phone,
        email,
        address,
        total_donations: parseInt(total_donations) || 0,
        last_donation_date: new Date(),
        is_eligible: true
      }
    });
  }

  async addBloodBag(data) {
    const { donor_id, blood_group, component_type = 'Whole_Blood', volume_ml = 450, storage_location } = data;
    if (!blood_group) throw { status: 400, message: 'Blood Group is required.' };

    const map = {
      'A+': 'A_POS', 'A-': 'A_NEG',
      'B+': 'B_POS', 'B-': 'B_NEG',
      'AB+': 'AB_POS', 'AB-': 'AB_NEG',
      'O+': 'O_POS', 'O-': 'O_NEG'
    };

    const count = await prisma.blood_inventory.count();
    const cleanGroup = blood_group.replace('+', 'POS').replace('-', 'NEG');
    const bagNumber = `BAG-${cleanGroup}-${String(count + 1).padStart(3, '0')}`;

    const colDate = new Date();
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 35); // standard 35 days for Whole Blood

    return await prisma.blood_inventory.create({
      data: {
        bag_number: bagNumber,
        donor_id: donor_id ? parseInt(donor_id) : null,
        blood_group: map[blood_group] || blood_group,
        component_type: component_type.replace(/ /g, '_'),
        volume_ml: parseInt(volume_ml) || 450,
        collected_date: colDate,
        expiry_date: expDate,
        storage_location: storage_location || 'Blood Bank Refrigerator #1',
        status: 'Available'
      }
    });
  }

  async getRequisitions({ status }) {
    const where = {};
    if (status) where.status = status;

    const reqs = await prisma.blood_requisitions.findMany({
      where,
      include: {
        patients: true,
        doctors: true,
        blood_inventory: true
      },
      orderBy: [{ created_at: 'desc' }]
    });

    return reqs.map(r => ({
      ...r,
      required_date: r.required_date.toISOString().slice(0, 10),
      patient_name: r.patients.name,
      patient_code: r.patients.patient_id,
      doctor_name: r.doctors?.name || 'On-Duty Officer',
      issued_bag_number: r.blood_inventory?.bag_number || null
    }));
  }

  async createRequisition(data) {
    const { patient_id, doctor_id, blood_group, component_type = 'Whole_Blood', units_required = 1, urgency = 'Routine', notes, required_date } = data;
    if (!patient_id || !blood_group) {
      throw { status: 400, message: 'Patient and Blood Group are required.' };
    }

    const count = await prisma.blood_requisitions.count();
    const reqNumber = `BREQ-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const map = {
      'A+': 'A_POS', 'A-': 'A_NEG',
      'B+': 'B_POS', 'B-': 'B_NEG',
      'AB+': 'AB_POS', 'AB-': 'AB_NEG',
      'O+': 'O_POS', 'O-': 'O_NEG'
    };

    return await prisma.blood_requisitions.create({
      data: {
        req_number: reqNumber,
        patient_id: parseInt(patient_id),
        doctor_id: doctor_id ? parseInt(doctor_id) : null,
        blood_group: map[blood_group] || blood_group,
        component_type: component_type.replace(/ /g, '_'),
        units_required: parseInt(units_required) || 1,
        urgency: urgency.replace(/ /g, '_'),
        crossmatch_status: 'Pending',
        status: 'Requested',
        notes,
        required_date: required_date ? new Date(required_date) : new Date()
      }
    });
  }

  async issueBloodBag(requisitionId, { bag_id, notes }) {
    return await prisma.$transaction(async (tx) => {
      const bag = await tx.blood_inventory.findUnique({ where: { id: parseInt(bag_id) } });
      if (!bag || bag.status !== 'Available') {
        throw { status: 400, message: 'Blood bag is not available for issue.' };
      }

      await tx.blood_inventory.update({
        where: { id: parseInt(bag_id) },
        data: { status: 'Transfused' }
      });

      return await tx.blood_requisitions.update({
        where: { id: parseInt(requisitionId) },
        data: {
          status: 'Issued',
          crossmatch_status: 'Compatible',
          issued_bag_id: parseInt(bag_id),
          notes: notes || 'Cross-matched & issued to transfusion unit'
        }
      });
    });
  }
}

module.exports = new BloodBankService();

