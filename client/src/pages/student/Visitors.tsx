import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UserPlus,
    Calendar,
    Clock,
    MessageSquare,
    User,
    Plus,
    X,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    ShieldCheck,
    History
} from 'lucide-react';
import { useMyVisitors, useRegisterVisitor } from '@/hooks/useVisitors';
import toast from 'react-hot-toast';

const StudentVisitors = () => {
    const { data: visitors, isLoading } = useMyVisitors();
    const registerVisitor = useRegisterVisitor();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [formData, setFormData] = useState({
        visitorName: '',
        relation: '',
        visitDate: '',
        expectedTime: '',
        purpose: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await registerVisitor.mutateAsync(formData);
            toast.success('Visitor registered successfully! Status: Pending Approval');
            setIsModalOpen(false);
            setFormData({
                visitorName: '',
                relation: '',
                visitDate: '',
                expectedTime: '',
                purpose: ''
            });
        } catch (error) {
            toast.error('Failed to register visitor');
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'checked-in': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'departed': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Visitor <span className="text-indigo-600">Gate Pass</span></h1>
                    <p className="text-gray-500 mt-2 font-medium">Pre-approve your guests for seamless campus entry.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95"
                >
                    <Plus size={20} />
                    Register New Visitor
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Information Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <ShieldCheck size={48} className="mb-6 opacity-80" />
                        <h3 className="text-xl font-bold mb-4">Entry Protocol</h3>
                        <ul className="space-y-4 text-sm text-indigo-50 font-medium">
                            <li className="flex gap-3 items-start">
                                <div className="mt-1"><CheckCircle2 size={16} /></div>
                                Visitor requests are valid for 24 hours.
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="mt-1"><CheckCircle2 size={16} /></div>
                                Government IDs are mandatory at the gate.
                            </li>
                            <li className="flex gap-3 items-start">
                                <div className="mt-1"><CheckCircle2 size={16} /></div>
                                Security verifies pre-approvals via QR/ID.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Visitor History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface p-8 rounded-[2.5rem] border border-border/50 shadow-soft min-h-[500px]">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                <History size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 bg-gray-50 animate-pulse rounded-2xl"></div>
                                ))}
                            </div>
                        ) : !visitors || visitors.length === 0 ? (
                            <div className="h-[350px] flex flex-col items-center justify-center text-center p-8">
                                <div className="p-6 bg-gray-50 rounded-full mb-4">
                                    <UserPlus size={48} className="text-gray-300" />
                                </div>
                                <h4 className="text-lg font-bold text-gray-900 mb-2">No Visitors Registered</h4>
                                <p className="text-gray-400 max-w-xs text-sm">Your guest list is currently empty. Start by adding a new visitor application.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {visitors.map((visitor: any) => (
                                    <motion.div
                                        key={visitor._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-5 border border-gray-100 rounded-3xl hover:border-indigo-200 transition-all group relative overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm"
                                    >
                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <User size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{visitor.visitorName}</h4>
                                                    <p className="text-xs text-gray-400 font-medium">{visitor.relation} • {new Date(visitor.visitDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${getStatusStyles(visitor.status)}`}>
                                                {visitor.status}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Registration Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative z-[101] overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-900 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/10 rounded-2xl">
                                        <UserPlus size={24} />
                                    </div>
                                    <h2 className="text-xl font-bold">Visitor Registration</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-white/60 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Visitor Name</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium"
                                                placeholder="Guest Full Name"
                                                value={formData.visitorName}
                                                onChange={e => setFormData({ ...formData, visitorName: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Relationship</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium"
                                            placeholder="e.g. Parent, Friend"
                                            value={formData.relation}
                                            onChange={e => setFormData({ ...formData, relation: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Visit Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
                                                value={formData.visitDate}
                                                min={new Date().toISOString().split('T')[0]}
                                                onChange={e => setFormData({ ...formData, visitDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Expected Time</label>
                                        <div className="relative">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="time"
                                                required
                                                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all font-medium"
                                                value={formData.expectedTime}
                                                onChange={e => setFormData({ ...formData, expectedTime: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Purpose of Visit</label>
                                    <div className="relative">
                                        <MessageSquare className="absolute left-4 top-4 text-gray-400" size={18} />
                                        <textarea
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 outline-none transition-all placeholder:text-gray-300 font-medium min-h-[100px] resize-none"
                                            placeholder="Detailed purpose of the visit..."
                                            value={formData.purpose}
                                            onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                    <div className="p-2 bg-white rounded-xl text-amber-600 shadow-sm h-min">
                                        <AlertCircle size={20} />
                                    </div>
                                    <p className="text-xs text-amber-800 font-medium leading-relaxed">
                                        By registering, you confirm the visitor's credibility. High-risk guests or incorrect details may lead to suspension of visitor privileges.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={registerVisitor.isPending}
                                    className="w-full py-4.5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {registerVisitor.isPending ? 'Submitting...' : 'Confirm Registration'}
                                    {!registerVisitor.isPending && <ChevronRight size={20} />}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default StudentVisitors;
