const express = require('express');
const router = express.Router();
const emergencyController = require('../controllers/emergencyController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/', authenticateToken, emergencyController.getCases);
router.get('/:id', authenticateToken, emergencyController.getCaseById);
router.post('/', authenticateToken, emergencyController.createCase);
router.patch('/:id/status', authenticateToken, emergencyController.updateStatus);
router.post('/:id/transfer-ipd', authenticateToken, emergencyController.transferToIPD);

module.exports = router;

