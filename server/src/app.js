import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import { env } from './config/env.js';
import analyzeRoutes from './routes/analyze.routes.js';
import authRoutes from './routes/auth.routes.js';
import historyRoutes from './routes/history.routes.js';
import { globalLimiter } from './middleware/rateLimiters.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { AppError } from './utils/AppError.js';

const app = express();
const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);

app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin && env.NODE_ENV !== 'production') {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError('CORS origin is not allowed.', 403, 'CORS_BLOCKED'));
    },
    credentials: false,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '20kb' }));
app.use(mongoSanitize());
app.use(hpp());
app.use(globalLimiter);

app.get('/api/health', (_req, res) => {
  res.json({ data: { status: 'ok', service: 'url-redirect-analyzer' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/history', historyRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
