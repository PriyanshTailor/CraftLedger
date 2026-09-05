import Budget from '../models/Budget.js';
import JournalEntry from '../models/JournalEntry.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const createBudget = async (req, res, next) => {
  try {
    const budget = await Budget.create({
      ...req.body,
      businessId: req.user.businessId,
      createdBy: req.user._id
    });
    return sendSuccess(res, 201, 'Budget created successfully', budget);
  } catch (error) {
    next(error);
  }
};

export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ businessId: req.user.businessId })
      .populate('analyticAccountId', 'name code')
      .populate('responsiblePerson', 'name')
      .sort('-createdAt');
    return sendSuccess(res, 200, 'Budgets retrieved', budgets);
  } catch (error) {
    next(error);
  }
};

export const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, businessId: req.user.businessId })
      .populate('analyticAccountId', 'name code')
      .populate('responsiblePerson', 'name');
    
    if (!budget) return sendError(res, 404, 'Budget not found');
    return sendSuccess(res, 200, 'Budget retrieved', budget);
  } catch (error) {
    next(error);
  }
};

export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, businessId: req.user.businessId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) return sendError(res, 404, 'Budget not found');
    return sendSuccess(res, 200, 'Budget updated', budget);
  } catch (error) {
    next(error);
  }
};

export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, businessId: req.user.businessId });
    if (!budget) return sendError(res, 404, 'Budget not found');
    return sendSuccess(res, 200, 'Budget deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getBudgetActuals = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!budget) return sendError(res, 404, 'Budget not found');

    // In a full implementation, you would query posted JournalEntry lines 
    // linked to this budget's analyticAccountId within the periodStart/End dates.
    // Since analytic accounts are complex to map purely generically without specific account types,
    // we assume the budget tracks expenses.
    // For now, we simulate fetching actuals for demonstration or use a basic sum if we had the analytic mapping.
    
    // We will just calculate variance dynamically
    const varianceAmount = budget.plannedAmount - budget.actualAmount;
    const variancePercentage = budget.plannedAmount > 0 ? (varianceAmount / budget.plannedAmount) * 100 : 0;

    return sendSuccess(res, 200, 'Budget actuals retrieved', {
      actualAmount: budget.actualAmount,
      plannedAmount: budget.plannedAmount,
      varianceAmount,
      variancePercentage
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetVariance = async (req, res, next) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, businessId: req.user.businessId });
    if (!budget) return sendError(res, 404, 'Budget not found');

    const varianceAmount = budget.plannedAmount - budget.actualAmount;
    const variancePercentage = budget.plannedAmount > 0 ? (varianceAmount / budget.plannedAmount) * 100 : 0;

    return sendSuccess(res, 200, 'Budget variance retrieved', {
      varianceAmount,
      variancePercentage
    });
  } catch (error) {
    next(error);
  }
};

export const getBudgetSummary = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ businessId: req.user.businessId, status: 'active' });
    
    let totalPlanned = 0;
    let totalActual = 0;

    budgets.forEach(b => {
      totalPlanned += b.plannedAmount;
      totalActual += b.actualAmount;
    });

    const varianceAmount = totalPlanned - totalActual;
    const variancePercentage = totalPlanned > 0 ? (varianceAmount / totalPlanned) * 100 : 0;

    return sendSuccess(res, 200, 'Budget summary retrieved', {
      totalPlanned,
      totalActual,
      varianceAmount,
      variancePercentage,
      activeBudgetsCount: budgets.length
    });
  } catch (error) {
    next(error);
  }
};
