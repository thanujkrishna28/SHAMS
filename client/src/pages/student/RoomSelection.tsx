import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight,
    Clock,
    CheckCircle,
    Lock,
    Wind,
    Users,
    Building2,
    MapPin,
    Bed,
    Sparkles,
    Info
} from 'lucide-react';
import { useHostels } from '@/hooks/useHostels';
import { useRooms } from '@/hooks/useRooms';
import { useAuthStore } from '@/store/authStore';
import { useLockRoom, useUnlockRoom, useRequestAllocation, useMyAllocation } from '@/hooks/useAllocation';
import { Room } from '@/types';
import toast from 'react-hot-toast';
import api from '@/api/axios';

const RoomSelection = () => {
    const { user, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const [step, setStep] = useState<'hostel' | 'room'>('hostel');
    const [selectedHostel, setSelectedHostel] = useState<any>(null);
    const [selectedBlock, setSelectedBlock] = useState<string>('');
    const [isAC, setIsAC] = useState<boolean | undefined>(undefined);
    const [lockedRoom, setLockedRoom] = useState<Room | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [aiRecommendation, setAiRecommendation] = useState<string>('');
    const [isAiLoading, setIsAiLoading] = useState(false);

    // Queries
    const { data: hostels, isLoading: hostelsLoading } = useHostels();
    const { data: rooms, isLoading: roomsLoading } = useRooms({ hostelId: selectedHostel?._id, isAC });
    const { data: myAllocation } = useMyAllocation();

    // Mutations
    const { mutate: lockRoom, isPending: locking } = useLockRoom();
    const { mutate: unlockRoom } = useUnlockRoom();
    const { mutate: requestAllocation, isPending: requesting } = useRequestAllocation();

    const pendingOrApproved = myAllocation?.find((a: any) => a.status === 'pending' || a.status === 'approved');
    const blocks = selectedHostel?.blocks || [];

    // Timer logic for locked room
    useEffect(() => {
        if (!lockedRoom) return;

        const expiry = new Date(lockedRoom.lockExpiresAt!).getTime();

        const updateTimer = () => {
            const now = new Date().getTime();
            const diff = Math.max(0, Math.floor((expiry - now) / 1000));
            setTimeLeft(diff);
            if (diff === 0) setLockedRoom(null);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [lockedRoom]);

    const handleHostelSelect = async (hostel: any) => {
        setSelectedHostel(hostel);
        setStep('room');
        setSelectedBlock('');

        if (hostel) {
            setIsAiLoading(true);
            try {
                const res = await api.post('/rooms/recommendation', {
                    hostelId: hostel._id,
                    preferences: {
                        gender: user?.profile?.gender,
                        course: user?.profile?.course,
                        year: user?.profile?.year
                    }
                });
                setAiRecommendation(res.data.recommendation);
            } catch (err) {
                console.error("Failed to get AI recommendation", err);
            } finally {
                setIsAiLoading(false);
            }
        }
    };

    const handleLock = (room: Room) => {
        if (lockedRoom) {
            toast.error('You already have a room locked');
            return;
        }

        lockRoom(room._id, {
            onSuccess: (updatedRoom) => {
                setLockedRoom(updatedRoom);
                toast.success('Room reserved for 5 minutes');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to lock room');
            }
        });
    };

    const handleConfirmRequest = () => {
        if (!lockedRoom) return;
        requestAllocation({
            block: typeof lockedRoom.block === 'object' ? lockedRoom.block._id : lockedRoom.block,
            room: lockedRoom._id,
            reason: 'Initial room allocation request'
        }, {
            onSuccess: () => {
                toast.success('Allocation Request Submitted!');
                setShowConfirmModal(false);
                setLockedRoom(null);
                fetchProfile();
                navigate('/student/room');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Request failed');
            }
        });
    };

    const handleUnlock = () => {
        if (!lockedRoom) return;
        unlockRoom(lockedRoom._id, {
            onSuccess: () => {
                setLockedRoom(null);
                toast.success('Reservation released');
            }
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };



    const getOccupancyStatus = (current: number, capacity: number) => {
        if (current >= capacity) return { text: 'Full', color: 'text-red-600', bg: 'bg-red-50' };
        if (current === capacity - 1) return { text: 'Last Available', color: 'text-amber-600', bg: 'bg-amber-50' };
        if (current === 0) return { text: 'Vacant', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        return { text: `${capacity - current} Left`, color: 'text-blue-600', bg: 'bg-blue-50' };
    };

    if (pendingOrApproved) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="max-w-md w-full mx-auto px-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-8 text-center">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${pendingOrApproved.status === 'approved' ? 'bg-emerald-100' : 'bg-amber-100'
                            }`}>
                            {pendingOrApproved.status === 'approved' ? (
                                <CheckCircle size={40} className="text-emerald-600" />
                            ) : (
                                <Clock size={40} className="text-amber-600" />
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            {pendingOrApproved.status === 'approved' ? 'Allocation Approved' : 'Request Pending'}
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                            {pendingOrApproved.status === 'approved'
                                ? "Your room allocation has been approved. View your room details now."
                                : "You have a pending allocation request. Please wait for warden approval."}
                        </p>
                        <button
                            onClick={() => navigate('/student/room')}
                            className="w-full py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            View Status
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
                        <span>ROOM ALLOCATION</span>
                        <span className="text-gray-300">|</span>
                        <span>Step {step === 'hostel' ? '1' : '2'} of 2</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                {step === 'hostel' ? 'Select Your' : 'Choose a'}{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    {step === 'hostel' ? 'Residence' : 'Room'}
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                {step === 'hostel'
                                    ? 'Browse available hostels based on your preferences'
                                    : `${selectedHostel?.name} • ${selectedHostel?.type === 'BOYS' ? 'Boys Hostel' : 'Girls Hostel'}`}
                            </p>
                        </div>

                        {/* Locked Room Status */}
                        {lockedRoom && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-indigo-600 rounded-xl px-5 py-3 shadow-lg flex items-center gap-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Lock size={16} className="text-white/80" />
                                    <div>
                                        <p className="text-[10px] font-medium text-white/70">Reserved</p>
                                        <p className="text-sm font-bold text-white">Room {lockedRoom.roomNumber}</p>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-white/20" />
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-white/70" />
                                    <span className="text-lg font-mono font-bold text-white">{formatTime(timeLeft)}</span>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Step Indicator */}
                    <div className="flex items-center gap-3 mt-6">
                        <div className={`flex items-center gap-2 ${step === 'hostel' ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'hostel' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>1</div>
                            <span className="text-xs font-medium">Select Hostel</span>
                        </div>
                        <div className="w-12 h-px bg-gray-200" />
                        <div className={`flex items-center gap-2 ${step === 'room' ? 'text-indigo-600' : 'text-gray-400'}`}>
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${step === 'room' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                                }`}>2</div>
                            <span className="text-xs font-medium">Choose Room</span>
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {step === 'hostel' ? (
                        <motion.div
                            key="hostel-step"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                        >
                            {hostelsLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
                                ))
                            ) : (
                                hostels?.filter((h: any) => {
                                    if (!user?.profile?.gender) return true;
                                    const targetType = user.profile.gender === 'Male' ? 'BOYS' : 'GIRLS';
                                    return h.type === targetType;
                                }).map((hostel: any, idx: number) => (
                                    <motion.div
                                        key={hostel._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -4 }}
                                        onClick={() => handleHostelSelect(hostel)}
                                        className="group bg-white rounded-xl border border-gray-100 p-5 cursor-pointer hover:shadow-lg hover:border-gray-200 transition-all duration-300"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="p-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors">
                                                <Building2 size={24} className="text-indigo-600" />
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[9px] font-semibold ${hostel.type === 'BOYS' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                                                }`}>
                                                {hostel.type === 'BOYS' ? 'Boys' : 'Girls'}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{hostel.name}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                                            {hostel.description || 'Modern hostel with premium amenities and 24/7 security'}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Users size={12} className="text-gray-400" />
                                                    <span className="text-[10px] text-gray-500">{hostel.capacity} capacity</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={12} className="text-gray-400" />
                                                    <span className="text-[10px] text-gray-500">{hostel.blocks?.length || 0} blocks</span>
                                                </div>
                                            </div>
                                            <ArrowRight size={16} className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="room-step"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            {/* Control Bar */}
                            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                                <button
                                    onClick={() => setStep('hostel')}
                                    className="flex items-center gap-2 px-3 py-1.5 text-gray-500 hover:text-indigo-600 transition-colors text-sm"
                                >
                                    ← Back to Hostels
                                </button>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedBlock('')}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBlock === ''
                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                            }`}
                                    >
                                        All Blocks
                                    </button>
                                    {blocks?.map((block: any) => (
                                        <button
                                            key={block._id}
                                            onClick={() => setSelectedBlock(block._id)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedBlock === block._id
                                                    ? 'bg-indigo-600 text-white shadow-sm'
                                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {block.name}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setIsAC(isAC === true ? undefined : true)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${isAC
                                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <Wind size={14} />
                                    {isAC ? 'AC Only' : 'Show All'}
                                </button>
                            </div>

                            {/* AI Recommendation */}
                            {isAiLoading ? (
                                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            ) : aiRecommendation && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-4"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="p-1.5 bg-indigo-100 rounded-lg">
                                            <Sparkles size={16} className="text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider mb-1">AI Recommendation</p>
                                            <p className="text-sm text-gray-700">{aiRecommendation}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Room Grid */}
                            {roomsLoading ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {Array(8).fill(0).map((_, i) => (
                                        <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {rooms?.filter((r: any) => !selectedBlock || r.block?._id === selectedBlock).map((room: any, idx: number) => {
                                        const isFull = room.occupants?.length >= room.capacity;
                                        const isLocked = room.status === 'locked' && new Date(room.lockExpiresAt!) > new Date();
                                        const isMyLocked = lockedRoom?._id === room._id;
                                        const occupancyPercent = (room.occupants?.length / room.capacity) * 100;
                                        const occupancyStatus = getOccupancyStatus(room.occupants?.length, room.capacity);

                                        return (
                                            <motion.div
                                                key={room._id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.03 }}
                                                className={`group bg-white rounded-xl border p-4 transition-all duration-300 ${isMyLocked
                                                        ? 'border-indigo-300 ring-2 ring-indigo-200 shadow-md'
                                                        : isFull || isLocked
                                                            ? 'border-gray-100 opacity-75'
                                                            : 'border-gray-100 hover:shadow-md hover:border-gray-200'
                                                    }`}
                                            >
                                                {/* Room Header */}
                                                <div className="flex items-start justify-between mb-3">
                                                    <div>
                                                        <div className="flex items-center gap-1.5 mb-1">
                                                            <h4 className="text-lg font-bold text-gray-900">#{room.roomNumber}</h4>
                                                            {room.isAC && (
                                                                <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[8px] font-semibold">
                                                                    AC
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[10px] text-gray-400">
                                                            {room.type} • Level {room.floor}
                                                        </p>
                                                    </div>
                                                    <div className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${occupancyStatus.bg} ${occupancyStatus.color}`}>
                                                        {occupancyStatus.text}
                                                    </div>
                                                </div>

                                                {/* Occupancy Bar */}
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                                                        <span>Occupancy</span>
                                                        <span>{room.occupants?.length}/{room.capacity}</span>
                                                    </div>
                                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-indigo-500'
                                                                }`}
                                                            style={{ width: `${occupancyPercent}%` }}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Action Button */}
                                                <button
                                                    onClick={() => handleLock(room)}
                                                    disabled={isFull || (isLocked && !isMyLocked) || locking || (!!lockedRoom && !isMyLocked)}
                                                    className={`w-full py-2 rounded-lg text-xs font-medium transition-all ${isMyLocked
                                                            ? 'bg-indigo-600 text-white shadow-sm'
                                                            : isFull || isLocked
                                                                ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                                                : 'bg-gray-50 text-gray-700 hover:bg-indigo-600 hover:text-white'
                                                        }`}
                                                >
                                                    {isMyLocked ? '✓ Reserved' : isFull ? 'Full' : isLocked ? 'Locked' : 'Select Room'}
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}

                            {rooms?.length === 0 && !roomsLoading && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Bed size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No rooms available</p>
                                    <button
                                        onClick={() => setStep('hostel')}
                                        className="mt-3 text-indigo-600 text-sm font-medium"
                                    >
                                        Choose another hostel →
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmModal && lockedRoom && selectedHostel && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setShowConfirmModal(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                                <h2 className="text-xl font-semibold mb-1">Confirm Allocation</h2>
                                <p className="text-sm text-white/80">Review your selection before submitting</p>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-5">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div>
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Hostel</p>
                                        <p className="font-semibold text-gray-900">{selectedHostel.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Room</p>
                                        <p className="font-semibold text-gray-900">#{lockedRoom.roomNumber}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
                                    <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                    <p className="text-xs text-amber-700">
                                        This request will be reviewed by the warden. You'll be notified once approved.
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowConfirmModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmRequest}
                                        disabled={requesting}
                                        className="flex-1 px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                    >
                                        {requesting ? 'Submitting...' : 'Confirm Request'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Floating Action Bar for Locked Room */}
            <AnimatePresence>
                {lockedRoom && !showConfirmModal && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-0 right-0 flex justify-center px-4 z-40"
                    >
                        <div className="bg-gray-900 rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                    <Lock size={14} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400">Room Reserved</p>
                                    <p className="text-sm font-semibold text-white">#{lockedRoom.roomNumber}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-lg">
                                <Clock size={12} className="text-gray-400" />
                                <span className="text-sm font-mono font-semibold text-white">{formatTime(timeLeft)}</span>
                            </div>
                            <div className="w-px h-8 bg-gray-700" />
                            <button
                                onClick={handleUnlock}
                                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                Release
                            </button>
                            <button
                                onClick={() => setShowConfirmModal(true)}
                                className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Confirm
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RoomSelection;