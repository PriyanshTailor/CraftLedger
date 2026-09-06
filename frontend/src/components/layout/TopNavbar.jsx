import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ShoppingBag, Calculator, Package, PieChart,
  FileText, BrainCircuit, Settings, LogOut, Users, Store, User, CreditCard,
  Receipt, BookOpen, AlertOctagon, UserCog, FileCheck2, ShieldCheck,
  TrendingUp, BarChart3, Menu, X, ChevronDown, Bell, Search, Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../lib/roles';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';

export function TopNavbar({ mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [openDropdown, setOpenDropdown] = useState(null); // 'intelligence' | 'management' | 'contacts' | 'profile' | null
  const [searchQuery, setSearchQuery] = useState('');
  const navRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setOpenDropdown(null);
    if (setMobileOpen) setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase() || 'CL';

  // Role detection
  const isPlatformAdmin = user?.role === ROLES.PLATFORM_ADMIN;
  const isBusinessOwner = user?.role === ROLES.BUSINESS_OWNER;
  const isAccountant = user?.role === ROLES.ACCOUNTANT;
  const isContact = user?.role === ROLES.CONTACT;

  const isCustomer = user?.contactType === 'customer' || user?.contactType === 'customer_and_vendor';
  const isVendor = user?.contactType === 'vendor' || user?.contactType === 'customer_and_vendor';

  // Active checks for dropdowns
  const isIntelligenceActive = [
    '/dashboard/ai-cfo',
    '/dashboard/sales-forecast',
    '/dashboard/cash-flow-forecast',
    '/dashboard/anomalies',
    '/dashboard/profit-leaks',
    '/dashboard/reports/explainable-pl',
    '/dashboard/inventory/slow-moving'
  ].some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  const isManagementActive = [
    '/dashboard/customers',
    '/dashboard/vendors',
    '/dashboard/users',
    '/dashboard/audit-logs',
    '/dashboard/settings'
  ].some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  const isContactsActive = [
    '/dashboard/customers',
    '/dashboard/vendors'
  ].some(path => location.pathname === path || location.pathname.startsWith(path + '/'));

  const toggleDropdown = (name) => {
    setOpenDropdown(prev => (prev === name ? null : name));
  };

  return (
    <header ref={navRef} className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 md:gap-4">

          {/* Left: Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link
              to={isContact ? '/contact' : isPlatformAdmin ? '/platform' : '/dashboard'}
              className="flex items-center gap-2 group shrink-0 py-1"
            >
              <img
                src={logo}
                alt="CraftLedger"
                className="h-10 md:h-11 w-auto object-contain transition-transform group-hover:scale-105"
              />
            </Link>

            <div className="hidden xl:block h-5 w-px bg-slate-200 mx-1" />
          </div>

          {/* Center: Desktop Horizontal Navigation */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 flex-1 min-w-0 justify-center">

            {/* 1. BUSINESS OWNER NAVIGATION */}
            {isBusinessOwner && (
              <>
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Dashboard
                </NavLink>

                <NavLink
                  to="/dashboard/sales"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Sales
                </NavLink>

                <NavLink
                  to="/dashboard/purchases"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Purchases
                </NavLink>

                <NavLink
                  to="/dashboard/inventory"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Inventory
                </NavLink>

                <NavLink
                  to="/dashboard/accounting"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Accounting
                </NavLink>

                <NavLink
                  to="/dashboard/budgeting"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Budgeting
                </NavLink>

                <NavLink
                  to="/dashboard/reports"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive
                      ? "bg-slate-100 text-navy font-semibold"
                      : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Reports
                </NavLink>

                {/* Intelligence Dropdown (Only AI CFO & Sales Forecast) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('intelligence')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                      isIntelligenceActive
                        ? "bg-slate-100 text-navy font-semibold"
                        : "text-slate-600 hover:text-navy hover:bg-slate-50",
                      openDropdown === 'intelligence' && "bg-slate-100"
                    )}
                  >
                    <span>Intelligence</span>
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      openDropdown === 'intelligence' && "rotate-180"
                    )} />
                  </button>

                  {openDropdown === 'intelligence' && (
                    <div className="absolute left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Predictive Intelligence
                        </span>
                      </div>

                      <NavLink
                        to="/dashboard/ai-cfo"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <BrainCircuit className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>AI CFO</span>
                      </NavLink>

                      <NavLink
                        to="/dashboard/sales-forecast"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <BarChart3 className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Sales Forecast</span>
                      </NavLink>
                    </div>
                  )}
                </div>

                {/* Management Dropdown (Customers, Vendors, Users, Audit Logs, Settings) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('management')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                      isManagementActive
                        ? "bg-slate-100 text-navy font-semibold"
                        : "text-slate-600 hover:text-navy hover:bg-slate-50",
                      openDropdown === 'management' && "bg-slate-100"
                    )}
                  >
                    <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Management</span>
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      openDropdown === 'management' && "rotate-180"
                    )} />
                  </button>

                  {openDropdown === 'management' && (
                    <div className="absolute right-0 lg:left-0 mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Business Operations
                        </span>
                      </div>

                      <NavLink
                        to="/dashboard/customers"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <Users className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Customers</span>
                      </NavLink>

                      <NavLink
                        to="/dashboard/vendors"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <Store className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Vendors</span>
                      </NavLink>

                      <NavLink
                        to="/dashboard/users"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <UserCog className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>User Management</span>
                      </NavLink>

                      <NavLink
                        to="/dashboard/audit-logs"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Audit Logs</span>
                      </NavLink>

                      <div className="my-1 border-t border-slate-100" />

                      <NavLink
                        to="/dashboard/settings"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive
                            ? "bg-slate-100 text-navy font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Settings</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 2. ACCOUNTANT NAVIGATION */}
            {isAccountant && (
              <>
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/dashboard/sales"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Sales
                </NavLink>
                <NavLink
                  to="/dashboard/purchases"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Purchases
                </NavLink>
                <NavLink
                  to="/dashboard/inventory"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Inventory
                </NavLink>
                <NavLink
                  to="/dashboard/accounting"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Accounting
                </NavLink>
                <NavLink
                  to="/dashboard/reports"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Reports
                </NavLink>

                {/* Contacts Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => toggleDropdown('contacts')}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                      isContactsActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50",
                      openDropdown === 'contacts' && "bg-slate-100"
                    )}
                  >
                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                    <span>Contacts</span>
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 text-slate-400 transition-transform duration-200",
                      openDropdown === 'contacts' && "rotate-180"
                    )} />
                  </button>

                  {openDropdown === 'contacts' && (
                    <div className="absolute left-0 mt-1.5 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <NavLink
                        to="/dashboard/customers"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <Users className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Customers</span>
                      </NavLink>
                      <NavLink
                        to="/dashboard/vendors"
                        onClick={() => setOpenDropdown(null)}
                        className={({ isActive }) => cn(
                          "flex items-center gap-2.5 px-3 py-2 rounded-lg mx-1 text-sm transition-colors",
                          isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-700 hover:bg-slate-50 hover:text-navy"
                        )}
                      >
                        <Store className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Vendors</span>
                      </NavLink>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* 3. PLATFORM ADMIN NAVIGATION */}
            {isPlatformAdmin && (
              <>
                <NavLink
                  to="/platform"
                  end
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Platform Overview
                </NavLink>
                <NavLink
                  to="/platform/users"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  User Directory
                </NavLink>
                <NavLink
                  to="/platform/audit-logs"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Audit Logs
                </NavLink>
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Business View
                </NavLink>
                <NavLink
                  to="/dashboard/settings"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Platform Settings
                </NavLink>
              </>
            )}

            {/* 4. CONTACT PORTAL NAVIGATION */}
            {isContact && (
              <>
                <NavLink
                  to="/contact"
                  end
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  My Dashboard
                </NavLink>
                <NavLink
                  to="/contact/profile"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  My Profile
                </NavLink>
                {isCustomer && (
                  <NavLink
                    to="/contact/invoices"
                    className={({ isActive }) => cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                      isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                    )}
                  >
                    My Invoices
                  </NavLink>
                )}
                {isVendor && (
                  <NavLink
                    to="/contact/bills"
                    className={({ isActive }) => cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                      isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                    )}
                  >
                    My Bills
                  </NavLink>
                )}
                <NavLink
                  to="/contact/payments"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  My Payments
                </NavLink>
                <NavLink
                  to="/contact/contract"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  My Contract
                </NavLink>
                <NavLink
                  to="/contact/make-payment"
                  className={({ isActive }) => cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:text-navy hover:bg-slate-50"
                  )}
                >
                  Make Payment
                </NavLink>
              </>
            )}

          </nav>

          {/* Right: Search, Notifications & User Profile */}
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            {/* Search */}
            <div className="relative hidden 2xl:block">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 h-8 pl-8 pr-3 rounded-full border border-slate-200 bg-slate-50 text-xs focus:outline-none focus:ring-2 focus:ring-royal/20 focus:border-royal transition-all"
              />
            </div>

            {/* Notification Bell */}
            <button
              className="relative p-2 text-slate-400 hover:text-navy hover:bg-slate-50 rounded-lg transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border-2 border-white" />
            </button>

            <div className="h-5 w-px bg-slate-200 mx-0.5" />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('profile')}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-semibold text-xs shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="hidden xl:flex flex-col min-w-0 text-left">
                  <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                    {user?.name || 'CraftLedger'}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-tight capitalize truncate">
                    {user?.contactType?.replaceAll('_', ' ') || user?.role?.replaceAll('_', ' ') || 'User'}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-3.5 h-3.5 text-slate-400 hidden xl:block transition-transform duration-200",
                  openDropdown === 'profile' && "rotate-180"
                )} />
              </button>

              {/* Profile Dropdown Menu */}
              {openDropdown === 'profile' && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 mb-1">
                    <span className="text-sm font-semibold text-slate-800 block truncate">
                      {user?.name || 'CraftLedger User'}
                    </span>
                    <span className="text-xs text-slate-400 block capitalize truncate">
                      {user?.email || user?.contactType?.replaceAll('_', ' ') || user?.role?.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <Link
                    to="/dashboard/settings"
                    onClick={() => setOpenDropdown(null)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-navy transition-colors"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Settings</span>
                  </Link>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-red-500" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Drawer (Responsive slide-out on < lg screens) */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 max-h-[85vh] overflow-y-auto space-y-4 shadow-lg animate-in slide-in-from-top duration-200">
          {/* Main Navigation links on mobile */}
          {isBusinessOwner && (
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                Main Menu
              </p>
              <NavLink
                to="/dashboard"
                end
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </NavLink>
              <NavLink
                to="/dashboard/sales"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <ShoppingCart className="w-4 h-4" /> Sales
              </NavLink>
              <NavLink
                to="/dashboard/purchases"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <ShoppingBag className="w-4 h-4" /> Purchases
              </NavLink>
              <NavLink
                to="/dashboard/inventory"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Package className="w-4 h-4" /> Inventory
              </NavLink>
              <NavLink
                to="/dashboard/accounting"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Calculator className="w-4 h-4" /> Accounting
              </NavLink>
              <NavLink
                to="/dashboard/budgeting"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <PieChart className="w-4 h-4" /> Budgeting
              </NavLink>
              <NavLink
                to="/dashboard/reports"
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                  isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <FileText className="w-4 h-4" /> Reports
              </NavLink>

              {/* Intelligence items on mobile */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                  Intelligence
                </p>
                <NavLink
                  to="/dashboard/ai-cfo"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <BrainCircuit className="w-4 h-4 text-royal" /> AI CFO
                </NavLink>
                <NavLink
                  to="/dashboard/sales-forecast"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <BarChart3 className="w-4 h-4 text-royal" /> Sales Forecast
                </NavLink>
              </div>

              {/* Management items on mobile */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
                  Management
                </p>
                <NavLink
                  to="/dashboard/customers"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Users className="w-4 h-4" /> Customers
                </NavLink>
                <NavLink
                  to="/dashboard/vendors"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Store className="w-4 h-4" /> Vendors
                </NavLink>
                <NavLink
                  to="/dashboard/users"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <UserCog className="w-4 h-4" /> User Management
                </NavLink>
                <NavLink
                  to="/dashboard/audit-logs"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <BookOpen className="w-4 h-4" /> Audit Logs
                </NavLink>
                <NavLink
                  to="/dashboard/settings"
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
                    isActive ? "bg-slate-100 text-navy font-semibold" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Settings className="w-4 h-4" /> Settings
                </NavLink>
              </div>
            </div>
          )}

          {/* Logout button in mobile drawer */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
