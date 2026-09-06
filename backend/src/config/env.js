import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/craftledger',
  JWT_SECRET: process.env.JWT_SECRET || 'fallback_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  PLATFORM_ADMIN_EMAIL: process.env.PLATFORM_ADMIN_EMAIL,
  PLATFORM_ADMIN_INITIAL_PASSWORD: process.env.PLATFORM_ADMIN_INITIAL_PASSWORD,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  GROQ_MODEL: process.env.GROQ_MODEL || 'qwen/qwen3.8-27b'
};
