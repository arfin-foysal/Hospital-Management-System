const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/', authenticateToken, patientController.getPatients);
router.get('/:id', authenticateToken, patientController.getPatientById);
router.post('/', authenticateToken, authorizeRoles('admin', 'receptionist', 'doctor'), patientController.createPatient);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'receptionist', 'doctor'), patientController.updatePatient);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), patientController.deletePatient);

module.exports = router;

