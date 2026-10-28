const ambulanceService = require('../services/ambulanceService');

exports.getAmbulances = async (req, res, next) => {
  try {
    const data = await ambulanceService.getAmbulances(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getAmbulanceById = async (req, res, next) => {
  try {
    const data = await ambulanceService.getAmbulanceById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createAmbulance = async (req, res, next) => {
  try {
    const data = await ambulanceService.addAmbulance(req.body);
    res.status(201).json({ success: true, message: 'Ambulance vehicle registered into emergency fleet', data });
  } catch (err) {
    next(err);
  }
};

exports.updateAmbulance = async (req, res, next) => {
  try {
    const data = await ambulanceService.updateAmbulance(req.params.id, req.body);
    res.json({ success: true, message: 'Ambulance vehicle updated', data });
  } catch (err) {
    next(err);
  }
};

exports.getTrips = async (req, res, next) => {
  try {
    const data = await ambulanceService.getTrips(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getTripById = async (req, res, next) => {
  try {
    const data = await ambulanceService.getTripById(req.params.id);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.dispatchAmbulance = async (req, res, next) => {
  try {
    const data = await ambulanceService.dispatchAmbulance(req.body);
    res.status(201).json({ success: true, message: 'Ambulance dispatched successfully and SMS alert sent to caller', data });
  } catch (err) {
    next(err);
  }
};

exports.updateTripStatus = async (req, res, next) => {
  try {
    const data = await ambulanceService.updateTripStatus(req.params.id, req.body);
    res.json({ success: true, message: 'Ambulance trip status updated', data });
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const data = await ambulanceService.getStats();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

