import mongoose from 'mongoose';
import { env } from './env.js';

export const dbState = {
  connected: false
};

export async function connectDatabase() {
  if (!env.MONGO_URI) {
    console.warn('MONGO_URI is not set. Auth and history are disabled until MongoDB is configured.');
    return false;
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000
  });

  dbState.connected = true;
  return true;
}
