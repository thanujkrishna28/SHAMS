import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

const app = express();

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development to allow external sound/socket
}));
app.use(mongoSanitize());
app.use(hpp());

// CORS Config
app.use(cors());

// Body Parser
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
app.use(morgan('dev'));

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter); // Apply to all API routes

// Routes
import authRoutes from './routes/authRoutes';
import roomRoutes from './routes/roomRoutes';
import announcementRoutes from './routes/announcementRoutes';
import allocationRoutes from './routes/allocationRoutes';
import attendanceRoutes from './routes/attendanceRoutes';
import complaintRoutes from './routes/complaintRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import leaveRoutes from './routes/leaveRoutes';
import notificationRoutes from './routes/notificationRoutes';
import visitorRoutes from './routes/visitorRoutes';
import reportRoutes from './routes/reportRoutes';
import messRoutes from './routes/messRoutes';
import settingsRoutes from './routes/settingsRoutes';
import feeRoutes from './routes/feeRoutes';

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/fees', feeRoutes);

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
});

export default app;
