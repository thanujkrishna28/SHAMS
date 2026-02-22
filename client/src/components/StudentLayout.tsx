import React from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { getImageUrl } from '@/utils/imageUtils';
import {
    LayoutDashboard,
    Bed,
    MessageSquare,
    CalendarDays,
    Clock,
    User,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
    ChevronRight,
    Utensils,
    Info,
    UserPlus,
    Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationList from './NotificationList';
import { useNotifications } from '../hooks/useNotifications';

const StudentLayout = () => {
    const { user, logout, fetchProfile } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = React.useState(false);
    const { data: notifications } = useNotifications();

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    React.useEffect(() => {
        fetchProfile();
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Profile', path: '/student/profile', icon: User },
        { name: 'My Room', path: '/student/room', icon: Bed },
        { name: 'Find Room', path: '/student/selection', icon: Building },
        { name: 'Attendance', path: '/student/attendance', icon: Clock },
        { name: 'Mess', path: '/student/mess', icon: Utensils },
        { name: 'Leave', path: '/student/leave', icon: CalendarDays },
        { name: 'Visitors', path: '/student/visitors', icon: UserPlus },
        { name: 'Complaints', path: '/student/complaints', icon: MessageSquare },
        { name: 'About', path: '/student/about', icon: Info },
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden bg-surface border-b border-border p-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">S</div>
                    <span className="font-bold text-gray-900">Smart HMS</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside
                    className={`
                fixed inset-y-0 left-0 z-40 w-64 bg-surface border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto lg:shadow-none
                ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}
                >
                    <div className="flex flex-col h-full">
                        {/* Logo Area */}
                        <div className="h-16 flex items-center px-6 border-b border-border/50">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-lg shadow-primary/20">
                                S
                            </div>
                            <span className="font-bold text-gray-900 text-lg tracking-tight">Smart HMS</span>
                        </div>

                        {/* User Profile Snippet */}
                        <div className="p-4 border-b border-border/50 bg-gray-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-primary-hover flex items-center justify-center text-white font-semibold shadow-md overflow-hidden">
                                    {user?.profile?.profileImage ? (
                                        <img
                                            src={getImageUrl(user.profile.profileImage) || ''}
                                            alt="User"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        user?.name?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Student'}</p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
                                    ${isActive
                                                ? 'bg-primary/10 text-primary shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }
                                `}
                                    >
                                        <item.icon size={20} className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                        {item.name}
                                        {isActive && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
                                    </NavLink>
                                );
                            })}
                        </nav>

                        {/* Footer Actions */}
                        <div className="p-4 border-t border-border/50">
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={20} />
                                Sign Out
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">
                    {/* Top Navbar */}
                    <header className="h-16 bg-surface/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 z-20">
                        {/* Breadcrumbs / Page Title */}
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="hidden lg:inline">Student Portal</span>
                            <ChevronRight size={16} className="hidden lg:inline" />
                            <span className="font-semibold text-gray-900 capitalize">
                                {location.pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
                            </span>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 relative">
                            <div className="relative hidden md:block">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 transition-all"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <Bell size={20} />
                                    {unreadCount > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                                    )}
                                </button>
                                <AnimatePresence>
                                    {isNotificationOpen && (
                                        <NotificationList isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </header>

                    {/* Content Area */}
                    <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pb-24 lg:pb-8">
                        <div className="max-w-7xl mx-auto">
                            <Outlet />
                        </div>
                    </main>
                </div>

                {/* Mobile Bottom Nav */}
                <AnimatePresence>
                    {!isMobileMenuOpen && (
                        <motion.div
                            initial={{ y: 100 }}
                            animate={{ y: 0 }}
                            exit={{ y: 100 }}
                            className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-lg border-t border-border px-4 py-2 flex items-center justify-around z-40 shadow-up"
                        >
                            {navItems.slice(0, 5).map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}
                                    >
                                        <item.icon size={20} />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
                                    </NavLink>
                                );
                            })}
                            <button
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="flex flex-col items-center gap-1 p-2 text-gray-400"
                            >
                                <Menu size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">More</span>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/60 z-[35] lg:hidden backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentLayout;
