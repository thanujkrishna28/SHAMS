import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Clock } from 'lucide-react';
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
            onError: () => toast.error('Failed to update allocation')
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
                    <h1 className="text-2xl font-bold text-gray-900">Allocation Requests</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage student room allocation requests</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Student Details</th>
                                <th className="px-6 py-4">Request Type</th>
                                <th className="px-6 py-4">Requested Date</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAllocations?.length > 0 ? (
                                filteredAllocations.map((alloc: any) => (
                                    <tr key={alloc._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                                    {alloc.student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{alloc.student?.name || 'Unknown'}</div>
                                                    <div className="text-xs text-gray-500">{alloc.student?.email || 'No Email'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900 font-medium">
                                                {alloc.lockedRoom ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                                        Specific Room: {alloc.lockedRoom.roomNumber} ({alloc.lockedRoom.block})
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                                        Block Pref: {alloc.requestedBlock}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-gray-400" />
                                                {new Date(alloc.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide
                                                ${alloc.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    alloc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'}`}
                                            >
                                                {alloc.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {alloc.status === 'pending' ? (
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(alloc._id, 'approved')}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded hover:bg-indigo-700 transition-colors shadow-sm"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(alloc._id, 'rejected')}
                                                        className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50 transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No actions available</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No allocations found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 text-sm text-gray-500">
                    Showing {filteredAllocations?.length || 0} allocation requests
                </div>
            </div>
        </motion.div>
    );
};

export default AdminAllocations;
