import { motion } from 'framer-motion';
import { Bed, Users, Clock, AlertCircle, Bell, CheckCircle, Utensils } from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestChangeModal from '@/components/RequestChangeModal';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
    const { user, setMealPreference } = useAuthStore();
    const navigate = useNavigate();
    const { data: announcements, isLoading } = useAnnouncements();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const handleSetMealPreference = async (preference: 'Veg' | 'Non-Veg') => {
        if (!window.confirm(`Are you sure you want to select ${preference}? This cannot be changed later.`)) return;
        try {
            await setMealPreference(preference);
            toast.success('Mess style updated successfully!');
        } catch (error) {
            toast.error('Failed to update mess style');
        }
    };

    const room: any = user?.profile?.room;

    const stats = [
        {
            label: 'My Room',
            value: room ? `${typeof (room.block as any) === 'object' ? (room.block as any).name : room.block}-${room.roomNumber}` : 'N/A',
            icon: Bed,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        { label: 'Roommates', value: room?.occupants?.length > 1 ? (room.occupants.length - 1).toString() : '0', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Status', value: user?.profile?.isInside ? 'On Campus' : 'Outside', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Verification', value: user?.profile?.isVerified ? 'Verified' : 'Pending', icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
                <button
                    onClick={() => setIsRequestModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl shadow-lg hover:bg-primary-hover transition-all"
                >
                    Request Room Change
                </button>
            </div>

            <RequestChangeModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />

            {!user?.profile?.isVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 text-amber-800">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold">Profile Verification Required</h3>
                            <p className="text-sm text-amber-700">You must upload your ID proof and admission letter before booking a room.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/student/profile')}
                        className="whitespace-nowrap px-4 py-2 bg-amber-500 text-white font-medium rounded-xl shadow hover:bg-amber-600 transition-colors"
                    >
                        Verify Now
                    </button>
                </div>
            )}

            {user?.profile?.isVerified && !user?.profile?.room && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3 text-emerald-800">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold">YOUR PROFILE WAS VERIFIED</h3>
                            <p className="text-sm text-emerald-700">Please proceed to allocate your room.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/student/room')}
                        className="whitespace-nowrap px-4 py-2 bg-emerald-600 text-white font-medium rounded-xl shadow hover:bg-emerald-700 transition-colors"
                    >
                        Allocate Your Room
                    </button>
                </div>
            )}

            {user?.profile?.isVerified && user?.profile?.room && !user?.profile?.mealPreference && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-200 rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4 text-indigo-900 text-center md:text-left">
                            <div className="p-3 bg-white rounded-2xl shadow-sm text-indigo-600">
                                <Utensils size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Update your mess style: Veg or Non-Veg</h3>
                                <p className="text-sm text-indigo-700">Choose your preference to help us plan better. <span className="font-bold underline">This selection cannot be changed later.</span></p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
                            <button
                                onClick={() => handleSetMealPreference('Veg')}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:bg-green-700 transition-all active:scale-95"
                            >
                                Vegetarian
                            </button>
                            <button
                                onClick={() => handleSetMealPreference('Non-Veg')}
                                className="flex-1 sm:flex-none px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                            >
                                Non-Vegetarian
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Announcements Banner */}
            {isLoading ? (
                <div className="h-40 bg-gray-100 animate-pulse rounded-2xl"></div>
            ) : announcements && announcements.length > 0 && (
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Bell size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-semibold backdrop-blur-sm">New Announcement</span>
                            <span className="text-xs text-white/80">{new Date(announcements[0].createdAt).toLocaleDateString()}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-1">{announcements[0].title}</h3>
                        <p className="text-white/90 text-sm max-w-2xl">{announcements[0].message}</p>
                    </div>
                </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 bg-surface rounded-2xl border border-border/50 shadow-soft hover:shadow-lg transition-all"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${item.bg}`}>
                                <item.icon className={item.color} size={24} />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{item.value}</h3>
                        <p className="text-sm text-gray-500">{item.label}</p>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Room Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-surface p-6 rounded-2xl border border-border/50 shadow-soft">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Room Details</h2>
                        {room ? (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md mb-4 text-primary">
                                    <Bed size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Room {room.roomNumber}</h3>
                                <p className="text-gray-500">
                                    Block {typeof (room.block as any) === 'object' ? (room.block as any).name : room.block} • {room.floor}th Floor • {room.type} Sharing
                                </p>

                                <div className="mt-6 flex gap-3 flex-wrap justify-center">
                                    <div className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-100">
                                        {room.isAC ? 'Air Conditioned' : 'Non-AC'}
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-100">
                                        Capacity: {room.capacity}
                                    </div>
                                    <div className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-100">
                                        Status: {room.status}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-12 text-center text-gray-400 border border-dashed border-gray-200">
                                <Bed size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No room allocated yet.</p>
                                <button onClick={() => navigate('/student/room')} className="mt-4 text-primary font-bold text-sm hover:underline">Browse Available Rooms</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Status & Notices List */}
                <div className="space-y-6">
                    <div className="bg-surface p-6 rounded-2xl border border-border/50 shadow-soft">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Verification</h2>
                        <div className="relative pt-1">
                            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                                <div style={{ width: user?.profile?.isVerified ? "100%" : "60%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-1000"></div>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            {user?.profile?.isVerified ? "Your profile is fully verified!" : "Complete your profile to access all features."}
                        </p>
                        {!user?.profile?.isVerified && (
                            <button
                                onClick={() => navigate('/student/profile')}
                                className="w-full py-2 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors text-sm"
                            >
                                Complete Profile
                            </button>
                        )}
                    </div>

                    {/* Compact list of other announcements if > 1 */}
                    {announcements && announcements.length > 1 && (
                        <div className="bg-surface p-6 rounded-2xl border border-border/50 shadow-soft">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Updates</h2>
                            <div className="space-y-4">
                                {announcements.slice(1, 4).map((ann) => (
                                    <div key={ann._id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <p className="text-xs text-gray-400 mb-1">{new Date(ann.createdAt).toLocaleDateString()}</p>
                                        <h4 className="font-semibold text-gray-800 text-sm line-clamp-1">{ann.title}</h4>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
