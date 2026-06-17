import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { dbState } from '../config/db.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

async function attachUserFromToken(req) {
  const header = req.get('authorization') || '';
  const [scheme, token] = header.split(' ');

  if (!token) {
    return null;
  }

  if (!dbState.connected) {
    throw new AppError('Database is not configured. Login and history are unavailable.', 503, 'DATABASE_UNAVAILABLE');
  }

  if (scheme !== 'Bearer') {
    throw new AppError('Use Bearer token authentication.', 401, 'INVALID_AUTH_SCHEME');
  }

  let payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET);
  } catch {
    throw new AppError('Your session is invalid or expired.', 401, 'INVALID_TOKEN');
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    throw new AppError('User account was not found.', 401, 'USER_NOT_FOUND');
  }

  req.user = user;
  return user;
}

export async function optionalAuth(req, _res, next) {
  try {
    await attachUserFromToken(req);
    next();
  } catch (error) {
    next(error);
  }
}

export async function requireAuth(req, _res, next) {
  try {
    if (!dbState.connected) {
      throw new AppError('Database is not configured. Login and history are unavailable.', 503, 'DATABASE_UNAVAILABLE');
    }

    const user = await attachUserFromToken(req);
    if (!user) {
      throw new AppError('Authentication is required.', 401, 'AUTH_REQUIRED');
    }
    next();
  } catch (error) {
    next(error);
  }
}
