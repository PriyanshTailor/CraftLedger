import { z } from 'zod';
import { dateString, positiveNumber } from './commonValidators.js';

export const customerPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice ID is required'),
  amount: positiveNumber,
  paymentDate: dateString.optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});

export const vendorPaymentSchema = z.object({
  billId: z.string().min(1, 'Bill ID is required'),
  amount: positiveNumber,
  paymentDate: dateString.optional(),
  paymentMethod: z.enum(['cash', 'bank_transfer', 'UPI', 'cheque', 'card', 'other']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional()
});
