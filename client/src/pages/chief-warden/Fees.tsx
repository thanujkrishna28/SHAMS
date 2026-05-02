import React, { useState } from 'react';
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
    X,
    Filter,
    ShieldCheck,
    Wallet,
    ArrowUpRight,
    TrendingUp,
    FileText
} from 'lucide-react';
import { useAllFees, useMarkPaidOffline, useCreateFee, useAllStudents } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

const Fees = () => {
    const { data: fees, isLoading } = useAllFees();
    const { data: studentsData } = useAllStudents(1, 1000);
    const markPaidOffline = useMarkPaidOffline();
    const createFee = useCreateFee();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedFee, setSelectedFee] = useState<any>(null);
    const [receiptNumber, setReceiptNumber] = useState('');
    const [amountPaid, setAmountPaid] = useState('');
    const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newFeeTarget, setNewFeeTarget] = useState('ALL');
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

    const metrics = {
        totalDue: fees?.reduce((acc: number, fee: any) => acc + (fee.balanceAmount || 0), 0) || 0,
        totalCollected: fees?.reduce((acc: number, fee: any) => acc + ((fee.totalAmount || 0) - (fee.balanceAmount || 0)), 0) || 0,
        pendingCount: fees?.filter((fee: any) => fee.status !== 'PAID').length || 0,
        collectionRate: fees?.length ? ((fees.filter((f: any) => f.status === 'PAID').length / fees.length) * 100).toFixed(1) : 0
    };

    const handleMarkOffline = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFee || !receiptNumber || !amountPaid) return;

        try {
            await markPaidOffline.mutateAsync({
                feeId: selectedFee._id,
                receiptNumber,
                amountPaid: Number(amountPaid)
            });
            toast.success('Payment recorded successfully');
            setIsOfflineModalOpen(false);
            setReceiptNumber('');
            setAmountPaid('');
            setSelectedFee(null);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment failed');
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
            toast.success(newFeeTarget === 'ALL' ? 'Fee deployed to all students' : 'Fee created successfully');
            setIsCreateModalOpen(false);
            setNewFeeAmount('');
            setNewFeeTarget('ALL');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create fee');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading fee records...</p>
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
                            <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage student fees and payment records</p>
                    </div>

                    <div className="flex gap-3">
                        <button className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
                            <Download size={16} />
                            Export
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Fee
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Wallet size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Outstanding</p>
                            <p className="text-xl font-bold text-gray-900">₹{metrics.totalDue.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Collected</p>
                            <p className="text-xl font-bold text-gray-900">₹{metrics.totalCollected.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pending Payments</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.pendingCount}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ArrowUpRight size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Collection Rate</p>
                            <p className="text-xl font-bold text-gray-900">{metrics.collectionRate}%</p>
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
                                <option value="ALL">All Status</option>
                                <option value="PAID">Paid</option>
                                <option value="PARTIAL">Partial</option>
                                <option value="PENDING">Pending</option>
                            </select>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by student name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Fee Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outstanding</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Amount</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFees?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <CreditCard size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No fee records found</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredFees?.map((fee: any) => (
                                    <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold">
                                                    {(fee.student as any)?.name?.[0] || '?'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{(fee.student as any)?.name}</p>
                                                    <p className="text-xs text-gray-500">{(fee.student as any)?.profile?.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-base font-bold text-gray-900">₹{fee.balanceAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-500">₹{fee.totalAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <StatusBadge status={fee.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {fee.status !== 'PAID' ? (
                                                <button
                                                    onClick={() => {
                                                        setSelectedFee(fee);
                                                        setAmountPaid(fee.balanceAmount.toString());
                                                        setIsOfflineModalOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 ml-auto"
                                                >
                                                    <Receipt size={14} />
                                                    Record Payment
                                                </button>
                                            ) : (
                                                <div className="flex items-center justify-end gap-1 text-green-600">
                                                    <CheckCircle2 size={14} />
                                                    <span className="text-xs font-medium">Paid</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {isOfflineModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Banknote size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Record Payment</h2>
                                    <p className="text-xs text-gray-500">Manual payment entry</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOfflineModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleMarkOffline} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Due Amount</p>
                                    <p className="text-xl font-bold text-gray-900">₹{selectedFee?.balanceAmount?.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <p className="text-xs text-gray-500 mb-1">Total Bill</p>
                                    <p className="text-xl font-bold text-gray-400">₹{selectedFee?.totalAmount?.toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Amount Paid</label>
                                <div className="relative">
                                    <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={amountPaid}
                                        onChange={(e) => setAmountPaid(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Receipt Number</label>
                                <div className="relative">
                                    <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={receiptNumber}
                                        onChange={(e) => setReceiptNumber(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter receipt number"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsOfflineModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={markPaidOffline.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    {markPaidOffline.isPending ? 'Processing...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Fee Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <Plus size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Create Fee</h2>
                                    <p className="text-xs text-gray-500">Add new fee entry</p>
                                </div>
                            </div>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFee} className="p-6 space-y-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Student</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select
                                        value={newFeeTarget}
                                        onChange={(e) => setNewFeeTarget(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                                    >
                                        <option value="ALL">All Students</option>
                                        {studentsData?.students?.map((s: any) => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.profile?.studentId})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Fee Amount</label>
                                <div className="relative">
                                    <Banknote size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="number"
                                        value={newFeeAmount}
                                        onChange={(e) => setNewFeeAmount(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter amount"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createFee.isPending} className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                                    {createFee.isPending ? 'Processing...' : 'Create Fee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
        PAID: { label: 'PAID', className: 'bg-green-100 text-green-700' },
        PARTIAL: { label: 'PARTIAL', className: 'bg-blue-100 text-blue-700' },
        PENDING: { label: 'PENDING', className: 'bg-amber-100 text-amber-700' },
    };

    const current = config[status] || config.PENDING;

    return (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${current.className}`}>
            {current.label}
        </span>
    );
};

export default Fees; ame = {`inline-flex px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm ${current.className}`}>
    { current.label }
        </span >
    );
};

export default Fees;