import { useState } from 'react';
import {
    Search, CheckCircle, XCircle, Clock, UserCheck,
    LogIn, LogOut, Filter, Calendar,
    Loader2, RefreshCw,
    Users, Eye, Phone, Mail, X, ShieldAlert,
    Activity, History
} from 'lucide-react';
import { useAllVisitors, useUpdateVisitorStatus } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

const Visitors = () => {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const { data: visitors, isLoading, refetch } = useAllVisitors(filterDate, filterStatus);
    const updateVisitor = useUpdateVisitorStatus();

    const handleAction = (id: string, status: string, remarks?: string) => {
        updateVisitor.mutate({ id, status, remarks }, {
            onSuccess: () => {
                toast.success(`Visitor ${status} successfully`);
                refetch();
                setShowDetailsModal(false);
            },
            onError: () => toast.error('Failed to update visitor status')
        });
    };

    const handleViewDetails = (visitor: any) => {
        setSelectedVisitor(visitor);
        setShowDetailsModal(true);
    };

    const filteredVisitors = visitors?.filter((v: any) =>
        v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.student?.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.phone?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const metrics = {
        active: visitors?.filter((v: any) => v.status === 'checked-in').length || 0,
        pending: visitors?.filter((v: any) => v.status === 'pending').length || 0,
        approved: visitors?.filter((v: any) => v.status === 'approved').length || 0,
        total: visitors?.length || 0,
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading visitors...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Live</span>
                        </div>
                        <p className="text-gray-500 text-sm">Monitor and manage campus visitors</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="date"
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => refetch()}
                            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <LogIn size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Active Inside</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.active}</p>
                        </div>
                    </div>
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
                            <p className="text-xs text-gray-500">Approved</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.approved}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <History size={18} className="text-gray-600" />
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
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="checked-in">Checked In</option>
                                <option value="departed">Departed</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, host, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Visitors Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Host Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Visit Info</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVisitors?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Activity size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No visitor records found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredVisitors?.map((visitor: any) => (
                                    <tr
                                        key={visitor._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => handleViewDetails(visitor)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                    {visitor.visitorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{visitor.visitorName}</p>
                                                    <p className="text-xs text-gray-500">{visitor.relation}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900">{visitor.student?.name}</p>
                                            <p className="text-xs text-gray-500">{visitor.student?.profile?.studentId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-700">
                                                <Clock size={14} className="text-gray-400" />
                                                <span>{visitor.expectedTime}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{new Date(visitor.visitDate).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={visitor.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Visitor Details Modal */}
            {showDetailsModal && selectedVisitor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-800 rounded-lg">
                                    <ShieldAlert size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Visitor Details</h2>
                                    <p className="text-xs text-gray-500">Access request information</p>
                                </div>
                            </div>
                            <button onClick={() => setShowDetailsModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Visitor Info */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Users size={14} /> Visitor Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Full Name</p>
                                            <p className="text-sm font-medium text-gray-900">{selectedVisitor.visitorName}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Relation to Student</p>
                                            <p className="text-sm text-gray-700">{selectedVisitor.relation}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone Number</p>
                                            <p className="text-sm text-gray-700">{selectedVisitor.phone || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visit Info */}
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <Clock size={14} /> Visit Details
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Visit Date</p>
                                            <p className="text-sm font-medium text-gray-900">{new Date(selectedVisitor.visitDate).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Expected Time</p>
                                            <p className="text-sm text-gray-700">{selectedVisitor.expectedTime}</p>
                                        </div>
                                        {selectedVisitor.checkInTime && (
                                            <div>
                                                <p className="text-xs text-gray-500">Check-in Time</p>
                                                <p className="text-sm text-green-600">{new Date(selectedVisitor.checkInTime).toLocaleString()}</p>
                                            </div>
                                        )}
                                        {selectedVisitor.checkOutTime && (
                                            <div>
                                                <p className="text-xs text-gray-500">Check-out Time</p>
                                                <p className="text-sm text-gray-600">{new Date(selectedVisitor.checkOutTime).toLocaleString()}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Host Student Info */}
                                <div className="md:col-span-2">
                                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <UserCheck size={14} /> Host Student
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="font-medium text-gray-900">{selectedVisitor.student?.name}</p>
                                        <p className="text-sm text-gray-500">{selectedVisitor.student?.profile?.studentId}</p>
                                        <p className="text-sm text-gray-500 mt-1">{selectedVisitor.student?.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                {selectedVisitor.status === 'pending' && (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleAction(selectedVisitor._id, 'rejected')}
                                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(selectedVisitor._id, 'approved')}
                                            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Approve Entry
                                        </button>
                                    </div>
                                )}
                                {selectedVisitor.status === 'approved' && (
                                    <button
                                        onClick={() => handleAction(selectedVisitor._id, 'checked-in')}
                                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogIn size={16} />
                                        Check In
                                    </button>
                                )}
                                {selectedVisitor.status === 'checked-in' && (
                                    <button
                                        onClick={() => handleAction(selectedVisitor._id, 'departed')}
                                        className="w-full px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={16} />
                                        Check Out
                                    </button>
                                )}
                                <p className="text-xs text-center text-gray-400 mt-4">
                                    All actions are logged for security audit
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
        approved: { label: 'Approved', className: 'bg-blue-100 text-blue-700' },
        rejected: { label: 'Rejected', className: 'bg-red-100 text-red-700' },
        'checked-in': { label: 'Checked In', className: 'bg-green-100 text-green-700' },
        departed: { label: 'Departed', className: 'bg-gray-100 text-gray-700' },
    };

    const current = config[status] || config.pending;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Visitors;