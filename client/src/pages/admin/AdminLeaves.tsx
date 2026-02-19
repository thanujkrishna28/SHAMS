import { useState } from 'react';
import { useAllLeaves, useUpdateLeaveStatus } from '@/hooks/useAdmin';
import { Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLeaves = () => {
    const [page, setPage] = useState(1);
    const { data: leaves, isLoading } = useAllLeaves(page);
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

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-gray-500">Review and approve student leave requests</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by student..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Leave Period</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Reason</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLeaves?.map((leave: any) => (
                                <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
                                                {leave.student?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{leave.student?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{leave.student?.profile?.studentId || 'No ID'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span className="text-sm">
                                                {new Date(leave.startDate).toLocaleDateString()}
                                                <span className="mx-2 text-gray-300">→</span>
                                                {new Date(leave.endDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs truncate text-sm text-gray-600" title={leave.reason}>
                                            {leave.reason}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                            {leave.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${leave.status === 'approved'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : leave.status === 'rejected'
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {leave.status === 'approved' && <CheckCircle size={12} />}
                                            {leave.status === 'rejected' && <XCircle size={12} />}
                                            {leave.status === 'pending' && <Clock size={12} />}
                                            <span className="capitalize">{leave.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {leave.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(leave._id, 'approved')}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Approve"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(leave._id, 'rejected')}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Reject"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredLeaves?.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Calendar size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No leave requests found</h3>
                            <p className="text-gray-500 mt-1">There are no pending requests matching your criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLeaves;
