import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Lock, ArrowRight, Loader2, Shield, Eye, EyeOff,
    CheckCircle, Bell, Users, BarChart3, Home, Settings,
    Key, Fingerprint, Headphones, Building2
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '@/api/axios';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [secureLogin, setSecureLogin] = useState(false);
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const [mfaStep, setMfaStep] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [mfaDetails, setMfaDetails] = useState<{ userId: string; role: string } | null>(null);
    const [isPrivilegedUser, setIsPrivilegedUser] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [showBioModal, setShowBioModal] = useState(false);

    const { login, logout, isLoading, verifyMFA, setMockAuth, startWebAuthnLogin } = useAuthStore();
    const navigate = useNavigate();

    const handleBiometricLogin = async () => {
        setIsScanning(true);
        setShowBioModal(false);

        try {
            toast.loading('Initializing staff verification...', { id: 'admin-bio' });
            
            // REAL WEBAUTHN LOGIN
            await startWebAuthnLogin(email);
            
            toast.success('Access Granted!', { id: 'admin-bio' });
            
            // Redirection logic (Role is now correctly set by startWebAuthnLogin)
            const user = useAuthStore.getState().user;
            if (user?.role === 'chief_warden') {
                navigate('/chief-warden/stats');
            } else {
                navigate('/warden/attendance');
            }
        } catch (error: any) {
            console.error('Biometric Login Error:', error);
            toast.error(error.message || 'Authentication failed.', { id: 'admin-bio' });
        } finally {
            setIsScanning(false);
        }
    };

    // Check for privileged admin/warden emails to show SSO
    React.useEffect(() => {
        const privilegedEmails = ['admin@university.edu', 'warden@university.edu', 'thanujkrishna28@gmail.com'];
        if (privilegedEmails.includes(email.toLowerCase().trim())) {
            setIsPrivilegedUser(true);
        } else {
            setIsPrivilegedUser(false);
        }
    }, [email]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter both email and password');
            return;
        }

        if (!email.includes('@') || !email.includes('.')) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            const result: any = await login({ email, password, portal: 'admin' });

            if (result?.mfaRequired) {
                setMfaDetails({ userId: result.userId, role: result.role });
                setMfaStep(true);
                toast.success('MFA Verification Required');
                return;
            }

            const user = useAuthStore.getState().user;

            if (user?.role === 'student') {
                logout();
                toast.error('Student access denied. Please use the Student Portal.');
                return;
            }

            toast.success(`Welcome back, ${user?.name || 'Administrator'}!`);

            if (user?.role === 'admin') {
                navigate('/chief-warden/stats');
            } else if (user?.role === 'warden') {
                navigate('/warden/attendance');
            } else if (user?.role === 'chief_warden') {
                navigate('/chief-warden/stats');
            } else if (user?.role === 'security') {
                navigate('/security/scanner');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed. Invalid credentials.');
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
            toast.success(`Welcome back, ${user?.name || 'Administrator'}!`);

            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user?.role === 'warden') {
                navigate('/warden/attendance');
            } else if (user?.role === 'chief_warden') {
                navigate('/chief-warden/stats');
            } else if (user?.role === 'security') {
                navigate('/security/scanner');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid MFA code');
        }
    };

    const handleSSOLogin = async () => {
        if (!email) {
            toast.error('Please enter your email address first');
            return;
        }

        try {
            // Simulated SSO/MFA initiation - in a real app, this would verify the user exists
            toast.loading('Initiating Secure SSO via MFA...');
            
            // We use the existing login method with a special flag or just handle it as an MFA request
            const { data } = await api.post('/auth/mfa/initiate-sso', { email });
            
            setMfaDetails({ userId: data.userId, role: data.role });
            setMfaStep(true);
            toast.dismiss();
            toast.success('Authenticator Verification Required');
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.response?.data?.message || 'SSO Initialization failed. Please check your email.');
        }
    };

    const features = [
        {
            icon: <Shield size={16} />,
            title: 'Secure & Protected',
            desc: 'Enterprise-grade security ensures your data is always protected.',
            color: 'indigo'
        },
        {
            icon: <BarChart3 size={16} />,
            title: 'Real-time Analytics',
            desc: 'Live insights and KPIs to monitor hostel operations efficiently.',
            color: 'emerald'
        },
        {
            icon: <Building2 size={16} />,
            title: 'Centralized Management',
            desc: 'Manage students, staff, rooms, complaints and more from one place.',
            color: 'purple'
        },
        {
            icon: <Bell size={16} />,
            title: 'Smart Notifications',
            desc: 'Instant alerts and updates on important activities.',
            color: 'orange'
        }
    ];

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-gray-50 via-indigo-50/20 to-blue-50/30 overflow-y-auto">
            {/* LEFT SECTION - FORM */}
            <div className="flex items-start sm:items-center justify-center p-4 sm:p-6 lg:p-8 order-2 lg:order-1">
                <div className="w-full max-w-md">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 lg:p-8"
                    >
                        {/* Logo */}
                        <div className="flex items-center gap-2 mb-5 sm:mb-6">
                            <div className="w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center shadow-lg bg-white">
                                <img src="/logo.png" alt="SHAMS Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <span className="font-bold text-gray-900 text-lg tracking-tight">SHAMS</span>
                                <p className="text-[9px] text-gray-500">Smart Hostel Management System</p>
                            </div>
                        </div>

                        {/* Header */}
                        <div className="mb-6">
                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-full mb-2">
                                <Shield size={10} className="text-indigo-600" />
                                <span className="text-[8px] font-bold text-indigo-600 uppercase tracking-wider">Admin Portal</span>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome Back, Administrator</h1>
                            <p className="text-xs text-gray-500">
                                Secure access to oversee and manage the entire hostel ecosystem with complete control and real-time insights.
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={mfaStep ? handleMFAVerify : handleSubmit} className="space-y-4">
                            {!mfaStep ? (
                                <>
                                    {/* Email Field */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                            Email Address
                                        </label>
                                        <div className={`relative transition-all duration-200 ${focusedField === 'email' ? 'transform scale-[1.01]' : ''}`}>
                                            <User size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'email' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedField('email')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                placeholder="admin@vignan.ac.in"
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
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                            Password
                                        </label>
                                        <div className={`relative transition-all duration-200 ${focusedField === 'password' ? 'transform scale-[1.01]' : ''}`}>
                                            <Lock size={15} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'password' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                onFocus={() => setFocusedField('password')}
                                                onBlur={() => setFocusedField(null)}
                                                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                placeholder="••••••••"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                            </button>
                                        </div>
                                    </motion.div>

                                    {/* Remember Me & Secure Login */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex items-center justify-between py-1"
                                    >
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-3 h-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <span className="text-[10px] text-gray-700 group-hover:text-gray-900 transition-colors">Remember me</span>
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={secureLogin}
                                                onChange={(e) => setSecureLogin(e.target.checked)}
                                                className="w-3 h-3 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            />
                                            <Shield size={10} className="text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                                            <span className="text-[10px] text-gray-700 group-hover:text-gray-900 transition-colors">Secure login</span>
                                        </label>
                                    </motion.div>

                                    {/* Sign In Button */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        type="submit"
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-indigo-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 size={16} className="animate-spin" />
                                                <span>AUTHENTICATING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>SIGN IN</span>
                                                <ArrowRight size={16} />
                                            </>
                                        )}
                                    </motion.button>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 mb-4"
                                >
                                    <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 mb-2 text-center">
                                        <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-1">MFA Verification Required</p>
                                        <p className="text-[9px] text-indigo-500">Enter the 6-digit code from your authenticator app</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                            6-Digit Authenticator Code
                                        </label>
                                        <div className="relative group">
                                            <Shield size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${focusedField === 'mfa' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            <input
                                                type="text"
                                                placeholder="000 000"
                                                maxLength={6}
                                                className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all text-gray-900 font-bold tracking-[0.4em] text-center text-lg"
                                                value={mfaCode}
                                                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                                                onFocus={() => setFocusedField('mfa')}
                                                onBlur={() => setFocusedField(null)}
                                                required
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* SSO / MFA Submit Button - DYNAMIC VISIBILITY */}
                            <AnimatePresence>
                                {(mfaStep || isPrivilegedUser) && (
                                    <motion.button
                                        key="sso-button"
                                        initial={{ opacity: 0, y: 10, height: 0 }}
                                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                                        exit={{ opacity: 0, y: 10, height: 0 }}
                                        type="button"
                                        onClick={mfaStep ? handleMFAVerify : (isPrivilegedUser ? () => setShowBioModal(true) : handleSSOLogin)}
                                        disabled={isLoading || isScanning}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                                            mfaStep 
                                            ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-600/25 mt-2" 
                                            : "bg-white border-2 border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 mt-4"
                                        }`}
                                    >
                                        {(isLoading || isScanning) ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : mfaStep ? (
                                            <>
                                                <CheckCircle size={16} />
                                                <span>VERIFY & LOGIN</span>
                                            </>
                                        ) : (
                                            <>
                                                <Fingerprint size={16} className="text-indigo-600 animate-pulse" />
                                                <span>{isPrivilegedUser ? "Warden Biometric Login" : "Quick Access (SSO)"}</span>
                                            </>
                                        )}
                                    </motion.button>
                                )}
                            </AnimatePresence>

                            {/* CUSTOM BIOMETRIC MODAL (PHONPE STYLE) */}
                            <AnimatePresence>
                                {showBioModal && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                                    >
                                        <motion.div 
                                            initial={{ scale: 0.9, y: 20 }}
                                            animate={{ scale: 1, y: 0 }}
                                            exit={{ scale: 0.9, y: 20 }}
                                            className="bg-white rounded-[28px] w-full max-w-[320px] overflow-hidden shadow-2xl shadow-black/20"
                                        >
                                            <div className="p-8 flex flex-col items-center text-center">
                                                {/* SHAMS Staff Icon */}
                                                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/30">
                                                    <Shield size={20} className="text-white" />
                                                </div>

                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Verification</h3>
                                                <p className="text-sm text-gray-500 mb-10">Scan your fingerprint to confirm identity</p>

                                                {/* Pulsing Fingerprint Icon (Matching Photo) */}
                                                <div className="relative mb-12">
                                                    <motion.div 
                                                        animate={{ scale: [1, 1.4, 1] , opacity: [0.3, 0, 0.3]}}
                                                        transition={{ duration: 2, repeat: Infinity }}
                                                        className="absolute inset-0 bg-indigo-500 rounded-full"
                                                    />
                                                    <div className="relative w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center border-2 border-indigo-100 shadow-inner">
                                                        <Fingerprint size={40} className="text-indigo-600" />
                                                    </div>
                                                </div>

                                                <button 
                                                    onClick={() => {
                                                        setShowBioModal(false);
                                                        handleBiometricLogin();
                                                    }}
                                                    className="w-full py-3 text-indigo-600 font-bold text-sm hover:bg-indigo-50 rounded-xl transition-colors mb-2"
                                                >
                                                    Simulate Touch
                                                </button>

                                                <button 
                                                    onClick={() => setShowBioModal(false)}
                                                    className="w-full py-3 text-gray-400 font-semibold text-sm hover:text-gray-600 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </form>

                        {/* Help Section */}
                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Headphones size={14} className="text-gray-400" />
                                    <span className="text-[10px] text-gray-500">Need help?</span>
                                </div>
                                <Link to="/support" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Contact system administrator
                                </Link>
                            </div>
                            <p className="text-[9px] text-gray-400 text-center mt-3">
                                or visit support center
                            </p>
                        </div>

                        {/* Student Portal Link */}
                        <div className="mt-4 text-center">
                            <Link to="/login" className="text-[10px] text-gray-500 hover:text-indigo-600 transition-colors">
                                ← Back to Student Portal
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SECTION - BRANDING & FEATURES */}
            <div className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2070&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/85 via-slate-900/90 to-slate-900/95" />

                {/* Decorative elements */}
                <div className="absolute top-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-2"
                    >
                        <div className="w-10 h-10 overflow-hidden rounded-xl flex items-center justify-center shadow-lg bg-white">
                            <img src="/logo.png" alt="SHAMS Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-xl tracking-tight">SHAMS</span>
                            <p className="text-[8px] text-indigo-300 font-medium">Smart Hostel Management System</p>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="space-y-6 my-8">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-500/20 backdrop-blur-sm rounded-full w-fit border border-indigo-500/30"
                        >
                            <Shield size={12} className="text-indigo-400" />
                            <span className="text-[9px] font-bold text-indigo-300 tracking-wide">ADMIN PORTAL</span>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-2">
                                Welcome Back,<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                    Administrator
                                </span>
                            </h1>
                            <p className="text-slate-300 text-xs leading-relaxed max-w-md">
                                Secure access to oversee and manage the entire hostel ecosystem with complete control and real-time insights.
                            </p>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-2"
                        >
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2.5 p-2 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                                    <div className={`p-1.5 rounded-lg bg-${feature.color}-500/20`}>
                                        <div className={`text-${feature.color}-400`}>{feature.icon}</div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-semibold text-white">{feature.title}</p>
                                        <p className="text-[8px] text-slate-400">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Trust Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-2 p-2 bg-indigo-500/10 backdrop-blur-sm rounded-lg border border-indigo-500/20"
                        >
                            <div className="flex items-center gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <svg key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" viewBox="0 0 20 20">
                                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                    </svg>
                                ))}
                            </div>
                            <p className="text-[8px] text-slate-300">Trusted by administrators across Vignan University</p>
                        </motion.div>
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="pt-4 text-center"
                    >
                        <p className="text-[7px] text-slate-500">© 2025 SHAMS. All rights reserved. | Vignan University</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;