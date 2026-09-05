import { ROLES } from './roles.js';

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD:         'view_dashboard',
  VIEW_SUPER_ADMIN_PANEL: 'view_super_admin_panel',

  // Contacts / Master Data
  VIEW_CONTACTS:          'view_contacts',
  CREATE_CONTACT:         'create_contact',
  UPDATE_CONTACT:         'update_contact',
  ARCHIVE_CONTACT:        'archive_contact',

  VIEW_PRODUCTS:          'view_products',
  CREATE_PRODUCT:         'create_product',
  UPDATE_PRODUCT:         'update_product',
  ARCHIVE_PRODUCT:        'archive_product',

  VIEW_CHART_OF_ACCOUNTS: 'view_chart_of_accounts',
  CREATE_CHART_OF_ACCOUNT:'create_chart_of_account',
  UPDATE_CHART_OF_ACCOUNT:'update_chart_of_account',

  // Sales
  VIEW_SALES:             'view_sales',
  CREATE_SALES_INVOICE:   'create_sales_invoice',
  UPDATE_SALES_INVOICE:   'update_sales_invoice',
  CANCEL_SALES_INVOICE:   'cancel_sales_invoice',

  // Purchases
  VIEW_PURCHASES:         'view_purchases',
  CREATE_PURCHASE_BILL:   'create_purchase_bill',
  UPDATE_PURCHASE_BILL:   'update_purchase_bill',

  // Inventory / Accounting
  VIEW_INVENTORY:         'view_inventory',
  VIEW_ACCOUNTING:        'view_accounting',
  VIEW_LEDGER:            'view_ledger',

  // Payments
  VIEW_PAYMENTS:          'view_payments',
  RECORD_PAYMENT:         'record_payment',

  // Reports
  VIEW_REPORTS:           'view_reports',

  // Business-Owner-only
  VIEW_BUDGETING:         'view_budgeting',
  VIEW_AI_CFO:            'view_ai_cfo',
  VIEW_EXPLAINABLE_PL:    'view_explainable_pl',
  VIEW_BUSINESS_HEALTH:   'view_business_health',
  VIEW_AUDIT_LOGS:        'view_audit_logs',
  MANAGE_SETTINGS:        'manage_settings',

  // User management
  MANAGE_USERS:           'manage_users',
  CREATE_ACCOUNTANT:      'create_accountant',
  CREATE_BUSINESS_OWNER:  'create_business_owner',

  // Customer
  VIEW_OWN_INVOICES:      'view_own_invoices',
  VIEW_OWN_PURCHASES:     'view_own_purchases',
  VIEW_OWN_PAYMENTS:      'view_own_payments',
  VIEW_OWN_PROFILE:       'view_own_profile',
};

const ALL_BUSINESS = [
  'view_dashboard',
  'view_contacts', 'create_contact', 'update_contact', 'archive_contact',
  'view_products', 'create_product', 'update_product', 'archive_product',
  'view_chart_of_accounts', 'create_chart_of_account', 'update_chart_of_account',
  'view_sales', 'create_sales_invoice', 'update_sales_invoice', 'cancel_sales_invoice',
  'view_purchases', 'create_purchase_bill', 'update_purchase_bill',
  'view_inventory', 'view_accounting', 'view_ledger',
  'view_payments', 'record_payment',
  'view_reports', 'view_budgeting', 'view_ai_cfo', 'view_explainable_pl',
  'view_business_health', 'view_audit_logs', 'manage_settings',
  'manage_users', 'create_accountant',
];

export const ROLE_PERMISSIONS = {
  [ROLES.PLATFORM_ADMIN]: [
    'view_super_admin_panel',
    'create_business_owner',
    'manage_users',
    ...ALL_BUSINESS
  ],

  [ROLES.BUSINESS_OWNER]: ALL_BUSINESS,

  [ROLES.ACCOUNTANT]: [
    'view_dashboard',
    'view_contacts', 'create_contact', 'update_contact',
    'view_products', 'create_product', 'update_product',
    'view_chart_of_accounts', 'create_chart_of_account',
    'view_sales', 'create_sales_invoice', 'update_sales_invoice',
    'view_purchases', 'create_purchase_bill', 'update_purchase_bill',
    'view_inventory', 'view_accounting', 'view_ledger',
    'view_payments', 'record_payment',
    'view_reports',
  ],

  [ROLES.CONTACT]: [
    'view_own_invoices',
    'view_own_purchases',
    'view_own_payments',
    'view_own_profile',
  ],
};
