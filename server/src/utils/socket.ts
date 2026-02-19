import { Server as SocketServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketServer;

export const initSocket = (server: HttpServer) => {
    io = new SocketServer(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`[Socket] New connection: ${socket.id}`);

        socket.on('join', (userId: string) => {
            if (userId) {
                socket.join(userId);
                console.log(`[Socket] User ${userId} joined room`);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`[Socket] Disconnected: ${socket.id} (${reason})`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

export const emitNotification = (userId: string, notification: any) => {
    if (io) {
        console.log(`[Socket] Emitting notification to user ${userId}:`, notification.title);
        io.to(userId).emit('notification', notification);
    } else {
        console.warn('[Socket] Cannot emit: IO not initialized');
    }
};
