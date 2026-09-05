export const getDashboardData = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    healthScore: 82,
    healthStatus: 'HEALTHY',
    kpis: {
      revenue: { value: '₹12.4L', change: 12.5, trend: 'up', comparison: 'vs previous month' },
      netProfit: { value: '₹4.1L', change: -4.2, trend: 'down', comparison: 'vs previous month' },
      cashAvailable: { value: '₹8.4L', status: 'Healthy' },
      receivables: { value: '₹5.7L', subtext: '₹2.1L overdue', warning: true },
      payables: { value: '₹3.2L', subtext: 'Next 15 days' },
      inventoryValue: { value: '₹18.4L', subtext: 'Optimal' }
    },
    financialPerformance: [
      { name: 'Jan', revenue: 9.2, expenses: 6.1, profit: 3.1 },
      { name: 'Feb', revenue: 10.5, expenses: 6.8, profit: 3.7 },
      { name: 'Mar', revenue: 11.2, expenses: 7.0, profit: 4.2 },
      { name: 'Apr', revenue: 12.0, expenses: 7.5, profit: 4.5 },
      { name: 'May', revenue: 11.8, expenses: 7.8, profit: 4.0 },
      { name: 'Jun', revenue: 12.4, expenses: 8.3, profit: 4.1 },
    ],
    cashFlowForecast: [
      { day: 'Today', cash: 13.0 },
      { day: 'Day 7', cash: 11.2 },
      { day: 'Day 15', cash: 8.4 },
      { day: 'Day 30', cash: 6.1 },
      { day: 'Day 45', cash: 3.2 },
      { day: 'Day 60', cash: -0.8 },
    ],
    profitLeaks: [
      { id: 1, category: 'Overdue Receivables', amount: '₹1.8L', severity: 'High Priority' },
      { id: 2, category: 'Unusual Purchase Price', amount: '₹72K', severity: 'Medium Priority' },
      { id: 3, category: 'Budget Overrun', amount: '₹45K', severity: 'Medium Priority' },
    ],
    productProfitability: [
      { id: 1, name: 'Office Chairs', revenue: '₹4.2L', cost: '₹2.4L', profit: '₹1.8L', margin: 43 },
      { id: 2, name: 'Wooden Tables', revenue: '₹3.8L', cost: '₹2.9L', profit: '₹0.9L', margin: 24 },
      { id: 3, name: 'Sofas', revenue: '₹5.1L', cost: '₹4.6L', profit: '₹0.5L', margin: 10 },
    ],
    inventoryInsights: {
      totalValue: '₹18.4L',
      lowStock: 3,
      slowMoving: 5
    }
  };
};
