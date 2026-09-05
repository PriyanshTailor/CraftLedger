import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Trash2 } from 'lucide-react';
import { getAccountingData } from '../services/accountingService';
import { cn } from '../lib/utils';

const accountTypeColors = {
  Asset: 'secondary', Liability: 'destructive', Equity: 'primary', Revenue: 'success', Expense: 'warning',
};

const ACCOUNTS = [
  '1000 - Cash & Cash Equivalents',
  '1100 - Accounts Receivable',
  '1200 - Inventory',
  '2000 - Accounts Payable',
  '4000 - Sales Revenue',
  '5000 - Cost of Goods Sold',
];

function CreateJournalEntryModal({ isOpen, onClose }) {
  const [lines, setLines] = useState([
    { id: 1, account: '', description: '', debit: '', credit: '' },
    { id: 2, account: '', description: '', debit: '', credit: '' },
  ]);

  const addLine = () => setLines(p => [...p, { id: Date.now(), account: '', description: '', debit: '', credit: '' }]);
  const removeLine = id => setLines(p => p.filter(l => l.id !== id));
  const updateLine = (id, field, value) => setLines(p => p.map(l => l.id === id ? { ...l, [field]: value } : l));

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = totalDebit === totalCredit && totalDebit > 0;
  const fmt = n => `₹${n.toLocaleString('en-IN')}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Journal Entry" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Date" required>
            <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </FormField>
          <FormField label="Journal">
            <Select>
              <option>General Journal</option>
              <option>Sales Journal</option>
              <option>Purchase Journal</option>
              <option>Cash Journal</option>
            </Select>
          </FormField>
          <FormField label="Reference">
            <Input placeholder="e.g. INV-2026-0050" />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Journal Lines</h3>
            <Button variant="outline" size="sm" onClick={addLine}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line</Button>
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
                      <select value={line.account} onChange={e => updateLine(line.id, 'account', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal bg-white">
                        <option value="">Select account</option>
                        {ACCOUNTS.map(a => <option key={a}>{a}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input value={line.description} onChange={e => updateLine(line.id, 'description', e.target.value)}
                        placeholder="Description" className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={line.debit} onChange={e => updateLine(line.id, 'debit', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={line.credit} onChange={e => updateLine(line.id, 'credit', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeLine(line.id)} className="text-slate-300 hover:text-red-500 transition-colors">
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button disabled={!balanced} onClick={onClose}>Post Entry</Button>
        </div>
      </div>
    </Modal>
  );
}

export function Accounting() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('chart');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getAccountingData().then(res => { setData(res); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading accounting data...</div>;

  return (
    <div className="space-y-6">
      <CreateJournalEntryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Accounting</h2>
          <p className="text-slate-500">Chart of accounts, journal entries, and ledger.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> New Journal Entry</Button>
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
                {data.chartOfAccounts.map(account => (
                  <tr key={account.code} className="hover:bg-slate-50/50 cursor-pointer">
                    <td className="px-6 py-4 font-mono text-slate-500 text-xs">{account.code}</td>
                    <td className="px-6 py-4 font-medium text-navy">{account.name}</td>
                    <td className="px-6 py-4"><Badge variant={accountTypeColors[account.type] || 'outline'}>{account.type}</Badge></td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">{account.balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                {data.recentJournalEntries.map(entry => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 cursor-pointer">
                    <td className="px-6 py-4 font-semibold text-navy text-xs">{entry.id}</td>
                    <td className="px-6 py-4 text-slate-500">{entry.date}</td>
                    <td className="px-6 py-4 text-royal font-medium text-xs">{entry.reference}</td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">{entry.description}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{entry.debit}</td>
                    <td className="px-6 py-4 font-medium text-slate-700">{entry.credit}</td>
                    <td className="px-6 py-4"><Badge variant="success">{entry.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
