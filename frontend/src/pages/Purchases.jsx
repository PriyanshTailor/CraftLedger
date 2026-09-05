import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Search, Filter, Trash2, Loader2 } from 'lucide-react';
import { purchaseService } from '../services/purchaseService';
import { masterDataService } from '../services/masterDataService';

function CreatePurchaseOrderModal({ isOpen, onClose, onRefresh }) {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: ''
  });

  const [items, setItems] = useState([{ id: Date.now(), productId: '', productNameSnapshot: '', qty: 1, unitCost: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      Promise.all([
        masterDataService.getContacts(),
        masterDataService.getProducts()
      ]).then(([cRes, pRes]) => {
        setVendors(cRes.data.filter(c => c.type === 'vendor'));
        setProducts(pRes.data);
        setLoadingData(false);
      }).catch(err => {
        console.error("Failed to load master data", err);
        setLoadingData(false);
      });
    }
  }, [isOpen]);

  const addItem = () =>
    setItems(prev => [...prev, { id: Date.now(), productId: '', productNameSnapshot: '', qty: 1, unitCost: 0 }]);
  const removeItem = (id) => setItems(prev => prev.filter(i => i.id !== id));
  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      if (field === 'productId') {
        const found = products.find(p => p._id === value);
        if (found) {
          updated.unitCost = found.costPrice || 0;
          updated.productNameSnapshot = found.name;
        }
      }
      return updated;
    }));

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;
  const fmt = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const handleSubmit = async (e, confirm = false) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      if (!formData.vendorId) throw new Error("Please select a vendor");
      if (items.length === 0 || !items[0].productId) throw new Error("Please add at least one product");

      const payload = {
        vendorId: formData.vendorId,
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || undefined,
        notes: formData.notes,
        items: items.map(i => ({
          productId: i.productId,
          productNameSnapshot: i.productNameSnapshot,
          quantity: i.qty,
          unitCost: i.unitCost,
          taxRate: 18,
          lineTotal: i.qty * i.unitCost
        })),
        subtotal,
        taxAmount: tax,
        totalAmount: total,
        status: confirm ? 'confirmed' : 'draft'
      };

      await purchaseService.createOrder(payload);
      setSubmitting(false);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create purchase order');
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Purchase Order" size="lg">
      {loadingData ? (
        <div className="flex h-32 items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-royal" /></div>
      ) : (
      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Vendor" required>
            <Select value={formData.vendorId} onChange={e => setFormData({...formData, vendorId: e.target.value})}>
              <option value="">Select vendor</option>
              {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
            </Select>
          </FormField>
          <FormField label="Order Date" required>
            <Input type="date" value={formData.orderDate} onChange={e => setFormData({...formData, orderDate: e.target.value})} />
          </FormField>
          <FormField label="Expected Delivery">
            <Input type="date" value={formData.expectedDeliveryDate} onChange={e => setFormData({...formData, expectedDeliveryDate: e.target.value})} />
          </FormField>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700">Purchase Lines</h3>
            <Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line</Button>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Product / Material</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-20">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase w-28">Unit Cost</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase w-28">Subtotal</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <select
                        value={item.productId}
                        onChange={e => updateItem(item.id, 'productId', e.target.value)}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal bg-white"
                      >
                        <option value="">Select material</option>
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="1" value={item.qty}
                        onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" value={item.unitCost}
                        onChange={e => updateItem(item.id, 'unitCost', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(item.qty * item.unitCost)}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
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
            <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Delivery instructions or special notes..." />
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
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="outline" disabled={submitting}>Save as Draft</Button>
          <Button type="button" onClick={(e) => handleSubmit(e, true)} disabled={submitting}>
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null} Confirm PO
          </Button>
        </div>
      </form>
      )}
    </Modal>
  );
}

export function Purchases() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await purchaseService.getOrders();
      setOrders(res.data);
      setError(null);
    } catch (err) {
      setError("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (s) => <Badge variant={{ received: 'success', confirmed: 'primary', partially_received: 'warning', draft: 'outline', cancelled: 'destructive' }[s] || 'outline'}>{s.toUpperCase()}</Badge>;
  const getPaymentBadge = (s) => <Badge variant={{ paid: 'success', partially_paid: 'warning', unpaid: 'destructive', pending: 'warning' }[s] || 'outline'}>{s ? s.toUpperCase() : 'PENDING'}</Badge>;

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading orders...</div>;
  if (error) return <div className="flex flex-col justify-center items-center h-64 text-red-500"><p>{error}</p><Button onClick={fetchOrders} className="mt-4">Retry</Button></div>;

  return (
    <div className="space-y-6">
      <CreatePurchaseOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onRefresh={fetchOrders} />

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
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No purchase orders found. Create one to get started.</div>
          ) : (
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
                    key={order._id} 
                    className="hover:bg-slate-50/50 cursor-pointer"
                    onClick={() => window.location.href = `/dashboard/purchases/orders/${order._id}`}
                  >
                    <td className="px-6 py-4 font-semibold text-navy">{order.purchaseOrderNumber}</td>
                    <td className="px-6 py-4 text-slate-700">{order.vendorId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium">₹{order.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                    <td className="px-6 py-4">{getPaymentBadge(order.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
