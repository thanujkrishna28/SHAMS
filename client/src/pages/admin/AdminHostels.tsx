import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Plus,
    Users,
    Layers,
    Phone,
    User,
    Trash2,
    ToggleLeft,
    ToggleRight,
    X,
    Building,
    Search
} from 'lucide-react';
import { useHostels, useCreateHostel, useUpdateHostel, useDeleteHostel, useCreateBlock } from '@/hooks/useHostels';
import toast from 'react-hot-toast';

const AdminHostels = () => {
    const { data: hostels, isLoading } = useHostels();
    const createHostel = useCreateHostel();
    const updateHostel = useUpdateHostel();
    const deleteHostel = useDeleteHostel();
    const createBlock = useCreateBlock();

    const [isHostelModalOpen, setIsHostelModalOpen] = useState(false);
    const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
    const [selectedHostel, setSelectedHostel] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    const [newHostel, setNewHostel] = useState({
        name: '',
        type: 'BOYS',
        description: '',
        wardenName: '',
        contactNumber: ''
    });

    const [newBlock, setNewBlock] = useState({
        name: '',
        hostel: '',
        floors: 1
    });

    const handleCreateHostel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createHostel.mutateAsync(newHostel);
            toast.success('Hostel created successfully');
            setIsHostelModalOpen(false);
            setNewHostel({ name: '', type: 'BOYS', description: '', wardenName: '', contactNumber: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create hostel');
        }
    };

    const handleToggleActive = async (hostel: any) => {
        try {
            await updateHostel.mutateAsync({ id: hostel._id, isActive: !hostel.isActive });
            toast.success(`Hostel ${hostel.isActive ? 'disabled' : 'enabled'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteHostel = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this hostel? This action cannot be undone.')) return;
        try {
            await deleteHostel.mutateAsync(id);
            toast.success('Hostel deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete hostel');
        }
    };

    const handleCreateBlock = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createBlock.mutateAsync({ ...newBlock, hostel: selectedHostel._id });
            toast.success('Block added successfully');
            setIsBlockModalOpen(false);
            setNewBlock({ name: '', hostel: '', floors: 1 });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add block');
        }
    };

    const filteredHostels = hostels?.filter((h: any) =>
        (filterType === 'ALL' || h.type === filterType) &&
        (h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.wardenName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Professional Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="flex-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hostel Infrastructure</h1>
                    <p className="text-gray-500 mt-2 flex items-center gap-2 font-medium">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        Manage buildings, blocks and core housing configuration
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-none sm:min-w-[280px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Find hostel or warden..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/5 focus:border-secondary transition-all font-medium text-sm shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-secondary/5 font-bold text-xs uppercase tracking-widest shadow-sm cursor-pointer"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="BOYS">Boys only</option>
                        <option value="GIRLS">Girls only</option>
                    </select>
                    <button
                        onClick={() => setIsHostelModalOpen(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl hover:bg-secondary-hover transition-all shadow-xl shadow-secondary/20 font-black text-xs uppercase tracking-widest active:scale-95 flex-1 sm:flex-none"
                    >
                        <Plus size={18} />
                        New Hostel
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <Building2 size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Hostels</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{hostels?.length || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <Layers size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Blocks</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{hostels?.reduce((acc: number, h: any) => acc + h.blockCount, 0) || 0}</p>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 text-gray-400">
                        <Building size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total capacity</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900">{hostels?.reduce((acc: number, h: any) => acc + h.roomCount, 0) || 0} Units</p>
                </div>
                <div className="bg-gradient-to-br from-secondary to-indigo-600 p-5 rounded-3xl shadow-lg shadow-secondary/20 text-white">
                    <div className="flex items-center gap-3 mb-3 opacity-80">
                        <Users size={18} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Avg Occupancy</span>
                    </div>
                    <p className="text-2xl font-black">{Math.round((hostels?.reduce((acc: number, h: any) => acc + h.occupancyRate, 0) / (hostels?.length || 1)) || 0)}%</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredHostels?.map((hostel: any) => (
                    <motion.div
                        key={hostel._id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-[32px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-secondary/10 transition-all overflow-hidden group flex flex-col"
                    >
                        <div className="p-8 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${hostel.type === 'BOYS' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'}`}>
                                    <Building2 size={28} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${hostel.type === 'BOYS' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                        {hostel.type}
                                    </span>
                                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${hostel.isActive ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${hostel.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                                        {hostel.isActive ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="text-xl font-black text-slate-900 group-hover:text-secondary transition-colors">{hostel.name}</h3>
                            <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">{hostel.description || 'Modern student housing with premium amenities and 24/7 security.'}</p>

                            <div className="grid grid-cols-3 gap-3 mt-8 p-1 bg-gray-50 rounded-2xl">
                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Blocks</p>
                                    <p className="text-lg font-black text-slate-900">{hostel.blockCount}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Units</p>
                                    <p className="text-lg font-black text-slate-900">{hostel.roomCount}</p>
                                </div>
                                <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm text-center">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-1">Fill</p>
                                    <p className="text-lg font-black text-slate-900">{hostel.occupancyRate}%</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 mt-8 pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warden</p>
                                        <p className="text-sm font-bold text-slate-700">{hostel.wardenName || 'Not Assigned'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact</p>
                                        <p className="text-sm font-black text-slate-700 font-mono tracking-tight">{hostel.contactNumber || 'No Contact'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-6 flex gap-3">
                            <button
                                onClick={() => { setSelectedHostel(hostel); setIsBlockModalOpen(true); }}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 rounded-2xl text-[11px] font-black tracking-widest text-slate-600 hover:border-secondary hover:text-secondary hover:shadow-lg transition-all active:scale-95"
                            >
                                <Plus size={16} />
                                ADD BLOCK
                            </button>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleToggleActive(hostel)}
                                    className={`w-12 h-12 flex items-center justify-center rounded-2xl border transition-all active:scale-95 ${hostel.isActive ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}
                                    title={hostel.isActive ? 'Disable Building' : 'Enable Building'}
                                >
                                    {hostel.isActive ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                </button>
                                <button
                                    onClick={() => handleDeleteHostel(hostel._id)}
                                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95"
                                    title="Demolish Records"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Create Hostel Modal */}
            <AnimatePresence>
                {isHostelModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Add New Hostel</h2>
                                    <p className="text-xs text-gray-500">Configure base infrastructure details</p>
                                </div>
                                <button onClick={() => setIsHostelModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateHostel} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Hostel Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                                        placeholder="e.g. Boys Main Hostel"
                                        value={newHostel.name}
                                        onChange={e => setNewHostel({ ...newHostel, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                                            value={newHostel.type}
                                            onChange={e => setNewHostel({ ...newHostel, type: e.target.value as any })}
                                        >
                                            <option value="BOYS">BOYS</option>
                                            <option value="GIRLS">GIRLS</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Warden Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                                            placeholder="Full Name"
                                            value={newHostel.wardenName}
                                            onChange={e => setNewHostel({ ...newHostel, wardenName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Contact Details</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none"
                                        placeholder="Phone Number"
                                        value={newHostel.contactNumber}
                                        onChange={e => setNewHostel({ ...newHostel, contactNumber: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none h-24 resize-none"
                                        placeholder="Add some details about this hostel..."
                                        value={newHostel.description}
                                        onChange={e => setNewHostel({ ...newHostel, description: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsHostelModalOpen(false)}
                                        className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createHostel.isPending}
                                        className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary-hover transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                                    >
                                        {createHostel.isPending ? 'Creating...' : 'Create Hostel'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Block Modal */}
            <AnimatePresence>
                {isBlockModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">Add Block to {selectedHostel?.name}</h2>
                                <button onClick={() => setIsBlockModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateBlock} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Block Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-bold"
                                        placeholder="e.g. Block A"
                                        value={newBlock.name}
                                        onChange={e => setNewBlock({ ...newBlock, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Number of Floors</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="20"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all outline-none font-bold"
                                        value={newBlock.floors}
                                        onChange={e => setNewBlock({ ...newBlock, floors: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsBlockModalOpen(false)}
                                        className="flex-1 py-3 bg-gray-50 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createBlock.isPending}
                                        className="flex-1 py-3 bg-secondary text-white rounded-xl font-bold hover:bg-secondary-hover transition-all shadow-lg shadow-secondary/20 disabled:opacity-50"
                                    >
                                        {createBlock.isPending ? 'Adding...' : 'Add Block'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminHostels;
