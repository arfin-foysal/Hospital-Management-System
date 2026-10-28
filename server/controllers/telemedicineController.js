const telemedicineService = require('../services/telemedicineService');

exports.getSessions = async (req, res, next) => {
  try {
    const data = await telemedicineService.getSessions(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getSessionById = async (req, res, next) => {
  try {
    const data = await telemedicineService.getSessionById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createSession = async (req, res, next) => {
  try {
    const data = await telemedicineService.createSession(req.body);
    res.status(201).json({ success: true, message: 'Telemedicine consultation session scheduled', data });
  } catch (err) {
    next(err);
  }
};

exports.updateSession = async (req, res, next) => {
  try {
    const data = await telemedicineService.updateSessionStatus(req.params.id, req.body);
    res.json({ success: true, message: 'Telemedicine consultation updated', data });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const data = await telemedicineService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
