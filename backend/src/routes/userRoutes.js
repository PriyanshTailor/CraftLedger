import express from 'express';
import { z } from 'zod';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { ROLES, CAN_CREATE } from '../config/roles.js';
import { sendSuccess, sendError } from '../utils/response.js';

const router = express.Router();
router.use(authenticateUser);

// ─── PLATFORM ADMIN: create a Business Owner ──────────────────────────────────
router.post(
  '/create-business-owner',
  authorizeRoles(ROLES.PLATFORM_ADMIN),
  validate(z.object({
    name:         z.string().min(2),
    email:        z.string().email(),
    password:     z.string().min(6),
    businessName: z.string().min(2),
  })),
  async (req, res, next) => {
    try {
      const { name, email, password, businessName } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return sendError(res, 400, 'Email already registered');

      // Create their Business
      const business = await Business.create({ businessName, email });

      // Create the Business Owner user
      const user = await User.create({
        name, email,
        passwordHash: password,
        role:        ROLES.BUSINESS_OWNER,
        businessId:  business._id,
        createdBy:   req.user.id,
      });

      business.createdBy = user._id;
      await business.save();

      return sendSuccess(res, 201, 'Business Owner created', {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
        business: { _id: business._id, businessName: business.businessName }
      });
    } catch (e) { next(e); }
  }
);

// ─── BUSINESS OWNER: create an Accountant ─────────────────────────────────────
router.post(
  '/create-accountant',
  authorizeRoles(ROLES.BUSINESS_OWNER),
  validate(z.object({
    name:     z.string().min(2),
    email:    z.string().email(),
    password: z.string().min(6),
  })),
  async (req, res, next) => {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) return sendError(res, 400, 'Email already registered');

      const user = await User.create({
        name, email,
        passwordHash: password,
        role:        ROLES.ACCOUNTANT,
        businessId:  req.user.businessId,
        createdBy:   req.user.id,
      });

      return sendSuccess(res, 201, 'Accountant created', {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } catch (e) { next(e); }
  }
);

// ─── BUSINESS OWNER: list users in their business ─────────────────────────────
router.get(
  '/',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER),
  async (req, res, next) => {
    try {
      const filter = req.user.role === ROLES.PLATFORM_ADMIN
        ? { isArchived: false }
        : { businessId: req.user.businessId, isArchived: false };

      const users = await User.find(filter)
        .select('-passwordHash -resetPasswordToken -resetPasswordExpire')
        .sort('-createdAt');

      return sendSuccess(res, 200, 'Users retrieved', { users });
    } catch (e) { next(e); }
  }
);

// ─── GET single user ───────────────────────────────────────────────────────────
router.get(
  '/:id',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER),
  async (req, res, next) => {
    try {
      const filter = req.user.role === ROLES.PLATFORM_ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, businessId: req.user.businessId };

      const user = await User.findOne(filter).select('-passwordHash -resetPasswordToken -resetPasswordExpire');
      if (!user) return sendError(res, 404, 'User not found');
      return sendSuccess(res, 200, 'User retrieved', { user });
    } catch (e) { next(e); }
  }
);

// ─── PATCH: update active status ──────────────────────────────────────────────
router.patch(
  '/:id',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER),
  async (req, res, next) => {
    try {
      const { name, isActive } = req.body;
      const filter = req.user.role === ROLES.PLATFORM_ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, businessId: req.user.businessId };

      const user = await User.findOneAndUpdate(filter, { name, isActive }, { new: true })
        .select('-passwordHash');
      if (!user) return sendError(res, 404, 'User not found');
      return sendSuccess(res, 200, 'User updated', { user });
    } catch (e) { next(e); }
  }
);

// ─── PATCH: archive user ──────────────────────────────────────────────────────
router.patch(
  '/:id/archive',
  authorizeRoles(ROLES.PLATFORM_ADMIN, ROLES.BUSINESS_OWNER),
  async (req, res, next) => {
    try {
      if (req.params.id === req.user.id.toString()) {
        return sendError(res, 400, 'You cannot archive your own account');
      }
      const filter = req.user.role === ROLES.PLATFORM_ADMIN
        ? { _id: req.params.id }
        : { _id: req.params.id, businessId: req.user.businessId };

      const user = await User.findOneAndUpdate(
        filter,
        { isArchived: true, isActive: false },
        { new: true }
      ).select('-passwordHash');
      if (!user) return sendError(res, 404, 'User not found');
      return sendSuccess(res, 200, 'User archived', { user });
    } catch (e) { next(e); }
  }
);

export default router;
