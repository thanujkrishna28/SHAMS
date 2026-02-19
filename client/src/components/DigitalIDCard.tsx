import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Loader2, RefreshCw, ShieldCheck, Wifi } from 'lucide-react';

interface QRCodeData {
    token: string;
    validUntil: string;
}

const DigitalIDCard = () => {
    const { user } = useAuthStore();
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const [isFlipped, setIsFlipped] = useState(false);

    const fetchQR = async () => {
        const { data } = await api.get<QRCodeData>('/attendance/qr-code');
        setQrData(data);
        setTimeLeft(30);
        return data;
    };

    const { isLoading, isFetching, refetch } = useQuery({
        queryKey: ['qr-code'],
        queryFn: fetchQR,
        refetchInterval: 28000,
        staleTime: 0,
    });

    useEffect(() => {
        if (!qrData) return;
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev <= 0 ? 0 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [qrData]);

    return (
        <div className="w-full max-w-sm mx-auto h-[500px]" style={{ perspective: '1000px' }}>
            <motion.div
                className="relative w-full h-full transition-all duration-500 cursor-pointer"
                style={{ transformStyle: 'preserve-3d' }}
                onClick={() => setIsFlipped(!isFlipped)}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* FRONT OF CARD (ID Details) */}
                <div className="absolute inset-0 w-full h-full" style={{ backfaceVisibility: 'hidden' }}>
                    <div className="h-full w-full rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-900 via-violet-900 to-fuchsia-900 text-white relative border-[1px] border-white/10">
                        {/* Decorative Patterns */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                        {/* Header */}
                        <div className="relative z-10 p-6 flex justify-between items-start">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl border border-white/10">
                                    <ShieldCheck size={24} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-indigo-200 tracking-wider uppercase">Official Student ID</p>
                                    <p className="font-bold text-lg leading-tight">Smart HMS</p>
                                </div>
                            </div>
                            <Wifi size={20} className="text-white/30 animate-pulse" />
                        </div>

                        {/* Photo & Main Info */}
                        <div className="relative z-10 flex flex-col items-center mt-4">
                            <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-tr from-emerald-400 to-indigo-500 shadow-lg mb-4 relative group">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-900 bg-slate-800">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${user?.name}&background=random&size=256`}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-4 border-slate-900 text-white shadow-sm">
                                    <ShieldCheck size={14} fill="currentColor" />
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-center px-4">{user?.name}</h2>
                            <p className="text-indigo-200 font-mono text-sm mt-1">{user?.profile?.studentId || 'ID: Pending'}</p>

                            <div className="flex gap-2 mt-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${user?.profile?.isInside ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300' : 'bg-amber-500/20 border-amber-500/30 text-amber-300'}`}>
                                    {user?.profile?.isInside ? 'ON CAMPUS' : 'OFF CAMPUS'}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/10 text-indigo-100">
                                    {user?.profile?.course || 'Student'}
                                </span>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Valid Until</p>
                                    <p className="font-mono text-lg text-emerald-400">DEC 2025</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 animate-pulse">Tap to view QR Code</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BACK OF CARD (QR Code) */}
                <div
                    className="absolute inset-0 w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-white relative border-[1px] border-gray-200"
                    style={{ transform: "rotateY(180deg)", backfaceVisibility: 'hidden' }}
                >
                    <div className="h-full w-full flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-50 via-white to-gray-100">
                        <div className="text-center mb-6">
                            <h3 className="font-bold text-xl text-gray-900">Scan for Entry</h3>
                            <p className="text-sm text-gray-500">Show this code at the turnstile</p>
                        </div>

                        <div className="relative p-6 bg-white rounded-3xl shadow-xl shadow-indigo-100 border border-indigo-50 mb-8 max-w-[260px] max-h-[260px]">
                            {/* Corner Accents */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-xl"></div>

                            {(isLoading || isFetching) && !qrData ? (
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                                </div>
                            ) : (
                                qrData && (
                                    <div className="mix-blend-multiply">
                                        <QRCode
                                            value={qrData.token}
                                            size={200}
                                            level="H" // High error correction
                                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                        />
                                    </div>
                                )
                            )}
                        </div>

                        <div className="w-full space-y-3 px-4">
                            <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-gray-400">
                                <span>Expiring in</span>
                                <span className={timeLeft < 10 ? 'text-red-500' : 'text-emerald-500'}>{timeLeft}s</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-emerald-400 to-indigo-500"
                                    initial={{ width: "100%" }}
                                    animate={{ width: `${(timeLeft / 30) * 100}%` }}
                                    transition={{ ease: "linear", duration: 1 }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={(e) => { e.stopPropagation(); refetch(); }}
                            className="mt-6 flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                        >
                            <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                            Regenerate Code
                        </button>

                        <p className="absolute bottom-6 text-xs text-gray-400">Tap card to flip back</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default DigitalIDCard;
