
import React, { useMemo, useState, useRef } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel,
  getFilteredRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  Column,
  ColumnFiltersState,
  SortingState
} from '@tanstack/react-table';
import { MOCK_INFLUENCERS, MOCK_CATEGORIES } from '../constants';
import { Influencer, InfluencerStatus, CreatorCategory, ZendeskMacro } from '../types';
import { Card, Button } from '../components/UI';
import { Search, ChevronLeft, ChevronRight, Upload, RefreshCw, UserPlus, XCircle, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { NewCreatorModal } from '../components/ProjectModals';

// --- External Filter Component ---
function FilterSelect({ column, label }: { column?: Column<any, unknown>, label: string }) {
  const columnFilterValue = column?.getFilterValue();
  
  const sortedUniqueValues = useMemo(() => 
    column ? Array.from(column.getFacetedUniqueValues().keys()).sort() : [],
    [column?.getFacetedUniqueValues()]
  );

  return (
    <div className="relative h-full group">
      <select
        onChange={e => column?.setFilterValue(e.target.value || undefined)}
        value={(columnFilterValue ?? '') as string}
        className="h-full pl-3 pr-8 py-2 border border-gray-200 rounded-lg text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none min-w-[130px] cursor-pointer hover:border-gray-300 transition-colors"
      >
        <option value="">All {label}</option>
        {sortedUniqueValues.map((value: any) => (
          <option value={value} key={value}>{value}</option>
        ))}
      </select>
       <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
    </div>
  );
}

interface CreatorListProps {
  macros?: ZendeskMacro[]; // Optional because CreatorList might be used in context where macros aren't passed yet
}

export const CreatorList = ({ macros }: CreatorListProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [influencers, setInfluencers] = useState<Influencer[]>(MOCK_INFLUENCERS);
  const [categories, setCategories] = useState<CreatorCategory[]>(MOCK_CATEGORIES);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Table State
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---
  
  const handleCSVUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      // Simple CSV Parse: Assume Format: Handle, Name, Email, Category
      const lines = text.split('\n');
      const newInfluencers: Influencer[] = [];
      
      // Skip header if exists (simple check if first line contains 'handle')
      const startIndex = lines[0].toLowerCase().includes('handle') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [handle, name, email, category] = line.split(',');
        
        newInfluencers.push({
            id: `csv-${Date.now()}-${i}`,
            handle: handle?.trim() || '@unknown',
            name: name?.trim() || 'Unknown Creator',
            email: email?.trim() || '',
            category: category?.trim(),
            country: 'US',
            followerCount: 0,
            status: InfluencerStatus.Discovery,
            agreedAmount: 0,
            currency: 'USD',
            paymentStatus: 'Unpaid',
            metrics: { views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 },
            contract: { totalAmount: 0, currency: 'USD', videoCount: 1, paymentMethod: 'Unselected', paymentSchedule: 'Upon Completion', milestones: [], status: 'Draft', platform: 'TikTok' },
            logistics: { status: 'Pending' },
            content: { status: 'Waiting for Draft', isApproved: false, postedVideos: [] },
            history: [],
            notes: 'Imported via CSV'
        });
      }
      setInfluencers(prev => [...newInfluencers, ...prev]);
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAdd = (newCreator: Influencer) => {
    setInfluencers(prev => [newCreator, ...prev]);
  };

  const handleUpdateTokAPI = () => {
    setIsRefreshing(true);
    // Simulate API Call delay and update
    setTimeout(() => {
        setInfluencers(prev => prev.map(inf => ({
            ...inf,
            metrics: {
                ...inf.metrics!,
                views: inf.metrics!.views + Math.floor(Math.random() * 100),
                engagementRate: Number((inf.metrics!.engagementRate + (Math.random() * 0.5 - 0.25)).toFixed(2))
            }
        })));
        setIsRefreshing(false);
    }, 1500);
  };

  const handleUpdateCategory = (id: string, newCategory: string) => {
    setInfluencers(prev => prev.map(inf => inf.id === id ? { ...inf, category: newCategory } : inf));
  };

  // --- Table Configuration ---

  const columnHelper = createColumnHelper<Influencer>();
  
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Creator',
      cell: info => (
        <a 
          href={`https://www.tiktok.com/${info.row.original.handle}`}
          target="_blank"
          rel="noreferrer" 
          className="font-bold text-gray-900 hover:text-indigo-600 hover:underline whitespace-nowrap block"
          onClick={(e) => e.stopPropagation()}
        >
            {info.getValue()}
        </a>
      )
    }),
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => (
        <select 
          className="bg-transparent text-xs border-b border-transparent hover:border-gray-300 focus:border-indigo-500 focus:outline-none text-gray-600 max-w-[100px]"
          value={info.getValue() || ''}
          onChange={(e) => handleUpdateCategory(info.row.original.id, e.target.value)}
          onClick={(e) => e.stopPropagation()}
        >
           <option value="">Unassigned</option>
           {categories.map(c => (
             <option key={c.id} value={c.name}>{c.name}</option>
           ))}
        </select>
      )
    }),
    columnHelper.accessor('country', {
      header: 'Country',
      cell: info => (
         <span className="text-gray-600 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
            {info.getValue()}
         </span>
      )
    }),
    columnHelper.accessor('followerCount', {
      header: 'Followers',
      cell: info => <span className="text-gray-700">{(info.getValue() / 1000).toFixed(0)}K</span>
    }),
    columnHelper.accessor(row => row.metrics?.avgViewsPerVideo, {
      id: 'avgViews',
      header: 'Avg Views',
      cell: info => {
          const val = info.getValue();
          return <span className="text-gray-700 font-medium">{val ? (val / 1000).toFixed(1) + 'K' : '-'}</span>;
      }
    }),
    columnHelper.accessor(row => row.metrics?.engagementRate, {
      id: 'engagement',
      header: 'ER %',
      cell: info => {
        const val = info.getValue();
        return (
            <span className={`font-semibold ${val && val > 3 ? 'text-emerald-600' : 'text-gray-600'}`}>
                {val ? val + '%' : '-'}
            </span>
        );
      }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <span className="text-gray-500 truncate max-w-[150px] block" title={info.getValue()}>{info.getValue()}</span>
    }),
  ], [categories]); // Re-render cols when categories change

  const table = useReactTable({
    data: influencers,
    columns,
    state: {
      columnFilters,
      globalFilter,
      sorting
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
        pagination: {
            pageSize: 20, // Default to 20 rows per page
        }
    },
    enableRowSelection: false, // Disabled selection
  });

  return (
    <div className="p-6 w-full flex flex-col h-full">
       <div className="flex justify-between items-center mb-4 flex-shrink-0">
         <div>
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               Creator Pool 
               <span className="text-sm font-normal text-gray-400">
                  ({table.getFilteredRowModel().rows.length} / {influencers.length})
               </span>
           </h2>
         </div>
         <div className="flex gap-2 h-9">
            {/* Filter Group */}
            <div className="flex gap-2 mr-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={globalFilter ?? ''}
                      onChange={e => setGlobalFilter(e.target.value)}
                      className="h-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white text-gray-900 w-48 shadow-sm transition-all" 
                    />
                    {globalFilter && (
                      <button 
                        onClick={() => setGlobalFilter('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <XCircle size={14} />
                      </button>
                    )}
                </div>

                <FilterSelect column={table.getColumn('category')} label="Categories" />
                <FilterSelect column={table.getColumn('country')} label="Countries" />
            </div>

           <div className="h-full w-[1px] bg-gray-200 mx-1"></div>
           
           <input 
              type="file" 
              accept=".csv" 
              ref={fileInputRef} 
              onChange={handleCSVUpload} 
              className="hidden" 
           />
           <Button variant="secondary" icon={Upload} className="h-full text-xs px-3" onClick={() => fileInputRef.current?.click()}>
              Import
           </Button>
           
           <Button 
             variant="secondary" 
             icon={RefreshCw} 
             className={`h-full text-xs px-3 ${isRefreshing ? 'animate-spin' : ''}`} 
             onClick={handleUpdateTokAPI}
             title="Fetch latest engagement from TokAPI"
           >
           </Button>

           <Button icon={UserPlus} className="h-full text-xs px-3" onClick={() => setIsAddModalOpen(true)}>
              Add
           </Button>
         </div>
       </div>

       <Card className="flex-1 overflow-hidden border-gray-200 p-0 shadow-sm flex flex-col">
          <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th 
                            key={header.id} 
                            className="px-3 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider align-middle cursor-pointer select-none hover:bg-gray-100 transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                              {header.column.getCanSort() && (
                                {
                                  asc: <ArrowUp size={10} className="text-gray-700" />,
                                  desc: <ArrowDown size={10} className="text-gray-700" />,
                                }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={10} className="text-gray-300" />
                              )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-indigo-50/30 transition-colors group">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-3 py-2 text-xs text-gray-800 border-none align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs flex-shrink-0">
             <div className="text-gray-500">
                Page <span className="font-bold text-gray-900">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-bold text-gray-900">{table.getPageCount()}</span>
             </div>
             <div className="flex gap-2">
                <button
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft size={14} />
                </button>
                <button
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    <ChevronRight size={14} />
                </button>
             </div>
          </div>
       </Card>

       <NewCreatorModal 
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categories={categories}
          onSave={handleManualAdd}
       />
    </div>
  );
};
