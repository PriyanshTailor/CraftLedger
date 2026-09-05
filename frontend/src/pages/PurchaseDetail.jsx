import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, FileText, Download, CheckCircle2, MoreVertical, PackageCheck, Loader2 } from 'lucide-react';
import { purchaseService } from '../services/purchaseService';

export function PurchaseDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await purchaseService.getOrder(id);
        setOrder(res.data);
        setError(null);
      } catch (err) {
        setError('Purchase Order not found or failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading order...</div>;
  if (error || !order) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;

  const getStatusBadge = (status) => {
    const map = { received: 'success', confirmed: 'primary', partially_received: 'warning', draft: 'outline', cancelled: 'destructive' };
    return <Badge variant={map[status] || 'outline'}>{status.toUpperCase()}</Badge>;
  };
  const getPaymentBadge = (status) => {
    const map = { paid: 'success', partially_paid: 'warning', unpaid: 'destructive', pending: 'warning' };
    return <Badge variant={map[status] || 'outline'}>{status ? status.toUpperCase() : 'PENDING'}</Badge>;
  };

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/purchases" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Purchase Orders</Link>
          <span>/</span>
          <span className="text-slate-800">{order.purchaseOrderNumber}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-navy">{order.purchaseOrderNumber}</h2>
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.paymentStatus)}
            </div>
            <p className="text-slate-500">Order date: {new Date(order.orderDate).toLocaleDateString()} • Vendor: <Link to={`/vendors/${order.vendorId?._id}`} className="text-royal hover:underline font-medium">{order.vendorId?.name}</Link></p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline"><PackageCheck className="w-4 h-4 mr-2" /> Receive Products</Button>
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Generate Bill</Button>
            <Button variant="outline" className="px-2"><MoreVertical className="w-4 h-4 text-slate-500" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Lines</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product / Material</th>
                    <th className="px-6 py-4 font-medium text-right">Ordered</th>
                    <th className="px-6 py-4 font-medium text-right">Received</th>
                    <th className="px-6 py-4 font-medium text-right">Unit Cost</th>
                    <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map(item => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-medium text-navy">{item.productNameSnapshot}</td>
                      <td className="px-6 py-4 text-right">{item.quantity}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={item.receivedQuantity === item.quantity ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                          {item.receivedQuantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">{fmt(item.unitCost)}</td>
                      <td className="px-6 py-4 text-right font-medium">{fmt(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{fmt(order.subtotal)}</span></div>
                  <div className="flex justify-between text-slate-600"><span>Tax (18% GST)</span><span>{fmt(order.taxAmount)}</span></div>
                  <div className="flex justify-between text-navy font-bold text-lg pt-3 border-t border-slate-200"><span>Total</span><span>{fmt(order.totalAmount)}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <p className="text-slate-500 mb-1">Company</p>
                <p className="font-medium text-navy">{order.vendorId?.name}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Contact</p>
                <p className="text-slate-700">{order.vendorId?.email || 'N/A'}</p>
                <p className="text-slate-700">{order.vendorId?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-slate-500 mb-1">Address</p>
                <p className="text-slate-700">{order.vendorId?.address?.street || 'N/A'}<br/>{order.vendorId?.address?.city || ''}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Bills & Payments</CardTitle></CardHeader>
            <CardContent className="text-sm space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-royal" />
                  <div>
                    <p className="font-medium text-navy">BILL-{order.purchaseOrderNumber}</p>
                    <p className="text-xs text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="px-2"><Download className="w-4 h-4 text-slate-500" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
