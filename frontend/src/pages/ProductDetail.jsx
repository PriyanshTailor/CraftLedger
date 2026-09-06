import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, Package, TrendingUp, AlertTriangle, Loader2, ArrowDown, ArrowUp } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { cn } from '../lib/utils';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const [prodRes, movRes] = await Promise.all([
          inventoryService.getProduct(id),
          inventoryService.getProductMovements(id)
        ]);
        setProduct(prodRes.data);
        setMovements(movRes.data);
        setError(null);
      } catch (err) {
        setError('Product not found or failed to load');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center items-center h-64 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading...</div>;
  if (error || !product) return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;

  const margin = product.sellingPrice > 0 
    ? ((product.sellingPrice - product.costPrice) / product.sellingPrice * 100) 
    : 0;
    
  const isLow = product.quantityOnHand <= product.reorderLevel;
  const fmt = n => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/dashboard/inventory" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Inventory Intelligence</Link>
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
                <Badge variant={isLow ? 'destructive' : 'success'}>{isLow ? 'Low Stock' : 'In Stock'}</Badge>
              </div>
              <p className="text-slate-500">SKU: {product.sku || 'N/A'} • Category: {product.categoryId?.name || 'Uncategorized'}</p>
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
              <p className="text-2xl font-bold text-navy">{product.quantityOnHand}</p>
              <p className="text-sm text-slate-500 mb-0.5">{product.unitOfMeasure}</p>
            </div>
            {isLow && <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Reorder Level: {product.reorderLevel}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Selling Price</p>
            <p className="text-2xl font-bold text-navy mt-1">{fmt(product.sellingPrice)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Purchase Cost</p>
            <p className="text-2xl font-bold text-slate-700 mt-1">{fmt(product.costPrice)}</p>
          </CardContent>
        </Card>
        <Card className={cn(margin > 20 ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100")}>
          <CardContent className="p-4">
            <p className={cn("text-xs font-semibold uppercase", margin > 20 ? "text-green-800" : "text-red-800")}>Gross Margin</p>
            <div className="flex items-center justify-between mt-1">
              <p className={cn("text-2xl font-bold", margin > 20 ? "text-green-700" : "text-red-700")}>{margin.toFixed(1)}%</p>
              {margin > 20 ? <TrendingUp className="w-5 h-5 text-green-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Stock Movements</CardTitle>
          <CardDescription>History of purchases, sales, and adjustments</CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          {movements.length === 0 ? (
            <div className="p-6 text-center text-slate-500">No stock movements recorded yet.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium text-right">Qty Change</th>
                  <th className="px-6 py-4 font-medium text-right">Balance</th>
                  <th className="px-6 py-4 font-medium">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {movements.map(mov => {
                  const isPositive = mov.movementType === 'purchase' || mov.movementType === 'adjustment_in' || mov.movementType === 'return_in';
                  return (
                  <tr key={mov._id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-slate-600">{new Date(mov.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="uppercase text-[10px]">{mov.movementType.replace('_', ' ')}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("inline-flex items-center font-medium", isPositive ? "text-green-600" : "text-red-600")}>
                        {isPositive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                        {mov.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">{mov.newQuantity}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs truncate max-w-[200px]">{mov.notes || '-'}</td>
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
