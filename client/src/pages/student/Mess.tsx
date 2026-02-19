import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Star, Send, Clock, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useMessMenu, useSubmitMessFeedback } from '@/hooks/useMess';
import toast from 'react-hot-toast';

const MessPage = () => {
    const { data: menu, isLoading: menuLoading } = useMessMenu();
    const submitFeedback = useSubmitMessFeedback();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [category, setCategory] = useState('Food Quality');
    const [mealType, setMealType] = useState('Lunch');
    const [isAnonymous, setIsAnonymous] = useState(false);

    const handleSubmitFeedback = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await submitFeedback.mutateAsync({
                rating,
                comment,
                category,
                mealType,
                isAnonymous
            });
            toast.success('Feedback submitted successfully!');
            setComment('');
            setRating(5);
        } catch (error) {
            toast.error('Failed to submit feedback');
        }
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mess & Dining</h1>
                    <p className="text-sm text-gray-500 mt-1">Weekly menu and feedback system</p>
                </div>
            </div>

            {/* Weekly Menu Section */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <Utensils size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Weekly Food Menu</h2>
                    </div>
                    <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
                        VEG & NON-VEG
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <div className="flex p-6 gap-6 min-w-max">
                        {days.map((day) => {
                            const dayMenu = menu?.find((m: any) => m.day === day);
                            const isToday = day === today;

                            return (
                                <div
                                    key={day}
                                    className={`w-72 flex-shrink-0 rounded-xl border transition-all ${isToday ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/30' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                >
                                    <div className={`p-4 border-b ${isToday ? 'border-emerald-100' : 'border-gray-100'}`}>
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-bold text-gray-900">{day}</h3>
                                            {isToday && <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Today</span>}
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <MealSection title="Breakfast" items={dayMenu?.breakfast} />
                                        <MealSection title="Lunch" items={dayMenu?.lunch} />
                                        <MealSection title="Dinner" items={dayMenu?.dinner} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Feedback Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Star className="text-amber-500" size={20} />
                            Mess Feedback
                        </h2>
                        <form onSubmit={handleSubmitFeedback} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Category</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option>Food Quality</option>
                                        <option>Hygiene</option>
                                        <option>Service</option>
                                        <option>Variety</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Meal Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                                        value={mealType}
                                        onChange={(e) => setMealType(e.target.value)}
                                    >
                                        <option>Breakfast</option>
                                        <option>Lunch</option>
                                        <option>Dinner</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rating</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button
                                            key={s}
                                            type="button"
                                            onClick={() => setRating(s)}
                                            className={`p-2 rounded-lg transition-all ${rating >= s ? 'text-amber-500 bg-amber-50' : 'text-gray-300 bg-gray-50'
                                                }`}
                                        >
                                            <Star size={24} fill={rating >= s ? 'currentColor' : 'none'} />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Comments</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Tell us about your experience..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                        checked={isAnonymous}
                                        onChange={(e) => setIsAnonymous(e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">Submit Anonymously</span>
                                </label>
                                <button
                                    className="px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                                    disabled={submitFeedback.isPending}
                                >
                                    <Send size={18} />
                                    {submitFeedback.isPending ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Guidelines */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-white/10 rounded-lg">
                                <Info size={20} />
                            </div>
                            <h3 className="font-bold">Dining Policies</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                <span>Always carry your digital ID card for scanning at the mess entry.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                <span>Maintain hygiene and clean up after your meal.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 size={16} className="text-emerald-400 mt-0.5 shrink-0" />
                                <span>Avoid food wastage to support sustainability.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                        <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-3">
                            <Clock size={18} />
                            Mess Timings
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-amber-700">Breakfast</span>
                                <span className="font-semibold">07:30 - 09:30</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-amber-700">Lunch</span>
                                <span className="font-semibold">12:30 - 14:30</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-amber-700">Dinner</span>
                                <span className="font-semibold">19:30 - 21:30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const MealSection = ({ title, items }: { title: string, items: any }) => (
    <div className="space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{title}</div>
        <div className="space-y-1">
            <div className="flex flex-wrap gap-1.5">
                {items?.veg?.map((item: string, i: number) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 bg-green-50 text-green-700 border border-green-100 rounded-md">
                        {item}
                    </span>
                ))}
                {items?.nonVeg?.map((item: string, i: number) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 bg-red-50 text-red-700 border border-red-100 rounded-md">
                        {item}
                    </span>
                ))}
                {(!items || (items.veg.length === 0 && items.nonVeg.length === 0)) && (
                    <span className="text-[11px] italic text-gray-400">No menu set</span>
                )}
            </div>
        </div>
    </div>
);

export default MessPage;
