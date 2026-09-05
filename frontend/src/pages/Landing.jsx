import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  LineChart, Line, Tooltip as RechartsTooltip
} from 'recharts';
import { 
  ArrowRight, ShieldCheck, CheckCircle2, TrendingUp, TrendingDown,
  PieChart, Activity, ShoppingBag, Package, Calculator, Zap, 
  ChevronRight, Menu, X, ArrowUpRight
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import logo from '../assets/logo.png';

// Mock data for charts
const cashFlowData = [
  { day: '1', cash: 120 }, { day: '15', cash: 150 }, { day: '30', cash: 140 }, 
  { day: '45', cash: 180 }, { day: '60', cash: 160 }, { day: '75', cash: 210 }, { day: '90', cash: 250 }
];

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-royal/20 selection:text-royal">
      
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            <div className="flex items-center gap-2">
              <img src={logo} alt="CraftLedger Logo" className="h-16 w-auto object-contain py-2" />
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-slate-600 hover:text-navy transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-navy transition-colors">How It Works</a>
              <a href="#intelligence" className="text-sm font-medium text-slate-600 hover:text-navy transition-colors">Intelligence</a>
              <a href="#about" className="text-sm font-medium text-slate-600 hover:text-navy transition-colors">About</a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-navy transition-colors">Sign In</Link>
              <Button asChild className="bg-navy hover:bg-navy/90 text-white shadow-md shadow-navy/20">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>

            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 absolute w-full left-0 top-20 shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              <a href="#features" className="block px-3 py-3 text-base font-medium text-slate-800 border-b border-slate-50">Features</a>
              <a href="#how-it-works" className="block px-3 py-3 text-base font-medium text-slate-800 border-b border-slate-50">How It Works</a>
              <a href="#intelligence" className="block px-3 py-3 text-base font-medium text-slate-800 border-b border-slate-50">Intelligence</a>
              <Link to="/login" className="block px-3 py-3 text-base font-medium text-slate-800 border-b border-slate-50">Sign In</Link>
              <Button asChild className="w-full mt-4 justify-center bg-navy hover:bg-navy/90">
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1400px] pointer-events-none -z-10">
          <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-blue-100/40 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
          <div className="absolute top-[20%] right-[5%] w-[30rem] h-[30rem] bg-indigo-100/40 rounded-full blur-3xl opacity-50 mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Hero Copy */}
            <div className="text-center lg:text-left max-w-2xl mx-auto lg:mx-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-royal text-sm font-semibold mb-6">
                <Zap className="w-4 h-4" />
                <span>The intelligent OS for Furniture Brands</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-navy leading-[1.1] mb-6 tracking-tight">
                See Clearly.<br/>Decide Confidently.<br/>Grow Profitably.
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0">
                CraftLedger brings accounting, inventory, cash flow, and business intelligence together in one powerful platform built for modern furniture businesses.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                <Button asChild size="lg" className="w-full sm:w-auto h-12 px-8 text-base bg-royal hover:bg-royal/90 shadow-lg shadow-royal/20">
                  <Link to="/register">Get Started</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base border-slate-300 hover:bg-slate-50 text-slate-700">
                  <Link to="/login">Sign In</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-slate-500 font-medium flex items-center justify-center lg:justify-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Built for smarter financial decisions, not just transaction recording.
              </p>
            </div>

            {/* Hero Dashboard Preview */}
            <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none perspective-1000">
              <div className="relative bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden transform lg:rotate-y-[-5deg] lg:rotate-x-[5deg] transition-transform duration-500 hover:rotate-0 group">
                
                {/* Mock UI Header */}
                <div className="h-12 border-b border-slate-100 flex items-center px-4 bg-slate-50/50 justify-between">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">Dashboard Overview</div>
                </div>

                <div className="p-6 grid gap-4 bg-white/50">
                  {/* Top Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Revenue</div>
                      <div className="text-2xl font-bold text-navy">₹8,45,000</div>
                      <div className="text-[10px] text-green-600 font-medium flex items-center mt-1"><ArrowUpRight className="w-3 h-3 mr-0.5"/> +12.5%</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Net Profit</div>
                      <div className="text-2xl font-bold text-navy">₹1,62,500</div>
                      <div className="text-[10px] text-green-600 font-medium flex items-center mt-1"><ArrowUpRight className="w-3 h-3 mr-0.5"/> +4.2%</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-sm font-semibold text-navy">Cash Flow Forecast</div>
                      <div className="text-xs text-royal font-medium bg-blue-50 px-2 py-1 rounded">Next 90 Days</div>
                    </div>
                    <div className="h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cashFlowData}>
                          <Line type="monotone" dataKey="cash" stroke="#2563EB" strokeWidth={3} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Insight Alert */}
                  <div className="bg-amber-50/50 border border-amber-100 p-3 rounded-xl flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <TrendingDown className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-amber-900 leading-tight mb-1">Profit Leak Detected</div>
                      <div className="text-xs text-amber-700 leading-snug">Average delivery costs have increased by 14% this month, impacting overall margin.</div>
                    </div>
                  </div>
                </div>

                {/* Decorative overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/30 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 4. TRUST AND VALUE SECTION */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-royal" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Unified Control</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Connect sales, purchases, payments, and accounting in one seamless workspace.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Real-Time Visibility</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Understand your revenue, expenses, cash, receivables, and payables instantly.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Intelligent Decisions</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Discover profit leaks, unusual expenses, and future cash-flow risks automatically.</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-navy mb-2">Built for Furniture</h3>
              <p className="text-sm text-slate-600 leading-relaxed">Track materials, inventory value, margins, and complex manufacturing operations.</p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. FEATURE SHOWCASE */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-navy mb-4">Everything Your Furniture Business Needs</h2>
            <p className="text-lg text-slate-600">A complete suite of tools designed to replace fragmented spreadsheets and legacy software.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: ShoppingBag, title: "Sales Management", desc: "Track quotes, orders, invoices, and customer payments effortlessly." },
              { icon: ShoppingBag, title: "Purchase Management", desc: "Manage supplier orders, bills, and track material costs over time." },
              { icon: Package, title: "Inventory Intelligence", desc: "Real-time stock levels, margin tracking, and reorder alerts." },
              { icon: Calculator, title: "Double-Entry Accounting", desc: "Automated journal entries keeping your books GAAP compliant." },
              { icon: PieChart, title: "Budget Management", desc: "Set limits, track actuals against budgets, and prevent overspending." },
              { icon: Activity, title: "Financial Reports", desc: "Generate P&L, Balance Sheets, and Cash Flow statements instantly." },
              { icon: TrendingUp, title: "Cash-Flow Forecasting", desc: "Predict future cash positions based on scheduled payables and receivables." },
              { icon: ShieldCheck, title: "Profit-Leak Detection", desc: "AI-driven alerts for unusual expenses, discount overuse, or cost spikes." }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-royal/50 hover:shadow-lg transition-all group">
                <feature.icon className="w-8 h-8 text-royal mb-4 group-hover:scale-110 transition-transform" />
                <h4 className="text-base font-bold text-navy mb-2">{feature.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. INTELLIGENCE SECTION */}
      <section id="intelligence" className="py-24 bg-navy text-white relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-royal/20 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">More Than Accounting. Business Intelligence.</h2>
            <p className="text-lg text-slate-300">CraftLedger does not only tell you what happened to your money. It helps you understand why it happened and what you should do next.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* Health Score Panel */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold">Business Health Score</h3>
              </div>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-black text-white">84</span>
                <span className="text-sm text-green-400 font-medium mb-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1"/> Strong</span>
              </div>
              <ul className="space-y-3">
                {['Profitability', 'Cash position', 'Payment performance', 'Expense control'].map(item => (
                  <li key={item} className="flex justify-between items-center text-sm border-b border-slate-700/50 pb-2">
                    <span className="text-slate-300">{item}</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  </li>
                ))}
              </ul>
            </div>

            {/* Cash Flow Forecast */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold">Cash-Flow Forecast</h3>
              </div>
              <div className="h-32 w-full mb-4 opacity-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <Line type="monotone" dataKey="cash" stroke="#818cf8" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700 mt-4">
                <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Alert</div>
                <div className="text-sm text-slate-200">Upcoming supplier payment of ₹1.5L due in 5 days may strain cash balance.</div>
              </div>
            </div>

            {/* Profit Leak Detector */}
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-8 rounded-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-rose-400" />
                </div>
                <h3 className="text-xl font-bold">Profit-Leak Detector</h3>
              </div>
              <p className="text-sm text-slate-300 mb-6">Automated monitoring catches margin erosion before it impacts the bottom line.</p>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-rose-500/10 border border-rose-500/20 rounded-lg p-3">
                  <span className="text-sm text-rose-200">High delivery expenses</span>
                  <span className="text-xs font-semibold text-rose-400">-₹42,000</span>
                </div>
                <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-sm text-slate-300">Excessive discounting</span>
                  <span className="text-xs font-semibold text-slate-400">Monitoring...</span>
                </div>
                <div className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
                  <span className="text-sm text-slate-300">Rising supplier costs</span>
                  <span className="text-xs font-semibold text-slate-400">Stable</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-navy mb-4">How CraftLedger Works</h2>
            <p className="text-lg text-slate-600">A seamless workflow that turns operational data into actionable financial intelligence.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[10%] right-[10%] h-0.5 bg-slate-100 z-0"></div>
            
            {[
              { step: '1', title: 'Connect Data', desc: 'Input your starting balances, products, and contacts into the system.' },
              { step: '2', title: 'Record Activity', desc: 'Log daily sales, purchases, and payments using intuitive forms.' },
              { step: '3', title: 'Auto Accounting', desc: 'Journal entries and ledger updates happen automatically in the background.' },
              { step: '4', title: 'Get Insights', desc: 'Review automated reports, forecasts, and AI-driven business advice.' },
            ].map((s) => (
              <div key={s.step} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-50 shadow-md flex items-center justify-center text-xl font-bold text-royal mb-6 ring-4 ring-white">
                  {s.step}
                </div>
                <h4 className="text-lg font-bold text-navy mb-2">{s.title}</h4>
                <p className="text-sm text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. DASHBOARD PREVIEW */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-navy mb-12">Your Entire Business at a Glance</h2>
          
          <div className="relative rounded-2xl shadow-2xl border border-slate-200 overflow-hidden bg-white mx-auto">
            {/* Fake browser chrome */}
            <div className="h-10 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="w-3 h-3 rounded-full bg-slate-300"></div>
              <div className="mx-auto bg-white rounded-md h-6 w-64 border border-slate-200 flex items-center justify-center text-[10px] text-slate-400 font-medium">app.craftledger.com</div>
            </div>
            
            <div className="flex h-[600px] text-left">
              {/* Fake Sidebar */}
              <div className="w-48 bg-white border-r border-slate-200 p-4 hidden md:flex flex-col gap-2">
                <div className="h-6 w-24 bg-slate-200 rounded mb-6"></div>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className={`h-8 rounded ${i===0 ? 'bg-blue-50' : 'bg-transparent'} flex items-center px-2 gap-2`}>
                    <div className={`w-4 h-4 rounded-sm ${i===0 ? 'bg-royal' : 'bg-slate-200'}`}></div>
                    <div className={`h-3 w-16 rounded ${i===0 ? 'bg-royal/20' : 'bg-slate-200'}`}></div>
                  </div>
                ))}
              </div>
              
              {/* Fake Content */}
              <div className="flex-1 bg-slate-50 p-6 overflow-hidden flex flex-col gap-6">
                <div className="flex justify-between">
                  <div>
                    <div className="h-6 w-48 bg-slate-300 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-10 w-10 bg-slate-200 rounded-full"></div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm h-24">
                      <div className="h-3 w-16 bg-slate-200 rounded mb-4"></div>
                      <div className="h-6 w-24 bg-slate-300 rounded"></div>
                    </div>
                  ))}
                </div>

                <div className="flex-1 grid grid-cols-3 gap-6">
                  <div className="col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col">
                    <div className="h-4 w-32 bg-slate-200 rounded mb-6"></div>
                    <div className="flex-1 bg-slate-50 rounded border border-slate-100"></div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-4">
                    <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
                    <div className="h-16 bg-blue-50 rounded border border-blue-100"></div>
                    <div className="h-16 bg-rose-50 rounded border border-rose-100"></div>
                    <div className="h-16 bg-amber-50 rounded border border-amber-100"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CTA SECTION */}
      <section className="py-24 bg-royal relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-6">Make Every Business Decision with Confidence.</h2>
          <p className="text-xl text-blue-100 mb-10 leading-relaxed max-w-2xl mx-auto">
            Bring your furniture business operations, accounting, and financial intelligence into one connected platform today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="h-14 px-10 text-lg bg-white text-royal hover:bg-slate-50 shadow-xl">
              <Link to="/register">Start Using CraftLedger</Link>
            </Button>
            <Button asChild size="lg" className="h-14 px-10 text-lg border-2 border-white/30 bg-transparent text-white hover:bg-white/10">
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4 bg-white inline-block p-2 rounded-lg">
                <img src={logo} alt="CraftLedger Logo" className="h-12 w-auto object-contain" />
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs mb-6">
                Intelligent financial and inventory management built exclusively for modern urban furniture businesses.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Reports</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intelligence</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Data Security</a></li>
              </ul>
            </div>

          </div>
          
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">© 2026 CraftLedger. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-slate-500 hover:text-white"><span className="sr-only">Twitter</span><div className="w-5 h-5 bg-slate-700 rounded-full"></div></a>
              <a href="#" className="text-slate-500 hover:text-white"><span className="sr-only">LinkedIn</span><div className="w-5 h-5 bg-slate-700 rounded-full"></div></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
