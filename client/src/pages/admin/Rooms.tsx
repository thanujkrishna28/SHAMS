import React, { useState } from 'react';
import { useRooms, useCreateRoom, useDeleteRoom, useBulkCreateRooms, useSmartBatchCreateRooms } from '../../hooks/useRooms';
import { useHostels, useBlocks } from '../../hooks/useHostels';
import {
    Plus,
    Trash2,
    Search,
    BedDouble,
    User,
    LayoutGrid,
    List,
    Layers,
    FileSpreadsheet,
    Wind,
    Building2,
    X,
    Construction,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getImageUrl } from '../../utils/imageUtils';

const Rooms = () => {
    const [selectedHostel, setSelectedHostel] = useState<string>('All');
    const [selectedBlock, setSelectedBlock] = useState<string>('All');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [creationMode, setCreationMode] = useState<'single' | 'bulk' | 'smart'>('single');
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');

    const { data: hostels } = useHostels();
    const { data: blocks } = useBlocks(selectedHostel === 'All' ? undefined : selectedHostel);

    // Initial state for forms
    const initialSingleRoom = {
        hostel: '',
        block: '',
        floor: 1,
        roomNumber: '',
        capacity: 2,
        type: 'double',
        status: 'Available',
        isAC: false
    };

    const initialBulkRoom = {
        hostel: '',
        block: '',
        floor: 1,
        prefix: '',
        startRange: 1,
        endRange: 10,
        capacity: 2,
        type: 'double',
        isAC: false
    };

    const [newRoom, setNewRoom] = useState<any>(initialSingleRoom);
    const [bulkRoom, setBulkRoom] = useState<any>(initialBulkRoom);
    const [smartBatch, setSmartBatch] = useState<any>({
        hostel: '',
        block: '',
        startFloor: 1,
        endFloor: 4,
        roomsPerFloor: 6,
        capacity: 3,
        rooms: []
    });

    // Blocks for the specific hostel selected in the form
    const { data: formBlocks } = useBlocks(
        creationMode === 'single' ? newRoom.hostel :
            creationMode === 'bulk' ? bulkRoom.hostel :
                smartBatch.hostel
    );

    const { data: rooms, isLoading } = useRooms({
        hostelId: selectedHostel === 'All' ? undefined : selectedHostel,
        blockId: selectedBlock === 'All' ? undefined : selectedBlock
    });

    const createRoomMutation = useCreateRoom();
    const bulkCreateMutation = useBulkCreateRooms();
    const smartBatchMutation = useSmartBatchCreateRooms();
    const deleteRoomMutation = useDeleteRoom();

    const generateSmartPreview = () => {
        if (!smartBatch.hostel || !smartBatch.block) {
            toast.error('Select Hostel and Block first');
            return;
        }
        const generated = [];
        for (let f = smartBatch.startFloor; f <= smartBatch.endFloor; f++) {
            for (let r = 1; r <= smartBatch.roomsPerFloor; r++) {
                const roomNumber = `${f}${r.toString().padStart(2, '0')}`;
                generated.push({
                    hostel: smartBatch.hostel,
                    block: smartBatch.block,
                    floor: f,
                    roomNumber,
                    capacity: smartBatch.capacity,
                    type: smartBatch.capacity === 1 ? 'single' : smartBatch.capacity === 2 ? 'double' : smartBatch.capacity === 3 ? 'triple' : 'dorm',
                    isAC: false,
                    status: 'Available'
                });
            }
        }
        setSmartBatch({ ...smartBatch, rooms: generated });
        toast.success(`Generated ${generated.length} room previews`);
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (creationMode === 'single') {
                await createRoomMutation.mutateAsync(newRoom);
                toast.success('Room created successfully');
            } else if (creationMode === 'bulk') {
                const result = await bulkCreateMutation.mutateAsync(bulkRoom);
                toast.success(result.message);
                if (result.skippedCount > 0) {
                    toast(`${result.skippedCount} rooms skipped (already exist)`, { icon: '⚠️' });
                }
            } else {
                if (smartBatch.rooms.length === 0) {
                    toast.error('No rooms to create. Generate preview first.');
                    return;
                }
                const result = await smartBatchMutation.mutateAsync(smartBatch.rooms);
                toast.success(result.message);
            }
            setIsCreateModalOpen(false);
            resetForms();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const resetForms = () => {
        setNewRoom(initialSingleRoom);
        setBulkRoom(initialBulkRoom);
        setSmartBatch({ ...smartBatch, rooms: [] });
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


    const filteredRooms = rooms?.filter((room: any) =>
        (room.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.block as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (room.hostel as any)?.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
        (filterStatus === 'ALL' || room.status.toLowerCase() === filterStatus.toLowerCase()) &&
        (filterType === 'ALL' || room.type.toLowerCase() === filterType.toLowerCase())
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
            {/* Professional Header */}
            <div className="bg-slate-900 px-8 py-10 rounded-[40px] shadow-2xl shadow-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <h1 className="text-4xl font-black text-white tracking-tight">System Inventory</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-secondary-hover">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Units: {rooms?.length || 0}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-indigo-300">
                            Hostels: {hostels?.length || 0}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <button
                        onClick={() => { setCreationMode('bulk'); setIsCreateModalOpen(true); }}
                        className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-widest rounded-2xl transition-all flex items-center gap-2 border border-white/10"
                    >
                        <FileSpreadsheet size={18} />
                        Bulk Operations
                    </button>
                    <button
                        onClick={() => { setCreationMode('single'); setIsCreateModalOpen(true); }}
                        className="px-8 py-3 bg-secondary text-white font-black text-[11px] uppercase tracking-widest rounded-2xl shadow-xl shadow-secondary/20 hover:bg-secondary-hover transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus size={20} />
                        Deploy Room
                    </button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <Building2 size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Building</span>
                            <select
                                className="bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 outline-none cursor-pointer"
                                value={selectedHostel}
                                onChange={(e) => { setSelectedHostel(e.target.value); setSelectedBlock('All'); }}
                            >
                                <option value="All">Global Campus</option>
                                {hostels?.map((h: any) => (
                                    <option key={h._id} value={h._id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <Layers size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Block Unit</span>
                            <select
                                className="bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 outline-none cursor-pointer"
                                value={selectedBlock}
                                onChange={(e) => setSelectedBlock(e.target.value)}
                                disabled={selectedHostel === 'All'}
                            >
                                <option value="All">All Units</option>
                                {blocks?.map((b: any) => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-gray-100 hidden lg:block" />

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                            <Filter size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Availability</span>
                            <select
                                className="bg-transparent border-none p-0 text-sm font-black text-slate-900 focus:ring-0 outline-none cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="FULL">Fully Occupied</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="relative flex-1 min-w-[280px]">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Identify room unit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 pr-6 py-3.5 bg-gray-50/50 border border-transparent rounded-[20px] text-sm font-bold focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-slate-900/5 w-full outline-none transition-all shadow-inner"
                        />
                    </div>
                    <div className="flex bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-md text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-slate-900' : 'text-gray-400 hover:text-slate-600'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
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
                    <h3 className="text-xl font-bold text-gray-900">No rooms found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or creating a new room.</p>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
                    <AnimatePresence mode="popLayout">
                        {filteredRooms?.map((room: any) => (
                            <motion.div
                                key={room._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -4 }}
                                className={`bg-white border text-left border-gray-100 rounded-[32px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group relative ${viewMode === 'list' ? 'flex items-center justify-between p-6' : 'p-8 flex flex-col justify-between'}`}
                            >
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center relative transition-transform group-hover:scale-110 duration-500 ${room.status.toLowerCase() === 'available' ? 'bg-emerald-50 text-emerald-600' :
                                            room.status.toLowerCase() === 'full' ? 'bg-rose-50 text-rose-600' :
                                                'bg-amber-50 text-amber-600'
                                            }`}>
                                            <BedDouble size={28} />
                                            {room.isAC && (
                                                <div className="absolute -top-1.5 -right-1.5 p-1.5 bg-secondary text-white rounded-full border-2 border-white shadow-sm">
                                                    <Wind size={12} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 text-2xl tracking-tight">{room.roomNumber}</h3>
                                            <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase truncate max-w-[150px] mt-0.5">
                                                {(room.hostel as any)?.name} • {(room.block as any)?.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                                        <button
                                            onClick={() => handleDeleteRoom(room._id)}
                                            className="w-10 h-10 flex items-center justify-center bg-rose-50 rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                                            title="Permanently remove unit"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-2">
                                            <div className="flex -space-x-3">
                                                {room.occupants.map((occ: any, i: number) => (
                                                    <div key={i} className="w-10 h-10 rounded-xl border-4 border-white bg-slate-100 flex items-center justify-center text-xs font-black text-slate-600 ring-1 ring-slate-100 shadow-sm overflow-hidden" title={occ.name}>
                                                        {occ.profile?.profileImage ? (
                                                            <img src={getImageUrl(occ.profile.profileImage, occ.name)} alt={occ.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{occ.name.charAt(0)}</span>
                                                        )}
                                                    </div>
                                                ))}
                                                {Array.from({ length: room.capacity - room.occupants.length }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="w-10 h-10 rounded-xl border-4 border-white bg-gray-50 flex items-center justify-center text-gray-200 border-dashed border-gray-200 shadow-sm">
                                                        <User size={16} />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Density</p>
                                            <span className="text-lg font-black text-slate-900">{room.occupants.length}<span className="text-gray-300 mx-0.5">/</span>{room.capacity}</span>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(room.occupants.length / room.capacity) * 100}%` }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                                className={`h-full rounded-full ${room.occupants.length >= room.capacity ? 'bg-rose-500' :
                                                    room.occupants.length > 0 ? 'bg-slate-900' : 'bg-emerald-500'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest pt-2">
                                        <span className={`px-3 py-1 rounded-lg border ${room.status.toLowerCase() === 'available' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                            {room.status}
                                        </span>
                                        <span className="bg-gray-50 px-3 py-1 rounded-lg text-gray-400 border border-gray-100">{room.type}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="flex border-b border-gray-100 bg-gray-50/50">
                                <button
                                    onClick={() => setCreationMode('single')}
                                    className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${creationMode === 'single' ? 'bg-white text-slate-900 border-b-2 border-slate-900' : 'text-gray-400'}`}
                                >
                                    <Plus size={18} /> Single
                                </button>
                                <button
                                    onClick={() => setCreationMode('smart')}
                                    className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${creationMode === 'smart' ? 'bg-white text-slate-900 border-b-2 border-slate-900' : 'text-gray-400'}`}
                                >
                                    <Construction size={18} /> Smart Setup
                                </button>
                                <button
                                    onClick={() => setCreationMode('bulk')}
                                    className={`flex-1 py-5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${creationMode === 'bulk' ? 'bg-white text-slate-900 border-b-2 border-slate-900' : 'text-gray-400'}`}
                                >
                                    <Layers size={18} /> Legacy Bulk
                                </button>
                                <button onClick={() => setIsCreateModalOpen(false)} className="px-6 text-gray-400 hover:text-gray-600"><X /></button>
                            </div>

                            <form onSubmit={handleCreateRoom} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Hostel</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold"
                                            value={creationMode === 'single' ? newRoom.hostel : creationMode === 'bulk' ? bulkRoom.hostel : smartBatch.hostel}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (creationMode === 'single') setNewRoom({ ...newRoom, hostel: val, block: '' });
                                                else if (creationMode === 'bulk') setBulkRoom({ ...bulkRoom, hostel: val, block: '' });
                                                else setSmartBatch({ ...smartBatch, hostel: val, block: '', rooms: [] });
                                            }}
                                            required
                                        >
                                            <option value="">Select Hostel</option>
                                            {hostels?.map((h: any) => (
                                                <option key={h._id} value={h._id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Block</label>
                                        <select
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold"
                                            value={creationMode === 'single' ? newRoom.block : creationMode === 'bulk' ? bulkRoom.block : smartBatch.block}
                                            onChange={e => {
                                                const val = e.target.value;
                                                if (creationMode === 'single') setNewRoom({ ...newRoom, block: val });
                                                else if (creationMode === 'bulk') setBulkRoom({ ...bulkRoom, block: val });
                                                else setSmartBatch({ ...smartBatch, block: val, rooms: [] });
                                            }}
                                            required
                                            disabled={!(creationMode === 'single' ? newRoom.hostel : creationMode === 'bulk' ? bulkRoom.hostel : smartBatch.hostel)}
                                        >
                                            <option value="">Select Block</option>
                                            {formBlocks?.map((b: any) => (
                                                <option key={b._id} value={b._id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {creationMode === 'single' ? (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Room Number</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold"
                                                value={newRoom.roomNumber}
                                                onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Floor</label>
                                            <input
                                                type="number"
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold"
                                                value={newRoom.floor}
                                                onChange={e => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Capacity</label>
                                            <select
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold"
                                                value={newRoom.capacity}
                                                onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                                            >
                                                <option value={1}>1 Person</option>
                                                <option value={2}>2 Persons</option>
                                                <option value={3}>3 Persons</option>
                                                <option value={4}>4 Persons</option>
                                                <option value={5}>5 Persons</option>
                                            </select>
                                        </div>
                                    </div>
                                ) : creationMode === 'smart' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Floor Range</label>
                                                <div className="flex items-center gap-2">
                                                    <input type="number" min={1} max={8} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold" value={smartBatch.startFloor || ''} onChange={e => setSmartBatch({ ...smartBatch, startFloor: parseInt(e.target.value) || 0 })} />
                                                    <span className="text-gray-400">to</span>
                                                    <input type="number" min={1} max={8} className="w-full px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg outline-none text-sm font-bold" value={smartBatch.endFloor || ''} onChange={e => setSmartBatch({ ...smartBatch, endFloor: parseInt(e.target.value) || 0 })} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rooms / Floor</label>
                                                <input type="number" className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold" value={smartBatch.roomsPerFloor || ''} onChange={e => setSmartBatch({ ...smartBatch, roomsPerFloor: parseInt(e.target.value) || 0 })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Max Size</label>
                                                <select className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none font-bold" value={smartBatch.capacity} onChange={e => setSmartBatch({ ...smartBatch, capacity: parseInt(e.target.value) })}>
                                                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Persons</option>)}
                                                </select>
                                            </div>
                                            <div className="pt-6">
                                                <button type="button" onClick={generateSmartPreview} className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">Generate</button>
                                            </div>
                                        </div>

                                        {smartBatch.rooms.length > 0 && (
                                            <div className="bg-gray-50 rounded-2xl p-4 max-h-[300px] overflow-y-auto border border-gray-100">
                                                <div className="grid grid-cols-3 gap-3">
                                                    {smartBatch.rooms.map((room: any, idx: number) => (
                                                        <div key={idx} className="bg-white p-3 rounded-xl border border-gray-100 flex items-center justify-between shadow-sm">
                                                            <div className="flex flex-col">
                                                                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">Room {room.roomNumber}</span>
                                                                <span className="text-[9px] font-bold text-indigo-600">Floor {room.floor}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const updated = [...smartBatch.rooms];
                                                                    updated[idx].isAC = !updated[idx].isAC;
                                                                    setSmartBatch({ ...smartBatch, rooms: updated });
                                                                }}
                                                                className={`p-2 rounded-lg transition-all ${room.isAC ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                                                                title="Toggle AC"
                                                            >
                                                                <Wind size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-4 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Prefix</label>
                                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" value={bulkRoom.prefix} onChange={e => setBulkRoom({ ...bulkRoom, prefix: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Start</label>
                                                <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" value={bulkRoom.startRange} onChange={e => setBulkRoom({ ...bulkRoom, startRange: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">End</label>
                                                <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" value={bulkRoom.endRange} onChange={e => setBulkRoom({ ...bulkRoom, endRange: parseInt(e.target.value) })} />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Floor</label>
                                                <input type="number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none" value={bulkRoom.floor} onChange={e => setBulkRoom({ ...bulkRoom, floor: parseInt(e.target.value) })} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {creationMode !== 'smart' && (
                                    <div className="flex items-center gap-4">
                                        <button
                                            type="button"
                                            onClick={() => creationMode === 'single' ? setNewRoom({ ...newRoom, isAC: !newRoom.isAC }) : setBulkRoom({ ...bulkRoom, isAC: !bulkRoom.isAC })}
                                            className={`flex-1 py-3 px-4 rounded-xl border-2 flex items-center justify-between transition-all ${((creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC)) ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Wind size={18} />
                                                <span className="text-xs font-bold uppercase tracking-widest">Air Conditioned</span>
                                            </div>
                                            <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${((creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC)) ? 'bg-blue-500' : 'bg-gray-300'}`}>
                                                <div className={`w-3 h-3 bg-white rounded-full transition-all ${(creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC) ? 'translate-x-4' : ''}`} />
                                            </div>
                                        </button>
                                    </div>
                                )}

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 py-3 font-bold text-gray-400">Cancel</button>
                                    <button type="submit" className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">
                                        Confirm {creationMode === 'single' ? 'Addition' : 'Import'}
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
