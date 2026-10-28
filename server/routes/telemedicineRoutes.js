const express = require('express');
const router = express.Router();
const telemedicineController = require('../controllers/telemedicineController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stats', authenticateToken, telemedicineController.getStats);
router.get('/', authenticateToken, telemedicineController.getSessions);
router.get('/:id', authenticateToken, telemedicineController.getSessionById);
router.post('/', authenticateToken, telemedicineController.createSession);
router.patch('/:id', authenticateToken, telemedicineController.updateSession);

module.exports = router;
