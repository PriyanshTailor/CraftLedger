import React from 'react';
import { Menu, Search, Bell, PanelLeftClose, PanelLeft, Settings, ChevronDown, LogOut } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function TopNavbar({ setMobileOpen, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const pageTitles = {
    '/contact': 'My Dashboard',
    '/contact/profile': 'My Profile',
    '/contact/invoices': 'My Invoices',
    '/contact/bills': 'My Bills',
    '/contact/payments': 'My Payments',
    '/contact/make-payment': 'Make Demo Payment',
    '/contact/contract': 'My Contract',
  };
  const title = Object.entries(pageTitles).find(([path]) => location.pathname === path)?.[1]
    || (location.pathname.startsWith('/contact/invoices/') ? 'Invoice Details' : null)
    || (location.pathname.startsWith('/contact/bills/') ? 'Bill Details' : null)
    || (location.pathname.startsWith('/contact/payments/') ? 'Payment Receipt' : null)
    || 'Dashboard';
  const initials = user?.name?.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'CL';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10 shadow-sm relative">
      <div className="flex items-center gap-4">
        {/* Mobile toggle */}
        <button
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse toggle */}
        <button
          className="hidden lg:flex p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <h1 className="text-lg font-bold text-navy hidden sm:block">{title}</h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Search */}
        <div className="relative hidden md:block mr-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-9 pl-9 pr-4 rounded-full border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
        </button>

        <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Profile Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="hidden lg:flex flex-col min-w-0 text-left">
              <span className="text-sm font-semibold text-slate-800 leading-none mb-1">{user?.name || 'CraftLedger User'}</span>
              <span className="text-[10px] text-slate-500 leading-none capitalize">{user?.contactType?.replaceAll('_', ' ') || user?.role?.replaceAll('_', ' ') || 'Account'}</span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block ml-1" />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2">
            <div className="px-4 py-3 border-b border-slate-100 mb-1">
              <span className="text-sm font-semibold text-slate-800 block">{user?.name || 'CraftLedger User'}</span>
              <span className="text-xs text-slate-500 block capitalize">{user?.contactType?.replaceAll('_', ' ') || user?.role?.replaceAll('_', ' ') || 'Account'}</span>
            </div>
            <NavLink to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy transition-colors">
              <Settings className="w-4 h-4" /> Settings
            </NavLink>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left mt-1"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
