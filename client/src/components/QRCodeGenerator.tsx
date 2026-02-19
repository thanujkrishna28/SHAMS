import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-qr-code';
import api from '../api/axios';
import { Loader2, RefreshCw } from 'lucide-react';

interface QRCodeData {
    token: string;
    validUntil: string;
}

const QRCodeGenerator = () => {
    const [qrData, setQrData] = useState<QRCodeData | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(30);

    const fetchQR = async () => {
        const { data } = await api.get<QRCodeData>('/attendance/qr-code');
        setQrData(data);
        setTimeLeft(30);
        return data;
    };

    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['qr-code'],
        queryFn: fetchQR,
        staleTime: 0, // Always fetch new
        refetchInterval: 28000, // Refetch every 28s (before 30s expiry)
    });

    useEffect(() => {
        if (!qrData) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Refetch handled by react-query interval mostly, but explicit 0 can trigger
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [qrData]);

    return (
        <div className="flex flex-col items-center justify-center space-y-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm max-w-xs mx-auto">
            <div className="text-center space-y-1">
                <h3 className="font-bold text-gray-900">Secure Entry Pass</h3>
                <p className="text-xs text-gray-500">Scan at Gate / Turnstile</p>
            </div>

            <div className="relative p-4 bg-white rounded-xl border-2 border-dashed border-gray-200">
                {(isLoading || isFetching) && !qrData ? (
                    <div className="w-48 h-48 flex items-center justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    qrData && (
                        <div className="space-y-2">
                            <QRCode
                                value={qrData.token}
                                size={192} // 48 * 4
                                level="H"
                                className="w-48 h-48"
                            />
                        </div>
                    )
                )}

                {/* Security Overlay for Screenshot Protection (Visual only) */}
                <div className="absolute inset-0 pointer-events-none opacity-5 bg-repeat text-[8px] font-bold overflow-hidden select-none z-10 flex flex-wrap content-start justify-center">
                    {Array(50).fill('SECURE ').map((s, i) => <span key={i} className="-rotate-45 p-2">{s}</span>)}
                </div>
            </div>

            <div className="w-full space-y-2">
                <div className="flex justify-between items-center text-xs font-medium text-gray-500">
                    <span>Auto-refresh in</span>
                    <span className={`font-mono ${timeLeft < 5 ? 'text-red-500 font-bold' : 'text-primary'}`}>{timeLeft}s</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 5 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${(timeLeft / 30) * 100}%` }}
                    />
                </div>
            </div>

            <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="text-xs flex items-center gap-1.5 text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
            >
                <RefreshCw size={12} className={isFetching ? "animate-spin" : ""} />
                Force Refresh
            </button>
        </div>
    );
};

export default QRCodeGenerator;
