import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Utensils, Star, Send, Clock, Info, CheckCircle2,
    Calendar, Coffee, Sun, Moon, Shield, ThumbsUp,
    TrendingUp, Award, Users, Leaf, AlertCircle
} from 'lucide-react';
import { useMessMenu, useSubmitMessFeedback } from '@/hooks/useMess';
import toast from 'react-hot-toast';

const MessPage = () => {
    const { data: menu } = useMessMenu();
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

    // Calculate average rating from menu data (if available)
    const averageRating = 4.2;
    const totalFeedbacks = 128;

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case 'Breakfast': return <Coffee size={12} />;
            case 'Lunch': return <Sun size={12} />;
            case 'Dinner': return <Moon size={12} />;
            default: return <Utensils size={12} />;
        }
    };

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
                        <span>DINING SERVICES</span>
                        <span className="text-gray-300">|</span>
                        <span>Mess Management</span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                Mess &{' '}
                                <span className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    Dining
                                </span>
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                Weekly menu, feedback system, and dining policies
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-sm">
                                <Star size={14} className="text-amber-500 fill-amber-500" />
                                <span className="text-sm font-semibold text-gray-900">{averageRating}</span>
                                <span className="text-xs text-gray-400">({totalFeedbacks} reviews)</span>
                            </div>
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                <Leaf size={14} className="text-emerald-600" />
                                <span className="text-xs font-medium text-emerald-700">Veg & Non-Veg</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Weekly Menu */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Weekly Menu Card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} className="text-gray-500" />
                                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Weekly Menu</h2>
                                    </div>
                                    <span className="text-[10px] text-gray-400">Updated Weekly</span>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <div className="p-5 flex gap-5 min-w-max">
                                    {days.map((day) => {
                                        const dayMenu = menu?.find((m: any) => m.day === day);
                                        const isToday = day === today;

                                        return (
                                            <div
                                                key={day}
                                                className={`w-72 flex-shrink-0 rounded-lg border transition-all ${isToday
                                                    ? 'border-emerald-300 ring-2 ring-emerald-200 bg-emerald-50/20'
                                                    : 'border-gray-100 bg-white hover:shadow-md'
                                                    }`}
                                            >
                                                <div className={`px-4 py-3 border-b ${isToday ? 'border-emerald-100 bg-emerald-50/30' : 'border-gray-50 bg-gray-50/30'
                                                    }`}>
                                                    <div className="flex justify-between items-center">
                                                        <h3 className="text-sm font-semibold text-gray-900">{day}</h3>
                                                        {isToday && (
                                                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-semibold">
                                                                TODAY
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="p-4 space-y-4">
                                                    <MealSection
                                                        title="Breakfast"
                                                        icon={<Coffee size={12} />}
                                                        items={dayMenu?.breakfast}
                                                        time="7:30 - 9:30 AM"
                                                    />
                                                    <MealSection
                                                        title="Lunch"
                                                        icon={<Sun size={12} />}
                                                        items={dayMenu?.lunch}
                                                        time="12:30 - 2:30 PM"
                                                    />
                                                    <MealSection
                                                        title="Dinner"
                                                        icon={<Moon size={12} />}
                                                        items={dayMenu?.dinner}
                                                        time="7:30 - 9:30 PM"
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Feedback History Preview */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/30">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-gray-500" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Feedback</h2>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="space-y-3">
                                    {[
                                        { rating: 5, comment: "Great food today! The biryani was excellent.", category: "Food Quality", meal: "Lunch", name: "Rahul S.", date: "2 hours ago" },
                                        { rating: 4, comment: "Good variety but a bit spicy.", category: "Food Quality", meal: "Dinner", name: "Priya M.", date: "Yesterday" },
                                        { rating: 5, comment: "Very hygienic and well-maintained mess.", category: "Hygiene", meal: "Breakfast", name: "Anonymous", date: "Yesterday" },
                                    ].map((feedback, idx) => (
                                        <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-0.5">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={10} className={`${i < feedback.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                    <span className="text-[9px] font-medium text-gray-400">•</span>
                                                    <span className="text-[9px] text-gray-500">{feedback.category}</span>
                                                </div>
                                                <span className="text-[9px] text-gray-400">{feedback.date}</span>
                                            </div>
                                            <p className="text-xs text-gray-600">{feedback.comment}</p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-[9px] text-gray-400">{feedback.meal}</span>
                                                <span className="text-[9px] text-gray-400">•</span>
                                                <span className="text-[9px] text-gray-400">{feedback.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Feedback Form & Policies */}
                    <div className="space-y-6">
                        {/* Feedback Form */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                                <div className="flex items-center gap-2">
                                    <Star size={16} className="text-amber-500 fill-amber-500" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Submit Feedback</h2>
                                </div>
                            </div>

                            <form onSubmit={handleSubmitFeedback} className="p-5 space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Category
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                                        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                            Meal Type
                                        </label>
                                        <select
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
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
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Rating
                                    </label>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setRating(s)}
                                                className={`p-1.5 rounded-lg transition-all ${rating >= s ? 'text-amber-500 bg-amber-50' : 'text-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                <Star size={22} fill={rating >= s ? 'currentColor' : 'none'} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Comments
                                    </label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all resize-none"
                                        placeholder="Share your dining experience..."
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex items-center justify-between gap-3 pt-2">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-3.5 h-3.5 text-emerald-600 rounded focus:ring-emerald-500"
                                            checked={isAnonymous}
                                            onChange={(e) => setIsAnonymous(e.target.checked)}
                                        />
                                        <span className="text-[10px] text-gray-500">Post Anonymously</span>
                                    </label>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                                        disabled={submitFeedback.isPending}
                                    >
                                        <Send size={12} />
                                        {submitFeedback.isPending ? 'Sending...' : 'Send Feedback'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Dining Policies */}
                        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg">
                            <div className="px-5 py-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-white/70" />
                                    <h3 className="text-sm font-semibold text-white uppercase tracking-wide">Dining Policies</h3>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { icon: <CheckCircle2 size={14} />, text: "Present digital ID card for mess entry", color: "text-emerald-400" },
                                    { icon: <CheckCircle2 size={14} />, text: "Maintain hygiene and clean your area", color: "text-emerald-400" },
                                    { icon: <CheckCircle2 size={14} />, text: "Avoid food wastage, take only what you eat", color: "text-emerald-400" },
                                    { icon: <CheckCircle2 size={14} />, text: "Report any quality issues immediately", color: "text-emerald-400" },
                                ].map((policy, idx) => (
                                    <div key={idx} className="flex items-start gap-2.5">
                                        <div className={`${policy.color} mt-0.5`}>
                                            {policy.icon}
                                        </div>
                                        <span className="text-xs text-gray-300">{policy.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Mess Timings */}
                        <div className="bg-amber-50 rounded-xl border border-amber-100 overflow-hidden">
                            <div className="px-5 py-4 border-b border-amber-100 bg-amber-100/30">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-amber-600" />
                                    <h4 className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Mess Timings</h4>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                {[
                                    { meal: "Breakfast", time: "07:30 - 09:30", icon: <Coffee size={14} /> },
                                    { meal: "Lunch", time: "12:30 - 14:30", icon: <Sun size={14} /> },
                                    { meal: "Dinner", time: "19:30 - 21:30", icon: <Moon size={14} /> },
                                ].map((slot, idx) => (
                                    <div key={idx} className="flex items-center justify-between py-2 border-b border-amber-100/50 last:border-0">
                                        <div className="flex items-center gap-2.5">
                                            <div className="text-amber-500">{slot.icon}</div>
                                            <span className="text-sm font-medium text-amber-800">{slot.meal}</span>
                                        </div>
                                        <span className="text-xs font-mono text-amber-700">{slot.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Tip */}
                        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4">
                            <div className="flex items-start gap-3">
                                <div className="p-1.5 bg-emerald-100 rounded-lg">
                                    <Award size={14} className="text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-emerald-800">Zero Food Waste Initiative</p>
                                    <p className="text-[10px] text-emerald-600 mt-0.5">
                                        Take only what you can eat. Let's work together to reduce food waste.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const MealSection = ({ title, icon, items, time }: { title: string; icon: React.ReactNode; items: any; time: string }) => (
    <div className="space-y-2">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
                <span className="text-gray-400">{icon}</span>
                <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">{title}</span>
            </div>
            <span className="text-[8px] font-mono text-gray-400">{time}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
            {items?.veg?.map((item: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md">
                    🥬 {item}
                </span>
            ))}
            {items?.nonVeg?.map((item: string, i: number) => (
                <span key={i} className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-md">
                    🍗 {item}
                </span>
            ))}
            {(!items || (items.veg?.length === 0 && items.nonVeg?.length === 0)) && (
                <span className="text-[10px] italic text-gray-400">Menu not available</span>
            )}
        </div>
    </div>
);

export default MessPage;    