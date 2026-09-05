import { z } from 'zod';

export const inventoryAdjustmentSchema = z.object({
  date: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Product ID is required'),
    adjustmentType: z.enum(['increase', 'decrease']),
    quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
    unitCost: z.number().min(0, 'Unit cost must be non-negative'),
    reason: z.string().min(1, 'Reason is required')
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
  status: z.enum(['draft', 'approved']).optional()
});
