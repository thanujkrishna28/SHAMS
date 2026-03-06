import { motion } from 'framer-motion';
import {
    CreditCard,
    CheckCircle2,
    XCircle,
    Clock,
    Receipt,
    Wallet,
    ArrowRight,
    Info
} from 'lucide-react';
import { useStudentFee, useCreatePaymentOrder, useVerifyPayment } from '@/hooks/useFees';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

declare var bolt: any;

const StudentFees = () => {
    const { data: fee, isLoading, refetch } = useStudentFee();
    const createOrder = useCreatePaymentOrder();
    const verifyPayment = useVerifyPayment();
    const navigate = useNavigate();

    const handlePayNow = async () => {
        try {
            const response = await createOrder.mutateAsync();

            // Handle Simulation Mode
            if (response.isSimulation && response.redirectUrl) {
                window.location.href = response.redirectUrl;
                return;
            }

            // Handle PayU Bolt Flow
            if (!response.payuData) {
                toast.error('Failed to initialize PayU gateway (No Data)');
                return;
            }

            // Check if PayU script is loaded (case-insensitive check for common names)
            const payuBolt = (window as any).bolt || (window as any).Bolt;

            if (!payuBolt || typeof payuBolt.launch !== 'function') {
                console.error('PayU Bolt Library Object:', payuBolt);
                const allKeys = Object.keys(window).filter(k => k.toLowerCase().includes('bolt') || k.toLowerCase().includes('payu'));
                console.log('Detected related window keys:', allKeys);

                toast.error('PayU Payment Gateway failed to initialize. Please refresh or check your connection.');
                return;
            }


            const pd = response.payuData;

            payuBolt.launch(pd, {
                responseHandler: async (payuResponse: any) => {
                    const loadingToast = toast.loading('Verifying payment...');
                    try {
                        console.log('PayU Response:', payuResponse);

                        // PayU returns everything in flat response or .response object
                        const verificationData = payuResponse.response || payuResponse;

                        await verifyPayment.mutateAsync({
                            ...verificationData,
                            feeId: fee._id
                        });

                        toast.success('Payment Successful!', { id: loadingToast });
                        refetch();
                        navigate(`/payment-processing?feeId=${fee._id}`);
                    } catch (error: any) {
                        const errMsg = error.response?.data?.message || error.message || 'Verification failed';
                        toast.error(errMsg, { id: loadingToast });
                    }
                },
                catchException: (error: any) => {
                    console.error('PayU Exception:', error);
                    toast.error(error.message || 'Payment interrupted');
                }
            });

        } catch (error: any) {
            console.error('Payment Error:', error);
            const errMsg = error.response?.data?.message || error.message || 'Failed to initiate payment';
            toast.error(errMsg);
        }
    };


    if (isLoading) {
        return <div className="p-8 animate-pulse bg-gray-50 rounded-2xl h-64"></div>;
    }

    if (!fee) {
        return (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-gray-200">
                <Wallet className="mx-auto mb-4 text-gray-300" size={48} />
                <h2 className="text-xl font-bold text-gray-900">No Pending Fees</h2>
                <p className="text-gray-500">You don't have any pending fee records at the moment.</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
        >
            <div className="flex justify-between items-center text-left">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Fees</h1>
                    <p className="text-sm text-gray-500 mt-1">View and pay your hostel & mess fees</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Main Fee Card */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-primary to-indigo-600 text-white">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-80 uppercase font-bold tracking-widest mb-1 text-white">Current Outstanding</p>
                                    <h2 className="text-4xl font-bold">₹{fee.totalAmount?.toLocaleString() || '0'}</h2>
                                </div>
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <CreditCard size={32} />
                                </div>
                            </div>
                            <div className="mt-6 flex items-center gap-4 text-sm">
                                <span className={`px-3 py-1 rounded-full font-bold bg-white/20 backdrop-blur-md flex items-center gap-1.5`}>
                                    {fee.status === 'PAID' ? <CheckCircle2 size={14} /> :
                                        fee.status === 'FAILED' ? <XCircle size={14} /> :
                                            <Clock size={14} />}
                                    {fee.status}
                                </span>
                                <span className="opacity-80">Bill Date: {format(new Date(fee.createdAt), 'dd MMM yyyy')}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Receipt size={20} />
                                    <span>Hostel & Mess Fee</span>
                                </div>
                                <span className="font-bold text-gray-900">₹{fee.totalAmount?.toLocaleString() || '0'}</span>
                            </div>

                            {fee.status === 'PENDING' ? (
                                <div className="pt-4">
                                    <p className="text-xs text-amber-600 font-bold mb-3 flex items-center gap-1.5">
                                        <Clock size={14} />
                                        PAYMENT SECURELY REDIRECTED VIA GATEWAY
                                    </p>
                                    <button
                                        onClick={handlePayNow}
                                        disabled={createOrder.isPending}
                                        className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {createOrder.isPending ? 'Initiating...' : (
                                            <>
                                                Pay Total Amount
                                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : fee.status === 'PAID' ? (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex items-center gap-3 text-green-700">
                                    <CheckCircle2 className="shrink-0" />
                                    <div>
                                        <p className="font-bold">Payment Confirmed</p>
                                        <p className="text-sm">Paid via {fee.paymentMode} on {format(new Date(fee.paidAt), 'dd MMM yyyy')}</p>
                                        {fee.receiptNumber && <p className="text-xs mt-1">Receipt: {fee.receiptNumber}</p>}
                                        {fee.transactionId && <p className="text-xs mt-1">Transaction ID: {fee.transactionId}</p>}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-3 text-red-700">
                                    <XCircle className="shrink-0" />
                                    <div>
                                        <p className="font-bold">Payment Failed</p>
                                        <p className="text-sm">The previous attempt was unsuccessful. Please try again.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Info className="text-primary" size={20} />
                            Payment Info
                        </h3>
                        <ul className="space-y-3 text-sm text-gray-500">
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                redirect to secure gateway
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                Support for UPI, Cards & Netbanking
                            </li>
                            <li className="flex gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                                Instant confirmation for online payments
                            </li>
                            <li className="flex gap-2 text-amber-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                For offline payments, submit receipt at office
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentFees;
