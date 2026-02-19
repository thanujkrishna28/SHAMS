import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Mail, Phone, CheckCircle, X, ExternalLink, FileText, AlertCircle } from 'lucide-react';
import { useAllStudents, useVerifyStudent } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';

const AdminStudents = () => {
    const [page, setPage] = useState(1);
    const { data: students, isLoading } = useAllStudents(page);
    const { mutate: verifyStudent, isPending: verifying } = useVerifyStudent();
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole] = useState('all');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);

    const filteredStudents = students?.data?.filter((student: any) =>
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterRole === 'all' || student.role === filterRole)
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
            className="space-y-6"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and verify student profiles</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search students..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-full sm:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">Contact Info</th>
                                <th className="px-6 py-4">Details</th>
                                <th className="px-6 py-4 text-center">Verification</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents?.length > 0 ? (
                                filteredStudents.map((student: any) => (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {student.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{student.name}</div>
                                                    <div className="text-xs text-gray-500">ID: {student.profile?.studentId || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Mail size={14} className="text-gray-400" />
                                                    {student.email}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {student.profile?.guardianContact || 'N/A'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-600">
                                                <p>{student.profile?.course || 'No Course'}</p>
                                                <p className="text-xs text-gray-400">Year: {student.profile?.year || '-'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {student.profile?.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                                    <CheckCircle size={12} /> Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                                                    <AlertCircle size={12} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedStudent(student)}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium text-xs border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm">
                                        No students found matching your search.
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
