const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const upload = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/catalog', authenticateToken, labController.getCatalog);
router.post('/catalog', authenticateToken, authorizeRoles('admin', 'lab_technician'), labController.addCatalogItem);
router.get('/requests', authenticateToken, labController.getRequests);
router.post('/requests', authenticateToken, authorizeRoles('admin', 'doctor', 'receptionist'), labController.createRequest);
router.put('/requests/:id/result', authenticateToken, authorizeRoles('admin', 'lab_technician'), upload.single('report_file'), labController.updateResult);

module.exports = router;

