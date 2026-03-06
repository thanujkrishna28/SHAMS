import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    Banknote,
    Receipt,
    User as UserIcon,
    Plus,
} from 'lucide-react';
import { useAllFees, useMarkPaidOffline, useCreateFee, useAllStudents } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const AdminFees = () => {
    const { data: fees, isLoading } = useAllFees();
    const { data: studentsData } = useAllStudents(1, 1000); // Fetch many students for dropdown
    const markPaidOffline = useMarkPaidOffline();
    const createFee = useCreateFee();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [receiptNumber, setReceiptNumber] = useState('');
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

    // Create Fee Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFeeTarget, setNewFeeTarget] = useState('ALL'); // 'ALL' or studentId
    const [newFeeAmount, setNewFeeAmount] = useState('');

    const filteredFees = fees?.filter((fee: any) => {
        const studentName = (fee.student as any)?.name || '';
        const studentId = (fee.student as any)?.profile?.studentId || '';
        const matchesSearch =
            studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            studentId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'ALL' || fee.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const handleMarkOffline = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFee || !receiptNumber) return;

        try {
            await markPaidOffline.mutateAsync({
                feeId: selectedFee._id,
                receiptNumber
            });
            toast.success('Fee marked as paid offline');
            setIsOfflineModalOpen(false);
            setReceiptNumber('');
            setSelectedFee(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleCreateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFeeAmount || isNaN(Number(newFeeAmount))) {
            toast.error('Please enter a valid amount');
            return;
        }

        try {
            await createFee.mutateAsync({
                studentId: newFeeTarget,
                totalAmount: Number(newFeeAmount)
            });
            toast.success(newFeeTarget === 'ALL' ? 'Bulk fees creation initiated' : 'Fee created successfully');
            setIsCreateModalOpen(false);
            setNewFeeAmount('');
            setNewFeeTarget('ALL');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create fee');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="flex justify-between items-center text-left">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Track and manage student fee payments</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                        <Plus size={18} />
                        Create New Fee
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition">
                        <Download size={18} />
                        Export records
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                    />
                </div>
                <div className="flex gap-3 text-left">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                        <option value="ALL">All Status</option>
                        <option value="PAID">Paid</option>
                        <option value="PENDING">Pending</option>
                        <option value="FAILED">Failed</option>
                    </select>
                </div>
            </div>

            {/* Fees Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200 text-left">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-24"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-16"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-20"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                        <td className="px-6 py-4"><div className="h-4 bg-gray-100 rounded w-8 ml-auto"></div></td>
                                    </tr>
                                ))
                            ) : filteredFees?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No fee records found</td>
                                </tr>
                            ) : (
                                filteredFees?.map((fee: any) => (
                                    <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                                    {(fee.student as any)?.name?.[0] || 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{(fee.student as any)?.name}</p>
                                                    <p className="text-xs text-gray-500">{(fee.student as any)?.profile?.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">₹{fee.totalAmount?.toLocaleString() || '0'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                fee.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                {fee.status === 'PAID' ? <CheckCircle2 size={12} /> :
                                                    fee.status === 'FAILED' ? <XCircle size={12} /> :
                                                        <Clock size={12} />}
                                                {fee.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {fee.paymentMode ? (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                    {fee.paymentMode === 'ONLINE' ? <CreditCard size={14} /> : <Banknote size={14} />}
                                                    {fee.paymentMode}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Not specified</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {fee.paidAt ? format(new Date(fee.paidAt), 'dd MMM yyyy, HH:mm') : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {fee.status === 'PENDING' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedFee(fee);
                                                        setIsOfflineModalOpen(true);
                                                    }}
                                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Mark as Paid Offline"
                                                >
                                                    <Receipt size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Offline Payment Modal */}
            {isOfflineModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-left"
                    >
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center text-left">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Banknote />
                                Offline Payment
                            </h2>
                            <button onClick={() => setIsOfflineModalOpen(false)} className="hover:text-white/80 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleMarkOffline} className="p-6 space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                                    <UserIcon size={20} />
                                </div>
                                <div className="text-left">
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Marking for Student</p>
                                    <p className="font-bold text-gray-900">{(selectedFee?.student as any)?.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-left">
                                    <p className="text-xs text-gray-500 font-medium">Fee Amount</p>
                                    <p className="font-bold text-gray-900">₹{selectedFee?.totalAmount?.toLocaleString() || '0'}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-left">
                                    <p className="text-xs text-gray-500 font-medium">Created On</p>
                                    <p className="font-bold text-gray-900">{selectedFee?.createdAt ? format(new Date(selectedFee.createdAt), 'MMM yyyy') : '-'}</p>
                                </div>
                            </div>

                            <div className="text-left">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Receipt Number</label>
                                <div className="relative">
                                    <Receipt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={receiptNumber}
                                        onChange={(e) => setReceiptNumber(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Enter manual receipt number..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOfflineModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={markPaidOffline.isPending}
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    {markPaidOffline.isPending ? 'Processing...' : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Confirm Paid
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}

            {/* Create Fee Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-left"
                    >
                        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center text-left">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Plus />
                                Create New Fee
                            </h2>
                            <button onClick={() => setIsCreateModalOpen(false)} className="hover:text-white/80 transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateFee} className="p-6 space-y-4 text-left">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Apply Fee To</label>
                                <select
                                    value={newFeeTarget}
                                    onChange={(e) => setNewFeeTarget(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                >
                                    <option value="ALL">All Active Students (Bulk)</option>
                                    {studentsData?.students?.map((s: any) => (
                                        <option key={s._id} value={s._id}>
                                            {s.name} ({s.profile?.studentId})
                                        </option>
                                    ))}
                                </select>
                                {newFeeTarget === 'ALL' && (
                                    <p className="mt-1 text-xs text-amber-600 font-medium">
                                        This will create a pending fee for every active student.
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Fee Amount (₹)</label>
                                <div className="relative text-left">
                                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="number"
                                        value={newFeeAmount}
                                        onChange={(e) => setNewFeeAmount(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Enter amount in INR..."
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3 text-left">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={createFee.isPending}
                                    className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
                                >
                                    {createFee.isPending ? 'Processing...' : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Create Fee
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

export default AdminFees;
