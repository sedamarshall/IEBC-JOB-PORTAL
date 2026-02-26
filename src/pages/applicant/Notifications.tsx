import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, CheckCircle, AlertCircle, Info, Clock, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: number;
  created_at: string;
}

const Notifications: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`/api/notifications/${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      if (response.ok) {
        setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    for (const n of unread) {
      await markAsRead(n.id);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={18} className="text-success" />;
      case 'error': return <AlertCircle size={18} className="text-danger" />;
      default: return <Info size={18} className="text-primary" />;
    }
  };

  if (isLoading) {
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
        {notifications.some(n => !n.is_read) && (
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={notification.id}
              className={`glass-card p-4 border-l-4 transition-all ${
                notification.is_read ? 'border-gray-200 opacity-75' : 
                notification.type === 'success' ? 'border-success' :
                notification.type === 'error' ? 'border-danger' : 'border-primary'
              }`}
            >
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notification.is_read ? 'bg-gray-100' : 
                  notification.type === 'success' ? 'bg-success/10' :
                  notification.type === 'error' ? 'bg-danger/10' : 'bg-primary/10'
                }`}>
                  {getTypeIcon(notification.type)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-bold text-sm ${notification.is_read ? 'text-gray-600' : 'text-dark'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="mt-3 text-[10px] font-bold text-primary hover:underline"
                    >
                      Mark as read
                    </button>
                  )}
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
