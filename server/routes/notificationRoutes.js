const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/logs', authenticateToken, authorizeRoles('admin'), notificationController.getLogs);
router.post('/send', authenticateToken, notificationController.sendNotification);

module.exports = router;

