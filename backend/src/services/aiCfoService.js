import axios from 'axios';
import Business from '../models/Business.js';
import CfoConversation from '../models/CfoConversation.js';
import { env } from '../config/env.js';
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
import {
  classifyQuestionIntent,
  buildQuerySpecificContext
} from './cfoIntentService.js';

/**
 * Gathers complete real-time verified financial telemetry without fabricated fallbacks.
 *
 * @param {string|ObjectId} businessId
 * @param {Object} periodSpec
 * @returns {Promise<Object>} Verified financial snapshot
 */
export const gatherBusinessFinancialContext = async (businessId, periodSpec = 'this_month') => {
  const period = resolveReportingPeriod(periodSpec);
  const business = await Business.findById(businessId).lean();
  const companyName = business?.businessName || 'CraftLedger Enterprise';

  const [cash, pl, recv, pay, inv, runway] = await Promise.all([
    getCashAndLiquidFunds(businessId),
    getProfitAndLoss(businessId, period),
    getReceivablesAndAging(businessId),
    getPayablesAndAging(businessId),
    getInventoryIntelligence(businessId),
    getCashRunway(businessId)
  ]);

  return {
    companyName,
    period,
    cashPosition: cash,
    profitAndLoss: pl,
    receivables: recv,
    payables: pay,
    inventory: inv,
    runway
  };
};

/**
 * Generates an executive-level strategic CFO overview using verified MongoDB telemetry.
 *
 * @param {string|ObjectId} businessId
 * @returns {Promise<Object>} Executive CFO briefing, decisions, and telemetry
 */
export const getAiCfoOverview = async (businessId) => {
  const period = resolveReportingPeriod('this_month');
  const ctx = await gatherBusinessFinancialContext(businessId, period);

  const groqApiKey = env.GROQ_API_KEY;
  const groqModel = env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  const cash = ctx.cashPosition;
  const pl = ctx.profitAndLoss;
  const recv = ctx.receivables;
  const pay = ctx.payables;
  const inv = ctx.inventory;
  const runway = ctx.runway;

  let llmCfoBriefing = null;

  if (groqApiKey) {
    try {
      const prompt = `You are the Virtual Chief Financial Officer (CFO) and Chief Strategy Advisor to the owner of "${ctx.companyName}".
Analyze the company's verified financial telemetry below and deliver rigorous, authoritative executive CFO guidance for the period: ${period.label}.
USE ONLY THE SUPPLIED VERIFIED FACTS. NEVER INVENT FINANCIAL DATA.

VERIFIED FINANCIAL TELEMETRY (INR ₹):
- Reporting Period: ${period.label}
- Total Liquid Cash & Bank: ${cash.available ? `₹${cash.totalLiquidFunds.toLocaleString('en-IN')}` : 'Data Unavailable'}
- Revenue (${period.label}): ${pl.available ? `₹${pl.revenue.toLocaleString('en-IN')}` : 'Data Unavailable'}
- COGS: ${pl.available ? `₹${pl.cogs.toLocaleString('en-IN')}` : 'Data Unavailable'} (Gross Margin: ${pl.available ? `${pl.grossMarginPct}%` : 'N/A'})
- Operating Expenses: ${pl.available ? `₹${pl.operatingExpenses.toLocaleString('en-IN')}` : 'Data Unavailable'}
- Net Profit: ${pl.available ? `₹${pl.netProfit.toLocaleString('en-IN')}` : 'Data Unavailable'} (Net Margin: ${pl.available ? `${pl.netMarginPct}%` : 'N/A'})
- Upcoming Vendor Obligations (Next 14 Days): ${pay.available ? `₹${pay.dueIn14Days.toLocaleString('en-IN')}` : 'Data Unavailable'}
- Total Accounts Payable: ${pay.available ? `₹${pay.totalPayables.toLocaleString('en-IN')}` : 'Data Unavailable'}
- Total Accounts Receivable: ${recv.available ? `₹${recv.totalReceivables.toLocaleString('en-IN')}` : 'Data Unavailable'} (Overdue: ${recv.available ? `₹${recv.overdueReceivables.toLocaleString('en-IN')}` : 'N/A'})
- Total Inventory Valuation: ${inv.available ? `₹${inv.totalValuation.toLocaleString('en-IN')}` : 'Data Unavailable'} (Slow-Moving: ${inv.available ? `₹${inv.slowMovingValuation.toLocaleString('en-IN')}` : 'N/A'})
- Verified Cash Runway: ${runway.available ? `${runway.runwayDays} Days` : 'Runway Unavailable (Insufficient burn data)'}
- Top Debtors: ${recv.topDebtors && recv.topDebtors.length > 0 ? recv.topDebtors.map(d => `${d.customer} (₹${d.amount.toLocaleString('en-IN')})`).join(', ') : 'None recorded'}
- Top Creditors: ${pay.topCreditors && pay.topCreditors.length > 0 ? pay.topCreditors.map(c => `${c.vendor} (₹${c.amount.toLocaleString('en-IN')})`).join(', ') : 'None recorded'}

Respond with ONLY valid parseable JSON conforming to this exact schema:
{
  "executiveHeadline": "A powerful 1-sentence CFO headline summarizing the verified financial position for ${period.label}.",
  "comprehensiveBriefing": "A 2-to-3 paragraph executive diagnostic evaluating (1) Profitability and margins, (2) Liquidity stress points (14-day vendor bills vs available cash), and (3) Working capital optimization based ONLY on the verified data.",
  "strategicDecisions": [
    {
      "category": "Capital Allocation",
      "title": "Clear decision title",
      "verdict": "Approve with Conditions" | "High Financial Risk" | "Proceed Aggressively",
      "financialImpact": "Quantified ₹ impact based on actual data",
      "strategicRationale": "Why this decision matters for the business owner",
      "actionSteps": ["Step 1", "Step 2"]
    },
    {
      "category": "Liquidity & Debt",
      "title": "Clear decision title",
      "verdict": "Approve with Conditions" | "High Financial Risk" | "Proceed Aggressively",
      "financialImpact": "Quantified ₹ impact",
      "strategicRationale": "Strategic rationale",
      "actionSteps": ["Step 1", "Step 2"]
    },
    {
      "category": "Pricing & Margins",
      "title": "Clear decision title",
      "verdict": "Approve with Conditions" | "High Financial Risk" | "Proceed Aggressively",
      "financialImpact": "Quantified ₹ impact",
      "strategicRationale": "Strategic rationale",
      "actionSteps": ["Step 1", "Step 2"]
    }
  ],
  "financialPillars": {
    "liquidityHealth": "Good" | "Needs Attention" | "Critical Deficit",
    "marginStrength": "Robust" | "Eroding" | "Moderate" | "Unavailable",
    "inventoryEfficiency": "High Velocity" | "Capital Trapped" | "Balanced" | "Unavailable"
  }
}`;

      const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: groqModel,
        messages: [
          {
            role: 'system',
            content: 'You are an authoritative, data-grounded Virtual CFO for a furniture business. Output ONLY valid parseable JSON.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });

      const content = groqRes.data.choices[0]?.message?.content;
      if (content) {
        llmCfoBriefing = JSON.parse(content);
      }
    } catch (err) {
      console.warn('Groq AI CFO Overview call failed:', err.message);
    }
  }

  // Deterministic calculation fallback if Groq API is unavailable or unconfigured
  if (!llmCfoBriefing) {
    const isLiquidityDeficit = cash.available && pay.available && (pay.dueIn14Days > cash.totalLiquidFunds);
    const deficitAmount = isLiquidityDeficit ? pay.dueIn14Days - cash.totalLiquidFunds : 0;

    llmCfoBriefing = {
      executiveHeadline: isLiquidityDeficit
        ? `Immediate liquidity defense required: 14-day vendor obligations exceed available liquid cash by ₹${Math.round(deficitAmount / 1000)}k.`
        : cash.available
        ? `Liquid cash reserves of ₹${(cash.totalLiquidFunds / 100000).toFixed(2)}L maintain positive operating liquidity for ${period.label}.`
        : `Accounting data recorded for ${period.label}; review working capital entries.`,
      comprehensiveBriefing: `${ctx.companyName} financial position for ${period.label}:\n\n` +
        (pl.available
          ? `Operating performance reflects ₹${(pl.revenue / 100000).toFixed(2)}L in revenue with a gross margin of ${pl.grossMarginPct}%. Operating expenses stand at ₹${(pl.operatingExpenses / 100000).toFixed(2)}L, delivering a net profit of ₹${(pl.netProfit / 100000).toFixed(2)}L (${pl.netMarginPct}% net margin).\n\n`
          : `Revenue and expense journal entries have not been fully posted for ${period.label}.\n\n`) +
        (pay.available && cash.available
          ? `Upcoming vendor obligations due in 14 days amount to ₹${(pay.dueIn14Days / 100000).toFixed(2)}L against liquid bank reserves of ₹${(cash.totalLiquidFunds / 100000).toFixed(2)}L. Outstanding customer receivables stand at ₹${(recv.totalReceivables / 100000).toFixed(2)}L (with ₹${(recv.overdueReceivables / 100000).toFixed(2)}L overdue).`
          : `Maintain close tracking on vendor payables and trade receivables.`),
      strategicDecisions: [
        {
          category: 'Capital Allocation',
          title: 'Preserve Liquidity Reserves for Maturing Obligations',
          verdict: isLiquidityDeficit ? 'High Financial Risk' : 'Approve with Conditions',
          financialImpact: `Protects ₹${(pay.dueIn14Days || 0).toLocaleString('en-IN')} working capital buffer`,
          strategicRationale: 'Ensure liquid balances are not committed to discretionary expenses while supply obligations are maturing.',
          actionSteps: [
            'Release high-value production orders only upon customer advance receipt.',
            'Review trade receivables daily to accelerate cash inflow.'
          ]
        },
        {
          category: 'Liquidity & Debt',
          title: 'Stagger 14-Day Vendor Disbursements',
          verdict: 'Proceed Aggressively',
          financialImpact: `Manages ₹${(pay.dueIn14Days || 0).toLocaleString('en-IN')} near-term vendor payables`,
          strategicRationale: 'Align supplier bill settlements with verified debtor collection dates.',
          actionSteps: [
            'Prioritize critical raw material suppliers.',
            'Follow up on overdue customer receivables immediately.'
          ]
        },
        {
          category: 'Pricing & Margins',
          title: 'Enforce Margin Discipline on Commercial Quotes',
          verdict: 'Approve with Conditions',
          financialImpact: 'Protects target gross profit margins',
          strategicRationale: 'Discretionary discounts directly erode EBITDA.',
          actionSteps: [
            'Cap discretionary sales discounts at approved thresholds.',
            'Review catalogue costing against recent material invoice prices.'
          ]
        }
      ],
      financialPillars: {
        liquidityHealth: isLiquidityDeficit ? 'Needs Attention' : (cash.available ? 'Good' : 'Critical Deficit'),
        marginStrength: pl.available ? (pl.grossMarginPct >= 40 ? 'Robust' : 'Moderate') : 'Unavailable',
        inventoryEfficiency: inv.available ? (inv.slowMovingPercentage > 30 ? 'Capital Trapped' : 'Balanced') : 'Unavailable'
      }
    };
  }

  // Map to telemetry format for UI compatibility
  const telemetry = {
    totalLiquidFunds: cash.available ? cash.totalLiquidFunds : 0,
    liquidCash: cash.available ? cash.liquidCash : 0,
    bankBalances: cash.available ? cash.bankBalances : 0,
    grossRevenue: pl.available ? pl.revenue : 0,
    cogs: pl.available ? pl.cogs : 0,
    operatingExpenses: pl.available ? pl.operatingExpenses : 0,
    payrollExpense: pl.available ? pl.payrollExpense : 0,
    rentExpense: pl.available ? pl.rentExpense : 0,
    utilitiesExpense: pl.available ? pl.utilitiesExpense : 0,
    grossProfit: pl.available ? pl.grossProfit : 0,
    netProfit: pl.available ? pl.netProfit : 0,
    grossMarginPct: pl.available ? pl.grossMarginPct : 0,
    netMarginPct: pl.available ? pl.netMarginPct : 0,
    totalReceivables: recv.available ? recv.totalReceivables : 0,
    overdueReceivables: recv.available ? recv.overdueReceivables : 0,
    topDebtors: recv.topDebtors || [],
    totalPayables: pay.available ? pay.totalPayables : 0,
    dueIn14Days: pay.available ? pay.dueIn14Days : 0,
    topCreditors: pay.topCreditors || [],
    totalInventoryValuation: inv.available ? inv.totalValuation : 0,
    slowMovingValuation: inv.available ? inv.slowMovingValuation : 0,
    runwayDays: runway.available ? runway.runwayDays : 0,
    monthlyBurnRate: runway.available ? runway.monthlyBurnRate : 0,
    ordersCount: 0,
    activeProductsCount: inv.available ? inv.totalProductsCount : 0
  };

  return {
    businessId,
    period: period.label,
    llmProvider: groqApiKey ? 'Groq Cloud API' : 'Deterministic Intelligence Engine',
    llmModel: groqModel,
    telemetry,
    cfoGuidance: llmCfoBriefing,
    generatedAt: new Date()
  };
};

/**
 * Parses and safely normalizes Groq LLM JSON output.
 */
const safeParseLlmJson = (rawContent) => {
  if (!rawContent) return null;
  let text = rawContent.trim();

  // Strip markdown code fences if present (e.g. ```json ... ```)
  if (text.startsWith('```')) {
    text = text.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '').trim();
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    // Attempt relaxed regex extraction of first { ... }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        console.warn('Failed to repair JSON from LLM:', innerErr.message);
      }
    }
    return null;
  }
};

/**
 * Handles interactive CFO decision evaluations or custom questions submitted by the business owner.
 * Grounded in query-specific verified context and analyzed via Groq Cloud LLM.
 *
 * @param {string|ObjectId} businessId
 * @param {string|ObjectId} userId
 * @param {string} question
 * @param {Object} options { period, conversationId, scenarioParams }
 * @returns {Promise<Object>} Tailored CFO response
 */
export const evaluateCfoDecisionOrQuestion = async (businessId, userId, question, options = {}) => {
  const { period: periodInput, conversationId, scenarioParams } = options;

  // 1. Identify Intent & Reporting Period
  const intentResult = classifyQuestionIntent(question, { period: periodInput, scenarioParams });
  const period = resolveReportingPeriod(intentResult.periodSpec);
  const intent = intentResult.intent;

  // 2. Build Query-Specific Financial Context (NO FABRICATED NUMBERS)
  const context = await buildQuerySpecificContext(
    businessId,
    intent,
    period,
    intentResult.scenarioParams
  );

  // 3. Retrieve Conversation History for Follow-Ups (if conversationId provided)
  let conversationHistory = [];
  let conversationDoc = null;

  if (conversationId && userId) {
    try {
      conversationDoc = await CfoConversation.findOne({ businessId, userId, conversationId });
      if (conversationDoc && conversationDoc.messages) {
        conversationHistory = conversationDoc.messages.slice(-4).map(m => ({
          role: m.role,
          content: m.role === 'user' ? m.question : (m.answer?.directAnswer || m.answer?.cfoSummary || '')
        }));
      }
    } catch (cErr) {
      console.warn('Failed to load conversation history:', cErr.message);
    }
  }

  const groqApiKey = env.GROQ_API_KEY;
  const groqModel = env.GROQ_MODEL || 'qwen/qwen3.8-27b';

  let parsedLlmResponse = null;

  if (groqApiKey) {
    try {
      const systemPrompt = `You are CraftLedger AI CFO, an elite, numbers-grounded financial analysis assistant for a furniture enterprise.
Your strict responsibilities are:
1. Answer the user's exact question directly and authoritatively.
2. Use ONLY the verified business data supplied in the context.
3. NEVER invent revenue, expenses, balances, invoices, bills, customers, vendors, products, dates, or transactions.
4. NEVER treat missing data as zero. If data is unavailable, clearly state that it is unavailable.
5. NEVER estimate a financial value unless the context explicitly marks it as a user scenario assumption.
6. Clearly distinguish actual figures, calculated metrics, user assumptions, and strategic recommendations.
7. Mention the reporting period used (${period.label}) for any financial calculations.
8. Explain calculations step-by-step when useful.
9. Provide practical, high-ROI recommendations based strictly on verified facts.
10. Return ONLY valid JSON conforming to the requested schema.`;

      const userPrompt = `USER QUESTION:
"${question}"

QUESTION INTENT:
${intent}

REPORTING PERIOD:
${period.label} (${period.startISO} to ${period.endISO})

VERIFIED BUSINESS DATA (JSON):
${JSON.stringify(context.data, null, 2)}

DATA QUALITY ASSESSMENT:
${JSON.stringify(context.dataQuality, null, 2)}

${conversationHistory.length > 0 ? `RECENT CONVERSATION CONTEXT:\n${JSON.stringify(conversationHistory, null, 2)}\n` : ''}

INSTRUCTIONS:
Respond with ONLY valid JSON conforming to this exact structure:
{
  "answerType": "${context.answerType}",
  "directAnswer": "A direct 1-to-2 sentence answer specifically resolving the user's question.",
  "summary": "Executive CFO explanation highlighting margins, cash flow impact, and trade-offs.",
  "period": {
    "label": "${period.label}",
    "start": "${period.startISO}",
    "end": "${period.endISO}"
  },
  "facts": [
    { "label": "Fact description", "value": "₹X or Y%", "source": "Source data name" }
  ],
  "calculations": [
    { "formula": "Mathematical calculation used", "result": "Calculated value" }
  ],
  "records": [],
  "risks": [
    "Key risk factor 1 based on verified data"
  ],
  "recommendations": [
    { "priority": "high" | "medium" | "low", "action": "Action to take", "reason": "Strategic justification" }
  ],
  "missingData": [
    ${context.dataQuality.missing.map(m => `"${m}"`).join(', ')}
  ],
  "confidence": "${context.dataQuality.complete ? 'high' : 'medium'}",
  "verdict": "Approved / Recommended" | "Proceed with Caution" | "Not Recommended / High Financial Risk",
  "verdictColor": "emerald" | "amber" | "rose"
}`;

      const groqRes = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
        model: groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      }, {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 25000
      });

      const raw = groqRes.data.choices[0]?.message?.content;
      parsedLlmResponse = safeParseLlmJson(raw);
    } catch (llmErr) {
      console.warn('Groq AI CFO Question evaluation failed, using deterministic fallback:', llmErr.message);
    }
  }

  // Fallback state containers
  let fallbackFacts = [];
  let fallbackCalculations = [];

  // Deterministic Fallback if Groq API is unavailable or returns invalid JSON (NO FAKE NUMBERS)
  if (!parsedLlmResponse) {
    const isRecords = context.answerType === 'records';
    let direct = `Analyzed verified financial data for ${period.label}.`;
    let facts = [];
    let calculations = [];
    let records = [];
    let recommendations = [];
    let risks = [];
    let verdict = 'Proceed with Caution';
    let verdictColor = 'amber';

    if (intent === 'cash_position') {
      const cash = context.data.cashPosition;
      if (cash.available) {
        direct = `Current total liquid funds are ₹${cash.totalLiquidFunds.toLocaleString('en-IN')} (Liquid Cash: ₹${cash.liquidCash.toLocaleString('en-IN')}, Bank Accounts: ₹${cash.bankBalances.toLocaleString('en-IN')}).`;
        facts = [
          { label: 'Total Liquid Funds', value: `₹${cash.totalLiquidFunds.toLocaleString('en-IN')}`, source: cash.dataSource },
          { label: 'Cash in Hand', value: `₹${cash.liquidCash.toLocaleString('en-IN')}`, source: 'Cash Accounts' },
          { label: 'Bank Balances', value: `₹${cash.bankBalances.toLocaleString('en-IN')}`, source: 'Operating Bank Accounts' }
        ];
        if (context.data.nearTermObligations14Days) {
          facts.push({
            label: '14-Day Maturing Vendor Bills',
            value: `₹${context.data.nearTermObligations14Days.toLocaleString('en-IN')}`,
            source: 'Vendor Bills'
          });
        }
        verdict = cash.totalLiquidFunds > (context.data.nearTermObligations14Days || 0) ? 'Approved / Recommended' : 'Proceed with Caution';
        verdictColor = cash.totalLiquidFunds > (context.data.nearTermObligations14Days || 0) ? 'emerald' : 'amber';
      } else {
        direct = 'Liquid cash reserves cannot be determined because no active cash or bank accounts are recorded in the Chart of Accounts.';
        verdict = 'Not Recommended / High Financial Risk';
        verdictColor = 'rose';
      }
    } else if (intent === 'receivables') {
      const recv = context.data.receivablesOverview;
      direct = `Total outstanding receivables stand at ₹${recv.totalReceivables.toLocaleString('en-IN')}, with ₹${recv.overdueReceivables.toLocaleString('en-IN')} currently overdue.`;
      facts = [
        { label: 'Total Accounts Receivable', value: `₹${recv.totalReceivables.toLocaleString('en-IN')}`, source: 'Customer Invoices' },
        { label: 'Overdue Receivables', value: `₹${recv.overdueReceivables.toLocaleString('en-IN')}`, source: 'Past Due Invoices' },
        { label: 'Current Receivables', value: `₹${recv.currentReceivables.toLocaleString('en-IN')}`, source: 'Invoices Within Terms' }
      ];
      records = context.data.invoices || [];
      recommendations.push({
        priority: 'high',
        action: 'Issue formal payment reminders to top overdue debtors immediately',
        reason: 'Accelerates cash inflow without taking on short-term credit'
      });
    } else if (intent === 'payables') {
      const pay = context.data.payablesOverview;
      direct = `Total accounts payable stand at ₹${pay.totalPayables.toLocaleString('en-IN')}, with ₹${pay.dueIn14Days.toLocaleString('en-IN')} due within the next 14 days.`;
      facts = [
        { label: 'Total Accounts Payable', value: `₹${pay.totalPayables.toLocaleString('en-IN')}`, source: 'Vendor Bills' },
        { label: 'Due in Next 14 Days', value: `₹${pay.dueIn14Days.toLocaleString('en-IN')}`, source: 'Maturing Bills' },
        { label: 'Overdue Payables', value: `₹${pay.overduePayables.toLocaleString('en-IN')}`, source: 'Past Due Vendor Bills' }
      ];
      records = context.data.bills || [];
      recommendations.push({
        priority: 'high',
        action: 'Stagger vendor settlements to match confirmed customer invoice collection dates',
        reason: 'Avoids sudden liquidity drawdowns'
      });
    } else if (intent === 'inventory') {
      const inv = context.data.inventory;
      if (inv?.available) {
        direct = `Inventory portfolio contains ${inv.totalProductsCount} active products valued at ₹${inv.totalValuation.toLocaleString('en-IN')}. Slow-moving stock represents ₹${inv.slowMovingValuation.toLocaleString('en-IN')} (${inv.slowMovingPercentage}% of total).`;
        facts = [
          { label: 'Total Product SKUs', value: `${inv.totalProductsCount}`, source: inv.dataSource },
          { label: 'Total Inventory Value', value: `₹${inv.totalValuation.toLocaleString('en-IN')}`, source: 'Product Catalog × Stock Qty × Cost Price' },
          { label: 'Slow-Moving Valuation', value: `₹${inv.slowMovingValuation.toLocaleString('en-IN')}`, source: 'Products with >60 day holding' },
          { label: 'Slow-Moving %', value: `${inv.slowMovingPercentage}%`, source: 'Calculated' }
        ];
        records = inv.records || [];
        verdict = inv.slowMovingPercentage > 40 ? 'Proceed with Caution' : 'Approved / Recommended';
        verdictColor = inv.slowMovingPercentage > 40 ? 'amber' : 'emerald';
        recommendations.push({
          priority: 'high',
          action: 'Launch targeted promotions or liquidation pricing for top slow-moving items',
          reason: 'Frees trapped working capital and improves inventory turnover ratio'
        });
      } else {
        direct = inv?.reason || 'Inventory data unavailable — no active products found in the catalog.';
      }
    } else if (intent === 'scenario_analysis') {
      const scen = context.data.scenarioEvaluation;
      if (scen.available) {
        direct = `Scenario evaluation: Down-payment of ₹${scen.downPayment.toLocaleString('en-IN')} leaves ₹${scen.cashAfterDownPayment.toLocaleString('en-IN')} in liquid cash. ${scen.isLiquidityBreached ? 'This breaches your 14-day vendor obligations buffer.' : 'Your 14-day vendor obligations buffer remains covered.'}`;
        facts = scen.quantitativeFacts;
        verdict = scen.verdict;
        verdictColor = scen.verdictColor;
        recommendations.push({
          priority: 'high',
          action: scen.isLiquidityBreached ? 'Defer capital expenditure or negotiate installment financing' : 'Proceed only after securing commercial milestones',
          reason: scen.isLiquidityBreached ? 'Preserves essential cash to settle supplier obligations' : 'Maintains safe working capital cushion'
        });
      } else {
        direct = scen.reason;
      }
    } else if (intent === 'profitability') {
      const pl = context.data.profitAndLoss;
      if (pl.available) {
        direct = `For ${period.label}, verified revenue is ₹${pl.revenue.toLocaleString('en-IN')}, gross margin is ${pl.grossMarginPct}%, and net profit is ₹${pl.netProfit.toLocaleString('en-IN')} (${pl.netMarginPct}% net margin).`;
        facts = [
          { label: 'Revenue', value: `₹${pl.revenue.toLocaleString('en-IN')}`, source: pl.dataSource },
          { label: 'COGS', value: `₹${pl.cogs.toLocaleString('en-IN')}`, source: pl.dataSource },
          { label: 'Gross Profit', value: `₹${pl.grossProfit.toLocaleString('en-IN')}`, source: 'Calculated' },
          { label: 'Operating Expenses', value: `₹${pl.operatingExpenses.toLocaleString('en-IN')}`, source: pl.dataSource },
          { label: 'Net Profit', value: `₹${pl.netProfit.toLocaleString('en-IN')}`, source: 'Calculated' }
        ];
        calculations = [
          { formula: `Gross Profit = Revenue (₹${pl.revenue.toLocaleString('en-IN')}) - COGS (₹${pl.cogs.toLocaleString('en-IN')})`, result: `₹${pl.grossProfit.toLocaleString('en-IN')} (${pl.grossMarginPct}%)` },
          { formula: `Net Profit = Gross Profit (₹${pl.grossProfit.toLocaleString('en-IN')}) - OpEx (₹${pl.operatingExpenses.toLocaleString('en-IN')})`, result: `₹${pl.netProfit.toLocaleString('en-IN')} (${pl.netMarginPct}%)` }
        ];
        verdict = pl.netProfit >= 0 ? 'Approved / Recommended' : 'Proceed with Caution';
        verdictColor = pl.netProfit >= 0 ? 'emerald' : 'amber';
      } else {
        direct = pl.reason;
        verdict = 'Proceed with Caution';
        verdictColor = 'amber';
      }
    } else if (intent === 'cash_runway') {
      const runway = context.data.runway;
      if (runway?.available) {
        direct = `Your current cash runway is ${runway.runwayDays} days based on ₹${runway.currentLiquidFunds.toLocaleString('en-IN')} in liquid funds and a ₹${runway.monthlyBurnRate.toLocaleString('en-IN')}/month operating burn rate.`;
        facts = [
          { label: 'Liquid Cash & Bank', value: `₹${runway.currentLiquidFunds.toLocaleString('en-IN')}`, source: runway.dataSource || 'Posted Cash Accounts' },
          { label: 'Monthly Burn Rate', value: `₹${runway.monthlyBurnRate.toLocaleString('en-IN')}`, source: '30-Day Vendor Disbursements' },
          { label: 'Daily Burn Rate', value: `₹${runway.dailyBurn.toLocaleString('en-IN')}`, source: 'Calculated' },
          { label: 'Cash Runway', value: `${runway.runwayDays} Days`, source: 'Calculated' },
          { label: 'Runway Status', value: runway.status, source: 'Threshold Analysis' }
        ];
        verdict = runway.runwayDays < 30 ? 'Not Recommended / High Financial Risk' : runway.runwayDays < 90 ? 'Proceed with Caution' : 'Approved / Recommended';
        verdictColor = runway.runwayDays < 30 ? 'rose' : runway.runwayDays < 90 ? 'amber' : 'emerald';
        recommendations.push({
          priority: 'high',
          action: 'Accelerate receivables collection to extend cash runway',
          reason: 'Improving collection cycles directly extends operating safety margin'
        });
      } else {
        direct = runway?.reason || 'Cash runway cannot be determined — no verified 30-day expense records found.';
        verdict = 'Proceed with Caution';
        verdictColor = 'amber';
      }
    }

    // Assign to outer-scope fallback references BEFORE building parsedLlmResponse
    fallbackFacts = facts;
    fallbackCalculations = calculations;

    parsedLlmResponse = {
      answerType: context.answerType,
      directAnswer: direct,
      summary: direct,
      period: {
        label: period.label,
        start: period.startISO,
        end: period.endISO
      },
      facts,
      calculations,
      records: records.length > 0 ? records : (context.data.invoices || context.data.bills || context.data.inventory?.records || []),
      risks: risks.length > 0 ? risks : (context.dataQuality.warnings.length > 0 ? context.dataQuality.warnings : ['Monitor debtor collection timeline closely.']),
      recommendations: recommendations.length > 0 ? recommendations : [
        { priority: 'medium', action: 'Review monthly operating metrics weekly', reason: 'Maintains active control over cash flow' }
      ],
      missingData: context.dataQuality.missing,
      confidence: context.dataQuality.complete ? 'high' : 'medium',
      verdict,
      verdictColor
    };
  }

  // Ensure records array is populated if context had records
  if ((!parsedLlmResponse.records || parsedLlmResponse.records.length === 0)) {
    if (context.data.invoices) parsedLlmResponse.records = context.data.invoices;
    else if (context.data.bills) parsedLlmResponse.records = context.data.bills;
    else if (context.data.inventory?.records) parsedLlmResponse.records = context.data.inventory.records;
  }

  const finalRecordType = intent === 'receivables' ? 'receivables' : intent === 'payables' ? 'payables' : intent === 'inventory' ? 'inventory' : null;

  // Format response maintaining backward compatibility for legacy UI fields
  const finalResponse = {
    question,
    intent,
    recordType: finalRecordType,
    answerType: parsedLlmResponse.answerType || context.answerType,
    directAnswer: parsedLlmResponse.directAnswer || parsedLlmResponse.cfoSummary || '',
    summary: parsedLlmResponse.summary || parsedLlmResponse.quantitativeAnalysis || '',
    period: parsedLlmResponse.period?.label || period.label,
    periodDetails: parsedLlmResponse.period || { label: period.label, start: period.startISO, end: period.endISO },
    facts: (parsedLlmResponse.facts && parsedLlmResponse.facts.length > 0 ? parsedLlmResponse.facts : fallbackFacts).map(f => ({
      metric: f.label || f.metric || 'Financial Indicator',
      value: f.value || '₹0',
      source: f.source || 'General Ledger / Chart of Accounts',
      period: period.label,
      verification: (f.source && (f.source.includes('Account') || f.source.includes('Ledger') || f.source.includes('Journal') || f.source.includes('COA')))
        ? 'Posted Accounting Data'
        : ((f.source && (f.source.includes('Calculat') || f.source.includes('Equation') || f.source.includes('Formula'))) ? 'Calculated Metric' : 'Posted Accounting Data')
    })),
    calculations: parsedLlmResponse.calculations || [],
    formula: intent === 'cash_runway' ? {
      name: 'Cash Runway Estimation',
      equation: 'Liquid Cash & Bank ÷ Daily Operating Burn Rate',
      steps: [
        `Verified Liquid Cash: ₹${(context.data.runway?.currentLiquidFunds || 0).toLocaleString('en-IN')}`,
        `Monthly Burn Rate (30-day verified): ₹${(context.data.runway?.monthlyBurnRate || 0).toLocaleString('en-IN')}`,
        `Daily Burn Rate: ₹${(context.data.runway?.dailyBurn || 0).toLocaleString('en-IN')}/day`,
        `Computed Cash Runway: ${context.data.runway?.runwayDays || 0} Days`
      ]
    } : (intent === 'scenario_analysis' ? {
      name: 'Scenario Capital Feasibility',
      equation: 'Residual Buffer = Current Cash - Down Payment - 14-Day Vendor Obligations',
      steps: [
        `Current Liquid Funds: ₹${(context.data.scenarioEvaluation?.currentCash || 0).toLocaleString('en-IN')}`,
        `Upfront Capital Outlay: ₹${(context.data.scenarioEvaluation?.downPayment || 0).toLocaleString('en-IN')}`,
        `Cash After Outlay: ₹${(context.data.scenarioEvaluation?.cashAfterDownPayment || 0).toLocaleString('en-IN')}`,
        `14-Day Maturing Bills: ₹${(context.data.scenarioEvaluation?.dueIn14Days || 0).toLocaleString('en-IN')}`,
        `Net Safety Buffer: ₹${(context.data.scenarioEvaluation?.bufferAfter14DayBills || 0).toLocaleString('en-IN')}`
      ]
    } : (intent === 'profitability' ? {
      name: 'Profit & Loss Calculation',
      equation: 'Net Profit = Revenue - COGS - Operating Expenses',
      steps: [
        `Revenue: ₹${(context.data.profitAndLoss?.revenue || 0).toLocaleString('en-IN')}`,
        `COGS: ₹${(context.data.profitAndLoss?.cogs || 0).toLocaleString('en-IN')}`,
        `Gross Profit: ₹${(context.data.profitAndLoss?.grossProfit || 0).toLocaleString('en-IN')} (${context.data.profitAndLoss?.grossMarginPct || 0}%)`,
        `Operating Expenses: ₹${(context.data.profitAndLoss?.operatingExpenses || 0).toLocaleString('en-IN')}`,
        `Net Profit: ₹${(context.data.profitAndLoss?.netProfit || 0).toLocaleString('en-IN')} (${context.data.profitAndLoss?.netMarginPct || 0}%)`
      ]
    } : null)),
    records: parsedLlmResponse.records || [],
    risks: parsedLlmResponse.risks || [],
    recommendations: parsedLlmResponse.recommendations || [],
    missingData: (context.dataQuality?.missing || []).map(m => ({
      item: m,
      reason: 'No transaction entries recorded for this reporting window in MongoDB',
      impact: 'Referencing general ledger account balances'
    })),
    confidence: parsedLlmResponse.confidence || (context.dataQuality.complete ? 'high' : 'medium'),
    dataQuality: context.dataQuality,
    llmProvider: groqApiKey ? 'Groq Cloud API' : 'Deterministic Intelligence Engine',
    llmModel: groqModel,

    // Legacy fields for backward compatibility with existing components
    evaluation: {
      verdict: parsedLlmResponse.verdict || 'Approved / Recommended',
      verdictColor: parsedLlmResponse.verdictColor || 'emerald',
      directAnswer: parsedLlmResponse.directAnswer || '',
      cfoSummary: parsedLlmResponse.directAnswer || parsedLlmResponse.summary || '',
      quantitativeAnalysis: parsedLlmResponse.summary || '',
      riskAssessment: (parsedLlmResponse.risks && parsedLlmResponse.risks[0]) || 'Liquidity risk if cash collections are delayed.',
      tacticalDirectives: (parsedLlmResponse.recommendations || []).map(r => typeof r === 'string' ? r : `${r.action} (${r.reason})`),
      keyMetrics: {
        cashImpact: parsedLlmResponse.facts?.[0]?.value || 'Verified',
        marginImpact: parsedLlmResponse.calculations?.[0]?.result || 'Calculated',
        runwayChange: 'Tracked'
      }
    },
    answeredAt: new Date()
  };

  // 4. Save to CfoConversation if conversationId provided
  if (conversationId && userId) {
    try {
      if (!conversationDoc) {
        conversationDoc = new CfoConversation({
          businessId,
          userId,
          conversationId,
          messages: []
        });
      }

      conversationDoc.messages.push({
        role: 'user',
        question,
        intent,
        timestamp: new Date()
      });

      conversationDoc.messages.push({
        role: 'assistant',
        answer: finalResponse,
        intent,
        period: finalResponse.period,
        timestamp: new Date()
      });

      // Keep only last 10 messages for performance and state cleanliness
      if (conversationDoc.messages.length > 10) {
        conversationDoc.messages = conversationDoc.messages.slice(-10);
      }

      conversationDoc.lastActivity = new Date();
      await conversationDoc.save();
    } catch (saveErr) {
      console.warn('Failed to save CFO conversation turn:', saveErr.message);
    }
  }

  return finalResponse;
};
