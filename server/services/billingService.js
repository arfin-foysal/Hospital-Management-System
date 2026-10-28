const prisma = require('../config/prisma');

class BillingService {
  async getInvoices({ status, patient_id, search }, user) {
    const where = {};

    if (user?.role === 'patient' && user.patient_id) {
      where.patient_id = user.patient_id;
    } else if (patient_id) {
      where.patient_id = parseInt(patient_id);
    }

    if (status) {
      where.payment_status = status;
    }

    if (search) {
      where.OR = [
        { invoice_number: { contains: search } },
        { patients: { name: { contains: search } } },
        { patients: { patient_id: { contains: search } } }
      ];
    }

    const invoices = await prisma.invoices.findMany({
      where,
      include: {
        patients: { select: { name: true, patient_id: true, phone: true } },
        users: { select: { name: true } }
      },
      orderBy: { id: 'desc' }
    });

    const paymentMethodReverseMap = {
      'Credit_Card': 'Credit Card',
      'Debit_Card': 'Debit Card',
      'bKash___Mobile_Banking': 'bKash / Mobile Banking',
      'Bank_Transfer': 'Bank Transfer'
    };

    const formatted = invoices.map(inv => ({
      ...inv,
      billing_date: inv.billing_date.toISOString().slice(0, 10),
      payment_method: paymentMethodReverseMap[inv.payment_method] || inv.payment_method,
      patient_name: inv.patients.name,
      patient_code: inv.patients.patient_id,
      patient_phone: inv.patients.phone,
      created_by_name: inv.users?.name || null
    }));

    const stats = {
      totalInvoices: formatted.length,
      totalBilled: formatted.reduce((sum, i) => sum + parseFloat(i.total_amount || 0), 0),
      totalCollected: formatted.reduce((sum, i) => sum + parseFloat(i.paid_amount || 0), 0),
      totalOutstanding: formatted.reduce((sum, i) => sum + parseFloat(i.due_amount || 0), 0),
      unpaidCount: formatted.filter(i => i.payment_status === 'Unpaid').length,
      partialCount: formatted.filter(i => i.payment_status === 'Partial').length,
      paidCount: formatted.filter(i => i.payment_status === 'Paid').length
    };

    return { stats, data: formatted };
  }

  async getInvoiceById(id) {
    const invoice = await prisma.invoices.findUnique({
      where: { id: parseInt(id) },
      include: {
        patients: true,
        admissions: true,
        appointments: true,
        users: { select: { name: true } }
      }
    });

    if (!invoice) {
      throw { status: 404, message: 'Invoice not found' };
    }

    const paymentMethodReverseMap = {
      'Credit_Card': 'Credit Card',
      'Debit_Card': 'Debit Card',
      'bKash___Mobile_Banking': 'bKash / Mobile Banking',
      'Bank_Transfer': 'Bank Transfer'
    };

    return {
      ...invoice,
      billing_date: invoice.billing_date.toISOString().slice(0, 10),
      payment_method: paymentMethodReverseMap[invoice.payment_method] || invoice.payment_method,
      patient_name: invoice.patients.name,
      patient_code: invoice.patients.patient_id,
      patient_phone: invoice.patients.phone,
      patient_email: invoice.patients.email,
      patient_address: invoice.patients.address,
      age: invoice.patients.age,
      gender: invoice.patients.gender,
      blood_group: invoice.patients.blood_group,
      admission_number: invoice.admissions?.admission_number || null,
      admission_date: invoice.admissions?.admission_date ? invoice.admissions.admission_date.toISOString().slice(0, 10) : null,
      discharge_date: invoice.admissions?.discharge_date ? invoice.admissions.discharge_date.toISOString().slice(0, 10) : null,
      appointment_number: invoice.appointments?.appointment_number || null,
      accountant_name: invoice.users?.name || null
    };
  }

  async getPendingChargesForPatient(patientId) {
    const patient = await prisma.patients.findUnique({
      where: { id: parseInt(patientId) }
    });

    if (!patient) {
      throw { status: 404, message: 'Patient not found' };
    }

    // 1. Pending consultations
    const billedApptIds = (await prisma.invoices.findMany({
      where: { patient_id: parseInt(patientId), appointment_id: { not: null } },
      select: { appointment_id: true }
    })).map(i => i.appointment_id);

    const appointments = await prisma.appointments.findMany({
      where: {
        patient_id: parseInt(patientId),
        status: { in: ['Completed', 'In_Consultation'] },
        id: { notIn: billedApptIds }
      },
      include: { doctors: true }
    });

    const totalConsultation = appointments.reduce((sum, a) => sum + parseFloat(a.doctors.consultation_fee || 0), 0);

    // 2. Unbilled IPD Admissions
    const billedAdmIds = (await prisma.invoices.findMany({
      where: { patient_id: parseInt(patientId), admission_id: { not: null } },
      select: { admission_id: true }
    })).map(i => i.admission_id);

    const admissions = await prisma.admissions.findMany({
      where: {
        patient_id: parseInt(patientId),
        id: { notIn: billedAdmIds }
      },
      include: { wards_and_beds: true }
    });

    let totalBedCharges = 0;
    const formattedAdmissions = admissions.map(adm => {
      const start = new Date(adm.admission_date);
      const end = adm.discharge_date ? new Date(adm.discharge_date) : new Date();
      const diffTime = Math.abs(end - start);
      const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      const charge = days * parseFloat(adm.wards_and_beds.daily_charge);
      totalBedCharges += charge;
      return {
        ...adm,
        bed_number: adm.wards_and_beds.bed_number,
        ward_type: adm.wards_and_beds.ward_type,
        daily_charge: adm.wards_and_beds.daily_charge,
        days_stayed: days,
        total_charge: charge
      };
    });

    // 3. Lab tests
    const labTests = await prisma.lab_requests.findMany({
      where: { patient_id: parseInt(patientId) },
      include: { lab_tests_catalog: true }
    });
    const totalLabCharges = labTests.reduce((sum, l) => sum + parseFloat(l.lab_tests_catalog.standard_charge || 0), 0);

    // 4. Pharmacy sales
    const pharmacySales = await prisma.pharmacy_sales.findMany({
      where: { patient_id: parseInt(patientId) }
    });
    const totalPharmacy = pharmacySales.reduce((sum, p) => sum + parseFloat(p.net_amount || 0), 0);

    return {
      patient,
      pending: {
        appointments: appointments.map(a => ({
          ...a,
          doctor_name: a.doctors.name,
          consultation_fee: a.doctors.consultation_fee
        })),
        admissions: formattedAdmissions,
        labTests: labTests.map(l => ({
          ...l,
          test_name: l.lab_tests_catalog.test_name,
          standard_charge: l.lab_tests_catalog.standard_charge
        })),
        pharmacySales,
        suggestedCharges: {
          consultation_fee: totalConsultation,
          bed_charges: totalBedCharges,
          pharmacy_charges: totalPharmacy,
          lab_charges: totalLabCharges
        }
      }
    };
  }

  async createInvoice(data, userId) {
    const {
      patient_id,
      admission_id,
      appointment_id,
      consultation_fee = 0,
      bed_charges = 0,
      pharmacy_charges = 0,
      lab_charges = 0,
      nursing_charges = 0,
      other_charges = 0,
      discount = 0,
      tax = 0,
      paid_amount = 0,
      payment_method = 'Cash',
      remarks
    } = data;

    if (!patient_id) {
      throw { status: 400, message: 'Patient selection is required.' };
    }

    const cFee = parseFloat(consultation_fee || 0);
    const bCharges = parseFloat(bed_charges || 0);
    const pCharges = parseFloat(pharmacy_charges || 0);
    const lCharges = parseFloat(lab_charges || 0);
    const nCharges = parseFloat(nursing_charges || 0);
    const oCharges = parseFloat(other_charges || 0);
    const disc = parseFloat(discount || 0);
    const tx = parseFloat(tax || 0);
    const paid = parseFloat(paid_amount || 0);

    const subtotal = cFee + bCharges + pCharges + lCharges + nCharges + oCharges;
    const totalAmount = Math.max(0, subtotal - disc + tx);
    const dueAmount = Math.max(0, totalAmount - paid);

    let paymentStatus = 'Unpaid';
    if (paid >= totalAmount && totalAmount > 0) {
      paymentStatus = 'Paid';
    } else if (paid > 0 && paid < totalAmount) {
      paymentStatus = 'Partial';
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${year}-${rand}`;
    const today = new Date();

    const methodMap = {
      'Cash': 'Cash',
      'Credit Card': 'Credit_Card',
      'Debit Card': 'Debit_Card',
      'bKash / Mobile Banking': 'bKash___Mobile_Banking',
      'Insurance': 'Insurance',
      'Bank Transfer': 'Bank_Transfer'
    };

    const invoice = await prisma.invoices.create({
      data: {
        invoice_number: invoiceNumber,
        patient_id: parseInt(patient_id),
        admission_id: admission_id ? parseInt(admission_id) : null,
        appointment_id: appointment_id ? parseInt(appointment_id) : null,
        consultation_fee: cFee,
        bed_charges: bCharges,
        pharmacy_charges: pCharges,
        lab_charges: lCharges,
        nursing_charges: nCharges,
        other_charges: oCharges,
        subtotal,
        discount: disc,
        tax: tx,
        total_amount: totalAmount,
        paid_amount: paid,
        due_amount: dueAmount,
        payment_method: methodMap[payment_method] || 'Cash',
        payment_status: paymentStatus,
        billing_date: today,
        remarks: remarks || null,
        created_by: userId || null
      }
    });

    return {
      invoiceId: invoice.id,
      invoiceNumber
    };
  }

  async recordPayment(id, { payment_amount, payment_method }) {
    const inv = await prisma.invoices.findUnique({
      where: { id: parseInt(id) }
    });

    if (!inv) {
      throw { status: 404, message: 'Invoice not found' };
    }

    const newPaidAmount = parseFloat(inv.paid_amount || 0) + parseFloat(payment_amount || 0);
    const newDueAmount = Math.max(0, parseFloat(inv.total_amount) - newPaidAmount);

    let newStatus = 'Unpaid';
    if (newPaidAmount >= parseFloat(inv.total_amount)) {
      newStatus = 'Paid';
    } else if (newPaidAmount > 0) {
      newStatus = 'Partial';
    }

    const methodMap = {
      'Cash': 'Cash',
      'Credit Card': 'Credit_Card',
      'Debit Card': 'Debit_Card',
      'bKash / Mobile Banking': 'bKash___Mobile_Banking',
      'Insurance': 'Insurance',
      'Bank Transfer': 'Bank_Transfer'
    };

    await prisma.invoices.update({
      where: { id: parseInt(id) },
      data: {
        paid_amount: newPaidAmount,
        due_amount: newDueAmount,
        payment_status: newStatus,
        payment_method: payment_method ? (methodMap[payment_method] || payment_method) : undefined
      }
    });

    return {
      payment_status: newStatus,
      paid_amount: newPaidAmount,
      due_amount: newDueAmount
    };
  }
}

module.exports = new BillingService();

