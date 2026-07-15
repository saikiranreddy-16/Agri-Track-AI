import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import machineRoutes from './routes/machineRoutes.js';
import driverRoutes from './routes/driverRoutes.js';
import fieldRoutes from './routes/fieldRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import gpsRoutes from './routes/gpsHistoryRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import deviceRoutes from './routes/deviceRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const app = express();

// 1. Security Headers protection
app.use(helmet());

// 2. Enable CORS with credentials support (important for HTTP-only cookies)
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 3. Response Compression
app.use(compression());

// 4. Request Logging (Morgan stream to server.log)
const accessLogStream = fs.createWriteStream(path.join(logDir, 'server.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

// Log to console as well when in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 5. Rate Limiting for Auth Routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again in 15 minutes.',
  },
});
app.use('/api/v1/auth', authLimiter);

// 6. Request Body Parsers & Cookie Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 7. Serve Static Uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 8. Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// 9. Mount Versioned API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/machines', machineRoutes);
app.use('/api/v1/drivers', driverRoutes);
app.use('/api/v1/fields', fieldRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/alerts', alertRoutes);
app.use('/api/v1/maintenance', maintenanceRoutes);
app.use('/api/v1/gps', gpsRoutes);
app.use('/api/v1/activity-logs', activityLogRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/devices', deviceRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/hardware', hardwareRoutes);
app.use('/api/v1/farms', farmRoutes);

// 10. Central Error Middleware Hooking
app.use(notFound);
app.use(errorHandler);

export default app;
