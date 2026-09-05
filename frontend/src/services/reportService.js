import api from './api';

export const reportService = {
  getProfitLoss: (params) => api.get('/reports/profit-loss', { params }),
  getBalanceSheet: (params) => api.get('/reports/balance-sheet', { params }),
  getCashFlow: (params) => api.get('/reports/cash-flow', { params }),
  getTrialBalance: (params) => api.get('/reports/trial-balance', { params }),
  getGeneralLedger: (params) => api.get('/reports/general-ledger', { params }),
  getBudgetVsActual: (params) => api.get('/reports/budget-vs-actual', { params })
};
