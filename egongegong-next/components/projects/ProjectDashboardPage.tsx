'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { 
  ArrowLeft,
  ExternalLink,
  DollarSign,
  Mail,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Video,
  CreditCard,
  Users,
  TrendingUp,
  Target,
  Settings,
  Calendar,
  PlayCircle,
  RefreshCw,
  Copy,
  Lock,
  Unlock,
  CheckCircle2,
  Trash2
} from 'lucide-react';

import { Influencer, InfluencerStatus, Project, ZendeskMacro, ChatMessage } from '@/types';
import { useInfluencers, useProjects } from '@/hooks/useCollection';
import { Button, Card, Badge } from '@/components/ui';
import { Layout } from '@/components/layout/Layout';
import { formatNumber, formatCurrency, formatCompact } from '@/lib/utils';
import { NumberInput } from '@/components/ui/NumberInput';
import { RecruitModal, ReachOutModal, DetailModal } from '@/components/modals';
import { useToast } from '@/components/Toast';
import { updateInfluencer, createInfluencer, deleteInfluencer } from '@/lib/firebase/firestore';
import { ZENDESK_MACROS } from '@/lib/constants';

// Column helper - created outside component
const columnHelper = createColumnHelper<Influencer>();

// Simple Metric Card for different views
const SimpleMetric = ({ label, value, subValue, active, icon: Icon }: {
  label: string;
  value: string | number;
  subValue?: string;
  active?: boolean;
  icon?: React.ElementType;
}) => (
  <div className={`p-5 rounded-2xl border transition-all duration-200 ${
    active 
      ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-700 dark:border-gray-600' 
      : 'bg-white text-gray-900 border-gray-100 dark:bg-gray-900 dark:text-white dark:border-gray-800'
  }`}>
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-2xl font-bold">{value}</h3>
      {Icon && <Icon size={16} className={active ? 'text-gray-400' : 'text-gray-400 dark:text-gray-500'} />}
    </div>
    <p className={`text-xs ${active ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}>{label}</p>
    {subValue && <p className={`text-xs mt-2 ${active ? 'text-emerald-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{subValue}</p>}
  </div>
);

// Tab Component
const Tabs = ({ tabs, activeTab, onChange }: { 
  tabs: { id: string; label: string; icon?: React.ElementType }[];
  activeTab: string;
  onChange: (tabId: string) => void;
}) => (
  <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          activeTab === tab.id
            ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        {tab.icon && <tab.icon size={16} />}
        {tab.label}
      </button>
    ))}
  </div>
);

// Skeleton Row for loading state
const SkeletonRow = ({ cols }: { cols: number }) => (
  <tr className="animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </td>
    ))}
  </tr>
);

export const ProjectDashboardPage = () => {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  const { addToast } = useToast();

  const { data: projectsData, loading: projectsLoading } = useProjects();
  const { data: influencersData, loading: influencersLoading } = useInfluencers(projectId);
  
  const isLoading = projectsLoading || influencersLoading;
  
  const projects = projectsData as Project[];
  const project = projects.find(p => p.id === projectId);
  const allInfluencers = useMemo(() => (influencersData as Influencer[]) || [], [influencersData]);
  
  const [viewMode, setViewMode] = useState<'negotiation' | 'performance' | 'finance' | 'settings'>('negotiation');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const [isScanning, setIsScanning] = useState(false);

  // Filter influencers based on viewMode
  const influencers = useMemo(() => {
    switch (viewMode) {
      case 'negotiation':
        // Negotiation: Discovery, Contacted, Negotiating, Approved (not yet contracted)
        return allInfluencers.filter(i => 
          [InfluencerStatus.Discovery, InfluencerStatus.Contacted, InfluencerStatus.Negotiating, InfluencerStatus.Approved].includes(i.status as InfluencerStatus)
        );
      case 'performance':
        // Performance: Contracted, Shipped, ContentLive (contracted but not in payment stage)
        return allInfluencers.filter(i => 
          [InfluencerStatus.Contracted, InfluencerStatus.Shipped, InfluencerStatus.ContentLive].includes(i.status as InfluencerStatus)
        );
      case 'finance':
        // Finance: PaymentPending, Paid (payment stage only)
        return allInfluencers.filter(i => 
          [InfluencerStatus.PaymentPending, InfluencerStatus.Paid].includes(i.status as InfluencerStatus)
        );
      default:
        return allInfluencers;
    }
  }, [allInfluencers, viewMode]);

  // Modal states
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [isReachOutModalOpen, setIsReachOutModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [macros, setMacros] = useState<ZendeskMacro[]>(ZENDESK_MACROS);

  // Settings tab state
  const [settingsForm, setSettingsForm] = useState({
    title: '',
    brand: '',
    budget: 0,
    status: 'Active' as 'Active' | 'Completed' | 'Draft'
  });

  // Initialize settings form when project loads
  useEffect(() => {
    if (project) {
      setSettingsForm({
        title: project.title || '',
        brand: project.brand || '',
        budget: project.budget || 0,
        status: project.status || 'Active'
      });
    }
  }, [project]);

  // Get selected influencers for outreach
  const selectedInfluencers = useMemo(() => {
    return influencers.filter((_, index) => rowSelection[index]);
  }, [influencers, rowSelection]);

  // Handle adding creators to campaign
  const handleAddCreators = async (newCreators: Influencer[]) => {
    try {
      for (const creator of newCreators) {
        const { id, ...creatorData } = creator;
        await createInfluencer({
          ...creatorData,
          projectId: projectId,
          status: InfluencerStatus.Discovery,
        });
      }
      addToast('success', 'Creators Added', `${newCreators.length} creator(s) added to campaign.`);
      setIsRecruitModalOpen(false);
    } catch (error) {
      console.error('Error adding creators:', error);
      addToast('error', 'Error', 'Failed to add creators to campaign.');
    }
  };

  // Handle sending outreach - save to history and update status
  const handleSendOutreach = async (macroId: string, notes: string, customBody?: string) => {
    try {
      const macro = macros.find(m => m.id === macroId);
      
      for (const recipient of selectedInfluencers) {
        const newMessage: ChatMessage = {
          id: `msg-${Date.now()}-${recipient.id}`,
          sender: 'operator.team',
          content: customBody || macro?.body || '',
          timestamp: new Date().toISOString(),
          isInternal: false,
          type: 'macro'
        };
        
        await updateInfluencer(recipient.id, {
          history: [...(recipient.history || []), newMessage],
          // Update status to Contacted if currently Discovery
          status: recipient.status === InfluencerStatus.Discovery 
            ? InfluencerStatus.Contacted 
            : recipient.status
        });
      }
      
      addToast('success', 'Outreach Sent', `Sent to ${selectedInfluencers.length} creator(s).`);
      setRowSelection({});
      setIsReachOutModalOpen(false);
    } catch (error) {
      console.error('Error sending outreach:', error);
      addToast('error', 'Error', 'Failed to send outreach.');
    }
  };

  // Handle updating influencer
  const handleUpdateInfluencer = async (updated: Influencer) => {
    try {
      const { id, ...data } = updated;
      await updateInfluencer(id, data);
      // Keep modal open and update local state
      setSelectedInfluencer(updated);
    } catch (error) {
      console.error('Error updating influencer:', error);
      addToast('error', 'Error', 'Failed to update influencer.');
    }
  };

  // Handle updating macro
  const handleUpdateMacro = (updatedMacro: ZendeskMacro) => {
    setMacros(prev => prev.map(m => m.id === updatedMacro.id ? updatedMacro : m));
  };

  // Handle deleting influencer from campaign
  const handleDeleteInfluencer = async (influencerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Remove this creator from the campaign?')) return;
    try {
      await deleteInfluencer(influencerId);
      addToast('success', 'Removed', 'Creator removed from campaign.');
    } catch (error) {
      console.error('Error deleting influencer:', error);
      addToast('error', 'Error', 'Failed to remove creator.');
    }
  };

  // Handle bulk delete selected influencers
  const handleBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => influencers[parseInt(idx)]?.id).filter(Boolean);
    if (selectedIds.length === 0) return;
    if (!confirm(`Remove ${selectedIds.length} creator(s) from the campaign?`)) return;
    
    try {
      await Promise.all(selectedIds.map(id => deleteInfluencer(id)));
      setRowSelection({});
      addToast('success', 'Removed', `${selectedIds.length} creator(s) removed from campaign.`);
    } catch (error) {
      console.error('Error deleting influencers:', error);
      addToast('error', 'Error', 'Failed to remove creators.');
    }
  };

  // Handle saving project settings
  const handleSaveSettings = async () => {
    if (!project) return;
    try {
      const { setDoc, doc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase/config');
      await setDoc(doc(db, 'projects', project.id), {
        ...project,
        title: settingsForm.title,
        brand: settingsForm.brand,
        budget: settingsForm.budget,
        status: settingsForm.status
      }, { merge: true });
      addToast('success', 'Saved', 'Campaign settings saved successfully.');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast('error', 'Error', 'Failed to save settings.');
    }
  };

  // Calculate metrics based on view mode
  const metrics = useMemo(() => {
    const totalCreators = influencers.length;
    const contentLive = influencers.filter(i => i.status === InfluencerStatus.ContentLive).length;
    const paid = influencers.filter(i => i.status === InfluencerStatus.Paid).length;
    const totalViews = influencers.reduce((sum, i) => sum + (i.metrics?.views || 0), 0);
    const totalSpent = influencers.reduce((sum, i) => sum + (i.agreedAmount || 0), 0);
    const negotiating = influencers.filter(i => i.status === InfluencerStatus.Negotiating).length;
    const contracted = influencers.filter(i => i.contract?.status === 'Signed').length;
    const shipped = influencers.filter(i => i.logistics?.status === 'Shipped' || i.logistics?.status === 'Delivered').length;
    
    return { totalCreators, contentLive, paid, totalViews, totalSpent, negotiating, contracted, shipped };
  }, [influencers]);

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleScanContent = () => {
    setIsScanning(true);
    setTimeout(() => {
      // TODO: Update in Firestore instead of local state
      console.log('Scan content - update in Firestore');
      setIsScanning(false);
    }, 2000);
  };

  // Dynamic columns based on view mode
  const columns = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const base: any[] = [];

    // Checkbox for negotiation view
    if (viewMode === 'negotiation') {
      base.push({
        id: 'select',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        header: ({ table }: any) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300 dark:border-gray-600"
          />
        ),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cell: ({ row }: any) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 dark:border-gray-600"
          />
        ),
        enableSorting: false,
      });
    }

    // Common columns
    base.push(
      columnHelper.accessor('name', {
        header: 'Creator',
        cell: info => (
          <div>
            <div className="font-bold text-gray-900 dark:text-white">{info.getValue()}</div>
            <a 
              href={`https://tiktok.com/${info.row.original.handle}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {info.row.original.handle}
            </a>
          </div>
        )
      }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: info => <Badge status={info.getValue()} />
      })
    );

    // View-specific columns
    if (viewMode === 'negotiation') {
      base.push(
        columnHelper.accessor('followerCount', {
          header: 'Followers',
          cell: info => <span className="text-sm text-gray-700 dark:text-gray-300">{formatCompact(info.getValue())}</span>
        }),
        columnHelper.accessor('agreedAmount', {
          header: 'Agreed Fee',
          cell: info => (
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(info.getValue()) || '-'}
            </span>
          )
        }),
        columnHelper.accessor(row => row.contract?.status, {
          id: 'contractStatus',
          header: 'Contract',
          cell: info => {
            const status = info.getValue();
            const colors: Record<string, string> = {
              'Draft': 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
              'Sent': 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
              'Signed': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
            };
            return (
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[status || ''] || colors['Draft']}`}>
                {status || 'Draft'}
              </span>
            );
          }
        }),
        columnHelper.accessor(row => row.logistics?.status, {
          id: 'logistics',
          header: 'Shipping',
          cell: info => {
            const status = info.getValue();
            const colors: Record<string, string> = {
              'Not Shipped': 'text-gray-400',
              'Shipped': 'text-blue-600 dark:text-blue-400',
              'Delivered': 'text-emerald-600 dark:text-emerald-400',
            };
            return <span className={`text-xs font-medium ${colors[status || ''] || colors['Not Shipped']}`}>{status || 'Not Shipped'}</span>;
          }
        })
      );
    }

    if (viewMode === 'performance') {
      base.push(
        columnHelper.accessor(row => row.content?.postedVideos?.length || 0, {
          id: 'videosPosted',
          header: 'Videos',
          cell: info => {
            const posted = info.getValue();
            const required = info.row.original.contract?.videoCount || 1;
            return (
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 dark:text-white">{posted}/{required}</span>
                <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${Math.min((posted / required) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          }
        }),
        columnHelper.accessor(row => row.metrics?.views || 0, {
          id: 'views',
          header: 'Views',
          cell: info => (
            <span className="font-medium text-gray-900 dark:text-white">
              {info.getValue() ? formatCompact(info.getValue()) : '-'}
            </span>
          )
        }),
        columnHelper.accessor(row => row.metrics?.engagementRate || 0, {
          id: 'engagement',
          header: 'Engagement',
          cell: info => (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              {info.getValue() ? `${info.getValue()}%` : '-'}
            </span>
          )
        }),
        columnHelper.accessor(row => row.content?.lastDetectedAt, {
          id: 'lastActivity',
          header: 'Last Activity',
          cell: info => {
            const date = info.getValue();
            if (!date) return <span className="text-gray-400">-</span>;
            return <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(date).toLocaleDateString()}</span>;
          }
        })
      );
    }

    if (viewMode === 'finance') {
      base.push(
        columnHelper.accessor(row => row.contract?.paymentMethod, {
          id: 'paymentMethod',
          header: 'Payment Method',
          cell: info => {
            const method = info.getValue();
            const contract = info.row.original.contract;
            return (
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800 dark:text-white flex items-center gap-1">
                  <CreditCard size={12} /> {method || 'Not Set'}
                </span>
                {method === 'PayPal' && contract?.paypalEmail && (
                  <button 
                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center gap-1 group"
                    onClick={() => copyToClipboard(contract.paypalEmail || '')}
                  >
                    <span className="truncate max-w-[100px]">{contract.paypalEmail}</span>
                    <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                  </button>
                )}
              </div>
            );
          }
        }),
        columnHelper.accessor('agreedAmount', {
          id: 'totalFee',
          header: 'Total Fee',
          cell: info => (
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(info.getValue()) || '$0'}
            </span>
          )
        }),
        columnHelper.accessor(row => {
          const posted = row.content?.postedVideos?.length || 0;
          const required = row.contract?.videoCount || 1;
          return posted >= required;
        }, {
          id: 'paymentStatus',
          header: 'Payment Status',
          cell: info => {
            const isUnlocked = info.getValue();
            const posted = info.row.original.content?.postedVideos?.length || 0;
            const required = info.row.original.contract?.videoCount || 1;
            
            return (
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full ${isUnlocked ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'}`}>
                  {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-xs font-bold ${isUnlocked ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {isUnlocked ? 'Ready to Pay' : 'Pending'}
                  </span>
                  <span className="text-[10px] text-gray-400">{posted}/{required} videos</span>
                </div>
              </div>
            );
          }
        }),
        columnHelper.accessor('paymentStatus', {
          id: 'paidStatus',
          header: 'Status',
          cell: info => (
            <span className={`text-sm font-medium ${info.getValue() === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {info.getValue() || 'Pending'}
            </span>
          )
        })
      );
    }

    // Actions column
    base.push(
      columnHelper.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: info => (
          <div className="flex justify-end gap-1">
            <Button 
              variant="ghost" 
              className="p-1.5"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`mailto:${info.row.original.email}`);
              }}
            >
              <Mail size={14} />
            </Button>
            <Button 
              variant="ghost" 
              className="p-1.5"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://tiktok.com/${info.row.original.handle}`, '_blank');
              }}
            >
              <ExternalLink size={14} />
            </Button>
            <Button 
              variant="ghost" 
              className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={(e) => handleDeleteInfluencer(info.row.original.id, e)}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        )
      })
    );

    return base;
  }, [viewMode, copyToClipboard]);

  const table = useReactTable({
    data: influencers,
    columns,
    state: { sorting, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: viewMode === 'negotiation',
  });

  if (!project) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Project not found</h2>
            <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout projectName={project.title}>
      <div className="p-6 w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/projects')}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-500 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <span className="text-gray-600 dark:text-gray-400 font-medium bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded uppercase text-xs">
                  {project.brand}
                </span>
                <span>•</span>
                <Badge status={project.status} />
                <span>•</span>
                <span>Started {project.startDate}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {viewMode === 'performance' && (
              <Button 
                variant="secondary" 
                icon={RefreshCw}
                onClick={handleScanContent}
                disabled={isScanning}
              >
                {isScanning ? 'Scanning...' : 'Scan Content'}
              </Button>
            )}
            <Button 
              variant="secondary" 
              icon={UserPlus}
              onClick={() => setIsRecruitModalOpen(true)}
            >
              Add Creators
            </Button>
            <Button 
              icon={Mail}
              onClick={() => {
                if (selectedInfluencers.length > 0) {
                  setIsReachOutModalOpen(true);
                } else {
                  addToast('info', 'Select Creators', 'Please select creators to send outreach.');
                }
              }}
            >
              Send Outreach {selectedInfluencers.length > 0 && `(${selectedInfluencers.length})`}
            </Button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <Tabs 
          tabs={[
            { id: 'negotiation', label: 'Negotiation', icon: Target },
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'finance', label: 'Finance', icon: DollarSign },
            { id: 'settings', label: 'Settings', icon: Settings },
          ]}
          activeTab={viewMode}
          onChange={(id) => setViewMode(id as 'negotiation' | 'performance' | 'finance' | 'settings')}
        />

        {/* Settings Tab */}
        {viewMode === 'settings' ? (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Campaign Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Campaign Name</label>
                <input 
                  type="text" 
                  value={settingsForm.title}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                <input 
                  type="text" 
                  value={settingsForm.brand}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, brand: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget</label>
                <NumberInput 
                  value={settingsForm.budget}
                  onChange={(val) => setSettingsForm(prev => ({ ...prev, budget: val }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select 
                  value={settingsForm.status}
                  onChange={(e) => setSettingsForm(prev => ({ ...prev, status: e.target.value as 'Active' | 'Completed' | 'Draft' }))}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="Draft">Draft</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Metrics based on view mode */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {viewMode === 'negotiation' && (
                <>
                  <SimpleMetric label="In Negotiation" value={metrics.negotiating} active icon={Calendar} />
                  <SimpleMetric label="Contracts Signed" value={metrics.contracted} icon={CheckCircle2} />
                  <SimpleMetric label="Products Shipped" value={metrics.shipped} icon={Video} />
                  <SimpleMetric label="Total Creators" value={metrics.totalCreators} icon={Users} />
                </>
              )}
              {viewMode === 'performance' && (
                <>
                  <SimpleMetric label="Total Views" value={formatCompact(metrics.totalViews)} active icon={PlayCircle} />
                  <SimpleMetric label="Content Live" value={formatNumber(metrics.contentLive)} icon={Video} />
                  <SimpleMetric label="Avg. Engagement" value="8.5%" subValue="High Perf." icon={TrendingUp} />
                  <SimpleMetric label="Total Creators" value={formatNumber(metrics.totalCreators)} icon={Users} />
                </>
              )}
              {viewMode === 'finance' && (
                <>
                  <SimpleMetric label="Budget Used" value={formatCurrency(project.spent)} subValue={`of ${formatCurrency(project.budget)}`} active icon={DollarSign} />
                  <SimpleMetric label="Paid" value={formatNumber(metrics.paid)} icon={CheckCircle2} />
                  <SimpleMetric label="Pending Payment" value={formatNumber(metrics.contentLive - metrics.paid)} icon={CreditCard} />
                  <SimpleMetric label="Cost Per View" value={metrics.totalViews > 0 ? `$${(project.spent / metrics.totalViews).toFixed(4).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}` : '-'} />
                </>
              )}
            </div>

            {/* Creator Table */}
            <Card className="overflow-hidden p-0">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h3 className="font-bold text-gray-800 dark:text-white">
                  {viewMode === 'negotiation' ? 'Contract & Workflow' : 
                   viewMode === 'performance' ? 'Content Performance' : 'Payment Management'}
                </h3>
                {viewMode === 'negotiation' && Object.keys(rowSelection).length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      icon={Trash2} 
                      className="text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleBulkDelete}
                    >
                      Delete {Object.keys(rowSelection).length} selected
                    </Button>
                    <Button 
                      variant="primary" 
                      icon={Mail} 
                      className="text-xs"
                      onClick={() => setIsReachOutModalOpen(true)}
                    >
                      Send to {Object.keys(rowSelection).length} selected
                    </Button>
                  </div>
                )}
              </div>
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
                  {isLoading ? (
                    <>
                      <SkeletonRow cols={columns.length} />
                      <SkeletonRow cols={columns.length} />
                      <SkeletonRow cols={columns.length} />
                    </>
                  ) : table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                    <tr 
                      key={row.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedInfluencer(row.original)}
                    >
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-4 py-3 text-sm" onClick={(e) => {
                          // Prevent row click when clicking on checkbox
                          if (cell.column.id === 'select') {
                            e.stopPropagation();
                          }
                        }}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                  ) : (
                    <tr>
                      <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                        No creators added to this campaign yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Card>
          </>
        )}
      </div>

      {/* Modals */}
      <RecruitModal 
        isOpen={isRecruitModalOpen}
        onClose={() => setIsRecruitModalOpen(false)}
        existingIds={influencers.map(i => i.id)}
        onAdd={handleAddCreators}
      />

      <ReachOutModal
        isOpen={isReachOutModalOpen}
        onClose={() => setIsReachOutModalOpen(false)}
        recipients={selectedInfluencers}
        onSend={handleSendOutreach}
        macros={macros}
      />

      {selectedInfluencer && (
        <DetailModal
          influencer={selectedInfluencer}
          onClose={() => setSelectedInfluencer(null)}
          onUpdate={handleUpdateInfluencer}
          macros={macros}
          onUpdateMacro={handleUpdateMacro}
        />
      )}
    </Layout>
  );
};
