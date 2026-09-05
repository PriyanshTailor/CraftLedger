import { z } from 'zod';

export const contactSchema = z.object({
  contactType: z.enum(['customer', 'vendor', 'customer_and_vendor']),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  taxNumber: z.string().optional(),
  openingBalance: z.number().optional(),
  creditLimit: z.number().optional(),
  paymentTerms: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const productCategorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const productSchema = z.object({
  categoryId: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  unit: z.string().optional(),
  costPrice: z.number().min(0, 'Cost price must be positive'),
  sellingPrice: z.number().min(0, 'Selling price must be positive'),
  taxRate: z.number().min(0, 'Tax rate must be positive').optional(),
  quantityOnHand: z.number().min(0, 'Quantity must be non-negative').optional(),
  reorderLevel: z.number().min(0, 'Reorder level must be non-negative').optional(),
  isActive: z.boolean().optional(),
});

export const accountSchema = z.object({
  accountCode: z.string().min(1, 'Account code is required'),
  accountName: z.string().min(1, 'Account name is required'),
  accountType: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
  parentAccountId: z.string().optional().nullable(),
  openingBalance: z.number().optional(),
  isActive: z.boolean().optional(),
});

export const journalSchema = z.object({
  name: z.string().min(1, 'Journal name is required'),
  code: z.string().min(1, 'Journal code is required'),
  journalType: z.enum(['sales', 'purchase', 'cash', 'bank', 'general']),
  isActive: z.boolean().optional(),
});

export const analyticAccountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  responsiblePerson: z.string().optional().nullable(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
