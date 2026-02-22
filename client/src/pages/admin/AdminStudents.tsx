import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, CheckCircle, X, ExternalLink, FileText, AlertCircle, Users } from 'lucide-react';
import { useAllStudents, useVerifyStudent } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';

const AdminStudents = () => {
    const [page, setPage] = useState(1);
    const { data: students, isLoading } = useAllStudents(page);
    const { mutate: verifyStudent, isPending: verifying } = useVerifyStudent();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [filterVerified, setFilterVerified] = useState('ALL');
    const [filterCourse, setFilterCourse] = useState('ALL');

    const filteredStudents = students?.data?.filter((student: any) =>
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterRole === 'all' || student.role === filterRole) &&
        (filterVerified === 'ALL' || (filterVerified === 'VERIFIED' ? student.profile?.isVerified : !student.profile?.isVerified)) &&
        (filterCourse === 'ALL' || student.profile?.course === filterCourse)
    );

    const handleVerify = (id: string) => {
        verifyStudent(id, {
            onSuccess: () => {
                toast.success('Student verified successfully');
                setSelectedStudent(null);
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Verification failed');
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 animate-in fade-in duration-500"
        >
            {/* Professional Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Student Roster</h1>
                    <p className="text-gray-500 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        Verify identities and manage student database
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                    <div className="relative group flex-1 sm:flex-none">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-full sm:w-80 shadow-sm transition-all text-sm font-medium"
                        />
                    </div>
                </div>
            </div>

            {/* Student Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Users size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900">{students?.meta?.total || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Verified</span>
                    </div>
                    <p className="text-3xl font-black text-emerald-600">{students?.data?.filter((s: any) => s.profile?.isVerified).length || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <AlertCircle size={24} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Pending</span>
                    </div>
                    <p className="text-3xl font-black text-amber-600">{students?.data?.filter((s: any) => !s.profile?.isVerified).length || 0}</p>
                </div>
                <div className="bg-slate-900 p-6 rounded-[32px] shadow-xl shadow-slate-200 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 text-white rounded-2xl">
                            <FileText size={24} />
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Today</span>
                    </div>
                    <p className="text-3xl font-black">2</p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-4 bg-white/50 p-2 rounded-[24px] border border-gray-100/50">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-indigo-200">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Status</span>
                    <select
                        className="bg-transparent outline-none font-bold text-xs uppercase cursor-pointer"
                        value={filterVerified}
                        onChange={(e) => setFilterVerified(e.target.value)}
                    >
                        <option value="ALL">All Profiles</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="PENDING">Pending Approval</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:border-indigo-200">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Track</span>
                    <select
                        className="bg-transparent outline-none font-bold text-xs uppercase cursor-pointer"
                        value={filterCourse}
                        onChange={(e) => setFilterCourse(e.target.value)}
                    >
                        <option value="ALL">All Courses</option>
                        <option value="B.Tech">B.Tech Specialists</option>
                        <option value="M.Tech">M.Tech Scholars</option>
                        <option value="MBA">MBA Leaders</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 ml-auto pr-4 text-[10px] font-black text-gray-400 uppercase tracking-widest lg:flex hidden">
                    <Users size={14} />
                    {filteredStudents?.length || 0} Records Found
                </div>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Student Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Contact Repository</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">Academic Track</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-center">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredStudents?.length > 0 ? (
                                filteredStudents.map((student: any) => (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-lg border border-indigo-100 group-hover:scale-110 transition-transform overflow-hidden shadow-sm">
                                                    {student.profile?.profileImage ? (
                                                        <img
                                                            src={getImageUrl(student.profile.profileImage, student.name)}
                                                            alt={student.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{student.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-900 leading-tight">{student.name}</div>
                                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">ID: {student.profile?.studentId || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                        <Mail size={12} />
                                                    </div>
                                                    {student.email}
                                                </div>
                                                <div className="flex items-center gap-2.5 text-sm font-medium text-slate-600">
                                                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                                        <Phone size={12} />
                                                    </div>
                                                    {student.profile?.guardianContact || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-slate-700">{student.profile?.course || 'Not Enrolled'}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year {student.profile?.year || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {student.profile?.isVerified ? (
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 shadow-sm animate-pulse">
                                                    <AlertCircle size={12} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="inline-flex items-center gap-2 bg-white text-slate-700 hover:bg-slate-900 hover:text-white font-black text-[10px] uppercase tracking-widest border border-gray-200 px-5 py-2.5 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95"
                                            >
                                                <ExternalLink size={14} />
                                                Dossier
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                            <Search size={40} />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">No students found</h3>
                                        <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-xs text-gray-500">Page {students?.meta?.page || 1} of {students?.meta?.pages || 1}</span>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={!students || page >= (students.meta?.pages || 1)}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Verification Modal */}
            <AnimatePresence>
                {selectedStudent && (
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
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Verify Student</h2>
                                    <p className="text-xs text-gray-500">{selectedStudent.name}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Documents Section */}
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                        <FileText size={16} className="text-indigo-500" />
                                        Submitted Documents
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-sm font-medium text-gray-700">ID Proof</span>
                                            {selectedStudent.profile?.idProof ? (
                                                <a
                                                    href={`http://${window.location.hostname}:5000${selectedStudent.profile.idProof}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                                                >
                                                    View Document <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="text-sm font-medium text-gray-700">Admission Letter</span>
                                            {selectedStudent.profile?.admissionLetter ? (
                                                <a
                                                    href={`http://${window.location.hostname}:5000${selectedStudent.profile.admissionLetter}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                                                >
                                                    View Document <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">Not Uploaded</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100">
                                    <p><strong>Note:</strong> Verify that the documents match the student's details before approving.</p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                                {selectedStudent.profile?.isVerified ? (
                                    <button
                                        disabled
                                        className="px-6 py-2 bg-green-100 text-green-700 font-bold rounded-xl text-sm flex items-center gap-2 cursor-not-allowed"
                                    >
                                        <CheckCircle size={16} /> Verified
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleVerify(selectedStudent._id)}
                                        disabled={verifying}
                                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 transition-all text-sm flex items-center gap-2 disabled:opacity-70"
                                    >
                                        {verifying ? 'Verifying...' : 'Approve & Verify'}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminStudents;
