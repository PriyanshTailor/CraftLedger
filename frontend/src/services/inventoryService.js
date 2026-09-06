import api from './api';

export const inventoryService = {
  getOverview: () => api.get('/inventory/overview'),
  getProducts: (params) => api.get('/inventory/products', { params }),
  getProduct: (id) => api.get(`/inventory/products/${id}`),
  getProductMovements: (id) => api.get(`/inventory/products/${id}/movements`),
  createAdjustment: (data) => api.post('/inventory/adjustments', data),
  getAdjustments: () => api.get('/inventory/adjustments'),
  getLowStock: () => api.get('/inventory/low-stock'),
  getValuation: () => api.get('/inventory/valuation'),
  getProfitability: () => api.get('/inventory/profitability'),
  getSlowMoving: (params) => api.get('/inventory/slow-moving', { params })
};
