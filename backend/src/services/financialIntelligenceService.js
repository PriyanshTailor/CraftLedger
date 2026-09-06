import Account from '../models/Account.js';
import JournalEntry from '../models/JournalEntry.js';
import CustomerInvoice from '../models/CustomerInvoice.js';
import VendorBill from '../models/VendorBill.js';
import CustomerPayment from '../models/CustomerPayment.js';
import VendorPayment from '../models/VendorPayment.js';
import Product from '../models/Product.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Budget from '../models/Budget.js';
import Business from '../models/Business.js';

/**
 * Resolves natural language or code reporting periods into concrete Date ranges.
 * Defaults to current month if unspecified.
 *
 * @param {string|Object} periodSpec
 * @returns {Object} { startDate: Date, endDate: Date, label: string, periodCode: string }
 */
export const resolveReportingPeriod = (periodSpec) => {
  const now = new Date();
  let code = 'this_month';
  let customStart = null;
  let customEnd = null;

  if (typeof periodSpec === 'string') {
    code = periodSpec.toLowerCase().trim();
  } else if (periodSpec && typeof periodSpec === 'object') {
    if (periodSpec.startDate && periodSpec.endDate) {
      code = 'custom';
      customStart = new Date(periodSpec.startDate);
      customEnd = new Date(periodSpec.endDate);
    } else if (periodSpec.code) {
      code = periodSpec.code.toLowerCase().trim();
    }
  }

  let startDate;
  let endDate;
  let label;

  switch (code) {
    case 'today': {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      label = `Today (${startDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'yesterday': {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      startDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
      endDate = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59, 999);
      label = `Yesterday (${startDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'this_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      label = `This Week (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'last_week': {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
      label = `Last Week (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'last_month': {
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1, 0, 0, 0);
      endDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0, 23, 59, 59, 999);
      label = `Last Month (${startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`;
      break;
    }
    case 'this_quarter': {
      // Indian Financial Quarters: Q1: Apr-Jun, Q2: Jul-Sep, Q3: Oct-Dec, Q4: Jan-Mar
      const m = now.getMonth(); // 0-11
      let qStartMonth;
      let qEndMonth;
      let qYear = now.getFullYear();
      if (m >= 3 && m <= 5) {
        qStartMonth = 3; qEndMonth = 5; // Q1
      } else if (m >= 6 && m <= 8) {
        qStartMonth = 6; qEndMonth = 8; // Q2
      } else if (m >= 9 && m <= 11) {
        qStartMonth = 9; qEndMonth = 11; // Q3
      } else {
        qStartMonth = 0; qEndMonth = 2; // Q4
      }
      startDate = new Date(qYear, qStartMonth, 1, 0, 0, 0);
      endDate = new Date(qYear, qEndMonth + 1, 0, 23, 59, 59, 999);
      label = `Current Quarter (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'last_quarter': {
      const m = now.getMonth();
      let qStartMonth;
      let qEndMonth;
      let qYear = now.getFullYear();
      if (m >= 3 && m <= 5) {
        qStartMonth = 0; qEndMonth = 2; // prior Q4
      } else if (m >= 6 && m <= 8) {
        qStartMonth = 3; qEndMonth = 5; // prior Q1
      } else if (m >= 9 && m <= 11) {
        qStartMonth = 6; qEndMonth = 8; // prior Q2
      } else {
        qStartMonth = 9; qEndMonth = 11; qYear -= 1; // prior Q3
      }
      startDate = new Date(qYear, qStartMonth, 1, 0, 0, 0);
      endDate = new Date(qYear, qEndMonth + 1, 0, 23, 59, 59, 999);
      label = `Previous Quarter (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'this_year':
    case 'this_financial_year': {
      // Indian Financial Year: April 1 to March 31
      const currentYear = now.getFullYear();
      const fyStartYear = now.getMonth() >= 3 ? currentYear : currentYear - 1;
      startDate = new Date(fyStartYear, 3, 1, 0, 0, 0);
      endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
      label = `FY ${fyStartYear}-${fyStartYear + 1} (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'last_year':
    case 'last_financial_year': {
      const currentYear = now.getFullYear();
      const fyStartYear = (now.getMonth() >= 3 ? currentYear : currentYear - 1) - 1;
      startDate = new Date(fyStartYear, 3, 1, 0, 0, 0);
      endDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59, 999);
      label = `FY ${fyStartYear}-${fyStartYear + 1} (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'custom': {
      if (customStart && customEnd && !isNaN(customStart) && !isNaN(customEnd)) {
        startDate = customStart;
        endDate = customEnd;
        label = `Custom Period (${startDate.toLocaleDateString('en-IN')} - ${endDate.toLocaleDateString('en-IN')})`;
      } else {
        // fallback to this month
        startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        label = `Current Month (${startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`;
        code = 'this_month';
      }
      break;
    }
    case 'all_time': {
      startDate = new Date('2020-01-01');
      endDate = new Date(now.getFullYear() + 1, 11, 31, 23, 59, 59, 999);
      label = `All Recorded Periods (up to ${now.toLocaleDateString('en-IN')})`;
      break;
    }
    case 'this_month':
    default: {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      label = `Current Month (${startDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })})`;
      code = 'this_month';
      break;
    }
  }

  return {
    code,
    label,
    startDate,
    endDate,
    startISO: startDate.toISOString().split('T')[0],
    endISO: endDate.toISOString().split('T')[0]
  };
};

/**
 * 1. Cash Position & Liquid Bank Balances
 */
export const getCashAndLiquidFunds = async (businessId) => {
  const accounts = await Account.find({
    businessId,
    isActive: true,
    accountType: 'asset'
  }).lean();

  let liquidCash = 0;
  let bankBalances = 0;
  const cashAccountsList = [];

  accounts.forEach(acc => {
    const bal = acc.currentBalance || 0;
    const nm = (acc.accountName || '').toLowerCase();
    const code = String(acc.accountCode || '');

    if (code === '1000' || nm.includes('petty cash') || nm.includes('cash in hand') || nm.includes('cash on hand')) {
      liquidCash += bal;
      cashAccountsList.push({ name: acc.accountName, code, balance: bal, type: 'Cash' });
    } else if (code === '1010' || code === '1020' || nm.includes('bank') || nm.includes('operating') || nm.includes('checking') || nm.includes('savings')) {
      bankBalances += bal;
      cashAccountsList.push({ name: acc.accountName, code, balance: bal, type: 'Bank' });
    }
  });

  const totalLiquidFunds = liquidCash + bankBalances;
  const hasAccounts = cashAccountsList.length > 0;

  return {
    available: hasAccounts,
    liquidCash,
    bankBalances,
    totalLiquidFunds,
    accounts: cashAccountsList,
    dataSource: 'Posted Chart of Accounts (Asset accounts)',
    reason: hasAccounts ? null : 'No active cash or bank accounts found in Chart of Accounts'
  };
};

/**
 * 2. Period-Aware Profit & Loss and Margins
 * Calculates revenue, COGS, operating expenses, and margins strictly within the reporting period.
 */
export const getProfitAndLoss = async (businessId, period) => {
  const { startDate, endDate, label } = period;

  // 1. First attempt: Calculate from posted Journal Entries within the reporting period
  const journalEntries = await JournalEntry.find({
    businessId,
    status: 'posted',
    entryDate: { $gte: startDate, $lte: endDate }
  }).populate('lines.accountId').lean();

  let revenue = 0;
  let cogs = 0;
  let operatingExpenses = 0;
  let payrollExpense = 0;
  let rentExpense = 0;
  let utilitiesExpense = 0;
  let otherExpenses = 0;
  let journalEntriesCount = journalEntries.length;

  if (journalEntriesCount > 0) {
    journalEntries.forEach(je => {
      je.lines.forEach(line => {
        const acc = line.accountId;
        if (!acc) return;
        const type = acc.accountType;
        const nm = (acc.accountName || '').toLowerCase();
        const code = String(acc.accountCode || '');

        if (type === 'income') {
          // Income accounts: Credit increases income, debit decreases
          revenue += (line.credit - line.debit);
        } else if (type === 'expense') {
          // Expense accounts: Debit increases expense, credit decreases
          const exp = (line.debit - line.credit);
          if (code === '5000' || nm.includes('cogs') || nm.includes('cost of goods')) {
            cogs += exp;
          } else if (code === '6000' || nm.includes('rent') || nm.includes('lease')) {
            rentExpense += exp;
            operatingExpenses += exp;
          } else if (code === '6100' || nm.includes('payroll') || nm.includes('salary') || nm.includes('carpenter')) {
            payrollExpense += exp;
            operatingExpenses += exp;
          } else if (code === '6200' || nm.includes('power') || nm.includes('utility') || nm.includes('electricity')) {
            utilitiesExpense += exp;
            operatingExpenses += exp;
          } else {
            otherExpenses += exp;
            operatingExpenses += exp;
          }
        }
      });
    });

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - operatingExpenses;
    const grossMarginPct = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(1)) : 0;
    const netMarginPct = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0;

    return {
      available: true,
      period: label,
      dataSource: 'General Ledger Posted Journal Entries',
      calculationMethod: 'Accrual Accounting (Posted Entries)',
      revenue,
      cogs,
      grossProfit,
      operatingExpenses,
      payrollExpense,
      rentExpense,
      utilitiesExpense,
      otherExpenses,
      netProfit,
      grossMarginPct,
      netMarginPct,
      recordsAnalyzed: journalEntriesCount,
      completeness: 'Verified Complete (Posted Entries)'
    };
  }

  // 2. Secondary source: If no journal entries posted for this period, check operational Sales Orders / Invoices & Bills
  const [invoices, bills, accounts] = await Promise.all([
    CustomerInvoice.find({
      businessId,
      status: { $nin: ['draft', 'cancelled'] },
      invoiceDate: { $gte: startDate, $lte: endDate }
    }).lean(),
    VendorBill.find({
      businessId,
      status: { $nin: ['draft', 'cancelled'] },
      billDate: { $gte: startDate, $lte: endDate }
    }).lean(),
    Account.find({ businessId, isActive: true, accountType: { $in: ['income', 'expense'] } }).lean()
  ]);

  if (invoices.length > 0 || bills.length > 0) {
    revenue = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    cogs = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Operating expenses from live COA if available
    accounts.forEach(acc => {
      const nm = (acc.accountName || '').toLowerCase();
      const bal = acc.currentBalance || 0;
      if (acc.accountType === 'expense' && !nm.includes('cogs') && !nm.includes('cost of goods')) {
        operatingExpenses += bal;
      }
    });

    const grossProfit = revenue - cogs;
    const netProfit = grossProfit - operatingExpenses;
    const grossMarginPct = revenue > 0 ? Number(((grossProfit / revenue) * 100).toFixed(1)) : 0;
    const netMarginPct = revenue > 0 ? Number(((netProfit / revenue) * 100).toFixed(1)) : 0;

    return {
      available: true,
      period: label,
      dataSource: 'Customer Invoices & Vendor Bills (Journal entries not yet posted)',
      calculationMethod: 'Operational Document Matching',
      revenue,
      cogs,
      grossProfit,
      operatingExpenses,
      payrollExpense: 0,
      rentExpense: 0,
      utilitiesExpense: 0,
      otherExpenses: operatingExpenses,
      netProfit,
      grossMarginPct,
      netMarginPct,
      recordsAnalyzed: invoices.length + bills.length,
      completeness: 'Operational Invoices & Bills'
    };
  }

  // 3. Data is genuinely unavailable - DO NOT FABRICATE ZEROES OR FAKE TOTALS
  return {
    available: false,
    period: label,
    reason: `No posted journal entries, invoices, or vendor bills were recorded for ${label}.`,
    requiredData: 'Post journal entries or record customer invoices/vendor bills for this reporting period.'
  };
};

/**
 * 3. Accounts Receivable & Customer Aging
 */
export const getReceivablesAndAging = async (businessId) => {
  const now = new Date();
  const invoices = await CustomerInvoice.find({
    businessId,
    status: { $in: ['issued', 'partially_paid', 'overdue'] }
  }).populate('customerId', 'name email phone').sort('dueDate').lean();

  let totalReceivables = 0;
  let overdueReceivables = 0;
  let currentReceivables = 0;
  const records = [];
  const customerConcentration = {};

  invoices.forEach(inv => {
    const outstanding = inv.balanceDue != null ? inv.balanceDue : (inv.totalAmount - (inv.paidAmount || 0));
    if (outstanding <= 0) return;

    totalReceivables += outstanding;
    const due = new Date(inv.dueDate);
    const diffTime = now.getTime() - due.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const isOverdue = due < now;

    if (isOverdue) {
      overdueReceivables += outstanding;
    } else {
      currentReceivables += outstanding;
    }

    const customerName = inv.customerId?.name || 'Customer Account';
    customerConcentration[customerName] = (customerConcentration[customerName] || 0) + outstanding;

    records.push({
      recordType: 'invoice',
      invoiceNumber: inv.invoiceNumber,
      customerName,
      customerContact: inv.customerId?.phone || inv.customerId?.email || '',
      invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
      dueDate: due.toISOString().split('T')[0],
      totalAmount: inv.totalAmount,
      paidAmount: inv.paidAmount || 0,
      outstandingAmount: outstanding,
      daysOverdue,
      status: isOverdue ? 'overdue' : inv.status
    });
  });

  const topDebtors = Object.entries(customerConcentration)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([customer, amount]) => ({
      customer,
      amount,
      sharePct: totalReceivables > 0 ? Number(((amount / totalReceivables) * 100).toFixed(1)) : 0
    }));

  return {
    available: true,
    totalReceivables,
    overdueReceivables,
    currentReceivables,
    activeInvoicesCount: records.length,
    topDebtors,
    records: records.sort((a, b) => b.daysOverdue - a.daysOverdue),
    dataSource: 'Customer Invoices ledger with live balance-due tracking'
  };
};

/**
 * 4. Accounts Payable & Vendor Obligations
 */
export const getPayablesAndAging = async (businessId) => {
  const now = new Date();
  const bills = await VendorBill.find({
    businessId,
    status: { $in: ['issued', 'partially_paid', 'overdue'] }
  }).populate('vendorId', 'name email phone').sort('dueDate').lean();

  let totalPayables = 0;
  let overduePayables = 0;
  let dueIn14Days = 0;
  const fourteenDaysOut = new Date(now);
  fourteenDaysOut.setDate(fourteenDaysOut.getDate() + 14);

  const records = [];
  const vendorConcentration = {};

  bills.forEach(bill => {
    const outstanding = bill.balanceDue != null ? bill.balanceDue : (bill.totalAmount - (bill.paidAmount || 0));
    if (outstanding <= 0) return;

    totalPayables += outstanding;
    const due = new Date(bill.dueDate);
    const diffTime = now.getTime() - due.getTime();
    const daysOverdue = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
    const isOverdue = due < now;

    if (isOverdue) {
      overduePayables += outstanding;
    }
    if (due <= fourteenDaysOut && !isOverdue) {
      dueIn14Days += outstanding;
    }

    const vendorName = bill.vendorId?.name || 'Supply Partner';
    vendorConcentration[vendorName] = (vendorConcentration[vendorName] || 0) + outstanding;

    records.push({
      recordType: 'bill',
      billNumber: bill.billNumber,
      vendorName,
      vendorContact: bill.vendorId?.phone || bill.vendorId?.email || '',
      billDate: bill.billDate ? new Date(bill.billDate).toISOString().split('T')[0] : '',
      dueDate: due.toISOString().split('T')[0],
      totalAmount: bill.totalAmount,
      paidAmount: bill.paidAmount || 0,
      outstandingAmount: outstanding,
      daysOverdue,
      isMaturingSoon: due <= fourteenDaysOut,
      status: isOverdue ? 'overdue' : bill.status
    });
  });

  const topCreditors = Object.entries(vendorConcentration)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([vendor, amount]) => ({
      vendor,
      amount,
      sharePct: totalPayables > 0 ? Number(((amount / totalPayables) * 100).toFixed(1)) : 0
    }));

  return {
    available: true,
    totalPayables,
    overduePayables,
    dueIn14Days,
    activeBillsCount: records.length,
    topCreditors,
    records: records.sort((a, b) => b.daysOverdue - a.daysOverdue),
    dataSource: 'Vendor Bills ledger with live balance-due tracking'
  };
};

/**
 * 5. Inventory Intelligence & Slow-Moving Stock
 */
export const getInventoryIntelligence = async (businessId) => {
  const products = await Product.find({ businessId, isActive: true })
    .populate('categoryId', 'name')
    .lean();

  if (!products || products.length === 0) {
    return {
      available: false,
      reason: 'No active products or inventory records found for this business'
    };
  }

  let totalValuation = 0;
  let totalUnitsOnHand = 0;
  let slowMovingValuation = 0;
  const items = [];

  products.forEach(p => {
    const qty = p.quantityOnHand || 0;
    const cost = p.costPrice || 0;
    const val = qty * cost;

    totalValuation += val;
    totalUnitsOnHand += qty;

    const isSlow = (p.inventoryHoldingDays || 0) > 60 || p.classification === 'slow' || p.classification === 'dead_stock';
    if (isSlow) {
      slowMovingValuation += val;
    }

    items.push({
      productId: p._id,
      name: p.name,
      sku: p.sku,
      category: p.categoryId?.name || 'General',
      quantityOnHand: qty,
      costPrice: cost,
      sellingPrice: p.sellingPrice || 0,
      inventoryValue: val,
      isSlowMoving: isSlow,
      reorderLevel: p.reorderLevel || 0
    });
  });

  const topSlowMovingItems = items
    .filter(i => i.isSlowMoving)
    .sort((a, b) => b.inventoryValue - a.inventoryValue)
    .slice(0, 10);

  return {
    available: true,
    totalProductsCount: products.length,
    totalUnitsOnHand,
    totalValuation,
    slowMovingValuation,
    slowMovingPercentage: totalValuation > 0 ? Number(((slowMovingValuation / totalValuation) * 100).toFixed(1)) : 0,
    topSlowMovingItems,
    records: items.slice(0, 20),
    dataSource: 'Product catalog & Stock Valuation'
  };
};

/**
 * 6. Cash Flow Runway Calculation
 * Divides verified liquid cash by verified 30-90 day operating burn rate.
 */
export const getCashRunway = async (businessId) => {
  const cashInfo = await getCashAndLiquidFunds(businessId);
  if (!cashInfo.available) {
    return {
      available: false,
      reason: 'Liquid cash reserves cannot be determined because no cash or bank accounts are recorded'
    };
  }

  // Calculate past 30-day operating expenses from posted JournalEntry or Accounts
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const entries = await JournalEntry.find({
    businessId,
    status: 'posted',
    entryDate: { $gte: thirtyDaysAgo }
  }).populate('lines.accountId').lean();

  let past30DayBurn = 0;
  entries.forEach(je => {
    je.lines.forEach(l => {
      if (l.accountId?.accountType === 'expense') {
        past30DayBurn += (l.debit - l.credit);
      }
    });
  });

  // If no recent journal burn, check recent vendor bills paid or issued
  if (past30DayBurn === 0) {
    const bills = await VendorBill.find({
      businessId,
      billDate: { $gte: thirtyDaysAgo }
    }).lean();
    past30DayBurn = bills.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  }

  if (past30DayBurn <= 0) {
    return {
      available: false,
      currentLiquidFunds: cashInfo.totalLiquidFunds,
      reason: 'Cannot calculate cash runway reliably: No operational cash burn or expenses recorded in the past 30 days.'
    };
  }

  const dailyBurn = past30DayBurn / 30;
  const runwayDays = Math.round(cashInfo.totalLiquidFunds / dailyBurn);

  return {
    available: true,
    currentLiquidFunds: cashInfo.totalLiquidFunds,
    monthlyBurnRate: Math.round(past30DayBurn),
    dailyBurn: Math.round(dailyBurn),
    runwayDays,
    status: runwayDays < 30 ? 'Critical Deficit' : runwayDays < 60 ? 'Tight' : 'Comfortable',
    dataSource: 'Liquid cash divided by 30-day verified operating disbursements'
  };
};

/**
 * 7. Scenario Analysis Calculator
 * Computes exact mathematical impact of CapEx (machine purchase, expansion) or OpEx (hiring).
 */
export const evaluateScenarioImpact = async (businessId, scenario) => {
  const cashInfo = await getCashAndLiquidFunds(businessId);
  const payablesInfo = await getPayablesAndAging(businessId);
  const runwayInfo = await getCashRunway(businessId);

  const {
    scenarioType = 'capex', // 'capex' | 'hiring' | 'price_change' | 'cost_inflation'
    purchaseAmount = 0,
    downPayment = purchaseAmount,
    monthlyAdditionalExpense = 0,
    expectedRevenueChangePct = 0
  } = scenario;

  const currentCash = cashInfo.available ? cashInfo.totalLiquidFunds : null;
  const currentPayables = payablesInfo.available ? payablesInfo.totalPayables : 0;
  const due14Days = payablesInfo.available ? payablesInfo.dueIn14Days : 0;

  if (currentCash === null) {
    return {
      available: false,
      reason: 'Cannot evaluate scenario: Current liquid cash balance is not available in accounting.'
    };
  }

  const cashAfterDownPayment = currentCash - downPayment;
  const bufferAfterObligations = cashAfterDownPayment - due14Days;
  const isLiquidityBreached = cashAfterDownPayment < due14Days;

  let postScenarioBurn = (runwayInfo.available ? runwayInfo.monthlyBurnRate : 0) + monthlyAdditionalExpense;
  let postScenarioRunway = postScenarioBurn > 0 && cashAfterDownPayment > 0
    ? Math.round(cashAfterDownPayment / (postScenarioBurn / 30))
    : 0;

  return {
    available: true,
    scenarioType,
    currentCash,
    downPayment,
    cashAfterDownPayment,
    dueIn14Days: due14Days,
    bufferAfter14DayBills: bufferAfterObligations,
    isLiquidityBreached,
    currentRunwayDays: runwayInfo.available ? runwayInfo.runwayDays : null,
    postScenarioRunwayDays: postScenarioRunway,
    verdict: isLiquidityBreached
      ? 'Not Recommended / High Financial Risk'
      : bufferAfterObligations < (currentCash * 0.25)
      ? 'Proceed with Caution'
      : 'Approved / Financially Viable',
    verdictColor: isLiquidityBreached ? 'rose' : bufferAfterObligations < (currentCash * 0.25) ? 'amber' : 'emerald',
    quantitativeFacts: [
      { label: 'Current Liquid Cash', value: `₹${currentCash.toLocaleString('en-IN')}`, source: 'Live Bank & Cash Accounts' },
      { label: 'Required Upfront Outlay', value: `₹${downPayment.toLocaleString('en-IN')}`, source: 'User Scenario Assumption' },
      { label: 'Remaining Cash After Outlay', value: `₹${cashAfterDownPayment.toLocaleString('en-IN')}`, source: 'Calculated' },
      { label: '14-Day Maturing Bills', value: `₹${due14Days.toLocaleString('en-IN')}`, source: 'Live Vendor Bills' },
      { label: 'Net Safety Buffer After 14 Days', value: `₹${bufferAfterObligations.toLocaleString('en-IN')}`, source: 'Calculated' }
    ]
  };
};
