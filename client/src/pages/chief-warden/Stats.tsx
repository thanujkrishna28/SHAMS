import { useQuery } from '@tanstack/react-query';
import api from '@/api/axios';
import {
    Users, UserX, UserCheck, Search, ShieldAlert, MapPin,
    Loader2, RefreshCw, Megaphone, Send, X, AlertCircle,
    Activity, Shield, Globe, Zap, Radio, BellRing
} from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { getImageUrl } from '@/utils/imageUtils';

interface ChiefSummary {
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    absentees: Array<{
        _id: string;
        name: string;
        roomNumber: string;
        profileImage?: string;
        studentId: string;
    }>;
}

const Stats = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data, isLoading, refetch, isFetching } = useQuery({
        queryKey: ['chief-summary'],
        queryFn: async () => {
            const { data } = await api.get<ChiefSummary>('/attendance/chief/summary');
            return data;
        },
        refetchInterval: 30000
    });

    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [announcement, setAnnouncement] = useState({ title: '', message: '', targetType: 'all', targetValue: '', type: 'normal' });
    const createAnnouncement = useCreateAnnouncement();

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAnnouncement.mutateAsync(announcement as any);
            toast.success('Announcement broadcast successfully');
            setIsAnnouncementOpen(false);
            setAnnouncement({ title: '', message: '', targetType: 'all', targetValue: '', type: 'normal' });
        } catch (error) {
            toast.error('Failed to send announcement');
        }
    };

    const filteredAbsentees = data?.absentees?.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg flex-shrink-0 flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-gray-900">Command Center</h1>
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Live</span>
                            </div>
                            <p className="text-gray-500 text-sm">Real-time attendance monitoring and announcements</p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => refetch()}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setIsAnnouncementOpen(true)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Megaphone size={16} />
                            Broadcast
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Students</p>
                            <p className="text-xl font-bold text-gray-900">{data?.totalStudents || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserCheck size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Present</p>
                            <p className="text-xl font-bold text-gray-900">{data?.presentCount || 0}</p>
                            <p className="text-xs text-gray-400">{data ? Math.round((data.presentCount / data.totalStudents) * 100) : 0}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <UserX size={18} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Absent</p>
                            <p className="text-xl font-bold text-gray-900">{data?.absentCount || 0}</p>
                            <p className="text-xs text-gray-400">{data ? Math.round((data.absentCount / data.totalStudents) * 100) : 0}%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Activity size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Attendance Rate</p>
                            <p className="text-xl font-bold text-gray-900">{data ? Math.round((data.presentCount / data.totalStudents) * 100) : 0}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Absentee List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <ShieldAlert size={18} className="text-red-500" />
                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">Absent Students</h2>
                            <p className="text-xs text-gray-500">Students not marked present today</p>
                        </div>
                    </div>

                    <div className="relative w-full md:w-auto">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredAbsentees?.length === 0 ? (
                        <div className="px-4 py-12 text-center">
                            <UserCheck size={32} className="text-green-500 mx-auto mb-3" />
                            <p className="text-sm font-medium text-gray-900">All students present</p>
                            <p className="text-xs text-gray-500">100% attendance today</p>
                        </div>
                    ) : (
                        filteredAbsentees?.map((student) => (
                            <div key={student._id} className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {student.profileImage ? (
                                            <img src={getImageUrl(student.profileImage)} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-500 font-semibold text-sm">{student.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                        <p className="text-xs text-gray-500">{student.studentId} · Room {student.roomNumber}</p>
                                    </div>
                                </div>
                                <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Absent</span>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAbsentees?.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center">
                                        <UserCheck size={32} className="text-green-500 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-gray-900">All students present</p>
                                        <p className="text-xs text-gray-500">100% attendance today</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredAbsentees?.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {student.profileImage ? (
                                                        <img src={getImageUrl(student.profileImage)} alt={student.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-gray-500 font-semibold">{student.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-700">
                                                <MapPin size={14} className="text-gray-400" />
                                                Room {student.roomNumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-700">Absent</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">Notify</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Broadcast Modal */}
            {isAnnouncementOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
                        <div className={`px-6 py-4 border-b flex items-center justify-between ${announcement.type === 'emergency' ? 'bg-red-600 text-white' : 'bg-gray-800 text-white'}`}>
                            <div className="flex items-center gap-3">
                                <BellRing size={18} />
                                <div>
                                    <h2 className="text-sm font-bold">New Announcement</h2>
                                    <p className="text-xs opacity-80">Broadcast to students</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAnnouncementOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <input
                                    type="checkbox"
                                    id="isEmergency"
                                    checked={announcement.type === 'emergency'}
                                    onChange={e => setAnnouncement({ ...announcement, type: e.target.checked ? 'emergency' : 'normal' })}
                                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="isEmergency" className="text-xs font-medium text-gray-700 flex items-center gap-1 cursor-pointer">
                                    <AlertCircle size={14} />
                                    Emergency Broadcast
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                <div className="relative">
                                    <Megaphone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={announcement.title}
                                        onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                                        className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Announcement title"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={announcement.message}
                                    onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    rows={4}
                                    placeholder="Enter announcement message..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Target Audience</label>
                                <select
                                    value={announcement.targetType}
                                    onChange={e => setAnnouncement({ ...announcement, targetType: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Students</option>
                                    <option value="block">Specific Block</option>
                                    <option value="floor">Specific Floor</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button type="button" onClick={() => setIsAnnouncementOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createAnnouncement.isPending} className={`flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors ${announcement.type === 'emergency' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {createAnnouncement.isPending ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Stats;