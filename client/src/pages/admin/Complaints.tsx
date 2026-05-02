import { useState } from 'react';
import { useAllComplaints, useUpdateComplaintStatus } from '@/hooks/useAdmin';
import {
    MessageSquare, CheckCircle, Clock, Search, AlertTriangle,
    ArrowUpCircle, CheckSquare, Loader2, FastForward, ChevronLeft, ChevronRight, Eye, X,
    Calendar,
    User,
    Mail,
    ShieldAlert,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const Complaints = () => {
    const [page, setPage] = useState(1);
    const { data: complaints, isLoading } = useAllComplaints(page);
    const updateStatus = useUpdateComplaintStatus();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateStatus.mutateAsync({ id, status });
            toast.success(`Complaint ${status} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredComplaints = complaints?.data?.filter((complaint: any) => {
        const matchesFilter = filter === 'all' || complaint.status === filter;
        const matchesSearch = complaint.title.toLowerCase().includes(search.toLowerCase()) ||
            complaint.student?.name.toLowerCase().includes(search.toLowerCase()) ||
            complaint.student?.profile?.studentId?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading complaints...</p>
            </div>
        </div>
    );

    const stats = {
        total: complaints?.data?.length || 0,
        pending: complaints?.data?.filter((c: any) => c.status === 'pending').length || 0,
        inProgress: complaints?.data?.filter((c: any) => c.status === 'in-progress').length || 0,
        escalated: complaints?.data?.filter((c: any) => c.status === 'escalated').length || 0,
        resolved: complaints?.data?.filter((c: any) => c.status === 'resolved').length || 0,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Complaint Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage and track student complaints</p>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student, title, or ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <MessageSquare size={18} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FastForward size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">In Progress</p>
                            <p className="text-xl font-bold text-gray-900">{stats.inProgress}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle size={18} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Escalated</p>
                            <p className="text-xl font-bold text-gray-900">{stats.escalated}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Resolved</p>
                            <p className="text-xl font-bold text-gray-900">{stats.resolved}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
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
                                <option value="in-progress">In Progress</option>
                                <option value="escalated">Escalated</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                    <span className="text-sm text-gray-500">{filteredComplaints?.length || 0} complaints found</span>
                </div>
            </div>

            {/* Complaints Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredComplaints?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <ShieldAlert size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No complaints found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredComplaints?.map((complaint: any) => (
                                    <tr key={complaint._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                    {complaint.student?.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{complaint.student?.name || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-500">{complaint.student?.profile?.studentId || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                                                <p className="text-xs text-gray-500 truncate">{complaint.description}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                {complaint.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <PriorityBadge priority={complaint.priority} />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={complaint.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedComplaint(complaint)}
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {complaint.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(complaint._id, 'in-progress')}
                                                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Start Processing"
                                                    >
                                                        <FastForward size={16} />
                                                    </button>
                                                )}
                                                {['pending', 'in-progress'].includes(complaint.status) && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(complaint._id, 'escalated')}
                                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Escalate"
                                                    >
                                                        <ArrowUpCircle size={16} />
                                                    </button>
                                                )}
                                                {complaint.status !== 'resolved' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(complaint._id, 'resolved')}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Resolve"
                                                    >
                                                        <CheckSquare size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">Page {page}</span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Complaint Details Modal */}
            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <ShieldAlert size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Complaint Details</h2>
                                    <p className="text-xs text-gray-500">ID: {selectedComplaint._id.slice(-8)}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedComplaint(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Student Info */}
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg">
                                    {selectedComplaint.student?.name?.charAt(0) || '?'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{selectedComplaint.student?.name || 'Unknown'}</h3>
                                    <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-500">
                                        <span>{selectedComplaint.student?.profile?.studentId}</span>
                                        <span>{selectedComplaint.student?.email}</span>
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <PriorityBadge priority={selectedComplaint.priority} />
                                    <p className="text-xs text-gray-400 mt-1">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* Complaint Info */}
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                                <p className="text-lg font-semibold text-gray-900">{selectedComplaint.title}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg">
                                        {selectedComplaint.category}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                    <StatusBadge status={selectedComplaint.status} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                                <div className="p-4 bg-gray-50 rounded-lg text-gray-700 leading-relaxed">
                                    "{selectedComplaint.description}"
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                {selectedComplaint.status !== 'resolved' && (
                                    <button
                                        onClick={() => {
                                            handleUpdateStatus(selectedComplaint._id, 'resolved');
                                            setSelectedComplaint(null);
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <CheckSquare size={16} />
                                        Mark as Resolved
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedComplaint(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
    const config: any = {
        high: { label: 'High', className: 'bg-red-100 text-red-700' },
        medium: { label: 'Medium', className: 'bg-blue-100 text-blue-700' },
        low: { label: 'Low', className: 'bg-gray-100 text-gray-700' },
    };
    const current = config[priority] || config.low;
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        resolved: { label: 'Resolved', className: 'bg-green-100 text-green-700' },
        'in-progress': { label: 'In Progress', className: 'bg-blue-100 text-blue-700' },
        escalated: { label: 'Escalated', className: 'bg-red-100 text-red-700' },
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    };
    const current = config[status] || config.pending;
    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Complaints;