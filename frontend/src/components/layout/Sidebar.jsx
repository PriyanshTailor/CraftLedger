import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ShoppingBag, Calculator, Package, PieChart,
  FileText, BrainCircuit, Settings, LogOut, Search, Activity, Users, Store
} from 'lucide-react';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

export function Sidebar({ mobileOpen, setMobileOpen, collapsed }) {
  const navigate = useNavigate();

  const mainItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Sales', path: '/dashboard/sales', icon: ShoppingCart },
    { name: 'Purchases', path: '/dashboard/purchases', icon: ShoppingBag },
    { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
    { name: 'Accounting', path: '/dashboard/accounting', icon: Calculator },
    { name: 'Budgeting', path: '/dashboard/budgeting', icon: PieChart },
    { name: 'Reports', path: '/dashboard/reports', icon: FileText },
  ];

  const intelItems = [
    { name: 'AI CFO', path: '/dashboard/ai-cfo', icon: BrainCircuit, special: true },
    { name: 'Explainable P&L', path: '/dashboard/reports/explainable-pl', icon: Activity },
  ];

  const relationItems = [
    { name: 'Customers', path: '/dashboard/customers', icon: Users },
    { name: 'Vendors', path: '/dashboard/vendors', icon: Store },
  ];

  return (
    <aside className={cn(
      "fixed lg:static inset-y-0 left-0 z-30 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out transform",
      collapsed ? "w-20" : "w-64",
      mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 gap-3 shrink-0">
        <img src={logo} alt="CraftLedger Logo" className={cn("h-8 w-auto object-contain transition-all", collapsed ? "mx-auto" : "")} />
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 flex flex-col gap-0.5 custom-scrollbar">
        {!collapsed && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-5 mb-2 shrink-0">Main Menu</p>}
        {mainItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group shrink-0",
              collapsed ? "justify-center" : "gap-3",
              isActive ? "bg-blue-50 text-royal" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mx-auto" : "")} />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}

        <div className="my-3 border-t border-slate-100 mx-3 shrink-0" />
        
        {!collapsed && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-5 mb-2 shrink-0">Intelligence</p>}
        {intelItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group shrink-0",
              collapsed ? "justify-center" : "gap-3",
              item.special 
                ? (isActive ? 'bg-royal text-white shadow-sm' : 'text-royal bg-blue-50 border border-blue-100 hover:bg-blue-100')
                : (isActive ? 'bg-blue-50 text-royal' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50')
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mx-auto" : "")} />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}

        <div className="my-3 border-t border-slate-100 mx-3 shrink-0" />
        
        {!collapsed && <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-5 mb-2 shrink-0">Relationships</p>}
        {relationItems.map(item => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group shrink-0",
              collapsed ? "justify-center" : "gap-3",
              isActive ? "bg-blue-50 text-royal" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            )}
            title={collapsed ? item.name : undefined}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mx-auto" : "")} />
            {!collapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </div>

    </aside>
  );
}
