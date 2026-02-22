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
    EyeOff
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
    });

    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        // Simple validation for each step
        if (step === 1) {
            if (!formData.name || !formData.email || !formData.password || !formData.gender || !formData.phone) {
                toast.error('Please fill all required personal details');
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
        // Strict validation for the final step before calling registration
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

    // Global form handler to prevent ANY accidental submission (especially Enter key)
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Specific handler to block Enter key from submitting
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If they press enter, we can optionally trigger the next step or do nothing
            if (step < 3) {
                nextStep();
            }
        }
    };

    const stepInfo = [
        { title: 'Personal', icon: <User size={18} /> },
        { title: 'Family', icon: <Users size={18} /> },
        { title: 'Academic', icon: <BookOpen size={18} /> }
    ];

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Left Side - Visual */}
            <div className="hidden lg:block relative overflow-hidden bg-slate-950 m-4 rounded-3xl shadow-2xl order-2 lg:order-1">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050853063-bd401b51e911?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-slate-950/80 to-slate-950"></div>

                <div className="absolute top-0 left-0 p-12 w-full h-full flex flex-col justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white border border-white/20 shadow-2xl shadow-indigo-500/20">
                            <Shield size={24} className="text-indigo-400" />
                        </div>
                        <span className="font-bold text-white text-2xl tracking-tight">Smart HMS</span>
                    </div>

                    <div className="space-y-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-5xl font-black text-white max-w-lg leading-[1.1] tracking-tighter">
                                Begin your premium <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">campus experience.</span>
                            </h2>
                            <p className="text-slate-400 text-lg max-w-md mt-6 leading-relaxed">
                                Join our ecosystem of smart living. Complete your profile in 3 simple steps to secure your future residence.
                            </p>
                        </motion.div>

                        <div className="flex flex-col gap-6 pt-8">
                            {stepInfo.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${step > idx + 1 ? 'bg-emerald-500 border-emerald-500 text-white' : step === idx + 1 ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-4 ring-indigo-600/20' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                        {step > idx + 1 ? '✓' : item.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-bold ${step === idx + 1 ? 'text-white' : 'text-slate-500'}`}>{item.title}</span>
                                        <span className="text-xs text-slate-600 font-medium">Step 0{idx + 1}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 order-1 lg:order-2 overflow-y-auto bg-white">
                <div className="w-full max-w-lg space-y-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-4 lg:hidden">
                            <Shield className="text-indigo-600" size={24} />
                            <span className="font-bold text-xl">Smart HMS</span>
                        </div>
                        <h1 className="text-3xl font-black text-slate-950 tracking-tight">Create Student Account</h1>
                        <p className="text-slate-500 text-sm font-medium">Step {step} of 3: {stepInfo[step - 1].title} Details</p>
                    </div>

                    <form
                        onSubmit={handleFormSubmit}
                        onKeyDown={handleKeyDown}
                        className="space-y-6"
                    >
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="name" type="text" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="Enter Full Name" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="email@example.com" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                            <div className="relative group">
                                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                                                <input
                                                    name="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800"
                                                    placeholder="••••••••"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Gender</label>
                                            <div className="relative">
                                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800 appearance-none" required>
                                                    <option value="">Select</option>
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Age</label>
                                            <div className="relative">
                                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="age" type="number" value={formData.age} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="20" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="+91 00000 00000" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Address</label>
                                            <div className="relative">
                                                <MapPin size={18} className="absolute left-4 top-4 text-slate-400" />
                                                <textarea name="address" value={formData.address} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800 min-h-[100px]" placeholder="Permanent Address" required />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Guardian Name</label>
                                            <div className="relative">
                                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="guardianName" type="text" value={formData.guardianName} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="Father / Mother Name" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Relation</label>
                                            <div className="relative">
                                                <Heart size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="relation" type="text" value={formData.relation} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="Father" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Guardian Phone 1</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="guardianContact" type="tel" value={formData.guardianContact} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="Primary Guardian Number" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Guardian Phone 2 (Optional)</label>
                                            <div className="relative">
                                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="guardianContact2" type="tel" value={formData.guardianContact2} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="Alternative Number" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Course</label>
                                            <div className="relative">
                                                <GraduationCap size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="course" type="text" value={formData.course} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="B.Tech" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branch</label>
                                            <div className="relative">
                                                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="branch" type="text" value={formData.branch} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="CSE" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Year of Study</label>
                                            <div className="relative">
                                                <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <select name="year" value={formData.year} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800 appearance-none" required>
                                                    <option value="">Select Year</option>
                                                    <option value="1">1st Year</option>
                                                    <option value="2">2nd Year</option>
                                                    <option value="3">3rd Year</option>
                                                    <option value="4">4th Year</option>
                                                </select>
                                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Application ID</label>
                                            <div className="relative">
                                                <Hash size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="applicationNum" type="text" value={formData.applicationNum} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="APP002931" required />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Aadhar Number</label>
                                            <div className="relative">
                                                <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input name="aadharNum" type="text" value={formData.aadharNum} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all text-sm font-bold text-slate-800" placeholder="0000 0000 0000" required />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="pt-6 flex flex-col gap-4">
                            <div className="flex gap-4">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold border border-slate-100 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                                    >
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                )}
                                {step < 3 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group"
                                    >
                                        Continue <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleFinalRegistration}
                                        disabled={isLoading}
                                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Finalize Account'}
                                    </button>
                                )}
                            </div>

                            <div className="text-center text-sm text-slate-500 font-medium pb-4">
                                Already have an account? <Link to="/login" className="font-bold text-indigo-600 hover:underline">Sign in</Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
