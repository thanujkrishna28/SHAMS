import React from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import {
    Shield,
    History,
    LogOut,
    Bell,
    Menu,
    X,
} from 'lucide-react';

const SecurityLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'QR Scanner', path: '/security/scanner', icon: Shield },
        { name: 'Scan History', path: '/security/history', icon: History },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Mobile Header */}
            <div className="lg:hidden bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-2 text-white">
                    <Shield className="text-emerald-500" />
                    <span className="font-bold">Security Console</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-400">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <aside className={`
                    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-auto
                    ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                `}>
                    <div className="flex flex-col h-full">
                        <div className="h-16 flex items-center px-6 border-b border-slate-800">
                            <Shield className="text-emerald-500 mr-3" />
                            <span className="font-bold text-lg">Smart HMS Guard</span>
                        </div>

                        <nav className="flex-1 px-3 py-6 space-y-2">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={({ isActive }) => `
                                        flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                                        ${isActive ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}
                                    `}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>

                        <div className="p-4 border-t border-slate-800">
                            <div className="mb-4 text-xs text-slate-500 px-4 font-bold uppercase tracking-widest">
                                Signed In As
                            </div>
                            <div className="px-4 py-3 bg-slate-800/50 rounded-xl mb-4">
                                <p className="text-sm font-bold truncate">{user?.name}</p>
                                <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">{user?.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                                <LogOut size={20} />
                                Logout Terminal
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <main className="flex-1 overflow-auto p-4 lg:p-10">
                        <Outlet />
                    </main>
                </div>

                {isMobileMenuOpen && (
                    <div className="fixed inset-0 bg-slate-900/60 z-30 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
                )}
            </div>
        </div>
    );
};

export default SecurityLayout;
