import React, { useEffect, useState } from 'react';
import {
  BrainCircuit, Activity, LineChart, Wallet, PieChart, Package,
  Calculator, Search, ShieldCheck, AlertTriangle, ArrowRight,
  Loader2, TrendingUp, TrendingDown, CheckCircle2, RefreshCw,
  Sparkles, ShieldAlert, DollarSign, Building2, HelpCircle,
  FileCheck2, Compass, Award, Send, ArrowUpRight, ArrowDownRight,
  Layers, ChevronRight, Check, Clock, AlertOctagon, Printer,
  Calendar, RotateCcw, Info
} from 'lucide-react';
import { intelligenceService } from '../services/intelligenceService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const GUIDED_DECISION_QUERIES = [
  {
    title: "Can I invest ₹10L in a 5-axis CNC router?",
    category: "CapEx / Machinery",
    tag: "Capital Allocation"
  },
  {
    title: "Should I hire 2 master carpenters this month?",
    category: "Artisan Payroll",
    tag: "Capacity"
  },
  {
    title: "How do I cover the ₹6.91L vendor bills due in 14 days?",
    category: "Liquidity Defense",
    tag: "Working Capital"
  },
  {
    title: "Should I stop offering 30-day credit to Amber Interiors?",
    category: "Credit Terms",
    tag: "Debtors"
  },
  {
    title: "What happens to net profit if timber costs rise by 12%?",
    category: "Margin Sensitivity",
    tag: "Cost Inflation"
  },
  {
    title: "How can I improve cash runway from 23 to 45 days?",
    category: "Cash Strategy",
    tag: "Cash Runway"
  }
];

const PERIOD_OPTIONS = [
  { id: 'this_month', label: 'This Month' },
  { id: 'last_month', label: 'Last Month' },
  { id: 'this_quarter', label: 'This Quarter' },
  { id: 'this_year', label: 'This FY' },
  { id: 'all_time', label: 'All-Time' },
];

export function AiCfo() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Interactive Decision Evaluation State
  const [questionInput, setQuestionInput] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('this_month');
  const [conversationId, setConversationId] = useState(() => `cfo-${Date.now()}`);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [activeEvaluation, setActiveEvaluation] = useState(null);

  const fetchOverview = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await intelligenceService.getAiCfoOverview();
      if (res.data?.success && res.data?.data) {
        setOverview(res.data.data);
      } else if (res.data) {
        setOverview(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI CFO Overview:', err);
      setError('Unable to load AI CFO guidance. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const handleEvaluateDecision = async (queryText, overridePeriod) => {
    const q = (queryText || questionInput).trim();
    if (!q) return;

    const periodToUse = overridePeriod || selectedPeriod;
    setQuestionInput(q);
    setSubmittingQuestion(true);

    try {
      const res = await intelligenceService.askQuestion(q, {
        period: periodToUse,
        conversationId
      });
      const data = res.data?.data || res.data;
      if (data) {
        setActiveEvaluation(data);
        setConversationHistory(prev => [
          ...prev,
          {
            role: 'user',
            text: q,
            period: data.period || periodToUse,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          {
            role: 'cfo',
            evaluation: data.evaluation,
            facts: data.facts,
            records: data.records,
            recordType: data.recordType,
            formula: data.formula,
            missingData: data.missingData,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error('Error asking CFO:', err);
      setActiveEvaluation({
        evaluation: {
          verdict: 'Operational Review Needed',
          verdictColor: 'amber',
          directAnswer: 'Unable to communicate with the live financial intelligence service.',
          cfoSummary: 'The AI CFO reasoning engine encountered a connection error. Please ensure backend services and database connections are healthy.',
          quantitativeAnalysis: 'Operating reserves should be maintained at safe baseline thresholds pending live data reconnect.',
          tacticalDirectives: [
            'Verify server status and MongoDB connectivity.',
            'Confirm financial transactions have been entered for this business.'
          ]
        },
        missingData: [
          { item: 'Live Service Response', reason: 'Network or server error during evaluation', impact: 'Fallback diagnostic returned' }
        ]
      });
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleResetConversation = () => {
    setConversationId(`cfo-${Date.now()}`);
    setConversationHistory([]);
    setActiveEvaluation(null);
    setQuestionInput('');
  };

  const fmt = (val) => {
    if (val === undefined || val === null) return '₹0';
    const abs = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)} Cr`;
    if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`;
    if (abs >= 1000) return `${sign}₹${Math.round(abs / 1000)}k`;
    return `${sign}₹${abs.toLocaleString('en-IN')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-28 bg-white border border-slate-200 rounded-xl p-6 animate-pulse flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-6 w-64 bg-slate-200 rounded"></div>
            <div className="h-4 w-96 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white border border-slate-200 rounded-xl p-4 animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-royal border-t-transparent animate-spin"></div>
          <p className="text-slate-700 font-semibold text-base">Synthesizing Live Financial Telemetry & AI CFO Reasoning...</p>
          <p className="text-xs text-slate-400">Querying MongoDB accounting balances & Groq Cloud LLM engine</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="p-12 text-center bg-white border border-red-200 rounded-2xl shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Failed to Load AI CFO Guidance</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error || 'Data is unavailable'}</p>
        <Button onClick={() => fetchOverview()} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const { telemetry = {}, cfoGuidance = {}, llmModel = 'qwen/qwen3.8-27b', llmProvider = 'Groq Cloud API' } = overview;
  const isLiquidityDeficit = telemetry.dueIn14Days > telemetry.totalLiquidFunds;
  const deficitAmount = telemetry.dueIn14Days - telemetry.totalLiquidFunds;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy via-slate-900 to-royal text-white p-6 sm:p-7 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-blue-200 shadow-inner">
                <BrainCircuit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
                  Virtual CFO Strategic Advisor
                </h1>
                <p className="text-blue-100 text-xs sm:text-sm mt-0.5">
                  Autonomous decision engine for the business owner powered by <span className="font-semibold text-white">{llmModel}</span> on Groq Cloud.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge className="bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-xs py-1 px-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5 inline-block"></span>
              Live DB Telemetry Active
            </Badge>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchOverview(true)}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Briefing'}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 text-xs h-9"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" /> Export PDF
            </Button>
          </div>
        </div>

        {/* Telemetry Quick Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">Pre-Tax Net Profit</span>
            <p className="text-xl font-black text-white mt-0.5">{fmt(telemetry.netProfit)}</p>
            <span className="text-[11px] text-emerald-300 font-medium">{telemetry.netMarginPct}% net margin</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">Liquid Cash & Bank</span>
            <p className="text-xl font-black text-white mt-0.5">{fmt(telemetry.totalLiquidFunds)}</p>
            <span className="text-[11px] text-blue-200 font-medium">Petty Cash + Bank Accounts</span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">14-Day Vendor Bills</span>
            <p className={`text-xl font-black mt-0.5 ${isLiquidityDeficit ? 'text-amber-300' : 'text-white'}`}>
              {fmt(telemetry.dueIn14Days)}
            </p>
            <span className={`text-[11px] font-semibold ${isLiquidityDeficit ? 'text-rose-300' : 'text-emerald-300'}`}>
              {isLiquidityDeficit ? `Deficit: -${fmt(deficitAmount)}` : 'Sufficient buffer'}
            </span>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <span className="text-[11px] text-blue-200 uppercase font-semibold tracking-wider">Cash Runway</span>
            <p className="text-xl font-black text-white mt-0.5">{telemetry.runwayDays} Days</p>
            <span className="text-[11px] text-blue-200 font-medium">Burn: ~{fmt(telemetry.monthlyBurnRate)}/mo</span>
          </div>
        </div>
      </div>

      {/* Executive CFO Intelligence Navigation Hub */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Executive Intelligence Deep Dives</h2>
            <p className="text-xs text-slate-400">Drill down into specialized financial engines and analytical models</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <Link
            to="/dashboard/reports/explainable-pl"
            className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Activity className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-navy">Explainable AI (P&L)</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Deterministic variance trees and operational margin attribution.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">P&L Attribution</span>
              <span className="text-royal font-medium flex items-center gap-0.5">Explore <ChevronRight className="w-3 h-3" /></span>
            </div>
          </Link>

          <Link
            to="/dashboard/profit-leaks"
            className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-navy">Profit Leaks Detection</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Uncover supplier cost surges, discount surrender & margin creep.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">Margin Recovery</span>
              <span className="text-royal font-medium flex items-center gap-0.5">Explore <ChevronRight className="w-3 h-3" /></span>
            </div>
          </Link>

          <Link
            to="/dashboard/cash-flow-forecast"
            className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-navy">Cash Flow Forecast</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                30-90 day runway modeling & liquidity cash trajectory engine.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">Liquidity Engine</span>
              <span className="text-royal font-medium flex items-center gap-0.5">Explore <ChevronRight className="w-3 h-3" /></span>
            </div>
          </Link>

          <Link
            to="/dashboard/anomalies"
            className="group p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-navy">Anomalies & Profit Risk</h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                Operational rule violations & order-level ML profitability risk.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-600">Risk & Compliance</span>
              <span className="text-royal font-medium flex items-center gap-0.5">Explore <ChevronRight className="w-3 h-3" /></span>
            </div>
          </Link>
        </div>
      </div>

      {/* CFO Morning Briefing Card */}
      <Card className="border-indigo-100 bg-white shadow-md">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-royal">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Executive CFO Diagnostic</CardTitle>
                <CardDescription className="text-xs">Holistic evaluation of profitability, liquidity stress points & working capital</CardDescription>
              </div>
            </div>
            {cfoGuidance.financialPillars && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 font-medium">Pillars:</span>
                <Badge variant={cfoGuidance.financialPillars.liquidityHealth === 'Good' ? 'success' : 'warning'} className="text-[10px]">
                  Liquidity: {cfoGuidance.financialPillars.liquidityHealth}
                </Badge>
                <Badge variant={cfoGuidance.financialPillars.marginStrength === 'Robust' ? 'success' : 'secondary'} className="text-[10px]">
                  Margins: {cfoGuidance.financialPillars.marginStrength}
                </Badge>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {/* Headline */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-royal shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">CFO Key Takeaway for Owner</p>
              <p className="text-sm font-semibold text-slate-900 leading-snug">
                "{cfoGuidance.executiveHeadline || 'Operating margin expansion is solid, but vendor obligations require focused collection.'}"
              </p>
            </div>
          </div>

          {/* Diagnostic Prose */}
          <div className="prose prose-slate max-w-none text-xs text-slate-700 leading-relaxed whitespace-pre-line bg-blue-50/20 p-4 rounded-xl border border-blue-100/60">
            {cfoGuidance.comprehensiveBriefing}
          </div>
        </CardContent>
      </Card>

      {/* Strategic Decision Matrix */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-royal" />
              Strategic Financial Decisions (Owner Sign-Off)
            </h3>
            <p className="text-xs text-slate-500">Autonomous decisions evaluated and prioritized by your AI CFO</p>
          </div>
          <Badge variant="outline" className="bg-slate-50 text-slate-700 text-xs">
            {cfoGuidance.strategicDecisions?.length || 3} Active Decisions
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(cfoGuidance.strategicDecisions || []).map((dec, idx) => {
            const isAggressive = dec.verdict === 'Proceed Aggressively';
            const isRisk = dec.verdict === 'High Financial Risk';
            const isConditional = dec.verdict === 'Approve with Conditions';

            return (
              <Card key={idx} className="border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {dec.category || 'Strategic Action'}
                    </span>
                    <Badge
                      className={cn(
                        'text-[10px] font-bold uppercase py-0.5 px-2',
                        isAggressive && 'bg-emerald-100 text-emerald-800 border-emerald-300',
                        isRisk && 'bg-rose-100 text-rose-800 border-rose-300',
                        isConditional && 'bg-amber-100 text-amber-800 border-amber-300'
                      )}
                    >
                      {dec.verdict}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900 line-clamp-2">
                    {dec.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-3 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2.5">
                      <span className="text-[10px] font-bold text-royal uppercase tracking-wider block mb-0.5">Quantified Impact</span>
                      <span className="text-xs font-bold text-slate-900">{dec.financialImpact}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-3">
                      {dec.strategicRationale}
                    </p>
                  </div>

                  {dec.actionSteps && dec.actionSteps.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Action Plan</span>
                      <ul className="space-y-1 text-[11px] text-slate-700">
                        {dec.actionSteps.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-700 text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Interactive AI CFO Decision Copilot (Ask Anything) */}
      <Card className="border-slate-200 shadow-md">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-royal text-white flex items-center justify-center shadow-sm">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  AI CFO Decision Copilot: Ask Your Financial Advisor Anything
                </CardTitle>
                <CardDescription className="text-xs">
                  Submit an operational proposal or strategic question grounded strictly in your MongoDB financial records
                </CardDescription>
              </div>
            </div>

            {(conversationHistory.length > 0 || activeEvaluation) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetConversation}
                className="text-xs h-8 px-3 border-slate-300 text-slate-600 hover:text-slate-900 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-royal" /> New Inquiry / Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-5">
          {/* Reporting Period Selector Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/90">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Calendar className="w-4 h-4 text-royal shrink-0" />
              <span>Reporting Window:</span>
              <span className="text-[11px] font-normal text-slate-500 hidden sm:inline">(All computations strictly respect this period)</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    setSelectedPeriod(opt.id);
                    if (questionInput.trim() && !submittingQuestion) {
                      handleEvaluateDecision(questionInput, opt.id);
                    }
                  }}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-medium transition-all',
                    selectedPeriod === opt.id
                      ? 'bg-royal text-white shadow-xs font-semibold'
                      : 'bg-white text-slate-600 border border-slate-200 hover:border-royal/50 hover:text-royal'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Decision Prompt Chips */}
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Common Owner Inquiries & Scenarios:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {GUIDED_DECISION_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleEvaluateDecision(item.title)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-royal hover:bg-blue-50/50 text-left transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold text-royal uppercase">{item.tag}</span>
                    <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-royal group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <span className="text-xs font-medium text-slate-800 group-hover:text-royal leading-snug">
                    "{item.title}"
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input Form */}
          <div className="pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEvaluateDecision();
              }}
              className="flex gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  placeholder="e.g. How much liquid cash do we have right now? Which customers owe us money?"
                  className="w-full h-11 px-4 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-royal/30 focus:border-royal outline-none pr-10 shadow-sm"
                />
                {questionInput && (
                  <button
                    type="button"
                    onClick={() => setQuestionInput('')}
                    className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Button
                type="submit"
                disabled={submittingQuestion || !questionInput.trim()}
                className="bg-royal hover:bg-blue-700 text-white h-11 px-5 text-xs font-semibold rounded-xl shadow-sm"
              >
                {submittingQuestion ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-1.5" /> Evaluate Decision
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Dynamic Evaluation Output */}
          {activeEvaluation && activeEvaluation.evaluation && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 shadow-sm space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Verdict Header & Reporting Period Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">CFO Ruling:</span>
                  <Badge
                    className={cn(
                      'text-xs font-bold px-3 py-1',
                      activeEvaluation.evaluation.verdictColor === 'emerald' && 'bg-emerald-100 text-emerald-800 border-emerald-300',
                      activeEvaluation.evaluation.verdictColor === 'rose' && 'bg-rose-100 text-rose-800 border-rose-300',
                      activeEvaluation.evaluation.verdictColor === 'amber' && 'bg-amber-100 text-amber-800 border-amber-300'
                    )}
                  >
                    {activeEvaluation.evaluation.verdict}
                  </Badge>

                  {activeEvaluation.intent && (
                    <Badge variant="outline" className="text-[11px] bg-white text-slate-700 border-slate-300 capitalize">
                      <ShieldCheck className="w-3 h-3 inline mr-1 text-royal" />
                      {activeEvaluation.intent.replace(/_/g, ' ')}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                  <span className="bg-white px-2.5 py-1 rounded-md border border-slate-200 font-medium">
                    <Calendar className="w-3 h-3 inline mr-1 text-royal" />
                    {activeEvaluation.period || 'Reporting Period'}
                  </span>
                  <span className="text-slate-400">
                    {activeEvaluation.llmModel || llmModel} on Groq
                  </span>
                </div>
              </div>

              {/* Direct Answer Highlight */}
              {activeEvaluation.evaluation.directAnswer && (
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 shadow-xs">
                  <div className="flex items-center gap-1.5 mb-1.5 text-royal font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-royal shrink-0" />
                    <span>Direct Answer:</span>
                  </div>
                  <p className="text-sm font-bold text-slate-900 leading-relaxed">
                    {activeEvaluation.evaluation.directAnswer}
                  </p>
                </div>
              )}

              {/* Executive Summary Statement */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Executive Takeaway</p>
                <p className="text-sm font-medium text-slate-800 leading-relaxed">
                  {activeEvaluation.evaluation.cfoSummary}
                </p>
              </div>

              {/* Missing Data Integrity Notice (if any) */}
              {activeEvaluation.missingData && activeEvaluation.missingData.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                    <Info className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Data Availability & Ledger Integrity Notice</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    The following transaction records have not yet been posted into your CraftLedger ledger for this window:
                  </p>
                  <ul className="space-y-1 text-xs text-amber-900 pt-0.5">
                    {activeEvaluation.missingData.map((m, mIdx) => (
                      <li key={mIdx} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                        <div>
                          <span className="font-semibold">{m.item}:</span> {m.reason}{' '}
                          {m.impact && <span className="text-amber-700 italic">({m.impact})</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Verified Financial Facts Grid */}
              {activeEvaluation.facts && activeEvaluation.facts.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Financial Facts
                    </p>
                    <span className="text-[11px] text-slate-400">Strictly sourced from database records</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {activeEvaluation.facts.map((fact, fIdx) => (
                      <div key={fIdx} className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-slate-600 truncate">{fact.metric}</span>
                          <Badge
                            className={cn(
                              'text-[9px] px-1.5 py-0.2 shrink-0',
                              fact.verification === 'Posted Accounting Data'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : fact.verification === 'Calculated Metric'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            )}
                          >
                            {fact.verification || 'Verified'}
                          </Badge>
                        </div>
                        <p className="text-lg font-black text-slate-900">{fact.value}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-100">
                          <span className="truncate">{fact.source}</span>
                          <span className="shrink-0 font-medium text-slate-500">{fact.period}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calculation Methodology Breakdown */}
              {activeEvaluation.formula && (
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Calculator className="w-4 h-4 text-royal" /> Calculation Methodology: {activeEvaluation.formula.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">Deterministic Engine</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-mono text-xs text-royal font-semibold">
                    Equation: {activeEvaluation.formula.equation}
                  </div>
                  {activeEvaluation.formula.steps && activeEvaluation.formula.steps.length > 0 && (
                    <ul className="space-y-1 text-xs text-slate-600 pt-1">
                      {activeEvaluation.formula.steps.map((step, sIdx) => (
                        <li key={sIdx} className="flex items-start gap-2">
                          <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {sIdx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Live Record Table (Evidence for Invoices, Bills, Inventory) */}
              {activeEvaluation.records && activeEvaluation.records.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-royal" /> Supporting Records ({activeEvaluation.records.length} items)
                    </p>
                    <span className="text-[11px] text-slate-400 capitalize">{activeEvaluation.recordType || 'Ledger'} Ledger Details</span>
                  </div>
                  <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                        {activeEvaluation.recordType === 'receivables' ? (
                          <tr>
                            <th className="py-2.5 px-3">Invoice #</th>
                            <th className="py-2.5 px-3">Customer</th>
                            <th className="py-2.5 px-3 text-right">Balance Due</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3 text-right">Overdue</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        ) : activeEvaluation.recordType === 'payables' ? (
                          <tr>
                            <th className="py-2.5 px-3">Bill #</th>
                            <th className="py-2.5 px-3">Vendor</th>
                            <th className="py-2.5 px-3 text-right">Balance Due</th>
                            <th className="py-2.5 px-3">Due Date</th>
                            <th className="py-2.5 px-3 text-right">Timing</th>
                            <th className="py-2.5 px-3">Status</th>
                          </tr>
                        ) : activeEvaluation.recordType === 'inventory' ? (
                          <tr>
                            <th className="py-2.5 px-3">SKU</th>
                            <th className="py-2.5 px-3">Product Name</th>
                            <th className="py-2.5 px-3 text-right">Current Stock</th>
                            <th className="py-2.5 px-3 text-right">Valuation</th>
                            <th className="py-2.5 px-3 text-right">Days Stagnant</th>
                          </tr>
                        ) : (
                          <tr>
                            {Object.keys(activeEvaluation.records[0]).slice(0, 5).map((k) => (
                              <th key={k} className="py-2.5 px-3 capitalize">{k}</th>
                            ))}
                          </tr>
                        )}
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeEvaluation.records.slice(0, 10).map((row, rIdx) => {
                          if (activeEvaluation.recordType === 'receivables') {
                            return (
                              <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 font-semibold text-royal">{row.invoiceNumber}</td>
                                <td className="py-2 px-3 text-slate-800">{row.customerName}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">{fmt(row.outstandingAmount)}</td>
                                <td className="py-2 px-3 text-slate-500">{new Date(row.dueDate).toLocaleDateString()}</td>
                                <td className="py-2 px-3 text-right">
                                  {row.overdueDays > 0 ? (
                                    <span className="text-rose-600 font-bold">{row.overdueDays}d overdue</span>
                                  ) : (
                                    <span className="text-emerald-600 font-medium">Due in {Math.abs(row.overdueDays)}d</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {row.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }
                          if (activeEvaluation.recordType === 'payables') {
                            return (
                              <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 font-semibold text-royal">{row.billNumber}</td>
                                <td className="py-2 px-3 text-slate-800">{row.vendorName}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">{fmt(row.balanceDue)}</td>
                                <td className="py-2 px-3 text-slate-500">{new Date(row.dueDate).toLocaleDateString()}</td>
                                <td className="py-2 px-3 text-right">
                                  {row.daysUntilDue < 0 ? (
                                    <span className="text-rose-600 font-bold">{Math.abs(row.daysUntilDue)}d overdue</span>
                                  ) : (
                                    <span className="text-slate-600">{row.daysUntilDue}d remaining</span>
                                  )}
                                </td>
                                <td className="py-2 px-3">
                                  <Badge variant="outline" className="text-[10px] capitalize">
                                    {row.status}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          }
                          if (activeEvaluation.recordType === 'inventory') {
                            return (
                              <tr key={rIdx} className="hover:bg-slate-50/60 transition-colors">
                                <td className="py-2 px-3 font-semibold text-royal">{row.sku}</td>
                                <td className="py-2 px-3 text-slate-800">{row.name}</td>
                                <td className="py-2 px-3 text-right text-slate-700">{row.currentStock}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">{fmt(row.valuation)}</td>
                                <td className="py-2 px-3 text-right text-amber-600 font-medium">{row.daysWithoutSale}d</td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={rIdx} className="hover:bg-slate-50/60">
                              {Object.values(row).slice(0, 5).map((val, vIdx) => (
                                <td key={vIdx} className="py-2 px-3 text-slate-700">
                                  {typeof val === 'number' ? fmt(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {activeEvaluation.records.length > 10 && (
                    <p className="text-[11px] text-slate-400 text-right">Showing top 10 of {activeEvaluation.records.length} records</p>
                  )}
                </div>
              ) : (
                activeEvaluation.recordType && (
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>No itemized {activeEvaluation.recordType} documents currently logged for this period. Total balances reflect general ledger postings.</span>
                  </div>
                )
              )}

              {/* Quantitative Analysis & Risk Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] font-bold text-royal uppercase tracking-wider block mb-1">
                    Financial Impact & Numbers (₹)
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeEvaluation.evaluation.quantitativeAnalysis}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                    Risk Assessment
                  </span>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeEvaluation.evaluation.riskAssessment || 'Review liquidity buffers before committing disbursements.'}
                  </p>
                </div>
              </div>

              {/* Tactical Directives */}
              {activeEvaluation.evaluation.tacticalDirectives && activeEvaluation.evaluation.tacticalDirectives.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-900 text-white">
                  <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Tactical Directives for Business Owner
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {activeEvaluation.evaluation.tacticalDirectives.map((directive, dIdx) => (
                      <li key={dIdx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-royal text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {dIdx + 1}
                        </span>
                        <span>{directive}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default AiCfo;
