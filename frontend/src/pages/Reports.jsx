import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Download, FileText, TrendingUp, TrendingDown, Minus, Sparkles, BarChart3, ShieldAlert } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const plData = {
  revenue: 4250000,
  cogs: 1820000,
  grossProfit: 2430000,
  operatingExpenses: {
    salaries: 840000,
    rent: 180000,
    marketing: 95000,
    utilities: 45000,
    depreciation: 120000,
    other: 75000,
  },
  totalOpex: 1355000,
  ebit: 1075000,
  interestExpense: 72000,
  taxExpense: 200000,
  netProfit: 803000,
};

const balanceData = {
  assets: {
    current: [
      { name: 'Cash & Bank', value: 840000 },
      { name: 'Accounts Receivable', value: 570000 },
      { name: 'Inventory', value: 1840000 },
      { name: 'Prepaid Expenses', value: 42000 },
    ],
    fixed: [
      { name: 'Plant & Machinery', value: 2200000 },
      { name: 'Furniture & Fixtures', value: 480000 },
      { name: 'Computers & IT', value: 320000 },
      { name: 'Less: Depreciation', value: -540000, negative: true },
    ],
  },
  liabilities: {
    current: [
      { name: 'Accounts Payable', value: 320000 },
      { name: 'Short-term Loans', value: 500000 },
      { name: 'GST Payable', value: 68000 },
      { name: 'Accrued Expenses', value: 45000 },
    ],
    longTerm: [
      { name: 'Term Loan', value: 1500000 },
      { name: 'Deferred Tax Liability', value: 85000 },
    ],
  },
  equity: [
    { name: 'Owner Capital', value: 2000000 },
    { name: 'Retained Earnings (Prior)', value: 1022000 },
    { name: 'Current Year Profit', value: 803000 },
  ],
};

const cashFlowMonthly = [
  { month: 'Apr', operating: 1.8, investing: -0.5, financing: -0.3 },
  { month: 'May', operating: 2.1, investing: -0.2, financing: -0.3 },
  { month: 'Jun', operating: 1.5, investing: -0.8, financing: -0.3 },
  { month: 'Jul', operating: 2.4, investing: -0.3, financing: -0.3 },
  { month: 'Aug', operating: 2.0, investing: -0.4, financing: -0.3 },
  { month: 'Sep', operating: 2.2, investing: -0.1, financing: -0.3 },
];

const revenueMonthly = [
  { month: 'Apr', revenue: 9.2, expenses: 7.1, profit: 2.1 },
  { month: 'May', revenue: 10.5, expenses: 7.8, profit: 2.7 },
  { month: 'Jun', revenue: 11.2, expenses: 8.0, profit: 3.2 },
  { month: 'Jul', revenue: 12.0, expenses: 8.5, profit: 3.5 },
  { month: 'Aug', revenue: 11.8, expenses: 8.8, profit: 3.0 },
  { month: 'Sep', revenue: 12.4, expenses: 9.1, profit: 3.3 },
];

function fmt(n) {
  if (n < 0) return `-₹${Math.abs(n).toLocaleString('en-IN')}`;
  return `₹${n.toLocaleString('en-IN')}`;
}
function fmtL(n) {
  return `₹${(n / 100000).toFixed(2)}L`;
}

const totalCurrentAssets = balanceData.assets.current.reduce((s, i) => s + i.value, 0);
const totalFixedAssets = balanceData.assets.fixed.reduce((s, i) => s + i.value, 0);
const totalAssets = totalCurrentAssets + totalFixedAssets;
const totalCurrentLiab = balanceData.liabilities.current.reduce((s, i) => s + i.value, 0);
const totalLtLiab = balanceData.liabilities.longTerm.reduce((s, i) => s + i.value, 0);
const totalLiab = totalCurrentLiab + totalLtLiab;
const totalEquity = balanceData.equity.reduce((s, i) => s + i.value, 0);

const TABS = ['Profit & Loss', 'Balance Sheet', 'Cash Flow'];

function PLRow({ label, value, indent = false, bold = false, subtotal = false, negative = false, highlight = false }) {
  return (
    <div className={`flex justify-between items-center py-2.5 ${subtotal ? 'border-t border-slate-200 mt-1' : ''} ${highlight ? 'bg-slate-50 px-4 -mx-4 rounded-lg' : ''}`}>
      <span className={`text-sm ${indent ? 'pl-5 text-slate-500' : ''} ${bold ? 'font-semibold text-navy' : 'text-slate-700'}`}>{label}</span>
      <span className={`text-sm font-medium ${negative ? 'text-red-600' : bold ? 'text-navy font-bold' : 'text-slate-700'}`}>{negative ? `– ${fmt(Math.abs(value))}` : fmt(value)}</span>
    </div>
  );
}

function BSRow({ label, value, indent = false, bold = false, negative = false }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className={`text-sm ${indent ? 'pl-5 text-slate-500' : bold ? 'font-semibold text-navy' : 'text-slate-600'}`}>{label}</span>
      <span className={`text-sm font-medium ${negative ? 'text-red-600' : bold ? 'text-navy font-bold' : 'text-slate-700'}`}>{fmt(value)}</span>
    </div>
  );
}

export function Reports() {
  const [activeTab, setActiveTab] = useState('Profit & Loss');
  const [period, setPeriod] = useState('This Year (FY 2026)');

  const grossMargin = ((plData.grossProfit / plData.revenue) * 100).toFixed(1);
  const netMargin = ((plData.netProfit / plData.revenue) * 100).toFixed(1);

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-navy mb-0.5">Financial Reports</h2>
          <p className="text-sm text-slate-500">View and export your company's financial statements.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button asChild variant="outline" size="sm" className="text-royal border-royal/30 hover:bg-blue-50 font-semibold text-xs">
            <Link to="/dashboard/reports/explainable-pl" className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-royal" />
              Explainable P&L
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-blue-700 border-blue-200 hover:bg-blue-50 font-semibold text-xs">
            <Link to="/dashboard/cash-flow-forecast" className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-royal" />
              Cash Flow Forecast
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="text-rose-700 border-rose-200 hover:bg-rose-50 font-semibold text-xs">
            <Link to="/dashboard/profit-leaks" className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Profit Leaks
            </Link>
          </Button>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="border border-slate-200 rounded-lg bg-white text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-royal/20 text-slate-700"
          >
            <option>This Year (FY 2026)</option>
            <option>Last Year (FY 2025)</option>
            <option>This Quarter (Q2)</option>
            <option>This Month (Sep 2026)</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Summary KPIs */}
      {activeTab === 'Profit & Loss' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Total Revenue</p>
            <p className="text-lg font-bold text-navy">{fmtL(plData.revenue)}</p>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Gross Profit</p>
            <p className="text-lg font-bold text-green-700">{fmtL(plData.grossProfit)}</p>
            <Badge variant="success" className="text-[10px] mt-1">Margin {grossMargin}%</Badge>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Net Profit</p>
            <p className="text-lg font-bold text-navy">{fmtL(plData.netProfit)}</p>
            <Badge variant="secondary" className="text-[10px] mt-1">Margin {netMargin}%</Badge>
          </CardContent></Card>
          <Card><CardContent className="p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Total OpEx</p>
            <p className="text-lg font-bold text-slate-700">{fmtL(plData.totalOpex)}</p>
          </CardContent></Card>
        </div>
      )}

      {/* Tab Strip */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <FileText className="w-3.5 h-3.5" />
            {tab}
          </button>
        ))}
      </div>

      {/* ─────── P&L ─────── */}
      {activeTab === 'Profit & Loss' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Revenue trend chart */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue vs Expenses Trend</CardTitle>
              <CardDescription>Monthly comparison for FY 2026</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueMonthly} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${v}L`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} formatter={v => [`₹${v}L`]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2} fill="url(#revGrad)" dot={false} />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#94A3B8" strokeWidth={2} fill="none" dot={false} strokeDasharray="4 2" />
                    <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10B981" strokeWidth={2} fill="url(#profGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* P&L Statement */}
          <Card className="lg:col-span-2">
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Profit & Loss Statement</CardTitle>
              <CardDescription>Consolidated — {period}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-0.5">
              <PLRow label="Revenue" value={plData.revenue} bold />
              <PLRow label="Cost of Goods Sold (COGS)" value={plData.cogs} indent negative />
              <PLRow label="Gross Profit" value={plData.grossProfit} bold subtotal />

              <div className="mt-3 mb-1">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Operating Expenses</p>
              </div>
              {Object.entries(plData.operatingExpenses).map(([k, v]) => (
                <PLRow key={k} label={k.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())} value={v} indent negative />
              ))}
              <PLRow label="Total Operating Expenses" value={plData.totalOpex} bold subtotal negative />
              <PLRow label="EBIT" value={plData.ebit} bold subtotal />
              <PLRow label="Interest Expense" value={plData.interestExpense} indent negative />
              <PLRow label="Tax Expense (25%)" value={plData.taxExpense} indent negative />
              <PLRow label="Net Profit" value={plData.netProfit} bold subtotal highlight />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────── Balance Sheet ─────── */}
      {activeTab === 'Balance Sheet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Assets */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Assets</CardTitle>
              <CardDescription>Total Assets: <span className="font-bold text-navy">{fmt(totalAssets)}</span></CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Assets</p>
              {balanceData.assets.current.map(i => <BSRow key={i.name} label={i.name} value={i.value} indent />)}
              <BSRow label="Total Current Assets" value={totalCurrentAssets} bold />
              <div className="my-3 border-t border-slate-100" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fixed Assets</p>
              {balanceData.assets.fixed.map(i => <BSRow key={i.name} label={i.name} value={i.value} indent negative={i.negative} />)}
              <BSRow label="Total Fixed Assets (Net)" value={totalFixedAssets} bold />
              <div className="my-3 border-t-2 border-slate-300" />
              <BSRow label="TOTAL ASSETS" value={totalAssets} bold />
            </CardContent>
          </Card>

          {/* Liabilities & Equity */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Liabilities & Equity</CardTitle>
              <CardDescription>Total: <span className="font-bold text-navy">{fmt(totalLiab + totalEquity)}</span></CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Current Liabilities</p>
              {balanceData.liabilities.current.map(i => <BSRow key={i.name} label={i.name} value={i.value} indent />)}
              <BSRow label="Total Current Liabilities" value={totalCurrentLiab} bold />
              <div className="my-3 border-t border-slate-100" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Long-Term Liabilities</p>
              {balanceData.liabilities.longTerm.map(i => <BSRow key={i.name} label={i.name} value={i.value} indent />)}
              <BSRow label="Total Liabilities" value={totalLiab} bold />
              <div className="my-3 border-t border-slate-100" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Owner's Equity</p>
              {balanceData.equity.map(i => <BSRow key={i.name} label={i.name} value={i.value} indent />)}
              <BSRow label="Total Equity" value={totalEquity} bold />
              <div className="my-3 border-t-2 border-slate-300" />
              <BSRow label="TOTAL LIABILITIES + EQUITY" value={totalLiab + totalEquity} bold />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─────── Cash Flow ─────── */}
      {activeTab === 'Cash Flow' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card><CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Operating Activities</p>
              <p className="text-xl font-bold text-green-700">+₹12.0L</p>
              <p className="text-xs text-slate-400 mt-1">Cash generated from business operations</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Investing Activities</p>
              <p className="text-xl font-bold text-red-600">– ₹2.3L</p>
              <p className="text-xs text-slate-400 mt-1">Capital expenditure and asset purchases</p>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Financing Activities</p>
              <p className="text-xl font-bold text-amber-600">– ₹1.8L</p>
              <p className="text-xs text-slate-400 mt-1">Loan repayments and owner drawings</p>
            </CardContent></Card>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Monthly Cash Flow Breakdown</CardTitle>
              <CardDescription>Operating, investing and financing activities by month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlowMonthly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} tickFormatter={v => `₹${v}L`} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} formatter={v => [`₹${v}L`]} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 12 }} />
                    <Bar dataKey="operating" name="Operating" fill="#2563EB" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="investing" name="Investing" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="financing" name="Financing" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detail breakdown table */}
          <Card>
            <CardHeader className="border-b border-slate-100 pb-3">
              <CardTitle className="text-base">Cash Flow Statement</CardTitle>
              <CardDescription>Indirect method — {period}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-0.5">
              <PLRow label="Net Profit" value={803000} bold />
              <div className="mt-2 mb-1"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Adjustments</p></div>
              <PLRow label="Add: Depreciation" value={120000} indent />
              <PLRow label="Less: Increase in Receivables" value={85000} indent negative />
              <PLRow label="Less: Increase in Inventory" value={220000} indent negative />
              <PLRow label="Add: Increase in Payables" value={45000} indent />
              <PLRow label="Net Cash from Operations" value={663000} bold subtotal />
              <div className="mt-3 mb-1"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Investing</p></div>
              <PLRow label="Purchase of Fixed Assets" value={230000} indent negative />
              <PLRow label="Net Cash from Investing" value={-230000} bold subtotal negative />
              <div className="mt-3 mb-1"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Financing</p></div>
              <PLRow label="Loan Repayment" value={120000} indent negative />
              <PLRow label="Owner Drawings" value={60000} indent negative />
              <PLRow label="Net Cash from Financing" value={-180000} bold subtotal negative />
              <PLRow label="NET CHANGE IN CASH" value={253000} bold subtotal highlight />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
