export const getSalesOrders = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    { id: 'SO-2026-089', customer: 'Acme Corp', date: '2026-09-01', total: '₹1,25,000', status: 'Invoiced', paymentStatus: 'Paid' },
    { id: 'SO-2026-090', customer: 'Globex Inc', date: '2026-09-02', total: '₹45,500', status: 'Confirmed', paymentStatus: 'Pending' },
    { id: 'SO-2026-091', customer: 'Initech', date: '2026-09-04', total: '₹2,10,000', status: 'Draft', paymentStatus: 'Unpaid' },
    { id: 'SO-2026-092', customer: 'Stark Industries', date: '2026-09-05', total: '₹85,000', status: 'Confirmed', paymentStatus: 'Pending' },
  ];
};

export const getPurchaseOrders = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  return [
    { id: 'PO-2026-041', vendor: 'Premium Woods Ltd', date: '2026-08-28', total: '₹5,00,000', status: 'Received', paymentStatus: 'Paid' },
    { id: 'PO-2026-042', vendor: 'MetalWorks India', date: '2026-09-01', total: '₹1,20,000', status: 'Confirmed', paymentStatus: 'Pending' },
    { id: 'PO-2026-043', vendor: 'Fabric Co', date: '2026-09-03', total: '₹75,000', status: 'Draft', paymentStatus: 'Unpaid' },
  ];
};
