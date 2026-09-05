import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import {
  getHealthScore, getCashFlowForecast, getProfitLeaks,
  getExplainablePnL, getProductProfitability,
  getCustomerIntelligence, getVendorIntelligence, askCFO
} from '../controllers/intelligenceController.js';

const router = express.Router();
router.use(authenticateUser);
router.use(authorizeRoles(ROLES.BUSINESS_OWNER));

router.get('/health-score',          getHealthScore);
router.get('/cash-flow-forecast',    getCashFlowForecast);
router.get('/profit-leaks',          getProfitLeaks);
router.get('/explainable-pnl',       getExplainablePnL);
router.get('/product-profitability', getProductProfitability);
router.get('/customers/:id',         getCustomerIntelligence);
router.get('/vendors/:id',           getVendorIntelligence);
router.post('/ask',                  askCFO);

export default router;
