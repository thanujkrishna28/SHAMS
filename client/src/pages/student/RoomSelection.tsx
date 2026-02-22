import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    Layers,
    Home,
    CheckCircle2,
    Clock,
    X,
    AlertCircle,
    ChevronRight,
    User
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useHostels, useBlocks } from '@/hooks/useHostels';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';

const RoomSelection = () => {
    const { user } = useAuthStore();
    const { data: hostels } = useHostels();

    const [selectedHostel, setSelectedHostel] = useState<any>(null);
    const [selectedBlock, setSelectedBlock] = useState<any>(null);
    const [selectedRoom, setSelectedRoom] = useState<any>(null);
    const [step, setStep] = useState(1); // 1: Hostel, 2: Block, 3: Room, 4: Confirm

    const { data: blocks } = useBlocks(selectedHostel?._id);

    const { data: rooms } = useQuery({
        queryKey: ['rooms', selectedBlock?._id],
        queryFn: async () => {
            if (!selectedBlock) return [];
            const { data } = await api.get('/rooms', { params: { blockId: selectedBlock._id } });
            return data;
        },
        enabled: !!selectedBlock
    });

    // Filter hostels by gender
    const filteredHostels = hostels?.filter((h: any) => {
        const userGender = user?.profile?.gender || 'Male';
        const expectedType = userGender === 'Male' ? 'BOYS' : 'GIRLS';
        return h.type === expectedType && h.isActive;
    });

    const handleRequestAllocation = async () => {
        try {
            await api.post('/allocations', {
                hostel: selectedHostel._id,
                block: selectedBlock._id,
                room: selectedRoom._id,
                reason: 'Initial Room Allocation'
            });
            toast.success('Allocation request submitted successfully!');
            setStep(5); // Success step
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Building2 className="text-secondary" />
                                Select Your Hostel
                            </h2>
                            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-bold">
                                <User size={14} />
                                {user?.profile?.gender || 'Male'} Only
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredHostels?.map((hostel: any) => (
                                <motion.div
                                    key={hostel._id}
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    onClick={() => { setSelectedHostel(hostel); setStep(2); }}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-secondary/30 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-4 rounded-xl ${hostel.type === 'BOYS' ? 'bg-blue-50 text-blue-600' : 'bg-rose-50 text-rose-600'} group-hover:scale-110 transition-transform`}>
                                            <Building2 size={32} />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Warden</p>
                                            <p className="text-sm font-semibold text-gray-900">{hostel.wardenName}</p>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{hostel.name}</h3>
                                    <p className="text-sm text-gray-500 mb-6 line-clamp-2">{hostel.description}</p>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                <Layers size={14} />
                                                {hostel.blockCount} Blocks
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                <Home size={14} />
                                                {hostel.roomCount} Rooms
                                            </div>
                                        </div>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </motion.div>
                            ))}
                            {filteredHostels?.length === 0 && (
                                <div className="col-span-full py-12 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-lg font-bold text-gray-900">No Hostels Available</h3>
                                    <p className="text-sm text-gray-500">There are currently no active hostels for your gender.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Layers className="text-secondary" />
                                Choose Block in {selectedHostel?.name}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {blocks?.map((block: any) => (
                                <motion.div
                                    key={block._id}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => { setSelectedBlock(block); setStep(3); }}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer relative overflow-hidden group"
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-colors"></div>
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black text-gray-900 mb-1">{block.name}</h3>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">{block.floors} Floors Total</p>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Total Rooms</span>
                                                <span className="font-bold text-gray-900">{block.roomCount}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500">Available</span>
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                                                    {block.availableRooms} FREE
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                );

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setStep(2)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                <X size={20} />
                            </button>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Home className="text-secondary" />
                                Select Room in {selectedBlock?.name}
                            </h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {rooms?.map((room: any) => {
                                const isFull = room.occupants.length >= room.capacity;
                                const isMaintenance = room.status === 'Maintenance' || room.status === 'maintenance';
                                const isDisabled = isFull || isMaintenance;

                                return (
                                    <motion.div
                                        key={room._id}
                                        whileHover={!isDisabled ? { scale: 1.05, y: -2 } : {}}
                                        onClick={() => { if (!isDisabled) { setSelectedRoom(room); setStep(4); } }}
                                        className={`
                                            p-4 rounded-xl border-2 transition-all cursor-pointer relative
                                            ${isDisabled ? 'bg-gray-50 border-gray-100 grayscale' : 'bg-white border-gray-100 hover:border-secondary hover:shadow-md shadow-sm'}
                                        `}
                                    >
                                        <div className="text-center">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter mb-1">Room</p>
                                            <h4 className="text-xl font-black text-gray-900 mb-2">{room.roomNumber}</h4>

                                            <div className="flex justify-center gap-1 mb-2">
                                                {Array.from({ length: room.capacity }).map((_, i) => (
                                                    <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < room.occupants.length ? 'bg-indigo-500' : 'bg-gray-200'}`}></div>
                                                ))}
                                            </div>

                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${isMaintenance ? 'bg-amber-100 text-amber-600' : isFull ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {isMaintenance ? 'Maint' : isFull ? 'Full' : 'Select'}
                                            </span>
                                        </div>
                                        <div className="absolute top-1 right-1">
                                            <p className="text-[8px] font-bold text-gray-300">{room.type}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="max-w-2xl mx-auto py-8">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                            <div className="p-8 bg-gradient-to-br from-secondary to-indigo-700 text-white relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Building2 size={120} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Confirmation Details</h3>
                                <p className="text-indigo-100 text-sm">Review your room selection before submitting</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-8 font-sans">
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Selected Hostel</p>
                                            <p className="font-bold text-gray-900 text-lg">{selectedHostel?.name}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Block & Floor</p>
                                            <p className="font-bold text-gray-900 text-lg">{selectedBlock?.name} • Floor {selectedRoom?.floor}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Room Number</p>
                                            <p className="font-bold text-secondary text-2xl">#{selectedRoom?.roomNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Room Category</p>
                                            <p className="font-bold text-gray-900 text-lg">{selectedRoom?.type} Occupancy</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3 text-amber-700 text-sm">
                                    <AlertCircle className="shrink-0" size={20} />
                                    <p>Your request will be reviewed by the administration. You will be notified once it is approved.</p>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        onClick={() => setStep(3)}
                                        className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                                    >
                                        Change Room
                                    </button>
                                    <button
                                        onClick={handleRequestAllocation}
                                        className="flex-[2] py-4 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary-hover transition-all shadow-xl shadow-secondary/20"
                                    >
                                        Submit Allocation Request
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-md mx-auto py-12 text-center"
                    >
                        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-100">
                            <CheckCircle2 size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">Request Submitted!</h2>
                        <p className="text-gray-500 mb-8 px-8">Your allocation request is pending approval. You can track the status in the Dashboard.</p>

                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-left space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Request ID</span>
                                <span className="font-mono font-bold text-gray-900 text-xs">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Status</span>
                                <span className="flex items-center gap-1.5 text-amber-500 font-bold">
                                    <Clock size={14} />
                                    PENDING APPROVAL
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={() => window.location.href = '/student/dashboard'}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all"
                        >
                            Go to Dashboard
                        </button>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Allocate Your Room</h1>
                <p className="text-gray-500 font-medium">Follow the simple steps to choose your residence</p>

                {/* Stepper */}
                <div className="flex items-center gap-4 mt-8">
                    {[1, 2, 3, 4].map(s => (
                        <div key={s} className="flex items-center gap-4">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                                ${step === s ? 'bg-secondary text-white shadow-lg shadow-secondary/30 scale-110' : step > s ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}
                            `}>
                                {step > s ? <CheckCircle2 size={16} /> : s}
                            </div>
                            {s < 4 && <div className={`w-8 h-[2px] rounded-full transition-all ${step > s ? 'bg-emerald-500' : 'bg-gray-100'}`}></div>}
                        </div>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default RoomSelection;
