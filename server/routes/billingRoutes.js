const express = require('express');
const router = express.Router();
const billingController = require('../controllers/billingController');
const { authenticateToken } = require('../middleware/auth');
const { authorizeRoles } = require('../middleware/rbac');

router.get('/invoices', authenticateToken, billingController.getInvoices);
router.get('/invoices/:id', authenticateToken, billingController.getInvoiceById);
router.get('/pending/:patient_id', authenticateToken, authorizeRoles('admin', 'accountant'), billingController.getPendingChargesForPatient);
router.post('/invoices', authenticateToken, authorizeRoles('admin', 'accountant'), billingController.createInvoice);
router.post('/accrue-bed-rent', authenticateToken, authorizeRoles('admin', 'accountant'), billingController.accrueBedRent);
router.patch('/invoices/:id/payment', authenticateToken, authorizeRoles('admin', 'accountant', 'patient'), billingController.recordPayment);

module.exports = router;

