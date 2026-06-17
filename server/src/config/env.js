import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: toNumber(process.env.PORT, 4000),
  MONGO_URI: process.env.MONGO_URI || '',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'development-only-secret-change-before-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  MAX_REDIRECTS: toNumber(process.env.MAX_REDIRECTS, 10),
  REQUEST_TIMEOUT_MS: toNumber(process.env.REQUEST_TIMEOUT_MS, 8000),
  ANALYZE_WINDOW_MS: toNumber(process.env.ANALYZE_WINDOW_MS, 15 * 60 * 1000),
  ANALYZE_MAX_REQUESTS: toNumber(process.env.ANALYZE_MAX_REQUESTS, 30),
  AUTH_WINDOW_MS: toNumber(process.env.AUTH_WINDOW_MS, 15 * 60 * 1000),
  AUTH_MAX_REQUESTS: toNumber(process.env.AUTH_MAX_REQUESTS, 12)
};

if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters in production.');
}
