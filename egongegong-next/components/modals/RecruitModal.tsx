'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, Check, Filter, ChevronLeft, ChevronRight, CheckSquare, Square, ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';
import { Influencer, CreatorCategory } from '@/types';
import { Button } from '@/components/ui';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

const ITEMS_PER_PAGE = 50;

type SortField = 'name' | 'category' | 'followerCount' | 'country';
type SortDirection = 'asc' | 'desc' | null;

interface RecruitModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingIds: string[];
  categories?: CreatorCategory[];
  onAdd: (influencers: Influencer[]) => void;
}

export const RecruitModal = ({ isOpen, onClose, existingIds, categories = [], onAdd }: RecruitModalProps) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Load data when modal opens
  const [availableInfluencers, setAvailableInfluencers] = useState<Influencer[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const fetchCreators = async () => {
        try {
          const snapshot = await getDocs(collection(db, 'influencers'));
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Influencer));
          setAvailableInfluencers(data);
        } catch (error) {
          console.error('Error fetching creators:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchCreators();
    }
  }, [isOpen]);

  // Handle sort toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Get unique categories from available influencers
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    availableInfluencers.forEach(i => {
      if (i.categories) {
        i.categories.forEach(c => cats.add(c));
      } else if (i.category) {
        cats.add(i.category);
      }
    });
    return Array.from(cats).sort();
  }, [availableInfluencers]);

  // Filtered and sorted results (before pagination)
  const filteredResults = useMemo(() => {
    let results = availableInfluencers.filter(i => {
      const name = (i.name || '').toLowerCase();
      const handle = (i.handle || '').toLowerCase();
      const searchLower = search.toLowerCase();
      
      // Check if already in campaign
      if (existingIds.includes(i.id)) return false;
      
      // Search filter
      const matchesSearch = name.includes(searchLower) || handle.includes(searchLower);
      
      // Category filter
      const matchesCategory = selectedCategory === 'all' || 
        (i.categories && i.categories.includes(selectedCategory)) ||
        i.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort
    if (sortField && sortDirection) {
      results = [...results].sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';

        switch (sortField) {
          case 'name':
            aVal = (a.name || a.handle || '').toLowerCase();
            bVal = (b.name || b.handle || '').toLowerCase();
            break;
          case 'category':
            aVal = (a.categories?.[0] || a.category || '').toLowerCase();
            bVal = (b.categories?.[0] || b.category || '').toLowerCase();
            break;
          case 'followerCount':
            aVal = a.followerCount || 0;
            bVal = b.followerCount || 0;
            break;
          case 'country':
            aVal = (a.country || '').toLowerCase();
            bVal = (b.country || '').toLowerCase();
            break;
        }

        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return results;
  }, [existingIds, search, selectedCategory, availableInfluencers, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredResults.length / ITEMS_PER_PAGE);
  const paginatedResults = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredResults.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredResults, currentPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(x => x !== id));
    else setSelectedIds(prev => [...prev, id]);
  };

  // Select all on current page
  const selectAllOnPage = () => {
    const pageIds = paginatedResults.map(i => i.id);
    setSelectedIds(prev => [...new Set([...prev, ...pageIds])]);
  };

  // Deselect all on current page
  const deselectAllOnPage = () => {
    const pageIds = new Set(paginatedResults.map(i => i.id));
    setSelectedIds(prev => prev.filter(id => !pageIds.has(id)));
  };

  // Select all filtered results
  const selectAllFiltered = () => {
    const allIds = filteredResults.map(i => i.id);
    setSelectedIds(allIds);
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedIds([]);
  };

  // Check if all on current page are selected
  const allOnPageSelected = paginatedResults.length > 0 && paginatedResults.every(i => selectedIds.includes(i.id));
  const someOnPageSelected = paginatedResults.some(i => selectedIds.includes(i.id));

  const handleConfirm = () => {
    const recruits = availableInfluencers.filter(i => selectedIds.includes(i.id));
    onAdd(recruits);
    onClose();
    setSelectedIds([]);
    setSearch('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  const handleClose = () => {
    onClose();
    setSelectedIds([]);
    setSearch('');
    setSelectedCategory('all');
    setCurrentPage(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-800 flex flex-col max-h-[85vh]">
         <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
             <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recruit Creators</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Add existing creators to this campaign • {availableInfluencers.length.toLocaleString()} creators in database
                </p>
             </div>
             <button onClick={handleClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
               <X size={20} className="text-gray-400" />
             </button>
         </div>
         
         <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 space-y-3">
             {/* Search */}
             <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-1000/20 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    placeholder="Search by name or handle..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                 />
             </div>
             
             {/* Category Filter */}
             <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-gray-400" />
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gray-700 text-white'
                      : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  All ({availableInfluencers.filter(i => !existingIds.includes(i.id)).length.toLocaleString()})
                </button>
                {availableCategories.map(cat => {
                  const count = availableInfluencers.filter(i => 
                    !existingIds.includes(i.id) && 
                    ((i.categories && i.categories.includes(cat)) || i.category === cat)
                  ).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategory === cat
                          ? 'bg-gray-700 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {cat} ({count.toLocaleString()})
                    </button>
                  );
                })}
             </div>

             {/* Select All Controls */}
             <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
               <button
                 onClick={allOnPageSelected ? deselectAllOnPage : selectAllOnPage}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 transition-colors"
               >
                 {allOnPageSelected ? <CheckSquare size={14} /> : <Square size={14} />}
                 {allOnPageSelected ? 'Deselect Page' : 'Select Page'} ({paginatedResults.length})
               </button>
               <button
                 onClick={selectAllFiltered}
                 className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-950/30 text-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-950/50 border border-gray-300 dark:border-gray-900 transition-colors"
               >
                 <CheckSquare size={14} />
                 Select All Filtered ({filteredResults.length.toLocaleString()})
               </button>
               {selectedIds.length > 0 && (
                 <button
                   onClick={clearAllSelections}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                 >
                   Clear All ({selectedIds.length.toLocaleString()})
                 </button>
               )}
             </div>
         </div>

         <div className="flex-1 overflow-y-auto">
             <table className="w-full text-left">
                 <thead className="bg-white dark:bg-gray-900 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
                     <tr>
                         <th className="px-4 py-2 w-10">
                           <button 
                             onClick={allOnPageSelected ? deselectAllOnPage : selectAllOnPage}
                             className={`w-4 h-4 rounded border flex items-center justify-center ${
                               allOnPageSelected 
                                 ? 'bg-gray-700 border-gray-700' 
                                 : someOnPageSelected 
                                   ? 'bg-gray-400 border-gray-400'
                                   : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
                             }`}
                           >
                             {(allOnPageSelected || someOnPageSelected) && <Check size={10} className="text-white" />}
                           </button>
                         </th>
                         <th 
                           className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                           onClick={() => handleSort('name')}
                         >
                           <div className="flex items-center gap-1">
                             Creator
                             {sortField === 'name' ? (
                               sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                             ) : (
                               <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600" />
                             )}
                           </div>
                         </th>
                         <th 
                           className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                           onClick={() => handleSort('category')}
                         >
                           <div className="flex items-center gap-1">
                             Category
                             {sortField === 'category' ? (
                               sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                             ) : (
                               <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600" />
                             )}
                           </div>
                         </th>
                         <th 
                           className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                           onClick={() => handleSort('followerCount')}
                         >
                           <div className="flex items-center gap-1">
                             Followers
                             {sortField === 'followerCount' ? (
                               sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                             ) : (
                               <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600" />
                             )}
                           </div>
                         </th>
                         <th 
                           className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                           onClick={() => handleSort('country')}
                         >
                           <div className="flex items-center gap-1">
                             Country
                             {sortField === 'country' ? (
                               sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />
                             ) : (
                               <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600" />
                             )}
                           </div>
                         </th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                     {loading ? (
                       <tr>
                         <td colSpan={5} className="p-8 text-center">
                           <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                           <p className="text-sm text-gray-500 mt-2">Loading creators...</p>
                         </td>
                       </tr>
                     ) : paginatedResults.map(inf => {
                         const isSelected = selectedIds.includes(inf.id);
                         return (
                             <tr 
                               key={inf.id} 
                               onClick={() => toggle(inf.id)} 
                               className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${isSelected ? 'bg-gray-100 dark:bg-gray-950/20' : ''}`}
                             >
                                 <td className="px-4 py-3">
                                     <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-gray-700 border-gray-700' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
                                         {isSelected && <Check size={10} className="text-white" />}
                                     </div>
                                 </td>
                                 <td className="px-4 py-3">
                                     <div className="text-sm font-medium text-gray-900 dark:text-white">{inf.name || inf.handle}</div>
                                     <div className="text-xs text-gray-500 dark:text-gray-400">{inf.handle}</div>
                                 </td>
                                 <td className="px-4 py-3">
                                   <div className="flex flex-wrap gap-1">
                                     {(inf.categories || [inf.category]).filter(Boolean).map((cat, idx) => (
                                       <span key={idx} className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                         {cat}
                                       </span>
                                     ))}
                                     {!inf.categories?.length && !inf.category && <span className="text-gray-400">-</span>}
                                   </div>
                                 </td>
                                 <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 font-mono">
                                   {inf.followerCount >= 1000000 
                                     ? `${(inf.followerCount / 1000000).toFixed(1)}M` 
                                     : inf.followerCount >= 1000 
                                       ? `${(inf.followerCount / 1000).toFixed(0)}K`
                                       : inf.followerCount || '-'}
                                 </td>
                                 <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                                   {inf.country || '-'}
                                 </td>
                             </tr>
                         )
                     })}
                     {!loading && paginatedResults.length === 0 && (
                       <tr>
                         <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                           {availableInfluencers.length === 0 
                             ? 'No creators in database. Add creators first in the Creators page.'
                             : 'No creators match your filters.'}
                         </td>
                       </tr>
                     )}
                 </tbody>
             </table>
         </div>

         {/* Pagination */}
         {totalPages > 1 && (
           <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2">
             <button
               onClick={() => setCurrentPage(1)}
               disabled={currentPage === 1}
               className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               First
             </button>
             <button
               onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
               disabled={currentPage === 1}
               className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronLeft size={16} className="text-gray-500" />
             </button>
             
             <div className="flex items-center gap-1">
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 let pageNum: number;
                 if (totalPages <= 5) {
                   pageNum = i + 1;
                 } else if (currentPage <= 3) {
                   pageNum = i + 1;
                 } else if (currentPage >= totalPages - 2) {
                   pageNum = totalPages - 4 + i;
                 } else {
                   pageNum = currentPage - 2 + i;
                 }
                 return (
                   <button
                     key={pageNum}
                     onClick={() => setCurrentPage(pageNum)}
                     className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                       currentPage === pageNum
                         ? 'bg-gray-700 text-white'
                         : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                     }`}
                   >
                     {pageNum}
                   </button>
                 );
               })}
             </div>

             <button
               onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
               disabled={currentPage === totalPages}
               className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <ChevronRight size={16} className="text-gray-500" />
             </button>
             <button
               onClick={() => setCurrentPage(totalPages)}
               disabled={currentPage === totalPages}
               className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
             >
               Last
             </button>
             
             <span className="ml-2 text-xs text-gray-400">
               Page {currentPage} of {totalPages}
             </span>
           </div>
         )}

         <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
             <span className="text-xs text-gray-500 dark:text-gray-400">
               <span className="font-bold text-gray-700 dark:text-gray-500">{selectedIds.length.toLocaleString()}</span> selected 
               • Showing {((currentPage - 1) * ITEMS_PER_PAGE + 1).toLocaleString()}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredResults.length).toLocaleString()} of {filteredResults.length.toLocaleString()} filtered
             </span>
             <div className="flex gap-2">
                 <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                 <Button onClick={handleConfirm} disabled={selectedIds.length === 0}>
                   Add {selectedIds.length.toLocaleString()} Selected
                 </Button>
             </div>
         </div>
      </div>
    </div>
  );
};
