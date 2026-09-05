import api from './api';

export const budgetService = {
  getSummary: () => api.get('/budgets/summary'),
  getBudgets: () => api.get('/budgets'),
  getBudget: (id) => api.get(`/budgets/${id}`),
  createBudget: (data) => api.post('/budgets', data),
  updateBudget: (id, data) => api.patch(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
  getActuals: (id) => api.get(`/budgets/${id}/actuals`),
  getVariance: (id) => api.get(`/budgets/${id}/variance`)
};
