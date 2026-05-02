import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    UserPlus,
    Mail,
    Lock,
    Shield,
    Loader2,
    CheckCircle2,
    AlertCircle,
    User as UserIcon,
    Trash2,
    Activity,
    X
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const WardenManagement = () => {
    const queryClient = useQueryClient();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: wardens, isLoading: isLoadingWardens } = useQuery({
        queryKey: ['wardens'],
        queryFn: async () => {
            const { data } = await api.get('/wardens');
            return data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (newData: any) => {
            return await api.post('/wardens', newData);
        },
        onSuccess: () => {
            toast.success('Warden added successfully');
            setIsModalOpen(false);
            setName('');
            setEmail('');
            setPassword('');
            queryClient.invalidateQueries({ queryKey: ['wardens'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to add warden');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, email, password });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Warden Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage wardens and security personnel</p>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <UserPlus size={16} />
                        Add Warden
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Shield size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Wardens</p>
                            <p className="text-xl font-bold text-gray-900">{wardens?.length || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle2 size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Active</p>
                            <p className="text-xl font-bold text-gray-900">{wardens?.length || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-gray-900">0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Coverage</p>
                            <p className="text-xl font-bold text-gray-900">100%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Wardens Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoadingWardens ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                                <div className="w-16 h-6 bg-gray-200 rounded-full" />
                            </div>
                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6" />
                            <div className="pt-4 border-t border-gray-100 flex justify-between">
                                <div className="h-3 bg-gray-200 rounded w-20" />
                                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                            </div>
                        </div>
                    ))
                ) : wardens?.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-gray-200">
                        <Shield size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No Wardens Found</h3>
                        <p className="text-sm text-gray-500">Click "Add Warden" to create a new warden account</p>
                    </div>
                ) : (
                    wardens?.map((warden: any) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={warden._id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6"
                        >
                            <div className="flex items-start justify-between mb-5">
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <Shield size={22} className="text-gray-600" />
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded ${warden.role === 'chief_warden' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {warden.role === 'chief_warden' ? 'Chief Warden' : 'Warden'}
                                </span>
                            </div>

                            <h3 className="font-semibold text-gray-900 text-lg mb-1">{warden.name}</h3>
                            <div className="flex items-center gap-1 text-gray-500 text-sm mb-6">
                                <Mail size={14} />
                                {warden.email}
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                                <span className="text-xs text-gray-400 capitalize">{warden.role?.replace('_', ' ')}</span>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Add Warden Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <UserPlus size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Add New Warden</h2>
                                    <p className="text-xs text-gray-500">Create warden account</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter full name"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="warden@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createMutation.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                                    {createMutation.isPending ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Shield size={16} />
                                            Add Warden
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WardenManagement;