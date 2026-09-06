import { z } from 'zod';

export const finiteNumber = z.number().finite('Must be a finite number');
export const nonNegativeNumber = finiteNumber.min(0, 'Cannot be negative');
export const positiveNumber = finiteNumber.gt(0, 'Must be greater than 0');
export const dateString = z.string().refine(value => !Number.isNaN(Date.parse(value)), 'Must be a valid date');
