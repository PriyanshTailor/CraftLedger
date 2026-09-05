import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ChevronLeft, Edit, Mail, Phone, MapPin, TrendingDown, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const chartData = [
  { name: 'Apr', cost: 120000 },
  { name: 'May', cost: 135000 },
  { name: 'Jun', cost: 145000 },
  { name: 'Jul', cost: 180000 },
  { name: 'Aug', cost: 210000 },
  { name: 'Sep', cost: 250000 },
];

export function VendorDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
          <Link to="/vendors" className="hover:text-royal flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Vendors</Link>
          <span>/</span>
          <span className="text-slate-800">{id}</span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-navy flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-2xl">{id?.substring(0,2).toUpperCase()}</span>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-navy">{id}</h2>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-slate-500 text-sm">Vendor since Mar 2025</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline"><Mail className="w-4 h-4 mr-2" /> Contact</Button>
            <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
            <Button>Create PO</Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Vendor Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">sales@{id?.toLowerCase().replace(' ', '')}.com</p>
                  <p className="text-xs text-slate-500">Sales Email</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">+91 99887 77665</p>
                  <p className="text-xs text-slate-500">Support Phone</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-navy">Phase 4, Industrial Area<br/>Pune, MH 411001</p>
                  <p className="text-xs text-slate-500">Warehouse Address</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 shadow-md ring-1 ring-amber-50">
            <CardHeader className="bg-amber-50/50 pb-4 border-b border-amber-100">
              <CardTitle className="text-amber-800 text-sm">Vendor Intelligence</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <div className="flex gap-3">
                <TrendingDown className="w-5 h-5 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Increasing Costs</p>
                  <p className="text-xs text-slate-600">Average purchase cost has increased by 14% over the last 3 months.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Payment Due Soon</p>
                  <p className="text-xs text-slate-600">₹1,45,000 is due in 3 days.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Total Value</p>
                <p className="text-xl font-bold text-navy mt-1">₹18.5L</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Orders</p>
                <p className="text-xl font-bold text-navy mt-1">42</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-slate-500 uppercase">Avg Cost</p>
                <p className="text-xl font-bold text-navy mt-1">₹44.0K</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/30">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-red-700 uppercase">Payable</p>
                <p className="text-xl font-bold text-red-600 mt-1">₹1.45L</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle>Purchase Cost Trend</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[200px] w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} tickFormatter={(val) => `₹${val/1000}k`} />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Cost']} />
                    <Area type="monotone" dataKey="cost" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
