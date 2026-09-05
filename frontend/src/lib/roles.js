// Centralized role constants — must match backend exactly
export const ROLES = {
  SYSTEM: 'system',
  PLATFORM_ADMIN: 'platform_admin',
  BUSINESS_OWNER: 'business_owner',
  ACCOUNTANT: 'accountant',
  CONTACT: 'contact'
};

// Human-readable labels for display
export const ROLE_LABELS = {
  system: 'System',
  platform_admin: 'Platform Admin',
  business_owner: 'Business Owner',
  accountant: 'Invoicing User',
  contact: 'Customer / Vendor'
};

// Role-specific permission sets (frontend UI control only — backend enforces separately)
export const ROLE_PERMISSIONS = {
  business_owner: [
    'view_dashboard', 'view_contacts', 'create_contact', 'update_contact', 'archive_contact',
    'view_products', 'create_product', 'update_product', 'archive_product',
    'view_sales', 'create_sales_invoice', 'update_sales_invoice', 'cancel_sales_invoice',
    'view_purchases', 'create_purchase_bill', 'update_purchase_bill',
    'view_inventory', 'view_accounting', 'view_ledger', 'view_payments', 'record_payment',
    'view_reports', 'view_budgeting', 'view_ai_cfo', 'view_explainable_pl', 'view_business_health',
    'manage_users', 'assign_roles', 'view_audit_logs', 'manage_settings'
  ],
  accountant: [
    'view_dashboard', 'view_contacts', 'create_contact', 'update_contact',
    'view_products', 'create_product', 'update_product',
    'view_sales', 'create_sales_invoice', 'update_sales_invoice',
    'view_purchases', 'create_purchase_bill', 'update_purchase_bill',
    'view_inventory', 'view_accounting', 'view_ledger', 'view_payments', 'record_payment',
    'view_reports', 'view_budgeting'
  ],
  contact: [
    'view_own_invoices', 'view_own_bills', 'view_own_payments', 'make_payment', 'view_own_profile'
  ],
  system: []
};

export const hasPermission = (role, permission) => {
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(permission);
};
