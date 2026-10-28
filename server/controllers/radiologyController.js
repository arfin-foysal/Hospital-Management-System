const radiologyService = require('../services/radiologyService');

exports.getStudies = async (req, res, next) => {
  try {
    const data = await radiologyService.getStudies(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getStudyById = async (req, res, next) => {
  try {
    const data = await radiologyService.getStudyById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createStudy = async (req, res, next) => {
  try {
    const data = await radiologyService.createStudy(req.body);
    res.status(201).json({ success: true, message: 'Radiology study registered', data });
  } catch (err) {
    next(err);
  }
};

exports.updateReport = async (req, res, next) => {
  try {
    const data = await radiologyService.updateReport(req.params.id, req.body);
    res.json({ success: true, message: 'Radiology report updated', data });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const data = await radiologyService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
