import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import { getDashboardSummary } from '../controllers/dashboardController.js';

const router = express.Router();

router.use(authenticateUser);

// Admin: full business dashboard
router.get('/summary', authorizeRoles(ROLES.BUSINESS_OWNER), getDashboardSummary);

// Accountant: operational dashboard (uses same controller but role is different)
router.get('/accountant-summary', authorizeRoles(ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT), getDashboardSummary);

export default router;
