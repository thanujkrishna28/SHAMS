import React from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
    Shield,
    CheckCircle,
    LogOut,
    Menu,
    X,
    Package,
    Users,
    CreditCard,
    Home,
    BedDouble,
    Utensils,
    MessageSquare,
    Calendar,
    UserCheck,
    History,
    LayoutDashboard
} from 'lucide-react';

const WardenLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const wardenItems = [
        { name: 'Live Dashboard', path: '/chief-warden/stats', icon: LayoutDashboard },
        { name: 'Attendance Round', path: '/warden/attendance', icon: CheckCircle },
        { name: 'Complaints Hub', path: '/warden/complaints', icon: MessageSquare },
        { name: 'Visitor Registry', path: '/warden/visitors', icon: UserCheck },
        { name: 'Student Directory', path: '/warden/students', icon: Users },
        { name: 'Parcel Logistics', path: '/warden/parcels', icon: Package },
    ];

    const chiefWardenItems = [
        { name: 'Command Center', path: '/chief-warden/stats', icon: LayoutDashboard },
        { name: 'Hostel Infrastructure', path: '/chief-warden/hostels', icon: Home },
        { name: 'Room Inventory', path: '/chief-warden/rooms', icon: BedDouble },
        { name: 'Sector Allocations', path: '/chief-warden/allocations', icon: CheckCircle },
        { name: 'Resident Registry', path: '/chief-warden/students', icon: Users },
        { name: 'Command Staff', path: '/chief-warden/wardens', icon: Shield },
        { name: 'Financial Ledger', path: '/chief-warden/fees', icon: CreditCard },
        { name: 'Mess Protocols', path: '/chief-warden/mess', icon: Utensils },
        { name: 'Support Tickets', path: '/chief-warden/complaints', icon: MessageSquare },
        { name: 'Exit Clearances', path: '/chief-warden/leaves', icon: Calendar },
        { name: 'Visitor Clearance', path: '/chief-warden/visitors', icon: UserCheck },
        { name: 'Audit Registry', path: '/chief-warden/audit-logs', icon: History },
        { name: 'Security Settings', path: '/chief-warden/settings', icon: Shield },
    ];

    const navItems = user?.role === 'chief_warden' ? chiefWardenItems : wardenItems;

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* Sidebar - Enterprise Matte Slate */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl shadow-slate-900/50' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Brand Identity */}
                    <div
                        onClick={() => navigate('/')}
                        className="h-20 flex items-center px-6 gap-3 cursor-pointer border-b border-slate-800/40 hover:bg-slate-800/20 transition-all group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/40 group-hover:scale-105 transition-transform duration-300">
                            <Shield className="text-white" size={20} />
                        </div>
                        <div>
                            <span className="block font-bold text-white tracking-tight text-sm uppercase">SHAMS</span>
                            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Enterprise OS</span>
                        </div>
                    </div>

                    {/* Navigation Engine */}
                    <nav className="flex-1 px-4 py-8 space-y-1 overflow-y-auto custom-scrollbar scrollbar-none">
                        <p className="px-4 mb-4 text-[10px] font-bold text-slate-600 uppercase tracking-[0.25em]">Control Systems</p>
                        {navItems.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={({ isActive }) => `
                                    flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all relative group
                                    ${isActive
                                        ? 'bg-indigo-600/10 text-indigo-400 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        {isActive && (
                                            <div className="absolute left-0 w-1 h-5 bg-indigo-500 rounded-r-full shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                                        )}
                                        <item.icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300 transition-colors'} />
                                        <span className="tracking-tight">{item.name}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Operator Profile */}
                    <div className="p-4 border-t border-slate-800 bg-slate-900/80 backdrop-blur-xl">
                        <div className="px-3 py-3 bg-slate-800/30 rounded-xl mb-3 flex items-center gap-3 border border-slate-800/50">
                            <div className="w-9 h-9 rounded bg-slate-700 flex items-center justify-center text-[12px] font-bold text-white border border-slate-600 shadow-inner">
                                {user?.name?.charAt(0)}
                            </div>
                            <div className="min-w-0">
                                <p className="text-[12px] font-bold text-white truncate leading-none mb-1">{user?.name}</p>
                                <p className="text-[9px] text-indigo-400 font-bold uppercase tracking-widest">{user?.role?.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all border border-transparent hover:border-rose-500/20 active:scale-[0.98]"
                        >
                            <LogOut size={14} />
                            Log Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Viewport Layer */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Mobile Header Interface */}
                <div className="lg:hidden h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 shadow-lg z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <Shield className="text-white" size={16} />
                        </div>
                        <span className="text-sm font-bold text-white tracking-widest uppercase">SHAMS</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2.5 bg-slate-800 text-slate-200 rounded-lg active:scale-95 transition-all"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto bg-[#F8FAFC] custom-scrollbar selection:bg-indigo-100">
                    <div className="p-4 md:p-6 lg:p-10 pb-24 lg:pb-10 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            {!isMobileMenuOpen && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-2 py-1 flex items-center justify-around z-40 shadow-2xl">
                    {(user?.role === 'chief_warden'
                        ? [
                            { name: 'Home', path: '/chief-warden/stats', icon: LayoutDashboard },
                            { name: 'Hostels', path: '/chief-warden/hostels', icon: Home },
                            { name: 'Rooms', path: '/chief-warden/rooms', icon: BedDouble },
                            { name: 'Alloc', path: '/chief-warden/allocations', icon: CheckCircle },
                            { name: 'More', path: null, icon: Menu },
                          ]
                        : [
                            { name: 'Dashboard', path: '/chief-warden/stats', icon: LayoutDashboard },
                            { name: 'Attendance', path: '/warden/attendance', icon: CheckCircle },
                            { name: 'Complaints', path: '/warden/complaints', icon: MessageSquare },
                            { name: 'Visitors', path: '/warden/visitors', icon: UserCheck },
                            { name: 'More', path: null, icon: Menu },
                          ]
                    ).map((item) =>
                        item.path ? (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg transition-all ${
                                        isActive ? 'text-indigo-400' : 'text-slate-500'
                                    }`
                                }
                            >
                                <item.icon size={20} />
                                <span className="text-[9px] font-bold uppercase tracking-tight">{item.name}</span>
                            </NavLink>
                        ) : (
                            <button
                                key="more"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex flex-col items-center gap-0.5 px-2 py-1.5 text-slate-500 rounded-lg"
                            >
                                <Menu size={20} />
                                <span className="text-[9px] font-bold uppercase tracking-tight">More</span>
                            </button>
                        )
                    )}
                </div>
            )}

            {/* Backdrop Logic */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/60 backdrop-blur-[2px] z-30 lg:hidden transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default WardenLayout;

