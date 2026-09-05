import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { ROLES } from '../config/roles.js';
import { createPurchaseOrderSchema, updatePurchaseOrderSchema, receiveProductsSchema, recordVendorPaymentSchema } from '../validators/purchaseValidators.js';
import {
  createPurchaseOrder, getPurchaseOrders, getPurchaseOrderById,
  updatePurchaseOrder, deletePurchaseOrder, confirmPurchaseOrder,
  receiveProducts, generateBill, getBills, getBillById,
  recordVendorPayment, getBillPayments
} from '../controllers/purchaseController.js';

const router = express.Router();
router.use(authenticateUser);

// Customer: view only their own purchases/bills
router.get('/my-bills', authorizeRoles(ROLES.CONTACT), async (req, res, next) => {
  return getBills(req, res, next);
});

// Business Owner + Accountant from here
const bizRoles = [ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT];
router.use(authorizeRoles(...bizRoles));

router.route('/orders')
  .post(validate(createPurchaseOrderSchema), createPurchaseOrder)
  .get(getPurchaseOrders);
router.route('/orders/:id')
  .get(getPurchaseOrderById)
  .patch(validate(updatePurchaseOrderSchema), updatePurchaseOrder)
  .delete(deletePurchaseOrder);
router.post('/orders/:id/confirm', confirmPurchaseOrder);
router.post('/orders/:id/receive', validate(receiveProductsSchema), receiveProducts);
router.post('/orders/:id/generate-bill', generateBill);
router.route('/bills').get(getBills);
router.route('/bills/:id').get(getBillById);
router.route('/bills/:id/payments')
  .post(validate(recordVendorPaymentSchema), recordVendorPayment)
  .get(getBillPayments);

export default router;
