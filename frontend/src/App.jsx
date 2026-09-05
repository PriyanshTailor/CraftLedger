import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { AiCfo } from './pages/AiCfo';
import { Sales } from './pages/Sales';
import { SalesDetail } from './pages/SalesDetail';
import { Purchases } from './pages/Purchases';
import { PurchaseDetail } from './pages/PurchaseDetail';
import { Reports } from './pages/Reports';
import { Inventory } from './pages/Inventory';
import { ProductDetail } from './pages/ProductDetail';
import { Accounting } from './pages/Accounting';
import { Budgeting } from './pages/Budgeting';
import { Settings } from './pages/Settings';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ExplainablePL } from './pages/ExplainablePL';
import { Customers } from './pages/Customers';
import { CustomerDetail } from './pages/CustomerDetail';
import { Vendors } from './pages/Vendors';
import { VendorDetail } from './pages/VendorDetail';

import { Landing } from './pages/Landing';

function ProtectedRoute({ children }) {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales/orders/:id" element={<SalesDetail />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchases/orders/:id" element={<PurchaseDetail />} />
          <Route path="accounting" element={<Accounting />} />
          <Route path="accounting/journal-entries/:id" element={<Accounting />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="inventory/products/:id" element={<ProductDetail />} />
          <Route path="budgeting" element={<Budgeting />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/explainable-pl" element={<ExplainablePL />} />
          <Route path="ai-cfo" element={<AiCfo />} />
          <Route path="settings" element={<Settings />} />
          <Route path="customers" element={<Customers />} />
          <Route path="customers/:id" element={<CustomerDetail />} />
          <Route path="vendors" element={<Vendors />} />
          <Route path="vendors/:id" element={<VendorDetail />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
