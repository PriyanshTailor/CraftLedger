import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, FileText, Download, CheckCircle2, MoreVertical } from 'lucide-react';
import { getSalesOrders } from '../services/orderService';

export function SalesDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we'd fetch order by id. For mock, fetch all and find.
    getSalesOrders().then(data => {
      setOrder(data.find(o => o.id === id) || data[0]);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading order...</div>;
  if (!order) return <div className="flex justify-center items-center h-64 text-red-500">Order not found</div>;

  const getStatusBadge = (status) => {
    const map = { Invoiced: 'success', Confirmed: 'primary', Cancelled: 'destructive' };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  const getPaymentBadge = (status) => {
    const map = { Paid: 'success', Pending: 'warning', Unpaid: 'destructive' };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Detail Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/sales" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Sales Orders</Link>
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
            <p className="text-slate-500">Order date: {order.date} • Customer: <Link to={`/customers/${order.customer}`} className="text-royal hover:underline font-medium">{order.customer}</Link></p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
            <Button variant="outline"><FileText className="w-4 h-4 mr-2" /> Invoice</Button>
            <Button><CheckCircle2 className="w-4 h-4 mr-2" /> Mark Complete</Button>
            <Button variant="outline" className="px-2"><MoreVertical className="w-4 h-4 text-slate-500" /></Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Lines</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-medium">Product</th>
                    <th className="px-6 py-4 font-medium text-right">Qty</th>
                    <th className="px-6 py-4 font-medium text-right">Unit Price</th>
                    <th className="px-6 py-4 font-medium text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-navy">Office Chair - Ergonomic Pro</td>
                    <td className="px-6 py-4 text-right">10</td>
                    <td className="px-6 py-4 text-right">₹14,900</td>
                    <td className="px-6 py-4 text-right font-medium">₹1,49,000</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-navy">Wooden Study Table</td>
                    <td className="px-6 py-4 text-right">5</td>
                    <td className="px-6 py-4 text-right">₹15,800</td>
                    <td className="px-6 py-4 text-right font-medium">₹79,000</td>
                  </tr>
                </tbody>
              </table>
              <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
                <div className="w-64 space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹2,28,000</span></div>
                  <div className="flex justify-between text-slate-600"><span>Tax (18% GST)</span><span>₹41,040</span></div>
                  <div className="flex justify-between text-navy font-bold text-lg pt-3 border-t border-slate-200"><span>Total</span><span>₹2,69,040</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Company</p>
                <p className="text-sm font-medium text-navy">{order.customer}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase mb-1">Contact</p>
                <p className="text-sm text-slate-700">info@{order.customer.toLowerCase().replace(' ', '')}.com</p>
              </div>
              <Button asChild variant="outline" className="w-full text-xs"><Link to={`/customers/${order.customer}`}>View Customer Profile</Link></Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-green-500 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-navy text-xs">Payment Received</div>
                      <time className="text-[10px] text-slate-400 font-medium">Today</time>
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-royal text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2"></div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.25rem)] p-3 rounded-lg border border-slate-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-navy text-xs">Order Confirmed</div>
                      <time className="text-[10px] text-slate-400 font-medium">Yesterday</time>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
