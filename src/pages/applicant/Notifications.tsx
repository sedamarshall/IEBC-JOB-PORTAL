import React from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Loader2, Check, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-success" />;
      case 'danger':
      case 'error': return <AlertCircle size={18} className="text-danger" />;
      case 'warning': return <AlertCircle size={18} className="text-warning" />;
      default: return <Info size={18} className="text-primary" />;
    }
  };

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-dark">Notifications</h1>
          <p className="text-gray-500 text-sm">Stay updated with your application status and portal alerts.</p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <Check size={14} /> Mark all as read
          </button>
        )}
      </div>

      <div className="space-y-4">
        <AnimatePresence initial={false}>
          {notifications.map((notification) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`glass-card p-5 border-l-4 transition-all cursor-pointer hover:shadow-md ${
                notification.is_read ? 'border-gray-200 opacity-80' : 
                notification.type === 'success' ? 'border-success' :
                notification.type === 'danger' ? 'border-danger' :
                notification.type === 'warning' ? 'border-warning' : 'border-primary'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.is_read ? 'bg-gray-100' : 
                  notification.type === 'success' ? 'bg-success/10' :
                  notification.type === 'danger' ? 'bg-danger/10' :
                  notification.type === 'warning' ? 'bg-warning/10' : 'bg-primary/10'
                }`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-base ${notification.is_read ? 'text-gray-600' : 'text-dark'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock size={12} /> {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between">
                    {notification.action_url && (
                      <span className="text-xs font-bold text-primary flex items-center gap-1 uppercase tracking-wider">
                        View Details <ExternalLink size={12} />
                      </span>
                    )}
                    {!notification.is_read && (
                      <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full font-bold uppercase">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-12 glass-card">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={32} />
            </div>
            <h3 className="text-lg font-bold text-dark">No notifications yet</h3>
            <p className="text-gray-500 text-sm">We'll notify you here when there's an update to your applications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
