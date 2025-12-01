'use client';

import React from 'react';
import { LucideIcon, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Spinner, Button } from '@heroui/react';

// Empty State Component
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = Inbox, 
  title, 
  description, 
  action 
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
      <Icon size={28} className="text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    {description && (
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{description}</p>
    )}
    {action && (
      <Button 
        color="primary"
        radius="lg"
        startContent={action.icon && <action.icon size={16} />}
        onPress={action.onClick}
        className="font-medium"
      >
        {action.label}
      </Button>
    )}
  </div>
);

// Loading State Component
interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <Spinner size="lg" className="mb-4" />
    <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

// Error State Component
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  title = 'Something went wrong',
  message = 'An error occurred while loading the data.',
  onRetry 
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mb-4">
      <AlertCircle size={28} className="text-red-500 dark:text-red-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-6">{message}</p>
    {onRetry && (
      <Button 
        color="default"
        variant="bordered"
        radius="lg"
        startContent={<RefreshCw size={16} />}
        onPress={onRetry}
        className="font-medium"
      >
        Try Again
      </Button>
    )}
  </div>
);

// Data Wrapper Component - handles loading, error, and empty states
interface DataWrapperProps<T> {
  data: T[];
  loading: boolean;
  error?: Error | null;
  emptyState: EmptyStateProps;
  children: (data: T[]) => React.ReactNode;
  onRetry?: () => void;
}

export function DataWrapper<T>({ 
  data, 
  loading, 
  error, 
  emptyState, 
  children,
  onRetry 
}: DataWrapperProps<T>) {
  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />;
  }

  if (!data || data.length === 0) {
    return <EmptyState {...emptyState} />;
  }

  return <>{children(data)}</>;
}
