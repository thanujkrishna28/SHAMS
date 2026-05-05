import {
    Bed, Users, Bell, CheckCircle, Utensils,
    Fingerprint, Loader2, ChevronRight, Home, UserCheck, Shield,
    MapPin, ArrowRight, Lock, Key,
    FileText, Image, Contact, CheckSquare, AlertCircle, Smartphone
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useAuthStore } from '@/store/authStore';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RequestChangeModal from '@/components/RequestChangeModal';
import { useSettings } from '@/hooks/useSettings';
import toast from 'react-hot-toast';
import { Room } from '@/types';

const StudentDashboard = () => {
    const { user, setMealPreference, startWebAuthnRegistration, fetchProfile } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { data: announcements, isLoading: annLoading } = useAnnouncements();
    const { data: settings } = useSettings();
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

    const handleSetMealPreference = async (preference: 'Veg' | 'Non-Veg') => {
        try {
            setIsLoading(true);
            await setMealPreference(preference);
            toast.success(`Meal preference set to ${preference}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update preference');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterBiometric = async () => {
        try {
            setIsLoading(true);
            toast.loading('Initializing secure enclave...', { id: 'setup-bio' });
            await startWebAuthnRegistration();
            await fetchProfile();
            toast.success('Passkey registered successfully', { id: 'setup-bio' });
        } catch (error: any) {
            console.error('Biometric Registration Error:', error);
            toast.error(error.message || 'Registration failed. Please try again.', { id: 'setup-bio' });
        } finally {
            setIsLoading(false);
        }
    };

    const room = user?.profile?.room as unknown as Room;

    // Calculate completion percentage
    const completionSteps = [
        !!user?.profile?.idProof,
        !!user?.profile?.admissionLetter,
        !!user?.profile?.profileImage,
        !!user?.profile?.isVerified
    ];
    const completionPercentage = (completionSteps.filter(Boolean).length / 4) * 100;

    const stats = [
        {
            label: 'Residence',
            value: room ? `${typeof (room.block as any) === 'object' ? (room.block as any).name : room.block} • ${room.roomNumber}` : 'Unassigned',
            sublabel: room ? `${room.type} Sharing • ${room.isAC ? 'AC' : 'Non-AC'}` : '',
            icon: Bed,
            trend: room ? 'active' : 'pending',
        },
        {
            label: 'Occupancy',
            value: room?.occupants?.length ? `${room.occupants.length}/${room.capacity}` : '0/0',
            sublabel: `${(room?.occupants?.length || 0) - 1} roommate${(room?.occupants?.length || 0) - 1 === 1 ? '' : 's'}`,
            icon: Users,
            trend: room?.occupants?.length === room?.capacity ? 'full' : 'available',
        },
        {
            label: 'Presence',
            value: user?.profile?.isInside ? 'On Campus' : 'Off Campus',
            sublabel: user?.profile?.isInside ? 'Active Session' : 'Last seen today',
            icon: MapPin,
            trend: user?.profile?.isInside ? 'active' : 'inactive',
        },
        {
            label: 'Verification',
            value: user?.profile?.isVerified ? 'Approved' : 'In Progress',
            sublabel: `${Math.round(completionPercentage)}% Complete`,
            icon: Shield,
            trend: user?.profile?.isVerified ? 'verified' : 'pending',
        },
    ];

    const trendColors = {
        active: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        inactive: { bg: 'bg-gray-50', text: 'text-gray-500', dot: 'bg-gray-400' },
        available: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
        full: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
        verified: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
        pending: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl bg-white border border-gray-100 flex-shrink-0 hidden sm:flex items-center justify-center">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                    <div className="sm:hidden w-6 h-6 rounded-md overflow-hidden bg-white border border-gray-100 flex items-center justify-center">
                                        <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                                    </div>
                                    <span className="font-mono">STUDENT PORTAL</span>
                                    <span className="text-gray-300">|</span>
                                    <span>Academic Year 2024-25</span>
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-light text-gray-900 tracking-tight">
                                Welcome back,{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {user?.name?.split(' ')[0] || 'Student'}
                                </span>
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            </div>
                    </div>

                        {settings?.roomChangeEnabled && user?.profile?.room && (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setIsRequestModalOpen(true)}
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200"
                            >
                                Request Room Change
                                <ChevronRight size={16} />
                            </motion.button>
                        )}
                    </div>
                </div>

                <RequestChangeModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} />

                {/* Stats Grid - Enterprise Style */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8">
                    {stats.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="group relative bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`p-2.5 rounded-lg transition-colors ${trendColors[item.trend as keyof typeof trendColors]?.bg || 'bg-gray-50'}`}>
                                    <item.icon size={20} className={trendColors[item.trend as keyof typeof trendColors]?.text || 'text-gray-600'} />
                                </div>
                                <div className={`w-2 h-2 rounded-full ${trendColors[item.trend as keyof typeof trendColors]?.dot || 'bg-gray-400'}`} />
                            </div>
                            <p className="text-2xl font-semibold text-gray-900 tracking-tight">{item.value}</p>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mt-1">{item.label}</p>
                            {item.sublabel && (
                                <p className="text-xs text-gray-500 mt-1">{item.sublabel}</p>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Biometric Banner - Minimal Professional */}
                {user?.profile?.isVerified && (!user?.profile?.webauthnCredentials || user.profile.webauthnCredentials?.length === 0) && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-indigo-100 p-4 mb-8 shadow-sm"
                    >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-sm">
                                    <Fingerprint size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Enable Passkey Authentication</p>
                                    <p className="text-xs text-gray-500">Secure login with fingerprint, face ID, or device PIN</p>
                                </div>
                            </div>
                            <button
                                onClick={handleRegisterBiometric}
                                disabled={isLoading}
                                className="px-4 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <Lock size={14} />
                                        Set up passkey
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Alert Cards - Professional Stack */}
                <div className="space-y-3 mb-8">
                    {/* Verification Required */}
                    {!user?.profile?.isVerified && (
                        <div className="bg-amber-50/50 rounded-lg border border-amber-100 p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-amber-100 rounded">
                                        <AlertCircle size={16} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Verification Required</p>
                                        <p className="text-xs text-amber-600">Complete KYC to access all hostel services</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/student/profile')}
                                    className="px-3 py-1.5 bg-amber-500 text-white text-xs font-medium rounded hover:bg-amber-600 transition-colors"
                                >
                                    Complete verification
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Room Allocation */}
                    {user?.profile?.isVerified && !user?.profile?.room && (
                        <div className="bg-emerald-50/50 rounded-lg border border-emerald-100 p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-emerald-100 rounded">
                                        <Home size={16} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-emerald-800">Room Allocation Pending</p>
                                        <p className="text-xs text-emerald-600">Select your preferred accommodation</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/student/room')}
                                    className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded hover:bg-emerald-700 transition-colors"
                                >
                                    Browse rooms
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Meal Preference */}
                    {user?.profile?.isVerified && user?.profile?.room && !user?.profile?.mealPreference && (
                        <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-blue-100 rounded">
                                        <Utensils size={16} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-800">Select Meal Preference</p>
                                        <p className="text-xs text-blue-600">Choose your dining preference (permanent selection)</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSetMealPreference('Veg')}
                                        className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded hover:bg-emerald-600 transition-colors"
                                    >
                                        Vegetarian
                                    </button>
                                    <button
                                        onClick={() => handleSetMealPreference('Non-Veg')}
                                        className="px-3 py-1.5 bg-orange-500 text-white text-xs font-medium rounded hover:bg-orange-600 transition-colors"
                                    >
                                        Non-Vegetarian
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Left Column - Room & Announcements */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Room Details - Professional Card */}
                        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-2">
                                    <Key size={16} className="text-gray-500" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Current Residence</h2>
                                </div>
                            </div>

                            <div className="p-6">
                                {room ? (
                                    <div className="space-y-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Room Number</p>
                                                <p className="text-3xl font-light text-gray-900">
                                                    {room.roomNumber}
                                                    <span className="text-sm font-normal text-gray-400 ml-2">
                                                        {typeof (room.block as any) === 'object' ? (room.block as any).name : room.block}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
                                                <span className={`inline-flex px-2 py-1 rounded text-xs font-medium ${room.status === 'available' ? 'bg-emerald-100 text-emerald-700' :
                                                    room.status === 'full' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {room.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
                                            <div>
                                                <p className="text-xs text-gray-400">Room Type</p>
                                                <p className="text-sm font-medium text-gray-800 mt-1">{room.type} Sharing</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Climate</p>
                                                <p className="text-sm font-medium text-gray-800 mt-1">{room.isAC ? 'Air Conditioned' : 'Non-AC'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-400">Floor</p>
                                                <p className="text-sm font-medium text-gray-800 mt-1">{room.floor}</p>
                                            </div>
                                        </div>

                                        {room.occupants && room.occupants.length > 1 && (
                                            <div className="pt-3 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Fellow Residents</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {room.occupants
                                                        .filter((occ: any) => occ._id !== user?._id)
                                                        .map((roommate: any, idx: number) => (
                                                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
                                                                <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
                                                                    <span className="text-[10px] font-medium text-indigo-600">
                                                                        {roommate.name?.charAt(0) || 'U'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-xs text-gray-700">{roommate.name}</span>
                                                            </div>
                                                        ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Home size={24} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm">No accommodation assigned</p>
                                        <button
                                            onClick={() => navigate('/student/room')}
                                            className="mt-3 text-indigo-600 text-sm font-medium hover:text-indigo-700 inline-flex items-center gap-1"
                                        >
                                            Browse available rooms
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Latest Announcement - Hero Card */}
                        {!annLoading && announcements && announcements.length > 0 && (
                            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
                                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full -ml-20 -mb-20" />
                                <div className="relative p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="px-2 py-0.5 bg-white/20 rounded text-[10px] font-semibold text-white uppercase tracking-wider">
                                            Latest
                                        </div>
                                        <span className="text-xs text-white/70">
                                            {new Date(announcements[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">{announcements[0].title}</h3>
                                    <p className="text-white/80 text-sm leading-relaxed">{announcements[0].message}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Verification & Security */}
                    <div className="space-y-6">
                        {/* Verification Progress Card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-2">
                                    <UserCheck size={16} className="text-gray-500" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">KYC Status</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                        <span>Verification Progress</span>
                                        <span className="font-medium text-gray-700">{Math.round(completionPercentage)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${completionPercentage}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                            className="h-full bg-indigo-600 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-5">
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <Contact size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">ID Proof</span>
                                        </div>
                                        {user?.profile?.idProof ? (
                                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                <CheckCircle size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="text-xs text-amber-600">Pending</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between py-1.5 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">Admission Letter</span>
                                        </div>
                                        {user?.profile?.admissionLetter ? (
                                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                <CheckCircle size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="text-xs text-amber-600">Pending</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between py-1.5">
                                        <div className="flex items-center gap-2">
                                            <Image size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-600">Profile Photo</span>
                                        </div>
                                        {user?.profile?.profileImage ? (
                                            <span className="text-xs text-emerald-600 flex items-center gap-1">
                                                <CheckCircle size={12} /> Uploaded
                                            </span>
                                        ) : (
                                            <span className="text-xs text-amber-600">Pending</span>
                                        )}
                                    </div>
                                </div>

                                {!user?.profile?.isVerified ? (
                                    <button
                                        onClick={() => navigate('/student/profile')}
                                        className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 transition-colors"
                                    >
                                        Complete Verification
                                    </button>
                                ) : (
                                    <div className="flex items-center justify-center gap-2 py-2 text-emerald-600 text-sm">
                                        <CheckSquare size={16} />
                                        <span>All documents verified</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Security Card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-gray-500" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Account Security</h2>
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-5">
                                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg shadow-sm">
                                        <Smartphone size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Passkeys</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {user?.profile?.webauthnCredentials?.length
                                                ? `${user.profile.webauthnCredentials.length} device${user.profile.webauthnCredentials.length === 1 ? '' : 's'} registered`
                                                : 'No devices registered'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRegisterBiometric}
                                    disabled={isLoading}
                                    className="w-full py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <>
                                            <Fingerprint size={16} />
                                            {user?.profile?.webauthnCredentials?.length ? 'Manage Passkeys' : 'Set up Passkeys'}
                                        </>
                                    )}
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-3">
                                    Works with fingerprint, face ID, and device PIN
                                </p>
                            </div>
                        </div>

                        {/* Recent Updates - Compact */}
                        {!annLoading && announcements && announcements.length > 1 && (
                            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/30">
                                    <div className="flex items-center gap-2">
                                        <Bell size={16} className="text-gray-500" />
                                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Updates</h2>
                                    </div>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {announcements.slice(1, 4).map((ann) => (
                                        <div key={ann._id} className="p-4 hover:bg-gray-50 transition-colors">
                                            <p className="text-[10px] text-gray-400 font-mono mb-1">
                                                {new Date(ann.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-sm font-medium text-gray-800 line-clamp-1">
                                                {ann.title}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;