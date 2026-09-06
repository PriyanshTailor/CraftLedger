import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ShieldAlert, TrendingDown, DollarSign,
  Percent, ArrowRight, RefreshCw, Sparkles, Filter,
  CheckCircle2, ShoppingCart, ShoppingBag, Package, Calculator,
  TrendingUp, ShieldCheck, Download, AlertOctagon, Layers, ArrowUpRight,
  ChevronLeft
} from 'lucide-react';
import { intelligenceService } from '../services/intelligenceService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

export function ProfitLeaks() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'low_margin_product' | 'rising_purchase_cost' | 'excessive_discount' | 'increasing_expenses'
  const [severityFilter, setSeverityFilter] = useState('all'); // 'all' | 'Critical' | 'Warning'

  const fetchLeaks = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const res = await intelligenceService.getProfitLeaks();
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      } else if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load profit leaks:', err);
      setError('Unable to detect profit leaks. Please check connection and try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaks();
  }, []);

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
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-xl p-4 animate-pulse"></div>
          ))}
        </div>
        <div className="h-80 bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
          <p className="text-slate-700 font-semibold text-base">Auditing Database for Operational Profit Leaks...</p>
          <p className="text-xs text-slate-400">Inspecting products, sales discounts, purchase costs & overhead expenses</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-12 text-center bg-white border border-red-200 rounded-2xl shadow-sm space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Failed to Detect Profit Leaks</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">{error || 'Data is unavailable'}</p>
        <Button onClick={() => fetchLeaks()} variant="primary">
          <RefreshCw className="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const { summary = {}, leaks = [], aiRecoveryPlan = {}, llmModel = 'qwen/qwen3.8-27b', mlProfitabilityRisk = null } = data;
  const { categoryBreakdown = {} } = summary;

  const filteredLeaks = leaks.filter(leak => {
    const matchesCat = activeCategory === 'all' || leak.category === activeCategory;
    const matchesSev = severityFilter === 'all' || leak.severity === severityFilter;
    return matchesCat && matchesSev;
  });

  return (
    <div className="space-y-6 pb-12">
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5 mb-1 flex-wrap">
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-slate-700" />
              Profit Leak Detection Engine
            </h1>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs font-semibold py-0.5 px-2.5">
              <span className="w-2 h-2 rounded-full bg-slate-500 animate-pulse mr-1.5 inline-block" />
              {summary.totalLeaksCount || leaks.length} Active Leaks Flagged
            </Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Audits low-margin products, supplier cost surges, discretionary discounts & overhead creep.
          </p>
          {mlProfitabilityRisk && (
            <div className="flex items-center gap-2 mt-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border bg-slate-50 text-slate-700 border-slate-200">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                ML Ensemble Risk: {mlProfitabilityRisk.overallRiskScore}/100 ({mlProfitabilityRisk.overallRiskTier})
                {mlProfitabilityRisk.highRiskOrderCount > 0 && (
                  <span className="ml-1 text-[10px] opacity-80 underline">
                    • {mlProfitabilityRisk.highRiskOrderCount} orders at risk
                  </span>
                )}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
                Projected Gross Margin: {mlProfitabilityRisk.expectedGrossMarginPercentage}%
              </span>
              {mlProfitabilityRisk.mitigationSimulation?.potentialMarginRecovery && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-50 text-slate-700 border border-slate-200">
                  ML Hedging Upside: +₹{Math.round(mlProfitabilityRisk.mitigationSimulation.potentialMarginRecovery / 1000)}k
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchLeaks(true)}
            disabled={refreshing}
            className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs h-9"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Scanning...' : 'Re-Scan Database'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="text-slate-700 border-slate-300 hover:bg-slate-50 text-xs h-9"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Audit
          </Button>
        </div>
      </div>

      {/* KPI Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Bleed Exposure</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{fmt(summary.totalFinancialBleed)}</div>
          <p className="text-xs text-slate-400 mt-1">{summary.criticalCount} Critical • {summary.warningCount} Warnings</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Low-Margin Products</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{fmt(categoryBreakdown.lowMargin?.amount)}</div>
          <p className="text-xs text-slate-400 mt-1">{categoryBreakdown.lowMargin?.count || 0} Products Under Target</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Discounts Surrendered</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{fmt(categoryBreakdown.excessiveDiscount?.amount)}</div>
          <p className="text-xs text-slate-400 mt-1">{categoryBreakdown.excessiveDiscount?.count || 0} Orders Exceeding Threshold</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overhead & Cost Hikes</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">
            {fmt((categoryBreakdown.risingPurchaseCost?.amount || 0) + (categoryBreakdown.increasingExpenses?.amount || 0))}
          </div>
          <p className="text-xs text-slate-400 mt-1">Payroll Overtime & Power Creep</p>
        </div>
      </div>

      {/* Groq AI Senior CFO Profit Leak Recovery Strategy */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  AI CFO Margin Recovery Roadmap
                  <Badge variant="secondary" className="text-[10px] uppercase font-bold bg-slate-100 text-slate-700">
                    Groq Cloud • {llmModel}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-slate-500">Autonomous strategy to plug operational leaks and restore EBITDA</p>
              </div>
            </div>
            {aiRecoveryPlan.estimatedRecoverableProfit && (
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 text-xs font-bold py-1 px-2.5">
                {aiRecoveryPlan.estimatedRecoverableProfit}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Executive CFO Diagnostic</p>
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {aiRecoveryPlan.executiveSummary}
              </p>
              {aiRecoveryPlan.topPriorityPill && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Immediate Focus: {aiRecoveryPlan.topPriorityPill}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Strategic Recovery Pillars */}
          {aiRecoveryPlan.strategicRecoveryRoadmap && aiRecoveryPlan.strategicRecoveryRoadmap.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              {aiRecoveryPlan.strategicRecoveryRoadmap.map((pillar, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-navy uppercase tracking-wider">
                        {pillar.domain}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {pillar.expectedSavings}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{pillar.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Tabs & Severity Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: `All Leaks (${leaks.length})` },
            { id: 'low_margin_product', label: `Low-Margin SKUs (${categoryBreakdown.lowMargin?.count || 0})` },
            { id: 'rising_purchase_cost', label: `Rising Costs (${categoryBreakdown.risingPurchaseCost?.count || 0})` },
            { id: 'excessive_discount', label: `Discounts (${categoryBreakdown.excessiveDiscount?.count || 0})` },
            { id: 'increasing_expenses', label: `Expenses (${categoryBreakdown.increasingExpenses?.count || 0})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
                activeCategory === tab.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Severity:</span>
          <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-semibold">
            <button
              onClick={() => setSeverityFilter('all')}
              className={cn('px-2.5 py-1 rounded-md transition-all', severityFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600')}
            >
              All
            </button>
            <button
              onClick={() => setSeverityFilter('Critical')}
              className={cn('px-2.5 py-1 rounded-md transition-all', severityFilter === 'Critical' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600')}
            >
              Critical
            </button>
            <button
              onClick={() => setSeverityFilter('Warning')}
              className={cn('px-2.5 py-1 rounded-md transition-all', severityFilter === 'Warning' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600')}
            >
              Warning
            </button>
          </div>
        </div>
      </div>

      {/* Leaks Feed */}
      <div className="space-y-3">
        {filteredLeaks.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-800">No Profit Leaks in This Category</h4>
            <p className="text-xs text-slate-500 mt-1">Operational standards and pricing policies are healthy here.</p>
          </div>
        ) : (
          filteredLeaks.map(leak => {
            const isCritical = leak.severity === 'Critical';

            return (
              <Card
                key={leak.id}
                className="border border-slate-200 bg-white transition-all hover:shadow-md"
              >
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                    <div className="flex items-start gap-3.5 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        {leak.category === 'low_margin_product' && <Percent className="w-5 h-5" />}
                        {leak.category === 'rising_purchase_cost' && <ShoppingBag className="w-5 h-5" />}
                        {leak.category === 'excessive_discount' && <DollarSign className="w-5 h-5" />}
                        {leak.category === 'increasing_expenses' && <Calculator className="w-5 h-5" />}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={cn(
                            'text-[10px] font-bold uppercase py-0.5 px-2',
                            isCritical ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 border-slate-200'
                          )}>
                            {leak.severity}
                          </Badge>
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {leak.categoryLabel}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {leak.affectedEntity?.name}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-slate-900 leading-snug">
                          {leak.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {leak.rootCause}
                        </p>

                        {/* Benchmark vs Actual badge bar */}
                        <div className="flex items-center gap-3 pt-1 text-xs">
                          <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-medium">
                            Current: <strong className="text-slate-900">{leak.currentValue}</strong>
                          </span>
                          <span className="bg-slate-100 px-2.5 py-1 rounded text-slate-700 font-medium">
                            Benchmark: <strong className="text-slate-900">{leak.benchmarkValue}</strong>
                          </span>
                        </div>

                        {/* Suggested Remedy Box */}
                        <div className="mt-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-900">CFO Suggested Action: </span>
                            {leak.remedy}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Bleed amount & Action button */}
                    <div className="flex md:flex-col items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0 min-w-[170px]">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Profit Bleed</span>
                        <span className="text-xl font-bold text-slate-900">
                          -{fmt(leak.financialExposure)}
                        </span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-slate-700 hover:text-royal hover:border-royal font-semibold h-8"
                        onClick={() => navigate(leak.route || '/dashboard')}
                      >
                        Investigate Source <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ProfitLeaks;
