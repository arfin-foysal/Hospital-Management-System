const emergencyService = require('../services/emergencyService');

exports.getCases = async (req, res, next) => {
  try {
    const data = await emergencyService.getEmergencyCases(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getCaseById = async (req, res, next) => {
  try {
    const data = await emergencyService.getEmergencyCaseById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createCase = async (req, res, next) => {
  try {
    const data = await emergencyService.createEmergencyCase(req.body);
    res.status(201).json({ success: true, message: 'Emergency triage case initiated', data });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const data = await emergencyService.updateTriageStatus(req.params.id, req.body);
    res.json({ success: true, message: 'Emergency case updated', data });
  } catch (err) {
    next(err);
  }
};

exports.transferToIPD = async (req, res, next) => {
  try {
    const data = await emergencyService.transferToIPD(req.params.id, req.body);
    res.json({ success: true, message: 'Patient admitted to In-Patient Department (IPD) from ER', data });
  } catch (err) {
    next(err);
  }
};

