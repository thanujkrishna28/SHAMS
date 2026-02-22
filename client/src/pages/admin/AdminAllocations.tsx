import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock, Building2, Layers, Home } from 'lucide-react';
import { useAllAllocations, useUpdateAllocationStatus } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

const AdminAllocations = () => {
    const { data: allocations, isLoading } = useAllAllocations();
    const updateAllocation = useUpdateAllocationStatus();

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAllocations = allocations?.filter((alloc: any) =>
        (statusFilter === 'all' || alloc.status === statusFilter) &&
        (alloc.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alloc.student?.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleUpdateStatus = (id: string, status: string) => {
        updateAllocation.mutate({ id, status, adminComment: `Marked as ${status} by Admin` }, {
            onSuccess: () => toast.success(`Allocation ${status} successfully`),
            onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update allocation')
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Allocation Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage infrastructure assignments for students</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none w-full sm:w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary/20 focus:border-secondary outline-none appearance-none bg-white cursor-pointer font-bold text-gray-700"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">
                                <th className="px-6 py-5">Student Information</th>
                                <th className="px-6 py-5">Hostel & Block</th>
                                <th className="px-6 py-5">Room Details</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAllocations?.length > 0 ? (
                                filteredAllocations.map((alloc: any) => (
                                    <tr key={alloc._id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                                                    {alloc.student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900">{alloc.student?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-400 font-medium">#{alloc.student?.profile?.studentId || 'No ID'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Building2 size={14} className="text-gray-400" />
                                                    {alloc.hostel?.name || 'N/A'}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                                                    <Layers size={14} />
                                                    {alloc.block?.name || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
                                                    <Home size={18} />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-gray-900">Room {alloc.room?.roomNumber || '?'}</div>
                                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Floor {alloc.room?.floor || '0'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                                ${alloc.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                    alloc.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                                                        'bg-amber-100 text-amber-700'}`}
                                            >
                                                {alloc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {alloc.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(alloc._id, 'approved')}
                                                        className="px-4 py-2 bg-secondary text-white text-xs font-bold rounded-xl hover:bg-secondary-hover transition-all shadow-lg shadow-secondary/20"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(alloc._id, 'rejected')}
                                                        className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1.5 text-xs text-gray-400 font-medium italic">
                                                    <Clock size={12} />
                                                    {new Date(alloc.updatedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="max-w-xs mx-auto">
                                            <Search size={40} className="mx-auto text-gray-100 mb-4" />
                                            <h4 className="text-gray-900 font-bold">No Records Found</h4>
                                            <p className="text-sm text-gray-400">We couldn't find any allocation requests matching your filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                    Showing {filteredAllocations?.length || 0} active requests
                </div>
            </div>
        </motion.div>
    );
};

export default AdminAllocations;
