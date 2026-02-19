import { createServer } from 'http';
import app from './app';
import connectDB from './config/db';
import dotenv from 'dotenv';
import { initSocket } from './utils/socket';

dotenv.config();

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

// Connect Database
connectDB();

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});