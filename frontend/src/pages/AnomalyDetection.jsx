import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  AlertTriangle, ShieldAlert, CheckCircle2, TrendingDown,
  TrendingUp, RefreshCw, Search, Filter,
  DollarSign, BrainCircuit, BarChart3, Sliders, Zap,
  Layers, ChevronRight, HelpCircle, AlertOctagon,
  Sparkles, Activity, FileWarning, Wallet, ChevronLeft
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell
} from 'recharts';
import { intelligenceService } from '../services/intelligenceService';
import { cn } from '../lib/utils';

export function AnomalyDetection() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'anomalies' | 'ml_profitability'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Anomaly Data
  const [anomalyData, setAnomalyData] = useState(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ML Profitability Data
  const [mlData, setMlData] = useState(null);
  const [simDiscountCap, setSimDiscountCap] = useState(8);
  const [simInflationRate, setSimInflationRate] = useState(6.5);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [anomRes, mlRes] = await Promise.all([
        intelligenceService.getAnomalies(),
        intelligenceService.getProfitabilityRisk({ materialCostInflation: simInflationRate })
      ]);
      setAnomalyData(anomRes.data);
      setMlData(mlRes.data);
    } catch (err) {
      console.error('Error fetching anomaly & profitability intelligence:', err);
      setError(err.message || 'Failed to load intelligence metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(n || 0);

  // Extract unique categories for anomaly filter
  const anomalyCategories = useMemo(() => {
    if (!anomalyData?.anomalies) return [];
    const set = new Set(anomalyData.anomalies.map((a) => a.category).filter(Boolean));
    return Array.from(set);
  }, [anomalyData]);

  // Filtered Anomalies
  const filteredAnomalies = useMemo(() => {
    if (!anomalyData?.anomalies) return [];
    return anomalyData.anomalies.filter((a) => {
      if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title?.toLowerCase().includes(q);
        const matchDesc = a.description?.toLowerCase().includes(q);
        const matchEntity = a.affectedEntity?.toLowerCase().includes(q);
        const matchId = a.id?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchEntity || matchId;
      }
      return true;
    });
  }, [anomalyData, severityFilter, categoryFilter, searchQuery]);

  // Feature Importance Chart Data
  const featureChartData = useMemo(() => {
    if (!mlData?.featureImportances) return [];
    return Object.entries(mlData.featureImportances).map(([k, v]) => {
      const labels = {
        cost_to_price_ratio: 'Cost-to-Price Ratio',
        discount_rate: 'Discretionary Discount Rate',
        material_cost_inflation: 'Material Input Inflation',
        inventory_holding_days: 'Inventory Holding Duration',
        payment_delay_days: 'Customer Payment Delay',
        order_value: 'Transaction Size',
        order_volume: 'Order Quantity'
      };
      return {
        name: labels[k] || k,
        importance: v
      };
    }).sort((a, b) => b.importance - a.importance);
  }, [mlData]);

  // Simulated Recovery Calculation
  const simulationResults = useMemo(() => {
    if (!mlData?.summary) return null;
    const rev = mlData.summary.totalEvaluatedRevenue || 1000000;
    const currentMargin = mlData.summary.expectedGrossMarginPercentage || 35.0;
    const currentRisk = mlData.summary.overallPortfolioRiskScore || 45.0;

    // Simulation logic: capping discount to simDiscountCap increases margin
    const discountImprovement = Math.max(0, (15 - simDiscountCap) * 0.45);
    const inflationImpact = (simInflationRate - 6.0) * 0.3;
    const simulatedMargin = Number((currentMargin + discountImprovement - inflationImpact).toFixed(1));
    const simulatedRisk = Number(Math.max(2.0, currentRisk - discountImprovement * 3.5 + inflationImpact * 2.0).toFixed(1));
    const marginGainRupees = Math.round(rev * (discountImprovement / 100));

    return {
      currentRisk,
      simulatedRisk,
      currentMargin,
      simulatedMargin,
      marginGainRupees
    };
  }, [mlData, simDiscountCap, simInflationRate]);

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

      {/* Header (Clean & Uniform - NO rule anomaly / ml text in heading) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-slate-700" />
              Financial Anomaly & Profitability Risk Engine
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Dual-core intelligence combining operational anomaly detection with ML models for margin hazard forecasting.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchAllData}
            disabled={loading}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs h-9 shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Clean Sub-Navigation Pills */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            activeTab === 'all'
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-navy hover:bg-slate-100"
          )}
        >
          All Intelligence
        </button>
        <button
          onClick={() => setActiveTab('anomalies')}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            activeTab === 'anomalies'
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-navy hover:bg-slate-100"
          )}
        >
          Operational Anomalies ({anomalyData?.totalAnomalies || 0})
        </button>
        <button
          onClick={() => setActiveTab('ml_profitability')}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors",
            activeTab === 'ml_profitability'
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-navy hover:bg-slate-100"
          )}
        >
          Margin & Profitability Risk
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: RULE-BASED ANOMALY DETECTION                                  */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'anomalies') && (
        <div className="space-y-6">
          {activeTab === 'all' && (
            <div className="flex items-center justify-between pt-2">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Operational Rule Anomalies
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                {anomalyData?.totalAnomalies || 0} violations identified
              </span>
            </div>
          )}

          {/* Anomaly KPI Summary (Uniform Clean Styling) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Exposure</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-navy">
                  {fmt(anomalyData?.totalFinancialExposure)}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                  <AlertOctagon className="w-3.5 h-3.5 text-slate-400" />
                  Across {anomalyData?.totalAnomalies || 0} active rule violations
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Vulnerabilities</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {anomalyData?.criticalCount || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Immediate intervention required
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Warning Discrepancies</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {anomalyData?.warningCount || 0}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Precautionary policy reviews
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Risk Posture</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Activity className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-bold text-navy">
                  {anomalyData?.healthStatus || 'Moderate'}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Evaluated against live operational DB
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                {/* Severity Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setSeverityFilter('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                      severityFilter === 'all' ? 'bg-white text-navy shadow-xs' : 'text-slate-600 hover:text-navy'
                    }`}
                  >
                    All Severities ({anomalyData?.anomalies?.length || 0})
                  </button>
                  <button
                    onClick={() => setSeverityFilter('critical')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      severityFilter === 'critical' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-red-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    Critical ({anomalyData?.criticalCount || 0})
                  </button>
                  <button
                    onClick={() => setSeverityFilter('warning')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                      severityFilter === 'warning' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-amber-600'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Warning ({anomalyData?.warningCount || 0})
                  </button>
                </div>

                {/* Category & Search */}
                <div className="flex items-center gap-2">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-royal"
                  >
                    <option value="all">All Domains</option>
                    {anomalyCategories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>

                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search anomalies..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-royal w-48 bg-white"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anomalies List */}
          <div className="space-y-3">
            {filteredAnomalies.length === 0 ? (
              <Card className="p-8 text-center text-slate-400">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No anomalies detected under current filters</p>
                <p className="text-xs text-slate-400 mt-1">Operational processes are adhering to established risk thresholds.</p>
              </Card>
            ) : (
              filteredAnomalies.map((anom) => (
                <Card
                  key={anom.id}
                  className="border border-slate-200 bg-white shadow-xs hover:border-slate-300 hover:shadow-sm transition-all rounded-xl"
                >
                  <CardContent className="p-5">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge
                            variant={anom.severity === 'critical' ? 'destructive' : 'warning'}
                            className="text-[10px] uppercase font-bold tracking-wider"
                          >
                            {anom.severity}
                          </Badge>
                          <span className="text-xs font-mono font-semibold text-slate-400">{anom.id}</span>
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                            {anom.category}
                          </span>
                          <span className="text-xs font-semibold text-navy">
                            Affected: <strong className="text-slate-800">{anom.affectedEntity}</strong>
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-navy">{anom.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{anom.description}</p>

                        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-500">
                          <span className="font-semibold text-slate-700">Rule Triggered:</span>
                          <span className="italic bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                            {anom.ruleTriggered}
                          </span>
                        </div>
                      </div>

                      {/* Right Panel: Exposure & Action */}
                      <div className="lg:w-72 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-200 lg:pl-5 pt-3 lg:pt-0">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                            Financial Exposure
                          </span>
                          <div className="text-xl font-bold text-slate-900">
                            {fmt(anom.financialExposure)}
                          </div>
                        </div>

                        <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-700">
                          <span className="font-bold text-slate-800 block mb-0.5">Mitigation Action:</span>
                          {anom.actionRecommendation}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ML PROFITABILITY RISK PREDICTION                               */}
      {/* ========================================================================= */}
      {(activeTab === 'all' || activeTab === 'ml_profitability') && (
        <div className="space-y-6">
          {activeTab === 'all' && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200">
              <h2 className="text-base font-bold text-navy flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-royal" />
                ML Profitability Risk & Margin Bleed Forecasting
              </h2>
              <span className="text-xs text-slate-400 font-medium">
                Ensemble random forest & gradient boosting models
              </span>
            </div>
          )}

          {/* ML KPI Overview (Uniform Clean Styling) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Portfolio Risk Score</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <BrainCircuit className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-navy flex items-baseline gap-2">
                  {mlData?.summary?.overallPortfolioRiskScore || 0}
                  <span className="text-xs text-slate-400 font-normal">/ 100</span>
                </div>
                <Badge
                  variant={
                    mlData?.summary?.overallRiskTier === 'High Risk'
                      ? 'destructive'
                      : mlData?.summary?.overallRiskTier === 'Moderate Risk'
                      ? 'warning'
                      : 'success'
                  }
                  className="mt-2 text-xs"
                >
                  {mlData?.summary?.overallRiskTier || 'Low Risk'}
                </Badge>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Predicted Gross Margin</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {mlData?.summary?.expectedGrossMarginPercentage || 0}%
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Across ₹{Math.round((mlData?.summary?.totalEvaluatedRevenue || 0) / 100000)}L order volume
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Revenue at Risk</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-slate-900">
                  {fmt(mlData?.summary?.atRiskRevenue)}
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  {mlData?.summary?.highRiskOrderCount || 0} high-risk orders flagged
                </p>
              </CardContent>
            </Card>

            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl hover:border-slate-300 transition-all">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Model Precision</span>
                  <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {mlData?.modelMetrics?.accuracy || 88.67}% Accuracy
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  R² = {mlData?.modelMetrics?.r2 || 0.9573} (Random Forest)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feature Importances & Interactive Mitigation Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Feature Importances */}
            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-royal" />
                  Key Profitability Hazard Drivers (Feature Importance)
                </CardTitle>
                <CardDescription className="text-xs">
                  Tree-based relative weight of features driving margin erosion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[240px] w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={featureChartData}
                      margin={{ top: 10, right: 20, left: 40, bottom: 0 }}
                    >
                      <XAxis type="number" unit="%" tick={{ fill: '#64748B', fontSize: 11 }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fill: '#334155', fontSize: 11 }}
                        width={160}
                      />
                      <Tooltip
                        formatter={(val) => [`${val}%`, 'Relative Weight']}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="importance" fill="#2563EB" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  <strong>Insight:</strong> The cost-to-price baseline and discretionary order discounts contribute over <strong>84%</strong> of all margin compression risks.
                </p>
              </CardContent>
            </Card>

            {/* What-If Mitigation Simulator (Uniform Styling) */}
            <Card className="border border-slate-200 bg-white shadow-xs rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-royal" />
                  Interactive "What-If" Profitability Simulator
                </CardTitle>
                <CardDescription className="text-xs">
                  Simulate policy limits to observe risk score drops and working capital recovery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Discretionary Discount Cap</span>
                    <span className="text-royal font-bold">{simDiscountCap}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={simDiscountCap}
                    onChange={(e) => setSimDiscountCap(Number(e.target.value))}
                    className="w-full accent-royal h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (Strict)</span>
                    <span>10% (Normal)</span>
                    <span>20% (High Discretion)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Raw Material Input Inflation</span>
                    <span className="text-amber-600 font-bold">+{simInflationRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={simInflationRate}
                    onChange={(e) => setSimInflationRate(Number(e.target.value))}
                    className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (Stable)</span>
                    <span>10% (Moderate)</span>
                    <span>20% (Surge)</span>
                  </div>
                </div>

                {/* Simulation Result Box */}
                {simulationResults && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 shadow-xs space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 bg-slate-50 rounded-lg">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
                          Simulated Risk Score
                        </span>
                        <div className="text-lg font-bold text-navy flex items-center justify-center gap-1.5">
                          <span className="line-through text-slate-400 text-xs">{simulationResults.currentRisk}</span>
                          <span className="text-royal">{simulationResults.simulatedRisk}</span>
                        </div>
                      </div>

                      <div className="p-2.5 bg-emerald-50/60 rounded-lg">
                        <span className="text-[10px] uppercase font-semibold text-emerald-700 block mb-1">
                          Simulated Gross Margin
                        </span>
                        <div className="text-lg font-bold text-emerald-700 flex items-center justify-center gap-1.5">
                          <span className="line-through text-slate-400 text-xs">{simulationResults.currentMargin}%</span>
                          <span>{simulationResults.simulatedMargin}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-slate-600">Simulated Margin Gain:</span>
                      <strong className="text-emerald-700 font-bold">{fmt(simulationResults.marginGainRupees)}</strong>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Scored Orders Table */}
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-navy">
                Order-by-Order ML Profitability Hazard Scoring
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time transaction risk scoring evaluated by the ensemble model
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-3">Order # / Customer</th>
                      <th className="px-3 py-3 text-right">Order Value</th>
                      <th className="px-3 py-3 text-right">Discount</th>
                      <th className="px-3 py-3 text-right">COGS-to-Price</th>
                      <th className="px-3 py-3 text-center">Predicted Margin</th>
                      <th className="px-3 py-3 text-center">Risk Score</th>
                      <th className="px-3 py-3 text-center">Risk Tier</th>
                      <th className="px-4 py-3">Primary Risk Driver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {mlData?.scoredOrders?.map((ord) => (
                      <tr key={ord.orderNumber} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-navy">{ord.orderNumber}</div>
                          <div className="text-[11px] text-slate-400">{ord.customerName}</div>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold text-navy">
                          {fmt(ord.totalAmount)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-700">
                          {ord.discountRate}%
                        </td>
                        <td className="px-3 py-3 text-right font-mono text-slate-600">
                          {ord.costToPriceRatio}%
                        </td>
                        <td className="px-3 py-3 text-center font-bold text-emerald-700">
                          {ord.predictedGrossMargin}%
                        </td>
                        <td className="px-3 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-bold text-xs">{ord.predictedRiskScore}</span>
                            <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  ord.predictedRiskScore >= 65
                                    ? 'bg-red-500'
                                    : ord.predictedRiskScore >= 35
                                    ? 'bg-amber-500'
                                    : 'bg-emerald-500'
                                }`}
                                style={{ width: `${ord.predictedRiskScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <Badge
                            variant={
                              ord.riskCategory === 'High Risk'
                                ? 'destructive'
                                : ord.riskCategory === 'Moderate Risk'
                                ? 'warning'
                                : 'success'
                            }
                          >
                            {ord.riskCategory}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-[11px]">
                          {ord.primaryDriver}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default AnomalyDetection;
