import dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import { initSocket } from './utils/socket';
import { startEscalationCron } from './utils/cronJobs';

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Connect Database
connectDB();

// Initialize Socket.io
initSocket(httpServer);

// Start Background Jobs
startEscalationCron();

// Start the server
httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;