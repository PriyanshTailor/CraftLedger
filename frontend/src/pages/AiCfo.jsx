import React, { useEffect, useState } from 'react';
import {
  BrainCircuit, Activity, LineChart, Wallet, PieChart, Package,
  Calculator, Search, ShieldCheck, AlertTriangle, ArrowRight,
  Loader2, TrendingUp, TrendingDown, CheckCircle2
} from 'lucide-react';
import { intelligenceService } from '../services/intelligenceService';
import { dashboardService } from '../services/dashboardService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'health', name: 'Business Health', icon: Activity },
  { id: 'cash', name: 'Cash Flow', icon: Wallet },
  { id: 'profit', name: 'Profitability', icon: LineChart },
  { id: 'expenses', name: 'Expenses', icon: Calculator },
  { id: 'inventory', name: 'Inventory', icon: Package },
];

const DEFAULT_QUESTIONS = [
  "What is my current profit?",
  "How much cash do I have?",
  "Which products are most profitable?",
  "Where am I losing profit?",
  "Which customers owe me money?",
  "Will I have enough cash next month?"
];

export function AiCfo() {
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('health');
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true);
        // We can use getSummary from dashboard to populate basic stats, and specific endpoints for others
        const [dashRes, healthRes, leaksRes] = await Promise.all([
          dashboardService.getSummary(),
          intelligenceService.getHealthScore(),
          intelligenceService.getProfitLeaks()
        ]);
        
        setData({
          metrics: dashRes.data.metrics,
          health: healthRes.data,
          leaks: leaksRes.data,
          insights: dashRes.data.aiInsights || []
        });
        setError(null);
      } catch (err) {
        setError('Failed to load AI insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const handleAskQuestion = async (q) => {
    setActiveQuestion(q);
    setAsking(true);
    setAnswer(null);
    try {
      const res = await intelligenceService.askQuestion(q);
      setAnswer(res.data);
    } catch (err) {
      setAnswer({ answer: "Sorry, I couldn't process your question at this time. Please try again." });
    } finally {
      setAsking(false);
    }
  };

  const resetAnswer = () => {
    setAnswer(null);
    setActiveQuestion('');
  };
  
  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-slate-500 gap-2">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading AI insights...
    </div>
  );
  
  if (error) return <div className="flex flex-col justify-center items-center h-64 text-red-500"><p>{error}</p><Button onClick={() => window.location.reload()} className="mt-4">Retry</Button></div>;

  return (
    <div className="space-y-5 pb-10">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-navy via-blue-800 to-royal text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <BrainCircuit className="w-7 h-7 text-blue-200" />
              CraftLedger AI CFO
            </h2>
            <p className="text-blue-100 text-sm">Understand your business. Make better decisions.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <div>
                <p className="text-blue-200 text-[10px] uppercase font-semibold tracking-wider mb-0.5">Business Health</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data.health.overallScore}</span>
                  <span className="text-blue-300 text-sm">/100</span>
                  <Badge className="bg-green-500/20 text-green-100 border border-green-400/30 text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> {data.health.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Monthly Revenue</p>
            <p className="text-white font-bold text-sm">{fmt(data.metrics.revenue)}</p>
            <p className={cn("text-[11px] mt-0.5 font-medium", data.metrics.revenueTrend >= 0 ? "text-green-300" : "text-red-300")}>{data.metrics.revenueTrend}% vs last month</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Net Profit</p>
            <p className="text-white font-bold text-sm">{fmt(data.metrics.netProfit)}</p>
            <p className={cn("text-[11px] mt-0.5 font-medium", data.metrics.profitTrend >= 0 ? "text-green-300" : "text-red-300")}>{data.metrics.profitTrend}% vs last month</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Available Cash</p>
            <p className="text-white font-bold text-sm">{fmt(data.metrics.availableCash)}</p>
            <p className="text-[11px] mt-0.5 font-medium text-blue-200">Current Balance</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Receivables</p>
            <p className="text-white font-bold text-sm">{fmt(data.metrics.receivables)}</p>
            <p className="text-[11px] mt-0.5 font-medium text-amber-200">Pending Collection</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ask Section */}
          <Card className="border-t-4 border-t-royal shadow-md">
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5 text-royal" /> Ask your AI CFO
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {activeQuestion ? (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <p className="font-medium text-navy">"{activeQuestion}"</p>
                  </div>
                  
                  {asking ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-3">
                      <div className="relative">
                        <BrainCircuit className="w-10 h-10 text-slate-200" />
                        <Loader2 className="w-10 h-10 text-royal absolute top-0 left-0 animate-spin" />
                      </div>
                      <p className="text-sm text-slate-500 animate-pulse">Analyzing financial data...</p>
                    </div>
                  ) : answer && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700 leading-relaxed text-sm">
                        {answer.answer}
                      </div>
                      
                      {answer.metrics && (
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          {Object.entries(answer.metrics).map(([key, val], idx) => (
                            <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3">
                              <p className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                              <p className="font-bold text-navy">{typeof val === 'number' ? fmt(val) : val}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {answer.recommendedAction && (
                        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">Recommended Action</p>
                            <p className="text-sm text-emerald-700 mt-1">{answer.recommendedAction}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <Button variant="outline" size="sm" onClick={resetAnswer}>Ask another question</Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-slate-500 mb-4">Select a question to instantly analyze your financial data:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {DEFAULT_QUESTIONS.map((q, i) => (
                      <button 
                        key={i}
                        onClick={() => handleAskQuestion(q)}
                        className="text-left p-3 rounded-lg border border-slate-200 hover:border-royal hover:bg-blue-50/50 transition-colors text-sm font-medium text-slate-700 hover:text-navy flex items-center justify-between group"
                      >
                        <span className="truncate pr-2">{q}</span>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-royal shrink-0 transition-transform group-hover:translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strategic Insights */}
          {!activeQuestion && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>Proactive Insights</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-royal border-blue-200">Generated today</Badge>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {data.insights.map((insight, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group">
                    <div className={cn("p-2.5 rounded-lg h-fit shrink-0", 
                      insight.type === 'positive' ? 'bg-green-100 text-green-700' :
                      insight.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-royal'
                    )}>
                      {insight.type === 'warning' ? <AlertTriangle className="w-5 h-5"/> : <Lightbulb className="w-5 h-5"/>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className="font-semibold text-navy">{insight.title}</h4>
                      </div>
                      <p className="text-sm text-slate-600 mb-3">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" /> Profit Leaks Detected
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {data.leaks.length === 0 ? (
                   <div className="p-6 text-center text-sm text-slate-500">No profit leaks detected. Your business is highly optimized.</div>
                ) : data.leaks.map((leak, i) => (
                  <div key={i} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-navy text-sm">{leak.title}</span>
                      <Badge variant={leak.severity === 'High Priority' ? 'destructive' : 'warning'} className="text-[10px]">
                        {leak.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{leak.description}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-semibold text-red-600">Impact: {fmt(leak.amount)}</span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs text-royal px-2">Investigate</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Lightbulb(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>
    </svg>
  );
}
