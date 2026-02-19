import { useState } from 'react';
import { useAllFees } from '@/hooks/useFees';
import { useAllStudents } from '@/hooks/useAdmin';
import { Plus, Search, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import api from '@/api/axios';

const AdminFees = () => {
    const { data: fees, isLoading, refetch } = useAllFees();
    const { data: studentsData } = useAllStudents();
    const students = studentsData?.data || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    interface FeeFormValues {
        targetGroup: 'individual' | 'all' | 'verified' | 'pending';
        studentId?: string;
        title: string;
        amount: number;
        type: string;
        dueDate: string;
        description?: string;
    }

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FeeFormValues>({
        defaultValues: {
            targetGroup: 'individual'
        }
    });

    const targetGroupValue = watch('targetGroup');

    const onSubmit = async (data: FeeFormValues) => {
        try {
            await api.post('/fees', data);
            toast.success(data.targetGroup === 'individual' ? 'Fee created successfully' : `Fees created for ${data.targetGroup} students`);
            setIsModalOpen(false);
            reset({ targetGroup: 'individual' });
            refetch();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create fee');
        }
    };

    const filteredFees = fees?.filter((fee: any) =>
        fee.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fee.student?.profile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
                    <p className="text-gray-500">Create and manage student fees and payments</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all font-medium"
                >
                    <Plus size={18} />
                    Create New Fee
                </button>
            </div>

            {/* Search and Filters */}
            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by student name, ID or fee title..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Fees Table / Cards */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Mobile View: Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {isLoading ? (
                        <div className="p-8 text-center text-gray-500">Loading fees...</div>
                    ) : filteredFees?.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">No fees found</div>
                    ) : (
                        filteredFees?.map((fee: any) => (
                            <div key={fee._id} className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">{fee.student?.name}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{fee.student?.profile?.studentId}</span>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest
                                        ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                                            fee.status === 'partially_paid' ? 'bg-amber-50 text-amber-700' :
                                                'bg-red-50 text-red-700'}`}>
                                        {fee.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-gray-800">{fee.title}</p>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black text-gray-900">₹{fee.amount.toLocaleString()}</span>
                                            <span className="text-[10px] text-emerald-600 font-medium">Paid: ₹{fee.amountPaid.toLocaleString()}</span>
                                        </div>
                                        <div className="flex gap-1">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50 rounded-lg">
                                                <Edit size={14} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors bg-gray-50 rounded-lg">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-medium pt-2 border-t border-gray-50 mt-2 flex justify-between">
                                        <span>Type: {fee.type}</span>
                                        <span>Due: {format(new Date(fee.dueDate), 'MMM dd, yyyy')}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Loading fees...</td>
                                </tr>
                            ) : filteredFees?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500"> No fees found</td>
                                </tr>
                            ) : (
                                filteredFees?.map((fee: any) => (
                                    <tr key={fee._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{fee.student?.name}</span>
                                                <span className="text-xs text-gray-500">{fee.student?.profile?.studentId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{fee.title}</span>
                                                <span className="text-xs text-gray-400 capitalize">{fee.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">₹{fee.amount.toLocaleString()}</span>
                                                <span className="text-xs text-emerald-600">Paid: ₹{fee.amountPaid.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-widest
                                                ${fee.status === 'paid' ? 'bg-emerald-50 text-emerald-700' :
                                                    fee.status === 'partially_paid' ? 'bg-amber-50 text-amber-700' :
                                                        'bg-red-50 text-red-700'}`}>
                                                {fee.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {format(new Date(fee.dueDate), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-indigo-600 transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create Fee Modal */}
            <Transition appear show={isModalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-bold leading-6 text-gray-900 mb-4"
                                    >
                                        Create New Student Fee
                                    </Dialog.Title>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Group</label>
                                            <select
                                                {...register('targetGroup', { required: 'Please select a target group' })}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value="individual">Single Student</option>
                                                <option value="all">All Students</option>
                                                <option value="verified">Verified Students Only</option>
                                                <option value="pending">Pending Verification Students</option>
                                            </select>
                                        </div>

                                        {targetGroupValue === 'individual' && (
                                            <div className="animate-in slide-in-from-top-2 duration-300">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                                                <select
                                                    {...register('studentId', { required: targetGroupValue === 'individual' ? 'Please select a student' : false })}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                >
                                                    <option value="">Choose a student...</option>
                                                    {students.map((student: any) => (
                                                        <option key={student._id} value={student._id}>
                                                            {student.name} ({student.profile?.studentId})
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.studentId && <p className="text-xs text-red-500 mt-1">{String(errors.studentId.message)}</p>}
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fee Title</label>
                                            <input
                                                type="text"
                                                {...register('title', { required: 'Title is required' })}
                                                placeholder="e.g. Semester 2 Tuition Fees"
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                            {errors.title && <p className="text-xs text-red-500 mt-1">{String(errors.title.message)}</p>}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                                                <input
                                                    type="number"
                                                    {...register('amount', { required: 'Amount is required', min: 1 })}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
                                                <select
                                                    {...register('type', { required: 'Type is required' })}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                                >
                                                    <option value="tuition">Tuition</option>
                                                    <option value="hostel">Hostel</option>
                                                    <option value="mess">Mess</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                            <input
                                                type="date"
                                                {...register('dueDate', { required: 'Due date is required' })}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                                            <textarea
                                                {...register('description')}
                                                rows={2}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                            />
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-100"
                                            >
                                                Create Fee
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default AdminFees;
