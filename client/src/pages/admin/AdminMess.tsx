import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Utensils, Star, Trash2, Save, Plus, X, Filter, PieChart,
    TrendingUp, TrendingDown, Users, Activity, BarChart3,
    ShieldAlert
} from 'lucide-react';
import { useMessMenu, useUpdateDayMenu, useMessFeedback, useDeleteMessFeedback } from '@/hooks/useMess';
import { useAdminStats } from '@/hooks/useAdmin';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminMess = () => {
    const { data: menu } = useMessMenu();
    const { data: feedbackData, isLoading: feedbackLoading } = useMessFeedback();
    const { data: stats } = useAdminStats();
    const updateDayMenu = useUpdateDayMenu();
    const deleteFeedback = useDeleteMessFeedback();

    const [selectedDay, setSelectedDay] = useState('Monday');
    const [editMenu, setEditMenu] = useState<any>(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    React.useEffect(() => {
        if (menu) {
            const dayData = menu.find((m: any) => m.day === selectedDay);
            setEditMenu(dayData || { day: selectedDay, breakfast: { veg: [], nonVeg: [] }, lunch: { veg: [], nonVeg: [] }, dinner: { veg: [], nonVeg: [] } });
        }
    }, [menu, selectedDay]);

    const handleUpdateMenu = async () => {
        try {
            await updateDayMenu.mutateAsync({ day: selectedDay, menu: editMenu });
            toast.success('Menu updated for ' + selectedDay);
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const handleAddItem = (meal: string, type: string) => {
        const item = prompt(`Add item to ${meal} (${type}):`);
        if (item) {
            setEditMenu((prev: any) => ({
                ...prev,
                [meal]: {
                    ...prev[meal],
                    [type]: [...prev[meal][type], item]
                }
            }));
        }
    };

    const handleRemoveItem = (meal: string, type: string, index: number) => {
        setEditMenu((prev: any) => ({
            ...prev,
            [meal]: {
                ...prev[meal],
                [type]: prev[meal][type].filter((_: any, i: number) => i !== index)
            }
        }));
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mess Management</h1>
                    <p className="text-sm text-gray-500 mt-1">Configure weekly menu and moderate feedback</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Menu Configurator */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <Utensils size={18} className="text-emerald-600" />
                                Menu Editor
                            </h3>
                        </div>
                        <div className="p-4 space-y-1">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedDay === day ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl flex flex-col items-center text-center relative overflow-hidden group">
                        <motion.div
                            className="absolute top-0 right-0 -m-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"
                        />
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 relative z-10 backdrop-blur-sm">
                            <PieChart size={32} />
                        </div>
                        <h4 className="font-bold mb-2 relative z-10">Inventory & Preference Stats</h4>
                        <p className="text-xs text-emerald-100 relative z-10 max-w-[200px]">Keep track of student preferences and historical mess analytics.</p>
                        <button
                            onClick={() => setShowAnalytics(true)}
                            className="mt-4 px-6 py-2.5 bg-white text-emerald-600 rounded-xl text-xs font-black shadow-lg hover:shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all relative z-10"
                        >
                            VIEW ANALYTICS
                        </button>
                    </div>
                </div>

                {/* Day Editor Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Edit {selectedDay} Menu</h2>
                            <button
                                onClick={handleUpdateMenu}
                                className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                                disabled={updateDayMenu.isPending}
                            >
                                <Save size={18} />
                                {updateDayMenu.isPending ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                        {editMenu ? (
                            <div className="space-y-8">
                                <AdminMealConfig
                                    meal="Breakfast"
                                    data={editMenu.breakfast}
                                    onAdd={(type) => handleAddItem('breakfast', type)}
                                    onRemove={(type, index) => handleRemoveItem('breakfast', type, index)}
                                />
                                <AdminMealConfig
                                    meal="Lunch"
                                    data={editMenu.lunch}
                                    onAdd={(type) => handleAddItem('lunch', type)}
                                    onRemove={(type, index) => handleRemoveItem('lunch', type, index)}
                                />
                                <AdminMealConfig
                                    meal="Dinner"
                                    data={editMenu.dinner}
                                    onAdd={(type) => handleAddItem('dinner', type)}
                                    onRemove={(type, index) => handleRemoveItem('dinner', type, index)}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">Loading day configuration...</div>
                        )}
                    </div>

                    {/* Feedback Moderation */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900">Recent Student Feedback</h2>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"><Filter size={18} /></button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {feedbackLoading ? (
                                <div className="p-8 text-center text-gray-500">Loading feedback...</div>
                            ) : feedbackData?.feedback.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="inline-flex p-4 bg-gray-50 rounded-full text-gray-400 mb-4"><Star size={32} /></div>
                                    <h4 className="text-gray-900 font-bold">No feedback yet</h4>
                                    <p className="text-sm text-gray-500 mt-1">Student haven't submitted any feedback for this period.</p>
                                </div>
                            ) : (
                                feedbackData?.feedback.map((f: any) => (
                                    <div key={f._id} className="p-6 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold shrink-0">
                                                    {f.isAnonymous ? '?' : f.studentName.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900">{f.studentName}</span>
                                                        <span className="text-xs text-gray-400">• {new Date(f.createdAt).toLocaleDateString()}</span>
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase">{f.mealType}</span>
                                                    </div>
                                                    <div className="flex gap-0.5 my-1.5">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={14} fill={s <= f.rating ? "#F59E0B" : "none"} color={s <= f.rating ? "#F59E0B" : "#D1D5DB"} />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{f.comment}</p>
                                                    <div className="mt-2 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block uppercase">
                                                        {f.category}
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteFeedback.mutate(f._id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Analytics Modal */}
            <AnimatePresence>
                {showAnalytics && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAnalytics(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl relative z-[101] overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-emerald-600 text-white">
                                <div className="flex items-center gap-4">
                                    <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
                                        <BarChart3 size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold">Mess Analytics Dashboard</h2>
                                        <p className="text-xs text-emerald-100 font-medium">Real-time catering insights and student trends</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAnalytics(false)} className="text-white/60 hover:text-white bg-white/10 p-2 rounded-xl transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Preference Chart */}
                                    <div className="bg-gray-50 rounded-[2rem] p-8 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                                <PieChart size={18} className="text-emerald-600" />
                                                Meal Preference
                                            </h3>
                                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full uppercase tracking-widest">Live</span>
                                        </div>

                                        <div className="aspect-square max-w-[250px] mx-auto relative">
                                            <Doughnut
                                                data={{
                                                    labels: Object.keys(stats?.mealStats || {}),
                                                    datasets: [{
                                                        data: Object.values(stats?.mealStats || {}),
                                                        backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'],
                                                        borderWidth: 0,
                                                        hoverOffset: 15,
                                                        borderRadius: 10,
                                                        spacing: 5
                                                    }]
                                                }}
                                                options={{
                                                    cutout: '75%',
                                                    plugins: {
                                                        legend: { display: false }
                                                    }
                                                }}
                                            />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-black text-gray-900">
                                                    {(Object.values(stats?.mealStats || {}).reduce((a: any, b: any) => a + b, 0)) as number}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Students</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {Object.entries(stats?.mealStats || {}).map(([key, val]: [string, any], idx) => (
                                                <div key={key} className="p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#3B82F6'][idx % 4] }}></div>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase truncate">{key}</span>
                                                    </div>
                                                    <div className="text-lg font-black text-gray-900">{val}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="space-y-6">
                                        <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100 relative overflow-hidden">
                                            <TrendingUp className="absolute bottom-0 right-0 -m-4 text-emerald-200" size={120} />
                                            <h4 className="text-emerald-800 font-bold mb-4 relative z-10 flex items-center gap-2">
                                                <Activity size={18} />
                                                Daily Traction
                                            </h4>
                                            <div className="space-y-4 relative z-10">
                                                <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                                                    <span className="text-sm font-medium text-emerald-900">Avg. Satisfaction</span>
                                                    <span className="text-xl font-black text-emerald-600">4.8/5.0</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-white/60 backdrop-blur-sm p-4 rounded-2xl">
                                                    <span className="text-sm font-medium text-emerald-900">Mess Attendance</span>
                                                    <span className="text-xl font-black text-emerald-600">92%</span>
                                                </div>
                                                <div className="flex justify-between items-center bg-emerald-600 p-4 rounded-2xl text-white shadow-lg">
                                                    <span className="text-sm font-medium">Wastage Reduction</span>
                                                    <span className="text-xl font-black">↑ 15%</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg w-max mb-3">
                                                    <Users size={20} />
                                                </div>
                                                <div className="text-2xl font-black text-gray-900">450+</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Active Diners</div>
                                            </div>
                                            <div className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm">
                                                <div className="p-2 bg-rose-50 text-rose-600 rounded-lg w-max mb-3">
                                                    <TrendingDown size={20} />
                                                </div>
                                                <div className="text-2xl font-black text-gray-900">12%</div>
                                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Buffer Stock</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 p-6 bg-gray-900 rounded-[2rem] text-white flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl">
                                            <ShieldAlert className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <h5 className="font-bold">Inventory Alert</h5>
                                            <p className="text-xs text-gray-400">Low stock for Chicken on next Wednesday's menu.</p>
                                        </div>
                                    </div>
                                    <button className="px-5 py-2.5 bg-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all">
                                        Restock Now
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const AdminMealConfig = ({ meal, data, onAdd, onRemove }: { meal: string, data: any, onAdd: (type: string) => void, onRemove: (type: string, index: number) => void }) => (
    <div className="space-y-4">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-[2px] border-b pb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            {meal}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MealTypeBox title="Vegetarian" type="veg" items={data.veg} onAdd={onAdd} onRemove={onRemove} />
            <MealTypeBox title="Non-Vegetarian" type="nonVeg" items={data.nonVeg} onAdd={onAdd} onRemove={onRemove} />
        </div>
    </div>
);

const MealTypeBox = ({ title, type, items, onAdd, onRemove }: { title: string, type: string, items: string[], onAdd: (type: string) => void, onRemove: (type: string, index: number) => void }) => (
    <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
            <span className={`text-xs font-bold ${type === 'veg' ? 'text-green-600' : 'text-red-600'} uppercase`}>{title}</span>
            <button onClick={() => onAdd(type)} className="p-1.5 hover:bg-white text-gray-500 hover:text-indigo-600 rounded-lg border border-transparent hover:border-gray-200 transition-all">
                <Plus size={16} />
            </button>
        </div>
        <div className="space-y-2">
            {items?.length > 0 ? (
                items.map((item: string, i: number) => (
                    <div key={i} className="flex justify-between items-center group/item bg-white px-3 py-2 rounded-lg border border-gray-200 text-sm">
                        <span>{item}</span>
                        <button onClick={() => onRemove(type, i)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all">
                            <X size={14} />
                        </button>
                    </div>
                ))
            ) : (
                <div className="text-xs italic text-gray-400 py-2">No items added</div>
            )}
        </div>
    </div>
);

export default AdminMess;
