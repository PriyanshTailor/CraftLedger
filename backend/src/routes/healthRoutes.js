import express from 'express';
import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { sendSuccess } from '../utils/response.js';

const router = express.Router();

router.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  sendSuccess(res, 200, 'API is running successfully', {
    status: 'up',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: dbStatus
  });
});

export default router;
