import React from 'react';
import {
    Package,
    Search,
    Plus,
    CheckCircle2,
    Clock,
    User,
    ClipboardList,
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ParcelManagement = () => {
    const [parcels, setParcels] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
    const [isDeliverModalOpen, setIsDeliverModalOpen] = React.useState(false);
    const [selectedParcel, setSelectedParcel] = React.useState<any>(null);
    const [otp, setOtp] = React.useState('');

    // Form States
    const [formData, setFormData] = React.useState({
        studentId: '',
        courierName: '',
        trackingId: '',
        notes: ''
    });

    const fetchParcels = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/parcels');
            setParcels(data);
        } catch (error) {
            toast.error('Failed to load parcels');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchParcels();
    }, []);

    const handleReceive = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/parcels', formData);
            toast.success('Parcel logged and student notified!');
            setIsAddModalOpen(false);
            setFormData({ studentId: '', courierName: '', trackingId: '', notes: '' });
            fetchParcels();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to log parcel');
        }
    };

    const handleDeliver = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/parcels/${selectedParcel._id}/deliver`, { pickupCode: otp });
            toast.success('Parcel handed over successfully!');
            setIsDeliverModalOpen(false);
            setOtp('');
            fetchParcels();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP Code');
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
                        <Package className="text-emerald-500" size={32} />
                        Parcel Management
                    </h1>
                    <p className="text-slate-500 font-medium">Log arrivals and verify handovers</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Receive New Parcel
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pending Pickups', value: parcels.filter(p => p.status === 'Arrived').length, icon: Clock, color: 'emerald' },
                    { label: 'Handed Over Today', value: parcels.filter(p => p.status === 'Delivered' && p.deliveredAt && new Date(p.deliveredAt).toDateString() === new Date().toDateString()).length, icon: CheckCircle2, color: 'blue' },
                    { label: 'Total Received', value: parcels.length, icon: ClipboardList, color: 'slate' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="font-bold text-slate-900">Recent Arrivals</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search Student Name/ID..."
                            className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Courier</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Arrival</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-6 h-16 bg-slate-50/20" />
                                    </tr>
                                ))
                            ) : parcels.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium">No parcels found</td>
                                </tr>
                            ) : parcels.map((parcel) => (
                                <tr key={parcel._id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                                                {parcel.student?.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{parcel.student?.name}</p>
                                                <p className="text-[10px] text-slate-500 font-bold font-mono">ID: {parcel.student?.profile?.studentId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700">{parcel.courierName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono italic">{parcel.trackingId || 'No Tracking'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-slate-700">{new Date(parcel.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        <p className="text-[10px] text-slate-400">{new Date(parcel.arrivedAt).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                            ${parcel.status === 'Arrived' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}
                                        `}>
                                            {parcel.status === 'Arrived' ? 'PENDING' : 'DELIVERED'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {parcel.status === 'Arrived' ? (
                                            <button
                                                onClick={() => { setSelectedParcel(parcel); setIsDeliverModalOpen(true); }}
                                                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all"
                                            >
                                                Handover
                                            </button>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold italic">Handed Over</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsAddModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 bg-emerald-500 text-white relative">
                                <Plus size={80} className="absolute -top-4 -right-4 opacity-10" />
                                <h3 className="text-2xl font-black">Log New Parcel</h3>
                                <p className="text-emerald-50 text-sm font-medium">Verify student and courier details</p>
                            </div>
                            <form onSubmit={handleReceive} className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Student ID / Scan ID</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                            <input
                                                required
                                                type="text"
                                                value={formData.studentId}
                                                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                                placeholder="e.g. STU12345"
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Courier Service</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.courierName}
                                            onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
                                            placeholder="Amazon, Flipkart, etc."
                                            className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Tracking ID (Optional)</label>
                                        <input
                                            type="text"
                                            value={formData.trackingId}
                                            onChange={(e) => setFormData({ ...formData, trackingId: e.target.value })}
                                            placeholder="TKR987123..."
                                            className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 active:scale-95"
                                    >
                                        Complete & Notify
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Deliver Modal */}
            <AnimatePresence>
                {isDeliverModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                            onClick={() => setIsDeliverModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2rem] w-full max-md shadow-2xl relative overflow-hidden text-center"
                        >
                            <div className="p-8 pb-0">
                                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <Package size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900">Verify OTP</h3>
                                <p className="text-slate-500">Ask the student for their Pickup Code</p>
                            </div>
                            <form onSubmit={handleDeliver} className="p-8 space-y-6">
                                <div>
                                    <input
                                        required
                                        autoFocus
                                        type="text"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        placeholder="0 0 0 0"
                                        className="w-full text-center text-4xl font-black tracking-[1rem] py-4 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-emerald-500/10"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg"
                                    >
                                        Confirm Handover
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsDeliverModalOpen(false)}
                                        className="w-full py-3 text-slate-400 font-bold text-sm"
                                    >
                                        Close
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ParcelManagement;
