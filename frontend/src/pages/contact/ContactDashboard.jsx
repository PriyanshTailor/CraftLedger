import React, { useState, useEffect } from 'react';
import { FileText, CreditCard, Receipt, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';
import { contactPortalService } from '../../services/contactPortalService';
import { useAuth } from '../../contexts/AuthContext';

export function ContactDashboard() {
  const { user } = useAuth();
  const isCustomer = user?.contactType === 'customer' || user?.contactType === 'customer_and_vendor';
  const isVendor = user?.contactType === 'vendor' || user?.contactType === 'customer_and_vendor';
  const [data, setData] = useState({ invoices: [], bills: [], payments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await contactPortalService.getDashboard();
        setData(response.data);
      } catch (e) {
        setError('Failed to load your data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isCustomer, isVendor]);

  const primaryRecords = isCustomer ? data.invoices : data.bills;
  const primaryLabel = isCustomer ? 'Invoices' : 'Bills';
  const unpaidRecords = [...data.invoices, ...data.bills].filter(i => ['issued', 'partially_paid', 'overdue'].includes(i.status));
  const totalOutstanding = unpaidRecords.reduce((s, i) => s + (i.balanceDue || i.amountDue || i.totalAmount || 0), 0);

  if (loading) return (
    <div className="flex h-64 items-center justify-center gap-2 text-slate-500 text-sm">
      <Loader2 className="w-5 h-5 animate-spin" /> Loading your account...
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy via-blue-800 to-royal text-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-1">Welcome, {user?.name}!</h2>
        <p className="text-blue-100 text-sm">Manage your own {isCustomer && isVendor ? 'invoices, bills, and payments' : isCustomer ? 'invoices and payments' : 'bills and payments'} here.</p>

        <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Total Outstanding</p>
            <p className="text-white font-bold text-lg">{fmt(totalOutstanding)}</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Unpaid Records</p>
            <p className="text-white font-bold text-lg">{unpaidRecords.length}</p>
          </div>
          <div className="bg-white/10 rounded-lg px-3 py-2.5 border border-white/10">
            <p className="text-blue-200 text-[10px] uppercase tracking-wider font-semibold mb-1">Total Payments Made</p>
            <p className="text-white font-bold text-lg">{data.payments.length}</p>
          </div>
        </div>
      </div>

      {unpaidRecords.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900 text-sm">You have {unpaidRecords.length} outstanding record(s)</p>
              <p className="text-amber-700 text-xs">Total due: {fmt(totalOutstanding)}</p>
            </div>
            <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
              <Link to="/contact/make-payment">Pay Now</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent invoices or bills */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4" /> Recent {primaryLabel}</CardTitle>
            <Link to={isCustomer ? '/contact/invoices' : '/contact/bills'} className="text-xs text-royal hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {primaryRecords.slice(0, 5).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No {primaryLabel.toLowerCase()} found.</p>
            ) : primaryRecords.slice(0, 5).map((inv, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-navy">{inv.invoiceNumber || inv.billNumber || inv._id?.slice(-6)}</p>
                  <p className="text-xs text-slate-500">{new Date(inv.invoiceDate || inv.billDate || inv.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{fmt(inv.totalAmount)}</p>
                  <Badge variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'destructive' : 'warning'} className="text-[10px]">
                    {inv.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4" /> Recent Payments</CardTitle>
            <Link to="/contact/payments" className="text-xs text-royal hover:underline">View all</Link>
          </CardHeader>
          <CardContent className="p-0">
            {data.payments.slice(0, 5).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No payment history found.</p>
            ) : data.payments.slice(0, 5).map((pay, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-navy">{pay.paymentNumber || pay.reference || 'Payment'}</p>
                  <p className="text-xs text-slate-500">{new Date(pay.paymentDate || pay.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <p className="text-sm font-semibold text-green-600">{fmt(pay.amount)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
