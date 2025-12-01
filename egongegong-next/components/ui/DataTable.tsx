'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Check, ChevronLeft, ChevronRight } from 'lucide-react';

// Types
export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortValue?: (row: T) => string | number;
  sortable?: boolean;
  width?: string;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  // Pagination
  pageSize?: number;
  // Sorting
  defaultSortField?: string;
  defaultSortDirection?: SortDirection;
  // Row click
  onRowClick?: (row: T) => void;
  // Loading / Empty states
  isLoading?: boolean;
  emptyMessage?: string;
  // Styling
  className?: string;
  stickyHeader?: boolean;
}

// Skeleton Row
const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
);

export function DataTable<T extends { id: string }>({
  data,
  columns,
  keyField,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  pageSize = 50,
  defaultSortField,
  defaultSortDirection = null,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data available',
  className = '',
  stickyHeader = true,
}: DataTableProps<T>) {
  // State
  const [sortField, setSortField] = useState<string | null>(defaultSortField || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);

  // Sort handler
  const handleSort = useCallback((field: string) => {
    const column = columns.find(c => c.id === field);
    if (!column?.sortable) return;

    if (sortField === field) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else if (sortDirection === 'desc') { setSortField(null); setSortDirection(null); }
      else setSortDirection('asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  }, [sortField, sortDirection, columns]);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortField || !sortDirection) return data;

    const column = columns.find(c => c.id === sortField);
    if (!column?.sortValue) return data;

    return [...data].sort((a, b) => {
      const aVal = column.sortValue!(a);
      const bVal = column.sortValue!(b);

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection, columns]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  // Reset page when data changes significantly
  useMemo(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Selection helpers
  const allOnPageSelected = selectable && paginatedData.length > 0 && 
    paginatedData.every(row => selectedIds.includes(String(row[keyField])));
  const someOnPageSelected = selectable && 
    paginatedData.some(row => selectedIds.includes(String(row[keyField])));

  const toggleRow = useCallback((id: string) => {
    if (!onSelectionChange) return;
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter(x => x !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  }, [selectedIds, onSelectionChange]);

  const toggleAllOnPage = useCallback(() => {
    if (!onSelectionChange) return;
    const pageIds = paginatedData.map(row => String(row[keyField]));
    if (allOnPageSelected) {
      onSelectionChange(selectedIds.filter(id => !pageIds.includes(id)));
    } else {
      onSelectionChange([...new Set([...selectedIds, ...pageIds])]);
    }
  }, [paginatedData, keyField, allOnPageSelected, selectedIds, onSelectionChange]);

  // Render sort icon
  const renderSortIcon = (field: string) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />;
    }
    return <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600" />;
  };

  const totalColumns = columns.length + (selectable ? 1 : 0);

  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className={`bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 ${stickyHeader ? 'sticky top-0 z-10' : ''}`}>
            <tr>
              {selectable && (
                <th className="px-4 py-3 w-10">
                  <button 
                    onClick={toggleAllOnPage}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      allOnPageSelected 
                        ? 'bg-gray-700 border-gray-700' 
                        : someOnPageSelected 
                          ? 'bg-gray-400 border-gray-400'
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400'
                    }`}
                  >
                    {(allOnPageSelected || someOnPageSelected) && <Check size={10} className="text-white" />}
                  </button>
                </th>
              )}
              {columns.map(col => (
                <th 
                  key={col.id}
                  className={`px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                    col.sortable ? 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700' : ''
                  } ${col.width || ''} ${col.className || ''}`}
                  onClick={() => col.sortable && handleSort(col.id)}
                >
                  <div className="flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && renderSortIcon(col.id)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
            {isLoading ? (
              <>
                <SkeletonRow cols={totalColumns} />
                <SkeletonRow cols={totalColumns} />
                <SkeletonRow cols={totalColumns} />
              </>
            ) : paginatedData.length > 0 ? (
              paginatedData.map(row => {
                const id = String(row[keyField]);
                const isSelected = selectedIds.includes(id);
                return (
                  <tr 
                    key={id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isSelected ? 'bg-gray-100 dark:bg-gray-950/20' : ''}`}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => toggleRow(id)}
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-gray-700 border-gray-700' 
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-400'
                          }`}
                        >
                          {isSelected && <Check size={10} className="text-white" />}
                        </button>
                      </td>
                    )}
                    {columns.map(col => (
                      <td key={col.id} className={`px-4 py-3 text-sm ${col.className || ''}`}>
                        {col.accessor(row)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={totalColumns} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selectable && selectedIds.length > 0 && (
              <span className="font-medium text-gray-700 dark:text-gray-500 mr-3">
                {selectedIds.length} selected
              </span>
            )}
            Page {currentPage} of {totalPages} • Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
