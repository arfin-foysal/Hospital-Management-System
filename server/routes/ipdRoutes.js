const express = require('express');
const router = express.Router();
const ipdController = require('../controllers/ipdController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/beds', authenticateToken, ipdController.getBeds);
router.patch('/beds/:id/status', authenticateToken, authorizeRoles('admin', 'receptionist'), ipdController.updateBedStatus);
router.get('/admissions', authenticateToken, ipdController.getAdmissions);
router.post('/admit', authenticateToken, authorizeRoles('admin', 'receptionist', 'doctor'), ipdController.admitPatient);
router.post('/admissions/:id/discharge', authenticateToken, authorizeRoles('admin', 'doctor'), ipdController.dischargePatient);

module.exports = router;

