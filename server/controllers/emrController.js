const emrService = require('../services/emrService');

exports.getPrescriptions = async (req, res, next) => {
  try {
    const data = await emrService.getPrescriptions(req.query, req.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving prescriptions'
    });
  }
};

exports.getPrescriptionById = async (req, res, next) => {
  try {
    const data = await emrService.getPrescriptionById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving prescription'
    });
  }
};

exports.createPrescription = async (req, res, next) => {
  try {
    const result = await emrService.createPrescription(req.body);
    res.status(201).json({
      success: true,
      message: `Prescription created successfully (${result.prescriptionNumber})`,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error saving prescription'
    });
  }
};

