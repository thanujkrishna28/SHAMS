import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, CheckCircle, XCircle, Clock, UserCheck, LogIn, LogOut, Filter } from 'lucide-react';
import { useAllVisitors, useUpdateVisitorStatus } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

const Visitors = () => {
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const { data: visitors, isLoading } = useAllVisitors(filterDate, filterStatus);
    const updateVisitor = useUpdateVisitorStatus();

    const handleAction = (id: string, status: string, remarks?: string) => {
        updateVisitor.mutate({ id, status, remarks }, {
            onSuccess: () => toast.success(`Visitor ${status}`),
            onError: () => toast.error('Check-in/out failed')
        });
    };

    const filteredVisitors = visitors?.filter((v: any) =>
        v.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.student?.profile?.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Visitor Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Pre-approvals and security check-ins</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <input
                            type="date"
                            className="pl-3 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20"
                            onChange={(e) => setFilterDate(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search visitor, student, or room..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-500" />
                    <select
                        className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="checked-in">Checked In</option>
                        <option value="departed">Departed</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Visitors List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visitor Details</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student Control</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timing</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">Loading visitors...</td></tr>
                            ) : filteredVisitors?.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No visitors found matching filters.</td></tr>
                            ) : (
                                filteredVisitors?.map((visitor: any) => (
                                    <tr key={visitor._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                                                    {visitor.visitorName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{visitor.visitorName}</div>
                                                    <div className="text-xs text-gray-500 capitalize">{visitor.relation}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{visitor.student?.name}</div>
                                            <div className="text-xs text-gray-500">Room {visitor.student?.profile?.roomNumber || 'N/A'} • {visitor.student?.profile?.studentId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium text-gray-900">{new Date(visitor.visitDate).toLocaleDateString()}</span>
                                                <span className="text-xs text-gray-500">Expected: {visitor.expectedTime}</span>
                                                {visitor.checkInTime && <span className="text-xs text-green-600 font-medium">In: {new Date(visitor.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                                {visitor.checkOutTime && <span className="text-xs text-red-600 font-medium">Out: {new Date(visitor.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={visitor.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {visitor.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(visitor._id, 'approved')}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg tooltip"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(visitor._id, 'rejected')}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg tooltip"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {visitor.status === 'approved' && (
                                                    <button
                                                        onClick={() => handleAction(visitor._id, 'checked-in')}
                                                        className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <LogIn size={14} /> Check In
                                                    </button>
                                                )}
                                                {visitor.status === 'checked-in' && (
                                                    <button
                                                        onClick={() => handleAction(visitor._id, 'departed')}
                                                        className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded-lg hover:bg-amber-600 flex items-center gap-1.5 ml-auto"
                                                    >
                                                        <LogOut size={14} /> Check Out
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
            </div>
        </motion.div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const styles: any = {
        pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        approved: 'bg-blue-100 text-blue-700 border-blue-200',
        rejected: 'bg-red-100 text-red-700 border-red-200',
        'checked-in': 'bg-green-100 text-green-700 border-green-200',
        departed: 'bg-gray-100 text-gray-700 border-gray-200',
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending} capitalize inline-flex items-center gap-1.5`}>
            {status === 'pending' && <Clock size={12} />}
            {status === 'approved' && <UserCheck size={12} />}
            {status === 'checked-in' && <LogIn size={12} />}
            {status === 'departed' && <LogOut size={12} />}
            {status}
        </span>
    );
};

export default Visitors;
