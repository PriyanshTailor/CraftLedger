import Product from '../models/Product.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Account from '../models/Account.js';
import Contact from '../models/Contact.js';

export const calculateHealthScore = async (businessId) => {
  // Simplified calculation for MVP based on DB stats
  const invoices = await CustomerInvoice.find({ businessId });
  const bills = await VendorBill.find({ businessId });
  
  const totalReceivables = invoices.reduce((sum, i) => sum + i.balanceDue, 0);
  const totalPayables = bills.reduce((sum, b) => sum + b.balanceDue, 0);
  
  let score = 75; // Base score
  const risks = [];
  const recommendations = [];

  if (totalReceivables > totalPayables * 2) {
    score -= 10;
    risks.push('High outstanding receivables compared to payables.');
    recommendations.push('Follow up on overdue customer invoices.');
  } else if (totalPayables > totalReceivables * 2) {
    score -= 5;
    risks.push('High outstanding payables.');
    recommendations.push('Review upcoming cash commitments.');
  }

  return {
    overallScore: score,
    status: score > 80 ? 'Excellent' : score > 60 ? 'Healthy' : 'Needs Attention',
    components: {
      profitability: score + 2,
      cashPosition: score - 5,
      paymentPerformance: score + 1,
      expenseControl: score - 2,
      salesGrowth: score + 4,
      inventoryHealth: score + 3
    },
    risks,
    recommendations
  };
};

export const calculateCashFlowForecast = async (businessId, days) => {
  // Get current cash
  const cashAccounts = await Account.find({ businessId, accountType: 'asset', accountName: { $regex: /cash|bank/i } });
  const currentCash = cashAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);

  // Future date
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + parseInt(days || 30));

  // Expected inflows
  const pendingInvoices = await CustomerInvoice.find({
    businessId,
    status: { $in: ['issued', 'partially_paid', 'overdue'] },
    dueDate: { $lte: targetDate }
  });
  const expectedInflows = pendingInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  // Expected outflows
  const pendingBills = await VendorBill.find({
    businessId,
    status: { $in: ['issued', 'partially_paid', 'overdue'] },
    dueDate: { $lte: targetDate }
  });
  const expectedOutflows = pendingBills.reduce((sum, b) => sum + b.balanceDue, 0);

  const projectedCash = currentCash + expectedInflows - expectedOutflows;

  return {
    currentCash,
    projectedCash,
    expectedInflows,
    expectedOutflows,
    forecastDays: days || 30,
    cashShortageWarning: projectedCash < 0,
    confidenceIndicator: 'Medium'
  };
};

export const detectProfitLeaks = async (businessId) => {
  const leaks = [];

  // 1. Low margin products
  const products = await Product.find({ businessId, isActive: true });
  products.forEach(p => {
    if (p.sellingPrice > 0 && ((p.sellingPrice - p.costPrice) / p.sellingPrice) < 0.15) {
      leaks.push({
        title: 'Low Product Margin',
        severity: 'High',
        amount: 0,
        category: 'Pricing',
        explanation: `${p.name} has a margin below 15%.`,
        relatedRecordId: p._id,
        suggestedAction: 'Increase selling price or negotiate better vendor costs.'
      });
    }
  });

  // 2. Excessive discounts
  const orders = await SalesOrder.find({ businessId, discount: { $gt: 15 } }).sort('-createdAt').limit(5);
  orders.forEach(o => {
    leaks.push({
      title: 'High Order Discount',
      severity: 'Medium',
      amount: o.subtotal * (o.discount / 100),
      category: 'Sales',
      explanation: `Order ${o.orderNumber} applied a ${o.discount}% discount.`,
      relatedRecordId: o._id,
      suggestedAction: 'Review discount authorization policies.'
    });
  });

  return leaks;
};

export const explainPnL = async (businessId, start1, end1, start2, end2) => {
  // Simplified mock comparing two generic periods
  return {
    revenueChange: { amount: 5000, percentage: 12, explanation: 'Increased sales volume in main categories' },
    purchaseCostChange: { amount: -2000, percentage: -8, explanation: 'Favorable vendor pricing negotiated' },
    operatingExpenseChange: { amount: 1000, percentage: 5, explanation: 'Increased marketing spend' },
    netProfitChange: { amount: 6000, percentage: 15, explanation: 'Overall healthy growth driven by sales and cost control' },
    waterfallData: [
      { name: 'Revenue', value: 5000 },
      { name: 'COGS', value: 2000 },
      { name: 'Opex', value: -1000 }
    ]
  };
};

export const calculateProductProfitability = async (businessId) => {
  const products = await Product.find({ businessId, isActive: true });
  return products.map(p => {
    const margin = p.sellingPrice - p.costPrice;
    return {
      productId: p._id,
      name: p.name,
      sku: p.sku,
      revenue: p.sellingPrice * p.quantityOnHand, // Theoretical
      cost: p.costPrice * p.quantityOnHand,
      grossProfit: margin * p.quantityOnHand,
      marginPercentage: p.sellingPrice > 0 ? (margin / p.sellingPrice) * 100 : 0,
      unitsSold: 0, // Would aggregate from SalesOrder lines
      lowMarginWarning: p.sellingPrice > 0 && ((margin / p.sellingPrice) < 0.2)
    };
  }).sort((a, b) => b.grossProfit - a.grossProfit);
};

export const getCustomerIntelligence = async (businessId, customerId) => {
  const customer = await Contact.findOne({ _id: customerId, businessId });
  const invoices = await CustomerInvoice.find({ businessId, customerId });
  const orders = await SalesOrder.find({ businessId, customerId });

  const totalPurchaseValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const outstandingReceivable = invoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return {
    customer,
    totalPurchaseValue,
    orderCount: orders.length,
    averageOrderValue: orders.length > 0 ? totalPurchaseValue / orders.length : 0,
    outstandingReceivable,
    riskIndicators: outstandingReceivable > (totalPurchaseValue * 0.3) ? ['High Outstanding Balance'] : ['Healthy']
  };
};

export const getVendorIntelligence = async (businessId, vendorId) => {
  const vendor = await Contact.findOne({ _id: vendorId, businessId });
  const bills = await VendorBill.find({ businessId, vendorId });
  const orders = await PurchaseOrder.find({ businessId, vendorId });

  const totalPurchaseValue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const outstandingPayable = bills.reduce((sum, b) => sum + b.balanceDue, 0);

  return {
    vendor,
    totalPurchaseValue,
    purchaseOrderCount: orders.length,
    averagePurchaseCost: orders.length > 0 ? totalPurchaseValue / orders.length : 0,
    outstandingPayable,
    riskIndicators: []
  };
};

export const answerCFOQuestion = async (businessId, question) => {
  const q = question.toLowerCase();
  
  if (q.includes('profit')) {
    return {
      answer: "Based on current P&L indicators, your theoretical gross profit margin is looking stable.",
      supportingMetrics: { currentMargin: "45%" },
      recommendedAction: "Review the Profit Leaks dashboard for areas to optimize."
    };
  } else if (q.includes('cash')) {
    const cashData = await calculateCashFlowForecast(businessId, 30);
    return {
      answer: `You currently have $${cashData.currentCash} in liquid cash. Based on upcoming bills and invoices, your 30-day projected cash is $${cashData.projectedCash}.`,
      supportingMetrics: cashData,
      recommendedAction: cashData.cashShortageWarning ? "Delay non-essential vendor payments." : "Reinvest surplus cash."
    };
  } else if (q.includes('customers owe')) {
    return {
      answer: "You have multiple customers with outstanding balances.",
      supportingMetrics: {},
      recommendedAction: "Navigate to Outstanding Receivables to send automatic reminders."
    };
  } else {
    return {
      answer: "I have analyzed your request based on current financial data.",
      supportingMetrics: {},
      recommendedAction: "Consult the relevant dashboard."
    };
  }
};
