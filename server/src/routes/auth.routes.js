import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import validator from 'validator';
import { env } from '../config/env.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { requireAuth } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

const router = Router();

function createToken(user) {
  return jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN
  });
}

function normalizeEmail(email) {
  return validator.normalizeEmail(email || '', {
    gmail_remove_dots: false,
    gmail_remove_subaddress: false
  });
}

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const name = validator.escape(String(req.body?.name || 'Analyzer User').trim()).slice(0, 80);
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !validator.isEmail(email)) {
      throw new AppError('Enter a valid email address.', 400, 'INVALID_EMAIL');
    }

    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters.', 400, 'WEAK_PASSWORD');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    const token = createToken(user);

    res.status(201).json({ data: { token, user: user.toProfile() } });
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const email = normalizeEmail(req.body?.email);
    const password = String(req.body?.password || '');

    if (!email || !validator.isEmail(email) || !password) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    const token = createToken(user);
    res.json({ data: { token, user: user.toProfile() } });
  })
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ data: { user: req.user.toProfile() } });
  })
);

export default router;
