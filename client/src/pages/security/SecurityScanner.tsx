import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, User, Loader2, History } from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const SecurityScanner = () => {
    const [scanResult, setScanResult] = useState<any>(null);
    const [lastScans, setLastScans] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);

        function onScanSuccess(decodedText: string) {
            // We only want to process the scan if we're not currently loading a result
            if (!loading) {
                handleScan(decodedText);
            }
        }

        function onScanFailure() {
            // quiet error
        }

        return () => {
            scanner.clear().catch(err => console.error("Failed to clear scanner", err));
        };
    }, []);

    const handleScan = async (token: string) => {
        setLoading(true);
        try {
            // Get geolocation for gate-side validation
            const position: any = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            }).catch(() => null);

            const { data } = await api.post('/attendance/scan', {
                qrToken: token,
                location: 'Main Gate',
                coords: position ? {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                } : null
            });

            setScanResult(data);
            setLastScans(prev => [data, ...prev].slice(0, 5));
            toast.success(data.message);

            // Auto reset after 3s
            setTimeout(() => {
                setScanResult(null);
                setLoading(false);
            }, 3000);

        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Scan verification failed');
            setScanResult({ error: true, message: error.response?.data?.message || 'Invalid QR' });

            setTimeout(() => {
                setScanResult(null);
                setLoading(false);
            }, 3000);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-primary" />
                        Gate Security Terminal
                    </h1>
                    <p className="text-gray-500">Scanning at: <span className="font-medium text-gray-700">Main Gate</span></p>
                </div>
                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    SYSTEM LIVE
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Scanner Section */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                        <div id="reader" className="overflow-hidden rounded-2xl border-none"></div>

                        <AnimatePresence>
                            {(loading || scanResult) && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`absolute inset-0 flex flex-col items-center justify-center z-20 backdrop-blur-md ${scanResult?.error ? 'bg-red-50/90' : 'bg-white/90'}`}
                                >
                                    {loading && !scanResult && (
                                        <div className="text-center space-y-4">
                                            <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                                            <p className="font-bold text-gray-900">Verifying Identity...</p>
                                        </div>
                                    )}

                                    {scanResult && !scanResult.error && (
                                        <div className="text-center space-y-4 p-8">
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">{scanResult.student.name}</h2>
                                                <p className="text-green-600 font-bold uppercase tracking-widest text-sm">{scanResult.type} Approved</p>
                                            </div>
                                            <div className="bg-gray-50 px-4 py-2 rounded-xl text-sm text-gray-500">
                                                ID: {scanResult.student.id}
                                            </div>
                                        </div>
                                    )}

                                    {scanResult?.error && (
                                        <div className="text-center space-y-4 p-8">
                                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                                                <XCircle size={40} />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
                                                <p className="text-red-500 font-medium">{scanResult.message}</p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-full flex flex-col">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <History size={18} className="text-gray-400" />
                            Recent Movements
                        </h3>

                        <div className="flex-1 space-y-3 overflow-y-auto">
                            {lastScans.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                                    <User size={32} strokeWidth={1} />
                                    <p className="text-sm">No scans in this session</p>
                                </div>
                            ) : (
                                lastScans.map((scan, i) => (
                                    <motion.div
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        key={i}
                                        className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between border border-gray-100"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                                                <User size={18} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900">{scan.student.name}</p>
                                                <p className="text-[10px] text-gray-500">{new Date().toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${scan.type === 'Entry' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {scan.type}
                                        </span>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SecurityScanner;
