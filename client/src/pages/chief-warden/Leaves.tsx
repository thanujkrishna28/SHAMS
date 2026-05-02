import { useState } from 'react';
import { useAllLeaves, useUpdateLeaveStatus } from '@/hooks/useAdmin';
import {
    Calendar, CheckCircle, Clock, Search, ThumbsUp, X, Loader2,
    ChevronLeft, ChevronRight, Filter, ShieldAlert, Users,
    PlaneLanding, PlaneTakeoff, History, Activity
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

const Leaves = () => {
    const [page, setPage] = useState(1);
    const { data: leaves, isLoading } = useAllLeaves(page);
    const { user } = useAuthStore();
    const updateStatus = useUpdateLeaveStatus();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateStatus.mutateAsync({ id, status });
            toast.success(`Leave request ${status}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredLeaves = leaves?.data?.filter((leave: any) => {
        const matchesFilter = filter === 'all' || leave.status === filter;
        const matchesSearch = leave.student?.name.toLowerCase().includes(search.toLowerCase()) ||
            leave.student?.profile?.studentId?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const metrics = {
        pending: leaves?.data?.filter((l: any) => l.status === 'pending').length || 0,
        approved: leaves?.data?.filter((l: any) => l.status === 'approved').length || 0,
        total: leaves?.data?.length || 0,
        recommended: leaves?.data?.filter((l: any) => l.status === 'recommended').length || 0
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading leave requests...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage student leave requests and approvals</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-gray-100 rounded-lg">
                            <p className="text-xs text-gray-500">Authorization Level</p>
                            <p className="text-sm font-medium text-gray-900">{user?.role === 'warden' ? 'Recommendation Only' : 'Final Approval'}</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.pending}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <ShieldAlert size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Recommended</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.recommended}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Approved</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.approved}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <History size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.total}</p>
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
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="recommended">Recommended</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Leave Requests Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeaves?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Activity size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No leave requests found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredLeaves?.map((leave: any) => (
                                    <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                    {leave.student?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{leave.student?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{leave.student?.profile?.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1 text-sm text-gray-700">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    <span>{new Date(leave.startDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock size={12} className="text-gray-400" />
                                                    <span>to {new Date(leave.endDate).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm text-gray-600 line-clamp-2">{leave.reason}</p>
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {leave.type}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={leave.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {user?.role === 'warden' ? (
                                                leave.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(leave._id, 'recommended')}
                                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1 ml-auto"
                                                    >
                                                        <ThumbsUp size={14} />
                                                        Recommend
                                                    </button>
                                                )
                                            ) : (
                                                (leave.status === 'pending' || leave.status === 'recommended') && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleUpdateStatus(leave._id, 'rejected')}
                                                            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <X size={14} />
                                                            Reject
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateStatus(leave._id, 'approved')}
                                                            className="px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1"
                                                        >
                                                            <CheckCircle size={14} />
                                                            Approve
                                                        </button>
                                                    </div>
                                                )
                                            )}
                                            {leave.status === 'approved' && (
                                                <div className="flex items-center justify-end gap-1 text-green-600">
                                                    <PlaneLanding size={14} />
                                                    <span className="text-xs font-medium">Approved</span>
                                                </div>
                                            )}
                                            {leave.status === 'rejected' && (
                                                <div className="flex items-center justify-end gap-1 text-red-600">
                                                    <X size={14} />
                                                    <span className="text-xs font-medium">Rejected</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <p className="text-xs text-gray-500">
                        Showing {filteredLeaves?.length || 0} requests
                    </p>
                    <div className="flex items-center gap-3">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded-lg text-sm font-medium text-gray-700">
                            Page {page}
                        </span>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        recommended: { label: 'Recommended', className: 'bg-blue-100 text-blue-700' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    };

    const current = config[status] || config.pending;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Leaves;
const current = config[status] || config.pending;

return (
    <span className={`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm ${current.className}`}>
        {current.label}
    </span>
);
};

        </div >
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        approved: { label: 'Approved', className: 'bg-green-100 text-green-700' },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        recommended: { label: 'Recommended', className: 'bg-blue-100 text-blue-700' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    };

    const current = config[status] || config.pending;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Leaves;