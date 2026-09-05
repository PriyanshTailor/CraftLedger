import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, Package, TrendingUp, AlertTriangle } from 'lucide-react';
import { getInventoryData } from '../services/inventoryService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock fetch
    getInventoryData().then(data => {
      setProduct(data.products.find(p => p.id.toString() === id) || data.products[0]);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500">Loading...</div>;
  if (!product) return <div className="flex justify-center items-center h-64 text-red-500">Not found</div>;

  const chartData = [
    { name: 'May', sales: 400000, profit: 120000 },
    { name: 'Jun', sales: 300000, profit: 90000 },
    { name: 'Jul', sales: 500000, profit: 160000 },
    { name: 'Aug', sales: 450000, profit: 140000 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/inventory" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Inventory</Link>
          <span>/</span>
          <span className="text-slate-800">{product.name}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0">
              <Package className="w-8 h-8 text-slate-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-navy">{product.name}</h2>
                <Badge variant={product.status === 'In Stock' ? 'success' : 'warning'}>{product.status}</Badge>
              </div>
              <p className="text-slate-500">SKU: {product.sku} • Category: Finished Goods</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit Product</Button>
            <Button>Adjust Stock</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Current Stock</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-bold text-navy">{product.stock}</p>
              <p className="text-sm text-slate-500 mb-0.5">units</p>
            </div>
            {product.stock < 20 && <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Low Stock Warning</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Selling Price</p>
            <p className="text-2xl font-bold text-navy mt-1">{product.price}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Purchase Cost</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">₹8,400</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-green-800 uppercase">Profit Margin</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-2xl font-bold text-green-700">43%</p>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Product Profitability Trend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} formatter={(val) => `₹${val.toLocaleString()}`} />
                <Bar dataKey="sales" fill="#93C5FD" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="profit" fill="#2563EB" radius={[4, 4, 0, 0]} name="Profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
