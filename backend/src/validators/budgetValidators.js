import { z } from 'zod';
import { dateString, nonNegativeNumber } from './commonValidators.js';

export const createBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required'),
  analyticAccountId: z.string().optional(),
  periodStart: dateString.min(1, 'Period start date is required'),
  periodEnd: dateString.min(1, 'Period end date is required'),
  plannedAmount: nonNegativeNumber,
  responsiblePerson: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional()
}).refine(data => new Date(data.periodEnd) >= new Date(data.periodStart), {
  message: 'Period end must be on or after period start', path: ['periodEnd']
});

export const updateBudgetSchema = z.object({
  name: z.string().optional(),
  analyticAccountId: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  plannedAmount: nonNegativeNumber.optional(),
  responsiblePerson: z.string().optional(),
  status: z.enum(['draft', 'active', 'closed']).optional()
});
