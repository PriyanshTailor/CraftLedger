import api from './api';

export const purchaseService = {
  getOrders: () => api.get('/purchases/orders'),
  getOrder: (id) => api.get(`/purchases/orders/${id}`),
  createOrder: (data) => api.post('/purchases/orders', data),
  updateOrder: (id, data) => api.patch(`/purchases/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/purchases/orders/${id}`),
  confirmOrder: (id) => api.post(`/purchases/orders/${id}/confirm`),
  receiveProducts: (id, data) => api.post(`/purchases/orders/${id}/receive`, data),
  generateBill: (id) => api.post(`/purchases/orders/${id}/generate-bill`),
  
  getBills: () => api.get('/purchases/bills'),
  getBill: (id) => api.get(`/purchases/bills/${id}`),
  
  recordPayment: (billId, data) => api.post(`/purchases/bills/${billId}/payments`, data),
  getPayments: (billId) => api.get(`/purchases/bills/${billId}/payments`)
};
