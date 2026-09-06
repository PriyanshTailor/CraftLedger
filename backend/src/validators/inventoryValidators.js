import { z } from 'zod';
import { dateString, nonNegativeNumber, positiveNumber } from './commonValidators.js';

export const inventoryAdjustmentSchema = z.object({
  date: dateString.optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    adjustmentType: z.enum(['increase', 'decrease']),
    quantity: positiveNumber,
    unitCost: nonNegativeNumber,
    reason: z.string().min(1, 'Reason is required')
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  status: z.enum(['draft', 'approved']).optional()
});
