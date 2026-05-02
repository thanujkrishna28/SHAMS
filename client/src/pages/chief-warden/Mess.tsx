import React, { useState } from 'react';
import {
    Utensils, Star, Trash2, Save, Plus, X, Filter, PieChart,
    TrendingUp, TrendingDown, Users, Activity, BarChart3,
    ShieldAlert, RefreshCw, ChevronRight, Apple, Beef,
    ChefHat, Settings2
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

const Mess = () => {
    const { data: menu, refetch: refetchMenu } = useMessMenu();
    const { data: feedbackData, isLoading: feedbackLoading, refetch: refetchFeedback } = useMessFeedback();
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
            toast.success(`Menu updated for ${selectedDay}`);
        } catch (error) {
            toast.error('Failed to update menu');
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
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl font-bold text-gray-900">Mess Management</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">Manage weekly menu and student feedback</p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => { refetchMenu(); refetchFeedback(); }}
                            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                        <button
                            onClick={() => setShowAnalytics(true)}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <PieChart size={16} />
                            View Analytics
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users size={18} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Active Diners</p>
                            <p className="text-xl font-bold text-gray-900">450+</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Star size={18} className="text-amber-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Satisfaction</p>
                            <p className="text-xl font-bold text-gray-900">4.8/5</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Activity size={18} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Efficiency</p>
                            <p className="text-xl font-bold text-gray-900">94%</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <TrendingDown size={18} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Buffer Stock</p>
                            <p className="text-xl font-bold text-gray-900">12%</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Day Selection */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                <Settings2 size={14} /> Weekly Schedule
                            </h3>
                        </div>
                        <div className="p-2 space-y-1">
                            {days.map(day => (
                                <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${selectedDay === day
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {day}
                                    <ChevronRight size={14} className={`${selectedDay === day ? 'opacity-100' : 'opacity-0'}`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                        <div className="p-3 bg-white rounded-lg w-max mb-4">
                            <ChefHat size={24} className="text-gray-700" />
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mb-1">Kitchen Notes</h4>
                        <p className="text-xs text-gray-500 mb-4">Maintain quality standards and inventory logs</p>
                        <button className="w-full py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors">
                            View Inventory
                        </button>
                    </div>
                </div>

                {/* Menu Editor */}
                <div className="lg:col-span-9 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedDay} Menu</h2>
                                <p className="text-xs text-blue-600 font-medium mt-1">Edit meal items</p>
                            </div>
                            <button
                                onClick={handleUpdateMenu}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                disabled={updateDayMenu.isPending}
                            >
                                <Save size={16} />
                                {updateDayMenu.isPending ? 'Saving...' : 'Save Menu'}
                            </button>
                        </div>

                        {editMenu ? (
                            <div className="space-y-8">
                                <MealSection
                                    title="Breakfast"
                                    data={editMenu.breakfast}
                                    onAdd={(type) => handleAddItem('breakfast', type)}
                                    onRemove={(type, index) => handleRemoveItem('breakfast', type, index)}
                                />
                                <MealSection
                                    title="Lunch"
                                    data={editMenu.lunch}
                                    onAdd={(type) => handleAddItem('lunch', type)}
                                    onRemove={(type, index) => handleRemoveItem('lunch', type, index)}
                                />
                                <MealSection
                                    title="Dinner"
                                    data={editMenu.dinner}
                                    onAdd={(type) => handleAddItem('dinner', type)}
                                    onRemove={(type, index) => handleRemoveItem('dinner', type, index)}
                                />
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                                <p className="text-sm text-gray-500">Loading menu...</p>
                            </div>
                        )}
                    </div>

                    {/* Feedback Section */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Star size={18} className="text-amber-500" />
                                <div>
                                    <h2 className="text-sm font-semibold text-gray-900">Student Feedback</h2>
                                    <p className="text-xs text-gray-500">Recent reviews and ratings</p>
                                </div>
                            </div>
                            <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors">
                                <Filter size={16} />
                            </button>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {feedbackLoading ? (
                                <div className="p-12 text-center">
                                    <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                                </div>
                            ) : feedbackData?.feedback.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Star size={32} className="text-gray-300 mx-auto mb-3" />
                                    <h4 className="text-sm font-medium text-gray-500">No feedback yet</h4>
                                    <p className="text-xs text-gray-400 mt-1">Student feedback will appear here</p>
                                </div>
                            ) : (
                                feedbackData?.feedback.map((f: any) => (
                                    <div key={f._id} className="p-5 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-4 flex-1">
                                                <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-sm font-bold">
                                                    {f.isAnonymous ? '?' : f.studentName.charAt(0)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                                        <span className="text-sm font-medium text-gray-900">{f.studentName}</span>
                                                        <span className="text-xs text-gray-400">• {new Date(f.createdAt).toLocaleDateString()}</span>
                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{f.mealType}</span>
                                                    </div>
                                                    <div className="flex gap-0.5 mb-2">
                                                        {[1, 2, 3, 4, 5].map(s => (
                                                            <Star key={s} size={14} fill={s <= f.rating ? "#F59E0B" : "none"} color={s <= f.rating ? "#F59E0B" : "#D1D5DB"} />
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{f.comment}</p>
                                                    <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium">
                                                        {f.category}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => deleteFeedback.mutate(f._id)}
                                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={16} />
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
            {showAnalytics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
                    <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
                        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
                            <div className="flex items-center gap-3">
                                <BarChart3 size={20} className="text-blue-600" />
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Analytics Dashboard</h2>
                                    <p className="text-xs text-gray-500">Catering insights</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAnalytics(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 80px)' }}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Chart */}
                                <div className="border border-gray-200 rounded-xl p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <PieChart size={16} className="text-blue-600" />
                                        Meal Preferences
                                    </h3>
                                    <div className="max-w-[250px] mx-auto">
                                        <Doughnut
                                            data={{
                                                labels: Object.keys(stats?.mealStats || {}),
                                                datasets: [{
                                                    data: Object.values(stats?.mealStats || {}),
                                                    backgroundColor: ['#10B981', '#EF4444', '#F59E0B', '#6366F1'],
                                                    borderWidth: 0,
                                                }]
                                            }}
                                            options={{
                                                cutout: '60%',
                                                plugins: { legend: { position: 'bottom' } }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Metrics */}
                                <div className="space-y-4">
                                    <div className="border border-gray-200 rounded-xl p-5">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-sm text-gray-500">Avg Satisfaction</span>
                                            <span className="text-xl font-bold text-gray-900">4.8/5.0</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-500">Attendance Rate</span>
                                            <span className="text-xl font-bold text-gray-900">92%</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <Users size={20} className="text-blue-600 mb-2" />
                                            <div className="text-2xl font-bold text-gray-900">450+</div>
                                            <div className="text-xs text-gray-500">Active Diners</div>
                                        </div>
                                        <div className="border border-gray-200 rounded-xl p-4">
                                            <TrendingDown size={20} className="text-gray-600 mb-2" />
                                            <div className="text-2xl font-bold text-gray-900">12%</div>
                                            <div className="text-xs text-gray-500">Buffer Stock</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Meal Stats */}
                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(stats?.mealStats || {}).map(([key, val]: [string, any]) => (
                                    <div key={key} className="border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-500 capitalize">{key}</p>
                                        <p className="text-lg font-bold text-gray-900">{val}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Alert */}
                            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <ShieldAlert size={20} className="text-amber-600" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-800">Inventory Alert</p>
                                        <p className="text-xs text-amber-600">Low stock detected for upcoming menu items</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors">
                                    Order Supplies
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Meal Section Component
const MealSection = ({ title, data, onAdd, onRemove }: { title: string, data: any, onAdd: (type: string) => void, onRemove: (type: string, index: number) => void }) => (
    <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
            {title}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <MealTypeCard
                title="Vegetarian"
                type="veg"
                items={data?.veg || []}
                onAdd={onAdd}
                onRemove={onRemove}
                icon={<Apple size={14} />}
                color="green"
            />
            <MealTypeCard
                title="Non-Vegetarian"
                type="nonVeg"
                items={data?.nonVeg || []}
                onAdd={onAdd}
                onRemove={onRemove}
                icon={<Beef size={14} />}
                color="red"
            />
        </div>
    </div>
);

// Meal Type Card Component
const MealTypeCard = ({ title, type, items, onAdd, onRemove, icon, color }: any) => {
    const colors: any = {
        green: 'border-green-200 bg-green-50 text-green-700',
        red: 'border-red-200 bg-red-50 text-red-700',
    };

    return (
        <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${colors[color]}`}>
                        {icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{title}</span>
                </div>
                <button
                    onClick={() => onAdd(type)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                    <Plus size={14} />
                </button>
            </div>
            <div className="space-y-2">
                {items?.length > 0 ? (
                    items.map((item: string, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-700">
                            <span>{item}</span>
                            <button
                                onClick={() => onRemove(type, i)}
                                className="text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-4 text-center border border-dashed border-gray-200 rounded-lg">
                        <p className="text-xs text-gray-400">No items added</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Mess;