
import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, ArrowRight, X, ArrowUpDown } from 'lucide-react';
import { Project } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string, project?: Project) => void;
  projects: Project[];
}

export const CommandPalette = ({ isOpen, onClose, onNavigate, projects }: CommandPaletteProps) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = [
    { id: 'projects', label: 'Campaigns', type: 'Page' },
    { id: 'creators', label: 'Creator Pool', type: 'Page' },
    { id: 'zendesk', label: 'Outreach Log', type: 'Page' },
    { id: 'finance', label: 'Finance HQ', type: 'Page' },
    { id: 'reports', label: 'Reporting', type: 'Page' },
    { id: 'settings', label: 'Settings', type: 'Page' },
  ];

  const filteredItems = [
    ...pages.filter(p => p.label.toLowerCase().includes(search.toLowerCase())),
    ...projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase())).map(p => ({ ...p, type: 'Project' }))
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 10);
      setSelectedIndex(0);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = filteredItems[selectedIndex];
        if (item) {
          handleSelect(item);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex]);

  const handleSelect = (item: any) => {
    if (item.type === 'Project') {
      onNavigate('project_detail', item);
    } else {
      onNavigate(item.id);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh]">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden ring-1 ring-gray-900/5 flex flex-col animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center px-4 border-b border-gray-100 dark:border-slate-800">
          <Search className="text-gray-400 dark:text-slate-500" size={20} />
          <input
            ref={inputRef}
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedIndex(0); }}
            placeholder="Search pages, campaigns..."
            className="flex-1 px-4 py-4 text-sm bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500"
          />
          <div className="flex gap-2">
            <span className="text-[10px] bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 px-1.5 py-0.5 rounded">ESC</span>
          </div>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto py-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item: any, index) => (
              <div
                key={item.id || item.title}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`px-4 py-3 mx-2 rounded-lg flex items-center justify-between cursor-pointer transition-colors text-sm ${
                  index === selectedIndex 
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' 
                    : 'text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                 <div className="flex items-center gap-3">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        item.type === 'Page' 
                        ? 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400' 
                        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}>
                        {item.type === 'Page' ? 'GO' : 'PRJ'}
                    </span>
                    <span className="font-medium">{item.label || item.title}</span>
                 </div>
                 {index === selectedIndex && <ArrowRight size={14} className="opacity-50" />}
              </div>
            ))
          ) : (
             <div className="px-6 py-8 text-center text-sm text-gray-500 dark:text-slate-500">
                No results found.
             </div>
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-slate-950/50 px-4 py-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-gray-400 dark:text-slate-500">
           <span>Select to navigate</span>
           <div className="flex gap-2">
              <span className="flex items-center gap-1"><ArrowRight size={10} /> Enter</span>
              <span className="flex items-center gap-1"><ArrowUpDown size={10} /> Navigate</span>
           </div>
        </div>
      </div>
    </div>
  );
};
