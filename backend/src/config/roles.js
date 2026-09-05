export const ROLES = {
  SYSTEM:          'system',
  PLATFORM_ADMIN:  'platform_admin',
  BUSINESS_OWNER:  'business_owner',
  ACCOUNTANT:      'accountant',
  CONTACT:         'contact'
};

// Kept here so old databases can be upgraded without making existing users
// unable to sign in. New documents must only use the values in ROLES above.
const LEGACY_ROLE_MAP = {
  admin: 'business_owner',
  super_admin: 'platform_admin',
  customer: 'contact'
};

export const normalizeRole = (role) => LEGACY_ROLE_MAP[role] || role;

export const ROLE_LABELS = {
  system:         'System',
  platform_admin: 'Platform Admin',
  business_owner: 'Business Owner',
  accountant:     'Accountant',
  contact:        'Contact'
};

// Who can create whom
export const CAN_CREATE = {
  platform_admin: ['business_owner'],
  business_owner: ['accountant'],
  accountant:     [],
  contact:        []
};
