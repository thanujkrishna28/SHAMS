import React from 'react';
import {
    Package,
    Clock,
    CheckCircle2,
    Info,
    Calendar,
    ChevronRight,
    MapPin,
    Truck,
    TrendingUp,
    Bell,
    XCircle,
    Shield
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const StudentParcels = () => {
    const [parcels, setParcels] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showAllCodes, setShowAllCodes] = React.useState(false);

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

    const stats = {
        total: parcels.length,
        pending: pendingParcels.length,
        delivered: deliveredParcels.length,
        arrivalRate: parcels.length > 0 ? Math.round((deliveredParcels.length / parcels.length) * 100) : 0
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Loading parcels...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
                        <span>COURIER MANAGEMENT</span>
                        <span className="text-gray-300">|</span>
                        <span>Student Parcels</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                My{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Parcels
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Track your incoming couriers and deliveries
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                                <div className="flex items-center gap-2">
                                    <Truck size={14} className="text-indigo-600" />
                                    <span className="text-xs font-medium text-indigo-700">Gate Hours: 6 AM - 10 PM</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Package size={16} className="text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Total Parcels</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock size={16} className="text-amber-600" />
                            </div>
                            <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{stats.pending}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Pending Pickup</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <CheckCircle2 size={16} className="text-emerald-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Delivered</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                <TrendingUp size={16} className="text-gray-600" />
                            </div>
                            <span className="text-[9px] font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{stats.arrivalRate}%</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.arrivalRate}%</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Collection Rate</p>
                    </div>
                </div>

                {/* Pending Alert Banner */}
                <AnimatePresence>
                    {pendingParcels.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl overflow-hidden shadow-lg"
                        >
                            <div className="px-6 py-5">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-white/20 rounded-lg">
                                            <Bell size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-semibold text-sm">Items Ready for Pickup</h3>
                                            <p className="text-white/70 text-xs mt-0.5">
                                                You have {pendingParcels.length} parcel{pendingParcels.length !== 1 ? 's' : ''} waiting at the security gate
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setShowAllCodes(!showAllCodes)}
                                            className="px-4 py-2 bg-white text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-50 transition-colors"
                                        >
                                            {showAllCodes ? 'Hide Codes' : 'View Pickup Codes'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* All Pickup Codes Modal */}
                <AnimatePresence>
                    {showAllCodes && pendingParcels.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowAllCodes(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex justify-between items-center">
                                    <h3 className="text-white font-semibold text-sm">Pickup Codes</h3>
                                    <button onClick={() => setShowAllCodes(false)} className="text-white/70 hover:text-white">
                                        <XCircle size={18} />
                                    </button>
                                </div>
                                <div className="p-5 space-y-3 max-h-[400px] overflow-y-auto">
                                    {pendingParcels.map((parcel) => (
                                        <div key={parcel._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{parcel.courierName}</p>
                                                <p className="text-[10px] text-gray-500">{parcel.trackingId || 'Personal Package'}</p>
                                            </div>
                                            <div className="px-3 py-1.5 bg-gray-900 rounded-lg">
                                                <p className="text-lg font-mono font-bold text-white tracking-wider">{parcel.pickupCode}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                                    <p className="text-[10px] text-gray-500 text-center">
                                        Present these codes at the security gate for pickup
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Pending Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <Clock size={14} className="text-amber-500" />
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Pending Pickup</h3>
                            <span className="text-[9px] text-gray-400">{pendingParcels.length} items</span>
                        </div>

                        <div className="space-y-3">
                            {pendingParcels.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Package size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-500">No pending parcels</p>
                                    <p className="text-[10px] text-gray-400 mt-1">All your packages have been collected</p>
                                </div>
                            ) : (
                                pendingParcels.map((parcel, idx) => (
                                    <motion.div
                                        key={parcel._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="text-sm font-semibold text-gray-900">{parcel.courierName}</h4>
                                                    <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-medium">
                                                        Arrived
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-mono">{parcel.trackingId || 'No tracking ID'}</p>
                                            </div>
                                            <div className="bg-gray-900 rounded-lg px-3 py-1.5">
                                                <p className="text-sm font-mono font-bold text-white tracking-wider">{parcel.pickupCode}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={10} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500">
                                                    Arrived: {new Date(parcel.arrivedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={10} className="text-gray-400" />
                                                <span className="text-[10px] text-gray-500">Main Security Gate</span>
                                            </div>
                                        </div>

                                        {parcel.notes && (
                                            <div className="flex items-start gap-1.5 p-2 bg-gray-50 rounded-lg">
                                                <Info size={10} className="text-gray-400 mt-0.5 shrink-0" />
                                                <p className="text-[9px] text-gray-500 italic">{parcel.notes}</p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {pendingParcels.length > 0 && (
                            <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                <Shield size={12} className="text-amber-600" />
                                <p className="text-[9px] text-amber-700">
                                    Carry your student ID when picking up packages
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Delivered Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Delivery History</h3>
                            <span className="text-[9px] text-gray-400">{deliveredParcels.length} items</span>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            {deliveredParcels.length === 0 ? (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Package size={20} className="text-gray-300" />
                                    </div>
                                    <p className="text-xs text-gray-500">No delivery history</p>
                                    <p className="text-[10px] text-gray-400 mt-1">Your delivered parcels will appear here</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {deliveredParcels.map((parcel, idx) => (
                                        <motion.div
                                            key={parcel._id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="p-4 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{parcel.courierName}</p>
                                                        <p className="text-[9px] text-gray-400">
                                                            Delivered {new Date(parcel.deliveredAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                                            </div>
                                            {parcel.trackingId && (
                                                <div className="mt-2 ml-8">
                                                    <p className="text-[9px] text-gray-400 font-mono">ID: {parcel.trackingId}</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Info Card */}
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-indigo-50 rounded-lg">
                                    <Info size={14} className="text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-900">Gate Hours Information</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                        Packages can be collected from the main security gate between 6:00 AM and 10:00 PM daily.
                                    </p>
                                    <p className="text-[9px] text-gray-400 mt-2">
                                        Carry your student ID and the pickup code for verification
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentParcels;