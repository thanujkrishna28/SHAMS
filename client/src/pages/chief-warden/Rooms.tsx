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
    Filter,
    Users,
    Home,
    CheckCircle,
    MonitorPlay
} from 'lucide-react';
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
    const [filterType] = useState('ALL');

    const { data: hostels } = useHostels();
    const { data: blocks } = useBlocks(selectedHostel === 'All' ? undefined : selectedHostel);

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

    const totalRooms = rooms?.length || 0;
    const availableRooms = rooms?.filter(r => r.status.toLowerCase() === 'available').length || 0;
    const occupiedRooms = rooms?.filter(r => r.status.toLowerCase() === 'full' || r.status.toLowerCase() === 'occupied').length || 0;
    const occupancyRate = totalRooms ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage rooms, occupancy, and allocations</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { setCreationMode('bulk'); setIsCreateModalOpen(true); }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FileSpreadsheet size={16} />
                            Bulk Import
                        </button>
                        <button
                            onClick={() => { setCreationMode('single'); setIsCreateModalOpen(true); }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus size={16} />
                            Add Room
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Home size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Rooms</p>
                            <p className="text-xl font-bold text-gray-900">{totalRooms}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Available</p>
                            <p className="text-xl font-bold text-gray-900">{availableRooms}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Users size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Occupied</p>
                            <p className="text-xl font-bold text-gray-900">{occupiedRooms}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <MonitorPlay size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Occupancy Rate</p>
                            <p className="text-xl font-bold text-gray-900">{occupancyRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={selectedHostel}
                                onChange={(e) => { setSelectedHostel(e.target.value); setSelectedBlock('All'); }}
                            >
                                <option value="All">All Hostels</option>
                                {hostels?.map((h: any) => (
                                    <option key={h._id} value={h._id}>{h.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Layers size={16} className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                                value={selectedBlock}
                                onChange={(e) => setSelectedBlock(e.target.value)}
                                disabled={selectedHostel === 'All'}
                            >
                                <option value="All">All Blocks</option>
                                {blocks?.map((b: any) => (
                                    <option key={b._id} value={b._id}>{b.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400" />
                            <select
                                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="ALL">All Status</option>
                                <option value="AVAILABLE">Available</option>
                                <option value="FULL">Occupied</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search rooms..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <LayoutGrid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Room List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                                    <div>
                                        <div className="h-5 bg-gray-200 rounded w-20 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-24" />
                                    </div>
                                </div>
                                <div className="w-8 h-8 bg-gray-200 rounded-lg" />
                            </div>
                            <div className="h-2 bg-gray-200 rounded w-full mb-3" />
                            <div className="flex justify-between">
                                <div className="h-6 bg-gray-200 rounded w-20" />
                                <div className="h-6 bg-gray-200 rounded w-16" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredRooms?.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <Search size={48} className="text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No rooms found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or add a new room</p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedHostel('All');
                            setSelectedBlock('All');
                            setFilterStatus('ALL');
                        }}
                        className="mt-4 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                        Clear filters
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredRooms?.map((room: any) => (
                        <div key={room._id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-3 rounded-lg ${room.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                        <BedDouble size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">{room.roomNumber}</h3>
                                        <p className="text-xs text-gray-500">
                                            {(room.hostel as any)?.name} • {(room.block as any)?.name}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteRoom(room._id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="mb-3">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Occupancy</span>
                                    <span>{room.occupants?.length || 0}/{room.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all ${(room.occupants?.length || 0) >= room.capacity ? 'bg-blue-600' : 'bg-green-600'}`}
                                        style={{ width: `${((room.occupants?.length || 0) / room.capacity) * 100}%` }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${room.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {room.status}
                                    </span>
                                    {room.isAC && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Wind size={12} />
                                            AC
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 capitalize">{room.type}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredRooms?.map((room: any) => (
                        <div key={room._id} className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-2 rounded-lg ${room.status.toLowerCase() === 'available' ? 'bg-green-100' : 'bg-blue-100'}`}>
                                    <BedDouble size={18} className={room.status.toLowerCase() === 'available' ? 'text-green-600' : 'text-blue-600'} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-medium text-gray-900">{room.roomNumber}</h3>
                                        {room.isAC && <Wind size={12} className="text-gray-400" />}
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        {(room.hostel as any)?.name} • {(room.block as any)?.name} • Floor {room.floor}
                                    </p>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Capacity</p>
                                        <p className="font-medium text-gray-900">{room.capacity}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500">Occupied</p>
                                        <p className="font-medium text-gray-900">{room.occupants?.length || 0}</p>
                                    </div>
                                    <span className={`px-2 py-1 text-xs font-medium rounded ${room.status.toLowerCase() === 'available' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {room.status}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteRoom(room._id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl">
                        <div className="flex border-b border-gray-200">
                            <button
                                onClick={() => setCreationMode('single')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${creationMode === 'single' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Single Room
                            </button>
                            <button
                                onClick={() => setCreationMode('smart')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${creationMode === 'smart' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Smart Setup
                            </button>
                            <button
                                onClick={() => setCreationMode('bulk')}
                                className={`flex-1 py-3 text-sm font-medium transition-colors ${creationMode === 'bulk' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Bulk Create
                            </button>
                            <button onClick={() => setIsCreateModalOpen(false)} className="px-4 text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateRoom} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Hostel</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Block</label>
                                    <select
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
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
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Room Number</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newRoom.roomNumber}
                                            onChange={e => setNewRoom({ ...newRoom, roomNumber: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newRoom.floor}
                                            onChange={e => setNewRoom({ ...newRoom, floor: parseInt(e.target.value) })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={newRoom.capacity}
                                            onChange={e => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(n => (
                                                <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ) : creationMode === 'smart' ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-4 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Floor Range</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={smartBatch.startFloor}
                                                    onChange={e => setSmartBatch({ ...smartBatch, startFloor: parseInt(e.target.value) || 0 })}
                                                />
                                                <span className="self-center text-gray-400">to</span>
                                                <input
                                                    type="number"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={smartBatch.endFloor}
                                                    onChange={e => setSmartBatch({ ...smartBatch, endFloor: parseInt(e.target.value) || 0 })}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Rooms/Floor</label>
                                            <input
                                                type="number"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={smartBatch.roomsPerFloor}
                                                onChange={e => setSmartBatch({ ...smartBatch, roomsPerFloor: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Capacity</label>
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={smartBatch.capacity}
                                                onChange={e => setSmartBatch({ ...smartBatch, capacity: parseInt(e.target.value) })}
                                            >
                                                {[1, 2, 3, 4, 5, 6].map(n => (
                                                    <option key={n} value={n}>{n} Person{n > 1 ? 's' : ''}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-end">
                                            <button
                                                type="button"
                                                onClick={generateSmartPreview}
                                                className="w-full px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                    </div>

                                    {smartBatch.rooms.length > 0 && (
                                        <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto">
                                            <div className="grid grid-cols-3 gap-2">
                                                {smartBatch.rooms.map((room: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{room.roomNumber}</p>
                                                            <p className="text-xs text-gray-500">Floor {room.floor}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const updated = [...smartBatch.rooms];
                                                                updated[idx].isAC = !updated[idx].isAC;
                                                                setSmartBatch({ ...smartBatch, rooms: updated });
                                                            }}
                                                            className={`p-1 rounded transition-colors ${room.isAC ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}
                                                        >
                                                            <Wind size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Prefix</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={bulkRoom.prefix}
                                            onChange={e => setBulkRoom({ ...bulkRoom, prefix: e.target.value })}
                                            placeholder="e.g., RM"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Range</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={bulkRoom.startRange}
                                            onChange={e => setBulkRoom({ ...bulkRoom, startRange: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">End Range</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={bulkRoom.endRange}
                                            onChange={e => setBulkRoom({ ...bulkRoom, endRange: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Floor</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={bulkRoom.floor}
                                            onChange={e => setBulkRoom({ ...bulkRoom, floor: parseInt(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            )}

                            {creationMode !== 'smart' && (
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Wind size={16} className="text-gray-600" />
                                        <span className="text-sm text-gray-700">Air Conditioned Room</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => creationMode === 'single' ? setNewRoom({ ...newRoom, isAC: !newRoom.isAC }) : setBulkRoom({ ...bulkRoom, isAC: !bulkRoom.isAC })}
                                        className={`relative w-10 h-5 rounded-full transition-colors ${(creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC) ? 'bg-blue-600' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${(creationMode === 'single' ? newRoom.isAC : bulkRoom.isAC) ? 'right-0.5' : 'left-0.5'}`} />
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    disabled={creationMode === 'smart' && smartBatch.rooms.length === 0}
                                >
                                    {creationMode === 'single' ? 'Create Room' : creationMode === 'smart' ? `Create ${smartBatch.rooms.length} Rooms` : 'Create Rooms'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;