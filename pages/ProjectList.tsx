
import React, { useState, useMemo } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { MOCK_PROJECTS } from '../constants';
import { Project } from '../types';
import { Card, Badge, Button } from '../components/UI';
import { Plus, Search, Filter, Edit, Users, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { ProjectModal } from '../components/ProjectModals';

interface ProjectListProps {
  onSelectProject: (project: Project) => void;
}

// Simple Popover for Managers
const ManagersPopover = ({ managers }: { managers: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-xs font-medium text-gray-700 transition-colors"
      >
        <Users size={12} />
        <span>View Team ({managers.length})</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 z-20 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-50">
               <span className="text-xs font-bold text-gray-900">Assigned Managers</span>
               <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}><X size={12} className="text-gray-400" /></button>
            </div>
            <div className="space-y-1">
              {managers.map((email, i) => (
                <div key={i} className="text-xs text-gray-600 bg-gray-50 p-1.5 rounded-lg break-all">
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

export const ProjectList = ({ onSelectProject }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
    } else {
      setProjects(prev => [...prev, project]);
    }
    setEditingProject(null);
  };

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const columnHelper = createColumnHelper<Project>();

  const columns = useMemo(() => [
    columnHelper.accessor('title', {
      header: 'Campaign Name',
      cell: info => (
        <div>
          <div className="font-bold text-gray-900">{info.getValue()}</div>
        </div>
      )
    }),
    columnHelper.accessor('brand', {
      header: 'Brand',
      cell: info => <span className="text-indigo-600 font-medium text-xs bg-indigo-50 px-2 py-1 rounded uppercase tracking-wide">{info.getValue()}</span>
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
        <span className="font-bold text-gray-900 text-sm">${info.getValue().toLocaleString()}</span>
      )
    }),
    columnHelper.accessor('startDate', {
      header: 'Start Date',
      cell: info => <span className="text-sm text-gray-500 font-mono">{info.getValue()}</span>
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      enableSorting: false,
      cell: info => (
        <div className="flex justify-end gap-2">
          <button 
            onClick={(e) => handleEditClick(e, info.row.original)}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit size={16} />
          </button>
          <Button 
            variant="ghost" 
            className="text-xs" 
            onClick={(e: any) => { e.stopPropagation(); onSelectProject(info.row.original); }}
          >
            Open
          </Button>
        </div>
      )
    })
  ], []);

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            Campaigns
          </h2>
          <p className="text-gray-500">Manage seeding projects, budgets, and team assignments</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white w-64 shadow-sm" 
              />
           </div>
           <Button variant="secondary" icon={Filter}>Filter</Button>
           <Button icon={Plus} onClick={() => { setEditingProject(null); setIsModalOpen(true); }}>New Campaign</Button>
        </div>
      </div>

      <Card className="overflow-hidden border-gray-200 p-0 shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50/80 border-b border-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1.5">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        {
                          asc: <ArrowUp size={12} className="text-gray-900" />,
                          desc: <ArrowDown size={12} className="text-gray-900" />,
                        }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={12} className="text-gray-300" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-50">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="hover:bg-gray-50 transition-colors cursor-pointer group"
                onClick={() => onSelectProject(row.original)}
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

      <ProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleSaveProject}
        initialData={editingProject}
      />
    </div>
  );
};
