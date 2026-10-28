const bloodBankService = require('../services/bloodBankService');

exports.getInventory = async (req, res, next) => {
  try {
    const data = await bloodBankService.getInventory(req.query);
    res.json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.getDonors = async (req, res, next) => {
  try {
    const data = await bloodBankService.getDonors();
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.registerDonor = async (req, res, next) => {
  try {
    const data = await bloodBankService.registerDonor(req.body);
    res.status(201).json({ success: true, message: 'Blood donor registered successfully', data });
  } catch (err) {
    next(err);
  }
};

exports.addBloodBag = async (req, res, next) => {
  try {
    const data = await bloodBankService.addBloodBag(req.body);
    res.status(201).json({ success: true, message: 'Blood bag added to inventory', data });
  } catch (err) {
    next(err);
  }
};

exports.getRequisitions = async (req, res, next) => {
  try {
    const data = await bloodBankService.getRequisitions(req.query);
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.createRequisition = async (req, res, next) => {
  try {
    const data = await bloodBankService.createRequisition(req.body);
    res.status(201).json({ success: true, message: 'Blood requisition submitted', data });
  } catch (err) {
    next(err);
  }
};

exports.issueBloodBag = async (req, res, next) => {
  try {
    const data = await bloodBankService.issueBloodBag(req.params.id, req.body);
    res.json({ success: true, message: 'Blood unit issued for transfusion', data });
  } catch (err) {
    next(err);
  }
};

