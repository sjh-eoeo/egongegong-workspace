
import React, { useMemo, useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  getPaginationRowModel
} from '@tanstack/react-table';
import { MOCK_INFLUENCERS } from '../constants';
import { Card, Button, Skeleton } from '../components/UI';
import { 
  Mail, 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Send,
  CheckCheck,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';
import { useToast } from '../components/Toast';

// Define the shape of a log entry
interface OutreachLog {
  id: string;
  influencerId: string;
  influencerName: string;
  influencerHandle: string;
  subject: string;
  content: string;
  timestamp: string;
  sender: string;
  status: 'Sent' | 'Delivered' | 'Opened';
}

// Drawer Component for Email Detail
const EmailDetailDrawer = ({ log, onClose }: { log: OutreachLog | null, onClose: () => void }) => {
  const { addToast } = useToast();

  if (!log) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(log.content);
    addToast('success', 'Content Copied', 'Email body copied to clipboard');
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-slate-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-slate-800 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start bg-gray-50/50 dark:bg-slate-900">
           <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl flex-shrink-0">
                 {log.influencerName.charAt(0)}
              </div>
              <div>
                 <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{log.subject}</h2>
                 <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 dark:text-slate-400">
                    <span className="font-medium text-gray-900 dark:text-gray-200">{log.sender}</span>
                    <span>to</span>
                    <span className="font-medium text-gray-900 dark:text-gray-200">{log.influencerName}</span>
                 </div>
              </div>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full text-gray-500 transition-colors">
              <X size={20} />
           </button>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
             <div className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleString([], {weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'})}
             </div>
             <div className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
                log.status === 'Opened' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30' :
                log.status === 'Delivered' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30' :
                'bg-gray-50 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
             }`}>
                {log.status === 'Opened' && <Eye size={12} />}
                {log.status === 'Delivered' && <CheckCheck size={12} />}
                {log.status === 'Sent' && <Send size={12} />}
                {log.status}
             </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900">
            <div className="prose prose-sm max-w-none font-sans text-gray-800 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {log.content}
            </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900 flex justify-between items-center">
            <button 
               onClick={handleCopy}
               className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
            >
               <Copy size={14} /> Copy Content
            </button>
            <a 
              href={`https://www.tiktok.com/${log.influencerHandle}`} 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 text-xs shadow-sm transition-all"
            >
               View Profile <ExternalLink size={12} />
            </a>
        </div>
      </div>
    </>
  );
};

export const ZendeskOutreach = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Simulated loading state

  // Mock Date Filter State
  const [dateRange, setDateRange] = useState('All Time');

  // 1. Data Transformation
  const data: OutreachLog[] = useMemo(() => {
    return MOCK_INFLUENCERS.flatMap(inf => {
      // Filter for outgoing messages
      const sentMessages = inf.history.filter(msg => !msg.isInternal && msg.sender !== inf.name);

      return sentMessages.map(msg => {
        const templateMatch = msg.content.match(/^\[(.*?)\]/);
        const templateName = templateMatch ? templateMatch[1] : 'Direct Message';
        
        // Mock Status Logic based on random hash of ID
        const statusPool: ('Sent' | 'Delivered' | 'Opened')[] = ['Sent', 'Delivered', 'Delivered', 'Opened', 'Opened'];
        const statusIndex = msg.id.charCodeAt(msg.id.length - 1) % statusPool.length;

        return {
            id: msg.id,
            influencerId: inf.id,
            influencerName: inf.name,
            influencerHandle: inf.handle,
            subject: templateName,
            content: msg.content,
            timestamp: msg.timestamp,
            sender: msg.sender,
            status: statusPool[statusIndex]
        };
      });
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, []);

  const selectedLog = useMemo(() => data.find(l => l.id === selectedLogId) || null, [data, selectedLogId]);

  // 2. Table Config
  const columnHelper = createColumnHelper<OutreachLog>();
  
  const columns = useMemo(() => [
    columnHelper.accessor('sender', {
        header: 'Sender',
        cell: info => (
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-slate-400 text-[10px] font-bold border border-gray-200 dark:border-slate-700">
                    {info.getValue().charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">{info.getValue().split('@')[0]}</span>
            </div>
        )
    }),
    columnHelper.accessor('influencerName', {
      header: 'Recipient',
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold text-gray-900 dark:text-white text-sm">{info.getValue()}</span>
          <span className="text-xs text-gray-400">{info.row.original.influencerHandle}</span>
        </div>
      )
    }),
    columnHelper.accessor('subject', {
        header: 'Subject',
        cell: info => (
            <div className="flex flex-col max-w-[300px]">
                <span className="text-sm font-medium text-gray-800 dark:text-slate-200 truncate">{info.getValue()}</span>
                <span className="text-xs text-gray-400 truncate">{info.row.original.content.replace(/\[.*?\]\s*/, '')}</span>
            </div>
        )
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
                info.getValue() === 'Opened' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                info.getValue() === 'Delivered' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' :
                'bg-gray-50 text-gray-600 dark:bg-slate-800 dark:text-slate-400'
            }`}>
                 {info.getValue() === 'Opened' && <Eye size={10} />}
                 {info.getValue() === 'Delivered' && <CheckCheck size={10} />}
                 {info.getValue() === 'Sent' && <Send size={10} />}
                 {info.getValue()}
            </div>
        )
    }),
    columnHelper.accessor('timestamp', {
      header: 'Time',
      cell: info => (
        <div className="text-xs text-gray-500 dark:text-slate-500 text-right font-mono">
            {new Date(info.getValue()).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
        </div>
      )
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } }
  });

  return (
    <div className="p-6 w-full space-y-6">
       {/* Header */}
       <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Outreach Log</h2>
           <p className="text-gray-500 dark:text-slate-400">Monitor automated Zendesk correspondence and tracking status.</p>
        </div>
        <div className="flex gap-2">
            {/* Date Filter Mock */}
            <div className="relative group">
                <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl text-xs font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                    <CalendarIcon size={14} className="text-gray-600" />
                    {dateRange}
                    <ArrowDown size={12} className="text-gray-400" />
                </button>
            </div>

           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <input 
                value={globalFilter}
                onChange={e => setGlobalFilter(e.target.value)}
                placeholder="Search logs..." 
                className="pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-64 shadow-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white dark:placeholder-slate-500"
              />
           </div>
           <Button variant="secondary" icon={Filter} className="text-xs px-3">Filter</Button>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="overflow-hidden p-0">
          {isLoading ? (
             <div className="p-4 space-y-3">
                 {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
             </div>
          ) : (
             <>
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800">
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th 
                            key={header.id} 
                            className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                            onClick={header.column.getToggleSortingHandler()}
                            >
                                <div className={`flex items-center gap-1.5 ${header.id === 'timestamp' ? 'justify-end' : ''}`}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {header.column.getCanSort() && (
                                        {
                                        asc: <ArrowUp size={12} className="text-gray-900 dark:text-white" />,
                                        desc: <ArrowDown size={12} className="text-gray-900 dark:text-white" />,
                                        }[header.column.getIsSorted() as string] ?? <ArrowUpDown size={12} className="text-gray-300 dark:text-slate-600" />
                                    )}
                                </div>
                            </th>
                        ))}
                        </tr>
                    ))}
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                        {table.getRowModel().rows
                             .filter(row => 
                                !globalFilter || 
                                row.original.influencerName.toLowerCase().includes(globalFilter.toLowerCase()) ||
                                row.original.sender.toLowerCase().includes(globalFilter.toLowerCase())
                            )
                            .map(row => (
                            <tr 
                                key={row.id} 
                                onClick={() => setSelectedLogId(row.original.id)}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group"
                            >
                                {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="px-6 py-4 text-sm border-none">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Pagination */}
                <div className="p-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/30 flex justify-between items-center text-xs text-gray-500 dark:text-slate-400">
                  <span>Page <span className="font-bold text-gray-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</span> of {table.getPageCount()}</span>
                  <div className="flex gap-2">
                      <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"><ChevronLeft size={16}/></button>
                      <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="p-1.5 hover:bg-gray-200 dark:hover:bg-slate-700 rounded disabled:opacity-30"><ChevronRight size={16}/></button>
                  </div>
                </div>
             </>
          )}
      </Card>

      {selectedLog && (
        <EmailDetailDrawer 
            log={selectedLog} 
            onClose={() => setSelectedLogId(null)} 
        />
      )}
    </div>
  );
};
