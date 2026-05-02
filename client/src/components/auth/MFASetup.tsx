import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Smartphone, CheckCircle2, XCircle, Loader2, Copy, RefreshCw, Key } from 'lucide-react';
import toast from 'react-hot-toast';

interface MFASetupProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onCancel }) => {
    const [step, setStep] = useState(1);
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);

    const generateMFA = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.post('/auth/mfa/generate');
            setQrCode(data.qrCodeUrl);
            setSecret(data.secret);
            setIsLoading(false);
        } catch (error) {
            toast.error('Failed to generate MFA secret');
            setIsLoading(false);
        }
    };

    useEffect(() => {
        generateMFA();
    }, []);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (token.length !== 6) {
            toast.error('Please enter a 6-digit code');
            return;
        }

        try {
            setIsVerifying(true);
            await api.post('/auth/mfa/enable', { token });
            setIsVerifying(false);
            setStep(3);
            toast.success('MFA Enabled Successfully!');
            if (onComplete) {
                setTimeout(onComplete, 2000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid code. Please try again.');
            setIsVerifying(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Secret copied to clipboard');
    };

    return (
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100">
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-2">
                                <Smartphone className="text-indigo-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Setup Two-Factor Auth</h2>
                            <p className="text-sm text-gray-500">Scan this QR code with Google Authenticator or Microsoft Authenticator.</p>
                        </div>

                        <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            {isLoading ? (
                                <div className="w-48 h-48 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-indigo-600" size={32} />
                                </div>
                            ) : (
                                <img src={qrCode} alt="MFA QR Code" className="w-48 h-48 rounded-lg shadow-sm" />
                            )}
                        </div>

                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 space-y-2">
                            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Trouble scanning?</p>
                            <div className="flex items-center justify-between gap-2">
                                <code className="text-xs font-mono text-amber-900 bg-white/50 px-2 py-1 rounded border border-amber-200 flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {secret}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(secret)}
                                    className="p-1.5 hover:bg-amber-100 rounded-lg transition-colors text-amber-700"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        >
                            I've Scanned the Code
                        </button>
                        
                        <button
                            onClick={onCancel}
                            className="w-full py-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                        >
                            Not Now
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-6"
                    >
                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-2">
                                <Key className="text-emerald-600" size={32} />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">Verify Device</h2>
                            <p className="text-sm text-gray-500">Enter the 6-digit code from your app to confirm setup.</p>
                        </div>

                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="000 000"
                                    className="w-full py-4 text-center text-3xl font-bold tracking-[0.5em] bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-600 focus:bg-white focus:outline-none transition-all placeholder:text-gray-200"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isVerifying}
                                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
                            >
                                {isVerifying ? <Loader2 size={20} className="animate-spin" /> : 'Confirm & Enable MFA'}
                            </button>

                            <div className="flex flex-col gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="w-full py-2 text-sm text-gray-400 hover:text-indigo-600 font-medium transition-colors flex items-center justify-center gap-1"
                                >
                                    <RefreshCw size={14} /> Back to QR Code
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center space-y-6 py-8"
                    >
                        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="text-emerald-600" size={48} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-gray-900">Security Enhanced!</h2>
                            <p className="text-gray-500">Two-factor authentication is now active on your account. You'll be asked for a code whenever you log in.</p>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl text-[10px] text-indigo-700 font-medium italic">
                            Tip: Don't uninstall your authenticator app without disabling MFA first.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MFASetup;
