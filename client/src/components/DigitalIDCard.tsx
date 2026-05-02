import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'react-qr-code';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';
import { Loader2, RefreshCw, ShieldCheck, Wifi } from 'lucide-react';

import { getImageUrl } from '../utils/imageUtils';

interface QRCodeData {
    token: string;
    validUntil: string;
}

const DigitalIDCard = () => {
    const { user } = useAuthStore();

    return (
        <div className="w-full max-w-sm mx-auto h-[500px]">
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
                                src={getImageUrl(user?.profile?.profileImage)}
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
                            {user?.profile?.isInside ? 'PRESENT' : 'ABSENT'}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 border border-white/10 text-indigo-100">
                            {user?.profile?.course || 'Student'}
                        </span>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="absolute bottom-12 w-full px-6 z-10">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-widest mb-1">Block</p>
                            <p className="font-bold text-sm">{user?.profile?.block || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-indigo-300 uppercase tracking-widest mb-1">Room</p>
                            <p className="font-bold text-sm">{user?.profile?.roomNumber || 'N/A'}</p>
                        </div>
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
                            <p className="text-[10px] text-gray-400">Night Attendance Enabled</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalIDCard;
