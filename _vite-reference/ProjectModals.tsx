
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, Save, Search, ChevronDown, Check, UserPlus } from 'lucide-react';
import { Project, Influencer, InfluencerStatus, CreatorCategory } from '../types';
import { Button } from './UI';
import { MOCK_BRANDS, MOCK_USERS, MOCK_INFLUENCERS } from '../constants';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Project) => void;
  initialData?: Project | null;
}

export const ProjectModal = ({ isOpen, onClose, onSubmit, initialData }: ProjectModalProps) => {
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
      setBrandId(MOCK_BRANDS.find(b => b.name === initialData.brand)?.id || '');
      setSelectedManagers(initialData.managers || []);
      setStartDate(initialData.startDate);
    } else {
      setTitle('');
      setBrandId('');
      setSelectedManagers([]);
      setStartDate(new Date().toISOString().split('T')[0]);
    }
    setManagerSearch('');
  }, [initialData, isOpen]);

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

  const filteredUsers = MOCK_USERS.filter(user => 
    (user.email.toLowerCase().includes(managerSearch.toLowerCase()) ||
    user.name.toLowerCase().includes(managerSearch.toLowerCase())) &&
    user.status === 'Approved' // Only show approved users
  );

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
    
    const selectedBrand = MOCK_BRANDS.find(b => b.id === brandId);

    const newProject: Project = {
      id: initialData?.id || Date.now().toString(),
      title: title,
      brand: selectedBrand?.name || 'Unknown',
      budget: 0, 
      managers: selectedManagers,
      description: '',
      status: 'Active',
      spent: 0,
      startDate: startDate
    };
    onSubmit(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl ring-1 ring-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Title</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-shadow"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Summer Glow Launch"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
            <div className="relative">
              <select 
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none appearance-none bg-white transition-shadow"
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
              >
                <option value="" disabled>Select a registered brand</option>
                {MOCK_BRANDS.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
            {MOCK_BRANDS.length === 0 && (
               <p className="text-xs text-amber-600 mt-1">No brands found. Please add brands in Settings first.</p>
            )}
          </div>

          <div ref={managerDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Managers</label>
            
            <div className="min-h-[46px] w-full px-2 py-1.5 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-indigo-500/20 flex flex-wrap gap-2 items-center bg-white transition-shadow cursor-text" onClick={() => setIsManagerDropdownOpen(true)}>
                {selectedManagers.map(email => (
                   <span key={email} className="flex items-center gap-1 pl-2 pr-1 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium">
                      {email}
                      <button 
                        type="button" 
                        onClick={(e) => { e.stopPropagation(); removeManager(email); }}
                        className="p-0.5 hover:bg-indigo-100 rounded text-indigo-500 hover:text-indigo-800"
                      >
                         <X size={12} />
                      </button>
                   </span>
                ))}
               <div className="flex-1 min-w-[120px] flex items-center">
                   <Search className="text-gray-400 mr-2" size={14} />
                   <input 
                      type="text" 
                      className="w-full text-sm outline-none bg-transparent"
                      placeholder="Search team..."
                      value={managerSearch}
                      onChange={e => setManagerSearch(e.target.value)}
                   />
               </div>
            </div>
            
            {isManagerDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-10 max-h-48 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                        filteredUsers.map(user => (
                            <div 
                                key={user.email} 
                                onClick={() => toggleManager(user.email)}
                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${selectedManagers.includes(user.email) ? 'bg-indigo-50/50' : ''}`}
                            >
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                                     <img src={user.avatar} alt={user.name} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                    <div className="text-xs text-gray-500">{user.email}</div>
                                </div>
                                {selectedManagers.includes(user.email) && <Check size={16} className="ml-auto text-indigo-600" />}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-center text-xs text-gray-500">No managers found.</div>
                    )}
                </div>
            )}
          </div>
          
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                  type="date"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
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

interface NewCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CreatorCategory[];
  onSave: (influencer: Influencer) => void;
}

export const NewCreatorModal = ({ isOpen, onClose, categories, onSave }: NewCreatorModalProps) => {
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
        setHandle('');
        setName('');
        setEmail('');
        setCategory('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    
    // Construct new influencer object
    const newInfluencer: Influencer = {
        id: `manual-${Date.now()}`,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        name: name || handle,
        email: email,
        category: category,
        status: InfluencerStatus.Discovery,
        followerCount: 0,
        country: 'US',
        agreedAmount: 0,
        currency: 'USD',
        paymentStatus: 'Unpaid',
        metrics: { views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 },
        contract: {
            totalAmount: 0,
            currency: 'USD',
            videoCount: 1,
            paymentMethod: 'Unselected',
            paymentSchedule: 'Upon Completion',
            milestones: [],
            status: 'Draft',
            platform: 'TikTok'
        },
        logistics: { status: 'Pending' },
        content: { status: 'Waiting for Draft', isApproved: false, postedVideos: [] },
        history: [],
        notes: 'Manually added'
    };

    onSave(newInfluencer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl ring-1 ring-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
           <h2 className="text-lg font-bold text-gray-900">Add New Creator</h2>
           <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Handle</label>
                <input required value={handle} onChange={e => setHandle(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="@username" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="Full Name" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm" placeholder="email@example.com" />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="">Select Category...</option>
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                <Button icon={UserPlus} type="submit">Add Creator</Button>
            </div>
        </form>
      </div>
    </div>
  );
};

interface RecruitModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingIds: string[];
  onAdd: (influencers: Influencer[]) => void;
}

export const RecruitModal = ({ isOpen, onClose, existingIds, onAdd }: RecruitModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const available = useMemo(() => MOCK_INFLUENCERS.filter(i => 
    !existingIds.includes(i.id) &&
    (i.name.toLowerCase().includes(search.toLowerCase()) || i.handle.toLowerCase().includes(search.toLowerCase()))
  ), [existingIds, search]);

  const toggle = (id: string) => {
      if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(x => x !== id));
      else setSelectedIds(prev => [...prev, id]);
  };

  const handleConfirm = () => {
      const recruits = available.filter(i => selectedIds.includes(i.id));
      onAdd(recruits);
      onClose();
      setSelectedIds([]);
      setSearch('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl ring-1 ring-gray-200 flex flex-col max-h-[80vh]">
         <div className="p-4 border-b border-gray-100 flex justify-between items-center">
             <div>
                <h2 className="text-lg font-bold text-gray-900">Recruit Creators</h2>
                <p className="text-xs text-gray-500">Add existing creators to this campaign</p>
             </div>
             <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
         </div>
         
         <div className="p-4 border-b border-gray-100 bg-gray-50">
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Search by name or handle..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                 />
             </div>
         </div>

         <div className="flex-1 overflow-y-auto p-2">
             <table className="w-full text-left">
                 <thead className="bg-white sticky top-0 z-10">
                     <tr>
                         <th className="px-4 py-2 w-10"></th>
                         <th className="px-4 py-2 text-xs font-bold text-gray-500">Creator</th>
                         <th className="px-4 py-2 text-xs font-bold text-gray-500">Category</th>
                         <th className="px-4 py-2 text-xs font-bold text-gray-500">Followers</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                     {available.map(inf => {
                         const isSelected = selectedIds.includes(inf.id);
                         return (
                             <tr key={inf.id} onClick={() => toggle(inf.id)} className={`cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-indigo-50' : ''}`}>
                                 <td className="px-4 py-3">
                                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                         {isSelected && <Check size={10} className="text-white" />}
                                     </div>
                                 </td>
                                 <td className="px-4 py-3">
                                     <div className="text-sm font-medium text-gray-900">{inf.name}</div>
                                     <div className="text-xs text-gray-500">{inf.handle}</div>
                                 </td>
                                 <td className="px-4 py-3 text-xs text-gray-600">{inf.category || '-'}</td>
                                 <td className="px-4 py-3 text-xs text-gray-600">{(inf.followerCount / 1000).toFixed(0)}k</td>
                             </tr>
                         )
                     })}
                     {available.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400 text-sm">No creators found.</td></tr>}
                 </tbody>
             </table>
         </div>

         <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 rounded-b-2xl">
             <span className="text-xs text-gray-500">{selectedIds.length} selected</span>
             <div className="flex gap-2">
                 <Button variant="secondary" onClick={onClose}>Cancel</Button>
                 <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>Add Selected</Button>
             </div>
         </div>
      </div>
    </div>
  );
};
