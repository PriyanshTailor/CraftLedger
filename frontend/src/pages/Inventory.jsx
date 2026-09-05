import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { FormField, Input, Select, Textarea } from '../components/ui/FormField';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { getInventoryData } from '../services/inventoryService';
import { cn } from '../lib/utils';

function AddProductModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Product" size="md">
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Product Name" required className="md:col-span-2">
            <Input placeholder="e.g. Executive Office Chair" />
          </FormField>
          <FormField label="Category" required>
            <Select>
              <option value="">Select category</option>
              <option>Seating</option>
              <option>Tables</option>
              <option>Sofas</option>
              <option>Dining</option>
              <option>Storage</option>
              <option>Workstations</option>
            </Select>
          </FormField>
          <FormField label="SKU / Product Code">
            <Input placeholder="e.g. CHAIR-ERG-001" />
          </FormField>
          <FormField label="Purchase Cost (₹)" required>
            <Input type="number" min="0" placeholder="0" />
          </FormField>
          <FormField label="Selling Price (₹)" required>
            <Input type="number" min="0" placeholder="0" />
          </FormField>
          <FormField label="Opening Stock Quantity" required>
            <Input type="number" min="0" placeholder="0" />
          </FormField>
          <FormField label="Low Stock Alert (qty)">
            <Input type="number" min="0" placeholder="5" />
          </FormField>
          <FormField label="Unit of Measure">
            <Select>
              <option>Units</option>
              <option>Pieces</option>
              <option>Sets</option>
              <option>Meters</option>
            </Select>
          </FormField>
          <FormField label="Valuation Method">
            <Select>
              <option>FIFO (First In, First Out)</option>
              <option>AVCO (Average Cost)</option>
            </Select>
          </FormField>
        </div>

        <FormField label="Description">
          <Textarea placeholder="Product description, material details, dimensions..." />
        </FormField>

        {/* Margin preview */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
          <p className="text-xs font-semibold text-royal uppercase tracking-wide mb-2">Margin Preview</p>
          <p className="text-sm text-slate-600">Enter purchase cost and selling price above to see the gross margin.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onClose}>Add Product</Button>
        </div>
      </div>
    </Modal>
  );
}

export function Inventory() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getInventoryData().then(res => { setData(res); setLoading(false); });
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading inventory...</div>;

  return (
    <div className="space-y-6">
      <AddProductModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Inventory Intelligence</h2>
          <p className="text-slate-500">Monitor stock levels, valuation, and movement.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-5 text-center"><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Total Value</div><div className="text-xl font-bold text-navy">{data.summary.totalValue}</div></CardContent></Card>
        <Card><CardContent className="p-5 text-center"><div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Products</div><div className="text-xl font-bold text-navy">{data.summary.totalProducts}</div></CardContent></Card>
        <Card className="border-red-200 bg-red-50/30"><CardContent className="p-5 text-center"><div className="text-xs font-medium text-red-700 uppercase tracking-wider mb-2">Low Stock</div><div className="text-xl font-bold text-red-600">{data.summary.lowStock}</div></CardContent></Card>
        <Card className="border-amber-200 bg-amber-50/30"><CardContent className="p-5 text-center"><div className="text-xs font-medium text-amber-700 uppercase tracking-wider mb-2">Slow Moving</div><div className="text-xl font-bold text-amber-600">{data.summary.slowMoving}</div></CardContent></Card>
        <Card className="border-blue-200 bg-blue-50/30"><CardContent className="p-5 text-center"><div className="text-xs font-medium text-blue-700 uppercase tracking-wider mb-2">Overstocked</div><div className="text-xl font-bold text-blue-600">{data.summary.overstocked}</div></CardContent></Card>
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
              {data.products.map(product => (
                <tr 
                  key={product.id} 
                  className={cn("hover:bg-slate-50/50 cursor-pointer transition-colors", product.lowStock && "bg-red-50/20", product.overstocked && "bg-blue-50/20")}
                  onClick={() => window.location.href = `/inventory/products/${product.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-navy">{product.name}</span>
                      {product.lowStock && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-red-700 bg-red-100 px-1.5 py-0.5 rounded"><AlertTriangle className="w-2.5 h-2.5" /> LOW</span>}
                      {product.overstocked && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">OVER</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{product.category}</td>
                  <td className="px-6 py-4 text-slate-600">{product.cost}</td>
                  <td className="px-6 py-4 text-slate-700 font-medium">{product.sellingPrice}</td>
                  <td className="px-6 py-4"><span className={cn("font-semibold", product.stock <= 5 ? "text-red-600" : product.stock >= 50 ? "text-blue-600" : "text-slate-700")}>{product.stock} units</span></td>
                  <td className="px-6 py-4 text-slate-600">{product.stockValue}</td>
                  <td className="px-6 py-4 text-right"><Badge variant={product.margin >= 35 ? 'success' : product.margin >= 20 ? 'warning' : 'outline'}>{product.margin}%</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
