import api from './api';

export const accountingService = {
  getJournalEntries: () => api.get('/accounting/journal-entries'),
  getJournalEntry: (id) => api.get(`/accounting/journal-entries/${id}`),
  createJournalEntry: (data) => api.post('/accounting/journal-entries', data),
  postJournalEntry: (id) => api.post(`/accounting/journal-entries/${id}/post`),
  reverseJournalEntry: (id) => api.post(`/accounting/journal-entries/${id}/reverse`),
  getLedger: (params) => api.get('/accounting/ledger', { params }),
  getTrialBalance: (params) => api.get('/accounting/trial-balance', { params }),
  
  // These map to master data, but fit logically here for the frontend
  getAccounts: () => api.get('/accounts'),
  createAccount: (data) => api.post('/accounts', data),
  getJournals: () => api.get('/journals')
};
