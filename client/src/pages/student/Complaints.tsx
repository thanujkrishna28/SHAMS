import React, { useState } from 'react';
import { Wand2, CheckCircle2 } from 'lucide-react';

import { useComplaints, useCreateComplaint } from '@/hooks/useComplaints';
import toast from 'react-hot-toast';

const Complaints = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('maintenance');
    const [isAIProcessing, setIsAIProcessing] = useState(false);

    const { data: complaints, isLoading } = useComplaints();
    const createMutation = useCreateComplaint();

    // AI "Magic" Polish Function
    const handleAIPolish = () => {
        if (!description) return;
        setIsAIProcessing(true);
        setTimeout(() => {
            // Simulated AI enhancement
            let polished = description;
            if (description.toLowerCase().includes('fan') && description.toLowerCase().includes('work')) {
                polished = "The ceiling fan in the room is malfunctioning. It does not rotate at the expected speed and makes a loud noise.";
            } else if (description.toLowerCase().includes('water') && description.toLowerCase().includes('cold')) {
                polished = "The hot water supply in the bathroom is inconsistent. Only cold water is available during morning hours.";
            } else if (description.toLowerCase().includes('cleaning')) {
                polished = "The room requires a thorough cleaning. Dust has accumulated, and the floor has not been mopped for several days.";
            } else {
                polished = `Formal Complaint: ${description.charAt(0).toUpperCase() + description.slice(1)}. Requires immediate attention from the maintenance team.`;
            }
            setDescription(polished);
            setIsAIProcessing(false);
        }, 1500);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            toast.error('Please fill in all fields');
            return;
        }

        createMutation.mutate({ title, description, category }, {
            onSuccess: () => {
                toast.success('Complaint submitted successfully!');
                setTitle('');
                setDescription('');
            },
            onError: (err: any) => {
                toast.error(err.response?.data?.message || 'Failed to submit complaint');
            }
        });
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Complaints & Issues</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Complaint Form */}
                <div className="bg-surface p-6 rounded-2xl border border-border/50 shadow-soft">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Lodge a New Complaint</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                            >
                                <option value="maintenance">Maintenance</option>
                                <option value="cleanliness">Cleanliness</option>
                                <option value="electrical">Electrical</option>
                                <option value="plumbing">Plumbing</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="e.g. Broken Fan, Leaking tap"
                                required
                            />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-gray-700">Description</label>
                                <button
                                    type="button"
                                    onClick={handleAIPolish}
                                    disabled={isAIProcessing || !description}
                                    className="text-xs flex items-center gap-1 text-violet-600 font-medium hover:text-violet-700 transition-colors disabled:opacity-50"
                                >
                                    <Wand2 size={12} />
                                    {isAIProcessing ? 'Polishing...' : 'Polish with AI'}
                                </button>
                            </div>
                            <div className="relative">
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none min-h-[120px] resize-none transition-all"
                                    placeholder="Describe your issue..."
                                    required
                                />
                                {isAIProcessing && (
                                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-xl flex items-center justify-center">
                                        <div className="flex items-center gap-2 text-violet-600 font-medium animate-pulse">
                                            <Wand2 size={18} />
                                            Writing professionally...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all disabled:opacity-70"
                        >
                            {createMutation.isPending ? 'Submitting...' : 'Submit Complaint'}
                        </button>
                    </form>
                </div>

                {/* Status & History */}
                <div className="space-y-6">
                    <div className="bg-surface p-6 rounded-2xl border border-border/50 shadow-soft">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Complaint History</h2>
                        <div className="space-y-4">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
                                </div>
                            ) : complaints?.length > 0 ? (
                                complaints.map((complaint: any) => (
                                    <div key={complaint._id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-800 capitalize line-clamp-1">{complaint.title}</h4>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${complaint.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                                                complaint.status === 'resolved' ? 'bg-green-100 text-green-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {complaint.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2 truncate group-hover:whitespace-normal transition-all">{complaint.description}</p>
                                        <div className="flex justify-between items-center text-[10px] text-gray-400 font-medium">
                                            <span className="capitalize">{complaint.category}</span>
                                            <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-400">
                                    <div className="mx-auto w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <p className="text-sm">No active complaints. Enjoy your stay!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Complaints;
