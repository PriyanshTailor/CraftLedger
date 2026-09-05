export const getAccountingData = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    chartOfAccounts: [
      { code: '1000', name: 'Cash & Cash Equivalents', type: 'Asset', balance: '₹8,40,000' },
      { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: '₹5,70,000' },
      { code: '1200', name: 'Inventory', type: 'Asset', balance: '₹18,40,000' },
      { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: '₹3,20,000' },
      { code: '2100', name: 'Short-Term Loans', type: 'Liability', balance: '₹5,00,000' },
      { code: '3000', name: 'Owner Equity', type: 'Equity', balance: '₹24,30,000' },
      { code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: '₹42,50,000' },
      { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: '₹18,20,000' },
    ],
    recentJournalEntries: [
      { id: 'JE-2026-0041', date: '2026-09-04', reference: 'SO-2026-089', description: 'Invoice to Acme Corp', debit: '₹1,25,000', credit: '₹1,25,000', status: 'Posted' },
      { id: 'JE-2026-0042', date: '2026-09-03', reference: 'PO-2026-041', description: 'Bill from Premium Woods Ltd', debit: '₹5,00,000', credit: '₹5,00,000', status: 'Posted' },
      { id: 'JE-2026-0043', date: '2026-09-01', reference: 'PAY-2026-012', description: 'Payment received - Stark Industries', debit: '₹85,000', credit: '₹85,000', status: 'Posted' },
    ]
  };
};
