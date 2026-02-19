import React from 'react';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '../hooks/useNotifications';
import { Bell, Check, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

interface NotificationListProps {
    isOpen: boolean;
    onClose: () => void;
}

const NotificationList: React.FC<NotificationListProps> = ({ isOpen, onClose }) => {
    const { data: notifications, isLoading } = useNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const markAllReadMutation = useMarkAllNotificationsAsRead();

    if (!isOpen) return null;

    const unreadCount = notifications?.filter(n => !n.read).length || 0;

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={16} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'alert': return <AlertTriangle size={16} className="text-rose-500" />;
            default: return <Info size={16} className="text-blue-500" />;
        }
    };

    const handleMarkAsRead = (id: string) => {
        markAsReadMutation.mutate(id);
    };

    const handleMarkAllAsRead = () => {
        markAllReadMutation.mutate();
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed md:absolute top-16 md:top-auto right-4 left-4 md:left-auto md:right-0 mt-2 w-auto md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[100] origin-top-right ring-1 ring-black/5"
        >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-slate-900" />
                    <h3 className="font-bold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Loading...</div>
                ) : notifications?.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 flex flex-col items-center gap-2">
                        <Bell size={24} className="opacity-20" />
                        <p className="text-sm">No notifications yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {notifications?.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 hover:bg-gray-50 transition-colors relative group ${!notification.read ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="flex gap-3 items-start">
                                    <div className={`mt-0.5 p-1.5 rounded-full ${!notification.read ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-semibold text-slate-900 ${!notification.read ? 'font-bold' : ''}`}>
                                            {notification.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-0.5 break-words line-clamp-3">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.read && (
                                        <button
                                            onClick={() => handleMarkAsRead(notification._id)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-blue-600"
                                            title="Mark as read"
                                        >
                                            <Check size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
                <button onClick={onClose} className="text-xs font-semibold text-gray-500 hover:text-gray-900">
                    Close
                </button>
            </div>
        </motion.div>
    );
};

export default NotificationList;
