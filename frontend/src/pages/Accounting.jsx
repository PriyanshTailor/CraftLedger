import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Trash2, Loader2, TrendingUp } from 'lucide-react';
import { accountingService } from '../services/accountingService';
import { cn } from '../lib/utils';
import { getApiErrorMessage, getApiFieldErrors, validateNumber, validateRequired } from '../lib/validation';

const accountTypeColors = {
  asset: 'secondary', liability: 'destructive', equity: 'primary', revenue: 'success', expense: 'warning',
};

function CreateJournalEntryModal({ isOpen, onClose, onRefresh, accounts, journals }) {
  const [formData, setFormData] = useState({
    entryDate: new Date().toISOString().split('T')[0],
    journalId: '',
    description: '',
    referenceType: 'manual',
    referenceId: ''
  });

  const [lines, setLines] = useState([
    { id: 1, accountId: '', description: '', debit: '', credit: '' },
    { id: 2, accountId: '', description: '', debit: '', credit: '' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const addLine = () => setLines(p => [...p, { id: Date.now(), accountId: '', description: '', debit: '', credit: '' }]);
  const removeLine = id => setLines(p => p.filter(l => l.id !== id));
  const updateLine = (id, field, value) => setLines(p => p.map(l => l.id === id ? { ...l, [field]: value } : l));

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0;
  const fmt = n => `₹${n.toLocaleString('en-IN')}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (validateRequired(formData.journalId, 'Journal')) errors.journalId = 'Journal is required';
    if (validateRequired(formData.description, 'Description')) errors.description = 'Description is required';
    if (lines.some(line => validateRequired(line.accountId, 'Account'))) errors.lines = 'Every journal line must have an account';
    if (lines.some(line => validateNumber(line.debit || 0, 'Debit', { min: 0 }) || validateNumber(line.credit || 0, 'Credit', { min: 0 }))) errors.lines = 'Debit and credit must be valid non-negative numbers';
    if (!balanced) errors.lines = 'Debit and credit totals must be equal and greater than zero';
    setFieldErrors(errors);
    if (Object.keys(errors).length) { setError('Please correct the journal entry before posting.'); return; }
    setError('');
    setSubmitting(true);
    
    try {
      const payload = {
        entryDate: formData.entryDate,
        journalId: formData.journalId,
        description: formData.description,
        referenceType: formData.referenceType,
        lines: lines.map(l => {
          const acc = accounts.find(a => a._id === l.accountId);
          return {
            accountId: l.accountId,
            accountNameSnapshot: acc ? acc.accountName : '',
            debit: Number(l.debit) || 0,
            credit: Number(l.credit) || 0,
            description: l.description
          };
        }).filter(l => l.debit > 0 || l.credit > 0)
      };
      if (/^[a-f\d]{24}$/i.test(formData.referenceId.trim())) payload.referenceId = formData.referenceId.trim();

      await accountingService.createJournalEntry(payload);
      onRefresh();
      onClose();
    } catch (err) {
      setFieldErrors(getApiFieldErrors(err));
      setError(getApiErrorMessage(err, 'Failed to create journal entry'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Journal Entry" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Date" required>
            <Input type="date" value={formData.entryDate} onChange={e => setFormData({...formData, entryDate: e.target.value})} />
          </FormField>
          <FormField label="Description" error={fieldErrors.description}>
            <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Entry description" required aria-invalid={Boolean(fieldErrors.description)} />
          </FormField>
          <FormField label="Journal" required error={fieldErrors.journalId}>
            <Select value={formData.journalId} onChange={e => setFormData({...formData, journalId: e.target.value})} required aria-invalid={Boolean(fieldErrors.journalId)}>
              <option value="">Select journal</option>
              {journals.map(journal => <option key={journal._id} value={journal._id}>{journal.code} - {journal.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Reference">
            <Input value={formData.referenceId} onChange={e => setFormData({...formData, referenceId: e.target.value})} placeholder="e.g. INV-2026-0050" />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Journal Lines</h3>
            <Button type="button" variant="outline" size="sm" onClick={addLine}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line</Button>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Account</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Description</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-32">Debit (₹)</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-32">Credit (₹)</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map(line => (
                  <tr key={line.id}>
                    <td className="px-4 py-3">
                      <select value={line.accountId} onChange={e => updateLine(line.id, 'accountId', e.target.value)} required
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal bg-white">
                        <option value="">Select account</option>
                        {accounts.map(a => <option key={a._id} value={a._id}>{a.accountCode} - {a.accountName}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)}
                        placeholder="Description" className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" step="0.01" value={line.debit} onChange={e => updateLine(line.id, 'debit', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" step="0.01" value={line.credit} onChange={e => updateLine(line.id, 'credit', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => removeLine(line.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={2} className="px-4 py-3 text-sm font-semibold text-slate-600">Totals</td>
                  <td className="px-4 py-3 text-right font-bold text-navy">{fmt(totalDebit)}</td>
                  <td className="px-4 py-3 text-right font-bold text-navy">{fmt(totalCredit)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          {!balanced && totalDebit > 0 && (
            <p className="text-xs text-red-600 mt-2 font-medium">
              ⚠ Entry is not balanced. Debit and Credit must be equal.
            </p>
          )}
          {balanced && (
            <p className="text-xs text-green-600 mt-2 font-medium">✓ Entry is balanced.</p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" disabled={!balanced || submitting}>{submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null} Post Entry</Button>
        </div>
      </form>
    </Modal>
  );
}

export function Accounting() {
  const [accounts, setAccounts] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('chart');
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, jeRes, journalRes] = await Promise.all([
        accountingService.getAccounts(),
        accountingService.getJournalEntries(),
        accountingService.getJournals()
      ]);
      // Master-data list responses are paginated ({ docs, total, ... }),
      // while journal entries are returned as a plain array.
      setAccounts(Array.isArray(accRes.data) ? accRes.data : (accRes.data?.docs || []));
      setJournalEntries(Array.isArray(jeRes.data) ? jeRes.data : (jeRes.data?.docs || []));
      setJournals(Array.isArray(journalRes.data) ? journalRes.data : (journalRes.data?.docs || []));
      setError(null);
    } catch (err) {
      setError("Failed to load accounting data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading accounting data...</div>;
  if (error) return <div className="flex flex-col justify-center items-center h-64 text-red-500"><p>{error}</p><Button onClick={fetchData} className="mt-4">Retry</Button></div>;

  return (
    <div className="space-y-6">
      <CreateJournalEntryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onRefresh={fetchData} accounts={accounts} journals={journals} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Accounting</h2>
          <p className="text-slate-500 text-sm">Chart of accounts, journal entries, and general ledger.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-blue-200 text-royal bg-blue-50/60 hover:bg-blue-100/70 font-semibold text-xs h-9"
          >
            <Link to="/dashboard/cash-flow-forecast">
              <TrendingUp className="w-4 h-4 mr-1.5 text-royal" />
              Cash Flow Forecast
            </Link>
          </Button>
          <Button onClick={() => setModalOpen(true)} className="text-xs h-9">
            <Plus className="w-4 h-4 mr-1.5" /> New Journal Entry
          </Button>
        </div>
      </div>

      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg w-fit">
        {[{ key: 'chart', label: 'Chart of Accounts' }, { key: 'journal', label: 'Journal Entries' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn('px-4 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === tab.key ? 'bg-white text-navy shadow-sm' : 'text-slate-500 hover:text-slate-700')}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'chart' && (
        <Card>
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle>Chart of Accounts</CardTitle>
            <CardDescription>Full listing of all financial accounts.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {accounts.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No accounts found.</div>
            ) : (
            <table className="w-full text-sm text-left min-w-[600px]">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Code</th>
                  <th className="px-6 py-4 font-medium">Account Name</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map(account => (
                  <tr key={account._id} className="hover:bg-slate-50/50 cursor-pointer">
                  <td className="px-6 py-4 font-mono text-slate-500 text-xs">{account.accountCode}</td>
                  <td className="px-6 py-4 font-medium text-navy">{account.accountName}</td>
                  <td className="px-6 py-4"><Badge variant={accountTypeColors[account.accountType] || 'outline'}>{account.accountType.toUpperCase()}</Badge></td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">{fmt(0)} {/* Add real balance tracking later */}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'journal' && (
        <Card>
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle>Journal Entries</CardTitle>
            <CardDescription>Recorded double-entry transactions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            {journalEntries.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No journal entries found.</div>
            ) : (
            <table className="w-full text-sm text-left min-w-[800px]">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Entry No.</th>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Reference</th>
                  <th className="px-6 py-4 font-medium">Description</th>
                  <th className="px-6 py-4 font-medium">Debit</th>
                  <th className="px-6 py-4 font-medium">Credit</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journalEntries.map(entry => (
                  <tr key={entry._id} className="hover:bg-slate-50/50 cursor-pointer">
                    <td className="px-6 py-4 font-semibold text-navy text-xs">{entry.entryNumber}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(entry.entryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-royal font-medium text-xs">{entry.referenceId || '-'}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{entry.description || '-'}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{fmt(entry.totalDebit)}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{fmt(entry.totalCredit)}</td>
                    <td className="px-6 py-4"><Badge variant={entry.status === 'posted' ? 'success' : 'outline'}>{entry.status.toUpperCase()}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
