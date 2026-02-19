import { useState, useEffect } from 'react';
import {
    Bell, User, Lock, Save, Globe,
    Smartphone, Server, Terminal,
    Unlock, Power, Clock, HelpCircle, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminSettings = () => {
    const { user } = useAuthStore();
    const { data: settingsData, isLoading } = useSettings();
    const updateSettings = useUpdateSettings();

    const [settings, setSettings] = useState<any>({
        maintenanceMode: false,
        gateScanningEnabled: true,
        autoVerifyDocuments: false,
        lateEntryThreshold: '22:00',
        leaveSubmissionDeadline: '2', // days before
        emailAlerts: true,
        adminAuditLog: true,
        emergencyBroadcasts: true
    });

    useEffect(() => {
        if (settingsData) {
            setSettings((prev: any) => ({ ...prev, ...settingsData }));
        }
    }, [settingsData]);

    const handleToggle = (key: string) => {
        setSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        try {
            await updateSettings.mutateAsync(settings);
            toast.success('System configurations updated');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    if (isLoading) return <div className="h-full flex items-center justify-center text-gray-400">Loading system preferences...</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-10 pb-20"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">System Settings</h1>
                    <p className="text-sm text-gray-500 mt-2 font-medium">Control global behavior and administrative preferences.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateSettings.isPending}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-[2rem] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                >
                    <Save size={18} />
                    {updateSettings.isPending ? 'Propagating...' : 'Apply Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Operation & Student Portal */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Operational Controls - STUDENT CONNECTED */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Student Portal Control</h3>
                                <p className="text-xs text-gray-500">Settings here directly affect student-facing interfaces.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <SettingToggle
                                icon={<Power size={18} />}
                                title="Maintenance Mode"
                                description="Lock student portal for maintenance updates."
                                checked={settings.maintenanceMode}
                                onChange={() => handleToggle('maintenanceMode')}
                                color="rose"
                            />
                            <SettingToggle
                                icon={<Smartphone size={18} />}
                                title="Gate Scanning"
                                description="Enable QR scanning for student entry/exit."
                                checked={settings.gateScanningEnabled}
                                onChange={() => handleToggle('gateScanningEnabled')}
                                color="emerald"
                            />
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Clock size={14} className="text-indigo-500" />
                                    Late Entry Threshold
                                </label>
                                <div className="relative">
                                    <input
                                        type="time"
                                        value={settings.lateEntryThreshold}
                                        onChange={(e) => setSettings({ ...settings, lateEntryThreshold: e.target.value })}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-700 outline-none"
                                    />
                                    <div className="mt-2 text-[10px] text-gray-400 font-medium">Flag scans after this time as 'Critical Late'.</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <AlertTriangle size={14} className="text-amber-500" />
                                    Leave Submission Lead
                                </label>
                                <select
                                    value={settings.leaveSubmissionDeadline}
                                    onChange={(e) => setSettings({ ...settings, leaveSubmissionDeadline: e.target.value })}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-3 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-bold text-gray-700 outline-none"
                                >
                                    <option value="1">24 Hours Ahead</option>
                                    <option value="2">48 Hours Ahead</option>
                                    <option value="3">72 Hours Ahead</option>
                                    <option value="7">1 Week Ahead</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Admin Preferences - ADMIN ONLY */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                <Terminal size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Administrative Engine</h3>
                                <p className="text-xs text-gray-500">Back-office logic and moderation settings.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <SettingToggle
                                icon={<Save size={18} />}
                                title="Automatic Audit Trails"
                                description="Force log all high-impact admin mutations."
                                checked={settings.adminAuditLog}
                                onChange={() => handleToggle('adminAuditLog')}
                                color="indigo"
                                compact
                            />
                            <SettingToggle
                                icon={<Unlock size={18} />}
                                title="Auto-Verify Documents"
                                description="Automatically approve student doc uploads (not recommended)."
                                checked={settings.autoVerifyDocuments}
                                onChange={() => handleToggle('autoVerifyDocuments')}
                                color="amber"
                                compact
                            />
                            <SettingToggle
                                icon={<HelpCircle size={18} />}
                                title="Emergency Broadcast Mode"
                                description="Allow instant push alerts to all devices."
                                checked={settings.emergencyBroadcasts}
                                onChange={() => handleToggle('emergencyBroadcasts')}
                                color="rose"
                                compact
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Profile & Status */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Admin Identity */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-8 group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <User size={28} />
                            </div>
                            <div>
                                <h3 className="font-black text-gray-900">{user?.name}</h3>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{user?.role}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Email Endpoint</span>
                                <div className="bg-gray-50 px-4 py-3 rounded-xl border border-gray-100 text-sm font-medium text-gray-600">
                                    {user?.email}
                                </div>
                            </div>
                            <button className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all text-sm">
                                <Lock size={16} />
                                Rotate Credentials
                            </button>
                        </div>
                    </div>

                    {/* Notification Engine */}
                    <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                        <Bell className="absolute -bottom-8 -right-8 opacity-10" size={160} />
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                            <Bell size={20} />
                            Alert Routing
                        </h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { key: 'emailAlerts', label: 'Primary Email Alerts' },
                                { key: 'alertComplaints', label: 'Complaint Webhooks', default: true },
                                { key: 'alertLeaves', label: 'Leave Escalation', default: true },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleToggle(item.key)}
                                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                >
                                    <span className="text-sm font-medium">{item.label}</span>
                                    <div className={`w-10 h-5 rounded-full relative transition-colors ${settings[item.key] || item.default ? 'bg-emerald-400' : 'bg-white/20'}`}>
                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${settings[item.key] || item.default ? 'right-1' : 'left-1'}`}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* System Fingerprint */}
                    <div className="bg-gray-50 rounded-[2.5rem] border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Server size={20} className="text-gray-400" />
                            <h4 className="font-bold text-gray-900">Environment</h4>
                        </div>
                        <div className="space-y-3">
                            <FingerprintRow label="Core Version" value="v1.4.2" />
                            <FingerprintRow label="Node Runtime" value="20.10.x" />
                            <FingerprintRow label="DB Sharding" value="Disabled" />
                            <FingerprintRow label="SSL Mode" value="Strong (TLS 1.3)" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const SettingToggle = ({ icon, title, description, checked, onChange, color }: any) => (
    <div
        onClick={onChange}
        className={`flex items-start gap-4 p-5 rounded-[1.5rem] border cursor-pointer transition-all ${checked
            ? `bg-${color}-50 border-${color}-100`
            : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'
            }`}
    >
        <div className={`p-3 rounded-2xl transition-all ${checked
            ? `bg-${color}-600 text-white shadow-lg shadow-${color}-200 scale-110`
            : 'bg-gray-50 text-gray-400'
            }`}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <h4 className={`text-sm font-bold ${checked ? 'text-gray-900' : 'text-gray-700'}`}>{title}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{description}</p>
        </div>
        <div className={`shrink-0 w-12 h-6 rounded-full relative transition-colors ${checked ? `bg-${color}-600` : 'bg-gray-200'}`}>
            <motion.div
                animate={{ x: checked ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
            />
        </div>
    </div>
);

const FingerprintRow = ({ label, value }: any) => (
    <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-gray-100">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-gray-600">{value}</span>
    </div>
);

export default AdminSettings;
