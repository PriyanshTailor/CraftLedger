import { sendError } from '../utils/response.js';

export const requireBusinessAccess = (req, res, next) => {
  if (!req.user || !req.user.businessId) {
    return sendError(res, 401, 'Authentication required');
  }

  // Force all queries to be scoped by businessId globally
  // We can attach it to req.businessQuery to use in controllers
  req.businessQuery = { businessId: req.user.businessId };
  
  // Also validate body for creations
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (req.body.businessId && req.body.businessId.toString() !== req.user.businessId.toString()) {
      return sendError(res, 403, 'Not authorized to create records for another business');
    }
    // Enforce businessId in body to prevent cross-tenant writes
    req.body.businessId = req.user.businessId;
  }
  
  next();
};

export const requireContactOwnership = (req, res, next) => {
  if (!req.user) {
    return sendError(res, 401, 'Authentication required');
  }

  // If the user is a CONTACT, strictly enforce contactId query filtering
  if (req.user.role === 'contact') {
    if (!req.user.contactId) {
      return sendError(res, 403, 'Contact user missing linked contact reference');
    }
    
    // Merge into the global business query so everything is isolated
    if (!req.businessQuery) req.businessQuery = { businessId: req.user.businessId };
    req.businessQuery.contactId = req.user.contactId;

    // Prevent body overrides
    if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
      req.body.contactId = req.user.contactId;
    }
  }

  next();
};
