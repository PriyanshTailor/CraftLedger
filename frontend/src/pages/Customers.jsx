import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Search, Filter, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

const customers = [
  { id: 'CUST-001', name: 'Acme Corp', contact: 'john@acmecorp.com', orders: 12, total: '₹4,50,000', lastPurchase: '2026-08-20', status: 'Active' },
  { id: 'CUST-002', name: 'Globex Inc', contact: 'info@globex.com', orders: 8, total: '₹2,10,000', lastPurchase: '2026-08-15', status: 'Active' },
  { id: 'CUST-003', name: 'Initech', contact: 'billing@initech.com', orders: 24, total: '₹12,40,000', lastPurchase: '2026-09-01', status: 'Active' },
  { id: 'CUST-004', name: 'Stark Industries', contact: 'procurement@stark.com', orders: 3, total: '₹1,20,000', lastPurchase: '2026-05-10', status: 'Inactive' },
];

export function Customers() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-navy mb-1">Customers</h2>
          <p className="text-slate-500">Customer intelligence and purchase history.</p>
        </div>
        <Button>Add Customer</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Customers</p>
            <p className="text-2xl font-bold text-navy mt-1">124</p>
            <p className="text-xs text-green-600 font-medium mt-1">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Active</p>
            <p className="text-2xl font-bold text-navy mt-1">89</p>
            <p className="text-xs text-slate-400 mt-1">Purchased in last 90 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">Outstanding</p>
            <p className="text-2xl font-bold text-red-600 mt-1">₹5.7L</p>
            <p className="text-xs text-slate-400 mt-1">From 14 customers</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-800 uppercase">Top Client</p>
                <p className="text-lg font-bold text-royal mt-1">Initech</p>
                <p className="text-xs text-blue-600 mt-1">₹12.4L Total Revenue</p>
              </div>
              <TrendingUp className="w-5 h-5 text-royal" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <input type="text" placeholder="Search customers..." className="w-full h-9 pl-9 pr-4 rounded-md border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-royal" />
            </div>
            <Button variant="outline" size="sm"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium text-right">Orders</th>
                <th className="px-6 py-4 font-medium text-right">Total Revenue</th>
                <th className="px-6 py-4 font-medium">Last Purchase</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/50 cursor-pointer">
                  <td className="px-6 py-4 font-medium text-royal hover:underline">
                    <Link to={`/customers/${c.name}`}>{c.name}</Link>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{c.contact}</td>
                  <td className="px-6 py-4 text-right text-slate-700">{c.orders}</td>
                  <td className="px-6 py-4 text-right font-medium text-navy">{c.total}</td>
                  <td className="px-6 py-4 text-slate-500">{c.lastPurchase}</td>
                  <td className="px-6 py-4">
                    <Badge variant={c.status === 'Active' ? 'success' : 'secondary'}>{c.status}</Badge>
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
