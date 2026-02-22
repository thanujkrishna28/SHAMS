import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BedDouble, AlertCircle, Clock, TrendingUp, TrendingDown, Megaphone, Send, X, Activity, BarChart3, Utensils, FileText, ShieldAlert, Building2 } from 'lucide-react';
import { useCreateAnnouncement } from '@/hooks/useCreateAnnouncement';
import { useAdminStats, useAllAllocations, useAllComplaints, useUpdateComplaintStatus } from '@/hooks/useAdmin';
import { useRooms } from '@/hooks/useRooms';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import api from '@/api/axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement
);

const Dashboard = () => {
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
    const [announcement, setAnnouncement] = useState({ title: '', message: '', targetType: 'all', targetValue: '', type: 'normal' });

    const { data: stats, isLoading: isStatsLoading } = useAdminStats();
    const { data: allocations } = useAllAllocations();
    const { data: complaints } = useAllComplaints();
    const { data: rooms } = useRooms();

    const createAnnouncement = useCreateAnnouncement();
    const updateComplaint = useUpdateComplaintStatus();

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createAnnouncement.mutateAsync(announcement as any);
            toast.success('Announcement broadcasted successfully!');
            setIsAnnouncementOpen(false);
            setAnnouncement({ title: '', message: '', targetType: 'all', targetValue: '', type: 'normal' });
        } catch (error) {
            toast.error('Failed to send announcement');
        }
    };

    const handleDownloadReport = async () => {
        try {
            const response = await api.get('/reports/weekly', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Weekly_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Report downloaded successfully');
        } catch (error) {
            toast.error('Failed to download report');
        }
    };

    const handleResolveComplaint = (id: string) => {
        updateComplaint.mutate({ id, status: 'resolved', adminComment: 'Resolved' }, {
            onSuccess: () => toast.success('Complaint resolved'),
            onError: () => toast.error('Action failed')
        });
    };

    const pendingAllocations = allocations?.filter((a: any) => a.status === 'pending') || [];
    const pendingComplaints = (Array.isArray(complaints) ? complaints : complaints?.data)?.filter((c: any) => c.status === 'pending') || [];

    // Chart Data
    const attendanceData = {
        labels: stats?.attendanceTrend?.map((d: any) => new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' })) || [],
        datasets: [
            {
                label: 'Daily Attendance',
                data: stats?.attendanceTrend?.map((d: any) => d.count) || [],
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const mealData = {
        labels: Object.keys(stats?.mealStats || {}),
        datasets: [
            {
                data: Object.values(stats?.mealStats || {}),
                backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                }
            },
            x: {
                grid: {
                    display: false,
                }
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            {/* Header with Date/Time */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="text-sm text-gray-500 mt-1">Real-time insights and management</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadReport}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all flex items-center gap-2"
                    >
                        <FileText size={18} />
                        Weekly Report
                    </button>
                    <button
                        onClick={() => setIsAnnouncementOpen(true)}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-indigo-200 transition-all transform active:scale-95 flex items-center gap-2"
                    >
                        <Megaphone size={18} />
                        Broadcast
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <KPICard
                    title="Total Students"
                    value={stats?.totalStudents?.toLocaleString() || '0'}
                    change="+12%"
                    trend="up"
                    icon={Users}
                    color="indigo"
                    loading={isStatsLoading}
                />
                <KPICard
                    title="Total Hostels"
                    value={stats?.totalHostels?.toLocaleString() || '0'}
                    change="Structure"
                    trend="neutral"
                    icon={Building2}
                    color="emerald"
                    loading={isStatsLoading}
                />
                <KPICard
                    title="Occupancy Rate"
                    value={`${stats?.occupancyRate || 0}%`}
                    change="-2%"
                    trend="down"
                    icon={BedDouble}
                    color="sky"
                    loading={isStatsLoading}
                />
                <KPICard
                    title="Visitor Requests"
                    value={stats?.pendingVisitors || 0}
                    change="Active"
                    trend="up"
                    icon={ShieldAlert}
                    color="rose"
                    loading={isStatsLoading}
                    subtext="Pending Approval"
                />
                <KPICard
                    title="Pending Tasks"
                    value={(stats?.pendingComplaints || 0) + (stats?.pendingAllocations || 0)}
                    change="+5"
                    trend="down"
                    icon={Activity}
                    color="amber"
                    loading={isStatsLoading}
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Trend Chart */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-gray-900">Attendance Trends</h3>
                            <p className="text-sm text-gray-500">Daily entry scans over the last 7 days</p>
                        </div>
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="h-[250px]">
                        <Line options={chartOptions} data={attendanceData} />
                    </div>
                </div>

                {/* Dietary Distribution */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Meal Stats</h3>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Utensils size={20} />
                        </div>
                    </div>
                    <div className="h-[200px] flex justify-center">
                        <Doughnut data={mealData} options={{ maintainAspectRatio: false }} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                        {Object.entries(stats?.mealStats || {}).map(([key, value]: any) => (
                            <div key={key} className="bg-gray-50 p-2 rounded-lg">
                                <span className="block font-bold text-gray-900">{value}</span>
                                <span className="text-gray-500">{key}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Operational Efficiency */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Operational Efficiency</h3>
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Allocation Processing</span>
                                <span className="font-semibold text-gray-900">{stats?.avgAllocationProcessingTime || 0} hrs</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-500">Complaint Resolution</span>
                                <span className="font-semibold text-gray-900">{stats?.avgComplaintResolutionTime || 0} hrs</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '80%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Complaints Feed */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-semibold text-gray-800">Recent Complaints</h3>
                        <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
                    </div>
                    <div className="space-y-4">
                        {pendingComplaints.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No pending complaints.</div>
                        ) : (
                            pendingComplaints.slice(0, 4).map((c: any) => (
                                <div key={c._id} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100 cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold shrink-0">
                                        CI
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <h4 className="font-medium text-gray-900">{c.title}</h4>
                                            <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{c.description}</p>
                                        <button
                                            onClick={() => handleResolveComplaint(c._id)}
                                            className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-800"
                                        >
                                            MARK RESOLVED
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Announcement Modal with Emergency Toggle */}
            {isAnnouncementOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
                    >
                        <div className={`p-6 text-white flex justify-between items-center ${announcement.type === 'emergency' ? 'bg-gradient-to-r from-red-600 to-rose-600' : 'bg-gradient-to-r from-violet-600 to-indigo-600'}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                    <Megaphone size={24} />
                                </div>
                                <h2 className="text-xl font-bold">{announcement.type === 'emergency' ? 'EMERGENCY BROADCAST' : 'Broadcast Announcement'}</h2>
                            </div>
                            <button onClick={() => setIsAnnouncementOpen(false)} className="text-white/80 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                                <input
                                    type="checkbox"
                                    id="isEmergency"
                                    checked={announcement.type === 'emergency'}
                                    onChange={e => setAnnouncement({ ...announcement, type: e.target.checked ? 'emergency' : 'normal' })}
                                    className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                                <label htmlFor="isEmergency" className="text-sm font-semibold text-red-700 flex items-center gap-2">
                                    <AlertCircle size={16} />
                                    Send as Emergency Alert
                                </label>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={announcement.title}
                                    onChange={e => setAnnouncement({ ...announcement, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="e.g. Important Update"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Message</label>
                                <textarea
                                    value={announcement.message}
                                    onChange={e => setAnnouncement({ ...announcement, message: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all placeholder:text-gray-400 min-h-[120px] resize-none"
                                    placeholder="Type your detailed message here..."
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Target Audience</label>
                                <select
                                    value={announcement.targetType}
                                    onChange={e => setAnnouncement({ ...announcement, targetType: e.target.value as any })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all"
                                >
                                    <option value="all">All Students</option>
                                    <option value="block">Specific Block</option>
                                    <option value="floor">Specific Floor</option>
                                </select>
                            </div>

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsAnnouncementOpen(false)}
                                    className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-5 py-2.5 text-white font-medium rounded-xl hover:opacity-90 shadow-lg transition-all flex items-center gap-2 ${announcement.type === 'emergency' ? 'bg-red-600 shadow-red-200' : 'bg-violet-600 shadow-violet-200'}`}
                                >
                                    <Send size={18} />
                                    {announcement.type === 'emergency' ? 'BROADCAST ALERT' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

// Helper Components
const KPICard = ({ title, value, change, trend, icon: Icon, color, loading, subtext }: any) => {
    const colorStyles: any = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        sky: { bg: 'bg-sky-50', text: 'text-sky-600' },
        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    };

    const trendStyles = trend === 'up'
        ? 'text-green-600 bg-green-50'
        : 'text-red-600 bg-red-50';

    const styles = colorStyles[color] || colorStyles.indigo;

    return (
        <motion.div
            whileHover={{ y: -5, boxShadow: "0 4px 20px -2px rgba(0, 0, 0, 0.1)" }}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm transition-all duration-300 cursor-default"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg ${styles.bg} ${styles.text}`}>
                    <Icon size={22} />
                </div>
                {!loading && change && (
                    <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${trendStyles}`}>
                        {change}
                        {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    </div>
                )}
            </div>
            {loading ? (
                <div className="h-9 w-24 bg-gray-100 animate-pulse rounded"></div>
            ) : (
                <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
            )}
            <div className="text-sm text-gray-500 font-medium mt-1">{title}</div>
            {subtext && <div className="text-xs text-gray-400 mt-0.5">{subtext}</div>}
        </motion.div>
    );
};

const StatusRow = ({ label, percentage, color }: any) => (
    <div>
        <div className="flex justify-between text-xs font-medium text-gray-500 mb-1.5">
            <span>{label}</span>
            <span>{percentage}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className={`h-full rounded-full ${color}`}
            ></motion.div>
        </div>
    </div>
);

export default Dashboard;
