const patientService = require('../services/patientService');

exports.getPatients = async (req, res, next) => {
  try {
    const result = await patientService.getAllPatients(req.query);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving patients'
    });
  }
};

exports.getPatientById = async (req, res, next) => {
  try {
    const result = await patientService.getPatientById(req.params.id);
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving patient profile'
    });
  }
};

exports.createPatient = async (req, res, next) => {
  try {
    const newPatient = await patientService.createPatient(req.body);
    res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: newPatient
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error registering patient'
    });
  }
};

exports.updatePatient = async (req, res, next) => {
  try {
    const updated = await patientService.updatePatient(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Patient record updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error updating patient'
    });
  }
};

exports.deletePatient = async (req, res, next) => {
  try {
    await patientService.deletePatient(req.params.id);
    res.json({
      success: true,
      message: 'Patient record deleted successfully'
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error deleting patient'
    });
  }
};

