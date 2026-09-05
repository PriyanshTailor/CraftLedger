import api from './api';

export const salesService = {
  getOrders: () => api.get('/sales/orders'),
  getOrder: (id) => api.get(`/sales/orders/${id}`),
  createOrder: (data) => api.post('/sales/orders', data),
  updateOrder: (id, data) => api.patch(`/sales/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/sales/orders/${id}`),
  confirmOrder: (id) => api.post(`/sales/orders/${id}/confirm`),
  generateInvoice: (id) => api.post(`/sales/orders/${id}/generate-invoice`),
  
  getInvoices: () => api.get('/sales/invoices'),
  getInvoice: (id) => api.get(`/sales/invoices/${id}`),
  
  recordPayment: (invoiceId, data) => api.post(`/sales/invoices/${invoiceId}/payments`, data),
  getPayments: (invoiceId) => api.get(`/sales/invoices/${invoiceId}/payments`)
};
