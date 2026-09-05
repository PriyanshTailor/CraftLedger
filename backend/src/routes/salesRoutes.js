import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { ROLES } from '../config/roles.js';
import { createSalesOrderSchema, updateSalesOrderSchema, recordPaymentSchema } from '../validators/salesValidators.js';
import {
  createSalesOrder, getSalesOrders, getSalesOrderById,
  updateSalesOrder, deleteSalesOrder, confirmSalesOrder,
  generateInvoice, getInvoices, getInvoiceById, recordPayment, getInvoicePayments
} from '../controllers/salesController.js';

const router = express.Router();
router.use(authenticateUser);

// Customer: view only their own invoices
router.get('/my-invoices', authorizeRoles(ROLES.CONTACT), async (req, res, next) => {
  return getInvoices(req, res, next);
});

// Business Owner + Accountant from here
const bizRoles = [ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT];
router.use(authorizeRoles(...bizRoles));

router.route('/orders')
  .post(validate(createSalesOrderSchema), createSalesOrder)
  .get(getSalesOrders);
router.route('/orders/:id')
  .get(getSalesOrderById)
  .patch(validate(updateSalesOrderSchema), updateSalesOrder)
  .delete(deleteSalesOrder);
router.post('/orders/:id/confirm', confirmSalesOrder);
router.post('/orders/:id/generate-invoice', generateInvoice);
router.route('/invoices').get(getInvoices);
router.route('/invoices/:id').get(getInvoiceById);
router.route('/invoices/:id/payments')
  .post(validate(recordPaymentSchema), recordPayment)
  .get(getInvoicePayments);

export default router;
