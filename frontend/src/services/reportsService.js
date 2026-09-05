export const getReportsData = async () => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    profitAndLoss: {
      revenue: '₹42,50,000',
      cogs: '₹18,20,000',
      grossProfit: '₹24,30,000',
      operatingExpenses: '₹12,15,000',
      netProfit: '₹12,15,000',
      margin: '28.5%'
    }
  };
};
