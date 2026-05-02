import React, { useState } from 'react';
import {
    Wand2, CheckCircle2, AlertCircle, Clock, Construction,
    Shield, Zap, Droplet, Wrench, Home, Send, TrendingUp,
    FileText, MessageSquare, ThumbsUp, Star, Award, Bell
} from 'lucide-react';
import { useComplaints, useCreateComplaint } from '@/hooks/useComplaints';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Complaints = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('maintenance');
    const [priority, setPriority] = useState('medium');
    const [isAIProcessing, setIsAIProcessing] = useState(false);

    const { data: complaints, isLoading } = useComplaints();
    const createMutation = useCreateComplaint();

    const handleAIPolish = () => {
        if (!description) return;
        setIsAIProcessing(true);
        setTimeout(() => {
            let polished = description;
            if (description.toLowerCase().includes('fan')) {
                polished = "The ceiling fan in the room is malfunctioning. It does not rotate at the expected speed and makes a loud noise.";
            } else if (description.toLowerCase().includes('water')) {
                polished = "The hot water supply in the bathroom is inconsistent. Only cold water is available during morning hours.";
            } else {
                polished = `Formal Complaint: ${description.charAt(0).toUpperCase() + description.slice(1)}. Requires immediate attention from the maintenance team.`;
            }
            setDescription(polished);
            setIsAIProcessing(false);
            toast.success('AI refinement complete');
        }, 1200);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast.error('Please fill in all fields');
            return;
        }

        createMutation.mutate({ title, description, category, priority }, {
            onSuccess: () => {
                toast.success('Complaint submitted successfully!');
                setTitle('');
                setDescription('');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to submit complaint');
            }
        });
    };

    const getCategoryIcon = (cat: string) => {
        switch (cat) {
            case 'maintenance': return <Wrench size={14} />;
            case 'cleanliness': return <Home size={14} />;
            case 'electrical': return <Zap size={14} />;
            case 'plumbing': return <Droplet size={14} />;
            default: return <AlertCircle size={14} />;
        }
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'resolved':
                return { icon: <CheckCircle2 size={14} />, color: 'emerald', label: 'Resolved', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100' };
            case 'in-progress':
                return { icon: <Construction size={14} />, color: 'blue', label: 'In Progress', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100' };
            case 'escalated':
                return { icon: <AlertCircle size={14} />, color: 'red', label: 'Escalated', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100' };
            default:
                return { icon: <Clock size={14} />, color: 'amber', label: 'Pending', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100' };
        }
    };

    const getPriorityConfig = (priority: string) => {
        switch (priority) {
            case 'high':
                return { color: 'text-red-600', bg: 'bg-red-50', label: 'High' };
            case 'medium':
                return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium' };
            default:
                return { color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Low' };
        }
    };

    const totalComplaints = complaints?.length || 0;
    const resolvedCount = complaints?.filter((c: any) => c.status === 'resolved').length || 0;
    const inProgressCount = complaints?.filter((c: any) => c.status === 'in-progress').length || 0;
    const pendingCount = complaints?.filter((c: any) => c.status === 'pending').length || 0;
    const resolutionRate = totalComplaints > 0 ? Math.round((resolvedCount / totalComplaints) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
                        <span>SUPPORT PORTAL</span>
                        <span className="text-gray-300">|</span>
                        <span>Maintenance Requests</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                Support &{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Maintenance
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Submit issues and track resolution in real-time
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <Shield size={14} className="text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">SLA Guaranteed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <FileText size={16} className="text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{totalComplaints}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Total Requests</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                            </div>
                            <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{resolutionRate}%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Resolved</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Construction size={16} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">In Progress</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock size={16} className="text-amber-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pending</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Submit Section */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Complaint Form */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50">
                                <div className="flex items-center gap-2">
                                    <MessageSquare size={16} className="text-indigo-600" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Lodge Issue</h2>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Category
                                        </label>
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="maintenance">🔧 Maintenance</option>
                                            <option value="cleanliness">🧹 Cleanliness</option>
                                            <option value="electrical">⚡ Electrical</option>
                                            <option value="plumbing">💧 Plumbing</option>
                                            <option value="other">📝 Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Priority
                                        </label>
                                        <select
                                            value={priority}
                                            onChange={(e) => setPriority(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        >
                                            <option value="low">🟢 Low</option>
                                            <option value="medium">🟡 Medium</option>
                                            <option value="high">🔴 High</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Subject
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Briefly state the problem..."
                                        required
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                                            Description
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAIPolish}
                                            disabled={isAIProcessing || !description}
                                            className="text-[9px] flex items-center gap-1 text-indigo-600 font-medium hover:text-indigo-700 transition-colors disabled:opacity-50"
                                        >
                                            <Wand2 size={10} />
                                            {isAIProcessing ? 'Processing...' : 'AI Refine'}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                            rows={4}
                                            placeholder="Explain the issue in detail..."
                                            required
                                        />
                                        <AnimatePresence>
                                            {isAIProcessing && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
                                                >
                                                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-medium">
                                                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                                        AI Refining...
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="w-full py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <Send size={14} />
                                    {createMutation.isPending ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </form>
                        </div>

                        {/* SLA Info Card */}
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                    <Clock size={16} className="text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-gray-900">SLA Commitment</p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        High priority issues addressed within <span className="font-semibold text-gray-700">24 hours</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2">
                                        Use emergency contact for life-safety issues
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Resolution Rate Card */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={14} className="text-gray-500" />
                                    <span className="text-xs font-semibold text-gray-600">Resolution Rate</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{resolutionRate}%</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                    style={{ width: `${resolutionRate}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* History Section */}
                    <div className="lg:col-span-7 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText size={16} className="text-gray-500" />
                                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Request History</h2>
                            </div>
                            <span className="text-[10px] text-gray-400">{totalComplaints} requests</span>
                        </div>

                        <div className="space-y-3">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                                            <div className="flex-1">
                                                <div className="h-3 bg-gray-200 rounded w-1/3 mb-1" />
                                                <div className="h-2 bg-gray-100 rounded w-1/4" />
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded w-full mb-2" />
                                        <div className="h-2 bg-gray-100 rounded w-2/3" />
                                    </div>
                                ))
                            ) : complaints?.length > 0 ? (
                                complaints.map((complaint: any, idx: number) => {
                                    const statusConfig = getStatusConfig(complaint.status);
                                    const priorityConfig = getPriorityConfig(complaint.priority);

                                    return (
                                        <motion.div
                                            key={complaint._id}
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all group"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1.5 rounded-lg ${statusConfig.bg}`}>
                                                        {statusConfig.icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                            {complaint.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex items-center gap-1">
                                                                {getCategoryIcon(complaint.category)}
                                                                <span className="text-[9px] text-gray-500 capitalize">{complaint.category}</span>
                                                            </div>
                                                            <span className="text-[9px] text-gray-300">•</span>
                                                            <span className="text-[9px] text-gray-400">
                                                                Ticket #{complaint._id.slice(-6)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${priorityConfig.bg} ${priorityConfig.color}`}>
                                                        {priorityConfig.label}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                                                {complaint.description}
                                            </p>

                                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[9px] text-gray-400">
                                                        {new Date(complaint.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    {complaint.resolvedAt && (
                                                        <span className="text-[9px] text-emerald-600 flex items-center gap-1">
                                                            <CheckCircle2 size={8} />
                                                            Resolved
                                                        </span>
                                                    )}
                                                </div>
                                                {complaint.status === 'resolved' && (
                                                    <button className="text-[9px] text-gray-400 hover:text-amber-500 transition-colors flex items-center gap-1">
                                                        <ThumbsUp size={10} />
                                                        Rate
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 size={28} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-base font-medium text-gray-900">All Clear!</h3>
                                    <p className="text-sm text-gray-500 mt-1">No active maintenance requests</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Complaints;