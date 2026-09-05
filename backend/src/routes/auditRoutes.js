import express from 'express';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../config/roles.js';
import AuditLog from '../models/AuditLog.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.BUSINESS_OWNER));

router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const logs = await AuditLog.find({ businessId: req.user.businessId })
      .sort('-createdAt')
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'name email role');
    
    const total = await AuditLog.countDocuments({ businessId: req.user.businessId });

    return sendSuccess(res, 200, 'Audit logs retrieved', {
      logs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit))
    });
  } catch (e) { next(e); }
});

export default router;
