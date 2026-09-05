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

export const askCFO = async (req, res, next) => {
  try {
    const { question } = req.body;
    if (!question) return sendError(res, 400, 'Question is required');
    
    const data = await intelligenceService.answerCFOQuestion(req.user.businessId, question);
    return sendSuccess(res, 200, 'CFO Answer generated', data);
  } catch (error) {
    next(error);
  }
};
