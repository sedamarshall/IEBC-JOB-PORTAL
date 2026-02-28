import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, User as UserIcon, ChevronDown, Check, Clock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      // In a real app with routing, we'd use navigate()
      // For this app, we might need to handle tab switching if it's an internal link
      window.location.href = notification.action_url;
    }
    setShowNotifications(false);
  };

  return (
    <header className="h-16 bg-white border-b border-border-gray flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <img 
          src="https://jobs.iebc.or.ke/logo.png" 
          alt="IEBC Logo" 
          className="h-10 w-10 object-contain"
          referrerPolicy="no-referrer"
        />
        <h2 className="text-lg font-semibold text-dark">
          National Job Recruitment Portal
        </h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-full transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] bg-danger text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white px-1">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
              >
                <div className="p-4 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                  <h3 className="font-bold text-dark text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
                    >
                      <Check size={12} /> Mark all as read
                    </button>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                      {notifications.slice(0, 5).map((notification) => (
                        <div 
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors relative ${!notification.is_read ? 'bg-primary/5' : ''}`}
                        >
                          {!notification.is_read && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
                          )}
                          <div className="flex justify-between items-start mb-1">
                            <h4 className={`text-xs font-bold ${!notification.is_read ? 'text-dark' : 'text-gray-600'}`}>
                              {notification.title}
                            </h4>
                            <span className="text-[9px] text-gray-400 flex items-center gap-1">
                              <Clock size={10} /> {new Date(notification.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                            {notification.message}
                          </p>
                          {notification.action_url && (
                            <div className="mt-2 flex items-center gap-1 text-[9px] font-bold text-primary uppercase tracking-wider">
                              View Details <ExternalLink size={8} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Bell size={24} />
                      </div>
                      <p className="text-xs text-gray-500">No notifications yet</p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => {
                    // This would ideally use setActiveTab('notifications') but Navbar doesn't have it
                    // For now, we'll just close the dropdown. 
                    // In App.tsx we could pass setActiveTab to Navbar.
                    setShowNotifications(false);
                  }}
                  className="w-full p-3 text-center text-xs font-bold text-gray-500 hover:bg-gray-50 border-t border-gray-50 transition-colors"
                >
                  View All Notifications
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3 pl-6 border-l border-border-gray">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-dark leading-none">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
          </div>
          <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
