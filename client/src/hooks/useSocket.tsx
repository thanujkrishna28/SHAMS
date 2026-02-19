import React, { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Use host instead of hostname to includes port if necessary, but here we explicitly use 5000
const SOCKET_URL = `http://${window.location.hostname}:5000`;

// Robust notification sound (Standard ping)
const SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

export const useSocket = () => {
    const { user } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioUnlocked = useRef(false);

    useEffect(() => {
        // Initialize audio
        const audio = new Audio(SOUND_URL);
        audio.preload = 'auto';
        audio.volume = 0.5;
        audioRef.current = audio;

        const unlockAudio = () => {
            if (audioRef.current && !audioUnlocked.current) {
                audioRef.current.play()
                    .then(() => {
                        audioRef.current?.pause();
                        if (audioRef.current) audioRef.current.currentTime = 0;
                        audioUnlocked.current = true;
                        console.log('✅ Socket Audio Unlocked');
                        window.removeEventListener('click', unlockAudio);
                        window.removeEventListener('touchstart', unlockAudio);
                    })
                    .catch(e => console.warn('🔇 Audio unlock failed:', e));
            }
        };

        window.addEventListener('click', unlockAudio);
        window.addEventListener('touchstart', unlockAudio);

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

                // Play Sound
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    audioRef.current.play().catch(e => console.warn('🔇 Playback blocked', e));
                }

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
            window.removeEventListener('click', unlockAudio);
            window.removeEventListener('touchstart', unlockAudio);
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?._id]);

    return socketRef.current;
};
