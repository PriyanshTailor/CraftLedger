import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingCart, ShoppingBag, Calculator, Package, PieChart,
  FileText, BrainCircuit, Settings, LogOut, Activity, Users, Store,
  User, CreditCard, Receipt, BookOpen, AlertOctagon, UserCog, FileCheck2
} from 'lucide-react';
import { cn } from '../../lib/utils';
import logo from '../../assets/logo.png';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES } from '../../lib/roles';

// Sidebar config per role
const ADMIN_SECTIONS = [
  {
    label: 'Main Menu',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Sales', path: '/dashboard/sales', icon: ShoppingCart },
      { name: 'Purchases', path: '/dashboard/purchases', icon: ShoppingBag },
      { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
      { name: 'Accounting', path: '/dashboard/accounting', icon: Calculator },
      { name: 'Budgeting', path: '/dashboard/budgeting', icon: PieChart },
      { name: 'Reports', path: '/dashboard/reports', icon: FileText },
    ]
  },
  {
    label: 'Intelligence',
    items: [
      { name: 'AI CFO', path: '/dashboard/ai-cfo', icon: BrainCircuit, special: true },
      { name: 'Explainable P&L', path: '/dashboard/reports/explainable-pl', icon: Activity },
    ]
  },
  {
    label: 'Management',
    items: [
      { name: 'Customers', path: '/dashboard/customers', icon: Users },
      { name: 'Vendors', path: '/dashboard/vendors', icon: Store },
      { name: 'User Management', path: '/dashboard/users', icon: UserCog },
      { name: 'Audit Logs', path: '/dashboard/audit-logs', icon: BookOpen },
      { name: 'Settings', path: '/dashboard/settings', icon: Settings },
    ]
  }
];

const ACCOUNTANT_SECTIONS = [
  {
    label: 'Main Menu',
    items: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Sales', path: '/dashboard/sales', icon: ShoppingCart },
      { name: 'Purchases', path: '/dashboard/purchases', icon: ShoppingBag },
      { name: 'Inventory', path: '/dashboard/inventory', icon: Package },
      { name: 'Accounting', path: '/dashboard/accounting', icon: Calculator },
      { name: 'Reports', path: '/dashboard/reports', icon: FileText },
    ]
  },
  {
    label: 'Contacts',
    items: [
      { name: 'Customers', path: '/dashboard/customers', icon: Users },
      { name: 'Vendors', path: '/dashboard/vendors', icon: Store },
    ]
  }
];

const CONTACT_SECTIONS = [
  {
    label: 'My Account',
    items: [
      { name: 'My Dashboard', path: '/contact', icon: LayoutDashboard },
      { name: 'My Profile', path: '/contact/profile', icon: User },
      { name: 'My Invoices', path: '/contact/invoices', icon: FileText },
      { name: 'My Bills', path: '/contact/bills', icon: Receipt },
      { name: 'My Payments', path: '/contact/payments', icon: CreditCard },
      { name: 'My Contract', path: '/contact/contract', icon: FileCheck2 },
      { name: 'Make Payment', path: '/contact/make-payment', icon: AlertOctagon, special: true },
    ]
  }
];

function getSections(role, contactType) {
  if (role === ROLES.BUSINESS_OWNER) return ADMIN_SECTIONS;
  if (role === ROLES.ACCOUNTANT) return ACCOUNTANT_SECTIONS;
  if (role === ROLES.CONTACT) {
    const isCustomer = contactType === 'customer' || contactType === 'customer_and_vendor';
    const isVendor = contactType === 'vendor' || contactType === 'customer_and_vendor';
    return CONTACT_SECTIONS.map(section => ({
      ...section,
      items: section.items.filter(item =>
        (item.path !== '/contact/invoices' || isCustomer) &&
        (item.path !== '/contact/bills' || isVendor)
      )
    }));
  }
  return [];
}

export function Sidebar({ mobileOpen, setMobileOpen, collapsed }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const sections = getSections(user?.role, user?.contactType);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

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
        {sections.map((section, idx) => (
          <div key={idx}>
            {idx > 0 && <div className="my-3 border-t border-slate-100 mx-3 shrink-0" />}
            {!collapsed && (
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-5 mb-2 shrink-0">
                {section.label}
              </p>
            )}
            {section.items.map(item => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard' || item.path === '/contact'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center mx-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group shrink-0",
                  collapsed ? "justify-center" : "gap-3",
                  item.special
                    ? (isActive ? 'bg-royal text-white shadow-sm' : 'text-royal bg-blue-50 border border-blue-100 hover:bg-blue-100')
                    : (isActive ? "bg-blue-50 text-royal" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50")
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon className={cn("w-5 h-5 shrink-0", collapsed ? "mx-auto" : "")} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Logout */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
