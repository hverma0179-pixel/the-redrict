import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const standardHandler = (_req, res, _next, options) => {
  res.status(options.statusCode).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please wait a moment and try again.'
    }
  });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: standardHandler
});

export const analyzeLimiter = rateLimit({
  windowMs: env.ANALYZE_WINDOW_MS,
  limit: env.ANALYZE_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: standardHandler
});

export const authLimiter = rateLimit({
  windowMs: env.AUTH_WINDOW_MS,
  limit: env.AUTH_MAX_REQUESTS,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler: standardHandler
});
