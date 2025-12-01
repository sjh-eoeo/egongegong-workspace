'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { useProjects, useBrands, useUsers } from '@/hooks/useCollection';
import { Project, Brand, User } from '@/types';
import { Card, Badge, Button } from '@/components/ui';
import { Plus, Search, Filter, Edit, Users, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatCurrency } from '@/lib/utils';
import { ProjectModal } from '@/components/modals';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useToast } from '@/components/Toast';
import { MOCK_BRANDS, MOCK_USERS } from '@/lib/constants';

// Simple Popover for Managers
const ManagersPopover = ({ managers }: { managers: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <Users size={12} />
        <span>View Team ({managers.length})</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 p-3 z-20 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50 dark:border-gray-800">
              <span className="text-xs font-bold text-gray-900 dark:text-white">Assigned Managers</span>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}><X size={12} className="text-gray-400" /></button>
            </div>
            <div className="space-y-1">
              {managers.map((email, i) => (
                <div key={i} className="text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-lg break-all">
                  {email}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ProjectListPage = () => {
  const router = useRouter();
  const { data: projects, loading } = useProjects();
  const { data: brandsData } = useBrands();
  const { data: usersData } = useUsers();
  const { addToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Use Firestore data or fallback to mock data
  const brands = (brandsData.length > 0 ? brandsData : MOCK_BRANDS) as Brand[];
  const users = (usersData.length > 0 ? usersData : MOCK_USERS) as User[];

  const handleSelectProject = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const handleSaveProject = async (project: Project) => {
    try {
      const projectRef = doc(db, 'projects', project.id);
      await setDoc(projectRef, project, { merge: true });
      addToast('success', editingProject ? 'Campaign Updated' : 'Campaign Created', `"${project.title}" has been saved.`);
    } catch (error) {
      console.error('Error saving project:', error);
      addToast('error', 'Error', 'Failed to save campaign.');
    }
    setEditingProject(null);
    setIsModalOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects as Project[];
    const query = searchQuery.toLowerCase();
    return (projects as Project[]).filter(p => 
      p.title?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const columnHelper = createColumnHelper<Project>();

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Campaign Name',
      cell: info => (
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{info.getValue()}</div>
        </div>
      )
    }),
    columnHelper.accessor('brand', {
      header: 'Brand',
      cell: info => <span className="text-gray-600 dark:text-gray-400 font-medium text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded uppercase tracking-wide">{info.getValue()}</span>
    }),
    columnHelper.accessor('managers', {
      header: 'Managers',
      enableSorting: false,
      cell: info => <ManagersPopover managers={info.getValue()} />
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => <Badge status={info.getValue()} />
    }),
    columnHelper.accessor('spent', {
      header: 'Settled Amount',
      cell: info => (
        <span className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(info.getValue())}</span>
      )
    }),
    columnHelper.accessor('startDate', {
      header: 'Start Date',
      cell: info => <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">{info.getValue()}</span>
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: info => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={(e) => handleEditClick(e, info.row.original)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <Edit size={16} />
          </button>
          <Button 
            variant="ghost" 
            className="text-xs" 
            onClick={(e) => { e.stopPropagation(); handleSelectProject(info.row.original); }}
          >
            Open
          </Button>
        </div>
      )
    })
  ], []);

  const table = useReactTable({
    data: filteredProjects,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Layout>
      <div className="p-6 w-full">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              Campaigns
            </h2>
            <p className="text-gray-500 dark:text-gray-400">Manage seeding projects, budgets, and team assignments</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-500/20 bg-white dark:bg-gray-800 w-64 shadow-sm dark:text-white" 
              />
            </div>
            <Button 
              variant="secondary" 
              icon={Filter}
              onClick={() => {
                // TODO: Implement filter dropdown
                alert('Filter feature coming soon');
              }}
            >
              Filter
            </Button>
            <Button icon={Plus} onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>New Campaign</Button>
          </div>
        </div>

        <Card className="overflow-hidden border-gray-200 dark:border-gray-800 p-0 shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th 
                      key={header.id} 
                      className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1.5">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          {
                            asc: <ArrowUp size={12} className="text-gray-900 dark:text-white" />,
                            desc: <ArrowDown size={12} className="text-gray-900 dark:text-white" />,
                          }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={12} className="text-gray-300 dark:text-gray-600" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                  onClick={() => handleSelectProject(row.original)}
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3 text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Project Modal */}
        <ProjectModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setEditingProject(null); }}
          onSubmit={handleSaveProject}
          initialData={editingProject}
          brands={brands as Brand[]}
          users={users as User[]}
        />
      </div>
    </Layout>
  );
};
