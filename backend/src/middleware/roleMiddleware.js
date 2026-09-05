import { sendError } from '../utils/response.js';
import { ROLE_PERMISSIONS } from '../config/permissions.js';

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 403, 'Authentication required');
    }
    
    if (!roles.includes(req.user.role)) {
      return sendError(res, 403, 'You do not have permission to perform this action');
    }
    
    next();
  };
};

export const authorizePermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 403, 'Authentication required');
    }
    
    const userPermissions = ROLE_PERMISSIONS[req.user.role] || [];
    
    // Check if user has ALL required permissions
    const hasAllPermissions = permissions.every(p => userPermissions.includes(p));
    
    if (!hasAllPermissions) {
      return sendError(res, 403, 'You do not have permission to perform this action');
    }
    
    next();
  };
};
