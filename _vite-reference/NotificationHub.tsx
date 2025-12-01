
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Bell, CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (type: 'success' | 'error' | 'info', title: string, message: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const newNote: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNote, ...prev]);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };
  
  const clearAll = () => {
      setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAllAsRead, clearAll }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const NotificationHub = () => {
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = () => {
      if (!isOpen) markAllAsRead();
      setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={ref}>
      <button 
        onClick={toggle}
        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
              <button onClick={clearAll} className="text-[10px] text-gray-400 hover:text-red-500">Clear All</button>
           </div>
           
           <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(note => (
                  <div key={note.id} className={`p-4 border-b border-gray-50 dark:border-slate-800/50 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors ${!note.read ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}>
                      <div className="flex gap-3">
                          <div className={`mt-0.5 ${
                              note.type === 'success' ? 'text-emerald-500' :
                              note.type === 'error' ? 'text-red-500' : 'text-blue-500'
                          }`}>
                              {note.type === 'success' ? <CheckCircle size={14} /> : 
                               note.type === 'error' ? <AlertCircle size={14} /> : <Info size={14} />}
                          </div>
                          <div>
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{note.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{note.message}</p>
                              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">{new Date(note.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                      </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-xs">
                   No new notifications
                </div>
              )}
           </div>
        </div>
      )}
    </div>
  );
};
