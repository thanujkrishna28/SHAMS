import { useState } from 'react';
import { useMyLeaves, useApplyLeave } from '@/hooks/useLeaves';
import { Plus, Calendar, Clock, CheckCircle, XCircle, FileText, AlertCircle, ChevronRight, User, BookOpen, Heart, Briefcase } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { motion } from 'framer-motion';

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
                return {
                    element: <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100"><CheckCircle size={10} /> Approved</span>,
                    color: 'emerald'
                };
            case 'rejected':
                return {
                    element: <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-red-50 text-red-700 border border-red-100"><XCircle size={10} /> Rejected</span>,
                    color: 'red'
                };
            default:
                return {
                    element: <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-100"><Clock size={10} /> Pending</span>,
                    color: 'amber'
                };
        }
    };

    const getLeaveTypeIcon = (type: string) => {
        switch (type) {
            case 'sick': return <Heart size={14} />;
            case 'personal': return <User size={14} />;
            case 'academic': return <BookOpen size={14} />;
            case 'emergency': return <AlertCircle size={14} />;
            default: return <Briefcase size={14} />;
        }
    };

    const totalLeaves = leaves?.length || 0;
    const approvedLeaves = leaves?.filter((l: any) => l.status === 'approved').length || 0;
    const pendingLeaves = leaves?.filter((l: any) => l.status === 'pending').length || 0;
    const rejectedLeaves = leaves?.filter((l: any) => l.status === 'rejected').length || 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50"
        >
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
                        <span>LEAVE MANAGEMENT</span>
                        <span className="text-gray-300">|</span>
                        <span>Attendance Portal</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                Leave{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Applications
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Apply for leave and track your application status
                            </p>
                        </div>

                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                        >
                            <Plus size={16} />
                            New Application
                        </button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <FileText size={16} className="text-indigo-600" />
                            </div>
                            <span className="text-[9px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{totalLeaves}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Total Applications</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <CheckCircle size={16} className="text-emerald-600" />
                            </div>
                            <span className="text-[9px] font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Approved</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{approvedLeaves}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Applications Approved</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <Clock size={16} className="text-amber-600" />
                            </div>
                            <span className="text-[9px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{pendingLeaves}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Awaiting Review</p>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <XCircle size={16} className="text-red-600" />
                            </div>
                            <span className="text-[9px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Rejected</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{rejectedLeaves}</p>
                        <p className="text-[11px] text-gray-500 mt-0.5">Applications Rejected</p>
                    </div>
                </div>

                {/* Leave Applications List */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Application History</h3>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-sm text-gray-500">Loading applications...</p>
                        </div>
                    ) : leaves?.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText size={24} className="text-gray-400" />
                            </div>
                            <h3 className="text-base font-medium text-gray-900">No leave applications yet</h3>
                            <p className="text-sm text-gray-500 mt-1">Click the "New Application" button to get started.</p>
                        </div>
                    ) : (
                        <>
                            {/* Mobile View */}
                            <div className="md:hidden divide-y divide-gray-100">
                                {leaves?.map((leave: any, idx: number) => {
                                    const status = getStatusBadge(leave.status);
                                    const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;

                                    return (
                                        <div key={leave._id} className="p-4 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-100 rounded-lg">
                                                        {getLeaveTypeIcon(leave.type)}
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-900 capitalize">{leave.type}</p>
                                                        <p className="text-[9px] text-gray-400">{days} {days === 1 ? 'day' : 'days'}</p>
                                                    </div>
                                                </div>
                                                {status.element}
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 line-clamp-2 italic">"{leave.reason}"</p>
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-gray-400">
                                                <span>{format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}</span>
                                                <span>Applied: {format(new Date(leave.createdAt), 'MMM dd')}</span>
                                            </div>
                                            {leave.adminComment && (
                                                <div className="mt-2 p-2 bg-red-50 rounded-lg border border-red-100">
                                                    <p className="text-[9px] text-red-600">{leave.adminComment}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50/50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                                            <th className="px-5 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {leaves?.map((leave: any, idx: number) => {
                                            const status = getStatusBadge(leave.status);
                                            const days = differenceInDays(new Date(leave.endDate), new Date(leave.startDate)) + 1;

                                            return (
                                                <motion.tr
                                                    key={leave._id}
                                                    initial={{ opacity: 0, y: 5 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: idx * 0.03 }}
                                                    className="hover:bg-gray-50/50 transition-colors group"
                                                >
                                                    <td className="px-5 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                                                {getLeaveTypeIcon(leave.type)}
                                                            </div>
                                                            <span className="text-sm font-medium text-gray-900 capitalize">{leave.type}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-900">
                                                                {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd')}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">{days} {days === 1 ? 'day' : 'days'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <p className="text-sm text-gray-600 max-w-xs truncate" title={leave.reason}>
                                                            {leave.reason}
                                                        </p>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-sm text-gray-900">
                                                                {format(new Date(leave.createdAt), 'MMM dd, yyyy')}
                                                            </span>
                                                            <span className="text-[10px] text-gray-400">
                                                                {format(new Date(leave.createdAt), 'h:mm a')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3">
                                                        <div className="space-y-1">
                                                            {status.element}
                                                            {leave.adminComment && (
                                                                <p className="text-[9px] text-red-500 max-w-[180px]" title={leave.adminComment}>
                                                                    Note: {leave.adminComment.length > 40 ? leave.adminComment.substring(0, 40) + '...' : leave.adminComment}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
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
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4">
                                        <Dialog.Title as="h3" className="text-lg font-semibold text-white">
                                            New Leave Application
                                        </Dialog.Title>
                                        <p className="text-xs text-white/70 mt-0.5">Fill in the details to submit your request</p>
                                    </div>

                                    <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                                    Start Date
                                                </label>
                                                <input
                                                    type="date"
                                                    {...register('startDate', { required: 'Start date is required' })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.startDate && (
                                                    <p className="text-[10px] text-red-500 mt-1">{String(errors.startDate.message)}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                                    End Date
                                                </label>
                                                <input
                                                    type="date"
                                                    {...register('endDate', { required: 'End date is required' })}
                                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                                                    min={new Date().toISOString().split('T')[0]}
                                                />
                                                {errors.endDate && (
                                                    <p className="text-[10px] text-red-500 mt-1">{String(errors.endDate.message)}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Leave Type
                                            </label>
                                            <select
                                                {...register('type', { required: 'Please select a type' })}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-white"
                                            >
                                                <option value="sick">🤒 Sick Leave</option>
                                                <option value="personal">👤 Personal Reason</option>
                                                <option value="academic">📚 Academic / Exam</option>
                                                <option value="emergency">🚨 Family Emergency</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                                Reason
                                            </label>
                                            <textarea
                                                {...register('reason', {
                                                    required: 'Please provide a reason',
                                                    minLength: { value: 10, message: 'Reason must be at least 10 characters' }
                                                })}
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                                                placeholder="Briefly explain why you are taking leave..."
                                            />
                                            {errors.reason && (
                                                <p className="text-[10px] text-red-500 mt-1">{String(errors.reason.message)}</p>
                                            )}
                                        </div>

                                        <div className="pt-3 flex justify-end gap-3">
                                            <button
                                                type="button"
                                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                                onClick={() => setIsModalOpen(false)}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={applyLeave.isPending}
                                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {applyLeave.isPending ? (
                                                    <>
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Submitting...
                                                    </>
                                                ) : (
                                                    'Submit Application'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </motion.div>
    );
};

export default Leave;