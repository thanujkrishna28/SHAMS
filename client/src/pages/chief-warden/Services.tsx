import { useNavigate } from 'react-router-dom';
import {
    Users,
    Bed,
    ClipboardCheck,
    Utensils,
    CreditCard,
    CalendarDays,
    ShieldCheck,
    MessageSquare,
    Lock,
    Database,
    ChevronRight,
    Home,
    Command,
    Globe,
    Cpu,
    Activity,
    Lock
} from 'lucide-react';

const Services = () => {
    const navigate = useNavigate();

    const categories = [
        {
            title: "Infrastructure Management",
            items: [
                { name: 'Hostels', path: '/chief-warden/hostels', icon: Home, color: 'bg-blue-600', desc: 'Manage hostel blocks and wings' },
                { name: 'Rooms', path: '/chief-warden/rooms', icon: Bed, color: 'bg-blue-500', desc: 'Room occupancy and status monitor' },
                { name: 'Allocations', path: '/chief-warden/allocations', icon: ClipboardCheck, color: 'bg-green-600', desc: 'Student room assignments' },
            ]
        },
        {
            title: "User & Service Control",
            items: [
                { name: 'Students', path: '/chief-warden/students', icon: Users, color: 'bg-purple-600', desc: 'Student verification registry' },
                { name: 'Mess', path: '/chief-warden/mess', icon: Utensils, color: 'bg-orange-600', desc: 'Menu and feedback management' },
                { name: 'Fees', path: '/chief-warden/fees', icon: CreditCard, color: 'bg-rose-600', desc: 'Billing and collection hub' },
            ]
        },
        {
            title: "Operations & Monitoring",
            items: [
                { name: 'Leaves', path: '/chief-warden/leaves', icon: CalendarDays, color: 'bg-teal-600', desc: 'Student leave requests' },
                { name: 'Visitors', path: '/chief-warden/visitors', icon: UserCheck, color: 'bg-amber-600', desc: 'Visitor gate clearance' },
                { name: 'Complaints', path: '/chief-warden/complaints', icon: MessageSquare, color: 'bg-red-600', desc: 'Incident reporting' },
            ]
        },
        {
            title: "Staff & System Control",
            items: [
                { name: 'Wardens', path: '/chief-warden/wardens', icon: Lock, color: 'bg-gray-700', desc: 'Warden management' },
                { name: 'Settings', path: '/chief-warden/settings', icon: Database, color: 'bg-gray-500', desc: 'System configuration' },
            ]
        }
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <h1 className="text-2xl font-bold text-gray-900">Service Hub</h1>
                            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">Active</span>
                        </div>
                        <p className="text-gray-500 text-sm">
                            Centralized interface for hostel management operations
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Cpu size={16} className="text-gray-600" />
                                <p className="text-xs font-medium text-gray-500">System Core</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">Version 4.2.0</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Activity size={16} className="text-gray-600" />
                                <p className="text-xs font-medium text-gray-500">Uptime</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">99.9%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Service Categories */}
            <div className="space-y-10">
                {categories.map((category, idx) => (
                    <div key={category.title}>
                        <div className="flex items-center gap-4 mb-6">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {category.title}
                            </h2>
                            <div className="h-px flex-1 bg-gray-200" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {category.items.map((item) => (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className="group bg-white p-6 rounded-xl border border-gray-200 shadow-sm transition-all text-left hover:shadow-md hover:border-gray-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${item.color} text-white shadow-sm`}>
                                            <item.icon size={20} />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600 transition-colors">
                                            <ChevronRight size={16} />
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {item.desc}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                    <Lock size={14} />
                    <span className="text-xs font-medium">Secure Session Active</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span className="text-xs text-gray-600">Gateway Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-xs text-gray-600">Protocol 4.2.0</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Services;