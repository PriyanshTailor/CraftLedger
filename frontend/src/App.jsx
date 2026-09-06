import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, ContactTypeGuard } from './components/auth/Guards';
import { ROLES } from './lib/roles';

// Layouts
import { AppLayout } from './components/layout/AppLayout';

// Auth Pages
import { Login } from './pages/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { Landing } from './pages/Landing';
import { Unauthorized } from './pages/Unauthorized';

// Admin + Accountant Pages
import { Dashboard } from './pages/Dashboard';
import { AiCfo } from './pages/AiCfo';
import { Sales } from './pages/Sales';
import { SalesDetail } from './pages/SalesDetail';
import { Purchases } from './pages/Purchases';
import { PurchaseDetail } from './pages/PurchaseDetail';
import { Reports } from './pages/Reports';
import { Inventory } from './pages/Inventory';
import { AddProduct } from './pages/AddProduct';
import { ProductDetail } from './pages/ProductDetail';
import { Accounting } from './pages/Accounting';
import { Budgeting } from './pages/Budgeting';
import { Settings } from './pages/Settings';
import { ExplainablePL } from './pages/ExplainablePL';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Vendors } from './pages/Vendors';
import { VendorDetail } from './pages/VendorDetail';

// Contact Portal Pages
import { ContactDashboard } from './pages/contact/ContactDashboard';
import { ContactProfile, MyInvoices, InvoiceDetails, MyBills, BillDetails, MyPayments, PaymentDetails, MakePayment, PaymentSuccess, PaymentFailed, MyContract } from './pages/contact/PortalPages';

// Platform Admin Pages & System Management
import { PlatformAdmin } from './pages/PlatformAdmin';
import { Users } from './pages/Users';
import { AuditLogs } from './pages/AuditLogs';
import { CashFlowForecast } from './pages/CashFlowForecast';
import { SalesForecast } from './pages/SalesForecast';
import { SlowMovingInventory } from './pages/SlowMovingInventory';
import { AnomalyDetection } from './pages/AnomalyDetection';
import { ProfitLeaks } from './pages/ProfitLeaks';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Platform Admin Portal (role: platform_admin) */}
          <Route
            path="/platform"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PlatformAdmin />} />
            <Route path="users" element={<Users />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>

          {/* Contact Portal (role: contact) */}
          <Route
            path="/contact"
            element={
              <ProtectedRoute allowedRoles={[ROLES.CONTACT]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ContactDashboard />} />
            <Route path="profile" element={<ContactProfile />} />
            <Route path="invoices" element={<ContactTypeGuard contactTypes={['customer', 'customer_and_vendor']}><MyInvoices /></ContactTypeGuard>} />
            <Route path="invoices/:id" element={<ContactTypeGuard contactTypes={['customer', 'customer_and_vendor']}><InvoiceDetails /></ContactTypeGuard>} />
            <Route path="bills" element={<ContactTypeGuard contactTypes={['vendor', 'customer_and_vendor']}><MyBills /></ContactTypeGuard>} />
            <Route path="bills/:id" element={<ContactTypeGuard contactTypes={['vendor', 'customer_and_vendor']}><BillDetails /></ContactTypeGuard>} />
            <Route path="payments" element={<MyPayments />} />
            <Route path="payments/:id" element={<PaymentDetails />} />
            <Route path="make-payment" element={<MakePayment />} />
            <Route path="payment-success" element={<PaymentSuccess />} />
            <Route path="payment-failed" element={<PaymentFailed />} />
            <Route path="contract" element={<MyContract />} />
          </Route>

          {/* Main App (business owner, accountant, or platform admin) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />

            {/* Admin + Accountant */}
            <Route path="sales" element={<Sales />} />
            <Route path="sales/orders/:id" element={<SalesDetail />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="purchases/orders/:id" element={<PurchaseDetail />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="accounting/journal-entries/:id" element={<Accounting />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="inventory/new" element={<AddProduct />} />
            <Route path="inventory/products/new" element={<AddProduct />} />
            <Route path="inventory/slow-moving" element={<SlowMovingInventory />} />
            <Route path="inventory/products/:id" element={<ProductDetail />} />
            <Route path="reports" element={<Reports />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="vendors" element={<Vendors />} />
            <Route path="vendors/:id" element={<VendorDetail />} />
            <Route path="users" element={<Users />} />
            <Route path="audit-logs" element={<AuditLogs />} />

            {/* Admin-only */}
            <Route
              path="budgeting"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER]}>
                  <Budgeting />
                </ProtectedRoute>
              }
            />
            <Route
              path="ai-cfo"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER]}>
                  <AiCfo />
                </ProtectedRoute>
              }
            />
            <Route
              path="cash-flow-forecast"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                  <CashFlowForecast />
                </ProtectedRoute>
              }
            />
            <Route
              path="sales-forecast"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                  <SalesForecast />
                </ProtectedRoute>
              }
            />
            <Route
              path="anomalies"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                  <AnomalyDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="profitability-risk"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                  <AnomalyDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="reports/explainable-pl"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER]}>
                  <ExplainablePL />
                </ProtectedRoute>
              }
            />
            <Route
              path="profit-leaks"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                  <ProfitLeaks />
                </ProtectedRoute>
              }
            />
            <Route
              path="intelligence/profit-leaks"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER, ROLES.ACCOUNTANT]}>
                  <ProfitLeaks />
                </ProtectedRoute>
              }
            />
            <Route
              path="settings"
              element={
                  <ProtectedRoute allowedRoles={[ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER]}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
