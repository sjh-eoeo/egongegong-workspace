
import React from 'react';
import { InfluencerStatus } from '../types';

export const Button = ({ children, variant = 'primary', className = '', onClick, disabled = false, icon: Icon }: any) => {
  const baseStyle = "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    primary: "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:shadow-none",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-200 dark:hover:bg-slate-700",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-slate-800 dark:hover:text-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    accent: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-none"
  };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export const Card = ({ children, className = '', onClick }: any) => (
  <div onClick={onClick} className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 ${className}`}>
    {children}
  </div>
);

export const Badge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    [InfluencerStatus.Discovery]: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    [InfluencerStatus.Contacted]: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    [InfluencerStatus.Negotiating]: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-900/30",
    [InfluencerStatus.Approved]: "bg-indigo-50 text-indigo-600 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-900/30",
    [InfluencerStatus.ContentLive]: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
    [InfluencerStatus.Paid]: "bg-gray-900 text-white border-gray-900 dark:bg-slate-700 dark:border-slate-600",
    [InfluencerStatus.PaymentPending]: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
    'Active': "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
    'Completed': "bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    'Draft': "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400"}`}>
      {status}
    </span>
  );
};

export const MetricCard = ({ label, value, subValue, icon: Icon, active }: any) => (
  <div className={`p-5 rounded-2xl border transition-all duration-200 ${
    active 
    ? 'bg-gray-900 text-white border-gray-900 shadow-xl dark:bg-indigo-600 dark:border-indigo-500' 
    : 'bg-white text-gray-900 border-gray-100 hover:border-gray-200 dark:bg-slate-900 dark:text-white dark:border-slate-800'
  }`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-gray-50 dark:bg-slate-800'}`}>
        <Icon size={20} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
      </div>
      {subValue && <span className={`text-xs font-medium ${active ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{subValue}</span>}
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className={`text-xs ${active ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
  </div>
);

// New Component: Skeleton
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-slate-800 rounded ${className}`} />
);
