import React, { useState } from 'react';
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
    Search,
    Mail,
    RefreshCw,
    Activity,
    Shield,
    Globe,
    Zap,
    Filter
} from 'lucide-react';
import { useHostels, useCreateHostel, useUpdateHostel, useDeleteHostel, useCreateBlock } from '@/hooks/useHostels';
import toast from 'react-hot-toast';

const Hostels = () => {
    const { data: hostels, isLoading, refetch } = useHostels();
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
        chiefWardenName: '',
        chiefWardenEmail: '',
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
            setNewHostel({
                name: '',
                type: 'BOYS',
                description: '',
                chiefWardenName: '',
                chiefWardenEmail: '',
                contactNumber: ''
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create hostel');
        }
    };

    const handleToggleActive = async (hostel: any) => {
        try {
            await updateHostel.mutateAsync({ id: hostel._id, isActive: !hostel.isActive });
            toast.success(`Hostel ${hostel.isActive ? 'deactivated' : 'activated'}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteHostel = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this hostel?')) return;
        try {
            await deleteHostel.mutateAsync(id);
            toast.success('Hostel deleted successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete');
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
            h.chiefWardenName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            h.chiefWardenEmail?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading hostels...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage hostels, blocks, and infrastructure</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setIsHostelModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Hostel
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Hostels</p>
                            <p className="text-xl font-bold text-gray-900">{hostels?.length || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Layers size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Blocks</p>
                            <p className="text-xl font-bold text-gray-900">{hostels?.reduce((acc: number, h: any) => acc + (h.blockCount || 0), 0) || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Building size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Rooms</p>
                            <p className="text-xl font-bold text-gray-900">{hostels?.reduce((acc: number, h: any) => acc + (h.roomCount || 0), 0) || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Avg Occupancy</p>
                            <p className="text-xl font-bold text-gray-900">
                                {Math.round((hostels?.reduce((acc: number, h: any) => acc + (h.occupancyRate || 0), 0) / (hostels?.length || 1)) || 0)}%
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="ALL">All Types</option>
                                <option value="BOYS">Boys Only</option>
                                <option value="GIRLS">Girls Only</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, warden, or email..."
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Hostel Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHostels?.map((hostel: any) => (
                    <div
                        key={hostel._id}
                        className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden"
                    >
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-3 rounded-lg ${hostel.type === 'BOYS' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                                    <Building2 size={24} />
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${hostel.type === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                        {hostel.type}
                                    </span>
                                    <div className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${hostel.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${hostel.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        {hostel.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-2">{hostel.name}</h3>
                            <p className="text-sm text-gray-500 mb-6 line-clamp-2">
                                {hostel.description || 'No description provided'}
                            </p>

                            <div className="grid grid-cols-3 gap-3 mb-6">
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 mb-1">Blocks</p>
                                    <p className="text-lg font-bold text-gray-900">{hostel.blockCount || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 mb-1">Rooms</p>
                                    <p className="text-lg font-bold text-gray-900">{hostel.roomCount || 0}</p>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <p className="text-xs text-gray-500 mb-1">Occupancy</p>
                                    <p className="text-lg font-bold text-gray-900">{hostel.occupancyRate || 0}%</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg">
                                        <User size={14} className="text-gray-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Chief Warden</p>
                                        <p className="text-sm font-medium text-gray-900">{hostel.chiefWardenName || 'Not assigned'}</p>
                                    </div>
                                </div>
                                {hostel.chiefWardenEmail && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Mail size={14} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="text-sm text-gray-700 truncate">{hostel.chiefWardenEmail}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 flex gap-2 border-t border-gray-100">
                            <button
                                onClick={() => { setSelectedHostel(hostel); setIsBlockModalOpen(true); }}
                                className="flex-1 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
                            >
                                <Plus size={14} />
                                Add Block
                            </button>
                            <button
                                onClick={() => handleToggleActive(hostel)}
                                className={`px-3 py-2 rounded-lg border transition-colors ${hostel.isActive ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-green-50 border-green-200 text-green-600'}`}
                            >
                                {hostel.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                            </button>
                            <button
                                onClick={() => handleDeleteHostel(hostel._id)}
                                className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Hostel Modal */}
            {isHostelModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Building2 size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Add New Hostel</h2>
                                    <p className="text-xs text-gray-500">Register infrastructure</p>
                                </div>
                            </div>
                            <button onClick={() => setIsHostelModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateHostel} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Hostel Name</label>
                                <div className="relative">
                                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newHostel.name}
                                        onChange={(e) => setNewHostel({ ...newHostel, name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter hostel name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={newHostel.type}
                                        onChange={e => setNewHostel({ ...newHostel, type: e.target.value as any })}
                                    >
                                        <option value="BOYS">Boys</option>
                                        <option value="GIRLS">Girls</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Chief Warden</label>
                                    <div className="relative">
                                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={newHostel.chiefWardenName}
                                            onChange={(e) => setNewHostel({ ...newHostel, chiefWardenName: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Warden name"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                                    <div className="relative">
                                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={newHostel.chiefWardenEmail}
                                            onChange={(e) => setNewHostel({ ...newHostel, chiefWardenEmail: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Email address"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Contact</label>
                                    <div className="relative">
                                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={newHostel.contactNumber}
                                            onChange={(e) => setNewHostel({ ...newHostel, contactNumber: e.target.value })}
                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Contact number"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={3}
                                    placeholder="Hostel description..."
                                    value={newHostel.description}
                                    onChange={e => setNewHostel({ ...newHostel, description: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsHostelModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createHostel.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    {createHostel.isPending ? 'Creating...' : 'Create Hostel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Block Modal */}
            {isBlockModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div>
                                <h2 className="text-sm font-bold text-gray-900">Add Block</h2>
                                <p className="text-xs text-gray-500">{selectedHostel?.name}</p>
                            </div>
                            <button onClick={() => setIsBlockModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateBlock} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Block Name</label>
                                <div className="relative">
                                    <Layers size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={newBlock.name}
                                        onChange={(e) => setNewBlock({ ...newBlock, name: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter block name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Number of Floors</label>
                                <div className="relative">
                                    <Building size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        min="1"
                                        value={newBlock.floors}
                                        onChange={(e) => setNewBlock({ ...newBlock, floors: parseInt(e.target.value) })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsBlockModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createBlock.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    {createBlock.isPending ? 'Adding...' : 'Add Block'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Hostels;