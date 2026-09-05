import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ShoppingBag, Calculator,
  Package, PieChart, FileText, BrainCircuit, Settings,
  Bell, Search, Menu, X, ChevronDown
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Sales', path: '/sales', icon: ShoppingCart },
  { name: 'Purchases', path: '/purchases', icon: ShoppingBag },
  { name: 'Accounting', path: '/accounting', icon: Calculator },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Budgeting', path: '/budgeting', icon: PieChart },
  { name: 'Reports', path: '/reports', icon: FileText },
];

export function TopNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm w-full">
      {/* Main bar */}
      <div className="flex items-center h-14 px-4 lg:px-6 gap-2 w-full min-w-0">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 shrink-0 mr-1 lg:mr-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-navy to-royal flex items-center justify-center shadow-sm shrink-0">
            <span className="text-white font-bold text-xs">U</span>
          </div>
          <div className="hidden xl:flex flex-col leading-tight">
            <span className="font-bold text-navy tracking-tight text-xs">Urban Furniture</span>
            <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Intelligence</span>
          </div>
        </NavLink>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 min-w-0 overflow-hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => cn(
                'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0',
                isActive
                  ? 'bg-blue-50 text-royal'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <item.icon className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden lg:block">{item.name}</span>
            </NavLink>
          ))}

          {/* AI CFO — highlighted */}
          <NavLink
            to="/ai-cfo"
            className={({ isActive }) => cn(
              'flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150 whitespace-nowrap shrink-0 ml-1',
              isActive
                ? 'bg-royal text-white shadow-sm'
                : 'text-royal bg-blue-50 hover:bg-blue-100 border border-blue-100'
            )}
          >
            <BrainCircuit className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:block">AI CFO</span>
          </NavLink>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto shrink-0">
          {/* Search */}
          <div className="relative hidden xl:block">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-300" />
            <input
              type="text"
              placeholder="Search..."
              className="w-44 h-8 pl-8 pr-3 rounded-lg border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-1.5 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500 border border-white" />
          </button>

          {/* Settings */}
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              'p-1.5 rounded-lg transition-colors',
              isActive ? 'text-royal bg-blue-50' : 'text-slate-400 hover:text-navy hover:bg-slate-50'
            )}
          >
            <Settings className="w-4 h-4" />
          </NavLink>

          {/* Divider */}
          <div className="w-px h-6 bg-slate-100 mx-1" />

          {/* User */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold text-[10px] shrink-0">
              JD
            </div>
            <div className="hidden xl:flex flex-col leading-tight">
              <span className="text-xs font-semibold text-slate-700">John Doe</span>
              <span className="text-[9px] text-slate-400">Owner</span>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden xl:block" />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 ml-1"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 flex flex-col gap-1 shadow-lg">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                isActive ? 'bg-blue-50 text-royal' : 'text-slate-600 hover:bg-slate-50'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </NavLink>
          ))}
          <NavLink
            to="/ai-cfo"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-royal bg-blue-50 border border-blue-100"
          >
            <BrainCircuit className="w-4 h-4" />
            AI CFO
          </NavLink>
        </div>
      )}
    </header>
  );
}
