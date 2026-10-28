const appointmentService = require('../services/appointmentService');

exports.getAppointments = async (req, res, next) => {
  try {
    const data = await appointmentService.getAppointments(req.query, req.user);
    res.json({ success: true, data });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving appointments'
    });
  }
};

exports.getLiveOpdQueue = async (req, res, next) => {
  try {
    const result = await appointmentService.getLiveOpdQueue(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error retrieving OPD queue'
    });
  }
};

exports.createAppointment = async (req, res, next) => {
  try {
    const data = await appointmentService.createAppointment(req.body);
    res.status(201).json({
      success: true,
      message: `Appointment scheduled successfully. Token #${data.token_number}`,
      data
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error scheduling appointment'
    });
  }
};

exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const updated = await appointmentService.updateAppointmentStatus(req.params.id, req.body);
    res.json({
      success: true,
      message: `Appointment status updated to '${req.body.status}'`,
      data: updated
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error updating appointment status'
    });
  }
};

exports.getDoctorsList = async (req, res, next) => {
  try {
    const doctors = await appointmentService.getDoctorsList();
    res.json({ success: true, data: doctors });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Server error fetching doctors'
    });
  }
};

