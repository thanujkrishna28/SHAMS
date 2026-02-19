import React, { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, ArrowRight, Loader2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login({ email, password }); // Assuming login handles role check or redirects based on role
            // Ideally we check role here or in login function but for now we trust the login
            // If the user isn't admin, dashboard protection will kick them out or we should check here.
            // For now let's just redirect to dashboard which has protection.
            toast.success('Welcome back, Admin!');
            navigate('/admin/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background">
            {/* Left Side - Form */}
            <div className="flex items-center justify-center p-8 lg:p-12">
                <div className="w-full max-w-md space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-2"
                    >
                        <div className="flex items-center gap-2 mb-8">
                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-600/30">
                                A
                            </div>
                            <span className="font-bold text-gray-900 text-xl tracking-tight">Smart HMS Admin</span>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Portal</h1>
                        <p className="text-gray-500">Sign in to manage the hostel ecosystem.</p>
                    </motion.div>

                    <motion.form
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email Reference</label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
                                    placeholder="admin@university.edu"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-700">Password</label>
                            </div>
                            <div className="relative">
                                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-600/25 hover:bg-indigo-700 hover:shadow-indigo-600/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 size={20} className="animate-spin" /> : (
                                <>
                                    Access Portal <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </motion.form>

                    <div className="text-center text-sm text-gray-500">
                        <Link to="/login" className="font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                            &larr; Back to Student Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right Side - Visual */}
            <div className="hidden lg:block relative overflow-hidden bg-slate-900 m-4 rounded-3xl shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 p-12 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-medium mb-4">
                        <Shield size={14} /> Secure Access
                    </div>
                    <h2 className="text-3xl font-bold text-white max-w-lg leading-tight">
                        Administrative Controls
                    </h2>
                    <p className="text-slate-300 text-lg max-w-md mt-2 leading-relaxed">
                        Authorized personnel only. Access room allocations, student records, and maintenance logs.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
