import { z } from 'zod';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  analyticAccountId: z.string().optional(),
  periodStart: z.string().min(1, 'Period start date is required'),
  periodEnd: z.string().min(1, 'Period end date is required'),
  plannedAmount: z.number().min(0, 'Planned amount cannot be negative'),
  responsiblePerson: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional()
});

export const updateBudgetSchema = z.object({
  name: z.string().optional(),
  analyticAccountId: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  plannedAmount: z.number().min(0).optional(),
  responsiblePerson: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional()
});
