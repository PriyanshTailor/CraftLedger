import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import {
  ChevronLeft, Package, Sparkles, CheckCircle2, AlertTriangle,
  Loader2, DollarSign, Layers, ShieldCheck, ArrowRight
} from 'lucide-react';
import { masterDataService } from '../services/masterDataService';
import { cn } from '../lib/utils';

export function AddProduct() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    sku: '',
    costPrice: '',
    sellingPrice: '',
    quantityOnHand: '0',
    reorderLevel: '5',
    unit: 'units',
    description: '',
    taxRate: '18'
  });

  useEffect(() => {
    let isMounted = true;
    masterDataService.getCategories()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res?.data) ? res.data : (res?.data?.docs || []);
        setCategories(list);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        if (isMounted) setCategories([]);
      });
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerateSku = () => {
    const prefix = formData.name
      ? formData.name.replace(/[^a-zA-Z]/g, '').slice(0, 4).toUpperCase() || 'ITEM'
      : 'ITEM';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${prefix}-${rand}` }));
  };

  const cost = parseFloat(formData.costPrice) || 0;
  const price = parseFloat(formData.sellingPrice) || 0;
  const qty = parseInt(formData.quantityOnHand, 10) || 0;
  const profitPerUnit = price - cost;
  const margin = price > 0 ? ((profitPerUnit / price) * 100) : 0;
  const totalStockValue = cost * qty;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU / Code is required');
      return;
    }
    if (price < 0 || cost < 0) {
      setError('Prices cannot be negative');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim().toUpperCase(),
        costPrice: cost,
        sellingPrice: price,
        quantityOnHand: qty,
        reorderLevel: parseInt(formData.reorderLevel, 10) || 0,
        unit: formData.unit || 'units',
        taxRate: parseFloat(formData.taxRate) || 0,
        description: formData.description?.trim() || undefined
      };

      if (formData.categoryId && formData.categoryId.trim() !== '') {
        payload.categoryId = formData.categoryId;
      }

      await masterDataService.createProduct(payload);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/inventory');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create product. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(n || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Breadcrumbs & Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link
            to="/dashboard/inventory"
            className="hover:text-royal flex items-center gap-1 font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Inventory Intelligence
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">Add New Product</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy flex items-center gap-2">
              <Package className="w-7 h-7 text-royal" /> Add New Inventory Product
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Register stock items with unit pricing, classification, and margin tracking.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/inventory')}
            >
              Cancel
            </Button>
            <Button
              form="add-product-form"
              type="submit"
              disabled={loading || success}
              className="bg-royal hover:bg-royal/90 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Product'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Success banner */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-3 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-sm font-medium">
            Product successfully created! Redirecting to Inventory Intelligence...
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      <form id="add-product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Core Product Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800">
                Product Details
              </CardTitle>
              <CardDescription>
                Essential identifiers and categorization for warehouse tracking.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <FormField label="Product Name" required>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Ergonomic Executive Mesh Chair"
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Category">
                  <Select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Category (Optional) --</option>
                    {(Array.isArray(categories) ? categories : []).map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="SKU / Item Code" required>
                  <div className="flex gap-2">
                    <Input
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="e.g. CHR-7482"
                      className="font-mono text-sm uppercase"
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSku}
                      title="Generate random SKU"
                      className="shrink-0 text-xs px-2.5 text-slate-600 hover:text-royal"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1" /> Gen
                    </Button>
                  </div>
                </FormField>
              </div>

              <FormField label="Description">
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Material specs, manufacturer details, dimensions, warranties..."
                  rows={3}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800">
                Stock & Inventory Levels
              </CardTitle>
              <CardDescription>
                Initial on-hand quantity and low-stock replenishment thresholds.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField label="Opening Stock (Qty)" required>
                  <Input
                    name="quantityOnHand"
                    type="number"
                    min="0"
                    value={formData.quantityOnHand}
                    onChange={handleChange}
                    required
                  />
                </FormField>

                <FormField label="Unit of Measure">
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                  >
                    <option value="units">Units</option>
                    <option value="pcs">Pieces (Pcs)</option>
                    <option value="kg">Kilograms (Kg)</option>
                    <option value="box">Boxes</option>
                    <option value="meters">Meters</option>
                    <option value="liters">Liters</option>
                    <option value="sets">Sets</option>
                  </Select>
                </FormField>

                <FormField label="Low-Stock Alert Level" hint="Triggers warning flag">
                  <Input
                    name="reorderLevel"
                    type="number"
                    min="0"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                  />
                </FormField>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Financials & Margin Analytics */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-semibold text-slate-800">
                Pricing & Economics
              </CardTitle>
              <CardDescription>
                Define cost and selling price to evaluate profitability.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <FormField label="Purchase / Cost Price (₹)" required>
                <div className="relative">
                  <Input
                    name="costPrice"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.costPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </FormField>

              <FormField label="Selling Price (₹)" required>
                <div className="relative">
                  <Input
                    name="sellingPrice"
                    type="number"
                    min="0"
                    step="any"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
              </FormField>

              <FormField label="Applicable GST / Tax Rate (%)">
                <Select
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleChange}
                >
                  <option value="0">0% (Exempted / Nil)</option>
                  <option value="5">5% GST</option>
                  <option value="12">12% GST</option>
                  <option value="18">18% Standard GST</option>
                  <option value="28">28% Luxury GST</option>
                </Select>
              </FormField>
            </CardContent>
          </Card>

          {/* Margin Calculator Preview Card */}
          <Card className="bg-slate-50 border-slate-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Margin Health
                </span>
                <Badge
                  variant={
                    margin > 25
                      ? 'success'
                      : margin > 10
                      ? 'warning'
                      : 'destructive'
                  }
                >
                  {margin >= 0 ? `${margin.toFixed(1)}% Margin` : 'Negative Margin'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Unit Profit:</span>
                <span className={cn('font-semibold', profitPerUnit >= 0 ? 'text-emerald-700' : 'text-red-600')}>
                  {fmt(profitPerUnit)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm py-1 border-b border-slate-200/60">
                <span className="text-slate-600">Initial Stock Value:</span>
                <span className="font-semibold text-slate-800">{fmt(totalStockValue)}</span>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Calculated dynamically from Cost Price and Selling Price before discounts.
              </p>
            </CardContent>
          </Card>

          {/* Actions card */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col gap-2">
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-royal hover:bg-royal/90 text-white font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...
                </>
              ) : (
                'Save Product'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/inventory')}
              className="w-full"
            >
              Cancel
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
