import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowRightLeft, ArrowUpCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api/axios';
import toast from 'react-hot-toast';

interface RequestChangeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const RequestChangeModal = ({ isOpen, onClose }: RequestChangeModalProps) => {
    const [requestType, setRequestType] = useState<'change' | 'swap'>('change');
    const [reason, setReason] = useState('');
    const [preferredType, setPreferredType] = useState('double');

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/allocations', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Request submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['allocations'] });
            onClose();
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({
            requestType,
            reason,
            requestedRoomType: preferredType,
            requestedBlock: 'Any' // simplified
        });
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
                >
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-6 text-white flex justify-between items-center">
                        <h2 className="text-xl font-bold">Request Room Change</h2>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <button
                                type="button"
                                onClick={() => setRequestType('change')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${requestType === 'change' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <ArrowUpCircle size={24} />
                                <span className="text-sm font-medium">Upgrade/Change</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setRequestType('swap')}
                                className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${requestType === 'swap' ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:bg-gray-50'}`}
                            >
                                <ArrowRightLeft size={24} />
                                <span className="text-sm font-medium">Swap Room</span>
                            </button>
                        </div>

                        {requestType === 'change' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Room Type</label>
                                <select
                                    value={preferredType}
                                    onChange={(e) => setPreferredType(e.target.value)}
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none"
                                >
                                    <option value="single">Single Room (AC)</option>
                                    <option value="double">Double Sharing</option>
                                    <option value="triple">Triple Sharing</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Request</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none h-32 resize-none"
                                placeholder={requestType === 'swap' ? "I want to swap with my friend in B-204 because..." : "I need a quieter environment for preparing for GATE exams..."}
                                required
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending}
                                className="px-5 py-2.5 bg-violet-600 text-white font-medium rounded-xl hover:bg-violet-700 shadow-lg shadow-violet-200 transition-all flex items-center gap-2 disabled:opacity-70"
                            >
                                {mutation.isPending ? 'Submitting...' : 'Submit Request'}
                                <Send size={18} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default RequestChangeModal;
