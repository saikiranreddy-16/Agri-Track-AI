import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { requestTimeout, xssClean } from './middleware/securityMiddleware.js';
import requestLogger from './middleware/requestLogger.js';
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
import aiRoutes from './ai/aiRoutes.js';
import aiAdminRoutes from './routes/aiAdminRoutes.js';
import hardwareRoutes from './routes/hardwareRoutes.js';
import farmRoutes from './routes/farmRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { getLiveness, getReadiness, getVersion, getMetrics, logFrontendCrash } from './controllers/healthController.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, 'logs');

// Ensure logs directory exists
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const app = express();

// Enable Trust Proxy to capture real client IPs behind Nginx
app.set('trust proxy', true);

// Mount request logger to trace performance timings
app.use(requestLogger);

// 1. Security Headers protection
app.use(helmet());

// 2. Response Compression
app.use(compression());

// 3. Enable CORS with credentials support (important for HTTP-only cookies)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 4. Request timeout protection
app.use(requestTimeout);

// 5. Request Body Parsers with configurable size limits
const payloadLimit = process.env.REQUEST_LIMIT || '2mb';
app.use(express.json({ limit: payloadLimit }));
app.use(express.urlencoded({ extended: true, limit: payloadLimit }));
app.use(cookieParser());

// 6. MongoDB query sanitization
app.use(mongoSanitize());

// 7. XSS sanitization
app.use(xssClean);

// 8. Request Logging (Morgan stream to server.log)
const accessLogStream = fs.createWriteStream(path.join(logDir, 'server.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: accessLogStream }));

// Log to console as well when in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// 9. Rate Limiting (Global with dynamic configuration)
const windowMin = Number(process.env.RATE_LIMIT_WINDOW) || 15;
const maxRequests = Number(process.env.RATE_LIMIT_MAX) || 100;
const rateLimiter = rateLimit({
  windowMs: windowMin * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    statusCode: 429
  },
});
app.use('/api', rateLimiter);

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
app.use('/api/v1/ai-admin', aiAdminRoutes);
app.use('/api/v1/hardware', hardwareRoutes);
app.use('/api/v1/farms', farmRoutes);
app.use('/api/v1/health', healthRoutes);

// Root level infrastructure status routes
app.get('/health', getLiveness);
app.get('/ready', getReadiness);
app.get('/version', getVersion);
app.get('/metrics', getMetrics);
app.post('/api/v1/log/frontend', logFrontendCrash);

// 10. Central Error Middleware Hooking
app.use(notFound);
app.use(errorHandler);

export default app;
