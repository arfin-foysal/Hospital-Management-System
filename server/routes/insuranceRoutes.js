const express = require('express');
const router = express.Router();
const insuranceController = require('../controllers/insuranceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stats', authenticateToken, insuranceController.getStats);
router.get('/', authenticateToken, insuranceController.getClaims);
router.get('/:id', authenticateToken, insuranceController.getClaimById);
router.post('/', authenticateToken, insuranceController.createClaim);
router.patch('/:id', authenticateToken, insuranceController.updateClaim);

module.exports = router;
