import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Bell, Search, LayoutDashboard, Users, Home, Settings, LogOut, ChevronLeft, ChevronRight, MessageSquare, Utensils } from 'lucide-react';
import clsx from 'clsx';

const SidebarItem = ({ icon: Icon, label, path, active, collapsed, onClick }: any) => (
    <div
        onClick={onClick}
        className={clsx(
            "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 group",
            active ? "bg-primary text-white shadow-soft" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
        )}
    >
        <Icon size={20} className={clsx(active ? "text-white" : "text-gray-400 group-hover:text-primary")} />
        {!collapsed && <span className="text-sm font-medium">{label}</span>}
        {collapsed && active && <div className="absolute left-16 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg">{label}</div>}
    </div>
);

const Layout = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: Users, label: 'Students', path: '/students' },
        { icon: Home, label: 'Rooms', path: '/rooms' },
        { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
        { icon: Utensils, label: 'Mess', path: '/mess' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.div
                animate={{ width: sidebarCollapsed ? 70 : 260 }}
                className="h-full bg-white border-r border-gray-200 flex flex-col relative z-20 shadow-soft"
            >
                <div className="p-4 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">
                        S
                    </div>
                    {!sidebarCollapsed && (
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-900 leading-tight">Smart HMS</span>
                            <span className="text-[10px] text-gray-400 font-medium">UNIVERSITY ADMIN</span>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <SidebarItem
                            key={item.path}
                            icon={item.icon}
                            label={item.label}
                            path={item.path}
                            active={location.pathname === item.path}
                            collapsed={sidebarCollapsed}
                            onClick={() => navigate(item.path)}
                        />
                    ))}
                </div>

                <div className="p-3 border-t border-gray-100">
                    <SidebarItem icon={LogOut} label="Sign Out" path="/logout" collapsed={sidebarCollapsed} />
                </div>

                <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 shadow-sm z-30 transform transition-transform hover:scale-110"
                >
                    {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                {/* Navbar */}
                <div className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-10 sticky top-0">
                    <div className="flex items-center gap-4">
                        {/* Breadcrumbs or Title could go here */}
                        <h2 className="text-xl font-semibold text-gray-800 tracking-tight">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors cursor-text w-64">
                                <Search size={16} className="text-gray-400" />
                                <input type="text" placeholder="Search students, rooms..." className="bg-transparent border-none outline-none text-sm w-full placeholder:text-gray-400 text-gray-700" />
                                <span className="text-xs text-gray-400 border border-gray-200 px-1.5 rounded-md">⌘K</span>
                            </div>
                        </div>

                        <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50">
                            <Bell size={20} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="w-9 h-9 bg-indigo-100 rounded-full border border-indigo-200 flex items-center justify-center text-indigo-700 font-semibold cursor-pointer hover:ring-2 hover:ring-indigo-100 transition-all">
                            JD
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
