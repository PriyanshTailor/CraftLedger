import React, { useEffect, useState } from 'react';
import {
  BrainCircuit, Activity, LineChart, Wallet, PieChart, Package,
  Calculator, Search, ShieldCheck, AlertTriangle, ArrowRight,
  Loader2, TrendingUp, TrendingDown, CheckCircle2
} from 'lucide-react';
import { getAiInsights, askAiQuestion } from '../services/aiCfoService';
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
  { id: 'budget', name: 'Budget', icon: PieChart },
];

const quickStats = [
  { label: 'Monthly Revenue', value: '₹12.4L', change: '+12.5%', positive: true },
  { label: 'Net Profit', value: '₹4.1L', change: '-4.2%', positive: false },
  { label: 'Cash Position', value: '₹8.4L', change: 'Healthy', positive: true },
  { label: 'Outstanding Dues', value: '₹5.7L', change: '₹2.1L overdue', positive: false },
];

export function AiCfo() {
  const [data, setData] = useState(null);
  const [activeCategory, setActiveCategory] = useState('health');
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState('');
  const [answer, setAnswer] = useState(null);

  useEffect(() => {
    getAiInsights().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleAskQuestion = async (q) => {
    setActiveQuestion(q);
    setAsking(true);
    setAnswer(null);
    const res = await askAiQuestion(q);
    setAnswer(res);
    setAsking(false);
  };

  const resetAnswer = () => {
    setAnswer(null);
    setActiveQuestion('');
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-slate-500 gap-2">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading AI insights...
    </div>
  );

  return (
    <div className="space-y-5 pb-10">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-navy via-blue-800 to-royal text-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-1 flex items-center gap-3">
              <BrainCircuit className="w-7 h-7 text-blue-200" />
              UrbanAI CFO
            </h2>
            <p className="text-blue-100 text-sm">Understand your business. Make better decisions.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/10">
              <div>
                <p className="text-blue-200 text-[10px] uppercase font-semibold tracking-wider mb-0.5">Business Health</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{data.healthScore}</span>
                  <span className="text-blue-300 text-sm">/100</span>
                  <Badge className="bg-green-500/20 text-green-100 border border-green-400/30 text-[10px]">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Healthy
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((s, i) => (
            <div key={i} className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
              <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">{s.label}</p>
              <p className="text-white font-bold text-sm">{s.value}</p>
              <p className={`text-[11px] mt-0.5 font-medium ${s.positive ? 'text-green-300' : 'text-red-300'}`}>{s.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* LEFT: Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest px-2 mb-3">Insight Categories</p>
            <div className="space-y-1">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); resetAnswer(); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all text-left",
                    activeCategory === cat.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <cat.icon className={cn("w-[18px] h-[18px] shrink-0", activeCategory === cat.id ? "text-blue-600" : "text-slate-400")} />
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Workspace */}
        <div className="lg:col-span-3 space-y-5 min-w-0">

          {/* Answer Panel */}
          {(asking || answer) && (
            <Card className="border-royal/30 shadow-md ring-2 ring-blue-50">
              <CardContent className="p-5">
                {/* User question */}
                <div className="flex gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-xs font-bold text-slate-600">You</div>
                  <div className="pt-1.5">
                    <p className="font-semibold text-navy text-sm">{activeQuestion}</p>
                  </div>
                </div>

                {/* AI response */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <BrainCircuit className="w-4 h-4 text-royal" />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    {asking ? (
                      <div className="flex items-center text-slate-500 gap-2 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing your financial data...
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-slate-700 text-sm leading-relaxed">{answer.answer}</p>

                        {answer.impact && (
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: 'Revenue Impact', value: answer.impact.revenue, positive: true },
                              { label: 'Cost Impact', value: answer.impact.costs, positive: false },
                              { label: 'Expense Impact', value: answer.impact.expenses, positive: false },
                            ].map((imp, i) => (
                              <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-[10px] text-slate-400 uppercase font-semibold mb-1">{imp.label}</p>
                                <p className={`font-bold text-sm ${imp.positive ? 'text-green-600' : 'text-red-600'}`}>{imp.value}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                          <h4 className="font-semibold text-royal text-xs uppercase tracking-wide mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Recommended Action
                          </h4>
                          <p className="text-sm text-blue-900">{answer.recommendation}</p>
                        </div>

                        {answer.relatedLink && (
                          <div className="flex items-center gap-3">
                            <Button asChild variant="outline" size="sm">
                              <Link to={answer.relatedLink}>{answer.linkText} <ArrowRight className="w-3.5 h-3.5 ml-1.5" /></Link>
                            </Button>
                            <button onClick={resetAnswer} className="text-xs text-slate-400 hover:text-slate-600 underline">Ask another question</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Cards Grid */}
          {!answer && !asking && (
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Ask a financial question</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(() => {
                  const categoryQuestions = {
                    health: [
                      "What is my current business health score?",
                      "How can I improve my overall health score?",
                      "Are there any red flags in my finances?",
                      "What is the biggest risk right now?",
                      "How does my health compare to last month?",
                      "Show me a summary of my financial health."
                    ],
                    cash: [
                      "Will we have enough cash next month?",
                      "Who owes us money?",
                      "What are our biggest cash outflows?",
                      "How much cash do we have right now?",
                      "When is our next big payment due?",
                      "How can we improve our cash flow?"
                    ],
                    profit: [
                      "What is my current profit?",
                      "Why did profit decrease?",
                      "Which product is most profitable?",
                      "What is our gross margin?",
                      "How does profit compare to last year?",
                      "Which department is least profitable?"
                    ],
                    expenses: [
                      "Are there any unusual expenses?",
                      "What is our biggest expense this month?",
                      "Where can we cut costs?",
                      "How much are we spending on payroll?",
                      "Are our expenses growing faster than revenue?",
                      "Show me a breakdown of operating expenses."
                    ],
                    inventory: [
                      "Which product is overstocked?",
                      "What should we reorder soon?",
                      "How much capital is tied up in inventory?",
                      "What is our slow-moving stock?",
                      "Which items have the lowest margin?",
                      "Are we losing money on storage?"
                    ],
                    budget: [
                      "Are we over budget this month?",
                      "Which department is exceeding its budget?",
                      "How much budget is left for marketing?",
                      "Can we afford a new hire?",
                      "What was our budget variance last quarter?",
                      "Show me the budget forecast for Q4."
                    ]
                  };
                  const questionsToShow = categoryQuestions[activeCategory] || data.predefinedQuestions;
                  return questionsToShow.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskQuestion(q)}
                      className="text-left p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between gap-3"
                    >
                      <span className="font-medium text-slate-700 text-sm group-hover:text-blue-700">{q}</span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                    </button>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Health Score Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-blue-800">Financial Health Breakdown</CardTitle>
              <CardDescription>Detailed analysis of your {data.healthScore}/100 score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {data.breakdown.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center">
                    {/* Circular gauge */}
                    <div className="relative w-14 h-14 mb-2">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15.9"
                          fill="none"
                          stroke={item.score >= 85 ? '#10B981' : item.score >= 75 ? '#2563EB' : '#F59E0B'}
                          strokeWidth="3"
                          strokeDasharray={`${item.score} 100`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                        style={{ color: item.score >= 85 ? '#10B981' : item.score >= 75 ? '#2563EB' : '#F59E0B' }}
                      >
                        {item.score}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">{item.name}</p>
                    <Badge
                      variant={item.status === 'Excellent' ? 'success' : item.status === 'Needs Attention' ? 'warning' : 'secondary'}
                      className="text-[9px] uppercase font-bold px-2"
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Anomaly Detection */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-800">
                <Search className="w-4 h-4 text-blue-600" /> Anomaly Detection
              </CardTitle>
              <CardDescription>AI-detected unusual patterns in your transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.anomalies.map(anomaly => (
                  <div key={anomaly.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-slate-200 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-lg shrink-0">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-blue-800 text-sm">Unusual {anomaly.type}</h4>
                          <Badge variant={anomaly.severity === 'High' ? 'destructive' : 'warning'} className="text-[10px]">
                            {anomaly.severity} Severity
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-500 mb-2 leading-relaxed">{anomaly.message}</p>
                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-400">
                          <span>Ref: <span className="font-semibold text-slate-600">{anomaly.reference}</span></span>
                          <span>Amount: <span className="font-semibold text-red-600">{anomaly.amount}</span></span>
                          <span>Expected: <span className="font-semibold text-slate-600">{anomaly.expected}</span></span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="shrink-0 self-end sm:self-auto">Investigate</Button>
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
