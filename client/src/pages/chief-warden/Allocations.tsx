import React, { useState } from 'react';
import {
    Search, Filter, Clock, Building2, Layers, Home,
    CheckCircle, XCircle, RefreshCw, Activity, ShieldCheck,
    Database, Users, ChevronRight, LayoutDashboard
} from 'lucide-react';
import { useAllAllocations, useUpdateAllocationStatus } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

const Allocations = () => {
    const { data: allocations, isLoading, refetch } = useAllAllocations();
    const updateAllocation = useUpdateAllocationStatus();

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredAllocations = allocations?.filter((alloc: any) =>
        (statusFilter === 'all' || alloc.status === statusFilter) &&
        (alloc.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alloc.student?.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alloc.student?.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const metrics = {
        pending: allocations?.filter((a: any) => a.status === 'pending').length || 0,
        approved: allocations?.filter((a: any) => a.status === 'approved').length || 0,
        total: allocations?.length || 0,
        efficiency: allocations?.length ? Math.round(((allocations.filter((a: any) => a.status !== 'pending').length) / allocations.length) * 100) : 0
    };

    const handleUpdateStatus = (id: string, status: string) => {
        updateAllocation.mutate({ id, status, adminComment: `Status updated to ${status}` }, {
            onSuccess: () => toast.success(`Allocation ${status} successfully`),
            onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to update status')
        });
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading allocations...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Room Allocations</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage student room assignments and approvals</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pending Review</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.pending}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ShieldCheck size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Active Allocations</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.approved}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Database size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Requests</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.total}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Processing Rate</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.efficiency}%</p>
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
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Allocations Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hostel / Block</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAllocations?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <LayoutDashboard size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No allocation records found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAllocations?.map((alloc: any) => (
                                    <tr key={alloc._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                    {alloc.student?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{alloc.student?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">#{alloc.student?.profile?.studentId || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Building2 size={14} className="text-gray-400" />
                                                    <span>{alloc.hostel?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Layers size={12} className="text-gray-400" />
                                                    <span>{alloc.block?.name || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-gray-100 rounded-lg">
                                                    <Home size={16} className="text-gray-500" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Room {alloc.room?.roomNumber || '?'}</p>
                                                    <p className="text-xs text-gray-500">Floor {alloc.room?.floor || '0'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={alloc.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {alloc.status === 'pending' ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(alloc._id, 'rejected')}
                                                        className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                                        title="Reject"
                                                    >
                                                        <XCircle size={14} />
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(alloc._id, 'approved')}
                                                        className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Approve
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1 text-xs text-gray-400">
                                                    <Clock size={12} />
                                                    {new Date(alloc.updatedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
                    Total: {filteredAllocations?.length || 0} allocation records
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    };

    const current = config[status] || config.pending;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Allocations;

        </div >
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    };

    const current = config[status] || config.pending;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Allocations;