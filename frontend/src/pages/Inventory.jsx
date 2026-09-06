import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { masterDataService } from '../services/masterDataService';
import { cn } from '../lib/utils';

function AddProductModal({ isOpen, onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    costPrice: 0,
    sellingPrice: 0,
    quantityOnHand: 0,
    reorderLevel: 5,
    unitOfMeasure: 'units',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      masterDataService.getCategories()
        .then(res => {
          const list = Array.isArray(res?.data) ? res.data : (res?.data?.docs || []);
          setCategories(list);
        })
        .catch(err => {
          console.error('Failed to load categories:', err);
          setCategories([]);
        });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['costPrice', 'sellingPrice', 'quantityOnHand', 'reorderLevel'].includes(name) ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        costPrice: Number(formData.costPrice) || 0,
        sellingPrice: Number(formData.sellingPrice) || 0,
        quantityOnHand: Number(formData.quantityOnHand) || 0,
        reorderLevel: Number(formData.reorderLevel) || 0,
        unit: formData.unitOfMeasure || 'units',
        description: formData.description?.trim() || undefined
      };
      if (formData.categoryId && formData.categoryId.trim() !== '') {
        payload.categoryId = formData.categoryId;
      }
      await masterDataService.createProduct(payload);
      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const margin = formData.sellingPrice > 0 
    ? ((formData.sellingPrice - formData.costPrice) / formData.sellingPrice * 100).toFixed(1) 
    : 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Name" required className="md:col-span-2">
            <Input name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Executive Office Chair" />
          </FormField>
          <FormField label="Category">
            <Select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              <option value="">Select category (optional)</option>
              {(Array.isArray(categories) ? categories : []).map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </Select>
          </FormField>
          <FormField label="SKU / Product Code" required>
            <Input name="sku" value={formData.sku} onChange={handleChange} required placeholder="e.g. CHAIR-ERG-001" className="uppercase font-mono text-sm" />
          </FormField>
          <FormField label="Purchase Cost (₹)" required>
            <Input name="costPrice" type="number" min="0" value={formData.costPrice} onChange={handleChange} required />
          </FormField>
          <FormField label="Selling Price (₹)" required>
            <Input name="sellingPrice" type="number" min="0" value={formData.sellingPrice} onChange={handleChange} required />
          </FormField>
          <FormField label="Opening Stock Quantity" required>
            <Input name="quantityOnHand" type="number" min="0" value={formData.quantityOnHand} onChange={handleChange} required />
          </FormField>
          <FormField label="Low Stock Alert (qty)">
            <Input name="reorderLevel" type="number" min="0" value={formData.reorderLevel} onChange={handleChange} />
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="Product description, material details, dimensions..." />
        </FormField>

        {/* Margin preview */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Gross Margin Preview</p>
            <p className="text-sm text-slate-600 mt-0.5">Calculated margin on sales</p>
          </div>
          <span className={cn('text-sm font-bold px-2.5 py-1 rounded-full', margin < 15 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800')}>
            {margin}%
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Link
            to="/dashboard/inventory/new"
            onClick={onClose}
            className="text-xs text-royal hover:underline font-medium"
          >
            Open full-page form ↗
          </Link>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null} Add Product</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function Inventory() {
  const [data, setData] = useState({ overview: null, products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [overviewRes, productsRes] = await Promise.all([
        inventoryService.getOverview(),
        inventoryService.getProducts()
      ]);
      setData({ overview: overviewRes.data, products: productsRes.data });
      setError(null);
    } catch (err) {
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading inventory...</div>;
  if (error) return <div className="flex flex-col justify-center items-center h-64 text-red-500"><p>{error}</p><Button onClick={fetchInventory} className="mt-4">Retry</Button></div>;

  return (
    <div className="space-y-6">
      <AddProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onRefresh={fetchInventory} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Inventory Intelligence</h2>
          <p className="text-slate-500">Monitor stock levels, valuation, and movement.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="border-amber-200 text-amber-800 hover:bg-amber-50 shadow-xs">
            <Link to="/dashboard/inventory/slow-moving">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-600" />
              Slow-Moving Prediction
            </Link>
          </Button>
          <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-5 text-center"><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Total Value</div><div className="text-xl font-bold text-navy">{fmt(data.overview.totalValue)}</div></CardContent></Card>
        <Card><CardContent className="p-5 text-center"><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Products</div><div className="text-xl font-bold text-navy">{data.overview.totalProducts}</div></CardContent></Card>
        <Card className="border-red-200 bg-red-50/30"><CardContent className="p-5 text-center"><div className="text-xs font-medium text-red-700 uppercase tracking-wider mb-2">Low Stock</div><div className="text-xl font-bold text-red-600">{data.overview.lowStockCount}</div></CardContent></Card>
        <Card className="border-green-200 bg-green-50/30"><CardContent className="p-5 text-center"><div className="text-xs font-medium text-green-700 uppercase tracking-wider mb-2">Total Quantity</div><div className="text-xl font-bold text-green-600">{data.overview.totalQuantity}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
          <div><CardTitle>Products</CardTitle><CardDescription>Stock levels, valuations and margin.</CardDescription></div>
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search products..." className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {data.products.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No products found. Add one to start tracking inventory.</div>
          ) : (
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Cost</th>
                <th className="px-6 py-4 font-medium">Selling Price</th>
                <th className="px-6 py-4 font-medium">In Stock</th>
                <th className="px-6 py-4 font-medium">Stock Value</th>
                <th className="px-6 py-4 font-medium text-right">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.products.map(product => {
                const isLow = product.quantityOnHand <= product.reorderLevel;
                const margin = product.sellingPrice > 0 ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100) : 0;
                
                return (
                <tr 
                  key={product._id} 
                  className={cn("hover:bg-slate-50/50 cursor-pointer transition-colors", isLow && "bg-red-50/20")}
                  onClick={() => window.location.href = `/dashboard/inventory/products/${product._id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy">{product.name}</span>
                      {isLow && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5" /> LOW</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{product.categoryId?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4 text-slate-600">{fmt(product.costPrice)}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{fmt(product.sellingPrice)}</td>
                  <td className="px-6 py-4"><span className={cn("font-semibold", isLow ? "text-red-600" : "text-slate-700")}>{product.quantityOnHand} units</span></td>
                  <td className="px-6 py-4 text-slate-600">{fmt(product.quantityOnHand * product.costPrice)}</td>
                  <td className="px-6 py-4 text-right">
                    <Badge variant={margin > 30 ? 'success' : (margin > 15 ? 'warning' : 'destructive')}>
                      {margin.toFixed(0)}%
                    </Badge>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
