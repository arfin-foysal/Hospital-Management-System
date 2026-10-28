const ipdService = require('../services/ipdService');

exports.getBeds = async (req, res, next) => {
  try {
    const result = await ipdService.getBeds(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving beds'
    });
  }
};

exports.updateBedStatus = async (req, res, next) => {
  try {
    await ipdService.updateBedStatus(req.params.id, req.body);
    res.json({ success: true, message: `Bed status updated to '${req.body.status}'` });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error updating bed status'
    });
  }
};

exports.getAdmissions = async (req, res, next) => {
  try {
    const data = await ipdService.getAdmissions(req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error fetching IPD admissions'
    });
  }
};

exports.admitPatient = async (req, res, next) => {
  try {
    const result = await ipdService.admitPatient(req.body);
    res.status(201).json({
      success: true,
      message: `Patient admitted successfully. Admission #${result.admissionNumber}`,
      admissionId: result.admissionId
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error during admission'
    });
  }
};

exports.dischargePatient = async (req, res, next) => {
  try {
    const staySummary = await ipdService.dischargePatient(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Patient discharged successfully. Bed freed.',
      staySummary
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error discharging patient'
    });
  }
};

