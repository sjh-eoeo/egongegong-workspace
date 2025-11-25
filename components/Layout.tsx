
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Briefcase, Settings, LogOut, DollarSign, BarChart3, MessageSquare, Search, Sun, Moon, Command, ChevronRight } from 'lucide-react';
import { NotificationHub } from './NotificationHub';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onSearchClick: () => void;
  isDark: boolean;
  toggleTheme: () => void;
  projectName?: string;
}

export const Layout = ({ children, currentPage, onNavigate, onSearchClick, isDark, toggleTheme, projectName }: LayoutProps) => {
  const menuItems = [
    { id: 'projects', label: 'Campaigns', icon: Briefcase },
    { id: 'creators', label: 'Creator Pool', icon: Users },
    { id: 'zendesk', label: 'Outreach Log', icon: MessageSquare },
    { id: 'finance', label: 'Finance HQ', icon: DollarSign },
    { id: 'reports', label: 'Reporting', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getBreadcrumbs = () => {
     const crumbs = [{ label: 'Home', id: 'projects' }];
     
     if (currentPage === 'project_detail' && projectName) {
         crumbs.push({ label: 'Campaigns', id: 'projects' });
         crumbs.push({ label: projectName, id: 'project_detail' });
     } else {
         const currentItem = menuItems.find(i => i.id === currentPage);
         if (currentItem) {
             crumbs.push({ label: currentItem.label, id: currentItem.id });
         }
     }
     return crumbs;
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-sans text-gray-900 dark:text-white transition-colors duration-200 ${isDark ? 'dark' : ''}`}>
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 flex flex-col fixed h-full z-30 transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-900 dark:bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg dark:shadow-indigo-500/20">T</div>
             <div>
                <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">Seeding OS</h1>
                <p className="text-xs text-gray-500 dark:text-slate-400">Agency Workspace</p>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                currentPage === item.id 
                  ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 dark:bg-indigo-600 dark:shadow-none' 
                  : 'text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-800">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors">
           {/* Breadcrumbs */}
           <div className="flex items-center gap-2 text-sm">
              {getBreadcrumbs().map((crumb, idx, arr) => (
                  <div key={idx} className="flex items-center gap-2">
                      <span className={`${idx === arr.length - 1 ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 cursor-pointer'}`} onClick={() => crumb.id !== currentPage && onNavigate(crumb.id)}>
                          {crumb.label}
                      </span>
                      {idx < arr.length - 1 && <ChevronRight size={14} className="text-gray-300 dark:text-slate-600" />}
                  </div>
              ))}
           </div>

           {/* Right Actions */}
           <div className="flex items-center gap-2">
               <button 
                 onClick={onSearchClick}
                 className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-lg text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors mr-2 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
               >
                   <Search size={14} />
                   <span className="mr-2">Search...</span>
                   <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-1.5 font-mono text-[10px] font-medium text-gray-500 dark:text-slate-400">
                      <span className="text-xs">⌘</span>K
                   </kbd>
               </button>

               <button 
                 onClick={toggleTheme}
                 className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white transition-colors"
               >
                 {isDark ? <Sun size={20} /> : <Moon size={20} />}
               </button>

               <NotificationHub />
               
               <div className="w-px h-6 bg-gray-200 dark:bg-slate-800 mx-2"></div>
               
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-slate-900">
                  A
               </div>
           </div>
        </header>

        {children}
      </main>
    </div>
  );
};
