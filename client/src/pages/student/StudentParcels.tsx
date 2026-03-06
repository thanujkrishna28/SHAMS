import React from 'react';
import {
    Package,
    Clock,
    CheckCircle2,
    Info,
    Calendar,
    ChevronRight,
    MapPin
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const StudentParcels = () => {
    const [parcels, setParcels] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

    const fetchMyParcels = async () => {
        try {
            setIsLoading(true);
            const { data } = await api.get('/parcels/my');
            setParcels(data);
        } catch (error) {
            toast.error('Failed to load your parcels');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMyParcels();
    }, []);

    const pendingParcels = parcels.filter(p => p.status === 'Arrived');
    const deliveredParcels = parcels.filter(p => p.status === 'Delivered');

    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">My Parcels</h1>
                <p className="text-slate-500 font-medium tracking-wide">Track your incoming couriers and deliveries</p>
            </div>

            {/* OTP Alert for Pending */}
            <AnimatePresence>
                {pendingParcels.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex gap-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                                    <Package size={28} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Items Ready for Pickup</h2>
                                    <p className="text-indigo-100 text-sm">You have {pendingParcels.length} parcel(s) at the security gate.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right hidden sm:block">
                                    <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Gate Hours</p>
                                    <p className="text-sm font-bold">06:00 AM - 10:00 PM</p>
                                </div>
                                <div className="w-[2px] h-8 bg-white/20 hidden sm:block"></div>
                                <button className="bg-white text-indigo-600 px-6 py-3 rounded-2xl font-bold text-sm shadow-lg whitespace-nowrap active:scale-95 transition-all">
                                    Show All Codes
                                </button>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                            <Clock size={16} className="text-amber-500" />
                            Pending Pickup ({pendingParcels.length})
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {pendingParcels.length === 0 ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-100 rounded-3xl py-12 text-center">
                                <Package size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-medium">No pending parcels</p>
                            </div>
                        ) : pendingParcels.map((parcel) => (
                            <motion.div
                                key={parcel._id}
                                whileHover={{ y: -4 }}
                                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-6 relative group"
                            >
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{parcel.courierName}</p>
                                            <h4 className="text-lg font-black text-slate-900">{parcel.trackingId || 'Personal Package'}</h4>
                                        </div>
                                        <div className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Arrived
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <Calendar size={16} />
                                            <span className="text-xs font-bold">{new Date(parcel.arrivedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-500">
                                            <MapPin size={16} />
                                            <span className="text-xs font-bold">Main Gate</span>
                                        </div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3 text-slate-500">
                                        <Info size={14} className="shrink-0" />
                                        <p className="text-[10px] font-medium leading-relaxed italic line-clamp-1">
                                            {parcel.notes || 'No extra notes provided by security.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="sm:w-32 bg-slate-900 text-white rounded-2xl p-4 flex flex-col items-center justify-center group-hover:bg-emerald-600 transition-colors shadow-lg">
                                    <p className="text-[8px] font-black text-slate-400 group-hover:text-emerald-100 uppercase tracking-widest mb-1">Pickup Code</p>
                                    <p className="text-2xl font-black tracking-[0.2em]">{parcel.pickupCode}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-500" />
                            Recently Delivered
                        </h3>
                    </div>

                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {deliveredParcels.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-sm">No delivery history yet</div>
                            ) : deliveredParcels.map((parcel) => (
                                <div key={parcel._id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{parcel.courierName}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">Delivered {new Date(parcel.deliveredAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentParcels;
