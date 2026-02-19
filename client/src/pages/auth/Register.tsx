import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, Mail, ArrowRight, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [studentId, setStudentId] = useState(''); // New state
    const [role, setRole] = useState('student'); // Default role (student)
    const { register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await register({ name, email, password, role, ...(role === 'student' && { studentId }) });
            const user = useAuthStore.getState().user;
            toast.success('Account created successfully!');

            if (user?.role === 'admin') {
                navigate('/admin/dashboard');
            } else if (user?.role === 'security') {
                navigate('/security/scanner');
            } else {
                navigate('/student/dashboard');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Left Side - Visual */}
            <div className="hidden lg:block relative overflow-hidden bg-primary m-4 rounded-3xl shadow-2xl order-2 lg:order-1">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf66?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')] bg-cover bg-center opacity-30 mix-blend-multiply"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90"></div>

                <div className="absolute top-0 left-0 p-12 w-full h-full flex flex-col justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-bold text-lg border border-white/20">
                            S
                        </div>
                        <span className="font-bold text-white text-xl tracking-tight">Smart HMS</span>
                    </div>

                    <div className="space-y-6 mb-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h2 className="text-4xl font-bold text-white max-w-lg leading-tight">
                                Join the future of campus living.
                            </h2>
                            <p className="text-white/80 text-lg max-w-md mt-4 leading-relaxed">
                                Create an account to manage your stay, submit requests, and stay connected with your campus community.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-12 order-1 lg:order-2">
                <div className="w-full max-w-md space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create an account</h1>
                        <p className="text-gray-500">Enter your details to get started.</p>
                    </motion.div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <div className="relative">
                                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            {role === 'student' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Student ID</label>
                                    <div className="relative">
                                        <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={studentId}
                                            onChange={(e) => setStudentId(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                                            placeholder="STU12345"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="relative">
                                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                                        placeholder="student@university.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                                <div className="relative">
                                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm shadow-sm"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 text-white rounded-xl font-medium shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed bg-primary hover:bg-primary-hover shadow-primary/25 hover:shadow-primary/40"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                                <>
                                    Create Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
