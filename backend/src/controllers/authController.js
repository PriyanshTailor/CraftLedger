import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Business from '../models/Business.js';
import { env } from '../config/env.js';
import { ROLES, normalizeRole } from '../config/roles.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Generate JWT with full payload
const generateToken = (user) => {
  return jwt.sign({
    id:         user._id,
    role:       user.role,
    businessId: user.businessId?._id || user.businessId || null,
    contactId:  user.contactId  || null,
    email:      user.email
  }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
};

// Public self-registration has been removed. Accounts are created through the
// appropriate platform/business-owner workflow or a contact invitation.
export const register = async (req, res, next) => {
  return sendError(res, 403, 'Public registration is not available. Please use an invitation from your business.');
};

// ─── LOGIN ─────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Populate businessId for business users
    const user = await User.findOne({ email })
      .populate('businessId', 'businessName currency logo')
      .populate('contactId', 'contactType');

    if (!user || !(await user.matchPassword(password))) {
      return sendError(res, 401, 'Invalid email or password');
    }

    if (!user.isActive || user.isArchived) {
      return sendError(res, 403, 'This account is inactive or has been archived');
    }

    // Migrate accounts created by previous versions before saving the login
    // timestamp. Without this, Mongoose rejects a legacy "admin" role during
    // save and turns a valid login into a 500 response.
    const normalizedRole = normalizeRole(user.role);
    if (normalizedRole !== user.role) user.role = normalizedRole;
    user.lastLoginAt = Date.now();
    await user.save();

    const token = generateToken(user);

    return sendSuccess(res, 200, 'Login successful', {
      user: {
        _id:        user._id,
        name:       user.name,
        email:      user.email,
        role:       user.role,
        businessId: user.businessId?._id || null,
        contactId:  user.contactId?._id || user.contactId || null,
        contactType: user.contactId?.contactType || null,
        permissions: user.permissions || [],
      },
      business: user.businessId || null,
      token
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {
  return sendSuccess(res, 200, 'Logged out successfully');
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-passwordHash -resetPasswordToken -resetPasswordExpire')
      .populate('businessId');
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return sendSuccess(res, 200, 'If that email is registered, a reset link has been sent');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken  = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${resetToken}`;
    return sendSuccess(res, 200, 'Password reset token generated', { resetUrl, resetToken });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    if (!user) return sendError(res, 400, 'Invalid or expired token');

    user.passwordHash        = req.body.password;
    user.resetPasswordToken  = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return sendSuccess(res, 200, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};
