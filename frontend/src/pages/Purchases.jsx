import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Search, Filter, Trash2 } from 'lucide-react';
import { getPurchaseOrders } from '../services/orderService';

const PRODUCTS = [
  { id: 1, name: 'Raw Wood (per unit)', price: 3500 },
  { id: 2, name: 'Steel Frame Set', price: 2800 },
  { id: 3, name: 'Foam Padding (per roll)', price: 1200 },
  { id: 4, name: 'Fabric Upholstery (per meter)', price: 450 },
  { id: 5, name: 'Hardware Kit (bolts, screws)', price: 850 },
];

function CreatePurchaseOrderModal({ isOpen, onClose }) {
  const [items, setItems] = useState([{ id: 1, product: '', qty: 1, price: 0 }]);

  const addItem = () =>
    setItems(prev => [...prev, { id: Date.now(), product: '', qty: 1, price: 0 }]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
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

  const subtotal = items.reduce((s, i) => s + i.qty * i.price, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const fmt = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Order" size="lg">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Vendor" required>
            <Select>
              <option value="">Select vendor</option>
              <option>Premium Woods Ltd</option>
              <option>MetalWorks India</option>
              <option>Fabric Co</option>
              <option>Hardware Supplies Ltd</option>
            </Select>
          </FormField>
          <FormField label="Order Date" required>
            <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          </FormField>
          <FormField label="Expected Delivery">
            <Input type="date" />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Purchase Lines</h3>
            <Button variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line</Button>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product / Material</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-20">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-28">Unit Price</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-28">Subtotal</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <select
                        value={item.product}
                        onChange={e => updateItem(item.id, 'product', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal bg-white"
                      >
                        <option value="">Select material</option>
                        {PRODUCTS.map(p => <option key={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="1" value={item.qty}
                        onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={item.price}
                        onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(item.qty * item.price)}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Notes">
            <Textarea placeholder="Delivery instructions or special notes..." />
          </FormField>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-600 py-1.5 border-b border-slate-100">
              <span>Subtotal</span><span className="font-medium">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 py-1.5 border-b border-slate-100">
              <span>GST (18%)</span><span className="font-medium">{fmt(tax)}</span>
            </div>
            <div className="flex justify-between text-navy py-2 font-bold text-base">
              <span>Total</span><span>{fmt(total)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="outline">Save as Draft</Button>
          <Button onClick={onClose}>Confirm PO</Button>
        </div>
      </div>
    </Modal>
  );
}

export function Purchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getPurchaseOrders().then(data => { setOrders(data); setLoading(false); });
  }, []);

  const getStatusBadge = s => <Badge variant={{ Received: 'success', Confirmed: 'primary' }[s] || 'outline'}>{s}</Badge>;
  const getPaymentBadge = s => <Badge variant={{ Paid: 'success', Pending: 'warning', Unpaid: 'destructive' }[s] || 'outline'}>{s}</Badge>;

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading orders...</div>;

  return (
    <div className="space-y-6">
      <CreatePurchaseOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Purchase Orders</h2>
          <p className="text-slate-500">Manage vendor orders and bills.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Create PO</Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search vendors or POs..." className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
            </div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">PO #</th>
                <th className="px-6 py-4 font-medium">Vendor</th>
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
                  onClick={() => window.location.href = `/purchases/orders/${order.id}`}
                >
                  <td className="px-6 py-4 font-semibold text-navy">{order.id}</td>
                  <td className="px-6 py-4 text-slate-700">{order.vendor}</td>
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
