import React from 'react';
import {
    Clock,
    Zap,
    Calendar,
    CheckCircle2,
    Play,
    History,
    RefreshCw,
    AlertCircle,
    MapPin,
    Timer,
    Loader2,
    TrendingUp,
    Users,
    Wrench
} from 'lucide-react';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const LaundryManagement = () => {
    const [machines, setMachines] = React.useState<any[]>([]);
    const [myBookings, setMyBookings] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isBooking, setIsBooking] = React.useState(false);
    const [selectedMachine, setSelectedMachine] = React.useState<string | null>(null);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const [machData, bookData] = await Promise.all([
                api.get('/laundry/machines'),
                api.get('/laundry/my-bookings')
            ]);
            setMachines(machData.data);
            setMyBookings(bookData.data);
        } catch (error) {
            toast.error('Failed to load laundry data');
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchData();
    }, []);

    const handleBook = async (machineId: string) => {
        setSelectedMachine(machineId);
        try {
            setIsBooking(true);
            await api.post('/laundry/book', { machineId, duration: 45 });
            toast.success('Machine booked! You have 45 minutes.');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Booking failed');
        } finally {
            setIsBooking(false);
            setSelectedMachine(null);
        }
    };

    const stats = {
        total: machines.length,
        available: machines.filter(m => m.status === 'Available').length,
        running: machines.filter(m => m.status === 'Running').length,
        maintenance: machines.filter(m => m.status === 'Maintenance').length,
        usageRate: machines.length > 0 ? Math.round(((machines.length - machines.filter(m => m.status === 'Available').length) / machines.length) * 100) : 0
    };

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'Available':
                return { icon: <CheckCircle2 size={14} />, color: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Available' };
            case 'Running':
                return { icon: <RefreshCw size={14} />, color: 'blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-100', label: 'In Use' };
            case 'Maintenance':
                return { icon: <AlertCircle size={14} />, color: 'red', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', label: 'Maintenance' };
            default:
                return { icon: <Clock size={14} />, color: 'gray', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-100', label: status };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Loading laundry services...</p>
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
                        <span>SMART FACILITIES</span>
                        <span className="text-gray-300">|</span>
                        <span>Laundry Management</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                Smart{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Laundry
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Real-time machine availability and booking system
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                                <div className="flex items-center gap-2">
                                    <Timer size={14} className="text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-700">45 min per session</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-1.5 bg-indigo-50 rounded-lg">
                                <Zap size={14} className="text-indigo-600" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                        <p className="text-[9px] text-gray-500">Total Machines</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-1.5 bg-emerald-50 rounded-lg">
                                <CheckCircle2 size={14} className="text-emerald-600" />
                            </div>
                            <span className="text-[8px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">{stats.available}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stats.available}</p>
                        <p className="text-[9px] text-gray-500">Available</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-1.5 bg-blue-50 rounded-lg">
                                <RefreshCw size={14} className="text-blue-600" />
                            </div>
                            <span className="text-[8px] font-medium text-blue-600 bg-blue-50 px-1 py-0.5 rounded">{stats.running}</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stats.running}</p>
                        <p className="text-[9px] text-gray-500">In Use</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div className="p-1.5 bg-gray-50 rounded-lg">
                                <TrendingUp size={14} className="text-gray-600" />
                            </div>
                            <span className="text-[8px] font-medium text-gray-500 bg-gray-100 px-1 py-0.5 rounded">{stats.usageRate}%</span>
                        </div>
                        <p className="text-xl font-bold text-gray-900">{stats.usageRate}%</p>
                        <p className="text-[9px] text-gray-500">Usage Rate</p>
                    </div>
                </div>

                {/* Machines Grid */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <Zap size={14} className="text-gray-500" />
                        <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Available Machines</h2>
                        <span className="text-[9px] text-gray-400">{machines.length} units</span>
                    </div>

                    {machines.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Zap size={24} className="text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-500">No machines registered yet</p>
                            <p className="text-xs text-gray-400 mt-1">Check back later for availability</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {machines.map((machine, idx) => {
                                const statusConfig = getStatusConfig(machine.status);
                                const isAvailable = machine.status === 'Available';
                                const isRunning = machine.status === 'Running';

                                return (
                                    <motion.div
                                        key={machine._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        whileHover={{ y: -2 }}
                                        className={`bg-white rounded-xl border p-4 transition-all ${isAvailable
                                                ? 'border-gray-100 hover:shadow-md'
                                                : isRunning
                                                    ? 'border-blue-100 bg-blue-50/20'
                                                    : 'border-gray-100 opacity-75'
                                            }`}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-3">
                                            <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                                                {isRunning ? (
                                                    <RefreshCw size={16} className={`${statusConfig.text} animate-spin-slow`} />
                                                ) : (
                                                    <Zap size={16} className={statusConfig.text} />
                                                )}
                                            </div>
                                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                                                {statusConfig.label}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <h3 className="text-base font-semibold text-gray-900">{machine.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 mb-3">
                                            <MapPin size={10} className="text-gray-400" />
                                            <p className="text-[10px] text-gray-500">{machine.location}</p>
                                        </div>
                                        <p className="text-[9px] text-gray-400 uppercase tracking-wider mb-3">{machine.type}</p>

                                        {/* Action Button */}
                                        <button
                                            disabled={!isAvailable || isBooking}
                                            onClick={() => handleBook(machine._id)}
                                            className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${isAvailable
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            {isBooking && selectedMachine === machine._id ? (
                                                <div className="flex items-center justify-center gap-1">
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Booking...
                                                </div>
                                            ) : isAvailable ? (
                                                'Book Machine'
                                            ) : isRunning ? (
                                                'Currently In Use'
                                            ) : (
                                                'Under Maintenance'
                                            )}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Booking History */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex items-center gap-2">
                            <History size={16} className="text-gray-500" />
                            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Booking History</h2>
                            <span className="text-[9px] text-gray-400">{myBookings.length} records</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {myBookings.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <History size={20} className="text-gray-300" />
                                </div>
                                <p className="text-xs text-gray-500">No booking history</p>
                                <p className="text-[10px] text-gray-400 mt-1">Your laundry bookings will appear here</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-5 py-3 text-left text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Machine</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Start Time</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                        <th className="px-5 py-3 text-left text-[9px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {myBookings.map((booking, idx) => {
                                        const isCompleted = booking.status === 'Completed';
                                        const startTime = new Date(booking.startTime);
                                        const now = new Date();
                                        const isActive = startTime <= now && now < new Date(startTime.getTime() + booking.duration * 60000);

                                        return (
                                            <motion.tr
                                                key={booking._id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.02 }}
                                                className="hover:bg-gray-50/50 transition-colors"
                                            >
                                                <td className="px-5 py-3">
                                                    <p className="text-sm font-medium text-gray-900">{booking.machine?.name}</p>
                                                    <p className="text-[9px] text-gray-400">{booking.machine?.type}</p>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <p className="text-xs text-gray-700">
                                                        {startTime.toLocaleDateString()}
                                                    </p>
                                                    <p className="text-[9px] text-gray-400">
                                                        {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 rounded text-[9px] font-medium text-indigo-700">
                                                        <Timer size={10} />
                                                        {booking.duration} min
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium ${isCompleted
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : isActive
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-amber-100 text-amber-700'
                                                        }`}>
                                                        {isCompleted ? (
                                                            <CheckCircle2 size={10} />
                                                        ) : isActive ? (
                                                            <RefreshCw size={10} className="animate-spin-slow" />
                                                        ) : (
                                                            <Clock size={10} />
                                                        )}
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100">
                        <Clock size={12} className="text-blue-600" />
                        <span className="text-[10px] text-blue-700">45 min wash cycle</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-lg border border-amber-100">
                        <AlertCircle size={12} className="text-amber-600" />
                        <span className="text-[10px] text-amber-700">Collect on time to avoid penalties</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-100">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span className="text-[10px] text-emerald-700">Bring your own detergent</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default LaundryManagement;