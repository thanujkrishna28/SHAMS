import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import {
    Mail, Lock, ArrowRight, Loader2, Eye, EyeOff, Shield, Zap,
    TrendingUp, Users, CheckCircle2, Star,
    Sparkles, UserPlus, Building2, Fingerprint
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom Hook for typing animation
const useTypingAnimation = (texts: string[], typingSpeed = 100, deletingSpeed = 50, pauseDuration = 2000) => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            const fullText = texts[currentTextIndex];

            if (!isDeleting) {
                setCurrentText(fullText.substring(0, currentText.length + 1));
                if (currentText === fullText) {
                    setIsDeleting(true);
                    setTimeout(() => { }, pauseDuration);
                }
            } else {
                setCurrentText(fullText.substring(0, currentText.length - 1));
                if (currentText === '') {
                    setIsDeleting(false);
                    setCurrentTextIndex((currentTextIndex + 1) % texts.length);
                }
            }
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timer);
    }, [currentText, isDeleting, currentTextIndex, texts, typingSpeed, deletingSpeed, pauseDuration]);

    return currentText;
};

// Feature data
const features = [
    {
        icon: <div className="w-4 h-4 overflow-hidden rounded-sm flex items-center justify-center"><img src="/logo.png" className="w-full h-full object-cover" /></div>,
        title: 'Secure & Reliable',
        description: 'Enterprise-grade security',
        color: 'indigo',
    },
    {
        icon: <Zap size={18} />,
        title: 'Real-time Updates',
        description: 'Instant notifications',
        color: 'emerald',
    },
    {
        icon: <TrendingUp size={18} />,
        title: 'Smart & Efficient',
        description: 'Data-driven insights',
        color: 'orange',
    },
    {
        icon: <Users size={18} />,
        title: 'Trusted by Thousands',
        description: '10,000+ active users',
        color: 'pink',
    },
];

// Feature Card Component
const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
    const controls = useAnimation();
    const ref = useRef(null);
    const isInView = useInView(ref);

    useEffect(() => {
        if (isInView) {
            controls.start('visible');
        }
    }, [controls, isInView]);

    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        orange: 'bg-orange-50 text-orange-600',
        pink: 'bg-pink-50 text-pink-600',
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={controls}
            variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0, transition: { delay: index * 0.05, duration: 0.3 } }
            }}
            className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
        >
            <div className={`p-2 rounded-xl ${colorClasses[feature.color]} shrink-0`}>
                {feature.icon}
            </div>
            <div>
                <h3 className="font-semibold text-gray-800 text-sm">{feature.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{feature.description}</p>
            </div>
        </motion.div>
    );
};

// Main Login Component
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [keepSignedIn, setKeepSignedIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);

    const [mfaStep, setMfaStep] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaDetails, setMfaDetails] = useState<{ userId: string; role: string } | null>(null);

    const { login, logout, isLoading, verifyMFA, startWebAuthnLogin, loginWithToken } = useAuthStore();
    const navigate = useNavigate();
    const typingText = useTypingAnimation(['Secure Access', 'Fast Login', 'Smart Dashboard'], 100, 50, 2000);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (token) {
            handleOAuthLogin(token);
        }

        if (error) {
            toast.error('Google authentication failed. Please try again.');
        }
    }, []);

    const handleOAuthLogin = async (token: string) => {
        try {
            await loginWithToken(token);
            const user = useAuthStore.getState().user;
            
            toast.success(`Welcome back, ${user?.name}!`);
            setIsSuccess(true);
            
            setTimeout(() => {
                // Correct role-based redirection
                if (user?.role === 'security') {
                    navigate('/security/scanner');
                } else if (user?.role === 'admin' || user?.role === 'warden' || user?.role === 'chief_warden') {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/student/dashboard');
                }
            }, 1500);
        } catch (error) {
            toast.error('Session initialization failed');
        }
    };

    const handleGoogleLogin = () => {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        window.location.href = `${apiUrl}/auth/google`;
    };

    const handleBiometricLogin = async () => {
        setIsScanning(true);
        
        try {
            toast.loading('Initializing biometric discovery...', { id: 'bio-scan' });
            
            // TRUE PASSWORDLESS LOGIN
            // No email required - device will discover the registered account
            const user: any = await startWebAuthnLogin();
            
            toast.success(`Welcome back, ${user.name}!`, { id: 'bio-scan' });
            
            // Role-based navigation
            if (user.role === 'security') {
                navigate('/security/scanner');
            } else if (user.role === 'admin' || user.role === 'warden' || user.role === 'chief_warden') {
                navigate('/admin/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error: any) {
            console.error('Biometric Login Error:', error);
            // Handle specific errors like user cancellation
            if (error.name === 'NotAllowedError' || error.message.includes('abort')) {
                toast.dismiss('bio-scan');
                return;
            }
            
            toast.error(error.message || 'Biometric authentication failed.', { id: 'bio-scan' });
            
            // Fallback hint
            if (error.message.includes('No biometric credentials')) {
                toast('No passkeys found on this device. Please login with password first to register this device.', { icon: 'ℹ️' });
            }
        } finally {
            setIsScanning(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.includes('@') || !email.includes('.')) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            const result: any = await login({ email, password, portal: 'student' });

            if (result?.mfaRequired) {
                setMfaDetails({ userId: result.userId, role: result.role });
                setMfaStep(true);
                toast.success('MFA Verification Required');
                return;
            }

            const user = useAuthStore.getState().user;

            if (user?.role === 'admin' || user?.role === 'warden' || user?.role === 'chief_warden') {
                logout();
                toast.error('Staff members must use the Admin Portal');
                return;
            }

            setIsSuccess(true);
            toast.success('Welcome back!');

            setTimeout(() => {
                if (user?.role === 'security') {
                    navigate('/security/scanner');
                } else {
                    navigate('/student/dashboard');
                }
            }, 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    const handleMFAVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaCode || mfaCode.length !== 6) {
            toast.error('Please enter a valid 6-digit code');
            return;
        }

        try {
            await verifyMFA(mfaCode, mfaDetails!.userId, mfaDetails!.role);
            const user = useAuthStore.getState().user;
            toast.success(`Welcome back, ${user?.name}!`);
            navigate('/student/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid MFA code');
        }
    };

    return (
        <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 via-indigo-50/20 to-blue-50/30 overflow-y-auto">
            {/* LEFT SECTION - BRANDING - DESKTOP ONLY */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-white shadow-xl p-6 lg:p-8 flex-col">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-purple-50/50" />

                <div className="relative z-10 flex flex-col flex-1">
                    {/* Logo Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="mb-6 lg:mb-8"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 overflow-hidden rounded-2xl shadow-lg flex items-center justify-center bg-white border border-gray-100">
                                <img src="/logo.png" alt="SHAMS Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">SHAMS</h1>
                                <p className="text-xs text-gray-500 font-bold tracking-[0.2em] uppercase">SMART HOSTEL SYSTEM</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="mb-6 lg:mb-8"
                    >
                        <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-2">
                            Building a Better<br />
                            Hostel <span className="text-indigo-600">Experience</span>
                        </h2>
                        <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                            SHAMS brings students, wardens, and administrators together on one intelligent platform.
                        </p>

                        {/* Typing animation */}
                        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full">
                            <Sparkles size={12} className="text-indigo-600" />
                            <span className="text-xs text-indigo-600 font-medium">{typingText}</span>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 lg:mb-8">
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} feature={feature} index={idx} />
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-3 pt-4 border-t border-gray-100 mt-auto">
                        {[
                            { value: '10k+', label: 'Users' },
                            { value: '99%', label: 'Uptime' },
                            { value: '24/7', label: 'Support' },
                            { value: '5★', label: 'Rating' },
                        ].map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-xl lg:text-2xl font-bold text-gray-900">{stat.value}</div>
                                <div className="text-xs text-gray-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="pt-6 text-center">
                        <p className="text-xs text-gray-400">© 2025 SHAMS. Vignan University</p>
                    </div>
                </div>
            </div>

            {/* RIGHT SECTION - LOGIN FORM */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 min-h-screen lg:min-h-0">
                <div className="w-full max-w-md">

                    {/* Mobile-only compact header */}
                    <div className="lg:hidden flex flex-col items-center gap-3 mb-8">
                        <div className="w-24 h-24 overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center bg-white border-4 border-indigo-50/50">
                            <img src="/logo.png" alt="SHAMS Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">SHAMS</h1>
                            <p className="text-[10px] text-indigo-600 font-bold tracking-[0.2em] uppercase">Smart Hostel System</p>
                        </div>
                    </div>
                    <AnimatePresence mode="wait">
                        {!isSuccess ? (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ duration: 0.4 }}
                                className="bg-white rounded-2xl shadow-xl p-6 lg:p-8"
                            >
                                {/* Welcome Section */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                        className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full mb-3"
                                    >
                                        <Star size={12} className="text-indigo-600 fill-indigo-600" />
                                        <span className="text-xs font-semibold text-indigo-600">
                                            {mfaStep ? 'Two-Factor Auth' : 'Student Portal'}
                                        </span>
                                    </motion.div>

                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {mfaStep ? 'VERIFY IDENTITY' : 'WELCOME BACK!'}
                                    </h2>
                                    <p className="text-gray-600 text-sm">
                                        {mfaStep ? 'Enter code from your app' : 'Log in to your account'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {mfaStep ? 'Keep your account secure' : 'Enter your credentials to continue'}
                                    </p>
                                </div>

                                {/* Form */}
                                {!mfaStep ? (
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {/* Email Field */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.1 }}
                                        >
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                                                Email Address
                                            </label>
                                            <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.01]' : ''}`}>
                                                <Mail size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedField('email')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                    placeholder="student@vignan.edu"
                                                    required
                                                />
                                            </div>
                                        </motion.div>

                                        {/* Password Field */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.15 }}
                                        >
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
                                                Password
                                            </label>
                                            <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.01]' : ''}`}>
                                                <Lock size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onFocus={() => setFocusedField('password')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </motion.div>

                                        {/* Checkboxes */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.2 }}
                                            className="flex items-center justify-between flex-wrap gap-2 py-1"
                                        >
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={rememberMe}
                                                    onChange={(e) => setRememberMe(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">Remember me</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={keepSignedIn}
                                                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                                                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                />
                                                <span className="text-xs text-gray-700 group-hover:text-gray-900 transition-colors">Keep me signed in</span>
                                            </label>
                                        </motion.div>

                                        {/* Sign In Button */}
                                        <motion.button
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.01, boxShadow: "0 10px 15px -3px rgba(79, 70, 229, 0.2)" }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-bold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>SIGNING IN...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>SIGN IN</span>
                                                    <ArrowRight size={16} />
                                                </>
                                            )}
                                        </motion.button>

                                        {/* Divider */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="relative my-4"
                                        >
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200"></div>
                                            </div>
                                            <div className="relative flex justify-center">
                                                <span className="px-3 bg-white text-xs text-gray-500 uppercase">or continue with</span>
                                            </div>
                                        </motion.div>

                                        {/* Social Buttons */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.35 }}
                                            className="grid grid-cols-2 gap-3"
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleGoogleLogin}
                                                type="button"
                                                className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg transition-all hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                                </svg>
                                                <span className="text-xs font-medium text-gray-700">Google</span>
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                type="button"
                                                className="flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg transition-all hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4" viewBox="0 0 21 21">
                                                    <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                                                    <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                                                    <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                                                    <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                                                </svg>
                                                <span className="text-xs font-medium text-gray-700">Microsoft</span>
                                            </motion.button>
                                        </motion.div>

                                        {/* Biometric Login Section */}
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.45 }}
                                            className="pt-4 border-t border-dashed border-gray-200"
                                        >
                                            <motion.button
                                                whileHover={{ scale: 1.02, backgroundColor: "rgba(245, 243, 255, 1)" }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleBiometricLogin}
                                                type="button"
                                                className="w-full flex items-center justify-between p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl group transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all">
                                                        <Fingerprint size={20} className="text-indigo-600 animate-pulse" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-bold text-gray-900">Fingerprint / Phone PIN</p>
                                                        <p className="text-xs text-gray-500">Log in using your phone's security</p>
                                                    </div>
                                                </div>
                                                <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-1 transition-all" />
                                            </motion.button>
                                        </motion.div>

                                        {/* Removed Modal for direct one-tap experience */}

                                        {/* Navigation Cards */}
                                        <div className="mt-6 pt-2 space-y-3">
                                            <Link to="/register" className="block group">
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 rounded-lg border border-indigo-100 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                                            <UserPlus size={16} className="text-indigo-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                                New Student?
                                                            </p>
                                                            <p className="text-xs text-gray-500">Create your account to get started</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={16} className="text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </Link>

                                            <Link to="/admin/login" className="block group">
                                                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-gray-200 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                            <Building2 size={16} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                                                Staff / Administrator?
                                                            </p>
                                                            <p className="text-xs text-gray-500">Access the admin control panel</p>
                                                        </div>
                                                    </div>
                                                    <Building2 size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                                                </div>
                                            </Link>
                                        </div>

                                        {/* Help Section */}
                                        <div className="text-center pt-4">
                                            <p className="text-xs text-gray-400">
                                                Need assistance?{' '}
                                                <Link to="/support" className="text-indigo-500 hover:text-indigo-700 font-bold transition-colors">
                                                    Contact Support
                                                </Link>
                                            </p>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleMFAVerify} className="space-y-6">
                                            <div className="relative group">
                                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                                    <img src="/logo.png" className="w-full h-full object-contain opacity-50" />
                                                </div>
                                            <input
                                                type="text"
                                                placeholder="000 000"
                                                maxLength={6}
                                                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-bold tracking-[0.4em] text-center text-lg"
                                                value={mfaCode}
                                                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                                onFocus={() => setFocusedField('mfa')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                                autoFocus
                                            />
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={isLoading}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg font-bold text-sm hover:shadow-lg hover:shadow-emerald-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" />
                                                    <span>VERIFYING...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>VERIFY & LOGIN</span>
                                                    <div className="w-4 h-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <img src="/logo.png" className="w-full h-full object-contain brightness-0 invert" />
                                                    </div>
                                                </>
                                            )}
                                        </motion.button>

                                        <button
                                            type="button"
                                            onClick={() => setMfaStep(false)}
                                            className="w-full py-2 text-xs text-gray-400 hover:text-indigo-600 transition-colors font-medium text-center"
                                        >
                                            Back to Login
                                        </button>
                                    </form>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="success-state"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-white rounded-2xl shadow-xl p-8 text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                                >
                                    <CheckCircle2 size={40} className="text-green-600" />
                                </motion.div>
                                <h2 className="text-xl font-bold text-gray-900 mb-2">Login Successful!</h2>
                                <p className="text-sm text-gray-600">Redirecting to dashboard...</p>
                                <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 1.5 }}
                                        className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Login;