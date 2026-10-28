const insuranceService = require('../services/insuranceService');

exports.getClaims = async (req, res, next) => {
  try {
    const data = await insuranceService.getClaims(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getClaimById = async (req, res, next) => {
  try {
    const data = await insuranceService.getClaimById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createClaim = async (req, res, next) => {
  try {
    const data = await insuranceService.createClaim(req.body);
    res.status(201).json({ success: true, message: 'Insurance claim initiated', data });
  } catch (err) {
    next(err);
  }
};

exports.updateClaim = async (req, res, next) => {
  try {
    const data = await insuranceService.updateClaim(req.params.id, req.body);
    res.json({ success: true, message: 'Insurance claim updated', data });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const data = await insuranceService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
