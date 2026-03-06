import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2,
    Users,
    Bed,
    ClipboardCheck,
    Utensils,
    CreditCard,
    CalendarDays,
    ShieldCheck,
    MessageSquare,
    Scan,
    Settings,
    ChevronRight,
    Database,
} from 'lucide-react';

const AdminServices = () => {
    const navigate = useNavigate();

    const categories = [
        {
            title: "Infrastructure Management",
            items: [
                { name: 'Hostels', path: '/admin/hostels', icon: Building2, color: 'bg-indigo-500', desc: 'Manage hostel blocks & details' },
                { name: 'Rooms', path: '/admin/rooms', icon: Bed, color: 'bg-blue-500', desc: 'Monitor room occupancy & status' },
                { name: 'Allocations', path: '/admin/allocations', icon: ClipboardCheck, color: 'bg-emerald-500', desc: 'Handle student room assignments' },
            ]
        },
        {
            title: "User & Service Control",
            items: [
                { name: 'Students', path: '/admin/students', icon: Users, color: 'bg-violet-500', desc: 'Registry of all resident students' },
                { name: 'Mess Management', path: '/admin/mess', icon: Utensils, color: 'bg-orange-500', desc: 'Diet schedules & feedback tracking' },
                { name: 'Fee Management', path: '/admin/fees', icon: CreditCard, color: 'bg-rose-500', desc: 'Billing, invoices & payment logs' },
            ]
        },
        {
            title: "Operations & Monitoring",
            items: [
                { name: 'Leave History', path: '/admin/leaves', icon: CalendarDays, color: 'bg-teal-500', desc: 'Vacation & night-out requests' },
                { name: 'Visitor Logs', path: '/admin/visitors', icon: ShieldCheck, color: 'bg-amber-500', desc: 'Gate entry records & pre-approvals' },
                { name: 'Complaint Desk', path: '/admin/complaints', icon: MessageSquare, color: 'bg-red-500', desc: 'Resolution center for student issues' },
            ]
        },
        {
            title: "System Utilities",
            items: [
                { name: 'QR Scanner', path: '/admin/scanner', icon: Scan, color: 'bg-slate-700', desc: 'Quick scan for attendance/visitors' },
                { name: 'Settings', path: '/admin/settings', icon: Settings, color: 'bg-slate-400', desc: 'Global system configuration' },
            ]
        }
    ];

    return (
        <div className="space-y-10 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Admin Control Center</h1>
                    <p className="text-slate-500 font-medium text-lg">Central hub for ecosystem management and operations.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                        <Database size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Database Status</p>
                        <p className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Connected & Operational
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {categories.map((category, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={category.title}
                        className="space-y-6"
                    >
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                            <span className="w-8 h-px bg-slate-200" />
                            {category.title}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {category.items.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-secondary/20 transition-all duration-300 text-left flex items-start gap-5 relative overflow-hidden active:scale-[0.98]"
                                >
                                    {/* Decoration */}
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-secondary/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                                    <div className={`shrink-0 w-16 h-16 rounded-3xl ${item.color} flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-${item.color.split('-')[1]}-200`}>
                                        <item.icon size={28} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-black text-slate-900 group-hover:text-secondary transition-colors">{item.name}</h3>
                                            <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminServices;
