import { z } from 'zod';
import { nonNegativeNumber } from './commonValidators.js';

export const journalEntryLineSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  debit: nonNegativeNumber.default(0),
  credit: nonNegativeNumber.default(0),
  description: z.string().optional()
}).refine(data => !(data.debit > 0 && data.credit > 0), {
  message: "A single line cannot have both debit and credit amounts",
  path: ['debit'] // Path to attach error
});

export const createJournalEntrySchema = z.object({
  entryDate: z.string().optional(),
  journalId: z.string().min(1, 'Journal ID is required'),
  description: z.string().min(1, 'Description is required'),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  lines: z.array(journalEntryLineSchema).min(2, 'At least two lines are required for a double-entry')
});
