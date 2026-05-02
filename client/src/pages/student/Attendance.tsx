import { Calendar, UserCheck, UserX, Clock, MapPin, TrendingUp, Activity, BarChart3 } from 'lucide-react';
import DigitalIDCard from '@/components/DigitalIDCard';
import 'chart.js/auto';

import { useMyAttendance } from '@/hooks/useAttendance';
import { useAuthStore } from '@/store/authStore';
import { motion } from 'framer-motion';

const Attendance = () => {
    const { data: logs, isLoading } = useMyAttendance();
    const { user } = useAuthStore();

    // Calculate dynamic stats from logs
    const stats = {
        presentRate: user?.profile?.attendancePercentage || 0,
        totalLogs: logs?.length || 0,
        present: logs?.filter((l: any) => l.type === 'present').length || 0,
        absent: logs?.filter((l: any) => l.type === 'absent').length || 0,
    };

    // Calculate weekly trend
    const weeklyTrend = stats.presentRate > 85 ? 'Excellent' : stats.presentRate > 70 ? 'Good' : 'Needs Improvement';
    const trendColor = stats.presentRate > 85 ? 'emerald' : stats.presentRate > 70 ? 'blue' : 'amber';

    // Group logs by date
    const groupedLogs = logs?.reduce((acc: any, log: any) => {
        const date = new Date(log.createdAt).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(log);
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto" />
                    <p className="text-sm text-gray-500">Loading attendance data...</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
                        <span>ATTENDANCE MANAGEMENT</span>
                        <span className="text-gray-300">|</span>
                        <span>Night Round Tracking</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-light text-gray-900 tracking-tight">
                                Attendance{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Dashboard
                                </span>
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                Track your night round status and attendance history
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                            <Activity size={14} className="text-indigo-500" />
                            <span className="text-gray-500">Last Sync:</span>
                            <span className="font-mono text-gray-700">
                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Digital ID Card - Compact */}
                    <div className="lg:col-span-5 xl:col-span-4 space-y-4">
                        {/* Digital ID Card - Wrapped in compact container */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <DigitalIDCard />
                        </div>

                        {/* Current Status Card - Compact */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Current Status</h3>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className={`w-2.5 h-2.5 rounded-full ${user?.profile?.isInside ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                            <div className={`absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping ${user?.profile?.isInside ? 'bg-emerald-500' : 'bg-amber-500'} opacity-75`} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {user?.profile?.isInside ? 'Present on Campus' : 'Not Present'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Last: {user?.profile?.lastMovementAt
                                                    ? new Date(user.profile.lastMovementAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                    : 'Not recorded'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-[9px] font-semibold ${user?.profile?.isInside
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {user?.profile?.isInside ? 'ACTIVE' : 'AWAY'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Attendance Summary Card - Compact */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 text-white">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[10px] font-medium text-white/70 uppercase tracking-wider">Overall Performance</p>
                                <TrendingUp size={14} className="text-white/60" />
                            </div>
                            <div className="flex items-baseline justify-between">
                                <div>
                                    <p className="text-2xl font-bold">{stats.presentRate}%</p>
                                    <p className="text-[10px] text-white/70 mt-0.5">Attendance Rate</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-semibold text-white">{stats.present} / {stats.totalLogs}</p>
                                    <p className="text-[9px] text-white/50">Present/Total</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-white/20">
                                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-white rounded-full transition-all duration-500"
                                        style={{ width: `${stats.presentRate}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Stats & History */}
                    <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                        {/* Stats Grid - Compact */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Present Count */}
                            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-1.5 bg-emerald-50 rounded-lg">
                                        <UserCheck size={16} className="text-emerald-600" />
                                    </div>
                                    <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                                        {stats.presentRate >= 75 ? 'Good' : 'Average'}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">{stats.present}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Days Present</p>
                            </div>

                            {/* Absent Count */}
                            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-1.5 bg-amber-50 rounded-lg">
                                        <UserX size={16} className="text-amber-600" />
                                    </div>
                                    <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                                        {stats.absent > 0 ? 'Needs Focus' : 'Perfect'}
                                    </span>
                                </div>
                                <p className="text-xl font-bold text-gray-900">{stats.absent}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Days Absent</p>
                            </div>

                            {/* Total Logs */}
                            <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                                        <BarChart3 size={16} className="text-indigo-600" />
                                    </div>
                                </div>
                                <p className="text-xl font-bold text-gray-900">{stats.totalLogs}</p>
                                <p className="text-[11px] text-gray-500 mt-0.5">Total Records</p>
                            </div>
                        </div>

                        {/* Weekly Trend Card - Compact */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp size={14} className="text-gray-500" />
                                        <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Weekly Trend</h3>
                                    </div>
                                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${trendColor === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                                            trendColor === 'blue' ? 'bg-blue-100 text-blue-700' :
                                                'bg-amber-100 text-amber-700'
                                        }`}>
                                        {weeklyTrend}
                                    </span>
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-end gap-2 h-20">
                                    {[85, 92, 78, 88, 95, 82, 90].map((value, idx) => (
                                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                                            <div
                                                className="w-full bg-indigo-100 rounded transition-all duration-500 hover:bg-indigo-400 cursor-pointer"
                                                style={{ height: `${(value / 100) * 60}px` }}
                                            />
                                            <span className="text-[8px] text-gray-400 font-mono">
                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* History Timeline - Compact */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-gray-500" />
                                    <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Attendance History</h3>
                                </div>
                                <span className="text-[9px] text-gray-400">{stats.totalLogs} records</span>
                            </div>

                            <div className="p-4 max-h-[320px] overflow-y-auto custom-scrollbar">
                                {logs && logs.length > 0 ? (
                                    <div className="space-y-3">
                                        {Object.entries(groupedLogs || {}).slice(0, 5).map(([date, dateLogs]: [string, any]) => (
                                            <div key={date} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={10} className="text-gray-400" />
                                                    <p className="text-[10px] font-medium text-gray-500">{date}</p>
                                                    <div className="h-px flex-1 bg-gray-100" />
                                                </div>
                                                {dateLogs.slice(0, 3).map((log: any, idx: number) => (
                                                    <motion.div
                                                        key={log._id || idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div className={`p-1 rounded-lg ${log.type === 'present'
                                                                    ? 'bg-emerald-100 text-emerald-600'
                                                                    : 'bg-amber-100 text-amber-600'
                                                                }`}>
                                                                {log.type === 'present' ? (
                                                                    <UserCheck size={12} />
                                                                ) : (
                                                                    <UserX size={12} />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-gray-900">
                                                                    {log.type === 'present' ? 'Present' : 'Absent'}
                                                                </p>
                                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                                    <MapPin size={8} className="text-gray-400" />
                                                                    <p className="text-[9px] text-gray-500">{log.location || 'Hostel Round'}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-[10px] font-mono text-gray-500">
                                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        ))}
                                        {stats.totalLogs > 15 && (
                                            <div className="text-center pt-2">
                                                <button className="text-[10px] text-indigo-600 font-medium hover:text-indigo-700">
                                                    View all {stats.totalLogs} records →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Calendar size={20} className="text-gray-300" />
                                        </div>
                                        <p className="text-xs text-gray-500">No attendance records found</p>
                                        <p className="text-[10px] text-gray-400 mt-1">Check back after your first night round</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Attendance;