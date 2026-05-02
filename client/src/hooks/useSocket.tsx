import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Dynamically set socket URL based on API URL or fallback
const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:5000/api`;
const SOCKET_URL = API_URL.replace(/\/api$/, '');

// Robust notification sound using Web Audio API (No external assets, no 403s, no cache issues)
const playNotificationSound = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
        
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
        console.warn('🔇 Audio playback failed:', e);
    }
};

export const useSocket = () => {
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (user?._id && !socketRef.current) {
            console.log('🔌 Connecting to Socket Server:', SOCKET_URL);

            socketRef.current = io(SOCKET_URL, {
                reconnection: true,
                reconnectionAttempts: 5,
                reconnectionDelay: 2000,
                transports: ['websocket', 'polling'], // Allow fallback to polling if websocket fails
            });

            socketRef.current.on('connect', () => {
                console.log('✅ Socket Connected. User ID:', user._id);
                socketRef.current?.emit('join', user._id);
            });

            socketRef.current.on('notification', (notification: any) => {
                console.log('🔔 Notification Event:', notification);

                // Play Synthesized Sound
                playNotificationSound();

                // Show Notification
                toast.custom((t) => (
                    <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-zinc-900 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-white/10 border border-white/5`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5">
                                    <div className="h-10 w-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
                                        🔔
                                    </div>
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-bold text-gray-50">
                                        {notification.title}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-400 font-medium leading-relaxed">
                                        {notification.message}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex border-l border-white/10">
                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-semibold text-gray-400 hover:text-white transition-colors focus:outline-none"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ), { duration: 6000 });
            });

            socketRef.current.on('connect_error', (error) => {
                console.error('❌ Socket Connection Error:', error.message);
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?._id]);

    return socketRef.current;
};
