const express = require('express');
const router = express.Router();
const bloodBankController = require('../controllers/bloodBankController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/inventory', authenticateToken, bloodBankController.getInventory);
router.post('/inventory', authenticateToken, authorizeRoles('admin', 'lab_technician'), bloodBankController.addBloodBag);
router.get('/donors', authenticateToken, bloodBankController.getDonors);
router.post('/donors', authenticateToken, authorizeRoles('admin', 'lab_technician', 'receptionist'), bloodBankController.registerDonor);
router.get('/requisitions', authenticateToken, bloodBankController.getRequisitions);
router.post('/requisitions', authenticateToken, bloodBankController.createRequisition);
router.patch('/requisitions/:id/issue', authenticateToken, authorizeRoles('admin', 'lab_technician'), bloodBankController.issueBloodBag);

module.exports = router;

