import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle, Lightbulb,
  ArrowRight, ShieldCheck, PieChart, Info, ArrowUpRight, ArrowDownRight, Search,
  BarChart3, Brain
} from 'lucide-react';
import { dashboardService } from '../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { ROLES } from '../lib/roles';

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = user?.role === ROLES.ACCOUNTANT
          ? await dashboardService.getAccountantSummary()
          : await dashboardService.getSummary();
        const bd = res.data; // backend data

        // Format currency helper
        const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

        // Adapt backend data to existing UI format
        const adaptedData = {
          healthScore: bd.health.score,
          healthStatus: bd.health.status,
          healthComponents: bd.health.components,
          kpis: {
            revenue: { value: formatCurrency(bd.metrics.revenue), change: bd.metrics.revenueTrend, comparison: 'vs last month' },
            netProfit: { value: formatCurrency(bd.metrics.netProfit), change: bd.metrics.profitTrend, comparison: 'vs last month' },
            cashAvailable: { value: formatCurrency(bd.metrics.availableCash), status: bd.cashFlowForecast.warning ? 'Warning' : 'Healthy' },
            receivables: { value: formatCurrency(bd.metrics.receivables), subtext: 'Invoices due soon' },
            payables: { value: formatCurrency(bd.metrics.payables), subtext: 'Upcoming bills' },
            inventoryValue: { value: formatCurrency(bd.metrics.inventoryValue), subtext: 'Current stock' }
          },
          financialPerformance: bd.financialPerformance.map(fp => ({
            name: fp.month,
            revenue: fp.revenue / 100000, // Converting to Lakhs for chart if needed, or leave as is
            profit: fp.profit / 100000,
            expenses: (fp.revenue - fp.profit) / 100000
          })),
          // We don't have time-series cash flow forecast natively yet, generate mock based on backend scalar values
          cashFlowForecast: [
            { day: 'Day 0', cash: bd.cashFlowForecast.currentCash / 100000 },
            { day: 'Day 30', cash: bd.cashFlowForecast.projectedCash / 100000 }
          ],
          aiInsights: bd.aiInsights || [],
          profitLeaks: bd.profitLeaks.map((leak, idx) => ({
            id: leak.relatedRecordId || idx,
            category: leak.title,
            amount: formatCurrency(leak.amount),
            severity: leak.severity
          })),
          productProfitability: bd.productProfitability.map((p, idx) => ({
            id: p.productId || idx,
            name: p.name,
            revenue: formatCurrency(p.revenue),
            profit: formatCurrency(p.grossProfit),
            margin: Math.round(p.marginPercentage)
          })),
          inventoryInsights: {
            totalValue: formatCurrency(bd.metrics.inventoryValue),
            lowStock: 0, // Mock for now
            slowMoving: 0 // Mock for now
          }
        };

        setData(adaptedData);
        setLoading(false);
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading dashboard data...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col h-64 items-center justify-center text-red-500 gap-4">
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex h-64 items-center justify-center text-slate-500">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section: Health */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Good day, {user?.name || 'Business Owner'}</h2>
          <p className="text-slate-500">Here is your business financial overview.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Business Health</span>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-navy">{data.healthScore} <span className="text-lg text-slate-400 font-normal">/ 100</span></span>
              <Badge
                variant={
                  data.healthScore >= 85
                    ? 'success'
                    : data.healthScore >= 70
                    ? 'primary'
                    : data.healthScore >= 55
                    ? 'warning'
                    : 'destructive'
                }
                className="px-3 py-1 text-sm font-semibold"
              >
                <ShieldCheck className="w-4 h-4 mr-1"/> {data.healthStatus}
              </Badge>
            </div>
            {data.healthComponents && (
              <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 flex-wrap justify-end">
                <span title="Profitability Health">Profit: <strong className="text-slate-800">{data.healthComponents.profitability}</strong></span>
                <span>•</span>
                <span title="Liquidity & Cash Position">Cash: <strong className="text-slate-800">{data.healthComponents.cashPosition}</strong></span>
                <span>•</span>
                <span title="Receivables & Debtors Collection">Payments: <strong className="text-slate-800">{data.healthComponents.paymentPerformance}</strong></span>
                <span>•</span>
                <span title="Expense & Overhead Control">Expenses: <strong className="text-slate-800">{data.healthComponents.expenseControl}</strong></span>
              </div>
            )}
          </div>
          <Button asChild variant="outline" className="text-royal border-royal/30 hover:bg-blue-50 font-semibold shadow-sm">
            <Link to="/dashboard/reports/explainable-pl" className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-royal" />
              View analytics
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Revenue */}
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-medium text-slate-500 mb-2">Revenue</div>
            <div className="text-2xl font-bold text-navy mb-2">{data.kpis.revenue.value}</div>
            <div className="flex items-center text-xs">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {data.kpis.revenue.change}%
              </span>
              <span className="text-slate-400 ml-1.5">{data.kpis.revenue.comparison}</span>
            </div>
          </CardContent>
        </Card>
        {/* Net Profit */}
        <Card
          className="hover:border-royal/50 hover:shadow-sm transition-all cursor-pointer group"
          onClick={() => navigate('/dashboard/reports/explainable-pl')}
          title="Click to view explainable profit & loss analytics"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-sm font-medium text-slate-500 mb-2">
              <span>Net Profit</span>
              <span className="text-[10px] text-royal font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                Explain <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
              </span>
            </div>
            <div className="text-2xl font-bold text-navy mb-2">{data.kpis.netProfit.value}</div>
            <div className="flex items-center text-xs">
              <span className="text-green-600 flex items-center font-medium">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                {Math.abs(data.kpis.netProfit.change)}%
              </span>
              <span className="text-slate-400 ml-1.5">{data.kpis.netProfit.comparison}</span>
            </div>
          </CardContent>
        </Card>
        {/* Cash Available */}
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-medium text-slate-500 mb-2">Cash Available</div>
            <div className="text-2xl font-bold text-navy mb-2">{data.kpis.cashAvailable.value}</div>
            <div className="flex items-center text-xs">
              <Badge variant="success" className="font-normal text-[10px] py-0">{data.kpis.cashAvailable.status}</Badge>
            </div>
          </CardContent>
        </Card>
        {/* Receivables */}
        <Card className="border-amber-200 bg-amber-50/30">
          <CardContent className="p-5">
            <div className="text-sm font-medium text-amber-800 mb-2">Receivables</div>
            <div className="text-2xl font-bold text-navy mb-2">{data.kpis.receivables.value}</div>
            <div className="flex items-center text-xs text-amber-700 font-medium">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {data.kpis.receivables.subtext}
            </div>
          </CardContent>
        </Card>
        {/* Payables */}
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-medium text-slate-500 mb-2">Payables</div>
            <div className="text-2xl font-bold text-navy mb-2">{data.kpis.payables.value}</div>
            <div className="flex items-center text-xs text-slate-500">
              {data.kpis.payables.subtext}
            </div>
          </CardContent>
        </Card>
        {/* Inventory Value */}
        <Card>
          <CardContent className="p-5">
            <div className="text-sm font-medium text-slate-500 mb-2">Inventory Value</div>
            <div className="text-2xl font-bold text-navy mb-2">{data.kpis.inventoryValue.value}</div>
            <div className="flex items-center text-xs text-slate-500">
              {data.kpis.inventoryValue.subtext}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Financial Performance */}
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Financial Performance</CardTitle>
              <CardDescription>Revenue, expenses and profit over time.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="text-xs text-royal font-semibold hover:bg-blue-50">
                <Link to="/dashboard/reports/explainable-pl" className="flex items-center gap-1">
                  View Analytics <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
              <select className="text-sm border-slate-200 rounded-md bg-white focus:ring-royal px-3 py-1.5 border outline-none">
                <option>Last 6 months</option>
                <option>Last 3 months</option>
                <option>This Year</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.financialPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `₹${value}L`} />
                  <RechartsTooltip cursor={{fill: '#F1F5F9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend iconType="circle" wrapperStyle={{fontSize: '12px', paddingTop: '20px'}} />
                  <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="expenses" name="Expenses" fill="#94A3B8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="profit" name="Net Profit" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cash Flow Forecast */}
        <Card className="border-navy border-t-4 shadow-md bg-white">
          <CardHeader className="pb-2">
            <CardTitle>Cash Flow Forecast</CardTitle>
            <CardDescription>Projected cash position based on expected inflows and outflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.cashFlowForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748B', fontSize: 12}} tickFormatter={(value) => `₹${value}L`} />
                  <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="cash" name="Expected Cash" stroke="#1E3A8A" strokeWidth={3} dot={{r: 4, fill: '#1E3A8A'}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Potential cash shortage around Day 58</p>
                <p className="text-xs text-amber-700 mt-1">Upcoming vendor payments exceed expected inflows in the 45-60 day window.</p>
              </div>
            </div>
            <Button asChild variant="outline" className="w-full mt-4 bg-white">
              <Link to="/dashboard/cash-flow-forecast">View forecast details</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI CFO Insights */}
        <Card className="border-t-4 border-t-royal bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-royal" />
              AI CFO Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100 text-royal rounded-md"><TrendingUp className="w-4 h-4"/></div>
                  <h4 className="font-semibold text-navy text-sm">Unusual Purchase Detected</h4>
                </div>
                <Badge variant="warning">Investigation required</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-4">A purchase of ₹5,00,000 from "Premium Woods Ltd" is significantly higher than the usual transaction amount.</p>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link to="/dashboard/anomalies">Investigate <ArrowRight className="w-3 h-3 ml-2" /></Link>
              </Button>
            </div>

            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-green-100 text-green-700 rounded-md"><PieChart className="w-4 h-4"/></div>
                  <h4 className="font-semibold text-navy text-sm">High Margin Opportunity</h4>
                </div>
                <Badge variant="success">Insight</Badge>
              </div>
              <p className="text-sm text-slate-600 mb-4">Office Chairs generate the highest profit margin (43%). Consider increasing stock and marketing spend for this category.</p>
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link to="/dashboard/inventory">View Products <ArrowRight className="w-3 h-3 ml-2" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profit Leaks */}
        <Card className="border-rose-100 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="flex items-center gap-2 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                Potential Profit Leaks
              </CardTitle>
              <CardDescription>Areas requiring investigation to prevent margin loss.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-xs text-royal font-semibold hover:bg-blue-50">
              <Link to="/dashboard/profit-leaks" className="flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.profitLeaks.map((leak, idx) => (
                <div key={leak.id || idx} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-rose-50/20 hover:border-rose-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-900">{leak.category || leak.title}</span>
                      <span className="text-xs font-semibold text-rose-600">
                        {leak.amount ? (typeof leak.amount === 'number' ? `₹${leak.amount.toLocaleString('en-IN')}` : leak.amount) : 'Action required'} bleed exposure
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={leak.severity === 'Critical' || leak.severity === 'High Priority' ? 'destructive' : 'warning'} className="text-[10px]">
                      {leak.severity}
                    </Badge>
                    <Button asChild size="sm" variant="ghost" className="px-2 h-7 text-xs text-royal hover:bg-blue-50">
                      <Link to="/dashboard/profit-leaks">Audit <ArrowRight className="w-3 h-3 ml-1" /></Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="outline" className="w-full mt-4 text-xs font-semibold text-slate-700 hover:text-royal hover:border-royal">
              <Link to="/dashboard/profit-leaks">
                Open Profit Leak Detection Engine <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Product Profitability */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Product Profitability</CardTitle>
              <CardDescription>Top performing categories by margin.</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-royal">
              <Link to="/dashboard/inventory">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Product</th>
                    <th className="px-4 py-3 font-medium">Revenue</th>
                    <th className="px-4 py-3 font-medium">Profit</th>
                    <th className="px-4 py-3 font-medium text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.productProfitability.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-navy">{item.name}</td>
                      <td className="px-4 py-3 text-slate-600">{item.revenue}</td>
                      <td className="px-4 py-3 font-medium text-green-600">{item.profit}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={item.margin > 30 ? 'success' : (item.margin > 15 ? 'warning' : 'outline')}>
                          {item.margin}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Intelligence */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Intelligence</CardTitle>
            <CardDescription>Key metrics for stock optimization.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-slate-500 mb-1">Total Value</span>
                <span className="text-xl font-bold text-navy">{data.inventoryInsights.totalValue}</span>
              </div>
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 flex flex-col items-center text-center">
                <span className="text-sm font-medium text-red-800 mb-1">Low Stock</span>
                <span className="text-xl font-bold text-red-600">{data.inventoryInsights.lowStock} <span className="text-sm font-normal text-red-500">products</span></span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-100 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-md text-amber-700">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-amber-900 text-sm">Slow Moving Stock</h4>
                  <p className="text-xs text-amber-700 mt-0.5">{data.inventoryInsights.slowMoving} products have not sold in 90 days.</p>
                </div>
              </div>
              <Button asChild size="sm" variant="outline" className="bg-white border-amber-200 text-amber-800 hover:bg-amber-100">
                <Link to="/dashboard/inventory/slow-moving">Review Prediction</Link>
              </Button>
            </div>

            <Button asChild variant="outline" className="w-full">
              <Link to="/dashboard/inventory">View comprehensive inventory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

// Quick component shim for AlertCircle
function AlertCircle(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
