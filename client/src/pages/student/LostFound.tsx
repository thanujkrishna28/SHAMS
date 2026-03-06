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

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Trophy className="text-amber-500" size={32} />
                        Lost & Found
                    </h1>
                    <p className="text-slate-500 font-medium">Helping the community recover lost essentials</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-95 hover:bg-black"
                >
                    <Plus size={20} />
                    Post New Report
                </button>
            </div>

            {/* Quick Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {['All', 'Lost', 'Found'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f.toLowerCase())}
                        className={`
                            px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all
                            ${filter === f.toLowerCase() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}
                        `}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode='popLayout'>
                    {filteredItems.map((item) => (
                        <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            key={item._id}
                            className={`
                                bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col relative
                                ${item.status === 'Resolved' ? 'opacity-60 grayscale' : ''}
                            `}
                        >
                            {/* Type Indicator */}
                            <div className={`
                                px-6 py-6 flex flex-col gap-2 relative z-10
                                ${item.type === 'Lost' ? 'bg-red-50/50' : 'bg-emerald-50/50'}
                            `}>
                                <div className="flex items-center justify-between">
                                    <span className={`
                                        px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                        ${item.type === 'Lost' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}
                                    `}>
                                        {item.type}
                                    </span>
                                    {item.status === 'Resolved' && (
                                        <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            RESOLVED
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-black text-slate-900 line-clamp-1">{item.title}</h3>
                            </div>

                            <div className="p-6 flex-1 space-y-4">
                                <p className="text-sm text-slate-500 font-medium line-clamp-3">{item.description}</p>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <MapPin size={16} className="shrink-0" />
                                        <span className="text-xs font-bold">{item.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <Calendar size={16} className="shrink-0" />
                                        <span className="text-xs font-bold">{new Date(item.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400">
                                        <MessageCircle size={16} className="shrink-0" />
                                        <span className="text-xs font-bold truncate">{item.contactInfo || 'Check profile phone'}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs uppercase">
                                            {item.reportedBy?.name?.charAt(0)}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase">{item.reportedBy?.name}</p>
                                    </div>

                                    <div className="flex gap-2">
                                        {(item.reportedBy?._id === user?._id || user?.role === 'admin') && item.status === 'Active' && (
                                            <button
                                                onClick={() => handleResolve(item._id)}
                                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                                                title="Mark as Resolved"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                        )}
                                        {(item.reportedBy?._id === user?._id || user?.role === 'admin') && (
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {!isLoading && filteredItems.length === 0 && (
                <div className="text-center py-24">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-slate-300" size={32} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900">No matching reports found</h3>
                    <p className="text-slate-500">Be the first to help someone by posting a report!</p>
                </div>
            )}

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl relative overflow-hidden">
                            <div className="p-8 bg-slate-900 text-white relative">
                                <h3 className="text-2xl font-black">New Report</h3>
                                <p className="text-slate-400 text-sm font-medium">Post details about lost or found items</p>
                            </div>
                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                <div className="flex gap-4 mb-4">
                                    {['Lost', 'Found'].map(t => (
                                        <button
                                            key={t} type="button"
                                            onClick={() => setFormData({ ...formData, type: (t as 'Lost' | 'Found') })}
                                            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${formData.type === t ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
                                        >
                                            {t} Item
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <input required placeholder="Item Name (e.g. Blue Dell Laptop)" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                                    <textarea required rows={3} placeholder="Provide details like brand, color, distinguishing marks..." className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input required placeholder="Last seen location" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                        <select className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                            <option>Electronics</option>
                                            <option>Documents / ID</option>
                                            <option>Personal Belongings</option>
                                            <option>Keys / Wallets</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <input placeholder="Contact WhatsApp/Phone (Optional)" className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-indigo-500/10 font-bold" value={formData.contactInfo} onChange={e => setFormData({ ...formData, contactInfo: e.target.value })} />
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 active:scale-95">Post Report</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LostFound;
