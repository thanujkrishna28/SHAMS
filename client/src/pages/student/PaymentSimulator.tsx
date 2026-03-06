import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    CreditCard,
    ShieldCheck,
    Smartphone,
    Banknote,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    ArrowRight
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const PaymentSimulator = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const feeId = searchParams.get('feeId');
    const amount = searchParams.get('amount');

    const [isProcessing, setIsProcessing] = useState(false);
    const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');

    useEffect(() => {
        if (!feeId) {
            toast.error('Invalid payment session');
            navigate('/student/fees');
        }
    }, [feeId, navigate]);

    const handleSimulatePayment = async () => {
        setIsProcessing(true);
        setStep('processing');

        // Artificial delay for realism
        await new Promise(resolve => setTimeout(resolve, 2500));

        try {
            await api.post('/payments/simulate-success', { feeId });
            setStep('success');
            setTimeout(() => {
                navigate(`/payment-processing?feeId=${feeId}`);
            }, 2000);
        } catch (error: any) {
            toast.error('Simulation failed');
            setStep('selection');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
            {/* Header / Brand */}
            <div className="mb-8 flex items-center gap-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200">
                    S
                </div>
                <div>
                    <h1 className="text-xl font-bold text-zinc-900 tracking-tight">SmartPay <span className="text-indigo-600">Simulator</span></h1>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-none">Redirect Gateway Mode</p>
                </div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-white/20"
            >
                {/* Order Summary Header */}
                <div className="p-6 bg-zinc-900 text-white flex justify-between items-center">
                    <div>
                        <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Payment for Hostel Fee</p>
                        <p className="text-2xl font-bold italic">₹{Number(amount).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Order ID</p>
                        <p className="text-xs font-mono text-indigo-400">#SH-SIM-{feeId?.substring(0, 6).toUpperCase()}</p>
                    </div>
                </div>

                <div className="p-8">
                    {step === 'selection' && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700">
                                <AlertTriangle size={20} className="shrink-0" />
                                <p className="text-sm font-medium leading-tight">
                                    <span className="font-bold">Developer Mode:</span> No real Razorpay keys found. You are in simulation mode.
                                </p>
                            </div>

                            <p className="text-sm text-zinc-500 font-medium">Select a simulated payment method to continue:</p>

                            <div className="space-y-3">
                                <button
                                    onClick={handleSimulatePayment}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-zinc-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Smartphone size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900">UPI / QR Code</p>
                                            <p className="text-xs text-zinc-400 italic">Pay via PhonePe, GPay etc.</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                                </button>

                                <button
                                    onClick={handleSimulatePayment}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-zinc-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <CreditCard size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900">Cards</p>
                                            <p className="text-xs text-zinc-400 italic">Visa, Mastercard, RuPay</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                                </button>

                                <button
                                    onClick={handleSimulatePayment}
                                    disabled={isProcessing}
                                    className="w-full flex items-center justify-between p-4 rounded-2xl border-2 border-zinc-100 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                            <Banknote size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900">Netbanking</p>
                                            <p className="text-xs text-zinc-400 italic">All Indian Banks</p>
                                        </div>
                                    </div>
                                    <ArrowRight className="text-zinc-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                                </button>

                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-6">
                            <div className="relative">
                                <Loader2 className="w-20 h-20 text-indigo-600 animate-spin" strokeWidth={1} />
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                    <ShieldCheck size={32} />
                                </div>
                            </div>
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-bold text-zinc-900">Processing Payment</h3>
                                <p className="text-sm text-zinc-500 animate-pulse font-medium">Communicating with your bank...</p>
                            </div>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="py-12 flex flex-col items-center justify-center space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-xl shadow-green-100"
                            >
                                <CheckCircle2 size={64} />
                            </motion.div>
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-zinc-900 italic">Payment Successful!</h3>
                                <p className="text-sm text-zinc-500 font-medium">Redirecting you back to Smart HMS...</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-center gap-3">
                    <ShieldCheck size={18} className="text-green-600" />
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Secure 256-bit Encrypted Session</p>
                </div>
            </motion.div>

            <button
                onClick={() => navigate('/student/fees')}
                className="mt-8 text-zinc-400 hover:text-zinc-600 text-sm font-bold flex items-center gap-2 transition-colors"
            >
                Cancel and return to Smart HMS
            </button>
        </div>
    );
};

export default PaymentSimulator;
