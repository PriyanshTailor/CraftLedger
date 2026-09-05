import express from 'express';
import { validate } from '../middleware/validateMiddleware.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { 
  register, 
  login, 
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { 
  registerSchema, 
  loginSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);

// Protected routes
router.get('/me', authenticateUser, getMe);

export default router;
