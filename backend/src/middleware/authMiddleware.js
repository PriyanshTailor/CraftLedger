import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import User from '../models/User.js';
import { sendError } from '../utils/response.js';

export const authenticateUser = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      const decoded = jwt.verify(token, env.JWT_SECRET);
      
      // Look up user from DB to ensure they still exist and are active
      req.user = await User.findById(decoded.id).select('-passwordHash');
      
      if (!req.user) {
        return sendError(res, 401, 'Not authorized, user not found');
      }
      
      if (!req.user.isActive || req.user.isArchived) {
        return sendError(res, 403, 'User account is deactivated or archived');
      }

      // Add populated properties useful for downstream middleware
      // (req.user is already a mongoose document, we could populate but it's fine as is)
      next();
    } catch (error) {
      return sendError(res, 401, 'Not authorized, token failed');
    }
  } else {
    return sendError(res, 401, 'Not authorized, no token');
  }
};
