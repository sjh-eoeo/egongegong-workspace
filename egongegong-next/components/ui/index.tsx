'use client';

import React from 'react';
import { InfluencerStatus } from '../../types';
import { LucideIcon } from 'lucide-react';
import { formatInputNumber, parseFormattedNumber } from '../../lib/utils';
import { EmptyState, LoadingState, ErrorState, DataWrapper } from './DataStates';

// Re-export data state components
export { EmptyState, LoadingState, ErrorState, DataWrapper };

// Re-export DataTable
export { DataTable } from './DataTable';
export type { Column, DataTableProps, SortDirection } from './DataTable';

interface ButtonProps {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent';
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean;
  icon?: LucideIcon;
  type?: 'button' | 'submit' | 'reset';
}

export const Button = ({ children, variant = 'primary', className = '', onClick, disabled = false, icon: Icon, type = 'button' }: ButtonProps) => {
  const baseStyle = "px-4 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variants = {
    primary: "bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 dark:shadow-none",
    secondary: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-700",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
    accent: "bg-gray-700 hover:bg-gray-600 text-white shadow-lg shadow-gray-200 dark:shadow-none"
  };
  
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card = ({ children, className = '', onClick }: CardProps) => (
  <div onClick={onClick} className={`bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  status: string;
}

export const Badge = ({ status }: BadgeProps) => {
  const styles: Record<string, string> = {
    [InfluencerStatus.Discovery]: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    [InfluencerStatus.Contacted]: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30",
    [InfluencerStatus.Negotiating]: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600",
    [InfluencerStatus.Contracted]: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
    [InfluencerStatus.Approved]: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    [InfluencerStatus.ContentLive]: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30",
    [InfluencerStatus.Paid]: "bg-gray-900 text-white border-gray-900 dark:bg-gray-700 dark:border-gray-600",
    [InfluencerStatus.PaymentPending]: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30",
    'Active': "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30",
    'Completed': "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    'Draft': "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/30",
  };
  
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${styles[status] || "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"}`}>
      {status}
    </span>
  );
};

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  active?: boolean;
}

export const MetricCard = ({ label, value, subValue, icon: Icon, active }: MetricCardProps) => (
  <div className={`p-5 rounded-2xl border transition-all duration-200 ${
    active 
    ? 'bg-gray-900 text-white border-gray-900 shadow-xl dark:bg-gray-800 dark:border-gray-700' 
    : 'bg-white text-gray-900 border-gray-100 hover:border-gray-200 dark:bg-gray-900 dark:text-white dark:border-gray-800'
  }`}>
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 rounded-lg ${active ? 'bg-white/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
        <Icon size={20} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
      </div>
      {subValue && <span className={`text-xs font-medium ${active ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{subValue}</span>}
    </div>
    <h3 className="text-2xl font-bold mb-1">{value}</h3>
    <p className={`text-xs ${active ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
  </div>
);

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`} />
);

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = 'Input';

// NumberInput Component - Auto-formats numbers with thousand separators
interface NumberInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  label?: string;
  error?: string;
  value: number | string;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ label, error, className = '', value, onChange, prefix, suffix, ...props }, ref) => {
    // Calculate displayValue directly from value (no state)
    const numValue = typeof value === 'string' ? parseFormattedNumber(value) : value;
    const displayValue = numValue ? formatInputNumber(String(numValue)) : '';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const formatted = formatInputNumber(rawValue);
      onChange(parseFormattedNumber(formatted));
    };

    return (
      <div className="space-y-1">
        {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <div className="relative">
          {prefix && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-colors ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${error ? 'border-red-500' : ''} ${className}`}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
NumberInput.displayName = 'NumberInput';

// Select Component
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = ({ label, options, className = '', ...props }: SelectProps) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <select
      className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-colors ${className}`}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = ({ label, className = '', ...props }: TextareaProps) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <textarea
      className={`w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500 transition-colors resize-none ${className}`}
      {...props}
    />
  </div>
);

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }: ModalProps) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl ${sizes[size]} w-full max-h-[90vh] overflow-hidden`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
          <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Tabs Component
interface TabsProps {
  tabs: { id: string; label: string; icon?: LucideIcon }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => (
  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === tab.id
            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        {tab.icon && <tab.icon size={16} />}
        {tab.label}
      </button>
    ))}
  </div>
);
