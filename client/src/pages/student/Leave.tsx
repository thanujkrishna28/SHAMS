import { useState } from 'react';
import { useMyLeaves, useApplyLeave } from '@/hooks/useLeaves';
import { Plus, Calendar, Clock, CheckCircle, XCircle, FileText } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const Leave = () => {
    const { data: leaves, isLoading } = useMyLeaves();
    const applyLeave = useApplyLeave();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const onSubmit = async (data: any) => {
        try {
            await applyLeave.mutateAsync(data);
            toast.success('Leave application submitted successfully');
            setIsModalOpen(false);
            reset();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit leave application');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1"><CheckCircle size={12} /> Approved</span>;
            case 'rejected':
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100 flex items-center gap-1"><XCircle size={12} /> Rejected</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100 flex items-center gap-1"><Clock size={12} /> Pending</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
                    <p className="text-gray-500">Apply for leaves and track your application status</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all font-medium"
                >
                    <Plus size={18} />
                    Apply for Leave
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Leaves</p>
                            <h3 className="text-2xl font-bold text-gray-900">{leaves?.length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Approved</p>
                            <h3 className="text-2xl font-bold text-gray-900">{leaves?.filter((l: any) => l.status === 'approved').length || 0}</h3>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending</p>
                            <h3 className="text-2xl font-bold text-gray-900">{leaves?.filter((l: any) => l.status === 'pending').length || 0}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaves List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50">
                    <h3 className="font-bold text-gray-900">Recent Applications</h3>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading leaves...</div>
                ) : leaves?.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <FileText size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No leave applications yet</h3>
                        <p className="text-gray-500 mt-1">Click the "Apply for Leave" button to create one.</p>
                    </div>
                ) : (
                    <>
                        <div className="md:hidden divide-y divide-gray-100">
                            {leaves?.map((leave: any) => (
                                <div key={leave._id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{leave.type}</span>
                                            <p className="text-sm font-bold text-gray-900">
                                                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                                            </p>
                                        </div>
                                        {getStatusBadge(leave.status)}
                                    </div>
                                    <p className="text-sm text-gray-600 line-clamp-2 italic">"{leave.reason}"</p>
                                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                                        <span>Applied: {format(new Date(leave.createdAt), 'MMM dd, yyyy')}</span>
                                        <span>{differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1} Days</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50 text-left">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Type</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Reason</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Applied On</th>
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {leaves?.map((leave: any) => (
                                        <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="capitalize font-medium text-gray-700">{leave.type}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {format(new Date(leave.startDate), 'MMM dd, yyyy')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1} Days
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>{leave.reason}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(leave.status)}
                                                {leave.adminComment && (
                                                    <p className="text-xs text-red-500 mt-1" title={leave.adminComment}>
                                                        Note: {leave.adminComment}
                                                    </p>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* Apply Leave Modal */}
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
                                        New Leave Application
                                    </Dialog.Title>

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                <input
                                                    type="date"
                                                    {...register('startDate', { required: 'Start date is required' })}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.startDate && <p className="text-xs text-red-500 mt-1">{String(errors.startDate.message)}</p>}
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                <input
                                                    type="date"
                                                    {...register('endDate', { required: 'End date is required' })}
                                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.endDate && <p className="text-xs text-red-500 mt-1">{String(errors.endDate.message)}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Type of Leave</label>
                                            <select
                                                {...register('type', { required: 'Please select a type' })}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                            >
                                                <option value="sick">Sick Leave</option>
                                                <option value="personal">Personal Reason</option>
                                                <option value="academic">Academic / Exam</option>
                                                <option value="emergency">Family Emergency</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                            <textarea
                                                {...register('reason', { required: 'Please provide a reason', minLength: { value: 10, message: 'Reason must be at least 10 characters' } })}
                                                rows={3}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                                placeholder="Briefly explain why you are taking leave..."
                                            />
                                            {errors.reason && <p className="text-xs text-red-500 mt-1">{String(errors.reason.message)}</p>}
                                        </div>

                                        <div className="mt-6 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg outline-none"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={applyLeave.isPending}
                                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg outline-none flex items-center gap-2"
                                            >
                                                {applyLeave.isPending ? 'Submitting...' : 'Submit Application'}
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

export default Leave;
