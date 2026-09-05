import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import { ROLES } from '../config/roles.js';
import { createBudgetSchema, updateBudgetSchema } from '../validators/budgetValidators.js';
import {
  createBudget, getBudgets, getBudgetById, updateBudget,
  deleteBudget, getBudgetActuals, getBudgetVariance, getBudgetSummary
} from '../controllers/budgetController.js';

const router = express.Router();
router.use(authenticateUser);
// Budgeting is Business Owner only
router.use(authorizeRoles(ROLES.BUSINESS_OWNER));

router.get('/summary', getBudgetSummary);
router.route('/').post(validate(createBudgetSchema), createBudget).get(getBudgets);
router.route('/:id')
  .get(getBudgetById)
  .patch(validate(updateBudgetSchema), updateBudget)
  .delete(deleteBudget);
router.get('/:id/actuals',  getBudgetActuals);
router.get('/:id/variance', getBudgetVariance);

export default router;
