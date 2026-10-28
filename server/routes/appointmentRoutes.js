const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/', authenticateToken, appointmentController.getAppointments);
router.get('/doctors', authenticateToken, appointmentController.getDoctorsList);
router.get('/queue', authenticateToken, appointmentController.getLiveOpdQueue);
router.post('/', authenticateToken, appointmentController.createAppointment);
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'receptionist', 'doctor'), appointmentController.updateAppointmentStatus);

module.exports = router;

