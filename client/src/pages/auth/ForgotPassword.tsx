import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, ArrowLeft, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/auth/forgot-password`, { email });
            toast.success('OTP sent to your email');
            setStep(2);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error('Passwords do not match');
        }
        setIsLoading(true);
        try {
            await axios.post(`${API_URL}/auth/reset-password`, { 
                email, 
                otp, 
                newPassword 
            });
            toast.success('Password reset successfully!');
            setStep(4); // Success state
            setTimeout(() => navigate('/login'), 3000);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <Link to="/login" className="p-2 hover:bg-slate-50 rounded-full transition-colors group">
                            <ArrowLeft size={20} className="text-slate-400 group-hover:text-primary" />
                        </Link>
                        <div className="flex gap-1">
                            {[1, 2, 3].map((s) => (
                                <div 
                                    key={s} 
                                    className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-primary' : 'bg-slate-100'}`}
                                />
                            ))}
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">Forgot Password?</h1>
                                    <p className="text-slate-500">No worries! Enter your email and we'll send you an OTP to reset it.</p>
                                </div>

                                <form onSubmit={handleRequestOTP} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                                            <>Send OTP <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">Verify OTP</h1>
                                    <p className="text-slate-500">We've sent a 6-digit code to <span className="font-semibold text-slate-900">{email}</span></p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">One-Time Password</label>
                                        <div className="relative">
                                            <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input
                                                type="text"
                                                required
                                                maxLength={6}
                                                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-center text-xl font-bold tracking-[0.5em]"
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setStep(3)}
                                        disabled={otp.length !== 6}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                    >
                                        Verify & Continue
                                    </button>
                                    <button 
                                        onClick={handleRequestOTP}
                                        className="w-full py-2 text-sm font-bold text-primary hover:underline"
                                    >
                                        Resend Code
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">Create New Password</h1>
                                    <p className="text-slate-500">Please choose a strong password that you haven't used before.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">New Password</label>
                                            <div className="relative">
                                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                                    placeholder="••••••••"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                                            <div className="relative">
                                                <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input
                                                    type="password"
                                                    required
                                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8 space-y-6"
                            >
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                                    <CheckCircle2 size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold text-slate-900">All Set!</h1>
                                    <p className="text-slate-500">Your password has been reset successfully. Redirecting you to login...</p>
                                </div>
                                <Link 
                                    to="/login"
                                    className="inline-block px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-hover transition-all"
                                >
                                    Login Now
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
