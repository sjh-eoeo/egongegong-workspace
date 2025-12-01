'use client';

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
import { useInfluencers, useCategories } from '@/hooks/useCollection';
import { useAirtableSync } from '@/hooks/useAirtableSync';
import { Influencer, InfluencerStatus, CreatorCategory } from '@/types';
import { Card, Button } from '@/components/ui';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { Search, ChevronLeft, ChevronRight, Upload, RefreshCw, UserPlus, XCircle, ChevronDown, ArrowUpDown, ArrowUp, ArrowDown, Users, Database } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatCompact } from '@/lib/utils';
import { updateInfluencer, createInfluencer } from '@/lib/firebase/firestore';
import { MultiSelect } from '@/components/ui/MultiSelect';
import { NewCreatorModal } from '@/components/modals';
import { useToast } from '@/components/Toast';

// --- External Filter Component ---
function FilterSelect({ column, label }: { column?: Column<Influencer, unknown>, label: string }) {
  const columnFilterValue = column?.getFilterValue();
  
  const sortedUniqueValues = useMemo(() => 
    column ? Array.from(column.getFacetedUniqueValues().keys()).sort() : [],
    [column]
  );

  return (
    <div className="relative h-full group">
      <select
        onChange={e => column?.setFilterValue(e.target.value || undefined)}
        value={(columnFilterValue ?? '') as string}
        className="h-full pl-3 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500/20 appearance-none min-w-[130px] cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
      >
        <option value="">All {label}</option>
        {sortedUniqueValues.map((value: string) => (
          <option value={value} key={value}>{value}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
    </div>
  );
}

export const CreatorListPage = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { data: influencersData, loading } = useInfluencers();
  const { data: categoriesData } = useCategories();
  const influencers = influencersData as Influencer[];
  const categories = (categoriesData as CreatorCategory[]) || [];
  const { addToast } = useToast();
  
  // Airtable Sync
  const { syncFromAirtable, isSyncing, progress } = useAirtableSync();
  
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
      const lines = text.split('\n');
      const newInfluencers: Influencer[] = [];
      
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
      // TODO: Save to Firestore instead of local state
      console.log('CSV import - save to Firestore:', newInfluencers);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Airtable에서 데이터 동기화
  const handleSyncFromAirtable = async () => {
    try {
      const result = await syncFromAirtable(100); // 최대 100개
      alert(`동기화 완료!\n생성: ${result.created}명\n업데이트: ${result.updated}명`);
    } catch (error) {
      console.error('Sync error:', error);
      alert('동기화 중 오류가 발생했습니다.');
    }
  };

  const handleUpdateCategory = async (id: string, newCategories: string[]) => {
    try {
      await updateInfluencer(id, { categories: newCategories });
    } catch (error) {
      console.error('Update category error:', error);
      alert('카테고리 업데이트 실패');
    }
  };

  const handleAddCreator = async (newInfluencer: Influencer) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...influencerData } = newInfluencer;
      await createInfluencer(influencerData);
      addToast('success', 'Creator Added', `${newInfluencer.name} has been added to the pool.`);
    } catch (error) {
      console.error('Add creator error:', error);
      addToast('error', 'Error', 'Failed to add creator.');
    }
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
          className="font-bold text-gray-900 dark:text-white hover:text-gray-600 dark:hover:text-gray-300 hover:underline whitespace-nowrap block"
          onClick={(e) => e.stopPropagation()}
        >
          {info.getValue()}
        </a>
      )
    }),
    columnHelper.accessor(row => row.categories || (row.category ? [row.category] : []), {
      id: 'categories',
      header: 'Category',
      cell: info => {
        const currentCategories = info.getValue() as string[];
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <MultiSelect
              options={categories}
              selected={currentCategories}
              onChange={(newCategories) => handleUpdateCategory(info.row.original.id, newCategories)}
              placeholder="Select..."
              className="min-w-[120px]"
            />
          </div>
        );
      },
      filterFn: (row, columnId, filterValue) => {
        const categories = row.getValue(columnId) as string[];
        if (!filterValue) return true;
        return categories.includes(filterValue);
      }
    }),
    columnHelper.accessor('country', {
      header: 'Country',
      cell: info => (
        <span className="text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-700">
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.accessor('followerCount', {
      header: 'Followers',
      cell: info => <span className="text-gray-700 dark:text-gray-300">{formatCompact(info.getValue())}</span>
    }),
    columnHelper.accessor(row => row.metrics?.avgViewsPerVideo, {
      id: 'avgViews',
      header: 'Avg Views',
      cell: info => {
        const val = info.getValue();
        return <span className="text-gray-700 dark:text-gray-300 font-medium">{val ? formatCompact(val) : '-'}</span>;
      }
    }),
    columnHelper.accessor(row => row.metrics?.engagementRate, {
      id: 'engagement',
      header: 'ER %',
      cell: info => {
        const val = info.getValue();
        return (
          <span className={`font-semibold ${val && val > 3 ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {val ? val + '%' : '-'}
          </span>
        );
      }
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => <span className="text-gray-500 dark:text-gray-500 truncate max-w-[150px] block" title={info.getValue()}>{info.getValue()}</span>
    }),
  ], [categories, columnHelper]);

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
        pageSize: 20,
      }
    },
  });

  return (
    <Layout>
      <div className="p-6 w-full flex flex-col h-[calc(100vh-64px)]">
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Creator Pool 
              <span className="text-sm font-normal text-gray-400 dark:text-gray-500">
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
                  className="h-full pl-9 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-500/20 bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-48 shadow-sm transition-all" 
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

            <div className="h-full w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            
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
            
            <span title={progress || 'Airtable에서 동기화'}>
              <Button 
                variant="secondary" 
                icon={Database} 
                className={`h-full text-xs px-3 ${isSyncing ? 'opacity-50' : ''}`} 
                onClick={handleSyncFromAirtable}
                disabled={isSyncing}
              >
                {isSyncing ? 'Syncing...' : 'Sync'}
              </Button>
            </span>

            <Button icon={UserPlus} className="h-full text-xs px-3" onClick={() => setIsAddModalOpen(true)}>
              Add
            </Button>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden border-gray-200 dark:border-gray-800 p-0 shadow-sm flex flex-col">
          {loading ? (
            <LoadingState message="크리에이터 목록을 불러오는 중..." />
          ) : influencers.length === 0 ? (
            <EmptyState 
              title="등록된 크리에이터 없음"
              description="CSV를 가져오거나 새 크리에이터를 추가하세요."
              icon={Users}
              action={{
                label: '크리에이터 추가',
                onClick: () => setIsAddModalOpen(true)
              }}
            />
          ) : (
          <>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id} 
                        className="px-3 py-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider align-middle cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1.5">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            {
                              asc: <ArrowUp size={10} className="text-gray-700 dark:text-white" />,
                              desc: <ArrowDown size={10} className="text-gray-700 dark:text-white" />,
                            }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={10} className="text-gray-300 dark:text-gray-600" />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-3 py-2 text-xs text-gray-800 dark:text-gray-300 border-none align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center text-xs shrink-0">
            <div className="text-gray-500 dark:text-gray-400">
              Page <span className="font-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</span> of <span className="font-bold text-gray-900 dark:text-white">{table.getPageCount()}</span>
            </div>
            <div className="flex gap-2">
              <button
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          </>
          )}
        </Card>

        {/* New Creator Modal */}
        <NewCreatorModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          categories={categories}
          onSave={handleAddCreator}
        />
      </div>
    </Layout>
  );
};
