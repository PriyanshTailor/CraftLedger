import { sendSuccess, sendError } from '../utils/response.js';
import * as intelligenceService from '../services/intelligenceService.js';

export const getHealthScore = async (req, res, next) => {
  try {
    const data = await intelligenceService.calculateHealthScore(req.user.businessId);
    return sendSuccess(res, 200, 'Health score retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getCashFlowForecast = async (req, res, next) => {
  try {
    const days = req.query.days || 30;
    const data = await intelligenceService.calculateCashFlowForecast(req.user.businessId, days);
    return sendSuccess(res, 200, 'Cash flow forecast retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getSalesForecast = async (req, res, next) => {
  try {
    const days = req.query.days || 30;
    const data = await intelligenceService.calculateSalesForecast(req.user.businessId, days);
    return sendSuccess(res, 200, 'Sales and revenue forecast retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getProfitLeaks = async (req, res, next) => {
  try {
    const data = await intelligenceService.detectProfitLeaks(req.user.businessId);
    return sendSuccess(res, 200, 'Profit leaks retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getExplainablePnL = async (req, res, next) => {
  try {
    const { start1, end1, start2, end2 } = req.query;
    const data = await intelligenceService.explainPnL(req.user.businessId, start1, end1, start2, end2);
    return sendSuccess(res, 200, 'Explainable P&L retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getProductProfitability = async (req, res, next) => {
  try {
    const data = await intelligenceService.calculateProductProfitability(req.user.businessId);
    return sendSuccess(res, 200, 'Product profitability retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getCustomerIntelligence = async (req, res, next) => {
  try {
    const data = await intelligenceService.getCustomerIntelligence(req.user.businessId, req.params.id);
    return sendSuccess(res, 200, 'Customer intelligence retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getVendorIntelligence = async (req, res, next) => {
  try {
    const data = await intelligenceService.getVendorIntelligence(req.user.businessId, req.params.id);
    return sendSuccess(res, 200, 'Vendor intelligence retrieved', data);
  } catch (error) {
    next(error);
  }
};

export const getAiCfoOverview = async (req, res, next) => {
  try {
    const { getAiCfoOverview: fetchOverview } = await import('../services/aiCfoService.js');
    const data = await fetchOverview(req.user.businessId);
    return sendSuccess(res, 200, 'AI CFO Overview generated successfully', data);
  } catch (error) {
    next(error);
  }
};

export const askCFO = async (req, res, next) => {
  try {
    const { question, period, conversationId, scenarioParams } = req.body;
    if (!question) return sendError(res, 400, 'Question or decision to evaluate is required');

    // Strict role check: Contact role is never permitted to access AI CFO
    if (req.user.role === 'contact') {
      return sendError(res, 403, 'Access denied: Contacts cannot access the Virtual CFO');
    }

    const { evaluateCfoDecisionOrQuestion } = await import('../services/aiCfoService.js');
    const data = await evaluateCfoDecisionOrQuestion(
      req.user.businessId,
      req.user._id || req.user.id,
      question,
      { period, conversationId, scenarioParams }
    );
    return sendSuccess(res, 200, 'CFO Decision evaluated successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getSlowMovingInventory = async (req, res, next) => {
  try {
    const { horizonDays, holdingCostRate, categoryId, classification, search } = req.query;
    const data = await intelligenceService.calculateSlowMovingInventory(req.user.businessId, {
      horizonDays,
      holdingCostRate,
      categoryId,
      classification,
      search
    });
    return sendSuccess(res, 200, 'Slow-moving inventory analysis retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getOperationalAnomalies = async (req, res, next) => {
  try {
    const { detectOperationalAnomalies } = await import('../services/anomalyDetectionService.js');
    const data = await detectOperationalAnomalies(req.user.businessId);
    return sendSuccess(res, 200, 'Operational anomalies retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

export const getProfitabilityRisk = async (req, res, next) => {
  try {
    const { calculateProfitabilityRisk } = await import('../services/profitabilityRiskService.js');
    const { materialCostInflation } = req.query;
    const data = await calculateProfitabilityRisk(req.user.businessId, { materialCostInflation });
    return sendSuccess(res, 200, 'Profitability risk prediction retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};
