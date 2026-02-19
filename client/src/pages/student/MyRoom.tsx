import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useRooms } from '@/hooks/useRooms';
import { useLockRoom, useRequestAllocation, useMyAllocation } from '@/hooks/useAllocation';
import { useMyFees } from '@/hooks/useFees';
import { Room, Fee } from '@/types';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, MapPin, Wind, Monitor, CheckCircle, Clock, AlertCircle, Lock, CreditCard, ExternalLink, History, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MyRoom = () => {
    const { user, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const room: any = user?.profile?.room;

    // Allocation Logic States
    const [selectedBlock, setSelectedBlock] = useState<string>('');
    const [isAC, setIsAC] = useState<boolean | undefined>(undefined);
    const [lockedRoom, setLockedRoom] = useState<Room | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const { data: allRooms } = useRooms();
    const { data: rooms, isLoading: roomsLoading } = useRooms({
        block: selectedBlock || undefined,
        isAC
    });
    const { mutate: lockRoom, isPending: locking } = useLockRoom();
    const { mutate: requestAllocation, isPending: requesting } = useRequestAllocation();
    const { data: myAllocations } = useMyAllocation();
    const { data: fees, isLoading: feesLoading } = useMyFees();

    const getStatusStyles = (status: Fee['status']) => {
        switch (status) {
            case 'paid':
                return {
                    container: 'bg-emerald-50 border-emerald-100',
                    badge: 'bg-emerald-100 text-emerald-700',
                    icon: <CheckCircle2 className="text-emerald-500" size={24} />,
                    text: 'Paid'
                };
            case 'partially_paid':
                return {
                    container: 'bg-amber-50 border-amber-100',
                    badge: 'bg-amber-100 text-amber-700',
                    icon: <Clock className="text-amber-500" size={24} />,
                    text: 'Partial'
                };
            default:
                return {
                    container: 'bg-rose-50 border-rose-100',
                    badge: 'bg-rose-100 text-rose-700',
                    icon: <AlertCircle className="text-rose-500" size={24} />,
                    text: 'Due'
                };
        }
    };

    // Derived blocks
    const blocks = Array.from(new Set(allRooms?.map((r: any) => r.block) || [])).sort() as string[];

    useEffect(() => {
        if (!selectedBlock && blocks.length > 0) {
            setSelectedBlock(blocks[0]);
        }
    }, [blocks, selectedBlock]);

    // Timer logic
    useEffect(() => {
        if (!lockedRoom || !lockedRoom.lockExpiresAt) return;

        const expiresAt = new Date(lockedRoom.lockExpiresAt).getTime();
        const interval = setInterval(() => {
            const now = Date.now();
            const diff = Math.floor((expiresAt - now) / 1000);
            if (diff <= 0) {
                setLockedRoom(null);
                setTimeLeft(0);
                toast.error('Room lock expired!');
            } else {
                setTimeLeft(diff);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lockedRoom]);

    const handleLock = (room: Room) => {
        if (!user?.profile?.isVerified) {
            toast.error('Please verify your profile by uploading required documents first!');
            setTimeout(() => navigate('/student/profile'), 2000);
            return;
        }
        lockRoom(room._id, {
            onSuccess: (data) => {
                setLockedRoom(data);
                toast.success('Room Locked! Confirm within 10 minutes.');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to lock room');
            }
        });
    };

    const handleRequest = () => {
        if (!lockedRoom) return;
        requestAllocation({
            requestedBlock: lockedRoom.block,
            requestedRoomType: lockedRoom.type,
            lockedRoomId: lockedRoom._id,
            requestType: 'initial'
        }, {
            onSuccess: () => {
                toast.success('Allocation Request Sent Successfully!');
                setLockedRoom(null);
                fetchProfile(); // Refresh profile to see if status changed immediately (though likely pending)
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Request failed');
            }
        });
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // 1. Show Room Details if Allocated
    if (room && typeof room === 'object' && room.roomNumber) {
        // Filter out current user from roommates
        const roommates = room.occupants?.filter((occ: any) => occ._id !== user?._id) || [];

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 capitalize">Room {room.roomNumber}</h1>
                        <p className="text-gray-500">Block {room.block} • {room.type} Bed Layout</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 ${room.isAC ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>
                        <Wind size={16} />
                        {room.isAC ? 'AC Room' : 'Non-AC'}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Room Details Card */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShieldCheck className="text-primary" size={20} />
                                Room Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <MapPin className="text-indigo-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                                        <p className="font-semibold text-gray-800">Block {room.block}, Floor {room.floor}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <Users className="text-emerald-500 mt-1" size={20} />
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Occupancy</p>
                                        <p className="font-semibold text-gray-800">{room.occupants?.length} / {room.capacity} Beds</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-indigo-700">
                                <p className="text-sm font-medium">✨ Your room is currently set for standard maintenance check on Saturday.</p>
                            </div>
                        </div>
                    </div>

                    {/* Roommates Card */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Users className="text-primary" size={20} />
                                My Roommates
                            </h2>

                            <div className="space-y-4">
                                {roommates.length > 0 ? roommates.map((mate: any) => (
                                    <div key={mate._id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {mate.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 line-clamp-1">{mate.name}</p>
                                            <p className="text-xs text-gray-500">{mate.profile?.studentId || 'Student'}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-gray-400">
                                        <p className="text-sm">No roommates yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fees & Payments Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <CreditCard className="text-primary" size={24} />
                            Room Charges & Fees
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {feesLoading ? (
                                <div className="h-40 bg-gray-50 animate-pulse rounded-2xl" />
                            ) : fees?.filter(f => f.status !== 'paid').length === 0 ? (
                                <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-2xl text-center">
                                    <CheckCircle2 size={40} className="text-emerald-600 mx-auto mb-4" />
                                    <h4 className="text-lg font-bold text-emerald-900">No Pending Dues</h4>
                                    <p className="text-emerald-700">All your room and academic fees are cleared.</p>
                                </div>
                            ) : (
                                fees?.filter(f => f.status !== 'paid').map((fee) => {
                                    const styles = getStatusStyles(fee.status);
                                    return (
                                        <div key={fee._id} className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow group">
                                            <div className="flex flex-col sm:flex-row justify-between gap-6">
                                                <div className="flex gap-4">
                                                    <div className={`p-4 rounded-2xl h-fit hidden sm:block ${styles.container}`}>
                                                        {styles.icon}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            <h4 className="font-bold text-gray-900 text-lg">{fee.title}</h4>
                                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles.badge}`}>
                                                                {styles.text}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-500">{fee.description || `Applicable for room ${room.roomNumber}`}</p>
                                                        <div className="flex items-center gap-4 mt-2">
                                                            <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                                <Clock size={12} /> Due: {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                                    <div className="text-left sm:text-right">
                                                        <div className="text-xl sm:text-2xl font-black text-gray-900 font-mono">₹{(fee.amount - fee.amountPaid).toLocaleString()}</div>
                                                        {fee.amountPaid > 0 && <div className="text-[10px] text-emerald-600 font-medium">Paid: ₹{fee.amountPaid.toLocaleString()}</div>}
                                                    </div>
                                                    <a
                                                        href={fee.paymentLink || "#"}
                                                        target="_blank"
                                                        className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-indigo-600 transition-all font-bold text-sm"
                                                    >
                                                        Pay Now
                                                        <ExternalLink size={14} />
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Recent Activity Mini-Widget */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wider">
                                <History size={16} className="text-indigo-500" />
                                Payment History
                            </h3>
                            <div className="space-y-4">
                                {fees?.flatMap(f => f.transactionHistory).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3).map((tx, idx) => (
                                    <div key={idx} className="flex justify-between items-center pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">₹{tx.amount.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-400 uppercase font-black">{tx.paymentMethod}</p>
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-500">{format(new Date(tx.date), 'MMM dd')}</p>
                                    </div>
                                ))}
                                {fees?.flatMap(f => f.transactionHistory).length === 0 && (
                                    <p className="text-xs text-gray-400 text-center py-4 italic">No history yet</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. Show Pending Status if applicable
    const pendingOrApproved = myAllocations?.find((a: any) => a.status === 'pending' || a.status === 'approved');

    if (pendingOrApproved) {
        return (
            <div className="max-w-4xl mx-auto space-y-6 mt-10 animate-in fade-in duration-500">
                <h1 className="text-2xl font-bold text-gray-900">Allocation Status</h1>
                <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm text-center space-y-6">
                    <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${pendingOrApproved.status === 'approved' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {pendingOrApproved.status === 'approved' ? <CheckCircle size={40} /> : <Clock size={40} />}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold capitalize text-gray-900 mb-2">{pendingOrApproved.status === 'approved' ? 'Approved Allocation' : 'Allocation Pending'}</h2>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {pendingOrApproved.status === 'approved'
                                ? "Your room has been approved! If you don't see it yet, please refresh."
                                : `You have requested a room in Block ${pendingOrApproved.requestedBlock} (${pendingOrApproved.requestedRoomType}). Please wait for admin approval.`}
                        </p>
                    </div>
                    {pendingOrApproved.status === 'approved' && (
                        <button
                            onClick={() => fetchProfile()}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-medium shadow-lg hover:bg-indigo-700 transition-all"
                        >
                            Refresh My Room
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // 3. Show Room Selection (Allocation) UI
    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Select Your Room</h1>
                    <p className="text-gray-500">Choose a block and room to request allocation.</p>
                </div>

                {lockedRoom && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-xl flex items-center gap-4"
                    >
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">Locked Room</span>
                            <span className="font-semibold text-gray-900">{lockedRoom.block}-{lockedRoom.roomNumber}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-primary/20"></div>
                        <div className="flex items-center gap-2 text-primary font-mono text-xl font-bold">
                            <Clock size={20} />
                            {formatTime(timeLeft)}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex gap-2 p-1 bg-gray-100/50 rounded-xl overflow-x-auto max-w-full">
                    {blocks.length > 0 ? blocks.map(block => (
                        <button
                            key={block}
                            onClick={() => setSelectedBlock(block)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${selectedBlock === block ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Block {block}
                        </button>
                    )) : (
                        <span className="px-4 py-2 text-sm text-gray-400">No blocks found</span>
                    )}
                </div>

                <div className="h-8 w-[1px] bg-gray-200 hidden md:block"></div>

                <button
                    onClick={() => setIsAC(isAC === true ? undefined : true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${isAC ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                    <Wind size={16} className={isAC ? 'animate-spin-slow' : ''} />
                    {isAC ? 'AC Only' : 'All Rooms'}
                    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${isAC ? 'bg-blue-500' : 'bg-gray-300'}`}>
                        <div className={`w-3 h-3 rounded-full bg-white transition-transform ${isAC ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                </button>
            </div>

            {/* Rooms Grid */}
            {roomsLoading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {rooms?.map((room: any) => {
                        const isFull = room.status === 'full';
                        const isLocked = room.status === 'locked';
                        const isMyLocked = lockedRoom?._id === room._id;
                        const occupancy = room.occupancyPercentage || 0;

                        return (
                            <motion.div
                                key={room._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`relative group bg-white rounded-2xl border transition-all ${isMyLocked ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-gray-100 hover:border-primary/50 hover:shadow-md'}`}
                            >
                                <div className="p-5 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-xl font-bold text-gray-900">{room.roomNumber}</h3>
                                                {room.isAC && <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full">AC</span>}
                                            </div>
                                            <p className="text-sm text-gray-500">{room.type} Bed • Floor {room.floor}</p>
                                        </div>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isFull ? 'bg-red-100 text-red-600' : isLocked ? 'bg-amber-100 text-amber-600' : 'bg-green-100 text-green-600'}`}>
                                            {isFull ? <AlertCircle size={16} /> : isLocked ? <Lock size={16} /> : <CheckCircle size={16} />}
                                        </div>
                                    </div>

                                    {/* Occupancy Bar */}
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                                            <span>Occupancy</span>
                                            <span>{room.occupants?.length || 0}/{room.capacity}</span>
                                        </div>
                                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${occupancy >= 100 ? 'bg-red-500' : occupancy > 50 ? 'bg-amber-500' : 'bg-green-500'}`}
                                                style={{ width: `${occupancy}%` }}
                                            />
                                        </div>
                                    </div>

                                    {!isFull && (!isLocked || isMyLocked) && (
                                        <button
                                            onClick={() => isMyLocked ? handleRequest() : handleLock(room)}
                                            disabled={locking || requesting || (!!lockedRoom && !isMyLocked)}
                                            className={`w-full py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${isMyLocked
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-hover'
                                                : !!lockedRoom
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border-2 border-primary text-primary hover:bg-primary/5'
                                                }`}
                                        >
                                            {requesting ? 'Confirming...' : isMyLocked ? (
                                                <>Confirm Allocation <CheckCircle size={16} /></>
                                            ) : (
                                                <>Lock Room <Lock size={16} /></>
                                            )}
                                        </button>
                                    )}

                                    {isLocked && !isMyLocked && (
                                        <div className="w-full py-2.5 bg-gray-50 text-gray-400 text-sm font-medium rounded-xl text-center border dashed border-gray-200">
                                            Locked by another student
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {!roomsLoading && rooms?.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Monitor size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">No available rooms found</h3>
                    <p className="text-gray-500">Try changing your filters.</p>
                </div>
            )}
        </div>
    );
};

export default MyRoom;
