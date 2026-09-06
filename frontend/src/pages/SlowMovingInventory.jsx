import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  AlertOctagon, AlertTriangle, RefreshCw,
  TrendingDown, DollarSign, Package, ShieldAlert,
  Search, Filter, CheckCircle2, ChevronRight, HelpCircle,
  BarChart3, Zap, Clock, Sparkles, ChevronLeft
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell
} from 'recharts';
import { inventoryService } from '../services/inventoryService';

export function SlowMovingInventory() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [horizonDays, setHorizonDays] = useState(90);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showRulesInfo, setShowRulesInfo] = useState(false);

  const fetchAnalysis = async (days = horizonDays) => {
    try {
      setLoading(true);
      setError(null);
      const res = await inventoryService.getSlowMoving({ horizonDays: days });
      setData(res.data);
    } catch (err) {
      console.error('Error fetching slow moving inventory:', err);
      setError(err.message || 'Failed to load slow-moving inventory analysis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis(horizonDays);
  }, [horizonDays]);

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(n || 0);

  // Extract unique categories for filter
  const categories = useMemo(() => {
    if (!data?.items) return [];
    const set = new Set(data.items.map((i) => i.categoryName).filter(Boolean));
    return Array.from(set);
  }, [data]);

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item) => {
      // Classification filter
      if (activeFilter !== 'all' && item.classification !== activeFilter) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && item.categoryName !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name?.toLowerCase().includes(q);
        const matchSku = item.sku?.toLowerCase().includes(q);
        return matchName || matchSku;
      }
      return true;
    });
  }, [data, activeFilter, selectedCategory, searchQuery]);

  // Chart data for capital locked by classification
  const chartData = useMemo(() => {
    if (!data) return [];
    return [
      {
        name: 'Dead Stock',
        value: Math.round(data.deadStockValue / 100000),
        raw: data.deadStockValue,
        count: data.deadStockCount,
        color: '#EF4444'
      },
      {
        name: 'Slow Moving',
        value: Math.round(data.slowMovingValue / 100000),
        raw: data.slowMovingValue,
        count: data.slowMovingCount,
        color: '#F59E0B'
      },
      {
        name: 'Moderate',
        value: Math.round(data.moderateValue / 100000),
        raw: data.moderateValue,
        count: data.moderateCount,
        color: '#3B82F6'
      },
      {
        name: 'Healthy',
        value: Math.round(data.healthyValue / 100000),
        raw: data.healthyValue,
        count: data.healthyCount,
        color: '#10B981'
      }
    ];
  }, [data]);

  const getStatusBadge = (classification) => {
    switch (classification) {
      case 'dead_stock':
        return <Badge variant="destructive" className="font-semibold">Dead Stock</Badge>;
      case 'slow_moving':
        return <Badge variant="warning" className="font-semibold">Slow Moving</Badge>;
      case 'moderate':
        return <Badge variant="secondary" className="font-semibold text-blue-800 bg-blue-100">Moderate</Badge>;
      case 'fast_moving':
        return <Badge variant="success" className="font-semibold">Fast Moving</Badge>;
      case 'low_stock':
        return <Badge variant="outline" className="font-semibold text-purple-700 border-purple-300 bg-purple-50">Low Stock</Badge>;
      default:
        return <Badge variant="outline">{classification}</Badge>;
    }
  };

  const getDirColor = (days) => {
    if (days >= 999) return 'text-purple-700 font-bold bg-purple-50 border border-purple-200';
    if (days >= 180) return 'text-red-700 font-bold bg-red-50 border border-red-200';
    if (days >= 75) return 'text-amber-700 font-bold bg-amber-50 border border-amber-200';
    if (days >= 35) return 'text-blue-700 font-semibold bg-blue-50 border border-blue-200';
    return 'text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200';
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/inventory')}
          className="text-slate-600 hover:text-navy hover:bg-slate-100 gap-1.5 -ml-2 mb-1 font-medium"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <AlertOctagon className="w-6 h-6 text-slate-700" />
              Slow-Moving Inventory Prediction
            </h1>
            <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-xs uppercase tracking-wider font-semibold">
              Rule-Based Demand Engine
            </Badge>
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            Strict demand-velocity algorithms analyzing order histories, run-out horizons, capital tied up in slow stock, and carrying cost leakage.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Horizon Toggle */}
          <div className="bg-slate-100 p-1 rounded-lg flex items-center border border-slate-200">
            {[30, 60, 90, 180].map((days) => (
              <button
                key={days}
                onClick={() => setHorizonDays(days)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  horizonDays === days
                    ? 'bg-white text-navy shadow-sm'
                    : 'text-slate-600 hover:text-navy'
                }`}
              >
                {days}D Horizon
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRulesInfo(!showRulesInfo)}
            className="text-xs"
          >
            <HelpCircle className="w-4 h-4 mr-1 text-slate-500" />
            {showRulesInfo ? 'Hide Rules' : 'Rule Logic'}
          </Button>

          <Button
            size="sm"
            onClick={() => fetchAnalysis(horizonDays)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Optional Rule Logic Explanation Card */}
      {showRulesInfo && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-navy flex items-center gap-2">
              <Zap className="w-4 h-4 text-royal" />
              Deterministic Demand-Based Rule Engine Specifications
            </CardTitle>
            <CardDescription className="text-xs text-slate-600">
              How products are systematically classified based on sales orders and consumption velocity:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs text-slate-700">
              <div className="p-3 bg-white rounded-lg border border-red-200 shadow-2xs">
                <span className="font-bold text-red-700 block mb-1">1. Dead / Dormant Stock</span>
                <p className="text-slate-600">
                  Trigger: <strong>0 units sold</strong> in {horizonDays} days, OR predicted run-out time (DIR) <strong>&gt; 180 days</strong>.
                </p>
                <span className="text-[10px] text-red-500 mt-2 block font-medium">Recommendation: 30-40% clearance markdown</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-amber-200 shadow-2xs">
                <span className="font-bold text-amber-700 block mb-1">2. Slow Moving Stock</span>
                <p className="text-slate-600">
                  Trigger: Predicted run-out time <strong>&gt; 75 days</strong> and <strong>&le; 180 days</strong> with low daily consumption velocity.
                </p>
                <span className="text-[10px] text-amber-600 mt-2 block font-medium">Recommendation: Freeze PO reorders, run promo</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-2xs">
                <span className="font-bold text-blue-700 block mb-1">3. Moderate Velocity</span>
                <p className="text-slate-600">
                  Trigger: Predicted run-out time between <strong>35 and 75 days</strong>. Steady and balanced turnover.
                </p>
                <span className="text-[10px] text-blue-600 mt-2 block font-medium">Recommendation: Maintain normal safety buffers</span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-emerald-200 shadow-2xs">
                <span className="font-bold text-emerald-700 block mb-1">4. Fast Moving / Healthy</span>
                <p className="text-slate-600">
                  Trigger: Rapid turnover with run-out <strong>&lt; 35 days</strong> and stock above reorder threshold.
                </p>
                <span className="text-[10px] text-emerald-600 mt-2 block font-medium">Recommendation: Secure replenishment batches</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
              <span>Carrying cost formula: <strong>Holding Cost = Tied-up Capital × 20% Annual Rate</strong></span>
              <span>Run-out formula: <strong>DIR = Quantity on Hand ÷ Average Daily Demand</strong></span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* At Risk Capital */}
        <Card className="border-t-4 border-t-red-600 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total At-Risk Capital</span>
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-navy">
              {fmt(data?.totalAtRiskCapital)}
            </div>
            <p className="text-xs text-red-600 font-medium mt-1.5 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              {(data?.deadStockCount || 0) + (data?.slowMovingCount || 0)} SKUs locked in slow velocity
            </p>
          </CardContent>
        </Card>

        {/* Dead Stock */}
        <Card className="border-t-4 border-t-red-500 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Dead / Dormant Stock</span>
              <div className="p-2 bg-red-50 text-red-500 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-red-600">
              {data?.deadStockCount || 0} <span className="text-sm font-normal text-slate-400">SKUs</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Locked Value: <strong className="text-slate-700">{fmt(data?.deadStockValue)}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Slow Moving */}
        <Card className="border-t-4 border-t-amber-500 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slow-Moving Stock</span>
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {data?.slowMovingCount || 0} <span className="text-sm font-normal text-slate-400">SKUs</span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              Locked Value: <strong className="text-slate-700">{fmt(data?.slowMovingValue)}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Annual Carrying Waste */}
        <Card className="border-t-4 border-t-purple-600 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Annual Carrying Loss</span>
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-purple-700">
              {fmt(data?.annualCarryingCostWaste)}
            </div>
            <p className="text-xs text-slate-500 mt-1.5">
              ~{fmt(data?.projectedQuarterlyLoss)} drain per quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Analytics & Executive Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Capital Distribution Chart */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-royal" />
              Capital Tied-Up by Classification
            </CardTitle>
            <CardDescription className="text-xs">
              Inventory valuation (₹ in Lakhs) grouped by velocity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip
                    formatter={(val, name, item) => [`${fmt(item.payload.raw)} (${item.payload.count} SKUs)`, 'Tied-up Capital']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-600">Dead: {fmt(data?.deadStockValue)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Slow: {fmt(data?.slowMovingValue)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">Moderate: {fmt(data?.moderateValue)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Healthy: {fmt(data?.healthyValue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI CFO / Rule Directives */}
        <Card className="lg:col-span-2 shadow-sm border-t-4 border-t-royal bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-navy flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-royal" />
              Executive Working Capital Directives
            </CardTitle>
            <CardDescription className="text-xs">
              Rule-driven action priorities to unlock working capital and halt carrying cost drains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data?.recommendations?.map((rec, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <Badge variant={rec.severity === 'high' ? 'destructive' : 'warning'} className="text-[10px] uppercase">
                      {rec.severity} Priority
                    </Badge>
                    <h4 className="text-sm font-semibold text-navy">{rec.title}</h4>
                  </div>
                  {rec.potentialRecovery > 0 && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Potential Recovery: {fmt(rec.potentialRecovery)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 mb-2 leading-relaxed">{rec.message}</p>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 text-xs text-slate-800 flex items-center gap-2">
                  <span className="font-semibold text-royal shrink-0">Action Directive:</span>
                  <span>{rec.suggestedAction}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Classification Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeFilter === 'all' ? 'bg-white text-navy shadow-xs' : 'text-slate-600 hover:text-navy'
                }`}
              >
                All Items ({data?.items?.length || 0})
              </button>
              <button
                onClick={() => setActiveFilter('dead_stock')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeFilter === 'dead_stock' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-red-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Dead Stock ({data?.deadStockCount || 0})
              </button>
              <button
                onClick={() => setActiveFilter('slow_moving')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeFilter === 'slow_moving' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-amber-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Slow Moving ({data?.slowMovingCount || 0})
              </button>
              <button
                onClick={() => setActiveFilter('moderate')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeFilter === 'moderate' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-blue-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Moderate ({data?.moderateCount || 0})
              </button>
              <button
                onClick={() => setActiveFilter('fast_moving')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                  activeFilter === 'fast_moving' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Healthy ({data?.healthyCount || 0})
              </button>
            </div>

            {/* Category & Search */}
            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:ring-1 focus:ring-royal"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search SKU or Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:ring-1 focus:ring-royal w-48 bg-white"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-navy">
                Product Demand & Run-Out Predictions
              </CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredItems.length} products evaluated against {horizonDays}-day demand velocity
              </CardDescription>
            </div>
            <span className="text-xs text-slate-400">
              Annual Holding Rate: <strong>20%</strong>
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-y border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-4 py-3">Product / SKU</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3 text-right">Stock (On Hand)</th>
                  <th className="px-3 py-3 text-right">{horizonDays}D Demand</th>
                  <th className="px-3 py-3 text-right">Daily Demand</th>
                  <th className="px-3 py-3 text-center">Run-Out Time (DIR)</th>
                  <th className="px-3 py-3 text-right">Tied-Up Capital</th>
                  <th className="px-3 py-3 text-right">90D Holding Cost</th>
                  <th className="px-3 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Rule-Based Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                      No products match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name / SKU */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-navy text-xs">{item.name}</div>
                        <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3 text-slate-600">
                        <span className="truncate max-w-[120px] block">{item.categoryName}</span>
                      </td>

                      {/* Stock on Hand */}
                      <td className="px-3 py-3 text-right font-medium text-slate-800">
                        {item.quantityOnHand}
                        <span className="text-[10px] text-slate-400 block">Min: {item.reorderLevel}</span>
                      </td>

                      {/* Horizon Demand */}
                      <td className="px-3 py-3 text-right font-semibold text-navy">
                        {item.unitsSold90Days} units
                      </td>

                      {/* Average Daily Demand */}
                      <td className="px-3 py-3 text-right text-slate-600 font-mono">
                        {item.averageDailyDemand}/day
                      </td>

                      {/* Run-Out Time (DIR) */}
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[11px] ${getDirColor(item.daysOfInventoryRemaining)}`}>
                          {item.daysOfInventoryRemaining >= 999 ? '∞ (No Demand)' : `${item.daysOfInventoryRemaining} Days`}
                        </span>
                      </td>

                      {/* Tied-Up Capital */}
                      <td className="px-3 py-3 text-right font-bold text-navy">
                        {fmt(item.tiedUpCapital)}
                      </td>

                      {/* 90D Holding Cost Waste */}
                      <td className="px-3 py-3 text-right text-red-600 font-medium">
                        {fmt(item.projectedHoldingLoss90Days)}
                      </td>

                      {/* Classification Status */}
                      <td className="px-3 py-3 text-center">
                        {getStatusBadge(item.classification)}
                      </td>

                      {/* Action Recommendation */}
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-[11px] text-slate-700 leading-snug">{item.actionRecommendation}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 truncate" title={item.triggeredRule}>
                          Rule: {item.triggeredRule}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SlowMovingInventory;
