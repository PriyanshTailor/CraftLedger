import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { getSalesOrders } from '../services/orderService';

const PRODUCTS = [
  { id: 1, name: 'Office Chair - Ergonomic Pro', price: 14900 },
  { id: 2, name: 'Wooden Study Table', price: 15800 },
  { id: 3, name: 'L-Shaped Executive Desk', price: 32000 },
  { id: 4, name: '3-Seater Sofa (Fabric)', price: 31000 },
  { id: 5, name: 'Dining Table (6-Seater)', price: 24500 },
];

function CreateSalesOrderModal({ isOpen, onClose }) {
  const [items, setItems] = useState([{ id: 1, product: '', qty: 1, price: 0, discount: 0 }]);

  const addItem = () =>
    setItems(prev => [...prev, { id: Date.now(), product: '', qty: 1, price: 0, discount: 0 }]);

  const removeItem = (id) =>
    setItems(prev => prev.filter(i => i.id !== id));

  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      if (field === 'product') {
        const found = PRODUCTS.find(p => p.name === value);
        if (found) updated.price = found.price;
      }
      return updated;
    }));

  const subtotal = items.reduce((sum, i) => {
    const line = i.qty * i.price * (1 - i.discount / 100);
    return sum + line;
  }, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  const fmt = (n) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Sales Order" size="lg">
      <div className="space-y-6">
        {/* Customer & Meta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Customer" required>
            <Select>
              <option value="">Select customer</option>
              <option>Acme Corp</option>
              <option>Globex Inc</option>
              <option>Initech</option>
              <option>Stark Industries</option>
            </Select>
          </FormField>
          <FormField label="Order Date" required>
            <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </FormField>
          <FormField label="Delivery Date">
            <Input type="date" />
          </FormField>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Order Lines</h3>
            <Button variant="outline" size="sm" onClick={addItem}>
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line
            </Button>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-20">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-28">Unit Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-20">Disc %</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-28">Subtotal</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => {
                  const lineTotal = item.qty * item.price * (1 - item.discount / 100);
                  return (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <select
                          value={item.product}
                          onChange={e => updateItem(item.id, 'product', e.target.value)}
                          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal bg-white"
                        >
                          <option value="">Select product</option>
                          {PRODUCTS.map(p => <option key={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number" min="1"
                          value={item.qty}
                          onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number" min="0"
                          value={item.price}
                          onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number" min="0" max="100"
                          value={item.discount}
                          onChange={e => updateItem(item.id, 'discount', Number(e.target.value))}
                          className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700">
                        {fmt(lineTotal)}
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Notes">
            <Textarea placeholder="Add any internal notes or customer instructions..." />
          </FormField>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 py-1.5 border-b border-slate-100">
              <span>Subtotal</span>
              <span className="font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 py-1.5 border-b border-slate-100">
              <span>GST (18%)</span>
              <span className="font-medium">{fmt(tax)}</span>
            </div>
            <div className="flex justify-between text-navy py-2 font-bold text-base">
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button onClick={onClose}>Confirm Order</Button>
        </div>
      </div>
    </Modal>
  );
}

export function Sales() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getSalesOrders().then(data => { setOrders(data); setLoading(false); });
  }, []);

  const getStatusBadge = (status) => {
    const map = { Invoiced: 'success', Confirmed: 'primary', Cancelled: 'destructive' };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };
  const getPaymentBadge = (status) => {
    const map = { Paid: 'success', Pending: 'warning', Unpaid: 'destructive' };
    return <Badge variant={map[status] || 'outline'}>{status}</Badge>;
  };

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <CreateSalesOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Sales Orders</h2>
          <p className="text-slate-500">Manage customer orders and invoices.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create Order</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search orders..." className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
            </div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Order #</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Total</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => (
                <tr 
                  key={order.id} 
                  className="hover:bg-slate-50/50 cursor-pointer"
                  onClick={() => window.location.href = `/sales/orders/${order.id}`}
                >
                  <td className="px-6 py-4 font-semibold text-navy">{order.id}</td>
                  <td className="px-6 py-4 text-slate-700">{order.customer}</td>
                  <td className="px-6 py-4 text-slate-500">{order.date}</td>
                  <td className="px-6 py-4 font-medium">{order.total}</td>
                  <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  <td className="px-6 py-4">{getPaymentBadge(order.paymentStatus)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
