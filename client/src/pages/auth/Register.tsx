import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    Lock,
    Mail,
    ArrowRight,
    Loader2,
    ChevronDown,
    Phone,
    MapPin,
    Calendar,
    Users,
    Heart,
    BookOpen,
    GraduationCap,
    Hash,
    CreditCard,
    ArrowLeft,
    Shield,
    Eye,
    EyeOff,
    CheckCircle,
    Building2,
    Home,
    UserCheck,
    Zap,
    Bell,
    Sparkles,
    Trophy,
    Wifi,
    Coffee
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        gender: '',
        phone: '',
        address: '',
        age: '',
        guardianName: '',
        relation: '',
        guardianContact: '',
        guardianContact2: '',
        course: '',
        branch: '',
        year: '',
        applicationNum: '',
        aadharNum: '',
        state: '',
        city: '',
        pincode: ''
    });

    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.gender || !formData.phone || !formData.age || !formData.address) {
                toast.error('Please fill all required personal details');
                return;
            }

            const password = formData.password;
            if (password.length < 8) {
                toast.error('Password must be at least 8 characters long');
                return;
            }
            if (!/[A-Z]/.test(password)) {
                toast.error('Password must contain at least one uppercase letter');
                return;
            }
            if (!/[a-z]/.test(password)) {
                toast.error('Password must contain at least one lowercase letter');
                return;
            }
            if (!/[0-9]/.test(password)) {
                toast.error('Password must contain at least one number');
                return;
            }
            if (!/[^A-Za-z0-9]/.test(password)) {
                toast.error('Password must contain at least one special character');
                return;
            }
        } else if (step === 2) {
            if (!formData.guardianName || !formData.relation || !formData.guardianContact) {
                toast.error('Please fill primary guardian details');
                return;
            }
        }
        setStep(s => s + 1);
    };

    const prevStep = () => setStep(s => s - 1);

    const handleFinalRegistration = async () => {
        if (!formData.course || !formData.branch || !formData.year || !formData.applicationNum || !formData.aadharNum) {
            toast.error('Please complete all academic details');
            return;
        }

        try {
            await register({
                ...formData,
                role: 'student'
            });
            toast.success('Account created successfully!');
            navigate('/student/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (step < 3) {
                nextStep();
            }
        }
    };

    const stepInfo = [
        { title: 'Personal', icon: <User size={18} />, description: 'Tell us about yourself' },
        { title: 'Family', icon: <Users size={18} />, description: 'Guardian information' },
        { title: 'Academic', icon: <BookOpen size={18} />, description: 'Educational details' }
    ];

    const features = [
        { icon: <Shield size={16} />, title: 'Secure & Reliable', desc: 'Enterprise-grade security', color: 'indigo' },
        { icon: <Zap size={16} />, title: 'Seamless Experience', desc: 'Quick onboarding', color: 'emerald' },
        { icon: <Users size={16} />, title: 'Smart Community', desc: 'Connect & grow', color: 'purple' },
        { icon: <Bell size={16} />, title: 'Real-time Updates', desc: 'Instant notifications', color: 'orange' },
    ];

    // Password strength checker
    const getPasswordStrength = () => {
        const pwd = formData.password;
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^A-Za-z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength();
    const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passwordStrength - 1] || 'Very Weak';
    const strengthColor = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength - 1] || 'bg-red-500';

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-gray-50 via-indigo-50/20 to-blue-50/30">
            {/* LEFT SECTION - IMAGE & BRANDING */}
            <div className="hidden lg:block relative overflow-hidden">
                {/* Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1523050853063-bd401b51e911?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')",
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-slate-900/90 to-slate-900/95" />

                {/* Decorative elements */}
                <div className="absolute top-20 -right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col justify-between h-full p-8 lg:p-12">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-12 h-12 overflow-hidden rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl bg-white">
                            <img src="/logo.png" alt="SHAMS Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="font-bold text-white text-2xl tracking-tight">SHAMS</span>
                            <p className="text-[10px] text-indigo-300 font-medium">Smart Hostel Management System</p>
                        </div>
                    </motion.div>

                    {/* Main Content */}
                    <div className="space-y-8 my-12">
                        {/* Step Indicator */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full w-fit"
                        >
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-white tracking-wide">STEP {step} OF 3</span>
                        </motion.div>

                        {/* Title */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-4">
                                Your Journey<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                                    Starts Here
                                </span>
                            </h2>
                            <p className="text-slate-300 text-base max-w-md leading-relaxed">
                                Join our smart campus community and experience a seamless, secure and connected hostel living.
                            </p>
                        </motion.div>

                        {/* Features Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            {features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 p-2.5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                                    <div className={`p-1.5 rounded-lg bg-${feature.color}-500/20`}>
                                        <div className={`text-${feature.color}-400`}>{feature.icon}</div>
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-white">{feature.title}</p>
                                        <p className="text-[9px] text-slate-400">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Steps Progress */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="space-y-3 pt-4"
                        >
                            <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Create Student Account</p>
                            <p className="text-[11px] text-slate-400">Complete your profile in 3 simple steps</p>

                            <div className="flex items-center gap-4 mt-4">
                                {stepInfo.map((item, idx) => (
                                    <div key={idx} className="flex-1">
                                        <div className={`h-1 rounded-full transition-all ${step > idx + 1 ? 'bg-emerald-500' : step === idx + 1 ? 'bg-indigo-500' : 'bg-white/20'
                                            }`} />
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${step > idx + 1
                                                    ? 'bg-emerald-500 text-white'
                                                    : step === idx + 1
                                                        ? 'bg-indigo-500 text-white ring-2 ring-indigo-400/50'
                                                        : 'bg-white/20 text-slate-400'
                                                }`}>
                                                {step > idx + 1 ? '✓' : idx + 1}
                                            </div>
                                            <span className={`text-[9px] font-medium ${step === idx + 1 ? 'text-indigo-300' : 'text-slate-500'
                                                }`}>
                                                {item.title}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Security Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center gap-2 p-3 bg-indigo-500/10 backdrop-blur-sm rounded-xl border border-indigo-500/20"
                    >
                        <Shield size={14} className="text-indigo-400" />
                        <p className="text-[10px] text-indigo-300 flex-1">Your data is protected with advanced encryption</p>
                        <CheckCircle size={12} className="text-emerald-400" />
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 }}
                        className="pt-4 text-center"
                    >
                        <p className="text-[9px] text-slate-500">© 2025 SHAMS. All rights reserved. | Vignan University</p>
                    </motion.div>
                </div>
            </div>

            {/* RIGHT SECTION - FORM */}
            <div className="flex items-start lg:items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-2xl shadow-xl p-6 lg:p-8">
                        {/* Mobile Header */}
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <div className="w-20 h-20 overflow-hidden rounded-3xl shadow-2xl flex items-center justify-center bg-white border-4 border-indigo-50/50 mb-4">
                                <img src="/logo.png" alt="SHAMS Logo" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SHAMS</h1>
                                <p className="text-[10px] text-indigo-600 font-bold tracking-[0.2em] uppercase mb-4">Smart Hostel System</p>
                            </div>
                            {/* Step progress bar - mobile */}
                            <div className="flex items-center gap-2 mb-1">
                                {stepInfo.map((item, idx) => (
                                    <div key={idx} className="flex-1">
                                        <div className={`h-1.5 rounded-full transition-all ${
                                            step > idx + 1 ? 'bg-emerald-500' : step === idx + 1 ? 'bg-indigo-500' : 'bg-gray-200'
                                        }`} />
                                        <p className={`text-[9px] mt-1 font-semibold ${
                                            step === idx + 1 ? 'text-indigo-600' : 'text-gray-400'
                                        }`}>{item.title}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-[10px] text-gray-500">Step {step} of 3</p>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-5">
                                        <h2 className="text-lg font-bold text-gray-900">Personal Details</h2>
                                        <p className="text-xs text-gray-500">Tell us about yourself</p>
                                    </div>

                                    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.1 }}
                                                className="lg:col-span-2"
                                            >
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Full Name
                                                </label>
                                                <div className="relative group">
                                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        name="name"
                                                        type="text"
                                                        value={formData.name}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Enter your full name"
                                                        required
                                                    />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="lg:col-span-2"
                                            >
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Email Address
                                                </label>
                                                <div className="relative group">
                                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        name="email"
                                                        type="email"
                                                        value={formData.email}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Enter your email address"
                                                        required
                                                    />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.2 }}
                                                className="lg:col-span-2"
                                            >
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Password
                                                </label>
                                                <div className="relative group">
                                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        name="password"
                                                        type={showPassword ? "text" : "password"}
                                                        value={formData.password}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Create a strong password"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                                                    >
                                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                {formData.password && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="text-[9px] text-gray-500">Password strength:</span>
                                                            <span className="text-[9px] font-semibold" style={{ color: strengthColor.replace('bg-', 'text-') }}>
                                                                {strengthText}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${(passwordStrength / 5) * 100}%` }}
                                                                className={`h-full ${strengthColor}`}
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Gender
                                                </label>
                                                <div className="relative group">
                                                    <select
                                                        name="gender"
                                                        value={formData.gender}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none"
                                                        required
                                                    >
                                                        <option value="">Select gender</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-indigo-600" />
                                                </div>
                                            </motion.div>

                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Age
                                                </label>
                                                <div className="relative group">
                                                    <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        name="age"
                                                        type="number"
                                                        value={formData.age}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Age"
                                                        required
                                                    />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.35 }}
                                                className="lg:col-span-2"
                                            >
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Phone Number
                                                </label>
                                                <div className="relative group">
                                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <input
                                                        name="phone"
                                                        type="tel"
                                                        value={formData.phone}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="+91 00000 00000"
                                                        required
                                                    />
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                className="lg:col-span-2"
                                            >
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Address
                                                </label>
                                                <div className="relative group">
                                                    <Home size={16} className="absolute left-3 top-3 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                                    <textarea
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm min-h-[80px]"
                                                        placeholder="Enter your permanent address"
                                                        required
                                                    />
                                                </div>
                                            </motion.div>
                                        </div>

                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: 0.5 }}
                                            className="flex justify-end pt-4"
                                        >
                                            <motion.button
                                                type="button"
                                                onClick={nextStep}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                                            >
                                                Continue <ArrowRight size={16} />
                                            </motion.button>
                                        </motion.div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-5">
                                        <h2 className="text-lg font-bold text-gray-900">Family Details</h2>
                                        <p className="text-xs text-gray-500">Guardian information for emergency contact</p>
                                    </div>

                                    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Guardian Name
                                                </label>
                                                <div className="relative">
                                                    <UserCheck size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="guardianName"
                                                        type="text"
                                                        value={formData.guardianName}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Father / Mother / Guardian Name"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Relation
                                                </label>
                                                <div className="relative">
                                                    <Heart size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="relation"
                                                        type="text"
                                                        value={formData.relation}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Father / Mother / Guardian"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Primary Contact Number
                                                </label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="guardianContact"
                                                        type="tel"
                                                        value={formData.guardianContact}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Primary Guardian Number"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Secondary Contact Number (Optional)
                                                </label>
                                                <div className="relative">
                                                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="guardianContact2"
                                                        type="tel"
                                                        value={formData.guardianContact2}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Alternative Contact Number"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                                            >
                                                <ArrowLeft size={16} /> Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={nextStep}
                                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/25"
                                            >
                                                Continue <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="mb-5">
                                        <h2 className="text-lg font-bold text-gray-900">Academic Details</h2>
                                        <p className="text-xs text-gray-500">Your educational information</p>
                                    </div>

                                    <form onSubmit={handleFormSubmit} onKeyDown={handleKeyDown} className="space-y-4">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Course
                                                </label>
                                                <div className="relative">
                                                    <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="course"
                                                        type="text"
                                                        value={formData.course}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="B.Tech / M.Tech"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Branch
                                                </label>
                                                <div className="relative">
                                                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="branch"
                                                        type="text"
                                                        value={formData.branch}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="CSE / ECE / ME"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Year of Study
                                                </label>
                                                <div className="relative">
                                                    <select
                                                        name="year"
                                                        value={formData.year}
                                                        onChange={handleChange}
                                                        className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm appearance-none"
                                                        required
                                                    >
                                                        <option value="">Select Year</option>
                                                        <option value="1">1st Year</option>
                                                        <option value="2">2nd Year</option>
                                                        <option value="3">3rd Year</option>
                                                        <option value="4">4th Year</option>
                                                    </select>
                                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Application ID
                                                </label>
                                                <div className="relative">
                                                    <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="applicationNum"
                                                        type="text"
                                                        value={formData.applicationNum}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="Application Number"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="lg:col-span-2">
                                                <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                                    Aadhar Number
                                                </label>
                                                <div className="relative">
                                                    <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                                    <input
                                                        name="aadharNum"
                                                        type="text"
                                                        value={formData.aadharNum}
                                                        onChange={handleChange}
                                                        className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                                                        placeholder="0000 0000 0000"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <button
                                                type="button"
                                                onClick={prevStep}
                                                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold text-sm hover:bg-gray-200 transition-all flex items-center gap-2"
                                            >
                                                <ArrowLeft size={16} /> Back
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleFinalRegistration}
                                                disabled={isLoading}
                                                className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-all flex items-center gap-2 shadow-lg shadow-green-600/25 disabled:opacity-70"
                                            >
                                                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                {isLoading ? 'Creating Account...' : 'Create Account'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-6 pt-4 text-center border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                Already have an account?{' '}
                                <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;