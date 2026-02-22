import express from 'express';
import cors from 'cors';
import path from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

const app = express();

// Trust proxy for rate limiting (Render/Vercel)
app.set('trust proxy', 1);

// Health check route
app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'Smart HMS API is running' });
});

// Security Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development to allow external sound/socket
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(mongoSanitize());
app.use(hpp());

// CORS Config
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'https://shams-green.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.0.101:5173'
].filter(Boolean) as string[];

app.use(cors({
    origin: (origin, callback) => {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const isLocal = origin.startsWith('http://localhost') ||
            origin.startsWith('http://127.0.0.1') ||
            origin.startsWith('http://192.168.') ||
            origin.startsWith('http://10.') ||
            origin.startsWith('http://172.');

        const isAllowedExplicitly = allowedOrigins.indexOf(origin) !== -1;

        if (isAllowedExplicitly || isLocal) {
            return callback(null, true);
        } else {
            console.error(`CORS Blocked for origin: ${origin}`);
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
}));

// Body Parser
app.use(express.json({ limit: '10kb' })); // Body limit
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
app.use(morgan('dev'));

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 10000, // High limit for dev
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
import hostelRoutes from './routes/hostelRoutes';
import blockRoutes from './routes/blockRoutes';

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
app.use('/api/hostels', hostelRoutes);
app.use('/api/blocks', blockRoutes);

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
