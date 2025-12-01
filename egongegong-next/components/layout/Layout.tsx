'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  DollarSign, 
  BarChart3, 
  MessageSquare, 
  Search, 
  Sun, 
  Moon, 
  ChevronRight,
  Bell,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { useTheme } from '@/hooks/useTheme';
import { Spinner } from '@heroui/react';

interface LayoutProps {
  children: React.ReactNode;
  projectName?: string;
}

export const Layout = ({ children, projectName }: LayoutProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, appUser, loading, reset } = useAuthStore();
  const { isDark, toggleTheme, mounted } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Auth check and redirect
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (appUser?.status === 'pending') {
        router.push('/pending');
      }
    }
  }, [user, appUser, loading, router]);

  useEffect(() => {
    // Keyboard shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // TODO: Open command palette
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      reset();
      router.push('/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading spinner while loading or not authenticated
  if (loading || !user || (appUser?.status !== 'active' && appUser?.status !== 'approved')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Spinner size="lg" />
      </div>
    );
  }

  const menuItems = [
    { id: 'projects', label: 'Campaigns', icon: Briefcase, path: '/projects' },
    { id: 'creators', label: 'Creator Pool', icon: Users, path: '/creators' },
    { id: 'zendesk', label: 'Outreach Log', icon: MessageSquare, path: '/outreach' },
    { id: 'finance', label: 'Finance HQ', icon: DollarSign, path: '/finance' },
    { id: 'reports', label: 'Reporting', icon: BarChart3, path: '/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const getCurrentPage = () => {
    const item = menuItems.find(i => pathname.startsWith(i.path));
    return item?.id || 'projects';
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Home', path: '/projects' }];
    const currentPage = getCurrentPage();
    
    if (pathname.includes('/projects/') && projectName) {
      crumbs.push({ label: 'Campaigns', path: '/projects' });
      crumbs.push({ label: projectName, path: pathname });
    } else {
      const currentItem = menuItems.find(i => i.id === currentPage);
      if (currentItem) {
        crumbs.push({ label: currentItem.label, path: currentItem.path });
      }
    }
    return crumbs;
  };

  const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64';
  const mainMargin = sidebarCollapsed ? 'ml-16' : 'ml-64';

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-gray-950 flex font-sans text-gray-900 dark:text-white transition-colors duration-200">
      {/* Sidebar */}
      <aside className={`${sidebarWidth} bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col fixed h-full z-30 transition-all duration-300`}>
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center w-full' : ''}`}>
            <div className="w-8 h-8 bg-gray-900 dark:bg-gray-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg flex-shrink-0">T</div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <h1 className="font-bold text-base tracking-tight text-gray-900 dark:text-white whitespace-nowrap">Seeding OS</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">Agency Workspace</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => router.push(item.path)}
              title={sidebarCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                getCurrentPage() === item.id 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-gray-700 dark:shadow-none' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              } ${sidebarCollapsed ? 'justify-center' : ''}`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!sidebarCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors justify-center"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
            {!sidebarCollapsed && <span className="whitespace-nowrap">Collapse</span>}
          </button>
        </div>

        <div className="p-2 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={handleSignOut}
            title={sidebarCollapsed ? 'Sign Out' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            <LogOut size={18} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="whitespace-nowrap">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${mainMargin} flex flex-col min-h-screen transition-all duration-300`}>
        {/* Top Header */}
        <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors flex-shrink-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm whitespace-nowrap">
            {getBreadcrumbs().map((crumb, idx, arr) => (
              <div key={idx} className="flex items-center gap-2">
                <span 
                  className={`${idx === arr.length - 1 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer'}`} 
                  onClick={() => idx !== arr.length - 1 && router.push(crumb.path)}
                >
                  {crumb.label}
                </span>
                {idx < arr.length - 1 && <ChevronRight size={14} className="text-gray-300 dark:text-gray-600" />}
              </div>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button 
              onClick={() => {/* TODO: Open command palette */}}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-2 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
            >
              <Search size={14} />
              <span className="mr-2 hidden sm:inline">Search...</span>
              <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-gray-400">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>

            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              suppressHydrationWarning
            >
              {mounted ? (isDark ? <Sun size={20} /> : <Moon size={20} />) : <Moon size={20} />}
            </button>

            {/* Notification Bell */}
            <button className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Content with min-width to prevent text wrapping vertically */}
        <div className="flex-1 overflow-x-auto">
          <div className="min-w-[1024px] p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
