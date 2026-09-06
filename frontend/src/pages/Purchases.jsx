import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Search, Filter, Trash2, Loader2, ShieldAlert, X } from 'lucide-react';
import { purchaseService } from '../services/purchaseService';
import { masterDataService } from '../services/masterDataService';

function CreatePurchaseOrderModal({ isOpen, onClose, onSubmitted }) {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState({
    vendorId: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    notes: ''
  });

  const [items, setItems] = useState([{ id: Date.now(), productId: '', productNameSnapshot: '', qty: 1, unitCost: 0, taxRate: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoadingData(true);
      setError('');
      Promise.all([
        masterDataService.getContacts({ limit: 100 }),
        masterDataService.getProducts({ limit: 100 })
      ]).then(([cRes, pRes]) => {
        const contacts = cRes.data?.docs || [];
        const availableProducts = pRes.data?.docs || [];
        setVendors(contacts.filter(c => ['vendor', 'customer_and_vendor'].includes(c.contactType)));
        setProducts(availableProducts);
        setLoadingData(false);
      }).catch(err => {
        console.error("Failed to load master data", err);
        setError(err.message || 'Unable to load vendors and products. Please try again.');
        setLoadingData(false);
      });
    }
  }, [isOpen]);

  const addItem = () =>
    setItems(prev => [...prev, { id: Date.now(), productId: '', productNameSnapshot: '', qty: 1, unitCost: 0, taxRate: 0 }]);
  const removeItem = (id) => setItems(prev => prev.length === 1 ? prev : prev.filter(i => i.id !== id));
  const updateItem = (id, field, value) =>
    setItems(prev => prev.map(i => {
      if (i.id !== id) return i;
      const updated = { ...i, [field]: value };
      if (field === 'productId') {
        const found = products.find(p => p._id === value);
        if (found) {
          updated.unitCost = found.costPrice || 0;
          updated.productNameSnapshot = found.name;
          updated.taxRate = found.taxRate || 0;
        }
      }
      return updated;
    }));

  const subtotal = items.reduce((s, i) => s + i.qty * i.unitCost, 0);
  const tax = items.reduce((sum, item) => sum + (item.qty * item.unitCost * item.taxRate / 100), 0);
  const total = subtotal + tax;
  const fmt = n => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

  const handleSubmit = async (e, confirm = false) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    
    try {
      if (!formData.vendorId) throw new Error("Please select a vendor");
      if (items.length === 0 || items.some(item => !item.productId || item.qty <= 0)) {
        throw new Error("Add a material and a valid quantity to every purchase line");
      }

      // Demo behavior: validate and acknowledge the form without sending a request or storing a record.
      await new Promise(resolve => window.setTimeout(resolve, 350));
      const vendor = vendors.find(item => item._id === formData.vendorId);
      const previewId = `purchase-preview-${Date.now()}`;
      onSubmitted({
        _id: previewId,
        isLocalPreview: true,
        purchaseOrderNumber: `PO-PREVIEW-${previewId.slice(-5)}`,
        vendorId: { _id: formData.vendorId, name: vendor?.name || 'Vendor' },
        orderDate: formData.orderDate,
        expectedDeliveryDate: formData.expectedDeliveryDate || null,
        items: items.map(item => ({ ...item, quantity: item.qty })),
        totalAmount: total,
        status: confirm ? 'confirmed' : 'draft',
        paymentStatus: 'unpaid'
      });
      setFormData({ vendorId: '', orderDate: new Date().toISOString().split('T')[0], expectedDeliveryDate: '', notes: '' });
      setItems([{ id: Date.now(), productId: '', productNameSnapshot: '', qty: 1, unitCost: 0, taxRate: 0 }]);
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
              {vendors.length === 0 && <option value="" disabled>No active vendors available</option>}
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
                        {products.length === 0 && <option value="" disabled>No active products available</option>}
                        {products.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="1" value={item.qty}
                        onChange={e => updateItem(item.id, 'qty', Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
                    </td>
                    <td className="px-4 py-3">
                      <input type="number" min="0" readOnly value={item.unitCost}
                        className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-sm bg-slate-50 text-slate-500" aria-label="Catalog unit cost" />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">{fmt(item.qty * item.unitCost)}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => removeItem(item.id)} disabled={items.length === 1} aria-label="Remove purchase line" className="text-slate-300 hover:text-red-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40">
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
              <span>GST</span><span className="font-medium">{fmt(tax)}</span>
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  const addOrderPreview = (order) => setOrders(current => [order, ...current]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter !== 'all' && order.status !== statusFilter) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const poMatch = order.purchaseOrderNumber?.toLowerCase().includes(q);
      const vendorMatch = order.vendorId?.name?.toLowerCase().includes(q);
      const statusMatch = order.status?.toLowerCase().includes(q);
      const paymentMatch = order.paymentStatus?.toLowerCase().includes(q);
      const itemMatch = order.items?.some(i =>
        (i.productNameSnapshot || i.productId?.name || '').toLowerCase().includes(q)
      );
      return poMatch || vendorMatch || statusMatch || paymentMatch || itemMatch;
    });
  }, [orders, searchQuery, statusFilter]);

  const getStatusBadge = (s) => <Badge variant={{ received: 'success', confirmed: 'primary', partially_received: 'warning', draft: 'outline', cancelled: 'destructive' }[s] || 'outline'}>{s.toUpperCase()}</Badge>;
  const getPaymentBadge = (s) => <Badge variant={{ paid: 'success', partially_paid: 'warning', unpaid: 'destructive', pending: 'warning' }[s] || 'outline'}>{s ? s.toUpperCase() : 'PENDING'}</Badge>;

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading orders...</div>;
  if (error) return <div className="flex flex-col justify-center items-center h-64 text-red-500"><p>{error}</p><Button onClick={fetchOrders} className="mt-4">Retry</Button></div>;

  return (
    <div className="space-y-6">
      <CreatePurchaseOrderModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSubmitted={addOrderPreview} />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Purchase Orders</h2>
          <p className="text-slate-500 text-sm">Manage vendor orders, bills, and purchase cost intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            className="border-slate-200 text-slate-700 hover:bg-slate-50 font-medium text-xs h-9 shadow-xs"
          >
            <Link to="/dashboard/profit-leaks">
              <ShieldAlert className="w-4 h-4 mr-1.5 text-slate-500" />
              Cost Leak Audit
            </Link>
          </Button>
          <Button onClick={() => setModalOpen(true)} className="bg-royal hover:bg-royal/90 text-white font-medium text-xs h-9 shadow-xs">
            <Plus className="w-4 h-4 mr-1.5" /> Create PO
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Realtime Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search vendor, PO #, item..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal"
              >
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="confirmed">Confirmed</option>
                <option value="partially_received">Partially Received</option>
                <option value="received">Received</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{filteredOrders.length}</strong> of {orders.length} orders
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <p className="font-medium text-slate-700">No purchase orders found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery || statusFilter !== 'all' ? "Try adjusting your search query or status filter." : "Create one to get started."}
              </p>
            </div>
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
                {filteredOrders.map(order => (
                  <tr 
                    key={order._id} 
                    className={order.isLocalPreview ? 'bg-slate-50/50' : 'hover:bg-slate-50/70 cursor-pointer transition-colors'}
                    onClick={() => !order.isLocalPreview && navigate(`/dashboard/purchases/orders/${order._id}`)}
                  >
                    <td className="px-6 py-4 font-semibold text-navy">{order.purchaseOrderNumber}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{order.vendorId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-500">{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">₹{order.totalAmount.toLocaleString()}</td>
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
