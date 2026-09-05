import { z } from 'zod';

const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be at least 0.01')
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
  notes: z.string().optional()
});

export const updatePurchaseOrderSchema = z.object({
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional()
});

export const receiveProductsSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantityToReceive: z.number().min(0.01, 'Must receive at least 0.01')
  })).min(1, 'At least one item is required to receive')
});

export const recordVendorPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});
