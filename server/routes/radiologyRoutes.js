const express = require('express');
const router = express.Router();
const radiologyController = require('../controllers/radiologyController');
const { authenticateToken } = require('../middleware/auth');

router.get('/stats', authenticateToken, radiologyController.getStats);
router.get('/', authenticateToken, radiologyController.getStudies);
router.get('/:id', authenticateToken, radiologyController.getStudyById);
router.post('/', authenticateToken, radiologyController.createStudy);
router.patch('/:id/report', authenticateToken, radiologyController.updateReport);

module.exports = router;
