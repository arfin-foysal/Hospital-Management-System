const express = require('express');
const router = express.Router();
const emrController = require('../controllers/emrController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/', authenticateToken, emrController.getPrescriptions);
router.get('/:id', authenticateToken, emrController.getPrescriptionById);
router.post('/', authenticateToken, authorizeRoles('admin', 'doctor'), emrController.createPrescription);

module.exports = router;

