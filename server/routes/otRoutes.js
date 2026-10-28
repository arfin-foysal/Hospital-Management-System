const express = require('express');
const router = express.Router();
const otController = require('../controllers/otController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/theatres', authenticateToken, otController.getTheatres);
router.get('/surgeries', authenticateToken, otController.getSurgeries);
router.post('/surgeries', authenticateToken, authorizeRoles('admin', 'doctor'), otController.bookSurgery);
router.patch('/surgeries/:id/status', authenticateToken, authorizeRoles('admin', 'doctor'), otController.updateStatus);

module.exports = router;

