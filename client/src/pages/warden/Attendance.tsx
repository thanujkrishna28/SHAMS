import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import { Check, X, Users, Home, Search, Loader2, Save, Megaphone, Send, AlertCircle, Building2, Clock, RefreshCw, LayoutGrid, MonitorPlay, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { getImageUrl } from '@/utils/imageUtils';

interface Student {
    _id: string;
    name: string;
    profile: {
        profileImage?: string;
        studentId: string;
    }
}

interface Room {
    _id: string;
    roomNumber: string;
    occupants: Student[];
}

const Attendance = () => {
    const queryClient = useQueryClient();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [attendanceData, setAttendanceData] = useState<Record<string, 'present' | 'absent'>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [completedRooms, setCompletedRooms] = useState<Set<string>>(new Set());

    const { data: rooms, isLoading, refetch } = useQuery({
        queryKey: ['warden-rooms'],
        queryFn: async () => {
            const { data } = await api.get<Room[]>('/attendance/warden/rooms');
            return data;
        }
    });

    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [announcement, setAnnouncement] = useState({ title: '', message: '', targetType: 'block', targetValue: '', type: 'normal' });
    const createAnnouncement = useCreateAnnouncement();

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAnnouncement.mutateAsync(announcement as any);
            toast.success('System broadcast deployed');
            setIsAnnouncementOpen(false);
            setAnnouncement({ title: '', message: '', targetType: 'block', targetValue: '', type: 'normal' });
        } catch (error) {
            toast.error('Protocol failed: Broadcast aborted');
        }
    };

    const mutation = useMutation({
        mutationFn: async (payload: any) => {
            return await api.post('/attendance/warden/mark-room', payload);
        },
        onSuccess: () => {
            toast.success(`Verification Locked: Room ${selectedRoom?.roomNumber}`);
            if (selectedRoom) {
                setCompletedRooms(prev => new Set([...prev, selectedRoom._id]));
            }
            setSelectedRoom(null);
            setAttendanceData({});
            queryClient.invalidateQueries({ queryKey: ['warden-rooms'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Submission failed');
        }
    });

    const handleMark = (studentId: string, status: 'present' | 'absent') => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = () => {
        if (!selectedRoom) return;

        const payload = {
            roomId: selectedRoom._id,
            attendanceData: Object.entries(attendanceData).map(([id, status]) => ({
                studentId: id,
                status
            }))
        };

        if (payload.attendanceData.length < selectedRoom.occupants.length) {
            toast.error('Identify all subjects before sealing');
            return;
        }

        mutation.mutate(payload);
    };

    const filteredRooms = rooms?.filter(r => r.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const totalRooms = rooms?.length || 0;
    const completedRoomsCount = completedRooms.size;
    const completionPercentage = totalRooms > 0 ? (completedRoomsCount / totalRooms) * 100 : 0;

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing Scan Data...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Enterprise Command Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-800 p-10 lg:p-12">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-20 -left-20 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[80px]" />

                <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-10">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full backdrop-blur-md">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em]">Security Protocol</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full backdrop-blur-md">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.25em]">Live Verification Round</span>
                            </div>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-4">Attendance Round</h1>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Physical identification and residential verification engine. Process units in sequence for optimal integrity.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <button
                            onClick={() => refetch()}
                            className="p-5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-all border border-slate-700 shadow-xl group active:scale-95"
                        >
                            <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                        <button
                            onClick={() => setIsAnnouncementOpen(true)}
                            className="px-8 py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <Megaphone size={18} />
                            System Broadcast
                        </button>
                    </div>
                </div>

                {/* High-Density Performance HUD */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                    <MetricTile label="Total Units" value={totalRooms} icon={<LayoutGrid size={20} />} color="slate" />
                    <MetricTile label="Units Verified" value={completedRoomsCount} icon={<Check size={20} />} color="emerald" />
                    <MetricTile label="Awaiting Scan" value={totalRooms - completedRoomsCount} icon={<Clock size={20} />} color="amber" />
                    <MetricTile label="Completion Index" value={`${completionPercentage.toFixed(0)}%`} icon={<MonitorPlay size={20} />} color="indigo" />
                </div>
            </div>

            {/* Registry Control Deck */}
            <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em]">Residential Sector Matrix</h3>
                    <div className="relative group min-w-[320px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Identify specific unit ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 outline-none transition-all placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10"
                        />
                    </div>
                </div>

                <div className="p-10">
                    {filteredRooms?.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-dashed border-slate-100">
                                <Search size={32} className="text-slate-200" />
                            </div>
                            <p className="text-[15px] font-black text-slate-300 uppercase tracking-widest">No Units Identified In This Sector</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filteredRooms?.map((room) => {
                                const isCompleted = completedRooms.has(room._id);
                                return (
                                    <button
                                        key={room._id}
                                        onClick={() => {
                                            setSelectedRoom(room);
                                            setAttendanceData({});
                                        }}
                                        className={`group relative p-6 rounded-[1.5rem] border-2 transition-all active:scale-95 ${selectedRoom?._id === room._id
                                                ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-[1.02]'
                                                : isCompleted
                                                    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                                                    : 'bg-slate-50/50 border-slate-100 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="text-[16px] font-black tracking-tight mb-1">Unit {room.roomNumber}</div>
                                        <div className={`text-[10px] font-black uppercase tracking-widest ${selectedRoom?._id === room._id ? 'text-slate-400' : 'text-slate-400'
                                            }`}>
                                            {room.occupants.length} RESIDENTS
                                        </div>
                                        {isCompleted && (
                                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-white">
                                                <Check size={12} />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Verification Modal */}
            {selectedRoom && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-[12px] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <div>
                                <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">Unit Verification</h2>
                                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest leading-none mt-1">Scanning Room {selectedRoom.roomNumber}</p>
                            </div>
                            <button onClick={() => setSelectedRoom(null)} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-10 space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
                            {selectedRoom.occupants.map((student) => {
                                const status = attendanceData[student._id];
                                return (
                                    <div key={student._id} className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all ${status === 'present' ? 'bg-emerald-50 border-emerald-200 shadow-sm' :
                                            status === 'absent' ? 'bg-rose-50 border-rose-200 shadow-sm' :
                                                'bg-slate-50 border-slate-100 shadow-inner'
                                        }`}>
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white overflow-hidden border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                                                <img
                                                    src={getImageUrl(student.profile?.profileImage)}
                                                    alt={student.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1e293b&color=fff`;
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-black text-slate-900 leading-none mb-1.5">{student.name}</p>
                                                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">{student.profile?.studentId}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => handleMark(student._id, 'absent')}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${status === 'absent' ? 'bg-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-white text-slate-300 border border-slate-100 hover:border-rose-300 hover:text-rose-600'
                                                    }`}
                                            >
                                                <X size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleMark(student._id, 'present')}
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${status === 'present' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-300 border border-slate-100 hover:border-emerald-300 hover:text-emerald-600'
                                                    }`}
                                            >
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-10 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={handleSubmit}
                                disabled={mutation.isPending || Object.keys(attendanceData).length !== selectedRoom.occupants.length}
                                className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[13px] uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                            >
                                {mutation.isPending ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                SEAL PROTOCOL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* System Broadcast Modal */}
            {isAnnouncementOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/40 backdrop-blur-[12px] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] w-full max-w-xl shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-300">
                        <div className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100">
                                    <Megaphone className="text-white" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.25em]">System Broadcast</h2>
                                    <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest leading-none mt-1">Mass Notification Protocol</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAnnouncementOpen(false)} className="w-12 h-12 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center shadow-sm">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleBroadcast} className="p-12 space-y-8">
                            <div className="space-y-4">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Broadcast Priority</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setAnnouncement({ ...announcement, type: 'normal' })}
                                        className={`py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all border-2 ${announcement.type === 'normal' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-slate-300'}`}
                                    >
                                        Standard
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setAnnouncement({ ...announcement, type: 'emergency' })}
                                        className={`py-5 rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all border-2 ${announcement.type === 'emergency' ? 'bg-rose-600 border-rose-600 text-white shadow-xl shadow-rose-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:border-rose-200'}`}
                                    >
                                        Emergency
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Header Title</label>
                                <input
                                    type="text"
                                    value={announcement.title}
                                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none shadow-inner transition-all placeholder:text-slate-300"
                                    placeholder="Enter Protocol Title..."
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Message Content</label>
                                <textarea
                                    value={announcement.message}
                                    onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                                    rows={5}
                                    className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-[14px] font-bold text-slate-900 focus:bg-white focus:border-indigo-600 outline-none shadow-inner transition-all placeholder:text-slate-300 resize-none"
                                    placeholder="Type high-priority message..."
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsAnnouncementOpen(false)}
                                    className="flex-1 py-5 text-slate-400 font-black text-[11px] uppercase tracking-[0.2em] hover:text-slate-900 hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    <Send size={18} />
                                    Deploy Broadcast
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const MetricTile = ({ label, value, icon, color }: any) => {
    const colors: any = {
        amber: 'bg-amber-500 text-white shadow-amber-900/20',
        emerald: 'bg-emerald-500 text-white shadow-emerald-900/20',
        indigo: 'bg-indigo-600 text-white shadow-indigo-900/20',
        slate: 'bg-slate-500 text-white shadow-slate-900/20',
    };

    return (
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] group transition-all hover:bg-white/20">
            <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl ${colors[color]} flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500`}>
                    {icon}
                </div>
                <span className="text-3xl font-black text-white tracking-tighter leading-none">{value}</span>
            </div>
            <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">{label}</p>
        </div>
    );
};

export default Attendance;