import { z } from 'zod';
import { dateString, nonNegativeNumber, positiveNumber } from './commonValidators.js';

const salesOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: positiveNumber,
  discount: nonNegativeNumber.default(0)
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  orderDate: dateString.min(1, 'Order date is required').optional(),
  expectedDeliveryDate: dateString.optional(),
  items: z.array(salesOrderItemSchema).min(1, 'At least one item is required'),
  discount: nonNegativeNumber.default(0),
  notes: z.string().optional()
});

export const updateSalesOrderSchema = z.object({
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional()
});

export const recordPaymentSchema = z.object({
  amount: positiveNumber,
  paymentDate: dateString.optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});
