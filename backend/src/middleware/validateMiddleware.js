import { sendError } from '../utils/response.js';
import { ZodError } from 'zod';

export const validate = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const errors = error.issues.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      return sendError(res, 400, 'Validation Error', errors);
    }
    return sendError(res, 400, 'Invalid Request Data');
  }
};
