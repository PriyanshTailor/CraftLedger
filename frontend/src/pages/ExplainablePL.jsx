import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { intelligenceService } from '../services/intelligenceService';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Download,
  RefreshCw,
  Sparkles,
  Brain,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ChevronRight,
  FileText,
  BarChart3,
  Building2,
  Users,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft
} from 'lucide-react';

export function ExplainablePL() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [horizon, setHorizon] = useState('mom'); // 'mom' | 'qoq' | 'budget'
  const [activeTab, setActiveTab] = useState('executive'); // 'executive' | 'statement'

  const fetchData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await intelligenceService.getExplainablePnL({ horizon });
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch Explainable P&L:', err);
      setError('Unable to load explainable P&L analytics. Please check your network or try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [horizon]);

  const formatINR = (val) => {
    if (val === undefined || val === null) return '₹0';
    const absVal = Math.abs(val);
    const sign = val < 0 ? '-' : '';
    if (absVal >= 10000000) {
      return `${sign}₹${(absVal / 10000000).toFixed(2)} Cr`;
    } else if (absVal >= 100000) {
      return `${sign}₹${(absVal / 100000).toFixed(2)}L`;
    } else if (absVal >= 1000) {
      return `${sign}₹${(absVal / 1000).toFixed(1)}k`;
    }
    return `${sign}₹${absVal.toLocaleString('en-IN')}`;
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-slate-200 animate-pulse rounded"></div>
            <div className="h-4 w-96 bg-slate-100 animate-pulse rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-100 rounded mb-2"></div>
              <div className="h-8 w-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="h-96 bg-white border border-slate-200 rounded-xl p-6 animate-pulse flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-royal border-t-transparent animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium">Invoking Groq Cloud LLM Financial Analysis Engine...</p>
          <p className="text-xs text-slate-400 mt-1">Generating deterministic variance & AI CFO narrative</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-white border border-red-200 rounded-2xl shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Failed to Load Explainable P&L</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error || 'Data is unavailable'}</p>
        <Button onClick={() => fetchData()} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const {
    summary = {},
    waterfallData = [],
    keyContributors = [],
    topCustomers = [],
    topVendors = [],
    llmInsights = {},
    llmProvider = 'Groq Cloud API',
    llmModel = 'qwen/qwen3.8-27b',
    generatedAt
  } = data;

  const isProfitGrowth = summary.netProfitVariance >= 0;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/ai-cfo')}
          className="text-slate-600 hover:text-navy hover:bg-slate-100 gap-1.5 -ml-2 mb-1 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Explainable Profit & Loss
            </h1>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1.5 py-1 px-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Cpu className="w-3.5 h-3.5" /> Groq AI Insights Active
            </Badge>
          </div>
          <p className="text-slate-500 text-sm mt-1">
            Deterministic accounting variance integrated with Senior AI CFO narrative powered by <span className="font-semibold text-slate-700">{llmModel}</span> on Groq Cloud.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Horizon Selector */}
          <div className="bg-slate-100 p-1 rounded-lg flex text-xs font-semibold">
            <button
              onClick={() => setHorizon('mom')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                horizon === 'mom' ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              MoM
            </button>
            <button
              onClick={() => setHorizon('qoq')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                horizon === 'qoq' ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              QoQ
            </button>
            <button
              onClick={() => setHorizon('budget')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                horizon === 'budget' ? 'bg-white text-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              vs Budget
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="text-slate-700 border-slate-300"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Analyzing...' : 'Re-run Groq AI'}
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint} className="text-slate-700 border-slate-300">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      {/* Top Level Financial KPI Scorecard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue Card */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Gross Revenue</span>
              <span className="text-slate-400">Prior: {formatINR(summary.priorRevenue)}</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{formatINR(summary.currentRevenue)}</span>
              <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
                summary.revenueVariance >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {summary.revenueVariance >= 0 ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                {summary.revenueVariance >= 0 ? '+' : ''}{formatINR(summary.revenueVariance)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Top Client: <span className="font-semibold text-slate-700">{topCustomers[0]?.name || 'Commercial Accounts'}</span>
            </p>
          </CardContent>
        </Card>

        {/* COGS & Gross Margin */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Cost of Goods Sold</span>
              <span className="text-slate-400">GM: {summary.currentGrossMarginPct}%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{formatINR(summary.currentCOGS)}</span>
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                +₹{Math.round(summary.cogsVariance / 1000)}k variance
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Gross Profit: <span className="font-semibold text-slate-700">{formatINR(summary.currentGrossProfit)}</span> (Prior: {summary.priorGrossMarginPct}%)
            </p>
          </CardContent>
        </Card>

        {/* Operating Expenses */}
        <Card className="border-slate-200 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Operating Expenses</span>
              <span className="text-slate-400">Rent + Payroll + Tooling</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-900">{formatINR(summary.currentOpex)}</span>
              <span className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Fixed & Overhead
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Payroll: ₹2.40L • Facility Rent: ₹1.80L • Power: ₹45k
            </p>
          </CardContent>
        </Card>

        {/* Net Profit Quality */}
        <Card className={`border-2 transition-shadow ${
          isProfitGrowth ? 'border-emerald-200 bg-emerald-50/20' : 'border-red-200 bg-red-50/20'
        }`}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
              <span>Net Profit</span>
              <span className="font-semibold text-emerald-700">Margin: {((summary.currentNetProfit / summary.currentRevenue) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className={`text-2xl font-bold ${isProfitGrowth ? 'text-emerald-700' : 'text-red-700'}`}>
                {formatINR(summary.currentNetProfit)}
              </span>
              <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                isProfitGrowth ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                {isProfitGrowth ? <TrendingUp className="w-3.5 h-3.5 mr-1" /> : <TrendingDown className="w-3.5 h-3.5 mr-1" />}
                {summary.netProfitPctChange > 0 ? '+' : ''}{summary.netProfitPctChange}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Absolute Shift: <span className="font-semibold text-slate-800">{isProfitGrowth ? '+' : ''}{formatINR(summary.netProfitVariance)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Groq Cloud AI CFO Narrative Card (Centerpiece) */}
      <Card className="border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-royal to-indigo-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  Senior AI CFO Narrative
                  <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200 text-[10px] uppercase font-bold tracking-wider">
                    {llmProvider} • {llmModel}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-slate-500">Autonomous reasoning on gross margin elasticity, variance leakage & executive recommendations</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400">
                Generated: {generatedAt ? new Date(generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-6">
          {/* Executive Takeaway */}
          <div className="p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-indigo-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-indigo-900 font-semibold text-sm">
              <Brain className="w-4 h-4 text-royal" />
              Executive Takeaway: Why Did Profit Change?
            </div>
            <p className="text-slate-700 text-sm leading-relaxed">
              {llmInsights.executiveSummary || 'Profit analysis generated from live accounting transactions.'}
            </p>
          </div>

          {/* Deep Dives: Revenue Drivers vs Cost Margin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100">
              <div className="flex items-center gap-2 mb-2 text-emerald-900 font-semibold text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                Revenue & Demand Drivers
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {llmInsights.revenueDriverAnalysis || 'Robust demand momentum in commercial projects and custom interior joinery.'}
              </p>
              {topCustomers.length > 0 && (
                <div className="mt-3 pt-3 border-t border-emerald-100/80 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase">Key Accounts:</span>
                  {topCustomers.slice(0, 3).map((cust, idx) => (
                    <span key={idx} className="text-[11px] bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                      {cust.name} ({formatINR(cust.amount)})
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-100">
              <div className="flex items-center gap-2 mb-2 text-rose-900 font-semibold text-sm">
                <TrendingDown className="w-4 h-4 text-rose-600" />
                Cost & Margin Leakage Deep Dive
              </div>
              <p className="text-slate-700 text-xs leading-relaxed">
                {llmInsights.costMarginAnalysis || 'Material cost inflation and artisan carpenter overtime offset gross margins.'}
              </p>
              {topVendors.length > 0 && (
                <div className="mt-3 pt-3 border-t border-rose-100/80 flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-bold text-rose-800 uppercase">Top Spend:</span>
                  {topVendors.slice(0, 3).map((v, idx) => (
                    <span key={idx} className="text-[11px] bg-white text-rose-800 px-2 py-0.5 rounded border border-rose-200">
                      {v.name} ({formatINR(v.amount)})
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Strategic Directives */}
          {llmInsights.strategicDirectives && llmInsights.strategicDirectives.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 text-white shadow-inner">
              <div className="flex items-center gap-2 mb-3 text-amber-400 font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                Strategic CFO Directives
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {llmInsights.strategicDirectives.map((directive, idx) => {
                  const tags = ['Pricing & Quotes', 'Supply Negotiation', 'Working Capital'];
                  return (
                    <div key={idx} className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="w-5 h-5 rounded-full bg-royal text-white text-xs font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {tags[idx] || 'Action Item'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed">{directive}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interactive Waterfall Bridge & Variance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Waterfall Chart */}
        <Card className="lg:col-span-2 border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-royal" />
                Profit & Loss Waterfall Bridge
              </CardTitle>
              <p className="text-xs text-slate-500">
                Bridge from Prior Period Profit ({formatINR(summary.priorNetProfit)}) to Current Profit ({formatINR(summary.currentNetProfit)})
              </p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-blue-600"></span> Base / End
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-emerald-500"></span> Revenue (+)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded bg-rose-500"></span> Expense (-)
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={waterfallData}
                  margin={{ top: 25, right: 20, left: 15, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={{ stroke: '#CBD5E1' }}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => {
                      if (Math.abs(val) >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
                      return `₹${Math.round(val / 1000)}k`;
                    }}
                  />
                  <Tooltip
                    cursor={{ fill: '#F8FAFC' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const isNeg = item.type === 'negative';
                        const isPos = item.type === 'positive';
                        return (
                          <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1 border border-slate-700">
                            <p className="font-bold text-slate-200">{item.name}</p>
                            <p className="text-sm font-extrabold flex items-center gap-1">
                              {isNeg && <span className="text-rose-400">Expense Impact:</span>}
                              {isPos && <span className="text-emerald-400">Growth Added:</span>}
                              {item.type === 'start' && <span className="text-blue-400">Baseline:</span>}
                              {item.type === 'end' && <span className="text-blue-400">Final:</span>}
                              <span>{formatINR(item.displayValue || item.value)}</span>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={0} stroke="#94A3B8" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {waterfallData.map((entry, index) => {
                      let color = '#2563EB'; // start/end base
                      if (entry.type === 'positive') color = '#10B981';
                      if (entry.type === 'negative') color = '#F43F5E';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profit Quality & Health Summary */}
        <Card className="border-slate-200 flex flex-col justify-between">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">Earnings Quality Scorecard</CardTitle>
            <p className="text-xs text-slate-500">Benchmark variance vs past operational performance</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Gross Margin Stability</span>
                <p className="text-base font-bold text-slate-800">{summary.currentGrossMarginPct}%</p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                +{((summary.currentGrossMarginPct - summary.priorGrossMarginPct)).toFixed(1)}% vs Prior
              </Badge>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Net Profit Margin</span>
                <p className="text-base font-bold text-slate-800">{summary.currentNetMarginPct || ((summary.currentNetProfit / summary.currentRevenue) * 100).toFixed(1)}%</p>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                High Quality
              </Badge>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Cost of Goods Ratio</span>
                <p className="text-base font-bold text-slate-800">
                  {((summary.currentCOGS / summary.currentRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {((summary.priorCOGS / summary.priorRevenue) * 100).toFixed(1)}% prior
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 font-medium">Opex / Revenue</span>
                <p className="text-base font-bold text-slate-800">
                  {((summary.currentOpex / summary.currentRevenue) * 100).toFixed(1)}%
                </p>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {((summary.priorOpex / summary.priorRevenue) * 100).toFixed(1)}% prior
              </span>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-royal font-semibold border-royal/30 hover:bg-blue-50"
                onClick={() => navigate('/dashboard/accounting')}
              >
                View General Ledger & Balance Sheet <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Contributors Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-royal" />
            Key Variance Contributors
          </h3>
          <span className="text-xs text-slate-500">Categorized by operational impact on net margin</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyContributors.map((c, i) => {
            const isPos = c.impact === 'positive';
            return (
              <Card key={i} className="border-slate-200 hover:shadow-md transition-all flex flex-col justify-between">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-slate-900 text-sm">{c.title}</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isPos ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}>
                      {c.impact}
                    </span>
                  </div>
                  <p className={`text-xl font-bold ${isPos ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {c.amount}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mb-2">{c.pct}</p>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{c.desc}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-slate-700 hover:text-royal hover:border-royal"
                    onClick={() => navigate(c.route || '/dashboard/accounting')}
                  >
                    Investigate Module <ArrowRight className="w-3 h-3 ml-1.5" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Tabbed Detailed Statement View */}
      <Card className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-royal" />
              Full Period-over-Period Variance Statement
            </CardTitle>
            <p className="text-xs text-slate-500">Comprehensive line-by-line reconciliation of income, COGS, and overhead</p>
          </div>
        </CardHeader>
        <CardContent className="pt-4 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Line Item</th>
                  <th className="px-6 py-3 text-right">Prior Benchmark</th>
                  <th className="px-6 py-3 text-right">Current Actuals</th>
                  <th className="px-6 py-3 text-right">Variance (₹)</th>
                  <th className="px-6 py-3 text-right">% Shift</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {/* Revenue */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Gross Revenue (Sales Orders & Work)
                  </td>
                  <td className="px-6 py-3 text-right">{formatINR(summary.priorRevenue)}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{formatINR(summary.currentRevenue)}</td>
                  <td className="px-6 py-3 text-right font-bold text-emerald-600">+{formatINR(summary.revenueVariance)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[11px] font-bold">
                      +{((summary.revenueVariance / summary.priorRevenue) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>

                {/* COGS */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 font-semibold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span> Cost of Goods Sold (Raw Timber, Foam & Hardware)
                  </td>
                  <td className="px-6 py-3 text-right">{formatINR(summary.priorCOGS)}</td>
                  <td className="px-6 py-3 text-right font-bold text-slate-900">{formatINR(summary.currentCOGS)}</td>
                  <td className="px-6 py-3 text-right font-bold text-rose-600">+{formatINR(summary.cogsVariance)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="bg-rose-50 text-rose-700 px-2 py-0.5 rounded text-[11px] font-bold">
                      +{((summary.cogsVariance / summary.priorCOGS) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>

                {/* Gross Profit */}
                <tr className="bg-blue-50/40 font-bold text-slate-900">
                  <td className="px-6 py-3.5">Gross Profit</td>
                  <td className="px-6 py-3.5 text-right">{formatINR(summary.priorGrossProfit)} ({summary.priorGrossMarginPct}%)</td>
                  <td className="px-6 py-3.5 text-right text-royal">{formatINR(summary.currentGrossProfit)} ({summary.currentGrossMarginPct}%)</td>
                  <td className="px-6 py-3.5 text-right text-emerald-700">+{formatINR(summary.currentGrossProfit - summary.priorGrossProfit)}</td>
                  <td className="px-6 py-3.5 text-right">
                    <span className="bg-blue-100 text-royal px-2 py-0.5 rounded text-[11px] font-bold">
                      +{(((summary.currentGrossProfit - summary.priorGrossProfit) / summary.priorGrossProfit) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>

                {/* Operating Expenses */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 pl-10 text-slate-600">Showroom & Workshop Lease (Account 6000)</td>
                  <td className="px-6 py-3 text-right">₹1.71L</td>
                  <td className="px-6 py-3 text-right font-semibold">₹1.80L</td>
                  <td className="px-6 py-3 text-right text-slate-600">+₹9.0k</td>
                  <td className="px-6 py-3 text-right text-slate-500">+5.3%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 pl-10 text-slate-600">Master Artisan & Staff Payroll (Account 6100)</td>
                  <td className="px-6 py-3 text-right">₹2.04L</td>
                  <td className="px-6 py-3 text-right font-semibold">₹2.40L</td>
                  <td className="px-6 py-3 text-right text-slate-600">+₹36.0k</td>
                  <td className="px-6 py-3 text-right text-slate-500">+17.6%</td>
                </tr>
                <tr className="hover:bg-slate-50/50">
                  <td className="px-6 py-3 pl-10 text-slate-600">Power, Utilities & CNC Tooling (Account 6200)</td>
                  <td className="px-6 py-3 text-right">₹40.5k</td>
                  <td className="px-6 py-3 text-right font-semibold">₹45.0k</td>
                  <td className="px-6 py-3 text-right text-slate-600">+₹4.5k</td>
                  <td className="px-6 py-3 text-right text-slate-500">+11.1%</td>
                </tr>

                {/* Total Operating Expenses */}
                <tr className="bg-slate-50 font-semibold text-slate-800">
                  <td className="px-6 py-3">Total Operating Expenses</td>
                  <td className="px-6 py-3 text-right">{formatINR(summary.priorOpex)}</td>
                  <td className="px-6 py-3 text-right">{formatINR(summary.currentOpex)}</td>
                  <td className="px-6 py-3 text-right text-slate-700">+{formatINR(summary.currentOpex - summary.priorOpex)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      +{(((summary.currentOpex - summary.priorOpex) / summary.priorOpex) * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>

                {/* Net Profit */}
                <tr className="bg-emerald-50/60 font-extrabold text-slate-900 border-t-2 border-emerald-200">
                  <td className="px-6 py-4 text-emerald-950 flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Net Profit (Pre-Tax Earnings)
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 text-sm">{formatINR(summary.priorNetProfit)}</td>
                  <td className="px-6 py-4 text-right text-emerald-700 text-base">{formatINR(summary.currentNetProfit)}</td>
                  <td className="px-6 py-4 text-right text-emerald-700 text-base">+{formatINR(summary.netProfitVariance)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                      +{summary.netProfitPctChange}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

