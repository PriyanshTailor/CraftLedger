import axios from 'axios';
import Product from '../models/Product.js';
import SalesOrder from '../models/SalesOrder.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Account from '../models/Account.js';
import Contact from '../models/Contact.js';
import Business from '../models/Business.js';
import { env } from '../config/env.js';
import { calculateProfitabilityRisk } from './profitabilityRiskService.js';

/**
 * Detects all 4 critical categories of profit leaks from live MongoDB collections:
 * 1. Low-margin products (below benchmark gross margin)
 * 2. Rising purchase costs (supplier price surges vs baseline/catalog cost)
 * 3. Excessive discounts (unhedged volume/discretionary price cuts)
 * 4. Increasing expenses (overhead & general ledger surges)
 *
 * Also enriches analysis with Scikit-learn ML ensemble profitability risk inference.
 *
 * @param {string|ObjectId} businessId
 * @returns {Promise<Object>} Comprehensive leak analysis, categories, ML risk prediction, and AI CFO recovery directives
 */
export const detectComprehensiveProfitLeaks = async (businessId) => {
  const [business, products, salesOrders, purchaseOrders, accounts] = await Promise.all([
    Business.findById(businessId).lean(),
    Product.find({ businessId, isActive: true }).lean(),
    SalesOrder.find({ businessId, status: { $ne: 'cancelled' } }).populate('customerId', 'name').lean(),
    PurchaseOrder.find({ businessId, status: { $ne: 'cancelled' } }).populate('vendorId', 'name').lean(),
    Account.find({ businessId, isActive: true }).lean()
  ]);

  const companyName = business?.businessName || 'Enterprise';
  const leaks = [];

  // =========================================================================
  // 1. LOW-MARGIN PRODUCTS
  // =========================================================================
  const TARGET_MARGIN_PCT = 35; // Benchmark gross margin for luxury, commercial & hospitality
  const CRITICAL_MARGIN_PCT = 18;

  products.forEach(p => {
    if (p.sellingPrice > 0) {
      const margin = p.sellingPrice - p.costPrice;
      const marginPct = Number(((margin / p.sellingPrice) * 100).toFixed(1));

      if (marginPct < 30) {
        const isCritical = marginPct < CRITICAL_MARGIN_PCT;
        const targetPrice = Math.round(p.costPrice / (1 - (TARGET_MARGIN_PCT / 100)));
        const priceDeficitPerUnit = Math.max(0, targetPrice - p.sellingPrice);
        const units = Math.max(1, p.quantityOnHand || p.currentStock || 1);
        const financialExposure = priceDeficitPerUnit * units;

        leaks.push({
          id: `LEAK-MARGIN-${p._id}`,
          category: 'low_margin_product',
          categoryLabel: 'Low-Margin Product',
          title: `Sub-Optimal Margin on ${p.name}`,
          severity: isCritical ? 'Critical' : 'Warning',
          currentValue: `${marginPct}% Margin`,
          benchmarkValue: `${TARGET_MARGIN_PCT}% Target`,
          financialExposure,
          affectedEntity: {
            name: p.name,
            sku: p.sku,
            type: 'Product',
            id: p._id
          },
          rootCause: `Unit production/procurement cost (₹${p.costPrice.toLocaleString('en-IN')}) absorbs ${((p.costPrice / p.sellingPrice) * 100).toFixed(0)}% of selling price (₹${p.sellingPrice.toLocaleString('en-IN')}), yielding only a ${marginPct}% margin.`,
          remedy: `Raise retail/contract price to ₹${targetPrice.toLocaleString('en-IN')} or renegotiate bill-of-materials to cap unit cost at ₹${Math.round(p.sellingPrice * 0.65).toLocaleString('en-IN')}.`,
          route: '/dashboard/inventory'
        });
      }
    }
  });

  // =========================================================================
  // 2. RISING PURCHASE COSTS (RAW MATERIALS & SUPPLIERS)
  // =========================================================================
  const productCatalogCostMap = {};
  products.forEach(p => {
    if (p.sku && p.costPrice > 0) {
      productCatalogCostMap[p.sku] = p.costPrice;
    }
  });

  const baselineCosts = {
    'RAW-TEAK-101': 1050,
    'HW-BRASS-PULL': 10200,
    'RAW-FOAM-HD40': 2300,
    'RAW-VENEER-SMK': 23500,
    'RAW-LEATHER-COG': 18500,
    'RAW-SS-COIL': 16000,
    'RAW-GLS-SGB': 8200,
    'RAW-ALU-HIN': 10500,
    'FURN-TEAK-VIL': 65000,
    'LIN-EGY-400TC': 5500,
    'FNB-SUL-CASE': 2600,
    ...productCatalogCostMap
  };

  const detectedPoLeaks = new Set();

  purchaseOrders.forEach(po => {
    (po.items || []).forEach(item => {
      const sku = item.skuSnapshot;
      const benchmark = baselineCosts[sku] || (productCatalogCostMap[sku] ? productCatalogCostMap[sku] * 0.9 : null);

      if (benchmark && item.unitCost > benchmark && !detectedPoLeaks.has(sku)) {
        const unitInflation = item.unitCost - benchmark;
        const inflationPct = Number(((unitInflation / benchmark) * 100).toFixed(1));

        if (inflationPct >= 5.0) {
          detectedPoLeaks.add(sku);
          const totalPurchasedQty = (po.items || [])
            .filter(i => i.skuSnapshot === sku)
            .reduce((sum, i) => sum + (i.quantity || 1), 0);
          const financialExposure = unitInflation * Math.max(totalPurchasedQty, 5);
          const vendorName = po.vendorId?.name || 'Primary Material Vendor';

          leaks.push({
            id: `LEAK-PO-${sku}`,
            category: 'rising_purchase_cost',
            categoryLabel: 'Rising Purchase Cost',
            title: `Unit Cost Surge: ${item.productNameSnapshot || sku}`,
            severity: inflationPct >= 18 ? 'Critical' : 'Warning',
            currentValue: `₹${item.unitCost.toLocaleString('en-IN')}/unit (+${inflationPct}%)`,
            benchmarkValue: `₹${Math.round(benchmark).toLocaleString('en-IN')} Baseline`,
            financialExposure,
            affectedEntity: {
              name: vendorName,
              sku: sku,
              type: 'Vendor / Material',
              id: po.vendorId?._id || po._id
            },
            rootCause: `Procurement rate from ${vendorName} increased from ₹${Math.round(benchmark).toLocaleString('en-IN')} to ₹${item.unitCost.toLocaleString('en-IN')} (+${inflationPct}%), compressing margins.`,
            remedy: `Initiate competitive supplier bidding or lock forward volume agreements to roll back unit rate by at least 8-12%.`,
            route: '/dashboard/purchases'
          });
        }
      }
    });
  });

  // =========================================================================
  // 3. EXCESSIVE DISCOUNTS (SALES ORDERS)
  // =========================================================================
  const DISCOUNT_WARNING_THRESHOLD = 8.0; // > 8% discretionary discount triggers audit
  const DISCOUNT_CRITICAL_THRESHOLD = 15.0; // > 15% is critical margin destruction

  salesOrders.forEach(so => {
    let rawDiscount = Number(so.discount) || 0;
    const subtotal = Number(so.subtotal) || Math.round((Number(so.totalAmount) || 1) / 1.18) || 1;
    let discPct = 0;
    let discountAmountSurrendered = 0;

    // Detect if discount was stored as an absolute currency amount (INR) vs a percentage
    if (rawDiscount > 100) {
      discountAmountSurrendered = Math.round(rawDiscount);
      discPct = Number(((rawDiscount / subtotal) * 100).toFixed(1));
    } else {
      discPct = Number(rawDiscount.toFixed(1));
      discountAmountSurrendered = Math.round(subtotal * (discPct / 100));
    }

    if (discPct > DISCOUNT_WARNING_THRESHOLD) {
      const isCritical = discPct >= DISCOUNT_CRITICAL_THRESHOLD;
      const clientName = so.customerId?.name || 'Commercial Account';

      leaks.push({
        id: `LEAK-DISC-${so.orderNumber}`,
        category: 'excessive_discount',
        categoryLabel: 'Excessive Discount',
        title: `High Discount on Order ${so.orderNumber}`,
        severity: isCritical ? 'Critical' : 'Warning',
        currentValue: `${discPct}% Discretionary`,
        benchmarkValue: '8% Policy Cap',
        financialExposure: discountAmountSurrendered,
        affectedEntity: {
          name: clientName,
          orderNumber: so.orderNumber,
          type: 'Sales Order',
          id: so._id
        },
        rootCause: `Discretionary price concession of ${discPct}% applied on order ${so.orderNumber} surrenders ₹${discountAmountSurrendered.toLocaleString('en-IN')} of gross margin.`,
        remedy: `Enforce mandatory CFO approval threshold for commercial discounts exceeding 8%. Replace cash concessions with non-cash value additions.`,
        route: '/dashboard/sales'
      });
    }
  });

  // =========================================================================
  // 4. INCREASING EXPENSES (GENERAL LEDGER OVERHEADS)
  // =========================================================================
  const expenseBenchmarks = {
    '6100': { benchmark: 204000, name: 'Artisan Carpenter Payroll & Overtime', alertPct: 15 },
    '6200': { benchmark: 40500, name: 'Workshop Power & Tooling Utilities', alertPct: 10 },
    '6000': { benchmark: 171000, name: 'Showroom & Workshop Lease Rent', alertPct: 5 },
    '5010': { benchmark: 3500000, name: 'Direct Cost of Goods Sold (COGS)', alertPct: 12 },
    '5050': { benchmark: 750000, name: 'Factory Power, Overheads & Freight', alertPct: 12 }
  };

  accounts.forEach(acc => {
    if (acc.accountType === 'expense') {
      const code = String(acc.accountCode);
      const conf = expenseBenchmarks[code];

      if (conf && acc.currentBalance > conf.benchmark) {
        const excess = acc.currentBalance - conf.benchmark;
        const increasePct = Number(((excess / conf.benchmark) * 100).toFixed(1));

        if (increasePct >= conf.alertPct) {
          leaks.push({
            id: `LEAK-EXPENSE-${code}`,
            category: 'increasing_expenses',
            categoryLabel: 'Increasing Expenses',
            title: `Overhead Surge: ${conf.name}`,
            severity: increasePct >= 18 ? 'Critical' : 'Warning',
            currentValue: `₹${acc.currentBalance.toLocaleString('en-IN')} (+${increasePct}%)`,
            benchmarkValue: `₹${conf.benchmark.toLocaleString('en-IN')} Benchmark`,
            financialExposure: excess,
            affectedEntity: {
              name: acc.accountName,
              code: acc.accountCode,
              type: 'Expense Account',
              id: acc._id
            },
            rootCause: `${conf.name} exceeded baseline target by ${increasePct}% (+₹${excess.toLocaleString('en-IN')}) due to unbudgeted production run rates and operational utility consumption.`,
            remedy: `Enforce department expense quotas and conduct monthly utility audits on manufacturing equipment.`,
            route: '/dashboard/accounting'
          });
        }
      }
    }
  });

  // Sort leaks by financial exposure descending
  leaks.sort((a, b) => b.financialExposure - a.financialExposure);

  // Aggregate summary metrics
  const totalFinancialBleed = leaks.reduce((sum, l) => sum + l.financialExposure, 0);
  const criticalCount = leaks.filter(l => l.severity === 'Critical').length;
  const warningCount = leaks.filter(l => l.severity === 'Warning').length;

  const categoryBreakdown = {
    lowMargin: {
      count: leaks.filter(l => l.category === 'low_margin_product').length,
      amount: leaks.filter(l => l.category === 'low_margin_product').reduce((s, l) => s + l.financialExposure, 0)
    },
    risingPurchaseCost: {
      count: leaks.filter(l => l.category === 'rising_purchase_cost').length,
      amount: leaks.filter(l => l.category === 'rising_purchase_cost').reduce((s, l) => s + l.financialExposure, 0)
    },
    excessiveDiscount: {
      count: leaks.filter(l => l.category === 'excessive_discount').length,
      amount: leaks.filter(l => l.category === 'excessive_discount').reduce((s, l) => s + l.financialExposure, 0)
    },
    increasingExpenses: {
      count: leaks.filter(l => l.category === 'increasing_expenses').length,
      amount: leaks.filter(l => l.category === 'increasing_expenses').reduce((s, l) => s + l.financialExposure, 0)
    }
  };

  // =========================================================================
  // 5. ML PROFITABILITY RISK ENRICHMENT
  // =========================================================================
  let mlRiskData = null;
  try {
    mlRiskData = await calculateProfitabilityRisk(businessId);
  } catch (err) {
    console.warn('[ProfitLeaks] Could not execute ML risk inference:', err.message);
  }

  // =========================================================================
  // 6. AI CFO STRATEGY SYNTHESIS (Groq LLM with Deterministic Guardrail)
  // =========================================================================
  let aiRecoveryPlan = null;
  const groqApiKey = env.GROQ_API_KEY;
  const groqModel = env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  if (groqApiKey && totalFinancialBleed > 0) {
    try {
      const prompt = `You are the Chief Financial Officer (CFO) conducting an executive margin recovery diagnosis for "${companyName}".

AUDIT SUMMARY:
- Total Bleed Exposure: ₹${totalFinancialBleed.toLocaleString('en-IN')}
- Critical Leaks: ${criticalCount}, Warning Leaks: ${warningCount}
- Low-Margin Products: ${categoryBreakdown.lowMargin.count} items (Bleed: ₹${categoryBreakdown.lowMargin.amount.toLocaleString('en-IN')})
- Rising Purchase Costs: ${categoryBreakdown.risingPurchaseCost.count} materials (Bleed: ₹${categoryBreakdown.risingPurchaseCost.amount.toLocaleString('en-IN')})
- Excessive Discounts: ${categoryBreakdown.excessiveDiscount.count} orders (Bleed: ₹${categoryBreakdown.excessiveDiscount.amount.toLocaleString('en-IN')})
- Increasing Expenses: ${categoryBreakdown.increasingExpenses.count} accounts (Bleed: ₹${categoryBreakdown.increasingExpenses.amount.toLocaleString('en-IN')})

TOP LEAK PARTICULARS:
${leaks.slice(0, 5).map(l => `- [${l.categoryLabel}] ${l.title} (Exposure: ₹${l.financialExposure.toLocaleString('en-IN')}) -> ${l.rootCause}`).join('\n')}

Provide a structured recovery roadmap in valid parseable JSON conforming strictly to:
{
  "executiveSummary": "A crisp 2-sentence CFO verdict on where ${companyName} is leaking margin and total recoverable amount.",
  "topPriorityPill": "Primary area requiring immediate intervention today",
  "estimatedRecoverableProfit": "Estimated ₹ that can be recovered in 60 days (e.g. +₹1.85L Recovery)",
  "strategicRecoveryRoadmap": [
    {
      "domain": "Pricing & Low Margins",
      "action": "Concrete action to re-price low margin products",
      "expectedSavings": "Estimated ₹ amount (e.g. +₹85k margin)"
    },
    {
      "domain": "Vendor Procurement",
      "action": "Concrete action to curb rising material prices",
      "expectedSavings": "Estimated ₹ amount (e.g. +₹60k cost avoidance)"
    },
    {
      "domain": "Discount Policy & Overhead",
      "action": "Concrete action to stop discretionary discounts and overtime creep",
      "expectedSavings": "Estimated ₹ amount (e.g. +₹90k direct profit)"
    }
  ]
}`;

      const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: groqModel,
        messages: [
          {
            role: 'system',
            content: 'You are an aggressive corporate turnaround CFO identifying margin leakage and recovery strategies. Always return only valid JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.25,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const content = groqRes.data.choices[0]?.message?.content;
      if (content) {
        aiRecoveryPlan = JSON.parse(content);
      }
    } catch (err) {
      console.warn('Groq Profit Leak Recovery call failed, using deterministic CFO fallback:', err.message);
    }
  }

  // Deterministic CFO Fallback if Groq is unavailable, rate-limited, or total bleed is zero
  if (!aiRecoveryPlan) {
    if (totalFinancialBleed > 0) {
      const recAmt = Math.round(totalFinancialBleed * 0.78);
      const recFormatted = recAmt >= 100000 ? `+₹${(recAmt / 100000).toFixed(2)}L Recovery` : `+₹${Math.round(recAmt / 1000)}k Recovery`;

      aiRecoveryPlan = {
        executiveSummary: `${companyName} is currently experiencing ₹${(totalFinancialBleed / 100000).toFixed(2)}L in operational profit leakage across sub-optimal pricing markups and procurement cost surges. Instituting an 8% discount ceiling and locking input vendor rates can recover over 75% of this margin within 45 days.`,
        topPriorityPill: categoryBreakdown.excessiveDiscount.count > 0 ? 'Discretionary Sales Discounts' : (categoryBreakdown.risingPurchaseCost.count > 0 ? 'Supplier Material Inflation' : 'Low Gross Margin Products'),
        estimatedRecoverableProfit: recFormatted,
        strategicRecoveryRoadmap: [
          {
            domain: 'Pricing & Low Margins',
            action: `Re-index catalogue markups to a minimum 35% target gross margin to insulate against operational overhead.`,
            expectedSavings: `+₹${Math.max(15, Math.round(categoryBreakdown.lowMargin.amount * 0.8 / 1000))}k margin`
          },
          {
            domain: 'Vendor Procurement',
            action: `Negotiate quarterly volume supply contracts to freeze baseline raw material input rates.`,
            expectedSavings: `+₹${Math.max(10, Math.round(categoryBreakdown.risingPurchaseCost.amount * 0.75 / 1000))}k cost avoidance`
          },
          {
            domain: 'Discount Policy & Overhead',
            action: `Implement dual-approval controls capping discretionary sales concessions strictly at 8%.`,
            expectedSavings: `+₹${Math.max(20, Math.round((categoryBreakdown.excessiveDiscount.amount + categoryBreakdown.increasingExpenses.amount) * 0.85 / 1000))}k direct profit`
          }
        ]
      };
    } else {
      aiRecoveryPlan = {
        executiveSummary: `${companyName} maintains a healthy margin profile with zero critical pricing leaks or unhedged discount concessions detected across live transactions.`,
        topPriorityPill: 'Maintain Margin Discipline',
        estimatedRecoverableProfit: 'Margins Optimized',
        strategicRecoveryRoadmap: [
          {
            domain: 'Pricing & Low Margins',
            action: 'Maintain existing 35%+ gross margin floor across active product catalogue.',
            expectedSavings: 'Margin Preserved'
          },
          {
            domain: 'Vendor Procurement',
            action: 'Continue quarterly supplier audits to detect and prevent raw material cost creep.',
            expectedSavings: 'Cost Controlled'
          },
          {
            domain: 'Discount Policy & Overhead',
            action: 'Enforce current 8% discount ceiling across commercial sales orders.',
            expectedSavings: 'Full Realization'
          }
        ]
      };
    }
  }

  return {
    businessId,
    businessName: companyName,
    llmProvider: 'Groq Cloud API',
    llmModel: groqModel,
    summary: {
      totalLeaksCount: leaks.length,
      totalFinancialBleed,
      criticalCount,
      warningCount,
      categoryBreakdown
    },
    leaks,
    aiRecoveryPlan,
    mlProfitabilityRisk: mlRiskData ? {
      overallRiskScore: mlRiskData.summary?.overallPortfolioRiskScore,
      overallRiskTier: mlRiskData.summary?.overallRiskTier,
      expectedGrossMarginPercentage: mlRiskData.summary?.expectedGrossMarginPercentage,
      totalOrdersEvaluated: mlRiskData.summary?.totalOrdersEvaluated,
      highRiskOrderCount: mlRiskData.summary?.highRiskOrderCount,
      featureImportances: mlRiskData.featureImportances,
      mitigationSimulation: mlRiskData.mitigationSimulation
    } : null,
    detectedAt: new Date()
  };
};
