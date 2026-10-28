const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/', authenticateToken, authorizeRoles('admin'), userController.getUsers);
router.post('/', authenticateToken, authorizeRoles('admin'), userController.createUser);
router.patch('/:id/toggle-status', authenticateToken, authorizeRoles('admin'), userController.toggleStatus);

module.exports = router;

