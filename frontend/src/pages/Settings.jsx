import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Building2, User, Bell, Shield, CreditCard } from 'lucide-react';

export function Settings() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-bold text-navy mb-1">Settings</h2>
        <p className="text-slate-500">Manage your business profile and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar nav */}
        <div className="space-y-1">
          {[
            { icon: Building2, label: 'Business Profile', active: true },
            { icon: User, label: 'Account', active: false },
            { icon: Bell, label: 'Notifications', active: false },
            { icon: Shield, label: 'Security', active: false },
            { icon: CreditCard, label: 'Billing', active: false },
          ].map(item => (
            <button key={item.label} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-3 font-medium transition-colors ${item.active ? 'bg-blue-50 text-royal' : 'text-slate-600 hover:bg-slate-100'}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="md:col-span-3 space-y-6">
          <Card>
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle>Business Profile</CardTitle>
              <CardDescription>Information about your company visible across the platform.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Business Name', value: 'Urban Furniture Co.' },
                  { label: 'GST Number', value: '27AABCU9603R1ZX' },
                  { label: 'Industry', value: 'Furniture & Interior' },
                  { label: 'Financial Year Start', value: 'April 1' },
                  { label: 'Base Currency', value: 'INR (₹)' },
                  { label: 'City', value: 'Mumbai, MH' },
                ].map(field => (
                  <div key={field.label}>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">{field.label}</label>
                    <input
                      defaultValue={field.value}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal bg-white"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-2">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
