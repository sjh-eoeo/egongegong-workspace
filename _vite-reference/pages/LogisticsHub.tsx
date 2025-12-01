
import React, { useMemo, useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { MOCK_INFLUENCERS } from '../constants';
import { Influencer } from '../types';
import { Card, Button } from '../components/UI';
import { Truck, Package, MapPin, Upload, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const LogisticsHub = () => {
  // Mock data simulation: Filter for creators who are in negotiating or later stages
  const [data, setData] = useState<Influencer[]>(MOCK_INFLUENCERS.filter(i => 
    i.status !== 'Discovery' && i.status !== 'Contacted'
  ));
  const [sorting, setSorting] = useState<SortingState>([]);

  const handleUpdateTracking = (id: string, tracking: string) => {
    setData(prev => prev.map(i => i.id === id ? { 
        ...i, 
        logistics: { ...i.logistics, trackingNumber: tracking, status: 'Shipped', carrier: 'FedEx' } 
    } : i));
  };

  const columnHelper = createColumnHelper<Influencer>();
  
  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Recipient',
      cell: info => (
        <div>
          <div className="font-bold text-gray-900">{info.getValue()}</div>
          <div className="text-xs text-gray-500">New York, USA</div> 
        </div>
      )
    }),
    columnHelper.accessor('logistics.status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const styles = {
            'Pending': 'bg-gray-100 text-gray-600',
            'Shipped': 'bg-blue-100 text-blue-700',
            'Delivered': 'bg-green-100 text-green-700'
        };
        return <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status as keyof typeof styles] || styles['Pending']}`}>{status}</span>
      }
    }),
    columnHelper.accessor('logistics.carrier', {
      header: 'Carrier',
      cell: info => info.getValue() || <span className="text-gray-300">-</span>
    }),
    columnHelper.accessor('logistics.trackingNumber', {
      header: 'Tracking #',
      cell: info => {
          const val = info.getValue();
          if (val) return <span className="font-mono text-xs text-gray-700">{val}</span>;
          
          return (
              <div className="flex gap-2">
                 <input 
                    className="w-32 px-2 py-1 border border-gray-200 rounded text-xs" 
                    placeholder="Enter Tracking"
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') handleUpdateTracking(info.row.original.id, e.currentTarget.value);
                    }}
                 />
              </div>
          )
      }
    }),
    columnHelper.display({
        id: 'action',
        header: 'Label',
        cell: () => <Button variant="secondary" className="text-xs h-8 py-0">Print Label</Button>
    })
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 mb-2">Logistics Hub</h2>
           <p className="text-gray-500">Product seeding, shipping labels, and delivery tracking.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" icon={Upload}>Bulk Upload Tracking</Button>
            <Button icon={Package}>Generate Labels</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
         <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Truck /></div>
             <div>
                 <div className="text-2xl font-bold text-gray-900">{data.filter(i => i.logistics.status === 'Shipped').length}</div>
                 <div className="text-xs text-gray-500">In Transit</div>
             </div>
         </div>
         <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Package /></div>
             <div>
                 <div className="text-2xl font-bold text-gray-900">{data.filter(i => i.logistics.status === 'Pending').length}</div>
                 <div className="text-xs text-gray-500">To Ship</div>
             </div>
         </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-xl"><MapPin /></div>
             <div>
                 <div className="text-2xl font-bold text-gray-900">{data.filter(i => i.logistics.status === 'Delivered').length}</div>
                 <div className="text-xs text-gray-500">Delivered</div>
             </div>
         </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
              <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-6 py-4 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};
