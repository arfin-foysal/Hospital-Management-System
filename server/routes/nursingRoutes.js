const express = require('express');
const router = express.Router();
const nursingController = require('../controllers/nursingController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/inpatients', authenticateToken, nursingController.getActiveInpatients);
router.get('/vitals/:admission_id', authenticateToken, nursingController.getBedsideVitals);
router.post('/vitals', authenticateToken, nursingController.recordVitals);
router.get('/emar/:admission_id', authenticateToken, nursingController.getEMAR);
router.post('/emar', authenticateToken, nursingController.scheduleMedication);
router.patch('/emar/:id/administer', authenticateToken, nursingController.administerMedication);

module.exports = router;

