import { useState, useEffect } from 'react';
import {
    Bell, User, Lock, Save, Globe,
    Smartphone, Server, Terminal,
    Unlock, Power, Clock, HelpCircle, AlertTriangle, Bed, Shield
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import toast from 'react-hot-toast';
import api from '@/api/axios';
import MFASetup from '@/components/auth/MFASetup';

const Settings = () => {
    const { user, fetchProfile } = useAuthStore();
    const { data: settingsData, isLoading } = useSettings();
    const updateSettings = useUpdateSettings();
    const [showMFAModal, setShowMFAModal] = useState(false);

    const [settings, setSettings] = useState<any>({
        maintenanceMode: false,
        gateScanningEnabled: true,
        autoVerifyDocuments: false,
        lateEntryThreshold: '22:00',
        leaveSubmissionDeadline: '2',
        emailAlerts: true,
        adminAuditLog: true,
        emergencyBroadcasts: true,
        roomChangeEnabled: false,
        admissionFee: 5000
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
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error('Failed to update settings');
        }
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading settings...</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure system preferences and security</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={updateSettings.isPending}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Save size={16} />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Student Portal Controls */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                <Globe size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Student Portal</h3>
                                <p className="text-xs text-gray-500">Settings that affect student-facing features</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ToggleSwitch
                                icon={<Power size={16} />}
                                title="Maintenance Mode"
                                description="Lock student portal for maintenance"
                                value={settings.maintenanceMode}
                                onChange={() => handleToggle('maintenanceMode')}
                            />
                            <ToggleSwitch
                                icon={<Smartphone size={16} />}
                                title="Gate Scanning"
                                description="Enable QR scanning for entry/exit"
                                value={settings.gateScanningEnabled}
                                onChange={() => handleToggle('gateScanningEnabled')}
                            />
                            <ToggleSwitch
                                icon={<Bed size={16} />}
                                title="Room Change Requests"
                                description="Allow students to request room swaps"
                                value={settings.roomChangeEnabled}
                                onChange={() => handleToggle('roomChangeEnabled')}
                            />
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                                    <Clock size={12} /> Late Entry Threshold
                                </label>
                                <input
                                    type="time"
                                    value={settings.lateEntryThreshold}
                                    onChange={(e) => setSettings({ ...settings, lateEntryThreshold: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Entries after this time are flagged as late</p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-2 flex items-center gap-1">
                                    <AlertTriangle size={12} /> Leave Submission Lead Time
                                </label>
                                <select
                                    value={settings.leaveSubmissionDeadline}
                                    onChange={(e) => setSettings({ ...settings, leaveSubmissionDeadline: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="1">24 hours ahead</option>
                                    <option value="2">48 hours ahead</option>
                                    <option value="3">72 hours ahead</option>
                                    <option value="7">1 week ahead</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <label className="block text-xs font-medium text-gray-600 mb-2">Default Admission Fee (₹)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                <input
                                    type="number"
                                    value={settings.admissionFee}
                                    onChange={(e) => setSettings({ ...settings, admissionFee: parseFloat(e.target.value) || 0 })}
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">Auto-assigned to new student registrations</p>
                        </div>
                    </div>

                    {/* Admin Settings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                                <Terminal size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Administrative Settings</h3>
                                <p className="text-xs text-gray-500">Back-office configuration</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <ToggleSwitch
                                icon={<Save size={16} />}
                                title="Audit Trails"
                                description="Log all admin actions"
                                value={settings.adminAuditLog}
                                onChange={() => handleToggle('adminAuditLog')}
                                compact
                            />
                            <ToggleSwitch
                                icon={<Unlock size={16} />}
                                title="Auto-Verify Documents"
                                description="Automatically approve student documents"
                                value={settings.autoVerifyDocuments}
                                onChange={() => handleToggle('autoVerifyDocuments')}
                                compact
                            />
                            <ToggleSwitch
                                icon={<HelpCircle size={16} />}
                                title="Emergency Broadcasts"
                                description="Allow push alerts to all devices"
                                value={settings.emergencyBroadcasts}
                                onChange={() => handleToggle('emergencyBroadcasts')}
                                compact
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Admin Profile */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{user?.name}</h3>
                                <p className="text-xs text-blue-600 font-medium">{user?.role}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                                <div className="bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700 border border-gray-100">
                                    {user?.email}
                                </div>
                            </div>

                            <div className="pt-2">
                                {!user?.isMFAEnabled ? (
                                    <button
                                        onClick={() => setShowMFAModal(true)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-100 transition-colors text-sm"
                                    >
                                        <Shield size={14} />
                                        Enable Two-Factor Auth
                                    </button>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-green-600">2FA Enabled</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        </div>
                                        <button
                                            onClick={async () => {
                                                if (window.confirm('Disable two-factor authentication?')) {
                                                    try {
                                                        await api.post('/auth/mfa/disable');
                                                        toast.success('2FA disabled');
                                                        fetchProfile();
                                                    } catch (error) {
                                                        toast.error('Failed to disable 2FA');
                                                    }
                                                }
                                            }}
                                            className="w-full py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg text-xs font-medium hover:text-red-600 transition-colors"
                                        >
                                            Disable 2FA
                                        </button>
                                    </div>
                                )}
                                <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors text-sm mt-3">
                                    <Lock size={14} />
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="bg-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center gap-2 mb-4">
                            <Bell size={18} />
                            <h3 className="font-semibold">Alert Settings</h3>
                        </div>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleToggle('emailAlerts')}
                                className="w-full flex items-center justify-between py-2"
                            >
                                <span className="text-sm">Email Alerts</span>
                                <div className={`w-10 h-5 rounded-full relative transition-colors ${settings.emailAlerts ? 'bg-white' : 'bg-white/30'}`}>
                                    <div className={`absolute top-1 w-3 h-3 bg-blue-600 rounded-full transition-all ${settings.emailAlerts ? 'right-1' : 'left-1'}`} />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* System Info */}
                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Server size={16} className="text-gray-500" />
                            <h4 className="font-medium text-gray-900">System Information</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Version</span>
                                <span className="text-gray-700">v1.4.2</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Environment</span>
                                <span className="text-gray-700">Production</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">SSL</span>
                                <span className="text-gray-700">Enabled</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MFA Modal */}
            {showMFAModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
                        <MFASetup
                            onComplete={() => {
                                setShowMFAModal(false);
                                fetchProfile();
                            }}
                            onCancel={() => setShowMFAModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Toggle Switch Component
const ToggleSwitch = ({ icon, title, description, value, onChange, compact }: any) => (
    <div
        onClick={onChange}
        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${value ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:border-gray-300'}`}
    >
        <div className={`p-2 rounded-lg transition-all ${value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
            {icon}
        </div>
        <div className="flex-1">
            <h4 className={`text-sm font-medium ${value ? 'text-gray-900' : 'text-gray-700'}`}>{title}</h4>
            {!compact && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
        <div className={`shrink-0 w-10 h-5 rounded-full relative transition-colors ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${value ? 'right-1' : 'left-1'}`} />
        </div>
    </div>
);

export default Settings;