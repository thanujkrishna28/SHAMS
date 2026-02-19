import React, { useState } from 'react';
import { useRooms, useCreateRoom, useDeleteRoom, useBulkCreateRooms, useUpdateRoom } from '../../hooks/useRooms';
import { Plus, Trash2, Edit2, Search, BedDouble, Users, User, LayoutGrid, List, Layers, FileSpreadsheet, CheckCircle, Info, ChevronRight, Wind, Construction, Lock, Unlock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Rooms = () => {
    const [selectedBlock, setSelectedBlock] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creationMode, setCreationMode] = useState<'single' | 'bulk'>('single');

    // Single Form State
    const [newRoom, setNewRoom] = useState({
        block: 'A',
        floor: 1,
        roomNumber: '',
        capacity: 2,
        type: 'double' as const,
        status: 'available' as const,
        isAC: false
    });

    // Bulk Form State
    const [bulkRoom, setBulkRoom] = useState({
        block: 'A',
        floor: 1,
        prefix: '',
        startRange: 1,
        endRange: 10,
        capacity: 2,
        type: 'double' as const,
        isAC: false
    });

    const { data: rooms, isLoading } = useRooms(selectedBlock === 'All' ? undefined : { block: selectedBlock });
    const createRoomMutation = useCreateRoom();
    const bulkCreateMutation = useBulkCreateRooms();
    const deleteRoomMutation = useDeleteRoom();
    const updateRoomMutation = useUpdateRoom();

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (creationMode === 'single') {
                await createRoomMutation.mutateAsync(newRoom);
                toast.success('Room created successfully');
            } else {
                const result = await bulkCreateMutation.mutateAsync(bulkRoom);
                toast.success(result.message);
                if (result.skippedCount > 0) {
                    toast(`${result.skippedCount} rooms skipped (already exist)`, { icon: '⚠️' });
                }
            }
            setIsCreateModalOpen(false);
            resetForms();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const resetForms = () => {
        setNewRoom({ block: 'A', floor: 1, roomNumber: '', capacity: 2, type: 'double', status: 'available', isAC: false });
        setBulkRoom({ block: 'A', floor: 1, prefix: '', startRange: 1, endRange: 10, capacity: 2, type: 'double', isAC: false });
    };

    const handleDeleteRoom = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoomMutation.mutateAsync(id);
                toast.success('Room deleted');
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete room');
            }
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await updateRoomMutation.mutateAsync({ id, data: { status: status as any } });
            toast.success(`Room status updated to ${status}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const filteredRooms = rooms?.filter(room =>
        room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.block.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const blocks = ['All', ...Array.from(new Set(rooms?.map(r => r.block) || []))].sort();

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Professional Header */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Layers size={120} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Room Inventory</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Manage {rooms?.length || 0} total units across {blocks.length - 1} blocks
                    </p>
                </div>
                <div className="flex items-center gap-3 relative z-10">
                    <button
                        onClick={() => { setCreationMode('bulk'); setIsCreateModalOpen(true); }}
                        className="px-5 py-2.5 bg-gray-50 text-gray-700 font-semibold rounded-2xl hover:bg-gray-100 transition-all flex items-center gap-2 border border-gray-200"
                    >
                        <FileSpreadsheet size={18} />
                        Bulk Import
                    </button>
                    <button
                        onClick={() => { setCreationMode('single'); setIsCreateModalOpen(true); }}
                        className="px-6 py-2.5 bg-slate-900 text-white font-semibold rounded-2xl shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Add Room
                    </button>
                </div>
            </div>

            {/* Segmented Filter Bar */}
            <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl overflow-x-auto no-scrollbar">
                    {blocks.map(block => (
                        <button
                            key={block}
                            onClick={() => setSelectedBlock(block)}
                            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${selectedBlock === block
                                ? 'bg-white shadow-md text-slate-900 ring-1 ring-black/5'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {block === 'All' ? 'All Blocks' : `Block ${block}`}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[240px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find room number or block..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-11 pr-4 py-2.5 bg-gray-100/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900/5 w-full outline-none transition-all"
                        />
                    </div>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-900' : 'text-gray-400'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />
                    ))}
                </div>
            ) : filteredRooms?.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Search size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No rooms match your search</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new room.</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                    <AnimatePresence mode="popLayout">
                        {filteredRooms?.map((room) => (
                            <motion.div
                                key={room._id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={`bg-white border text-left border-gray-100 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative ${viewMode === 'list' ? 'flex items-center justify-between p-4 px-6' : 'p-6 flex flex-col justify-between'}`}
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center relative ${room.status === 'available' ? 'bg-emerald-50 text-emerald-600' :
                                            room.status === 'full' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            <BedDouble size={24} />
                                            {room.isAC && (
                                                <div className="absolute -top-1 -right-1 p-1 bg-blue-500 text-white rounded-full border-2 border-white">
                                                    <Wind size={10} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-xl tracking-tight">{room.roomNumber}</h3>
                                            <p className="text-xs font-bold text-gray-400 tracking-widest uppercase">Block {room.block} • Lvl {room.floor}</p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                        <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-colors">
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRoom(room._id)}
                                            className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end mb-1">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-2">
                                                {room.occupants.map((occ: any, i) => (
                                                    <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600 ring-1 ring-slate-200/50">
                                                        {occ.name.charAt(0)}
                                                    </div>
                                                ))}
                                                {Array.from({ length: room.capacity - room.occupants.length }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-gray-200 border-dashed border-gray-200">
                                                        <User size={12} />
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Occupancy</span>
                                        </div>
                                        <span className="text-sm font-black text-slate-900">{room.occupants.length}<span className="text-gray-300">/</span>{room.capacity}</span>
                                    </div>
                                    <div className="w-full bg-gray-100/50 rounded-full h-2.5 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                                            className={`h-full rounded-full transition-all duration-1000 ${room.occupants.length >= room.capacity ? 'bg-rose-500' :
                                                room.occupants.length > 0 ? 'bg-slate-900' : 'bg-emerald-500'
                                                }`}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-2">
                                        <div className="flex items-center gap-2">
                                            <span className={room.status === 'available' ? 'text-emerald-600' :
                                                room.status === 'full' ? 'text-rose-600' :
                                                    room.status === 'maintenance' ? 'text-gray-500' : 'text-amber-600'}>
                                                {room.status}
                                            </span>
                                            {/* Status Toggle Actions */}
                                            <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleUpdateStatus(room._id, room.status === 'maintenance' ? 'available' : 'maintenance')}
                                                    className={`p-1 rounded text-xs ${room.status === 'maintenance' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-700'}`}
                                                    title={room.status === 'maintenance' ? "Set Available" : "Set Maintenance"}
                                                >
                                                    {room.status === 'maintenance' ? <CheckCircle size={10} /> : <Construction size={10} />}
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(room._id, room.status === 'locked' ? 'available' : 'locked')}
                                                    className={`p-1 rounded text-xs ${room.status === 'locked' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}
                                                    title={room.status === 'locked' ? "Unlock" : "Lock"}
                                                >
                                                    {room.status === 'locked' ? <Unlock size={10} /> : <Lock size={10} />}
                                                </button>
                                            </div>
                                        </div>
                                        <span className="text-gray-300">{room.type} Suite</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Unified Professional Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Modal Tabs */}
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setCreationMode('single')}
                                    className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${creationMode === 'single' ? 'bg-white text-slate-900' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Plus size={18} />
                                    Single Room
                                    {creationMode === 'single' && <motion.div layoutId="tab" className="absolute bottom-0 h-1 w-20 bg-slate-900 rounded-full" />}
                                </button>
                                <button
                                    onClick={() => setCreationMode('bulk')}
                                    className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${creationMode === 'bulk' ? 'bg-white text-slate-900' : 'bg-gray-50 text-gray-400 hover:text-gray-600'}`}
                                >
                                    <Layers size={18} />
                                    Bulk Import
                                    {creationMode === 'bulk' && <motion.div layoutId="tab" className="absolute bottom-0 h-1 w-20 bg-slate-900 rounded-full" />}
                                </button>
                            </div>

                            <form onSubmit={handleCreateRoom} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Common Fields */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                                            <Info size={14} /> Basic Location
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Block</label>
                                                <input
                                                    type="text"
                                                    value={creationMode === 'single' ? newRoom.block : bulkRoom.block}
                                                    onChange={e => creationMode === 'single' ? setNewRoom({ ...newRoom, block: e.target.value.toUpperCase() }) : setBulkRoom({ ...bulkRoom, block: e.target.value.toUpperCase() })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:bg-white outline-none transition-all uppercase font-bold"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Floor Level</label>
                                                <input
                                                    type="number"
                                                    value={creationMode === 'single' ? newRoom.floor : bulkRoom.floor}
                                                    onChange={e => creationMode === 'single' ? setNewRoom({ ...newRoom, floor: parseInt(e.target.value) }) : setBulkRoom({ ...bulkRoom, floor: parseInt(e.target.value) })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:bg-white outline-none transition-all font-bold"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Dynamic Mode Fields */}
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] flex items-center gap-2">
                                            <CheckCircle size={14} /> Room Configuration
                                        </h4>
                                        {creationMode === 'single' ? (
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Room Number</label>
                                                <input
                                                    type="text"
                                                    value={newRoom.roomNumber}
                                                    onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-slate-900/5 focus:bg-white outline-none transition-all font-bold"
                                                    placeholder="e.g. A-101"
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Prefix (Optional)</label>
                                                    <input
                                                        type="text"
                                                        value={bulkRoom.prefix}
                                                        onChange={e => setBulkRoom({ ...bulkRoom, prefix: e.target.value })}
                                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                                                        placeholder="e.g. RM-"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Start</label>
                                                        <input
                                                            type="number"
                                                            value={bulkRoom.startRange}
                                                            onChange={e => setBulkRoom({ ...bulkRoom, startRange: parseInt(e.target.value) })}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">End</label>
                                                        <input
                                                            type="number"
                                                            value={bulkRoom.endRange}
                                                            onChange={e => setBulkRoom({ ...bulkRoom, endRange: parseInt(e.target.value) })}
                                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Max Capacity</label>
                                        <select
                                            value={creationMode === 'single' ? newRoom.capacity : bulkRoom.capacity}
                                            onChange={e => creationMode === 'single' ? setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) }) : setBulkRoom({ ...bulkRoom, capacity: parseInt(e.target.value) })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold appearance-none"
                                        >
                                            <option value={1}>1 (Single)</option>
                                            <option value={2}>2 (Double)</option>
                                            <option value={3}>3 (Triple)</option>
                                            <option value={4}>4 (Dorm)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Room Class</label>
                                        <select
                                            value={creationMode === 'single' ? newRoom.type : bulkRoom.type}
                                            onChange={e => creationMode === 'single' ? setNewRoom({ ...newRoom, type: e.target.value as any }) : setBulkRoom({ ...bulkRoom, type: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold appearance-none"
                                        >
                                            <option value="single">Premier</option>
                                            <option value="double">Standard</option>
                                            <option value="triple">Economy</option>
                                            <option value="dorm">Social</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col justify-end">
                                        <button
                                            type="button"
                                            onClick={() => creationMode === 'single' ? setNewRoom({ ...newRoom, isAC: !newRoom.isAC }) : setBulkRoom({ ...bulkRoom, isAC: !bulkRoom.isAC })}
                                            className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all ${((creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC)) ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                        >
                                            <Wind size={18} />
                                            <span className="text-xs font-black uppercase">AC Status</span>
                                            <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${((creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC)) ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full transition-all ${(creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC) ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="px-6 py-3 text-slate-400 font-bold hover:text-slate-900 transition-colors"
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createRoomMutation.isPending || bulkCreateMutation.isPending}
                                        className="px-10 py-3 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {createRoomMutation.isPending || bulkCreateMutation.isPending ? 'Processing...' : (
                                            <>
                                                Confirm {creationMode === 'single' ? 'Addition' : 'Generation'}
                                                <ChevronRight size={18} />
                                            </>
                                        )}
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

export default Rooms;
