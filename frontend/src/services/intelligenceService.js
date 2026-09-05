import api from './api';

export const intelligenceService = {
  getHealthScore: () => api.get('/intelligence/health-score'),
  getCashFlowForecast: (params) => api.get('/intelligence/cash-flow-forecast', { params }),
  getProfitLeaks: () => api.get('/intelligence/profit-leaks'),
  getExplainablePnL: (params) => api.get('/intelligence/explainable-pnl', { params }),
  getProductProfitability: () => api.get('/intelligence/product-profitability'),
  getCustomerIntelligence: (id) => api.get(`/intelligence/customers/${id}`),
  getVendorIntelligence: (id) => api.get(`/intelligence/vendors/${id}`),
  askQuestion: (question) => api.post('/intelligence/ask', { question })
};
