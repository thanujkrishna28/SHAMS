import { useState } from 'react';
import {
    Phone, Edit2, Shield, AlertTriangle, FileText, CheckCircle2, X,
    Home, BookOpen, User as UserIcon, MapPin, Users, Smartphone,
    Fingerprint, Mail, CreditCard, Lock, BadgeCheck, GraduationCap,
    Heart, Camera, Calendar, Award, Clock, Sparkles, TrendingUp,
    ChevronRight, Globe, Linkedin, Github, Twitter, Download, Share2,
    Activity
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';
import MFASetup from '@/components/auth/MFASetup';

import { Room } from '@/types';

const Profile = () => {
    const { user, fetchProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState<'idProof' | 'admissionLetter' | 'profileImage' | null>(null);
    const [showMFAModal, setShowMFAModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'security'>('overview');

    const [formData, setFormData] = useState({
        studentId: user?.profile?.studentId || '',
        course: user?.profile?.course || '',
        branch: user?.profile?.branch || '',
        year: user?.profile?.year || '',
        guardianName: user?.profile?.guardianName || '',
        relation: user?.profile?.relation || '',
        guardianContact: user?.profile?.guardianContact || '',
        guardianContact2: user?.profile?.guardianContact2 || '',
        address: user?.profile?.address || '',
        phone: user?.profile?.phone || '',
        age: user?.profile?.age || '',
        applicationNum: user?.profile?.applicationNum || '',
        aadharNum: user?.profile?.aadharNum || '',
    });

    const room = user?.profile?.room as unknown as Room;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'idProof' | 'admissionLetter' | 'profileImage') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size too large. Maximum limit is 5MB.');
            return;
        }

        if (type === 'profileImage') {
            const lastUpdate = user?.profile?.lastProfileUpdate;
            if (lastUpdate) {
                const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
                const timeSinceLastUpdate = Date.now() - new Date(lastUpdate).getTime();
                if (timeSinceLastUpdate < thirtyDaysInMs) {
                    const daysRemaining = Math.ceil((thirtyDaysInMs - timeSinceLastUpdate) / (1000 * 60 * 60 * 24));
                    toast.error(`Profile picture can only be updated once a month. Try again in ${daysRemaining} days.`);
                    return;
                }
            }
        }

        const formData = new FormData();
        formData.append('file', file);
        setUploading(type);

        try {
            const { data: filePath } = await api.post('/upload', formData);
            await api.put('/auth/profile', { [type]: filePath });
            toast.success(`${type === 'idProof' ? 'ID Proof' : type === 'admissionLetter' ? 'Admission Letter' : 'Profile Photo'} updated successfully!`);
            fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(null);
        }
    };

    const handleRemoveFile = async (type: 'idProof' | 'admissionLetter') => {
        if (!window.confirm(`Remove your ${type === 'idProof' ? 'ID Proof' : 'Admission Letter'}?`)) return;
        try {
            await api.put('/auth/profile', { [type]: null });
            toast.success('Document removed');
            fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to remove');
        }
    };

    const handleSaveProfile = async () => {
        try {
            await api.put('/auth/profile', { ...formData });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const verificationProgress = [
        !!user?.profile?.idProof,
        !!user?.profile?.admissionLetter,
        !!user?.profile?.profileImage,
    ].filter(Boolean).length;

    const completionPercentage = (verificationProgress / 3) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl" />
                    <div className="relative bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-500/5 to-teal-500/5 rounded-full blur-2xl" />

                        <div className="relative p-6 sm:p-8">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative group">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5">
                                            <div className="w-full h-full rounded-2xl overflow-hidden bg-white">
                                                <img
                                                    src={getImageUrl(user?.profile?.profileImage)}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </div>
                                        <label className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:shadow-lg transition-all">
                                            <Camera size={12} className="text-indigo-600" />
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'profileImage')} disabled={!!uploading} />
                                        </label>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{user?.name}</h1>
                                            {user?.profile?.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">
                                                    <CheckCircle2 size={10} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium border border-amber-200">
                                                    <Clock size={10} /> Pending
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-sm mt-1">{user?.email}</p>
                                        <p className="text-xs text-slate-400 mt-1">Member since {new Date(user?.createdAt || Date.now()).getFullYear()}</p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                                    >
                                        <Edit2 size={16} />
                                        Edit Profile
                                    </button>
                                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
                                        <Share2 size={16} />
                                        Share
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-t border-slate-100 px-6 sm:px-8">
                            <div className="flex gap-6 -mb-px">
                                {['overview', 'academic', 'security'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab as any)}
                                        className={`py-3 text-sm font-medium transition-all relative ${activeTab === tab
                                                ? 'text-indigo-600'
                                                : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        {activeTab === tab && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Left Column */}
                            <div className="space-y-6">
                                {/* Contact Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="p-2 bg-indigo-50 rounded-xl">
                                            <UserIcon size={16} className="text-indigo-600" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900">Contact Information</h3>
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { icon: Phone, label: "Phone", value: user?.profile?.phone || "Not provided" },
                                            { icon: Mail, label: "Email", value: user?.email },
                                            { icon: MapPin, label: "Address", value: user?.profile?.address || "Not provided" },
                                            { icon: Home, label: "Residence", value: room ? `Room ${room.roomNumber}, ${typeof room.block === 'object' ? room.block.name : room.block}` : "Not allocated" },
                                        ].map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3">
                                                <div className="p-1.5 bg-slate-50 rounded-lg shrink-0">
                                                    <item.icon size={14} className="text-slate-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                                                    <p className="text-sm text-slate-700 mt-0.5">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Guardian Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-2 mb-5">
                                        <div className="p-2 bg-indigo-50 rounded-xl">
                                            <Heart size={16} className="text-indigo-600" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900">Guardian Details</h3>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Name</p>
                                            <p className="text-sm font-medium text-slate-900 mt-0.5">{user?.profile?.guardianName || "Not provided"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Relation</p>
                                            <p className="text-sm text-slate-700 mt-0.5">{user?.profile?.relation || "Not specified"}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Contact Numbers</p>
                                            <p className="text-sm text-slate-700 mt-0.5">{user?.profile?.guardianContact || "Not provided"}</p>
                                            {user?.profile?.guardianContact2 && (
                                                <p className="text-sm text-slate-500 mt-1">{user?.profile?.guardianContact2}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column - Stats and Status */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Verification Progress */}
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <Sparkles size={18} />
                                            <h3 className="font-semibold">Profile Completion</h3>
                                        </div>
                                        <span className="text-2xl font-bold">{Math.round(completionPercentage)}%</span>
                                    </div>
                                    <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-4">
                                        <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className={`text-xs font-medium ${user?.profile?.idProof ? 'text-white' : 'text-white/60'}`}>
                                                {user?.profile?.idProof ? '✓' : '○'} ID Proof
                                            </div>
                                        </div>
                                        <div>
                                            <div className={`text-xs font-medium ${user?.profile?.admissionLetter ? 'text-white' : 'text-white/60'}`}>
                                                {user?.profile?.admissionLetter ? '✓' : '○'} Admission Letter
                                            </div>
                                        </div>
                                        <div>
                                            <div className={`text-xs font-medium ${user?.profile?.profileImage ? 'text-white' : 'text-white/60'}`}>
                                                {user?.profile?.profileImage ? '✓' : '○'} Profile Photo
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {[
                                        { label: "Documents", value: `${verificationProgress}/3`, icon: FileText, color: "bg-blue-50 text-blue-600" },
                                        { label: "Courses", value: user?.profile?.course?.split(',')[0] || "N/A", icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
                                        { label: "Attendance", value: `${user?.profile?.attendancePercentage || 0}%`, icon: TrendingUp, color: "bg-purple-50 text-purple-600" },
                                        { label: "Status", value: user?.profile?.isInside !== false ? "Active" : "Away", icon: Activity, color: "bg-amber-50 text-amber-600" },
                                    ].map((stat, idx) => (
                                        <div key={idx} className="bg-white rounded-xl border border-slate-100 p-4 text-center hover:shadow-md transition-shadow">
                                            <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                                                <stat.icon size={14} />
                                            </div>
                                            <p className="text-lg font-bold text-slate-900">{stat.value}</p>
                                            <p className="text-[10px] text-slate-400">{stat.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Documents Card */}
                                <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-indigo-50 rounded-xl">
                                                <FileText size={16} className="text-indigo-600" />
                                            </div>
                                            <h3 className="font-semibold text-slate-900">Uploaded Documents</h3>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <CreditCard size={16} className="text-slate-400" />
                                                <span className="text-sm text-slate-700">ID Proof</span>
                                            </div>
                                            {user?.profile?.idProof ? (
                                                <div className="flex items-center gap-3">
                                                    <a href={user.profile.idProof} target="_blank" className="text-xs text-indigo-600 hover:underline">View</a>
                                                    {!user?.profile?.isVerified && (
                                                        <button onClick={() => handleRemoveFile('idProof')} className="text-xs text-red-500">Remove</button>
                                                    )}
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer text-xs text-indigo-600 font-medium hover:underline">
                                                    {uploading === 'idProof' ? 'Uploading...' : 'Upload'}
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'idProof')} />
                                                </label>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <FileText size={16} className="text-slate-400" />
                                                <span className="text-sm text-slate-700">Admission Letter</span>
                                            </div>
                                            {user?.profile?.admissionLetter ? (
                                                <div className="flex items-center gap-3">
                                                    <a href={user.profile.admissionLetter} target="_blank" className="text-xs text-indigo-600 hover:underline">View</a>
                                                    {!user?.profile?.isVerified && (
                                                        <button onClick={() => handleRemoveFile('admissionLetter')} className="text-xs text-red-500">Remove</button>
                                                    )}
                                                </div>
                                            ) : (
                                                <label className="cursor-pointer text-xs text-indigo-600 font-medium hover:underline">
                                                    {uploading === 'admissionLetter' ? 'Uploading...' : 'Upload'}
                                                    <input type="file" className="hidden" onChange={(e) => handleFileUpload(e, 'admissionLetter')} />
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Campus Status */}
                                <div className={`p-4 rounded-xl flex items-center gap-3 ${user?.profile?.isInside !== false
                                        ? 'bg-emerald-50 border border-emerald-100'
                                        : 'bg-amber-50 border border-amber-100'
                                    }`}>
                                    <div className={`w-2.5 h-2.5 rounded-full ${user?.profile?.isInside !== false ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                                    <span className="text-sm font-medium text-slate-800">
                                        {user?.profile?.isInside !== false ? '✅ Currently Inside Campus' : '📍 Currently Outside Campus'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'academic' && (
                        <motion.div
                            key="academic"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <GraduationCap size={18} className="text-indigo-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Academic Information</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { label: "Student ID", value: user?.profile?.studentId || "N/A", icon: CreditCard },
                                    { label: "Application Number", value: user?.profile?.applicationNum || "N/A", icon: FileText },
                                    { label: "Course", value: user?.profile?.course || "Not set", icon: BookOpen },
                                    { label: "Branch", value: user?.profile?.branch || "Not set", icon: Globe },
                                    { label: "Year of Study", value: user?.profile?.year ? `${user.profile.year}${['st', 'nd', 'rd', 'th'][(user.profile.year - 1) % 4] || 'th'} Year` : "Not set", icon: Calendar },
                                    { label: "Age", value: user?.profile?.age || "Not set", icon: UserIcon },
                                    { label: "Aadhar Number", value: user?.profile?.aadharNum ? `XXXX XXXX ${user.profile.aadharNum.slice(-4)}` : "Not provided", icon: CreditCard },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <item.icon size={14} className="text-indigo-500" />
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{item.label}</p>
                                        </div>
                                        <p className="text-sm font-medium text-slate-900">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Security Settings */}
                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-5">
                                    <div className="p-2 bg-indigo-50 rounded-xl">
                                        <Shield size={16} className="text-indigo-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Security Settings</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Lock size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Two-Factor Authentication</p>
                                                <p className="text-xs text-slate-500">Secure your account with 2FA</p>
                                            </div>
                                        </div>
                                        {user?.isMFAEnabled ? (
                                            <span className="text-xs text-emerald-600 font-medium">✓ Enabled</span>
                                        ) : (
                                            <button onClick={() => setShowMFAModal(true)} className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                                                Enable
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Fingerprint size={16} className="text-slate-400" />
                                            <div>
                                                <p className="text-sm font-medium text-slate-900">Biometric Login</p>
                                                <p className="text-xs text-slate-500">Use fingerprint or face recognition</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={async () => {
                                                try {
                                                    toast.loading('Setting up biometrics...', { id: 'bio' });
                                                    await useAuthStore.getState().startWebAuthnRegistration();
                                                    toast.success('Biometric login enabled!', { id: 'bio' });
                                                    fetchProfile();
                                                } catch (err: any) {
                                                    toast.error(err.message || 'Setup failed', { id: 'bio' });
                                                }
                                            }}
                                            className="px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                            {user?.profile?.webauthnCredentials?.length ? 'Add Device' : 'Set Up'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Digital ID Card */}
                            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <BadgeCheck size={20} />
                                        <h3 className="font-semibold">Digital Identity Card</h3>
                                    </div>
                                    <button className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                                        <Download size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="bg-white p-3 rounded-xl shadow-md">
                                        <QRCode value={user?._id || 'unregistered'} size={100} level="M" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <p className="text-xl font-bold">{user?.name}</p>
                                        <p className="text-sm text-white/80 mt-1">ID: {user?.profile?.studentId || 'N/A'}</p>
                                        <p className="text-sm text-white/80">{user?.profile?.course || 'N/A'} • {user?.profile?.year ? `${user.profile.year} Year` : 'N/A'}</p>
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 pt-3 border-t border-white/20">
                                            <Calendar size={12} className="text-white/60" />
                                            <span className="text-xs text-white/60">Valid till: 2025</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Modal - Keep existing */}
                <AnimatePresence>
                    {isEditing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setIsEditing(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                                    <h2 className="text-xl font-semibold text-slate-900">Edit Profile</h2>
                                    <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-3">Information Locked for Security</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div><label className="block text-xs font-medium text-slate-500 mb-1">Full Name</label><input type="text" value={user?.name} disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm" /></div>
                                            <div><label className="block text-xs font-medium text-slate-500 mb-1">Email</label><input type="text" value={user?.email} disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm" /></div>
                                            <div><label className="block text-xs font-medium text-slate-500 mb-1">Phone</label><input type="text" value={user?.profile?.phone} disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm" /></div>
                                            <div><label className="block text-xs font-medium text-slate-500 mb-1">Student ID</label><input type="text" value={user?.profile?.studentId} disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm font-mono" /></div>
                                            <div><label className="block text-xs font-medium text-slate-500 mb-1">Guardian Name</label><input type="text" value={user?.profile?.guardianName} disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm" /></div>
                                            <div><label className="block text-xs font-medium text-slate-500 mb-1">Guardian Contact</label><input type="text" value={user?.profile?.guardianContact} disabled className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm" /></div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div><label className="block text-xs font-medium text-slate-700 mb-1">Age</label><input type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div><label className="block text-xs font-medium text-slate-700 mb-1">Course</label><input type="text" name="course" value={formData.course} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div><label className="block text-xs font-medium text-slate-700 mb-1">Branch</label><input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div><label className="block text-xs font-medium text-slate-700 mb-1">Year</label><select name="year" value={formData.year} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"><option value="">Select</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select></div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Aadhar Number</label><input type="text" name="aadharNum" value={formData.aadharNum} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Application Number</label><input type="text" name="applicationNum" value={formData.applicationNum} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Relation with Guardian</label><input type="text" name="relation" value={formData.relation} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Alternate Contact</label><input type="tel" name="guardianContact2" value={formData.guardianContact2} onChange={handleInputChange} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" /></div>
                                        <div className="sm:col-span-2"><label className="block text-xs font-medium text-slate-700 mb-1">Address</label><textarea name="address" value={formData.address} onChange={handleInputChange} rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none" /></div>
                                    </div>
                                </div>

                                <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-3">
                                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Cancel</button>
                                    <button onClick={handleSaveProfile} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">Save Changes</button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MFA Modal */}
                <AnimatePresence>
                    {showMFAModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setShowMFAModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MFASetup onComplete={() => { setShowMFAModal(false); fetchProfile(); }} onCancel={() => setShowMFAModal(false)} />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Profile;