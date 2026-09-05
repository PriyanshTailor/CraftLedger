import React from 'react';
import { PieChart, ShieldCheck, TrendingUp } from 'lucide-react';
import logo from '../../assets/logo.png';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy text-white flex-col justify-between p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12 bg-white/10 w-fit p-2 rounded-xl backdrop-blur-sm">
            <img src={logo} alt="CraftLedger Logo" className="h-10 w-auto object-contain brightness-0 invert" />
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">Your furniture business,<br/>financially intelligent.</h2>
          <p className="text-slate-300 text-lg max-w-md">
            Connect accounting, inventory, cash flow, and business insights in one powerful workspace.
          </p>
        </div>

        {/* Mini Dashboard Preview */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium text-slate-300">Business Health</span>
            <span className="px-2.5 py-1 rounded-full bg-green-500/20 text-green-300 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Healthy (82/100)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-slate-400 text-xs mb-1">Revenue (30d)</p>
              <p className="text-xl font-bold">₹12.4L</p>
              <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12.5%</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <p className="text-slate-400 text-xs mb-1">Net Profit</p>
              <p className="text-xl font-bold">₹4.1L</p>
              <p className="text-green-400 text-xs mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +5.2%</p>
            </div>
          </div>
        </div>

        {/* Decorative background circles */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-royal rounded-full mix-blend-multiply filter blur-[100px] opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-multiply filter blur-[120px] opacity-30 translate-x-1/3 translate-y-1/3"></div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center mb-8">
            <img src={logo} alt="CraftLedger Logo" className="h-8 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy mb-2">{title}</h2>
            {subtitle && <p className="text-slate-500">{subtitle}</p>}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
