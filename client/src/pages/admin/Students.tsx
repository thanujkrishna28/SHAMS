import { useState } from 'react';
import {
    Search, Mail, Phone, CheckCircle, X, ExternalLink,
    FileText, AlertCircle, Users, Building, MapPin, Loader2, Eye, Filter, RefreshCw,
    Download, ShieldCheck, GraduationCap
} from 'lucide-react';
import { useAllStudents, useVerifyStudent } from '@/hooks/useAdmin';
import toast from 'react-hot-toast';
import { getImageUrl } from '@/utils/imageUtils';

const Students = () => {
    const [page, setPage] = useState(1);
    const { data: students, isLoading, refetch } = useAllStudents(page);
    const { mutate: verifyStudent, isPending: verifying } = useVerifyStudent();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [filterVerified, setFilterVerified] = useState('ALL');
    const [filterCourse, setFilterCourse] = useState('ALL');

    const handleVerify = (id: string) => {
        verifyStudent(id, {
            onSuccess: () => {
                toast.success('Student verified successfully');
                setSelectedStudent(null);
                refetch();
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to verify student');
            }
        });
    };

    const filteredStudents = students?.data?.filter((student: any) =>
        (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (filterVerified === 'ALL' || (filterVerified === 'VERIFIED' ? student.profile?.isVerified : !student.profile?.isVerified)) &&
        (filterCourse === 'ALL' || student.profile?.course === filterCourse)
    );

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Loading students...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Student Directory</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage student records and verifications</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => refetch()}
                            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={16} />
                        </button>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, ID or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Total Students</p>
                            <p className="text-xl font-bold text-gray-900">{students?.meta?.total || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <ShieldCheck size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Verified</p>
                            <p className="text-xl font-bold text-gray-900">{students?.data?.filter((s: any) => s.profile?.isVerified).length || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <AlertCircle size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Pending</p>
                            <p className="text-xl font-bold text-gray-900">{students?.data?.filter((s: any) => !s.profile?.isVerified).length || 0}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Building size={18} className="text-purple-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Housed</p>
                            <p className="text-xl font-bold text-gray-900">{Math.round(((students?.data?.filter((s: any) => s.profile?.roomNumber).length || 0) / (students?.meta?.total || 1)) * 100)}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-gray-400" />
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterVerified}
                            onChange={(e) => setFilterVerified(e.target.value)}
                        >
                            <option value="ALL">All Status</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="PENDING">Pending</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <GraduationCap size={16} className="text-gray-400" />
                        <select
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={filterCourse}
                            onChange={(e) => setFilterCourse(e.target.value)}
                        >
                            <option value="ALL">All Courses</option>
                            <option value="B.Tech">B.Tech</option>
                            <option value="M.Tech">M.Tech</option>
                            <option value="MBA">MBA</option>
                        </select>
                    </div>

                    <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        {filteredStudents?.length || 0} students
                    </span>
                </div>
            </div>

            {/* Students Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredStudents?.length > 0 ? (
                                filteredStudents.map((student: any) => (
                                    <tr
                                        key={student._id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setSelectedStudent(student)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold overflow-hidden">
                                                    {student.profile?.profileImage ? (
                                                        <img src={getImageUrl(student.profile.profileImage)} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{student.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{student.name}</p>
                                                    <p className="text-xs text-gray-500">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-700">{student.profile?.course || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{student.profile?.studentId || 'N/A'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {student.profile?.isVerified ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700">
                                                    <ShieldCheck size={12} />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-700">
                                                    <AlertCircle size={12} />
                                                    Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Search size={32} className="text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500">No students found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {students?.meta?.page || 1} of {students?.meta?.pages || 1}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={!students || page >= (students.meta?.pages || 1)}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50 sticky top-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <ShieldCheck size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-gray-900">Student Details</h2>
                                    <p className="text-xs text-gray-500">Complete profile information</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg">
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                                <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 font-semibold overflow-hidden">
                                    {selectedStudent.profile?.profileImage ? (
                                        <img src={getImageUrl(selectedStudent.profile.profileImage)} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                        <span className="text-2xl">{selectedStudent.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h3>
                                    <p className="text-sm text-gray-500">ID: {selectedStudent._id.slice(-8)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Mail size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Email</p>
                                        <p className="text-sm text-gray-900">{selectedStudent.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Phone size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Phone</p>
                                        <p className="text-sm text-gray-900">{selectedStudent.profile?.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <GraduationCap size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Course & Year</p>
                                        <p className="text-sm text-gray-900">{selectedStudent.profile?.course || 'N/A'} • Year {selectedStudent.profile?.year || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Building size={16} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500">Room Number</p>
                                        <p className="text-sm text-gray-900">{selectedStudent.profile?.roomNumber || 'Not allocated'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Documents */}
                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documents</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-700">ID Proof</span>
                                        {selectedStudent.profile?.idProof ? (
                                            <a
                                                href={selectedStudent.profile.idProof}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download size={16} />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <span className="text-sm text-gray-700">Admission Letter</span>
                                        {selectedStudent.profile?.admissionLetter ? (
                                            <a
                                                href={selectedStudent.profile.admissionLetter}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download size={16} />
                                            </a>
                                        ) : (
                                            <span className="text-xs text-gray-400">Not uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Verification Action */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                {!selectedStudent.profile?.isVerified ? (
                                    <button
                                        onClick={() => handleVerify(selectedStudent._id)}
                                        disabled={verifying}
                                        className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {verifying ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                                        Verify Student
                                    </button>
                                ) : (
                                    <div className="p-4 bg-green-50 rounded-lg text-center">
                                        <ShieldCheck size={20} className="text-green-600 mx-auto mb-2" />
                                        <p className="text-sm font-medium text-green-700">Student Verified</p>
                                        <p className="text-xs text-green-600">Full access granted</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Students;