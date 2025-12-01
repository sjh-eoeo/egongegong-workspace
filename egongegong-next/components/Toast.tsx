'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  addToast: (type: ToastType, title: string, message?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op implementation if used outside provider (for safety)
    return {
      addToast: () => {},
      removeToast: () => {}
    };
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto min-w-[320px] max-w-sm bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-3 animate-in slide-in-from-right-10 duration-300"
          >
             <div className={`mt-0.5 p-1 rounded-full ${
               toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 
               toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 
               'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
             }`}>
                {toast.type === 'success' && <CheckCircle size={16} />}
                {toast.type === 'error' && <AlertCircle size={16} />}
                {toast.type === 'info' && <Info size={16} />}
             </div>
             <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white">{toast.title}</h4>
                {toast.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{toast.message}</p>}
             </div>
             <button 
               onClick={() => removeToast(toast.id)} 
               className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
             >
               <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
