import { z } from 'zod';
import { dateString, positiveNumber } from './commonValidators.js';

const purchaseOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: positiveNumber
});

export const createPurchaseOrderSchema = z.object({
  vendorId: z.string().min(1, 'Vendor ID is required'),
  orderDate: dateString.min(1, 'Order date is required').optional(),
  expectedDeliveryDate: dateString.optional(),
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
    quantityToReceive: positiveNumber
  })).min(1, 'At least one item is required to receive')
});

export const recordVendorPaymentSchema = z.object({
  amount: positiveNumber,
  paymentDate: dateString.optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});
