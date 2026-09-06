import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import {
  getHealthScore, getCashFlowForecast, getSalesForecast, getProfitLeaks,
  getExplainablePnL, getProductProfitability,
  getCustomerIntelligence, getVendorIntelligence, askCFO,
  getSlowMovingInventory,
  getOperationalAnomalies,
  getProfitabilityRisk,
  getAiCfoOverview
} from '../controllers/intelligenceController.js';

const router = express.Router();
router.use(authenticateUser);
router.use(authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT));

router.get('/health-score',           getHealthScore);
router.get('/cash-flow-forecast',     getCashFlowForecast);
router.get('/sales-forecast',         getSalesForecast);
router.get('/slow-moving-inventory',  getSlowMovingInventory);
router.get('/anomalies',              getOperationalAnomalies);
router.get('/profitability-risk',     getProfitabilityRisk);
router.get('/profit-leaks',           getProfitLeaks);
router.get('/explainable-pnl',        getExplainablePnL);
router.get('/product-profitability',  getProductProfitability);
router.get('/customers/:id',          getCustomerIntelligence);
router.get('/vendors/:id',            getVendorIntelligence);
router.get('/ai-cfo/overview',        getAiCfoOverview);
router.post('/ask',                   askCFO);

export default router;
