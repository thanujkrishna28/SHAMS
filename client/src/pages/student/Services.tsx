import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Bed,
    Building,
    Clock,
    Utensils,
    CreditCard,
    Shirt,
    Package,
    UserPlus,
    MessageSquare,
    Trophy,
    CalendarDays,
    ChevronRight,
} from 'lucide-react';

const Services = () => {
    const navigate = useNavigate();

    const categories = [
        {
            title: "Room & Attendance",
            items: [
                { name: 'My Room', path: '/student/room', icon: Bed, color: 'bg-blue-500', desc: 'View room details & roommates' },
                { name: 'Find Room', path: '/student/selection', icon: Building, color: 'bg-indigo-500', desc: 'Explore and book available rooms' },
                { name: 'Attendance', path: '/student/attendance', icon: Clock, color: 'bg-emerald-500', desc: 'Daily QR check-in/out logs' },
            ]
        },
        {
            title: "Dining & Finance",
            items: [
                { name: 'Mess Menu', path: '/student/mess', icon: Utensils, color: 'bg-orange-500', desc: 'Weekly food schedule & ratings' },
                { name: 'Fees & Payments', path: '/student/fees', icon: CreditCard, color: 'bg-rose-500', desc: 'Invoice history & online pay' },
            ]
        },
        {
            title: "Hostel Services",
            items: [
                { name: 'Smart Laundry', path: '/student/laundry', icon: Shirt, color: 'bg-sky-500', desc: 'Machine availability & booking' },
                { name: 'Parcel Management', path: '/student/parcels', icon: Package, color: 'bg-amber-500', desc: 'Track arrivals & pickup codes' },
                { name: 'Visitors', path: '/student/visitors', icon: UserPlus, color: 'bg-violet-500', desc: 'Pre-approve your guests' },
            ]
        },
        {
            title: "Help & Support",
            items: [
                { name: 'My Complaints', path: '/student/complaints', icon: MessageSquare, color: 'bg-red-500', desc: 'Report issues & track repair' },
                { name: 'Lost & Found', path: '/student/lost-found', icon: Trophy, color: 'bg-yellow-500', desc: 'Recover or report items' },
                { name: 'Leave Application', path: '/student/leave', icon: CalendarDays, color: 'bg-teal-500', desc: 'Night out & vacation passes' },
            ]
        }
    ];

    return (
        <div className="space-y-10 pb-12">
            <div>
                <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Control Center</h1>
                <p className="text-slate-500 font-medium">Access all your hostel utilities and services from one place.</p>
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
                                    className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 text-left flex items-start gap-5 relative overflow-hidden active:scale-[0.98]"
                                >
                                    {/* Glass decoration */}
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                                    <div className={`shrink-0 w-16 h-16 rounded-3xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-${item.color.split('-')[1]}-200 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                                        <item.icon size={28} />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
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

export default Services;
