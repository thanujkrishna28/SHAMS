import { useMyFees } from '@/hooks/useFees';
import { CreditCard, CheckCircle2, AlertCircle, Clock, ExternalLink, ArrowRight, History } from 'lucide-react';
import { format } from 'date-fns';
import { Fee } from '@/types';

const Fees = () => {
    const { data: fees, isLoading } = useMyFees();

    const getStatusStyles = (status: Fee['status']) => {
        switch (status) {
            case 'paid':
                return {
                    container: 'bg-emerald-50 border-emerald-100',
                    badge: 'bg-emerald-100 text-emerald-700',
                    icon: <CheckCircle2 className="text-emerald-500" size={20} />,
                    text: 'Completed'
                };
            case 'partially_paid':
                return {
                    container: 'bg-amber-50 border-amber-100',
                    badge: 'bg-amber-100 text-amber-700',
                    icon: <Clock className="text-amber-500" size={20} />,
                    text: 'Partially Paid'
                };
            default:
                return {
                    container: 'bg-red-50 border-red-100',
                    badge: 'bg-red-100 text-red-700',
                    icon: <AlertCircle className="text-red-500" size={20} />,
                    text: 'Due'
                };
        }
    };

    const totalDue = fees?.reduce((acc, fee) => (fee.status !== 'paid' ? acc + (fee.amount - fee.amountPaid) : acc), 0) || 0;

    return (
        <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Fees & Payments</h1>
                    <p className="text-gray-500 mt-1">Manage your academic and hostel fees, track payment history</p>
                </div>

                <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-6">
                    <div className="flex flex-col">
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Outstanding</span>
                        <span className="text-2xl font-black text-gray-900">₹{totalDue.toLocaleString()}</span>
                    </div>
                    <div className={`p-3 rounded-xl ${totalDue > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                        <CreditCard size={24} />
                    </div>
                </div>
            </div>

            {/* Quick Actions / Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={20} className="text-indigo-500" /> Current Dues
                    </h3>

                    {isLoading ? (
                        <div className="h-64 bg-gray-50 rounded-2xl animate-pulse" />
                    ) : fees?.filter(f => f.status !== 'paid').length === 0 ? (
                        <div className="bg-emerald-50/50 border border-emerald-100 p-8 rounded-2xl text-center">
                            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 size={32} className="text-emerald-600" />
                            </div>
                            <h4 className="text-lg font-bold text-emerald-900">All caught up!</h4>
                            <p className="text-emerald-700">You have no pending fee payments at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {fees?.filter(f => f.status !== 'paid').map((fee) => {
                                const styles = getStatusStyles(fee.status);
                                return (
                                    <div key={fee._id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow group">
                                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                                            <div className="flex gap-4">
                                                <div className={`p-4 rounded-2xl h-fit hidden sm:block ${styles.container}`}>
                                                    {styles.icon}
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center flex-wrap gap-2">
                                                        <h4 className="font-bold text-gray-900 text-lg">{fee.title}</h4>
                                                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles.badge}`}>
                                                            {styles.text}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500 line-clamp-2">{fee.description || `Charges for the academic session`}</p>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                                        <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                            <Clock size={12} /> {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                                                        </span>
                                                        <span className="text-xs font-medium text-indigo-500 capitalize px-2 py-0.5 bg-indigo-50 rounded-md">
                                                            {fee.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                                <div className="text-left sm:text-right">
                                                    <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">₹{(fee.amount - fee.amountPaid).toLocaleString()}</div>
                                                    {fee.amountPaid > 0 && (
                                                        <div className="text-[10px] text-emerald-600 font-medium tracking-tight uppercase">Paid: ₹{fee.amountPaid.toLocaleString()}</div>
                                                    )}
                                                </div>
                                                <a
                                                    href={fee.paymentLink || "https://payment-gateway.example.com/pay"}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-bold shadow-lg shadow-gray-200 text-sm whitespace-nowrap"
                                                >
                                                    Pay Now
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <History size={20} className="text-emerald-500" /> Recent Activity
                    </h3>

                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm overflow-hidden relative">
                        <div className="space-y-6 relative z-10">
                            {fees?.filter(f => f.status === 'paid' || f.amountPaid > 0).length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm italic">No recent payment history</p>
                                </div>
                            ) : (
                                fees?.flatMap(f => f.transactionHistory.map(t => ({ ...t, title: f.title }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5).map((txn, idx) => (
                                    <div key={idx} className="flex gap-4 items-start relative">
                                        {idx < 4 && <div className="absolute left-[7px] top-6 bottom-[-24px] w-[2px] bg-gray-50" />}
                                        <div className="w-4 h-4 rounded-full bg-emerald-500 mt-1 ring-4 ring-emerald-50 z-10" />
                                        <div className="flex-1 space-y-1">
                                            <div className="flex justify-between items-start">
                                                <p className="text-sm font-bold text-gray-800 leading-none">{txn.title}</p>
                                                <span className="text-sm font-black text-emerald-600">+ ₹{txn.amount.toLocaleString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-400 font-medium">
                                                {format(new Date(txn.date), 'MMM dd, h:mm a')} • {txn.paymentMethod}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50">
                            <button className="w-full py-3 rounded-xl bg-gray-50 text-gray-500 text-sm font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                Download Statement
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* All Fees History Table (Mobile Hidden) */}
            {fees && fees.filter(f => f.status === 'paid').length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="font-bold text-gray-900">Payment Archive</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50/50 text-left">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Fee Description</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Paid Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-widest">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-medium">
                                {fees?.filter(f => f.status === 'paid').map((fee) => (
                                    <tr key={fee._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{fee.title}</span>
                                                <span className="text-xs text-gray-400 capitalize">{fee.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-gray-700 font-mono">
                                            ₹{fee.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(fee.updatedAt), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {getStatusStyles(fee.status).text}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Fees;
