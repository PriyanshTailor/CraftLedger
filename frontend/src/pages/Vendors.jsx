import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Search, Filter, TrendingDown, Store } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const vendors = [
  { id: 'VEND-001', name: 'Premium Woods Ltd', contact: 'sales@premiumwoods.com', orders: 42, total: '₹18,50,000', lastPurchase: '2026-09-02', status: 'Active' },
  { id: 'VEND-002', name: 'MetalWorks India', contact: 'orders@metalworks.in', orders: 15, total: '₹4,20,000', lastPurchase: '2026-08-18', status: 'Active' },
  { id: 'VEND-003', name: 'Fabrics & Co', contact: 'supply@fabricsco.com', orders: 8, total: '₹2,90,000', lastPurchase: '2026-07-30', status: 'Active' },
  { id: 'VEND-004', name: 'Global Logistics', contact: 'dispatch@globallogistics.com', orders: 56, total: '₹8,40,000', lastPurchase: '2026-09-05', status: 'Active' },
];

export function Vendors() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Vendors</h2>
          <p className="text-slate-500">Supplier intelligence and purchase history.</p>
        </div>
        <Button>Add Vendor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Vendors</p>
            <p className="text-2xl font-bold text-navy mt-1">38</p>
            <p className="text-xs text-slate-400 mt-1">Active suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Payable</p>
            <p className="text-2xl font-bold text-red-600 mt-1">₹8.2L</p>
            <p className="text-xs text-red-500 font-medium mt-1">₹1.4L overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Avg Payment Time</p>
            <p className="text-2xl font-bold text-navy mt-1">18 Days</p>
            <p className="text-xs text-green-600 font-medium mt-1">-2 days vs last month</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-800 uppercase">Top Supplier</p>
                <p className="text-lg font-bold text-royal mt-1">Premium Woods</p>
                <p className="text-xs text-blue-600 mt-1">₹18.5L Total Value</p>
              </div>
              <Store className="w-5 h-5 text-royal" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search vendors..." className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
            </div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Vendor</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-right">Orders</th>
                <th className="px-6 py-4 font-medium text-right">Total Value</th>
                <th className="px-6 py-4 font-medium">Last Purchase</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vendors.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-royal hover:underline">
                    <Link to={`/vendors/${v.name}`}>{v.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{v.contact}</td>
                  <td className="px-6 py-4 text-right text-slate-700">{v.orders}</td>
                  <td className="px-6 py-4 text-right font-medium text-navy">{v.total}</td>
                  <td className="px-6 py-4 text-slate-500">{v.lastPurchase}</td>
                  <td className="px-6 py-4">
                    <Badge variant={v.status === 'Active' ? 'success' : 'secondary'}>{v.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
