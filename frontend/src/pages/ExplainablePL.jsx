import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TrendingDown, ArrowRight, Download } from 'lucide-react';

const data = [
  { name: 'Previous Profit', value: 730000, type: 'start' },
  { name: 'Revenue', value: 140000, type: 'positive' },
  { name: 'Purchases', value: -380000, type: 'negative' },
  { name: 'Op. Expenses', value: -80000, type: 'negative' },
  { name: 'Delivery', value: -42000, type: 'negative' },
  { name: 'Discounts', value: 42000, type: 'positive' },
  { name: 'Current Profit', value: 410000, type: 'end' },
];

export function ExplainablePL() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Why Did Profit Change?</h1>
          <p className="text-slate-500">Analysis of net profit variance between Previous Period and Current Period.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 border-royal/30 ring-2 ring-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-500">Previous Profit</p>
              <p className="text-lg font-semibold text-navy">₹7.3L</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">Current Profit</p>
              <p className="text-lg font-semibold text-navy">₹4.1L</p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <p className="text-sm font-medium text-slate-700">Absolute Change</p>
              <p className="text-2xl font-bold text-red-600 flex items-center gap-2">
                <TrendingDown className="w-5 h-5" /> -₹3.2L
              </p>
              <p className="text-xs font-medium text-red-500 bg-red-50 inline-block px-2 py-0.5 rounded-full mt-1">-43.8%</p>
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-900 leading-relaxed border border-blue-100">
              Profit decreased mainly because <strong>purchase costs</strong> increased by ₹3.8L and <strong>operating expenses</strong> increased by ₹80K, offsetting the ₹1.4L revenue growth.
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Profit Waterfall</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                  <ReferenceLine y={0} stroke="#94A3B8" />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => {
                      let color = '#2563EB'; // start/end
                      if (entry.type === 'positive') color = '#10B981';
                      if (entry.type === 'negative') color = '#EF4444';
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <h3 className="text-lg font-semibold text-navy mt-8 mb-4">Key Contributors</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: 'Purchase Costs', amount: '-₹3.8L', impact: 'negative', pct: '118% of variance', desc: 'Raw material prices increased significantly from premium vendors.', route: '/purchases' },
          { title: 'Revenue', amount: '+₹1.4L', impact: 'positive', pct: 'Offsets 43%', desc: 'Sales volume grew, particularly in office furniture.', route: '/sales' },
          { title: 'Operating Expenses', amount: '-₹80K', impact: 'negative', pct: '25% of variance', desc: 'Higher payroll and marketing spend.', route: '/accounting' },
        ].map((c, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-slate-800">{c.title}</p>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.impact === 'negative' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{c.impact}</span>
              </div>
              <p className={`text-xl font-bold ${c.impact === 'negative' ? 'text-red-600' : 'text-green-600'}`}>{c.amount}</p>
              <p className="text-xs text-slate-500 font-medium mb-3">{c.pct}</p>
              <p className="text-sm text-slate-600 mb-4">{c.desc}</p>
              <Button variant="outline" size="sm" className="w-full text-xs">
                View related transactions <ArrowRight className="w-3 h-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
