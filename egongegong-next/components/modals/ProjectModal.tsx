'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Search, ChevronDown, Check } from 'lucide-react';
import { Project, User, Brand } from '@/types';
import { Button } from '@/components/ui';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Project) => void;
  initialData?: Project | null;
  brands: Brand[];
  users: User[];
}

export const ProjectModal = ({ isOpen, onClose, onSubmit, initialData, brands, users }: ProjectModalProps) => {
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState('');
  const [selectedManagers, setSelectedManagers] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Manager Search State
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const [managerSearch, setManagerSearch] = useState('');
  const managerDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setBrandId(brands.find(b => b.name === initialData.brand)?.id || '');
      setSelectedManagers(initialData.managers || []);
      setStartDate(initialData.startDate);
    } else {
      setTitle('');
      setBrandId('');
      setSelectedManagers([]);
      setStartDate(new Date().toISOString().split('T')[0]);
    }
    setManagerSearch('');
  }, [initialData, isOpen, brands]);

  // Handle clicking outside manager dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (managerDropdownRef.current && !managerDropdownRef.current.contains(event.target as Node)) {
        setIsManagerDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  // Debug: Log users to see their actual status values
  console.log('ProjectModal users:', users.map(u => ({ email: u.email, name: u.name, status: u.status })));

  const filteredUsers = users.filter(user => {
    const email = user.email || '';
    const name = user.name || '';
    const search = managerSearch.toLowerCase();
    const status = (user.status || '').toLowerCase();
    // Accept 'approved', 'active', or 'pending' status (case-insensitive)
    // Note: In production, you may want to restrict to only approved/active users
    const isAllowed = status === 'approved' || status === 'active' || status === 'pending';
    return (email.toLowerCase().includes(search) ||
      name.toLowerCase().includes(search)) && isAllowed;
  });

  const toggleManager = (email: string) => {
    if (selectedManagers.includes(email)) {
      setSelectedManagers(selectedManagers.filter(m => m !== email));
    } else {
      setSelectedManagers([...selectedManagers, email]);
    }
  };

  const removeManager = (email: string) => {
    setSelectedManagers(selectedManagers.filter(m => m !== email));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !brandId || selectedManagers.length === 0) return;
    
    const selectedBrand = brands.find(b => b.id === brandId);

    const newProject: Project = {
      id: initialData?.id || Date.now().toString(),
      title: title,
      brand: selectedBrand?.name || 'Unknown',
      budget: initialData?.budget || 0, 
      managers: selectedManagers,
      description: initialData?.description || '',
      status: initialData?.status || 'Active',
      spent: initialData?.spent || 0,
      startDate: startDate
    };
    onSubmit(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{initialData ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Title</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-1000/20 focus:outline-none transition-shadow bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Summer Glow Launch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Brand</label>
            <div className="relative">
              <select 
                required
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-1000/20 focus:outline-none appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-shadow"
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
              >
                <option value="" disabled>Select a registered brand</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {brands.length === 0 && (
               <p className="text-xs text-amber-600 mt-1">No brands found. Please add brands in Settings first.</p>
            )}
          </div>

          <div ref={managerDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Managers</label>
            
            <div 
              className="min-h-[46px] w-full px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-xl focus-within:ring-2 focus-within:ring-gray-1000/20 flex flex-wrap gap-2 items-center bg-white dark:bg-gray-800 transition-shadow cursor-text" 
              onClick={() => setIsManagerDropdownOpen(true)}
            >
                {selectedManagers.map(email => (
                   <span key={email} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400 rounded-lg text-xs font-medium">
                      {email}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeManager(email); }}
                        className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-950/50 rounded text-gray-1000 hover:text-gray-900"
                      >
                         <X size={12} />
                      </button>
                   </span>
                ))}
               <div className="flex-1 min-w-[120px] flex items-center">
                   <Search className="text-gray-400 mr-2" size={14} />
                   <input 
                      type="text" 
                      className="w-full text-sm outline-none bg-transparent text-gray-900 dark:text-white"
                      placeholder="Search team..."
                      value={managerSearch}
                      onChange={e => setManagerSearch(e.target.value)}
                   />
               </div>
            </div>
            
            {isManagerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-10 max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div 
                                key={user.email} 
                                onClick={() => toggleManager(user.email)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedManagers.includes(user.email) ? 'bg-gray-100/50 dark:bg-gray-950/20' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                                     {user.avatar ? (
                                       <img src={user.avatar} alt={user.name || 'User'} className="w-full h-full object-cover" />
                                     ) : (
                                       <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{(user.name || user.email || 'U').charAt(0).toUpperCase()}</span>
                                     )}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name || user.email}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
                                </div>
                                {selectedManagers.includes(user.email) && <Check size={16} className="ml-auto text-gray-700" />}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-center text-xs text-gray-500">No managers found.</div>
                    )}
                </div>
            )}
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
              <input 
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-gray-1000/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
              />
          </div>
          
          <div className="pt-2 flex justify-end gap-3">
              <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
              <Button icon={Save} type="submit">
                 {initialData ? 'Save Changes' : 'Create Campaign'}
              </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
