import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, FileText, Download, CheckCircle2, MoreVertical, PackageCheck } from 'lucide-react';
import { getPurchaseOrders } from '../services/orderService';

export function PurchaseDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    getPurchaseOrders().then(data => {
      setOrder(data.find(o => o.id === id) || data[0]);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading...</div>;
  if (!order) return <div className="flex justify-center items-center h-64 text-red-500">Not found</div>;

  const getStatusBadge = (status) => {
    const map = { Received: 'success', Confirmed: 'primary', Draft: 'outline' };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  const getPaymentBadge = (status) => {
    const map = { Paid: 'success', Pending: 'warning', Unpaid: 'destructive' };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/purchases" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Purchase Orders</Link>
          <span>/</span>
          <span className="text-slate-800">{order.id}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-navy">{order.id}</h2>
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.paymentStatus)}
            </div>
            <p className="text-slate-500">Order date: {order.date} • Vendor: <Link to={`/vendors/${order.vendor}`} className="text-royal hover:underline font-medium">{order.vendor}</Link></p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Vendor Bill</Button>
            <Button><PackageCheck className="w-4 h-4 mr-2" /> Mark Received</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Order Lines</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product / Material</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-navy">Premium Teak Wood (Cubic Ft)</td>
                    <td className="px-6 py-4 text-right">50</td>
                    <td className="px-6 py-4 text-right">₹3,500</td>
                    <td className="px-6 py-4 text-right font-medium">₹1,75,000</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹1,75,000</span></div>
                  <div className="flex justify-between text-navy font-bold text-lg pt-3 border-t border-slate-200"><span>Total</span><span>{order.total}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Vendor Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Supplier</p>
                <p className="text-sm font-medium text-navy">{order.vendor}</p>
              </div>
              <Button asChild variant="outline" className="w-full text-xs"><Link to={`/vendors/${order.vendor}`}>View Vendor Profile</Link></Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
