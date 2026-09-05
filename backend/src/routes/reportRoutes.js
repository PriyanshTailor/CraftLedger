import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import { getProfitLoss, getBalanceSheet, getCashFlow } from '../controllers/reportController.js';
import { getLedger, getTrialBalance } from '../controllers/accountingController.js';

const router = express.Router();
router.use(authenticateUser);

const bizRoles = [ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT];

router.get('/profit-loss',    authorizeRoles(...bizRoles), getProfitLoss);
router.get('/balance-sheet',  authorizeRoles(...bizRoles), getBalanceSheet);
router.get('/trial-balance',  authorizeRoles(...bizRoles), getTrialBalance);
router.get('/general-ledger', authorizeRoles(...bizRoles), getLedger);

// Business Owner only
router.get('/cash-flow',       authorizeRoles(ROLES.BUSINESS_OWNER), getCashFlow);
router.get('/budget-vs-actual',authorizeRoles(ROLES.BUSINESS_OWNER), (req, res) => {
  res.json({ success: true, data: [] });
});

export default router;
