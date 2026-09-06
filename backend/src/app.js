import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import masterDataRoutes from './routes/masterDataRoutes.js';
import salesRoutes from './routes/salesRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import accountingRoutes from './routes/accountingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import intelligenceRoutes from './routes/intelligenceRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import userRoutes from './routes/userRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import contactPortalRoutes from './routes/contactPortalRoutes.js';

const app = express();

// Security Middleware
app.use(helmet());

// CORS Configuration
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.NODE_ENV === 'development' ? 10000 : 1000, // Generous limit so dashboard and data loading never hit 429
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    errors: []
  }
});
app.use('/api', limiter);

// Request Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const API_PREFIX = '/api/v1';
app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/sales`, salesRoutes);
app.use(`${API_PREFIX}/purchases`, purchaseRoutes);
app.use(`${API_PREFIX}/inventory`, inventoryRoutes);
app.use(`${API_PREFIX}/accounting`, accountingRoutes);
app.use(`${API_PREFIX}/payments`, paymentRoutes);
app.use(`${API_PREFIX}/budgets`, budgetRoutes);
app.use(`${API_PREFIX}/reports`, reportRoutes);
app.use(`${API_PREFIX}/intelligence`, intelligenceRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/audit-logs`, auditRoutes);
app.use(`${API_PREFIX}/contact`, contactPortalRoutes);
app.use(API_PREFIX, masterDataRoutes);

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

export default app;
