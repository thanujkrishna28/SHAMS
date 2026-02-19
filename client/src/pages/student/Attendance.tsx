
import { Calendar, UserCheck, UserX, Clock, MapPin, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import DigitalIDCard from '@/components/DigitalIDCard'; // Updated import
import 'chart.js/auto';

import { useMyAttendance } from '@/hooks/useAttendance';
import { useAuthStore } from '@/store/authStore';

const Attendance = () => {
    const { data: logs, isLoading } = useMyAttendance();
    const { user } = useAuthStore();

    // Calculate dynamic stats from logs
    const stats = {
        present: user?.profile?.attendancePercentage || 0,
        totalLogs: logs?.length || 0,
        entries: logs?.filter((l: any) => l.type === 'entry').length || 0,
        exits: logs?.filter((l: any) => l.type === 'exit').length || 0,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance & Access</h1>
                    <p className="text-gray-500 mt-1">Manage your campus entry logs and digital ID.</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full border border-indigo-100">
                    <Clock size={16} />
                    <span>Last Sync: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Digital ID Card (Fixed/Sticky on large screens ideally, but scrollable for now) */}
                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                    <div className="bg-white/50 backdrop-blur-xl rounded-3xl p-1">
                        <DigitalIDCard />
                    </div>

                    {/* Quick Status Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-4">Current Status</h3>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full animate-pulse ${user?.profile?.isInside ? 'bg-emerald-500 shadow-emerald-500/50 shadow-lg' : 'bg-amber-500 shadow-amber-500/50 shadow-lg'}`} />
                                <span className="font-bold text-gray-700">{user?.profile?.isInside ? 'Checked In' : 'Checked Out'}</span>
                            </div>
                            <span className="text-xs font-mono text-gray-400">
                                {user?.profile?.lastMovementAt ? new Date(user.profile.lastMovementAt).toLocaleTimeString() : '--:--'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Stats & History */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                            title="Monthly Attendance"
                            value={`${stats.present}%`}
                            icon={Calendar}
                            trend="+2.5%"
                            color="indigo"
                        />
                        <StatCard
                            title="Total Entries"
                            value={stats.entries}
                            icon={UserCheck}
                            color="emerald"
                        />
                        <StatCard
                            title="Total Exits"
                            value={stats.exits}
                            icon={UserX}
                            color="amber"
                        />
                    </div>

                    {/* Recent Activity Timeline */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-bold text-gray-900 text-lg">Activity Log</h2>
                            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View All</button>
                        </div>

                        <div className="p-6 max-h-[500px] overflow-y-auto custom-scrollbar">
                            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                {logs?.map((log: any, idx: number) => (
                                    <div key={log._id || idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        {/* Icon */}
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-gray-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                                            {log.type === 'entry' ? (
                                                <ArrowDownLeft size={16} className="text-emerald-500" />
                                            ) : (
                                                <ArrowUpRight size={16} className="text-amber-500" />
                                            )}
                                        </div>

                                        {/* Card */}
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-1">
                                                <span className={`font-bold text-sm uppercase tracking-wider ${log.type === 'entry' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                    {log.type === 'entry' ? 'Campus Entry' : 'Campus Exit'}
                                                </span>
                                                <time className="font-mono text-xs text-gray-400">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </time>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 mt-2">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="text-sm font-medium">{log.location || 'Main Gate'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!logs || logs.length === 0) && (
                                    <div className="text-center py-10 text-gray-400">
                                        <p>No activity recorded this month.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modern Stat Card Component
const StatCard = ({ title, value, icon: Icon, trend, color }: any) => {
    const colorClasses = {
        indigo: 'bg-indigo-50 text-indigo-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${(colorClasses as any)[color]} group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <h4 className="text-3xl font-bold text-gray-900 mb-1">{value}</h4>
                <p className="text-sm font-medium text-gray-500">{title}</p>
            </div>
        </div>
    );
};

export default Attendance;
