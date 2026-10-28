const billingService = require('../services/billingService');

exports.getInvoices = async (req, res, next) => {
  try {
    const result = await billingService.getInvoices(req.query, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving invoices'
    });
  }
};

exports.getInvoiceById = async (req, res, next) => {
  try {
    const data = await billingService.getInvoiceById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving invoice'
    });
  }
};

exports.getPendingChargesForPatient = async (req, res, next) => {
  try {
    const result = await billingService.getPendingChargesForPatient(req.params.patient_id);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error calculating pending charges'
    });
  }
};

exports.createInvoice = async (req, res, next) => {
  try {
    const result = await billingService.createInvoice(req.body, req.user?.id);
    res.status(201).json({
      success: true,
      message: `Consolidated invoice generated successfully (#${result.invoiceNumber})`,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error generating consolidated invoice'
    });
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const result = await billingService.recordPayment(req.params.id, req.body);
    res.json({
      success: true,
      message: `Payment of ৳${req.body.payment_amount} recorded successfully.`,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error recording payment'
    });
  }
};

