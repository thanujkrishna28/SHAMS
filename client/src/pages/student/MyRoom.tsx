import { useAuthStore } from '@/store/authStore';
import { useMyAllocation } from '@/hooks/useAllocation';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Users, ShieldCheck, MapPin, Wind, CheckCircle, Clock,
    AlertCircle, Home, ArrowRight, Key, Calendar, Building2,
    UserCheck, Wifi, Thermometer, DoorOpen, BedDouble,
    Sparkles, ChevronRight, Mail, Phone
} from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';

const MyRoom = () => {
    const { user, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const room: any = user?.profile?.room;
    const { data: myAllocations } = useMyAllocation();

    // Helper function to get room status color
    const getRoomStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'MAINTENANCE': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'EXPIRED': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-600 border-gray-200';
        }
    };

    // 1. Show Room Details if Allocated
    if (room && typeof room === 'object' && room.roomNumber) {
        const roommates = room.occupants?.filter((occ: any) => occ._id !== user?._id) || [];
        const roomStatus = room.status || 'ACTIVE';
        const statusColor = getRoomStatusColor(roomStatus);

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
                            <span>RESIDENCE MANAGEMENT</span>
                            <span className="text-gray-300">|</span>
                            <span>Current Allocation</span>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                        Room{' '}
                                        <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {room.roomNumber}
                                        </span>
                                    </h1>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-medium border ${statusColor}`}>
                                        {roomStatus}
                                    </span>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Block {typeof room.block === 'object' ? room.block.name : room.block} • Level {room.floor} • {room.type} Configuration
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${room.isAC ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                    <Wind size={14} />
                                    {room.isAC ? 'Climate Controlled' : 'Standard Ventilation'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Room Details */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Specifications Card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-gray-500" />
                                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Room Specifications</h2>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Location */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <MapPin size={16} className="text-indigo-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Location</p>
                                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                                    Block {typeof room.block === 'object' ? room.block.name : room.block}, Floor {room.floor}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Occupancy */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <Users size={16} className="text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Occupancy</p>
                                                <p className="text-sm font-medium text-gray-900 mt-0.5">
                                                    {room.occupants?.length || 0} / {room.capacity} Residents
                                                </p>
                                            </div>
                                        </div>

                                        {/* Room Type */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <BedDouble size={16} className="text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Configuration</p>
                                                <p className="text-sm font-medium text-gray-900 mt-0.5">{room.type} Sharing</p>
                                            </div>
                                        </div>

                                        {/* Climate */}
                                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <div className="p-1.5 bg-white rounded-lg shadow-sm">
                                                <Thermometer size={16} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Climate</p>
                                                <p className="text-sm font-medium text-gray-900 mt-0.5">{room.isAC ? 'Air Conditioned' : 'Non-AC'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Amenities */}
                                    {(room.hasWifi || room.hasAttachedBathroom) && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            <p className="text-xs font-medium text-gray-500 mb-2">Amenities</p>
                                            <div className="flex flex-wrap gap-2">
                                                {room.hasWifi && (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-indigo-50 rounded-lg text-xs text-indigo-700">
                                                        <Wifi size={12} /> WiFi Enabled
                                                    </span>
                                                )}
                                                {room.hasAttachedBathroom && (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-50 rounded-lg text-xs text-emerald-700">
                                                        <DoorOpen size={12} /> Attached Bathroom
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Card */}
                            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-5">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <CheckCircle size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-emerald-800">Active Residency Status</p>
                                        <p className="text-xs text-emerald-600 mt-0.5">
                                            Your accommodation is confirmed for the current academic semester. All services are active.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Roommates & Key Info */}
                        <div className="space-y-6">
                            {/* Roommates Card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gray-500" />
                                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                            Roommates ({roommates.length})
                                        </h2>
                                    </div>
                                </div>

                                <div className="p-4">
                                    {roommates.length > 0 ? (
                                        <div className="space-y-3">
                                            {roommates.map((mate: any, idx: number) => (
                                                <motion.div
                                                    key={mate._id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center text-indigo-700 font-semibold text-base shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                                                        {mate.profile?.profileImage ? (
                                                            <img
                                                                src={getImageUrl(mate.profile.profileImage, mate.name)}
                                                                alt={mate.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span>{mate.name?.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">{mate.name}</p>
                                                        <p className="text-[10px] text-gray-400 font-mono">{mate.profile?.studentId || 'Student'}</p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3">
                                                <Users size={20} className="text-gray-300" />
                                            </div>
                                            <p className="text-xs text-gray-400">No roommates assigned yet</p>
                                            <p className="text-[10px] text-gray-300 mt-1">You're currently occupying this room solo</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Key Information Card */}
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <Key size={16} className="text-gray-500" />
                                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Key Information</h2>
                                    </div>
                                </div>

                                <div className="p-4 space-y-3">
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">Allocation Date</span>
                                        <span className="text-xs font-medium text-gray-800">
                                            {room.allocationDate ? new Date(room.allocationDate).toLocaleDateString() : 'Current Semester'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between py-2 border-b border-gray-50">
                                        <span className="text-xs text-gray-500">Floor Number</span>
                                        <span className="text-xs font-medium text-gray-800">{room.floor}</span>
                                    </div>
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-xs text-gray-500">Room Type</span>
                                        <span className="text-xs font-medium text-gray-800 capitalize">{room.type} Sharing</span>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} className="text-indigo-600" />
                                    <p className="text-xs font-semibold text-indigo-700">Quick Actions</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate('/student/complaints')}
                                        className="flex-1 px-3 py-1.5 bg-white text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
                                    >
                                        Report Issue
                                    </button>
                                    <button
                                        onClick={() => navigate('/student/leave')}
                                        className="flex-1 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Apply Leave
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    // 2. Show Pending Status if applicable
    const pendingOrApproved = myAllocations?.find((a: any) => a.status === 'pending' || a.status === 'approved');

    if (pendingOrApproved) {
        const isApproved = pendingOrApproved.status === 'approved';

        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="min-h-[70vh] flex items-center justify-center"
            >
                <div className="max-w-md w-full mx-auto px-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${isApproved ? 'bg-emerald-100' : 'bg-amber-100'
                            }`}>
                            {isApproved ? (
                                <CheckCircle size={40} className="text-emerald-600" />
                            ) : (
                                <Clock size={40} className="text-amber-600" />
                            )}
                        </div>

                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {isApproved ? 'Allocation Approved' : 'Request Under Review'}
                        </h2>

                        <p className="text-sm text-gray-500 mb-6">
                            {isApproved
                                ? "Your room allocation has been approved. Refresh to view your room details."
                                : `Your request for Block ${pendingOrApproved.requestedBlock} is being processed by the administration.`}
                        </p>

                        {isApproved && (
                            <button
                                onClick={() => { fetchProfile(); window.location.reload(); }}
                                className="w-full py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Refresh Details
                            </button>
                        )}

                        {!isApproved && (
                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-[10px] text-gray-400">
                                    You'll receive a notification once your allocation is confirmed
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        );
    }

    // 3. Not allocated -> Go to Selection
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="min-h-[70vh] flex items-center justify-center"
        >
            <div className="max-w-md w-full mx-auto px-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
                    <div className="relative inline-block mx-auto mb-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center">
                            <Home size={36} className="text-gray-400" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                            <AlertCircle size={14} className="text-white" />
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mb-2">No Room Assigned</h2>
                    <p className="text-sm text-gray-500 mb-6">
                        You haven't been allocated a room yet. Begin the selection process to choose your residence.
                    </p>

                    <button
                        onClick={() => navigate('/student/selection')}
                        className="w-full py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 group"
                    >
                        Start Room Selection
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] text-gray-400">
                            Available rooms are shown on a first-come, first-served basis
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// Missing import for RefreshCw
import { RefreshCw } from 'lucide-react';

export default MyRoom;