import api from './api';

export const masterDataService = {
  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  restoreProduct: (id) => api.patch(`/products/${id}/restore`),
  
  // Contacts
  getContacts: (params) => api.get('/contacts', { params }),
  getContact: (id) => api.get(`/contacts/${id}`),
  createContact: (data) => api.post('/contacts', data),
  restoreContact: (id) => api.patch(`/contacts/${id}/restore`),
  
  // Accounts
  getAccounts: (params) => api.get('/accounts', { params }),
  
  // Product Categories
  getCategories: (params) => api.get('/product-categories', { params })
};
