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
    Sparkles,
    MapPin,
    QrCode,
    Star,
    Shield,
    HelpCircle,
    Bell,
    Wallet,
    Coffee,
    Wifi,
    Zap
} from 'lucide-react';

const Services = () => {
    const navigate = useNavigate();

    const categories = [
        {
            title: "Accommodation",
            subtitle: "Manage your living space",
            items: [
                {
                    name: 'My Room',
                    path: '/student/room',
                    icon: Bed,
                    gradient: 'from-blue-500 to-blue-600',
                    desc: 'View room details & roommates',
                    badge: 'Current',
                    badgeColor: 'bg-blue-100 text-blue-700'
                },
                {
                    name: 'Find Room',
                    path: '/student/selection',
                    icon: Building,
                    gradient: 'from-indigo-500 to-indigo-600',
                    desc: 'Explore and book available rooms',
                    badge: 'Available',
                    badgeColor: 'bg-emerald-100 text-emerald-700'
                },
                {
                    name: 'Attendance',
                    path: '/student/attendance',
                    icon: QrCode,
                    gradient: 'from-emerald-500 to-emerald-600',
                    desc: 'Daily QR check-in/out logs',
                    badge: 'Active',
                    badgeColor: 'bg-amber-100 text-amber-700'
                },
            ]
        },
        {
            title: "Dining & Finance",
            subtitle: "Meals and payments",
            items: [
                {
                    name: 'Mess Menu',
                    path: '/student/mess',
                    icon: Utensils,
                    gradient: 'from-orange-500 to-orange-600',
                    desc: 'Weekly food schedule & ratings',
                    badge: 'Weekly',
                    badgeColor: 'bg-orange-100 text-orange-700'
                },
                {
                    name: 'Fees & Payments',
                    path: '/student/fees',
                    icon: Wallet,
                    gradient: 'from-rose-500 to-rose-600',
                    desc: 'Invoice history & online pay',
                    badge: 'Secure',
                    badgeColor: 'bg-rose-100 text-rose-700'
                },
            ]
        },
        {
            title: "Facilities",
            subtitle: "Smart hostel amenities",
            items: [
                {
                    name: 'Smart Laundry',
                    path: '/student/laundry',
                    icon: Shirt,
                    gradient: 'from-sky-500 to-sky-600',
                    desc: 'Machine availability & booking',
                    badge: 'IoT Enabled',
                    badgeColor: 'bg-sky-100 text-sky-700'
                },
                {
                    name: 'Parcel Management',
                    path: '/student/parcels',
                    icon: Package,
                    gradient: 'from-amber-500 to-amber-600',
                    desc: 'Track arrivals & pickup codes',
                    badge: 'Tracking',
                    badgeColor: 'bg-amber-100 text-amber-700'
                },
                {
                    name: 'Visitors',
                    path: '/student/visitors',
                    icon: UserPlus,
                    gradient: 'from-violet-500 to-violet-600',
                    desc: 'Pre-approve your guests',
                    badge: 'Pre-approval',
                    badgeColor: 'bg-violet-100 text-violet-700'
                },
            ]
        },
        {
            title: "Support",
            subtitle: "Assistance when you need it",
            items: [
                {
                    name: 'My Complaints',
                    path: '/student/complaints',
                    icon: MessageSquare,
                    gradient: 'from-red-500 to-red-600',
                    desc: 'Report issues & track repair',
                    badge: '24/7',
                    badgeColor: 'bg-red-100 text-red-700'
                },
                {
                    name: 'Lost & Found',
                    path: '/student/lost-found',
                    icon: Trophy,
                    gradient: 'from-yellow-500 to-yellow-600',
                    desc: 'Recover or report items',
                    badge: 'Community',
                    badgeColor: 'bg-yellow-100 text-yellow-700'
                },
                {
                    name: 'Leave Application',
                    path: '/student/leave',
                    icon: CalendarDays,
                    gradient: 'from-teal-500 to-teal-600',
                    desc: 'Night out & vacation passes',
                    badge: 'Approval',
                    badgeColor: 'bg-teal-100 text-teal-700'
                },
            ]
        }
    ];

    // Quick stats for dashboard feel
    const quickStats = [
        { label: 'Active Services', value: '12', icon: Zap, color: 'bg-indigo-50 text-indigo-600' },
        { label: 'Pending Tasks', value: '3', icon: Bell, color: 'bg-amber-50 text-amber-600' },
        { label: 'Support Tickets', value: '2', icon: HelpCircle, color: 'bg-rose-50 text-rose-600' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Section */}
                <div className="mb-10">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mb-2">
                        <span>STUDENT SERVICES</span>
                        <span className="text-gray-300">|</span>
                        <span>Hostel Management System</span>
                    </div>
                    <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                                Service{' '}
                                <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Control Center
                                </span>
                            </h1>
                            <p className="text-gray-500 mt-1 text-sm">
                                Access all hostel utilities and services from one unified dashboard
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-3">
                            {quickStats.map((stat, idx) => (
                                <div key={idx} className="bg-white rounded-lg border border-gray-100 px-3 py-2 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1 rounded ${stat.color}`}>
                                            <stat.icon size={12} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-900 leading-none">{stat.value}</p>
                                            <p className="text-[9px] text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Service Categories */}
                <div className="space-y-10">
                    {categories.map((category, idx) => (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={category.title}
                            className="space-y-5"
                        >
                            {/* Category Header */}
                            <div className="flex items-baseline justify-between flex-wrap gap-2">
                                <div>
                                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {category.title}
                                    </h2>
                                    <p className="text-xs text-gray-500 mt-0.5">{category.subtitle}</p>
                                </div>
                                <div className="h-px flex-1 bg-gradient-to-r from-gray-100 to-transparent hidden lg:block" />
                            </div>

                            {/* Service Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {category.items.map((item, itemIdx) => (
                                    <motion.button
                                        key={item.path}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate(item.path)}
                                        className="group relative bg-white rounded-xl border border-gray-100 p-5 text-left hover:shadow-lg hover:border-gray-200 transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Hover Gradient Effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                                        {/* Content */}
                                        <div className="relative flex items-start gap-4">
                                            {/* Icon */}
                                            <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-md transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3`}>
                                                <item.icon size={20} />
                                            </div>

                                            {/* Text Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {item.name}
                                                    </h3>
                                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed">
                                                    {item.desc}
                                                </p>
                                                {/* Badge */}
                                                <div className="mt-2">
                                                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-medium ${item.badgeColor}`}>
                                                        {item.badge}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Access Footer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 pt-6 border-t border-gray-100"
                >
                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50/30 rounded-xl p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <Sparkles size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-900">Need Assistance?</p>
                                    <p className="text-xs text-gray-500">Contact hostel office or raise a support ticket</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate('/student/complaints')}
                                    className="px-4 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Submit Complaint
                                </button>
                                <button
                                    onClick={() => navigate('/student/leave')}
                                    className="px-4 py-2 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-indigo-600 transition-colors"
                                >
                                    Apply for Leave
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Services;