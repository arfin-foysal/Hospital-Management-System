const express = require('express');
const router = express.Router();
const pharmacyController = require('../controllers/pharmacyController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/medicines', authenticateToken, pharmacyController.getMedicines);
router.post('/medicines', authenticateToken, authorizeRoles('admin', 'pharmacist'), pharmacyController.addMedicine);
router.put('/medicines/:id', authenticateToken, authorizeRoles('admin', 'pharmacist'), pharmacyController.updateMedicine);
router.post('/dispense', authenticateToken, authorizeRoles('admin', 'pharmacist'), pharmacyController.dispenseMedicines);
router.get('/sales', authenticateToken, authorizeRoles('admin', 'pharmacist', 'accountant'), pharmacyController.getSales);

module.exports = router;

