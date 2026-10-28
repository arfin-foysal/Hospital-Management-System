const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stats', authenticateToken, ambulanceController.getStats);
router.get('/trips', authenticateToken, ambulanceController.getTrips);
router.get('/trips/:id', authenticateToken, ambulanceController.getTripById);
router.post('/trips', authenticateToken, ambulanceController.dispatchAmbulance);
router.patch('/trips/:id/status', authenticateToken, ambulanceController.updateTripStatus);

router.get('/', authenticateToken, ambulanceController.getAmbulances);
router.get('/:id', authenticateToken, ambulanceController.getAmbulanceById);
router.post('/', authenticateToken, ambulanceController.createAmbulance);
router.put('/:id', authenticateToken, ambulanceController.updateAmbulance);

module.exports = router;

