import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, Mail, Phone, MapPin, TrendingUp, AlertTriangle } from 'lucide-react';

export function CustomerDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/customers" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Customers</Link>
          <span>/</span>
          <span className="text-slate-800">{id}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-navy to-royal flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">{id?.substring(0,2).toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-navy">{id}</h2>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-slate-500 text-sm">Customer since Jan 2024</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Email</Button>
            <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
            <Button>New Order</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Contact Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">billing@{id?.toLowerCase().replace(' ', '')}.com</p>
                  <p className="text-xs text-slate-500">Primary Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">+91 98765 43210</p>
                  <p className="text-xs text-slate-500">Office Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">123 Business Park, Tech City<br/>Mumbai, MH 400001</p>
                  <p className="text-xs text-slate-500">Billing Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 shadow-md ring-1 ring-blue-50">
            <CardHeader className="bg-blue-50/50 pb-4 border-b border-blue-100">
              <CardTitle className="text-blue-800 text-sm">Customer Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-3">
                <TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">High-Value Customer</p>
                  <p className="text-xs text-slate-600">Top 10% of customers by lifetime revenue.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Delayed Payments</p>
                  <p className="text-xs text-slate-600">Average payment time is 45 days (15 days overdue typically).</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Revenue</p>
                <p className="text-xl font-bold text-navy mt-1">₹12.4L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Orders</p>
                <p className="text-xl font-bold text-navy mt-1">24</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Avg Order</p>
                <p className="text-xl font-bold text-navy mt-1">₹51.6K</p>
              </CardContent>
            </Card>
            <Card className="border-amber-200 bg-amber-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-amber-700 uppercase">Outstanding</p>
                <p className="text-xl font-bold text-red-600 mt-1">₹2.1L</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Recent Sales Orders</CardTitle></CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Order #</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/50 cursor-pointer" onClick={() => window.location.href='/sales/orders/SO-2026-0042'}>
                    <td className="px-4 py-3 font-medium text-royal">SO-2026-0042</td>
                    <td className="px-4 py-3 text-slate-500">2026-09-01</td>
                    <td className="px-4 py-3 text-right font-medium">₹1,45,000</td>
                    <td className="px-4 py-3"><Badge variant="primary">Confirmed</Badge></td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 cursor-pointer" onClick={() => window.location.href='/sales/orders/SO-2026-0038'}>
                    <td className="px-4 py-3 font-medium text-royal">SO-2026-0038</td>
                    <td className="px-4 py-3 text-slate-500">2026-08-15</td>
                    <td className="px-4 py-3 text-right font-medium">₹2,10,000</td>
                    <td className="px-4 py-3"><Badge variant="success">Invoiced</Badge></td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
