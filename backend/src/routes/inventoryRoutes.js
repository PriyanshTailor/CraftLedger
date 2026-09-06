import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { inventoryAdjustmentSchema } from '../validators/inventoryValidators.js';
import {
  getInventoryOverview,
  getInventoryProducts,
  getInventoryProductById,
  getProductMovements,
  createAdjustment,
  getAdjustments,
  getLowStockProducts,
  getValuation,
  getProfitability,
  getSlowMovingInventory
} from '../controllers/inventoryController.js';

const router = express.Router();

router.use(authenticateUser);

router.get('/overview', getInventoryOverview);
router.get('/slow-moving', getSlowMovingInventory);

router.route('/products')
  .get(getInventoryProducts);

router.get('/products/:id', getInventoryProductById);
router.get('/products/:id/movements', getProductMovements);

router.route('/adjustments')
  .post(validate(inventoryAdjustmentSchema), createAdjustment)
  .get(getAdjustments);

router.get('/low-stock', getLowStockProducts);
router.get('/valuation', getValuation);
router.get('/profitability', getProfitability);

export default router;
