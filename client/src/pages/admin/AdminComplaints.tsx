import { useState } from 'react';
import { useAllComplaints, useUpdateComplaintStatus } from '@/hooks/useAdmin';
import { MessageSquare, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
    const [page, setPage] = useState(1);
    const { data: complaints, isLoading } = useAllComplaints(page);
    const updateStatus = useUpdateComplaintStatus();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateStatus.mutateAsync({ id, status });
            toast.success(`Complaint marked as ${status}`);
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

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
                    <p className="text-gray-500">Manage and resolve student complaints</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search complaints..."
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
                        <option value="resolved">Resolved</option>
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
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Issue</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredComplaints?.map((complaint: any) => (
                                <tr key={complaint._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                                {complaint.student?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{complaint.student?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-500">{complaint.student?.profile?.studentId || 'No ID'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <p className="text-sm font-medium text-gray-900 truncate">{complaint.title}</p>
                                            <p className="text-xs text-gray-500 truncate">{complaint.description}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                            {complaint.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                                            <Clock size={14} />
                                            {new Date(complaint.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${complaint.status === 'resolved'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                            : complaint.status === 'rejected'
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-amber-50 text-amber-700 border-amber-100'
                                            }`}>
                                            {complaint.status === 'resolved' && <CheckCircle size={12} />}
                                            {complaint.status === 'rejected' && <XCircle size={12} />}
                                            {complaint.status === 'pending' && <Clock size={12} />}
                                            <span className="capitalize">{complaint.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {complaint.status === 'pending' && (
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleUpdateStatus(complaint._id, 'resolved')}
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                                    title="Mark Resolved"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(complaint._id, 'rejected')}
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

                    {filteredComplaints?.length === 0 && (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <MessageSquare size={32} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No complaints found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminComplaints;
