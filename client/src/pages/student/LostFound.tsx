import React from 'react';
import {
    Search,
    Plus,
    CheckCircle2,
    MapPin,
    Calendar,
    MessageCircle,
    Trash2,
    Trophy,
    Filter,
    X,
    Clock,
    User,
    Tag,
    AlertCircle
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

const LostFound = () => {
    const { user } = useAuthStore();
    const [items, setItems] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [filter, setFilter] = React.useState('all');

    const [formData, setFormData] = React.useState({
        title: '',
        description: '',
        type: 'Lost',
        category: 'Electronics',
        location: '',
        contactInfo: ''
    });

    const fetchItems = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/lost-found');
            setItems(data);
        } catch (error) {
            toast.error('Failed to load items');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchItems();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/lost-found', formData);
            toast.success('Report posted successfully!');
            setIsAddModalOpen(false);
            setFormData({ title: '', description: '', type: 'Lost', category: 'Electronics', location: '', contactInfo: '' });
            fetchItems();
        } catch (error) {
            toast.error('Failed to post report');
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await api.patch(`/lost-found/${id}`);
            toast.success('Marked as resolved!');
            fetchItems();
        } catch (error) {
            toast.error('Action failed');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this post?')) return;
        try {
            await api.delete(`/lost-found/${id}`);
            toast.success('Post removed');
            fetchItems();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        return item.type.toLowerCase() === filter.toLowerCase();
    });

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Electronics': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'Documents / ID': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'Personal Belongings': return 'bg-rose-50 text-rose-700 border-rose-100';
            case 'Keys / Wallets': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const stats = {
        total: items.length,
        active: items.filter(i => i.status === 'Active').length,
        resolved: items.filter(i => i.status === 'Resolved').length,
        lost: items.filter(i => i.type === 'Lost').length,
        found: items.filter(i => i.type === 'Found').length,
    };

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
                        <span>COMMUNITY SERVICES</span>
                        <span className="text-gray-300">|</span>
                        <span>Lost & Found</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                Lost &{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Found
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Help recover lost items and return found belongings
                            </p>
                        </div>

                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            Post Report
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-lg font-bold text-gray-900">{stats.total}</p>
                        <p className="text-[10px] text-gray-500">Total Reports</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-lg font-bold text-amber-600">{stats.active}</p>
                        <p className="text-[10px] text-gray-500">Active</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-lg font-bold text-emerald-600">{stats.resolved}</p>
                        <p className="text-[10px] text-gray-500">Resolved</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-lg font-bold text-rose-600">{stats.lost}</p>
                        <p className="text-[10px] text-gray-500">Lost Items</p>
                    </div>
                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <p className="text-lg font-bold text-emerald-600">{stats.found}</p>
                        <p className="text-[10px] text-gray-500">Found Items</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    {[
                        { key: 'all', label: 'All Reports', count: stats.total },
                        { key: 'lost', label: 'Lost Items', count: stats.lost, color: 'rose' },
                        { key: 'found', label: 'Found Items', count: stats.found, color: 'emerald' },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${filter === tab.key
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                            <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] ${filter === tab.key
                                    ? 'bg-white/20 text-white'
                                    : 'bg-gray-100 text-gray-500'
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-16 h-4 bg-gray-200 rounded" />
                                    <div className="w-12 h-4 bg-gray-100 rounded" />
                                </div>
                                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                                <div className="h-3 bg-gray-100 rounded w-2/3 mb-4" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search size={24} className="text-gray-400" />
                        </div>
                        <h3 className="text-base font-medium text-gray-900">No reports found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            {filter === 'all' ? 'Be the first to post a report' : `No ${filter} items reported yet`}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item, idx) => {
                                const isResolved = item.status === 'Resolved';
                                const categoryColor = getCategoryColor(item.category);

                                return (
                                    <motion.div
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={item._id}
                                        className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${isResolved
                                                ? 'border-gray-100 opacity-70'
                                                : 'border-gray-100 hover:shadow-md'
                                            }`}
                                    >
                                        {/* Header */}
                                        <div className="p-4 border-b border-gray-100">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${item.type === 'Lost'
                                                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                                        }`}>
                                                        {item.type}
                                                    </span>
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${categoryColor}`}>
                                                        {item.category}
                                                    </span>
                                                </div>
                                                {isResolved && (
                                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[8px] font-medium">
                                                        Resolved
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                                                {item.title}
                                            </h3>
                                        </div>

                                        {/* Body */}
                                        <div className="p-4 space-y-3">
                                            <p className="text-xs text-gray-600 line-clamp-2">
                                                {item.description}
                                            </p>

                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <MapPin size={12} />
                                                    <span className="text-[11px] text-gray-500">{item.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-400">
                                                    <Calendar size={12} />
                                                    <span className="text-[11px] text-gray-500">
                                                        {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </span>
                                                </div>
                                                {item.contactInfo && (
                                                    <div className="flex items-center gap-2 text-gray-400">
                                                        <MessageCircle size={12} />
                                                        <span className="text-[11px] text-gray-500 truncate">{item.contactInfo}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Footer */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-indigo-50 rounded-full flex items-center justify-center">
                                                        <span className="text-[9px] font-semibold text-indigo-600 uppercase">
                                                            {item.reportedBy?.name?.charAt(0) || 'U'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[9px] text-gray-500">
                                                        {item.reportedBy?.name?.split(' ')[0] || 'Anonymous'}
                                                    </span>
                                                </div>

                                                <div className="flex gap-1">
                                                    {(item.reportedBy?._id === user?._id || user?.role === 'admin') && item.status === 'Active' && (
                                                        <button
                                                            onClick={() => handleResolve(item._id)}
                                                            className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                            title="Mark as Resolved"
                                                        >
                                                            <CheckCircle2 size={14} />
                                                        </button>
                                                    )}
                                                    {(item.reportedBy?._id === user?._id || user?.role === 'admin') && (
                                                        <button
                                                            onClick={() => handleDelete(item._id)}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                                <h3 className="text-lg font-semibold text-white">New Report</h3>
                                <p className="text-xs text-white/70 mt-0.5">Post details about lost or found items</p>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                                {/* Type Selector */}
                                <div className="flex gap-3">
                                    {['Lost', 'Found'].map(t => (
                                        <button
                                            key={t}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: t as 'Lost' | 'Found' })}
                                            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${formData.type === t
                                                    ? t === 'Lost'
                                                        ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                                        : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                    : 'bg-gray-50 text-gray-400 border border-gray-200'
                                                }`}
                                        >
                                            {t} Item
                                        </button>
                                    ))}
                                </div>

                                {/* Form Fields */}
                                <div className="space-y-3">
                                    <input
                                        required
                                        placeholder="Item name (e.g., Blue Dell Laptop)"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />

                                    <textarea
                                        required
                                        rows={3}
                                        placeholder="Provide details like brand, color, distinguishing marks..."
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />

                                    <div className="grid grid-cols-2 gap-3">
                                        <input
                                            required
                                            placeholder="Last seen location"
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.location}
                                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                                        />
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            <option>Electronics</option>
                                            <option>Documents / ID</option>
                                            <option>Personal Belongings</option>
                                            <option>Keys / Wallets</option>
                                            <option>Other</option>
                                        </select>
                                    </div>

                                    <input
                                        placeholder="Contact WhatsApp/Phone (Optional)"
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        value={formData.contactInfo}
                                        onChange={e => setFormData({ ...formData, contactInfo: e.target.value })}
                                    />
                                </div>

                                {/* Modal Actions */}
                                <div className="flex gap-3 pt-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Post Report
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default LostFound;