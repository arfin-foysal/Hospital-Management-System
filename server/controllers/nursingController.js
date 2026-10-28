const nursingService = require('../services/nursingService');

exports.getActiveInpatients = async (req, res, next) => {
  try {
    const data = await nursingService.getActiveInpatients();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getBedsideVitals = async (req, res, next) => {
  try {
    const data = await nursingService.getBedsideVitals(req.params.admission_id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.recordVitals = async (req, res, next) => {
  try {
    const data = await nursingService.recordBedsideVitals(req.body);
    res.status(201).json({ success: true, message: 'Bedside vitals logged', data });
  } catch (err) {
    next(err);
  }
};

exports.getEMAR = async (req, res, next) => {
  try {
    const data = await nursingService.getEMAR(req.params.admission_id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.scheduleMedication = async (req, res, next) => {
  try {
    const data = await nursingService.scheduleMedication(req.body);
    res.status(201).json({ success: true, message: 'Medication scheduled on eMAR', data });
  } catch (err) {
    next(err);
  }
};

exports.administerMedication = async (req, res, next) => {
  try {
    const data = await nursingService.administerMedication(req.params.id, req.body);
    res.json({ success: true, message: 'Medication administered and signed off by nurse', data });
  } catch (err) {
    next(err);
  }
};

