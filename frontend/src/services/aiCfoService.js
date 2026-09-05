export const getAiInsights = async () => {
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    healthScore: 82,
    breakdown: [
      { name: 'Profitability', score: 85, status: 'Strong' },
      { name: 'Payment Health', score: 70, status: 'Needs Attention' },
      { name: 'Expense Control', score: 78, status: 'Good' },
      { name: 'Sales Growth', score: 92, status: 'Excellent' },
    ],
    anomalies: [
      {
        id: 1,
        type: 'Purchase',
        reference: 'PO-2026-0042',
        amount: '₹5,00,000',
        expected: '₹50,000',
        difference: '+900%',
        severity: 'High',
        message: 'Transaction is significantly higher than the average purchase amount for this vendor.'
      },
      {
        id: 2,
        type: 'Duplicate',
        reference: 'INV-2026-0118',
        amount: '₹42,000',
        expected: 'N/A',
        difference: 'N/A',
        severity: 'Medium',
        message: 'Possible duplicate invoice. Similar amount and vendor billed 3 days ago.'
      }
    ],
    predefinedQuestions: [
      "What is my current profit?",
      "Why did profit decrease?",
      "Which product is most profitable?",
      "Who owes us money?",
      "Will we have enough cash next month?",
      "Are there any unusual expenses?"
    ]
  };
};

export const askAiQuestion = async (question) => {
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate AI thinking time

  // Very simple mocked responses for demo
  if (question.includes('profit decrease')) {
    return {
      answer: "Profit decreased by ₹3.2L this month. The main contributors were higher purchase costs for raw materials and increased delivery expenses. While revenue increased by 12.5%, these operational costs increased faster.",
      impact: {
        revenue: "+₹1.4L",
        costs: "-₹3.8L",
        expenses: "-₹0.8L"
      },
      recommendation: "Review vendor pricing for 'Premium Woods Ltd' and consolidate delivery routes.",
      relatedLink: "/reports/profitability",
      linkText: "View Profitability Report"
    };
  }
  
  if (question.includes('profitable')) {
    return {
      answer: "Office Chairs are currently your most profitable product, generating a 43% gross margin (₹1.8L profit on ₹4.2L revenue). Wooden Tables follow at 24% margin.",
      recommendation: "Consider increasing marketing spend for Office Chairs and negotiating better bulk rates for Wooden Table materials.",
      relatedLink: "/inventory",
      linkText: "View Product Breakdown"
    };
  }

  // Default fallback
  return {
    answer: "Based on your current financial data, your business health is strong at 82/100. However, I noticed some overdue receivables that need attention to maintain optimal cash flow.",
    recommendation: "Follow up on the ₹2.1L overdue payments in the next 48 hours.",
    relatedLink: "/sales",
    linkText: "View Receivables"
  };
};
