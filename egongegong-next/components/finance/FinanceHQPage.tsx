'use client';

import React, { useMemo, useState } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { useInfluencers, useProjects } from '@/hooks/useCollection';
import { Influencer, InfluencerStatus, Project } from '@/types';
import { Card, Button, MetricCard } from '@/components/ui';
import { LoadingState, EmptyState } from '@/components/ui/DataStates';
import { DollarSign, Download, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown, CreditCard, Users, TrendingUp, Wallet, Plus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { processPayment } from '@/lib/firebase/firestore';

export const FinanceHQPage = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const { data: influencersData, loading: influencersLoading } = useInfluencers();
  const { data: projectsData, loading: projectsLoading } = useProjects();
  
  const influencers = influencersData as Influencer[];
  const projects = projectsData as Project[];
  const loading = influencersLoading || projectsLoading;

  // Filter influencers with payment pending
  const paymentPendingInfluencers = useMemo(() => 
    influencers.filter(i => i.status === InfluencerStatus.PaymentPending),
    [influencers]
  );

  // Calculate totals
  const totalBudget = useMemo(() => projects.reduce((sum, p) => sum + (p.budget || 0), 0), [projects]);
  const totalSpent = useMemo(() => projects.reduce((sum, p) => sum + (p.spent || 0), 0), [projects]);
  const pendingPayments = useMemo(() => 
    paymentPendingInfluencers.reduce((sum, i) => sum + (i.contract?.totalAmount || 0), 0),
    [paymentPendingInfluencers]
  );

  const columnHelper = createColumnHelper<Influencer>();

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Creator',
      cell: info => (
        <div>
          <div className="font-bold text-gray-900 dark:text-white">{info.getValue()}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{info.row.original.handle}</div>
        </div>
      )
    }),
    columnHelper.accessor('contract.paymentMethod', {
      header: 'Payment Method',
      cell: info => (
        <div className="flex items-center gap-2">
          <CreditCard size={14} className="text-gray-400" />
          <span className="text-sm text-gray-700 dark:text-gray-300">{info.getValue()}</span>
        </div>
      )
    }),
    columnHelper.accessor('contract.totalAmount', {
      header: 'Amount Due',
      cell: info => (
        <span className="font-bold text-gray-900 dark:text-white">
          {formatCurrency(info.getValue())} {info.row.original.contract.currency}
        </span>
      )
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
          {info.getValue()}
        </span>
      )
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => {
        const influencer = info.row.original;
        const isProcessing = processing === influencer.id;
        
        const handlePayment = async () => {
          if (!influencer.projectId) {
            alert('프로젝트가 배정되지 않은 크리에이터입니다.');
            return;
          }
          
          setProcessing(influencer.id);
          try {
            await processPayment(
              influencer.id, 
              influencer.projectId, 
              influencer.contract?.totalAmount || 0
            );
            // Real-time 구독으로 자동 업데이트됨
          } catch (error) {
            console.error('Payment failed:', error);
            alert('결제 처리 중 오류가 발생했습니다.');
          } finally {
            setProcessing(null);
          }
        };
        
        return (
          <Button 
            variant="primary"
            className="text-xs"
            icon={CheckCircle}
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? '처리중...' : 'Pay'}
          </Button>
        );
      }
    })
  ], [columnHelper]);

  const table = useReactTable({
    data: paymentPendingInfluencers,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Layout>
      <div className="p-6 w-full space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Finance HQ</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage payments and track budget allocation</p>
          </div>
          <Button 
            variant="secondary" 
            icon={Download}
            onClick={() => {
              // TODO: Implement CSV export
              alert('Export feature coming soon');
            }}
          >
            Export Report
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Total Budget" 
            value={formatCurrency(totalBudget)} 
            icon={Wallet}
          />
          <MetricCard 
            label="Total Spent" 
            value={formatCurrency(totalSpent)}
            subValue={`${((totalSpent / totalBudget) * 100).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%`}
            icon={TrendingUp}
          />
          <MetricCard 
            label="Pending Payments" 
            value={formatCurrency(pendingPayments)}
            icon={DollarSign}
            active
          />
          <MetricCard 
            label="Creators to Pay" 
            value={formatNumber(paymentPendingInfluencers.length)}
            icon={Users}
          />
        </div>

        {/* Payment Queue */}
        <Card className="overflow-hidden p-0">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white">Payment Queue</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Creators awaiting payment confirmation</p>
          </div>
          
          {(influencersLoading || projectsLoading) ? (
            <LoadingState message="결제 대기 목록을 불러오는 중..." />
          ) : paymentPendingInfluencers.length === 0 ? (
            <EmptyState 
              title="결제 대기 중인 항목 없음"
              description="현재 결제가 필요한 크리에이터가 없습니다."
              icon={DollarSign}
            />
          ) : (
            <table className="w-full text-left">
              <thead className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th 
                        key={header.id}
                        className="px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                  <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </Layout>
  );
};
