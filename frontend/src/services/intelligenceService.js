import api from './api';

export const intelligenceService = {
  getHealthScore: () => api.get('/intelligence/health-score'),
  getCashFlowForecast: (params) => api.get('/intelligence/cash-flow-forecast', { params }),
  getSalesForecast: (params) => api.get('/intelligence/sales-forecast', { params }),
  getProfitLeaks: () => api.get('/intelligence/profit-leaks'),
  getExplainablePnL: (params) => api.get('/intelligence/explainable-pnl', { params }),
  getProductProfitability: () => api.get('/intelligence/product-profitability'),
  getCustomerIntelligence: (id) => api.get(`/intelligence/customers/${id}`),
  getVendorIntelligence: (id) => api.get(`/intelligence/vendors/${id}`),
  getSlowMovingInventory: (params) => api.get('/intelligence/slow-moving-inventory', { params }),
  getAnomalies: () => api.get('/intelligence/anomalies'),
  getProfitabilityRisk: (params) => api.get('/intelligence/profitability-risk', { params }),
  getAiCfoOverview: () => api.get('/intelligence/ai-cfo/overview'),
  askQuestion: (question, options = {}) => api.post('/intelligence/ask', { question, ...options })
};
