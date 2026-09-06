import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select } from '../components/ui/FormField';
import { Plus, AlertTriangle, TrendingUp, Loader2 } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { cn } from '../lib/utils';
import { getApiErrorMessage, getApiFieldErrors, validateNumber, validateRequired } from '../lib/validation';

function formatINR(value) {
  if (value === 0) return '₹0';
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function CreateBudgetModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    periodStart: new Date().toISOString().split('T')[0],
    periodEnd: '',
    plannedAmount: '',
    responsiblePerson: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (validateRequired(formData.name, 'Budget name')) errors.name = validateRequired(formData.name, 'Budget name');
    if (validateRequired(formData.periodStart, 'Start date')) errors.periodStart = 'Start date is required';
    if (validateRequired(formData.periodEnd, 'End date')) errors.periodEnd = 'End date is required';
    const amountError = validateNumber(formData.plannedAmount, 'Planned amount', { min: 0 });
    if (amountError) errors.plannedAmount = amountError;
    if (!errors.periodStart && !errors.periodEnd && new Date(formData.periodEnd) < new Date(formData.periodStart)) errors.periodEnd = 'End date must be on or after start date';
    setFieldErrors(errors);
    if (Object.keys(errors).length) { setError('Please correct the highlighted fields before saving.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        name: formData.name,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        plannedAmount: Number(formData.plannedAmount),
        status: 'active'
      };
      if (/^[a-f\d]{24}$/i.test(formData.responsiblePerson.trim())) payload.responsiblePerson = formData.responsiblePerson.trim();
      await budgetService.createBudget(payload);
      onRefresh();
      onClose();
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to create budget'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Budget" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Budget Name" required className="md:col-span-2" error={fieldErrors.name}>
            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required aria-invalid={Boolean(fieldErrors.name)} placeholder="e.g. Procurement Budget Q3" />
          </FormField>
          <FormField label="Start Date" required error={fieldErrors.periodStart}>
            <Input type="date" value={formData.periodStart} onChange={e => setFormData({...formData, periodStart: e.target.value})} required aria-invalid={Boolean(fieldErrors.periodStart)} />
          </FormField>
          <FormField label="End Date" required error={fieldErrors.periodEnd}>
            <Input type="date" value={formData.periodEnd} onChange={e => setFormData({...formData, periodEnd: e.target.value})} required aria-invalid={Boolean(fieldErrors.periodEnd)} />
          </FormField>
          <FormField label="Responsible Person">
            <Input value={formData.responsiblePerson} onChange={e => setFormData({...formData, responsiblePerson: e.target.value})} placeholder="e.g. Rahul Sharma" />
          </FormField>
          <FormField label="Planned Amount (₹)" required error={fieldErrors.plannedAmount}>
            <Input
              type="number"
              min="0"
              required
              placeholder="e.g. 500000"
              value={formData.plannedAmount}
              aria-invalid={Boolean(fieldErrors.plannedAmount)}
              onChange={e => setFormData({...formData, plannedAmount: e.target.value})}
            />
          </FormField>
        </div>

        {formData.plannedAmount && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-royal uppercase tracking-wide mb-1">Budget Summary</p>
            <p className="text-sm text-slate-700">
              Planned budget: <span className="font-semibold text-navy">{formatINR(Number(formData.plannedAmount))}</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">Monthly tracking will begin from your selected start date.</p>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null} Create Budget</Button>
        </div>
      </form>
    </Modal>
  );
}

export function Budgeting() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const res = await budgetService.getBudgets();
      setBudgets(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading budgets...</div>;
  if (error) return <div className="flex flex-col justify-center items-center h-64 text-red-500"><p>{error}</p><Button onClick={fetchBudgets} className="mt-4">Retry</Button></div>;

  const chartData = budgets.map(b => ({
    name: b.name.replace(' Budget', '').replace(' & HR', ''),
    Planned: (b.plannedAmount || 0) / 100000,
    Actual: (b.actualAmount || 0) / 100000,
  }));

  return (
    <div className="space-y-6">
      <CreateBudgetModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onRefresh={fetchBudgets} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Budgeting</h2>
          <p className="text-slate-500">Track planned vs actual spending across departments.</p>
        </div>
        <div className="flex gap-3">
          <select className="border border-slate-200 rounded-md bg-white text-sm px-3 py-2 outline-none focus:ring-1 focus:ring-royal text-slate-700">
            <option>All Budgets</option>
            <option>Active</option>
            <option>Draft</option>
          </select>
          <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Budget</Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Budget vs Actual</CardTitle>
          <CardDescription>Planned vs actual spend for active budgets.</CardDescription>
        </CardHeader>
        <CardContent>
          {budgets.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No budgets found. Create one to get started.</div>
          ) : (
          <div className="h-[280px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} tickFormatter={v => `₹${v}L`} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={value => [`₹${Number(value).toFixed(2)}L`]} />
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
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map(budget => {
          const planned = budget.plannedAmount || 0;
          const actual = budget.actualAmount || 0;
          const variance = actual - planned;
          const variancePct = planned > 0 ? ((variance / planned) * 100).toFixed(1) : 0;
          const isOver = variance > 0;
          return (
            <Card key={budget._id} className={cn("hover:shadow-md transition-shadow", isOver && "border-red-200")}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-navy">{budget.name}</h3>
                    <p className="text-sm text-slate-500">{new Date(budget.periodStart).toLocaleDateString()} - {new Date(budget.periodEnd).toLocaleDateString()} · {budget.responsiblePerson}</p>
                  </div>
                  {isOver
                    ? <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Over Budget</Badge>
                    : <Badge variant="success"><TrendingUp className="w-3 h-3 mr-1" />On Track</Badge>}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                    <span>Actual: <span className="font-semibold text-slate-700">{formatINR(actual)}</span></span>
                    <span>Planned: <span className="font-semibold text-slate-700">{formatINR(planned)}</span></span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", isOver ? "bg-red-500" : "bg-royal")}
                      style={{ width: planned > 0 ? `${Math.min((actual / planned) * 100, 100)}%` : '0%' }} />
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
