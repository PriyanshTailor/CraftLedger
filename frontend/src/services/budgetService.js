export const getBudgetData = async () => {
  await new Promise(resolve => setTimeout(resolve, 400));

  return {
    budgets: [
      { id: 1, name: 'Procurement Budget', period: 'Sep 2026', planned: 500000, actual: 600000, responsible: 'Rahul Sharma' },
      { id: 2, name: 'Marketing Budget', period: 'Sep 2026', planned: 100000, actual: 82000, responsible: 'Priya Patel' },
      { id: 3, name: 'Operations Budget', period: 'Sep 2026', planned: 200000, actual: 215000, responsible: 'Ankit Joshi' },
      { id: 4, name: 'Salaries & HR', period: 'Sep 2026', planned: 350000, actual: 350000, responsible: 'HR Team' },
    ]
  };
};
