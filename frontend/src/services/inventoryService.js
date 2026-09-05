export const getInventoryData = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    summary: {
      totalValue: '₹18,40,000',
      totalProducts: 48,
      lowStock: 3,
      slowMoving: 5,
      overstocked: 2,
    },
    products: [
      { id: 1, name: 'Office Chair - Ergonomic Pro', category: 'Seating', cost: '₹8,500', sellingPrice: '₹14,900', stock: 42, stockValue: '₹3,57,000', margin: 43 },
      { id: 2, name: 'Wooden Study Table', category: 'Tables', cost: '₹12,000', sellingPrice: '₹15,800', stock: 28, stockValue: '₹3,36,000', margin: 24 },
      { id: 3, name: 'L-Shaped Executive Desk', category: 'Tables', cost: '₹24,500', sellingPrice: '₹32,000', stock: 15, stockValue: '₹3,67,500', margin: 30 },
      { id: 4, name: '3-Seater Sofa (Fabric)', category: 'Sofas', cost: '₹28,000', sellingPrice: '₹31,000', stock: 8, stockValue: '₹2,24,000', margin: 10 },
      { id: 5, name: 'Dining Table (6-Seater)', category: 'Dining', cost: '₹18,000', sellingPrice: '₹24,500', stock: 3, stockValue: '₹54,000', margin: 36, lowStock: true },
      { id: 6, name: 'Filing Cabinet (3-Draw)', category: 'Storage', cost: '₹5,200', sellingPrice: '₹8,200', stock: 55, stockValue: '₹2,86,000', margin: 36, overstocked: true },
      { id: 7, name: 'Workstation Cluster (4-Seat)', category: 'Workstations', cost: '₹95,000', sellingPrice: '₹1,20,000', stock: 2, stockValue: '₹1,90,000', margin: 20, lowStock: true },
    ]
  };
};
