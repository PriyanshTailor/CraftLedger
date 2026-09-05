import api from './api';

export const contactPortalService = {
  getDashboard: () => api.get('/contact/dashboard'),
  getMyProfile: () => api.get('/contact/profile'),
  updateMyProfile: (data) => api.patch('/contact/profile', data),
  getMyInvoices: () => api.get('/contact/invoices'),
  getMyInvoiceById: (id) => api.get(`/contact/invoices/${id}`),
  getMyBills: () => api.get('/contact/bills'),
  getMyBillById: (id) => api.get(`/contact/bills/${id}`),
  getMyPayments: () => api.get('/contact/payments'),
  getMyPaymentById: (id) => api.get(`/contact/payments/${id}`),
  getMyContract: () => api.get('/contact/contract'),
  simulatePayment: (data) => api.post('/contact/payments/simulate', data),
  getPaymentReceipt: (id) => api.get(`/contact/payments/${id}/receipt`),
};
