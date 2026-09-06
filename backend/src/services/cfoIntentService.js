import {
  resolveReportingPeriod,
  getCashAndLiquidFunds,
  getProfitAndLoss,
  getReceivablesAndAging,
  getPayablesAndAging,
  getInventoryIntelligence,
  getCashRunway,
  evaluateScenarioImpact
} from './financialIntelligenceService.js';

/**
 * Classifies user question into a specific financial intent and extracts parameters.
 *
 * @param {string} question
 * @param {Object} overrideParams
 * @returns {Object} { intent, periodSpec, scenarioParams }
 */
export const classifyQuestionIntent = (question, overrideParams = {}) => {
  const q = (question || '').toLowerCase().trim();

  // 1. Detect natural language period in question if not explicitly provided
  let detectedPeriod = overrideParams.period || null;
  if (!detectedPeriod) {
    if (q.includes('last month') || q.includes('previous month')) detectedPeriod = 'last_month';
    else if (q.includes('this month') || q.includes('current month')) detectedPeriod = 'this_month';
    else if (q.includes('last quarter') || q.includes('previous quarter')) detectedPeriod = 'last_quarter';
    else if (q.includes('this quarter') || q.includes('current quarter')) detectedPeriod = 'this_quarter';
    else if (q.includes('last year') || q.includes('last fy') || q.includes('previous year')) detectedPeriod = 'last_year';
    else if (q.includes('this year') || q.includes('this fy') || q.includes('current year')) detectedPeriod = 'this_year';
    else if (q.includes('yesterday')) detectedPeriod = 'yesterday';
    else if (q.includes('today')) detectedPeriod = 'today';
    else if (q.includes('last week')) detectedPeriod = 'last_week';
    else if (q.includes('this week')) detectedPeriod = 'this_week';
    else detectedPeriod = 'this_month'; // Default
  }

  // 2. Detect Scenario Analysis (CapEx, Hiring, Inflation)
  const isCapEx = (q.includes('buy') || q.includes('invest') || q.includes('purchase') || q.includes('machine') || q.includes('cnc') || q.includes('router') || q.includes('vehicle') || q.includes('equipment')) && !q.includes('which vendor');
  const isHiring = q.includes('hire') || q.includes('carpenter') || q.includes('recruit') || q.includes('staff') || q.includes('payroll expansion') || q.includes('salary');

  if (isCapEx || isHiring || q.includes('what if') || q.includes('can we afford') || q.includes('can i afford') || overrideParams.scenarioParams) {
    // Extract monetary amount if mentioned in question e.g. "₹10L", "8 lakh", "500000", "10,00,000"
    let extractedAmount = overrideParams.scenarioParams?.purchaseAmount || 0;
    if (!extractedAmount) {
      const matchLakh = q.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lac|l\b)/i);
      const matchCrore = q.match(/(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?)\s*(?:crore|cr\b)/i);
      const matchNum = q.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})*(?:\.\d+)?|\d{5,})/i);

      if (matchLakh) {
        extractedAmount = parseFloat(matchLakh[1]) * 100000;
      } else if (matchCrore) {
        extractedAmount = parseFloat(matchCrore[1]) * 10000000;
      } else if (matchNum) {
        const raw = matchNum[1].replace(/,/g, '');
        extractedAmount = parseFloat(raw);
      }
    }

    return {
      intent: 'scenario_analysis',
      periodSpec: detectedPeriod,
      scenarioParams: {
        scenarioType: isHiring ? 'hiring' : 'capex',
        purchaseAmount: extractedAmount || (isHiring ? 60000 : 800000),
        downPayment: overrideParams.scenarioParams?.downPayment || extractedAmount || (isHiring ? 60000 : 800000),
        monthlyAdditionalExpense: isHiring ? (extractedAmount || 60000) : 0,
        ...overrideParams.scenarioParams
      }
    };
  }

  // 3. Receivables & Debtors
  if (q.includes('customer') || q.includes('owe') || q.includes('receivable') || q.includes('debtor') || q.includes('unpaid invoice') || q.includes('due invoice') || q.includes('overdue payment') || q.includes('who owes')) {
    return { intent: 'receivables', periodSpec: detectedPeriod };
  }

  // 4. Payables & Creditors & Vendor Obligations
  if (q.includes('vendor') || q.includes('supplier') || q.includes('payable') || q.includes('creditor') || q.includes('bill') || q.includes('due in 14') || q.includes('pay first') || q.includes('we owe')) {
    return { intent: 'payables', periodSpec: detectedPeriod };
  }

  // 5. Cash Position & Bank Balance
  if (q.includes('cash') || q.includes('bank') || q.includes('liquid') || q.includes('funds') || q.includes('how much money') || q.includes('account balance')) {
    return { intent: 'cash_position', periodSpec: detectedPeriod };
  }

  // 6. Cash Runway & Burn
  if (q.includes('runway') || q.includes('burn') || q.includes('how long') || q.includes('cash survive') || q.includes('liquidity days')) {
    return { intent: 'cash_runway', periodSpec: detectedPeriod };
  }

  // 7. Inventory & Stock & Slow Moving
  if (q.includes('inventory') || q.includes('stock') || q.includes('slow moving') || q.includes('dead stock') || q.includes('valuation') || q.includes('product')) {
    return { intent: 'inventory', periodSpec: detectedPeriod };
  }

  // 8. Profit & Loss / Margins / Revenue / Expenses
  if (q.includes('profit') || q.includes('margin') || q.includes('revenue') || q.includes('sales') || q.includes('cogs') || q.includes('expense') || q.includes('income') || q.includes('p&l') || q.includes('ebitda')) {
    return { intent: 'profitability', periodSpec: detectedPeriod };
  }

  // Default: General Comprehensive Financial Advice
  return { intent: 'general_business_advice', periodSpec: detectedPeriod };
};

/**
 * Gathers query-specific structured context based on detected intent.
 * Does not send unnecessary full dumps to Groq.
 *
 * @param {string|ObjectId} businessId
 * @param {string} intent
 * @param {Object} period
 * @param {Object} scenarioParams
 * @returns {Promise<Object>} Structured verified financial context
 */
export const buildQuerySpecificContext = async (businessId, intent, period, scenarioParams = {}) => {
  const missingData = [];
  const warnings = [];
  let data = {};
  let answerType = 'analysis';

  switch (intent) {
    case 'cash_position': {
      answerType = 'direct';
      const cash = await getCashAndLiquidFunds(businessId);
      const payables = await getPayablesAndAging(businessId);

      if (!cash.available) {
        missingData.push('Chart of Accounts Cash/Bank balances');
        warnings.push('Cash accounts are not configured in the accounting system.');
      }

      data = {
        cashPosition: cash,
        nearTermObligations14Days: payables.available ? payables.dueIn14Days : null
      };
      break;
    }

    case 'receivables': {
      answerType = 'records';
      const recv = await getReceivablesAndAging(businessId);
      data = {
        receivablesOverview: {
          totalReceivables: recv.totalReceivables,
          overdueReceivables: recv.overdueReceivables,
          currentReceivables: recv.currentReceivables,
          topDebtors: recv.topDebtors
        },
        invoices: recv.records.slice(0, 15) // Top 15 overdue/maturing records
      };
      break;
    }

    case 'payables': {
      answerType = 'records';
      const pay = await getPayablesAndAging(businessId);
      data = {
        payablesOverview: {
          totalPayables: pay.totalPayables,
          dueIn14Days: pay.dueIn14Days,
          overduePayables: pay.overduePayables,
          topCreditors: pay.topCreditors
        },
        bills: pay.records.slice(0, 15) // Top 15 overdue/maturing records
      };
      break;
    }

    case 'inventory': {
      answerType = 'records';
      const inv = await getInventoryIntelligence(businessId);
      if (!inv.available) {
        missingData.push('Product Catalog & Stock Quantity Records');
        warnings.push(inv.reason);
      }
      // Map records to frontend-expected shape
      const mappedInventoryRecords = (inv.records || []).map(item => ({
        sku: item.sku || `SKU-${item.productId}`,
        name: item.name,
        currentStock: item.quantityOnHand,
        valuation: item.inventoryValue,
        daysWithoutSale: item.isSlowMoving ? 61 : 0, // Simplified: flag >60d holding
        category: item.category,
        isSlowMoving: item.isSlowMoving
      }));
      data = {
        inventory: { ...inv, records: mappedInventoryRecords }
      };
      break;
    }

    case 'cash_runway': {
      answerType = 'direct';
      const runway = await getCashRunway(businessId);
      if (!runway.available) {
        missingData.push('Operating Expense / Burn records');
        warnings.push(runway.reason);
      }
      data = {
        runway
      };
      break;
    }

    case 'profitability': {
      answerType = 'analysis';
      const pl = await getProfitAndLoss(businessId, period);
      if (!pl.available) {
        missingData.push('Posted Revenue and Operating Expense Journal Entries');
        warnings.push(pl.reason);
      }
      data = {
        profitAndLoss: pl
      };
      break;
    }

    case 'scenario_analysis': {
      answerType = 'scenario';
      const scen = await evaluateScenarioImpact(businessId, scenarioParams);
      if (!scen.available) {
        missingData.push('Current Liquid Balance');
        warnings.push(scen.reason);
      }
      data = {
        scenarioEvaluation: scen
      };
      break;
    }

    case 'general_business_advice':
    default: {
      answerType = 'analysis';
      const [cash, pl, recv, pay, runway] = await Promise.all([
        getCashAndLiquidFunds(businessId),
        getProfitAndLoss(businessId, period),
        getReceivablesAndAging(businessId),
        getPayablesAndAging(businessId),
        getCashRunway(businessId)
      ]);

      if (!cash.available) missingData.push('Cash/Bank Balances');
      if (!pl.available) missingData.push('P&L Activity for ' + period.label);

      data = {
        cashPosition: cash,
        profitAndLoss: pl,
        receivables: {
          total: recv.totalReceivables,
          overdue: recv.overdueReceivables,
          topDebtors: recv.topDebtors
        },
        payables: {
          total: pay.totalPayables,
          dueIn14Days: pay.dueIn14Days,
          topCreditors: pay.topCreditors
        },
        cashRunway: runway
      };
      break;
    }
  }

  const complete = missingData.length === 0;

  return {
    intent,
    answerType,
    period: {
      code: period.code,
      label: period.label,
      start: period.startISO,
      end: period.endISO
    },
    data,
    dataQuality: {
      complete,
      missing: missingData,
      warnings
    }
  };
};
