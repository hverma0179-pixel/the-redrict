import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';

async function start() {
  await connectDatabase();

  const server = app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} received. Shutting down gracefully.`);
    server.close(() => process.exit(0));
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
