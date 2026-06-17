import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  if (!env.MONGO_URI) {
    throw new Error('MONGO_URI is required. Set it in server/.env.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });
}
