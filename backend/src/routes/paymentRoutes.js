import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import { validate } from '../middleware/validateMiddleware.js';
import { customerPaymentSchema, vendorPaymentSchema } from '../validators/paymentValidators.js';
import {
  getAllPayments,
  getCustomerPayments,
  getVendorPayments,
  createCustomerPayment,
  createVendorPayment,
  getOutstandingReceivables,
  getOutstandingPayables,
  getCashSummary,
  getBankSummary
} from '../controllers/paymentController.js';

const router = express.Router();

router.use(authenticateUser);

// Contact-only: view own payments and make payments
router.get('/my-payments', authorizeRoles(ROLES.CONTACT), async (req, res, next) => {
  req.query.contactId = req.user.contactId;
  return getCustomerPayments(req, res, next);
});

router.post('/make-payment', authorizeRoles(ROLES.CONTACT), validate(customerPaymentSchema), async (req, res, next) => {
  // Force contactId from token, not body
  req.body.contactId = req.user.contactId;
  return createCustomerPayment(req, res, next);
});

// Admin & Accountant from here
router.use(authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT));

router.get('/', getAllPayments);

router.route('/customer')
  .get(getCustomerPayments)
  .post(validate(customerPaymentSchema), createCustomerPayment);

router.route('/vendor')
  .get(getVendorPayments)
  .post(validate(vendorPaymentSchema), createVendorPayment);

router.get('/outstanding-receivables', getOutstandingReceivables);
router.get('/outstanding-payables', getOutstandingPayables);
router.get('/cash-summary', getCashSummary);
router.get('/bank-summary', getBankSummary);

export default router;
