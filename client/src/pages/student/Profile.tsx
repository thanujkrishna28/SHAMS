import { useState } from 'react';
import { Mail, Phone, Edit2, Shield, AlertTriangle, FileText, CheckCircle2, X, Home, BookOpen, User as UserIcon, MapPin } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/api/axios';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user, fetchProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [uploading, setUploading] = useState<'idProof' | 'admissionLetter' | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        studentId: user?.profile?.studentId || '',
        course: user?.profile?.course || '',
        year: user?.profile?.year || '',
        guardianName: user?.profile?.guardianName || '',
        guardianContact: user?.profile?.guardianContact || '',
        address: user?.profile?.address || '',
    });

    // Use user.profile.room as the primary source of truth for current room
    const room: any = user?.profile?.room;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'idProof' | 'admissionLetter') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(type);
        try {
            // 1. Upload File
            const { data: filePath } = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // 2. Update Profile with File Path
            await api.put('/auth/profile', {
                [type]: filePath
            });

            toast.success(`${type === 'idProof' ? 'ID Proof' : 'Admission Letter'} uploaded successfully!`);
            fetchProfile(); // Refresh
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Upload failed');
        } finally {
            setUploading(null);
        }
    };

    const handleSaveProfile = async () => {
        try {
            await api.put('/auth/profile', {
                ...formData
            });
            toast.success('Profile updated successfully!');
            setIsEditing(false);
            fetchProfile();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="relative mb-24 md:mb-20">
                {/* Cover Image */}
                <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl shadow-lg overflow-hidden relative">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-20"></div>
                </div>

                {/* Profile Card Overlay */}
                <div className="absolute -bottom-20 left-4 md:left-8 flex flex-col md:flex-row items-center md:items-end gap-6 w-full md:w-auto">
                    <div className="w-32 h-32 rounded-2xl bg-white p-1 shadow-xl relative group">
                        <img
                            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random&size=128`}
                            alt="Profile"
                            className="w-full h-full object-cover rounded-xl bg-gray-100"
                        />
                    </div>
                    <div className="pb-4 text-center md:text-left">
                        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                            {user?.profile?.isVerified ? (
                                <span className="px-2 py-0.5 bg-emerald-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-emerald-400/50 flex items-center gap-1 shadow-sm">
                                    <CheckCircle2 size={12} />
                                    VERIFIED
                                </span>
                            ) : (
                                <span className="px-2 py-0.5 bg-amber-500/90 text-white text-xs font-bold rounded-full backdrop-blur-sm border border-amber-400/50 flex items-center gap-1 shadow-sm">
                                    <AlertTriangle size={12} />
                                    UNVERIFIED
                                </span>
                            )}
                        </div>
                        <p className="text-gray-500 font-medium">{user?.email}</p>
                    </div>
                </div>

                <div className="absolute top-4 right-4 md:-bottom-12 md:top-auto md:right-8">
                    <button
                        onClick={() => {
                            setFormData({
                                studentId: user?.profile?.studentId || '',
                                course: user?.profile?.course || '',
                                year: user?.profile?.year || '',
                                guardianName: user?.profile?.guardianName || '',
                                guardianContact: user?.profile?.guardianContact || '',
                                address: user?.profile?.address || '',
                            });
                            setIsEditing(true);
                        }}
                        className="px-4 py-2 bg-white text-gray-700 font-medium rounded-xl shadow-md hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm border border-gray-100"
                    >
                        <Edit2 size={16} />
                        Edit Profile
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
                {/* Left Column - Contact Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <UserIcon size={18} className="text-indigo-500" />
                            Contact Information
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Mail size={16} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Email</p>
                                    <p className="text-sm font-medium truncate" title={user?.email}>{user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <Phone size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Guardian</p>
                                    <p className="text-sm font-medium">{user?.profile?.guardianName || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{user?.profile?.guardianContact || 'No Contact'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                    <MapPin size={16} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Address</p>
                                    <p className="text-sm font-medium line-clamp-2">{user?.profile?.address || 'Not Updated'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Home size={16} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Room</p>
                                    <p className="text-sm font-medium">{room ? `${room.block}-${room.roomNumber}` : 'Not Allocated'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield size={100} />
                        </div>
                        <h3 className="font-bold text-lg mb-2 relative z-10">Verification Status</h3>
                        <p className="text-blue-100 text-sm mb-4 relative z-10">
                            Upload required documents to get the Verified Badge and priority support.
                        </p>

                        <div className="space-y-3 relative z-10">
                            {/* ID Proof Upload */}
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${user?.profile?.idProof ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-blue-300'}`}>
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">ID Proof</span>
                                        {user?.profile?.idProof && <span className="text-[10px] text-emerald-300">Uploaded</span>}
                                    </div>
                                </div>
                                {user?.profile?.idProof ? (
                                    <a
                                        href={user.profile.idProof.startsWith('http') ? user.profile.idProof : `http://${window.location.hostname}:5000${user.profile.idProof}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                                    >
                                        View
                                    </a>
                                ) : (
                                    <label className="cursor-pointer text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1">
                                        {uploading === 'idProof' ? '...' : 'Upload'}
                                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'idProof')} disabled={!!uploading} />
                                    </label>
                                )}
                            </div>

                            {/* Admission Letter Upload */}
                            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/10 transition-all hover:bg-white/20">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-full ${user?.profile?.admissionLetter ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-blue-300'}`}>
                                        <FileText size={16} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Admission Letter</span>
                                        {user?.profile?.admissionLetter && <span className="text-[10px] text-emerald-300">Uploaded</span>}
                                    </div>
                                </div>
                                {user?.profile?.admissionLetter ? (
                                    <a
                                        href={user.profile.admissionLetter.startsWith('http') ? user.profile.admissionLetter : `http://${window.location.hostname}:5000${user.profile.admissionLetter}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10"
                                    >
                                        View
                                    </a>
                                ) : (
                                    <label className="cursor-pointer text-xs px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-1">
                                        {uploading === 'admissionLetter' ? '...' : 'Upload'}
                                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileUpload(e, 'admissionLetter')} disabled={!!uploading} />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    {/* Digital ID Card Section */}
                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                            <Shield size={180} />
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="bg-white p-3 rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-300">
                                <QRCode
                                    value={user?._id || 'unregistered'}
                                    size={140}
                                    level="M"
                                    className="w-32 h-32"
                                />
                            </div>

                            <div className="flex-1 space-y-4 text-center md:text-left">
                                <div>
                                    <h3 className="text-2xl font-bold tracking-tight">University ID Card</h3>
                                    <p className="text-slate-400 font-medium">Valid for Academic Year 2024-25</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider mb-1">Name</p>
                                        <p className="font-semibold text-lg">{user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider mb-1">ID Number</p>
                                        <p className="font-mono text-lg tracking-wider text-emerald-400">{user?.profile?.studentId || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider mb-1">Course</p>
                                        <p className="font-medium">{user?.profile?.course || 'Not Set'}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500 uppercase text-xs font-bold tracking-wider mb-1">Pass Status</p>
                                        <span className={`inline-flex items-center gap-1 font-bold ${user?.profile?.isInside !== false ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${user?.profile?.isInside !== false ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                                            {user?.profile?.isInside !== false ? 'Active' : 'Checkout'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen size={20} className="text-indigo-500" />
                            Academic Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Student ID</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-900">
                                    {user?.profile?.studentId || 'N/A'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Course / Branch</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-900">
                                    {user?.profile?.course || 'Not Set'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Year of Study</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 font-medium text-gray-900">
                                    {user?.profile?.year ? `${user.profile.year}${user.profile.year === 1 ? 'st' : user.profile.year === 2 ? 'nd' : user.profile.year === 3 ? 'rd' : 'th'} Year` : 'Not Set'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Status</label>
                                <div className={`p-3 rounded-xl border font-medium flex items-center gap-2 ${user?.profile?.isInside !== false ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                    <div className={`w-2 h-2 rounded-full ${user?.profile?.isInside !== false ? 'bg-green-500' : 'bg-amber-500'}`} />
                                    {user?.profile?.isInside !== false ? 'Inside Campus' : 'Outside Campus'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
                                {/* Read Only Fields */}
                                <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                                    <div className="flex items-center gap-2 text-amber-600 mb-2">
                                        <AlertTriangle size={14} />
                                        <span className="font-bold text-xs uppercase">Read Only Fields</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                            <input type="text" value={user?.name} disabled className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                                            <input type="text" value={user?.email} disabled className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-gray-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID No.</label>
                                        <input
                                            type="text"
                                            name="studentId"
                                            value={formData.studentId}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 21BCE0001"
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Course / Branch</label>
                                            <input
                                                type="text"
                                                name="course"
                                                value={formData.course}
                                                onChange={handleInputChange}
                                                placeholder="e.g. B.Tech CSE"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                                            <input
                                                type="number"
                                                name="year"
                                                value={formData.year}
                                                onChange={handleInputChange}
                                                placeholder="1-4"
                                                min="1"
                                                max="5"
                                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 mt-4">Guardian Details</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Name</label>
                                                <input
                                                    type="text"
                                                    name="guardianName"
                                                    value={formData.guardianName}
                                                    onChange={handleInputChange}
                                                    placeholder="Parent/Guardian Name"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                                                <input
                                                    type="tel"
                                                    name="guardianContact"
                                                    value={formData.guardianContact}
                                                    onChange={handleInputChange}
                                                    placeholder="Emergency Contact"
                                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="Enter your permanent address..."
                                            rows={3}
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Profile;
