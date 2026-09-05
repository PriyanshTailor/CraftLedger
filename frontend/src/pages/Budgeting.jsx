import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select } from '../components/ui/FormField';
import { Plus, AlertTriangle, TrendingUp } from 'lucide-react';
import { getBudgetData } from '../services/budgetService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { cn } from '../lib/utils';

function formatINR(value) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function CreateBudgetModal({ isOpen, onClose }) {
  const [planned, setPlanned] = useState('');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Budget" size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Budget Name" required className="md:col-span-2">
            <Input placeholder="e.g. Procurement Budget Q3" />
          </FormField>
          <FormField label="Period Type" required>
            <Select>
              <option>Monthly</option>
              <option>Quarterly</option>
              <option>Yearly</option>
              <option>Custom</option>
            </Select>
          </FormField>
          <FormField label="Start Month" required>
            <Input type="month" defaultValue={new Date().toISOString().slice(0, 7)} />
          </FormField>
          <FormField label="Analytic Account">
            <Select>
              <option value="">Select account</option>
              <option>Procurement</option>
              <option>Marketing</option>
              <option>Operations</option>
              <option>HR & Salaries</option>
              <option>IT & Tech</option>
            </Select>
          </FormField>
          <FormField label="Responsible Person">
            <Input placeholder="e.g. Rahul Sharma" />
          </FormField>
          <FormField label="Planned Amount (₹)" required className="md:col-span-2">
            <Input
              type="number"
              min="0"
              placeholder="e.g. 500000"
              value={planned}
              onChange={e => setPlanned(e.target.value)}
            />
          </FormField>
        </div>

        {planned && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-royal uppercase tracking-wide mb-1">Budget Summary</p>
            <p className="text-sm text-slate-700">
              Planned budget: <span className="font-semibold text-navy">{formatINR(Number(planned))}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Monthly tracking will begin from your selected start month.</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Create Budget</Button>
        </div>
      </div>
    </Modal>
  );
}

export function Budgeting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getBudgetData().then(res => { setData(res); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading budgets...</div>;

  const chartData = data.budgets.map(b => ({
    name: b.name.replace(' Budget', '').replace(' & HR', ''),
    Planned: b.planned / 100000,
    Actual: b.actual / 100000,
  }));

  return (
    <div className="space-y-6">
      <CreateBudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Budgeting</h2>
          <p className="text-slate-500">Track planned vs actual spending across departments.</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-slate-200 rounded-md bg-white text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-royal text-slate-700">
            <option>September 2026</option>
            <option>August 2026</option>
            <option>Q3 2026</option>
          </select>
          <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Budget</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Budget vs Actual</CardTitle>
          <CardDescription>Planned vs actual spend for the selected period.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={v => `₹${v}L`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={value => [`₹${value}L`]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                <Bar dataKey="Planned" fill="#CBD5E1" radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="Actual" radius={[4, 4, 0, 0]} maxBarSize={36}>
                  {chartData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.Actual > entry.Planned ? '#EF4444' : '#2563EB'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.budgets.map(budget => {
          const variance = budget.actual - budget.planned;
          const variancePct = ((variance / budget.planned) * 100).toFixed(1);
          const isOver = variance > 0;
          return (
            <Card key={budget.id} className={cn("hover:shadow-md transition-shadow", isOver && "border-red-200")}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-navy">{budget.name}</h3>
                    <p className="text-sm text-slate-500">{budget.period} · {budget.responsible}</p>
                  </div>
                  {isOver
                    ? <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Over Budget</Badge>
                    : <Badge variant="success"><TrendingUp className="w-3 h-3 mr-1" />On Track</Badge>}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Actual: <span className="font-semibold text-slate-700">{formatINR(budget.actual)}</span></span>
                    <span>Planned: <span className="font-semibold text-slate-700">{formatINR(budget.planned)}</span></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : "bg-royal")}
                      style={{ width: `${Math.min((budget.actual / budget.planned) * 100, 100)}%` }} />
                  </div>
                </div>
                <div className={cn("text-sm font-medium", isOver ? "text-red-600" : "text-green-600")}>
                  {isOver
                    ? `+${variancePct}% over budget (${formatINR(Math.abs(variance))} excess)`
                    : `${Math.abs(variancePct)}% under budget (${formatINR(Math.abs(variance))} saved)`}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
