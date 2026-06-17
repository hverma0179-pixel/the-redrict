import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { SearchHistory } from '../models/SearchHistory.js';
import { asyncHandler } from '../utils/AppError.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const history = await SearchHistory.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ data: history });
  })
);

router.delete(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    await SearchHistory.deleteMany({ user: req.user._id });
    res.status(204).end();
  })
);

export default router;
