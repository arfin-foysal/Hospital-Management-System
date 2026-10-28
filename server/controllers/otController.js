const otService = require('../services/otService');

exports.getTheatres = async (req, res, next) => {
  try {
    const data = await otService.getTheatres();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getSurgeries = async (req, res, next) => {
  try {
    const data = await otService.getSurgeries(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.bookSurgery = async (req, res, next) => {
  try {
    const data = await otService.bookSurgery(req.body);
    res.status(201).json({ success: true, message: 'Surgery scheduled successfully in OT', data });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const data = await otService.updateSurgeryStatus(req.params.id, req.body);
    res.json({ success: true, message: 'Surgery status updated', data });
  } catch (err) {
    next(err);
  }
};

