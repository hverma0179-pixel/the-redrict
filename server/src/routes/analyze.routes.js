import { Router } from 'express';
import { analyzeLimiter } from '../middleware/rateLimiters.js';
import { optionalAuth } from '../middleware/auth.js';
import { SearchHistory } from '../models/SearchHistory.js';
import { analyzeRedirectChain } from '../services/redirectAnalyzer.js';
import { AppError, asyncHandler } from '../utils/AppError.js';

const router = Router();

router.post(
  '/',
  analyzeLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { url } = req.body || {};

    if (typeof url !== 'string') {
      throw new AppError('A URL string is required.', 400, 'URL_REQUIRED');
    }

    const result = await analyzeRedirectChain(url);

    if (req.user) {
      await SearchHistory.create({
        user: req.user._id,
        originalUrl: result.originalUrl,
        finalUrl: result.finalUrl,
        finalStatusCode: result.finalStatusCode,
        redirectCount: result.redirectCount,
        responseTimeMs: result.responseTimeMs,
        provider: result.domainInfo.detectedProvider,
        chain: result.chain,
        domainInfo: result.domainInfo
      });
    }

    res.json({ data: result });
  })
);

export default router;
