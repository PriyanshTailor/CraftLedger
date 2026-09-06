import { z } from 'zod';

const salesOrderItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().min(0.01, 'Quantity must be at least 0.01'),
  discount: z.number().min(0, 'Discount cannot be negative').default(0)
});

export const createSalesOrderSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  orderDate: z.string().min(1, 'Order date is required').optional(),
  expectedDeliveryDate: z.string().optional(),
  items: z.array(salesOrderItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0, 'Order discount cannot be negative').default(0),
  notes: z.string().optional()
});

export const updateSalesOrderSchema = z.object({
  expectedDeliveryDate: z.string().optional(),
  notes: z.string().optional()
});

export const recordPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  paymentDate: z.string().optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});
