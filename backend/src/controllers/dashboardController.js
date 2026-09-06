import Account from '../models/Account.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import Product from '../models/Product.js';
import JournalEntry from '../models/JournalEntry.js';
import { sendSuccess } from '../utils/response.js';
import { calculateHealthScore, calculateCashFlowForecast, detectProfitLeaks, calculateProductProfitability, calculateSlowMovingInventory } from '../services/intelligenceService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const businessId = req.user.businessId;

    // Use Promise.all to fetch distinct operational domains concurrently
    const [
      healthScore,
      cashFlowForecast,
      profitLeaks,
      productProfitability,
      slowMovingData,
      accounts,
      recentTransactions,
      outstandingInvoices,
      outstandingBills
    ] = await Promise.all([
      calculateHealthScore(businessId),
      calculateCashFlowForecast(businessId, 30),
      detectProfitLeaks(businessId),
      calculateProductProfitability(businessId),
      calculateSlowMovingInventory(businessId, { horizonDays: 90 }),
      Account.find({ businessId }).lean(),
      JournalEntry.find({ businessId, status: 'posted' }).sort('-entryDate -createdAt').limit(5).lean(),
      CustomerInvoice.find({ businessId, status: { $in: ['issued', 'partially_paid', 'overdue'] } }).sort('dueDate').limit(5).populate('customerId', 'name').lean(),
      VendorBill.find({ businessId, status: { $in: ['issued', 'partially_paid', 'overdue'] } }).sort('dueDate').limit(5).populate('vendorId', 'name').lean()
    ]);

    // Aggregate Financial Metrics from Accounts
    let revenue = 0;
    let expenses = 0;
    let availableCash = 0;
    let receivables = 0;
    let payables = 0;
    let inventoryValue = 0;

    accounts.forEach(acc => {
      const name = acc.accountName.toLowerCase();
      const balance = acc.currentBalance;

      if (acc.accountType === 'income') revenue += balance;
      if (acc.accountType === 'expense') expenses += balance;
      if (acc.accountType === 'asset') {
        if (name.includes('cash') || name.includes('bank')) availableCash += balance;
        if (name.includes('receivable') || name.includes('debtor')) receivables += balance;
        if (name.includes('inventory') || name.includes('stock')) inventoryValue += balance;
      }
      if (acc.accountType === 'liability') {
        if (name.includes('payable') || name.includes('creditor')) payables += balance;
      }
    });

    const netProfit = revenue - expenses;

    // Construct frontend-friendly response
    const dashboardData = {
      metrics: {
        revenue,
        revenueTrend: 8.5, // Mock trend for MVP
        netProfit,
        profitTrend: 12.2, // Mock trend for MVP
        availableCash,
        receivables,
        payables,
        inventoryValue
      },
      health: {
        score: healthScore.overallScore,
        status: healthScore.status,
        components: healthScore.components
      },
      financialPerformance: [
        // Mock historical data for the chart since we don't have enough past months generated natively yet
        { month: 'Jan', revenue: revenue * 0.8, profit: netProfit * 0.7 },
        { month: 'Feb', revenue: revenue * 0.85, profit: netProfit * 0.75 },
        { month: 'Mar', revenue: revenue * 0.9, profit: netProfit * 0.8 },
        { month: 'Apr', revenue: revenue * 1.1, profit: netProfit * 1.1 },
        { month: 'May', revenue: revenue * 1.05, profit: netProfit * 1.05 },
        { month: 'Jun', revenue, profit: netProfit }
      ],
      cashFlowForecast: {
        currentCash: cashFlowForecast.currentCash,
        expectedInflows: cashFlowForecast.expectedInflows,
        expectedOutflows: cashFlowForecast.expectedOutflows,
        projectedCash: cashFlowForecast.projectedCash,
        warning: cashFlowForecast.cashShortageWarning
      },
      aiInsights: [
        { type: 'info', message: 'Gross margin is maintaining healthy levels above 40%.' },
        healthScore.risks.length > 0 ? { type: 'warning', message: healthScore.risks[0] } : null,
        healthScore.recommendations.length > 0 ? { type: 'success', message: healthScore.recommendations[0] } : null
      ].filter(Boolean),
      profitLeaks: (Array.isArray(profitLeaks) ? profitLeaks : (profitLeaks?.leaks || [])).slice(0, 4), // Top 4 leaks
      productProfitability: productProfitability.slice(0, 5), // Top 5 products
      recentTransactions: recentTransactions.map(tx => ({
        id: tx._id,
        date: tx.entryDate,
        description: tx.description,
        amount: tx.totalDebit
      })),
      outstandingInvoices: outstandingInvoices.map(inv => ({
        id: inv._id,
        number: inv.invoiceNumber,
        customer: inv.customerId ? inv.customerId.name : 'Unknown',
        amount: inv.balanceDue,
        dueDate: inv.dueDate
      })),
      upcomingPayments: outstandingBills.map(bill => ({
        id: bill._id,
        number: bill.billNumber,
        vendor: bill.vendorId ? bill.vendorId.name : 'Unknown',
        amount: bill.balanceDue,
        dueDate: bill.dueDate
      })),
      inventoryInsights: {
        totalValue: inventoryValue || slowMovingData.totalInventoryValue,
        slowMoving: slowMovingData.slowMovingCount + slowMovingData.deadStockCount,
        deadStock: slowMovingData.deadStockCount,
        lowStock: slowMovingData.lowStockCount,
        tiedUpCapital: slowMovingData.totalAtRiskCapital,
        annualCarryingCostWaste: slowMovingData.annualCarryingCostWaste
      }
    };

    return sendSuccess(res, 200, 'Dashboard summary retrieved successfully', dashboardData);
  } catch (error) {
    next(error);
  }
};
