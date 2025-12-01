
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
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    // Auto dismiss
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div 
            key={toast.id} 
            className="pointer-events-auto min-w-[320px] max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 p-4 flex items-start gap-3 animate-in slide-in-from-right-10 duration-300"
          >
             <div className={`mt-0.5 p-1 rounded-full ${
               toast.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 
               toast.type === 'error' ? 'bg-red-100 text-red-600' : 
               'bg-blue-100 text-blue-600'
             }`}>
                {toast.type === 'success' && <CheckCircle size={16} />}
                {toast.type === 'error' && <AlertCircle size={16} />}
                {toast.type === 'info' && <Info size={16} />}
             </div>
             <div className="flex-1">
                <h4 className="text-sm font-bold text-gray-900">{toast.title}</h4>
                {toast.message && <p className="text-xs text-gray-500 mt-1 leading-relaxed">{toast.message}</p>}
             </div>
             <button 
               onClick={() => removeToast(toast.id)} 
               className="text-gray-400 hover:text-gray-600 transition-colors"
             >
               <X size={14} />
             </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
