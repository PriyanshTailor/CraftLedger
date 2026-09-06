import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER));

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50, businessId } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Platform admin can see all businesses or filter by query, business owner sees their own
    const filter = {};
    if (req.user.role === ROLES.PLATFORM_ADMIN) {
      if (businessId) filter.businessId = businessId;
    } else {
      filter.businessId = req.user.businessId;
    }

    const rawLogs = await AuditLog.find(filter)
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email role')
      .populate('businessId', 'businessName');

    const total = await AuditLog.countDocuments(filter);

    // Format logs so both module/description and entity/details are populated for frontend
    const logs = rawLogs.map(l => {
      const obj = l.toObject();
      return {
        ...obj,
        entity: obj.module || 'System',
        details: obj.description || (obj.businessId?.businessName ? `Tenant: ${obj.businessId.businessName}` : '—')
      };
    });

    return sendSuccess(res, 200, 'Audit logs retrieved', {
      logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit))
    });
  } catch (e) { next(e); }
});

export default router;
