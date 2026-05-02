import { useState } from 'react';
import { motion } from 'framer-motion';
import { useStudentFee, useCreatePaymentOrder, useVerifyPayment } from '@/hooks/useFees';
import toast from 'react-hot-toast';
import { format } from 'date-fns';




import {
    CheckCircle2,
    Receipt,
    Wallet,
    ArrowRight,
    ShieldCheck,
    Utensils,
    Shirt,
    GraduationCap,
    Download,
    Calendar,
    AlertCircle
} from 'lucide-react';

const StudentFees = () => {
    const { data: fees, isLoading, refetch } = useStudentFee();
    const createOrder = useCreatePaymentOrder();
    const [amountToPay, setAmountToPay] = useState<string>('');

    const verifyPayment = useVerifyPayment();

    const handlePayNow = async (fee: any) => {
        try {
            const inputAmount = parseFloat(amountToPay);
            const payAmount = !isNaN(inputAmount) && inputAmount > 0 ? inputAmount : fee.balanceAmount;
            
            if (payAmount <= 0) {
                toast.error('Please enter a valid amount');
                return;
            }

            if (payAmount > fee.balanceAmount) {
                toast.error('Amount exceeds balance due');
                return;
            }

            toast.loading('Initiating payment...', { id: 'payment-toast' });

            const response = await createOrder.mutateAsync({ 
                feeId: fee._id,
                amountToPay: payAmount 
            });

            toast.dismiss('payment-toast');

            // 1. Handle Simulation Mode (if any)
            if (response.isSimulation && response.redirectUrl) {
                window.location.href = response.redirectUrl;
                return;
            }

            // 2. Handle Razorpay Checkout
            if (response.razorpayOrder) {
                const options = {
                    ...response.razorpayOrder,
                    handler: async (res: any) => {
                        try {
                            toast.loading('Verifying payment...', { id: 'verify-toast' });
                            await verifyPayment.mutateAsync({
                                razorpay_order_id: res.razorpay_order_id,
                                razorpay_payment_id: res.razorpay_payment_id,
                                razorpay_signature: res.razorpay_signature,
                                feeId: fee._id,
                                amount: payAmount
                            });
                            toast.success('Payment verified successfully!', { id: 'verify-toast' });
                            refetch();
                        } catch (error: any) {
                            toast.error(error.message || 'Verification failed', { id: 'verify-toast' });
                        }
                    },
                    modal: {
                        onhighlight: function() {
                            console.log('Razorpay Modal Highlighted');
                        }
                    },
                    theme: {
                        color: "#4F46E5"
                    }
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.open();
            }
        } catch (error: any) {
            toast.dismiss('payment-toast');
            toast.error(error.message || 'Payment initiation failed');
        }
    };

    const handleDownloadReceipt = (feeId: string) => {
        window.open(`/api/payments/receipt/${feeId}`, '_blank');
    };

    const getCategoryConfig = (type: string) => {
        switch (type) {
            case 'Admission':
                return {
                    icon: <GraduationCap size={18} />,
                    color: 'indigo',
                    bgGradient: 'from-indigo-50 to-indigo-100',
                    borderColor: 'border-indigo-200',
                    textColor: 'text-indigo-700',
                    badgeColor: 'bg-indigo-100 text-indigo-700',
                    label: 'Admission Fee'
                };
            case 'Mess':
                return {
                    icon: <Utensils size={18} />,
                    color: 'amber',
                    bgGradient: 'from-amber-50 to-amber-100',
                    borderColor: 'border-amber-200',
                    textColor: 'text-amber-700',
                    badgeColor: 'bg-amber-100 text-amber-700',
                    label: 'Mess Fee'
                };
            case 'Caution Deposit':
                return {
                    icon: <ShieldCheck size={18} />,
                    color: 'emerald',
                    bgGradient: 'from-emerald-50 to-emerald-100',
                    borderColor: 'border-emerald-200',
                    textColor: 'text-emerald-700',
                    badgeColor: 'bg-emerald-100 text-emerald-700',
                    label: 'Caution Deposit'
                };
            case 'Laundry':
                return {
                    icon: <Shirt size={18} />,
                    color: 'cyan',
                    bgGradient: 'from-cyan-50 to-cyan-100',
                    borderColor: 'border-cyan-200',
                    textColor: 'text-cyan-700',
                    badgeColor: 'bg-cyan-100 text-cyan-700',
                    label: 'Laundry Service'
                };
            default:
                return {
                    icon: <Receipt size={18} />,
                    color: 'slate',
                    bgGradient: 'from-slate-50 to-slate-100',
                    borderColor: 'border-slate-200',
                    textColor: 'text-slate-700',
                    badgeColor: 'bg-slate-100 text-slate-700',
                    label: 'Other Fee'
                };
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (!fees || fees.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="text-gray-400" size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">No Outstanding Fees</h3>
                <p className="text-sm text-gray-500 mt-1">All your fee records are settled</p>
            </div>
        );
    }

    const totalBalance = fees.reduce((acc: number, f: any) => acc + (f.balanceAmount || 0), 0);

    // Group fees by category
    const groupedFees = fees.reduce((acc: any, fee: any) => {
        if (!acc[fee.type]) {
            acc[fee.type] = [];
        }
        acc[fee.type].push(fee);
        return acc;
    }, {});

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-5xl mx-auto"
        >
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                        <p className="text-sm text-gray-500 mt-0.5">View and pay your academic fees</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Total Due</p>
                        <p className="text-xl font-bold text-gray-900">₹{totalBalance.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {(Object.entries(groupedFees) as [string, any[]][]).map(([category, categoryFees]) => {
                    const config = getCategoryConfig(category);
                    const categoryTotal = categoryFees.reduce((sum: number, fee: any) => sum + (fee.balanceAmount || 0), 0);

                    return (
                        <div key={category} className="space-y-3">
                            {/* Category Header */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${config.bgGradient} ${config.borderColor} border`}>
                                        {config.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-900">{config.label}</h2>
                                        <p className="text-xs text-gray-500">{categoryFees.length} {categoryFees.length === 1 ? 'item' : 'items'}</p>
                                    </div>
                                </div>
                                {categoryTotal > 0 && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Category Due</p>
                                        <p className="text-sm font-semibold text-gray-900">₹{categoryTotal.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>

                            {/* Fee Items */}
                            <div className="space-y-2">
                                {categoryFees.map((fee: any) => {
                                    const isOverdue = new Date(fee.dueDate) < new Date() && fee.status !== 'PAID';
                                    const isPaid = fee.status === 'PAID';
                                    const isPartial = fee.status === 'PARTIAL';

                                    return (
                                        <motion.div
                                            key={fee._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`bg-white rounded-lg border ${config.borderColor} hover:shadow-md transition-all duration-200`}
                                        >
                                            <div className="p-4">
                                                <div className="flex items-center justify-between">
                                                    {/* Left Section */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="text-sm font-medium text-gray-900 truncate">
                                                                {fee.description || `${fee.type} Fee - ${fee.academicYear}`}
                                                            </h3>
                                                            {isOverdue && !isPaid && (
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700">
                                                                    <AlertCircle size={10} />
                                                                    Overdue
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                Due {format(new Date(fee.dueDate), 'dd MMM yyyy')}
                                                            </span>
                                                            {fee.paidAmount > 0 && (
                                                                <span className="flex items-center gap-1 text-green-600">
                                                                    <CheckCircle2 size={12} />
                                                                    ₹{fee.paidAmount.toLocaleString()} paid
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Amount Section */}
                                                    <div className="text-right mx-4">
                                                        <p className="text-xs text-gray-500">Total Amount</p>
                                                        <p className="text-sm font-medium text-gray-700">₹{fee.totalAmount.toLocaleString()}</p>
                                                    </div>

                                                    <div className="text-right min-w-[100px]">
                                                        <p className="text-xs text-gray-500">Balance Due</p>
                                                        <p className={`text-base font-bold ${isPaid ? 'text-green-600' : 'text-gray-900'}`}>
                                                            {isPaid ? 'Settled' : `₹${fee.balanceAmount.toLocaleString()}`}
                                                        </p>
                                                    </div>

                                                    {/* Status Badge */}
                                                    <div className="mx-4">
                                                        <span className={`inline-flex px-2 py-1 rounded text-[10px] font-medium ${isPaid ? 'bg-green-100 text-green-700' :
                                                                isPartial ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-600'
                                                            }`}>
                                                            {fee.status}
                                                        </span>
                                                    </div>

                                                    {/* Action Button */}
                                                    <div>
                                                        {!isPaid ? (
                                                            <button
                                                                onClick={() => handlePayNow(fee)}
                                                                disabled={createOrder.isPending}
                                                                className="px-4 py-2 bg-gray-900 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {createOrder.isPending ? 'Initiating...' : (
                                                                    <>
                                                                        Pay Now
                                                                        <ArrowRight size={14} />
                                                                    </>
                                                                )}
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleDownloadReceipt(fee._id)}
                                                                className="px-4 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                                            >
                                                                <Download size={14} />
                                                                Receipt
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Payment Input for Partial Payments */}
                                                {!isPaid && fee.balanceAmount > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <label className="text-xs text-gray-500">Custom Amount</label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                                                                <input
                                                                    type="number"
                                                                    placeholder="Enter amount"
                                                                    value={amountToPay}
                                                                    onChange={(e) => setAmountToPay(e.target.value)}
                                                                    className="pl-6 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 w-32"
                                                                    max={fee.balanceAmount}
                                                                />
                                                            </div>
                                                            {amountToPay && parseFloat(amountToPay) > 0 && parseFloat(amountToPay) !== fee.balanceAmount && (
                                                                <button
                                                                    onClick={() => handlePayNow(fee)}
                                                                    disabled={createOrder.isPending}
                                                                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
                                                                >
                                                                    {createOrder.isPending ? 'Initiating...' : `Pay ₹${parseFloat(amountToPay).toLocaleString()}`}
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400 ml-auto">
                                                            Min: ₹1 | Max: ₹{fee.balanceAmount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Security Notice */}
            <div className="mt-6 bg-gray-50 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-gray-200">
                        <ShieldCheck size={18} className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-medium text-gray-900">Secure Payment</p>
                        <p className="text-xs text-gray-500">All transactions are encrypted and processed securely</p>
                    </div>
                    <div className="flex gap-3">
                        <span className="text-xs text-gray-400">PCI DSS</span>
                        <span className="text-xs text-gray-400">SSL Secure</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentFees;