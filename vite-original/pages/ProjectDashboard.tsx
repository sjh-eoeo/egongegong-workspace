
import React, { useState, useMemo, useEffect } from 'react';
import { 
  createColumnHelper, 
  flexRender, 
  getCoreRowModel, 
  useReactTable,
  ColumnDef,
  getSortedRowModel,
  SortingState
} from '@tanstack/react-table';
import { 
  ArrowLeft,
  PlayCircle,
  ExternalLink,
  DollarSign,
  Calendar,
  Mail,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Video,
  CreditCard,
  Copy,
  RefreshCw,
  BarChart2,
  Activity,
  CheckCircle2,
  Lock,
  Unlock
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Legend
} from 'recharts';

import { Influencer, Project, InfluencerStatus, ZendeskMacro, PaymentMilestone } from '../types';
import { MOCK_INFLUENCERS } from '../constants';
import { Button, Card, Badge } from '../components/UI';
import { RecruitModal } from '../components/ProjectModals';
import { DetailModal } from '../components/CampaignModals';
import { ProjectSettingsTab } from '../components/ProjectSettingsTab';
import { ReachOutModal } from '../components/ReachOutModal';
import { useToast } from '../components/Toast';

interface ProjectDashboardProps {
  project: Project;
  onBack: () => void;
  macros: ZendeskMacro[];
  onUpdateMacro: (macro: ZendeskMacro) => void;
}

export const ProjectDashboard = ({ project, onBack, macros, onUpdateMacro }: ProjectDashboardProps) => {
  const { addToast } = useToast();
  const [currentProject, setCurrentProject] = useState<Project>(project);
  const [viewMode, setViewMode] = useState<'Negotiation' | 'Performance' | 'Finance' | 'Settings'>('Negotiation');
  
  // Data State
  const [influencers, setInfluencers] = useState<Influencer[]>(
    MOCK_INFLUENCERS.filter(i => i.projectId === project.id)
  );
  
  // UI State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rowSelection, setRowSelection] = useState({});
  const [isReachOutOpen, setIsReachOutOpen] = useState(false);
  const [isRecruitOpen, setIsRecruitOpen] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isScanning, setIsScanning] = useState(false);

  // Chart State
  const [chartMode, setChartMode] = useState<'live' | 'daily'>('daily');
  
  // Initialize dates safely
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);
  
  const [dateRange, setDateRange] = useState({ 
      start: lastWeek.toISOString().split('T')[0], 
      end: today.toISOString().split('T')[0] 
  });

  const selectedInfluencer = useMemo(() => influencers.find(i => i.id === selectedId) || null, [selectedId, influencers]);

  const handleUpdateProject = (updated: Project) => {
    setCurrentProject(updated);
    addToast('success', 'Project Updated', 'Campaign settings saved successfully.');
  };

  const handleAddInfluencers = (newInfluencers: Influencer[]) => {
      const processed = newInfluencers.map(inf => ({
          ...inf,
          projectId: currentProject.id,
          status: inf.status === InfluencerStatus.Discovery ? InfluencerStatus.Discovery : inf.status
      }));
      setInfluencers(prev => [...processed, ...prev]);
      addToast('success', 'Creators Added', `${newInfluencers.length} creators added to campaign.`);
  };

  const handleBulkReachOut = (macroId: string, notes: string, customBody?: string) => {
     const selectedIds = table.getRowModel().rows
        .filter(row => row.getIsSelected())
        .map(row => row.original.id);
     
     setInfluencers(prev => prev.map(inf => {
         if (selectedIds.includes(inf.id)) {
             return {
                 ...inf,
                 status: InfluencerStatus.Contacted,
                 history: [
                     ...inf.history,
                     {
                         id: Date.now().toString() + Math.random(),
                         sender: 'operator.team',
                         content: `[Bulk Sent] ${notes}\n\nBody: ${customBody?.substring(0, 50)}...`,
                         timestamp: new Date().toISOString(),
                         isInternal: false,
                         type: 'macro'
                     }
                 ]
             };
         }
         return inf;
     }));
     setRowSelection({});
     addToast('success', 'Bulk Outreach Sent', `Messages queued for ${selectedIds.length} creators.`);
  };

  const handleScanTokAPI = () => {
    setIsScanning(true);
    addToast('info', 'TokAPI Scan Started', 'Checking for new content across tracked accounts...');
    setTimeout(() => {
        setInfluencers(prev => prev.map(inf => {
            if (inf.contract.videoCount > inf.content.postedVideos.length && Math.random() > 0.5) {
                return {
                    ...inf,
                    status: InfluencerStatus.ContentLive,
                    content: {
                        ...inf.content,
                        status: 'Live',
                        postedVideos: [
                            ...inf.content.postedVideos, 
                            { id: `auto-${Date.now()}`, link: `https://tiktok.com/new_video_${Date.now()}`, date: new Date().toISOString() }
                        ],
                        lastDetectedAt: new Date().toISOString()
                    },
                    metrics: {
                        ...inf.metrics!,
                        views: (inf.metrics?.views || 0) + 1500
                    }
                };
            }
            return inf;
        }));
        setIsScanning(false);
        addToast('success', 'Scan Complete', 'Metrics updated and new content detected.');
    }, 1500);
  };

  // --- Chart Data Generation ---
  const liveChartData = useMemo(() => [
    { time: '10:00', views: 1200, eng: 5 },
    { time: '12:00', views: 3500, eng: 12 },
    { time: '14:00', views: 8900, eng: 25 },
    { time: '16:00', views: 15000, eng: 45 },
    { time: '18:00', views: 45000, eng: 85 },
    { time: '20:00', views: 85000, eng: 110 },
    { time: 'Now', views: 125000, eng: 120 },
  ], []);

  const dailyChartData = useMemo(() => {
      const data = [];
      const startParts = dateRange.start.split('-').map(Number);
      const endParts = dateRange.end.split('-').map(Number);
      
      const startDate = new Date(Date.UTC(startParts[0], startParts[1] - 1, startParts[2]));
      const endDate = new Date(Date.UTC(endParts[0], endParts[1] - 1, endParts[2]));
      
      const current = new Date(startDate);

      while (current <= endDate) {
          const dateStr = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
          const uploads = Math.floor(Math.random() * 8); 
          const views = Math.floor(Math.random() * 50000) + (uploads * 5000); 
          data.push({
              date: dateStr,
              uploads: uploads,
              views: views
          });
          current.setUTCDate(current.getUTCDate() + 1);
      }
      return data;
  }, [dateRange]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('info', 'Copied', text);
  };

  const getNextMilestone = (inf: Influencer) => {
      if (!inf.contract.milestones || inf.contract.milestones.length === 0) return null;
      return inf.contract.milestones.find(m => m.status === 'Pending') || null;
  };

  const columnHelper = createColumnHelper<Influencer>();
  
  const columns = useMemo(() => {
    const base: ColumnDef<Influencer, any>[] = [];

    if (viewMode === 'Negotiation') {
        base.push({
            id: 'select',
            header: ({ table }) => (
              <div className="w-4">
                <input
                  type="checkbox"
                  checked={table.getIsAllRowsSelected()}
                  onChange={table.getToggleAllRowsSelectedHandler()}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
              </div>
            ),
            cell: ({ row }) => (
              <div className="w-4">
                <input
                  type="checkbox"
                  checked={row.getIsSelected()}
                  onChange={row.getToggleSelectedHandler()}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
              </div>
            ),
            enableSorting: false,
        });
    }

    base.push(
      columnHelper.accessor('name', {
        header: 'Creator',
        cell: info => (
          <div>
            <div className="font-bold text-gray-900 text-sm">{info.getValue()}</div>
            <div className="text-xs text-gray-500">{info.row.original.handle}</div>
          </div>
        )
      })
    );

    if (viewMode === 'Negotiation') {
        base.push(
            columnHelper.accessor('status', {
                header: 'Global Status',
                cell: info => <Badge status={info.getValue()} />
            }),
            columnHelper.accessor('contract.status', {
                header: 'Contract Status',
                cell: info => {
                    const status = info.getValue();
                    const color = status === 'Signed' ? 'text-green-600 bg-green-50 border-green-200' : 
                                  status === 'Sent' ? 'text-blue-600 bg-blue-50 border-blue-200' : 
                                  'text-gray-500 bg-gray-50 border-gray-200';
                    return <span className={`px-2 py-0.5 text-xs font-medium rounded border ${color}`}>{status}</span>
                }
            }),
            columnHelper.accessor('contract.totalAmount', {
                header: 'Agreed Fee',
                cell: info => <span className="font-medium text-gray-900">${info.getValue().toLocaleString()}</span>
            }),
            columnHelper.accessor('contract.paymentSchedule', {
                header: 'Payment Terms',
                cell: info => <span className="text-xs text-gray-500">{info.getValue()}</span>
            })
        );
    }

    if (viewMode === 'Performance') {
      base.push(
        columnHelper.accessor('content', {
            header: 'Content Status',
            cell: info => {
                const content = info.getValue();
                const statusColor = {
                    'Live': 'text-emerald-600 bg-emerald-50 border-emerald-100',
                    'Approved': 'text-blue-600 bg-blue-50 border-blue-100',
                    'Draft Review': 'text-amber-600 bg-amber-50 border-amber-100',
                    'Waiting for Draft': 'text-gray-500 bg-gray-50 border-gray-100'
                };
                return (
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${statusColor[content.status as keyof typeof statusColor] || 'bg-gray-50'}`}>
                        {content.status}
                    </span>
                )
            }
        }),
        columnHelper.display({
            id: 'videoCount',
            header: 'Delivered (TokAPI)',
            cell: info => {
                const posted = info.row.original.content.postedVideos.length;
                const target = info.row.original.contract.videoCount;
                const percent = Math.min((posted / target) * 100, 100);
                
                return (
                    <div className="w-24">
                        <div className="flex justify-between items-center mb-1">
                             <div className="flex items-center gap-1 font-medium text-gray-800 text-xs">
                                <Video size={10} className="text-gray-400" />
                                <span>{posted} <span className="text-gray-400">/ {target}</span></span>
                             </div>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${percent === 100 ? 'bg-emerald-500' : 'bg-gray-400'}`} 
                              style={{ width: `${percent}%` }}
                            />
                        </div>
                    </div>
                )
            }
        }),
        columnHelper.display({
            id: 'milestoneProgress',
            header: 'Next Payment Milestone',
            cell: info => {
                const contract = info.row.original.contract;
                const postedCount = info.row.original.content.postedVideos.length;
                const milestones = contract.milestones;
                
                // --- Logic for One-off / Completion Contracts ---
                if (!milestones || milestones.length === 0) {
                     const isDone = postedCount >= contract.videoCount;
                     if (isDone) return <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> Ready for Payment</span>;
                     return <span className="text-xs text-gray-400">Pending Completion</span>;
                }

                // --- Logic for Batched/Milestone Contracts ---
                const pendingMilestone = milestones.find(m => m.status === 'Pending' || m.status === 'Eligible');
                
                if (!pendingMilestone) {
                    return <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 size={12} /> All Paid</span>;
                }

                const requirement = pendingMilestone.videoRequirement || 0;
                const isEligible = postedCount >= requirement;

                return (
                    <div className="flex flex-col gap-1 w-40">
                         <div className="flex justify-between items-center">
                             <span className="text-[10px] font-bold text-gray-600 truncate max-w-[100px]" title={pendingMilestone.label}>{pendingMilestone.label}</span>
                             <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isEligible ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                 {isEligible ? 'Eligible' : 'Locked'}
                             </span>
                         </div>
                         <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-100 relative">
                             {/* Requirement Marker */}
                             <div className="absolute top-0 bottom-0 bg-red-400 w-0.5 z-10" style={{ left: '100%' }}></div> 
                             
                             <div 
                                className={`h-full rounded-full transition-all duration-500 ${isEligible ? 'bg-emerald-500' : 'bg-amber-400'}`} 
                                style={{ width: `${Math.min((postedCount / requirement) * 100, 100)}%` }}
                             />
                         </div>
                         <div className="flex justify-between text-[9px] text-gray-400">
                             <span>{postedCount} / {requirement} videos</span>
                             <span>${pendingMilestone.amount}</span>
                         </div>
                    </div>
                )
            }
        }),
        columnHelper.accessor('metrics', {
          header: 'Performance',
          cell: info => (
             <div className="flex gap-4 text-sm">
                <div><span className="text-gray-400 text-xs mr-1">Views</span> <span className="font-medium">{info.getValue()?.views.toLocaleString()}</span></div>
                <div><span className="text-gray-400 text-xs mr-1">Eng.</span> <span className="font-medium text-emerald-600">{info.getValue()?.engagementRate}%</span></div>
             </div>
          )
        })
      );
    }

    if (viewMode === 'Finance') {
      base.push(
        columnHelper.display({
          id: 'paymentInfo',
          header: 'Payment Details',
          cell: info => {
              const c = info.row.original.contract;
              if (c.paymentMethod === 'PayPal') {
                return (
                    <div className="flex flex-col">
                    <div className="text-xs font-bold text-blue-700 flex items-center gap-1 mb-0.5"><CreditCard size={10} /> PayPal</div>
                    <div className="text-xs text-gray-600 flex items-center gap-1 group cursor-pointer hover:text-blue-600" onClick={() => copyToClipboard(c.paypalEmail || '')}>
                        <span className="truncate max-w-[120px]">{c.paypalEmail || 'No email'}</span>
                        <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                    </div>
                    </div>
                );
              } else if (c.paymentMethod === 'Bank Transfer' || c.paymentMethod === 'Wise') {
                return (
                    <div className="flex flex-col">
                    <div className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-0.5"><CreditCard size={10} /> {c.bankName || 'Bank'}</div>
                    <div className="text-xs text-gray-600 flex items-center gap-1 group cursor-pointer hover:text-blue-600" onClick={() => copyToClipboard(c.accountNumber || '')}>
                        <span className="truncate max-w-[120px]">{c.accountNumber ? `**** ${c.accountNumber.slice(-4)}` : 'No info'}</span>
                        <Copy size={10} className="opacity-0 group-hover:opacity-100" />
                    </div>
                    </div>
                );
              }
              return <span className="text-xs text-gray-400">Unselected</span>;
          }
        }),
        columnHelper.accessor('contract', {
            id: 'unlockCondition',
            header: 'Next Payment Condition',
            cell: info => {
                const contract = info.getValue();
                const posted = info.row.original.content.postedVideos.length;
                const milestones = contract.milestones;
                
                // --- Simple Contract Logic ---
                if (!milestones || milestones.length === 0) {
                    const isUnlocked = posted >= contract.videoCount;
                    return (
                        <div className="flex items-center gap-2">
                             <div className={`p-1.5 rounded-full ${isUnlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                 {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                             </div>
                             <div className="flex flex-col">
                                 <span className={`text-xs font-bold ${isUnlocked ? 'text-green-700' : 'text-gray-500'}`}>
                                     {isUnlocked ? 'Payment Unlocked' : 'Pending Completion'}
                                 </span>
                                 <span className="text-[10px] text-gray-400">{posted} / {contract.videoCount} Videos</span>
                             </div>
                        </div>
                    );
                }

                // --- Milestone Logic ---
                const next = milestones.find(m => m.status !== 'Paid');
                if (!next) return <span className="text-xs text-emerald-600">Fully Paid</span>;

                const req = next.videoRequirement || 0;
                const isUnlocked = posted >= req;

                return (
                    <div className="flex items-center gap-2">
                         <div className={`p-1.5 rounded-full ${isUnlocked ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-400'}`}>
                             {isUnlocked ? <Unlock size={12} /> : <Lock size={12} />}
                         </div>
                         <div className="flex flex-col">
                             <span className={`text-xs font-bold ${isUnlocked ? 'text-green-700' : 'text-gray-500'}`}>
                                 {isUnlocked ? 'Ready to Pay' : 'Requirement Not Met'}
                             </span>
                             <span className="text-[10px] text-gray-400">{posted} / {req} Videos for {next.label}</span>
                         </div>
                    </div>
                )
            }
        }),
        columnHelper.accessor('paymentStatus', {
          header: 'Global Status',
          cell: info => (
            <span className={`text-sm font-medium ${info.getValue() === 'Paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
               {info.getValue()}
            </span>
          )
        })
      );
    }

    base.push(
      columnHelper.display({
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: props => (
          <div className="flex justify-end">
             <Button variant="secondary" className="py-1 px-3 text-xs h-8 border-gray-300" onClick={(e: any) => { e.stopPropagation(); setSelectedId(props.row.original.id); }}>
               Manage
             </Button>
          </div>
        )
      })
    );

    return base;
  }, [viewMode]);

  const table = useReactTable({
    data: influencers,
    columns,
    state: { rowSelection, sorting },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true, 
  });

  // Re-define SimpleMetric inside for usage
  const SimpleMetric = ({ label, value, subValue, active, icon: Icon }: any) => (
    <div className={`p-5 rounded-2xl border transition-all duration-200 ${active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900 border-gray-100'}`}>
        <div className="flex justify-between items-start mb-2">
           <h3 className="text-2xl font-bold">{value}</h3>
           {Icon && <Icon size={16} className={active ? 'text-gray-400' : 'text-gray-400'} />}
        </div>
        <p className={`text-xs ${active ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
        {subValue && <p className={`text-xs mt-2 ${active ? 'text-emerald-400' : 'text-emerald-600'}`}>{subValue}</p>}
    </div>
  );

  return (
    <div className="space-y-6 p-6 w-full">
      {/* Project Header */}
      <div className="flex flex-col gap-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors w-fit">
          <ArrowLeft size={16} /> Back to Campaigns
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div>
               <h1 className="text-3xl font-bold text-gray-900">{currentProject.title}</h1>
               <div className="flex items-center gap-4 mt-2">
                 <div className="flex -space-x-2">
                    {currentProject.managers.map((manager, idx) => (
                      <span key={idx} className="h-6 px-2 flex items-center justify-center bg-gray-100 rounded text-xs font-medium border border-white text-gray-600" title={manager}>
                         {manager.charAt(0).toUpperCase()}
                      </span>
                    ))}
                 </div>
                 <Badge status={currentProject.status} />
               </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-white p-1 rounded-xl border border-gray-200">
              {['Negotiation', 'Performance', 'Finance', 'Settings'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setViewMode(tab as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    viewMode === tab ? 'bg-gray-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Tab Content --- */}
      {viewMode === 'Settings' ? (
          <ProjectSettingsTab 
            project={currentProject} 
            onUpdate={handleUpdateProject} 
            existingInfluencerIds={influencers.map(i => i.id)}
            onAddInfluencers={handleAddInfluencers}
          />
      ) : (
        <div className="space-y-6">
          
          {/* Top Section: Charts (Only for Performance View) */}
          {viewMode === 'Performance' && (
            <Card className="p-6 border-gray-200 shadow-sm flex flex-col h-[400px]">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {chartMode === 'live' ? <Activity className="text-emerald-500" size={20} /> : <BarChart2 className="text-indigo-500" size={20} />}
                            {chartMode === 'live' ? 'Live Engagement Stream' : 'Daily Performance Analytics'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {chartMode === 'live' ? 'Real-time data from TokAPI connection' : 'Historical analysis of uploads vs views'}
                        </p>
                    </div>
                    <div className="flex gap-3">
                         {/* Toggle Mode */}
                         <div className="flex bg-gray-100 p-0.5 rounded-lg">
                            <button 
                                onClick={() => setChartMode('daily')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartMode === 'daily' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Daily
                            </button>
                            <button 
                                onClick={() => setChartMode('live')}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${chartMode === 'live' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Live
                            </button>
                         </div>

                         {/* Date Picker (Only in Daily Mode) */}
                         {chartMode === 'daily' && (
                             <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-2">
                                 <Calendar size={14} className="text-gray-600" />
                                 <input 
                                    type="date" 
                                    value={dateRange.start}
                                    max={dateRange.end}
                                    onChange={e => setDateRange({...dateRange, start: e.target.value})}
                                    className="bg-white text-xs py-1.5 px-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-200 text-gray-900 font-medium w-28 border-none cursor-pointer"
                                 />
                                 <span className="text-gray-400 text-xs">-</span>
                                 <input 
                                    type="date" 
                                    value={dateRange.end}
                                    min={dateRange.start}
                                    onChange={e => setDateRange({...dateRange, end: e.target.value})}
                                    className="bg-white text-xs py-1.5 px-1 rounded focus:outline-none focus:ring-1 focus:ring-indigo-200 text-gray-900 font-medium w-28 border-none cursor-pointer"
                                 />
                             </div>
                         )}
                    </div>
                </div>

                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        {chartMode === 'live' ? (
                            <LineChart data={liveChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="time" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    itemStyle={{fontSize: '12px', fontWeight: 600}}
                                />
                                <Line type="monotone" dataKey="views" name="Live Views" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{r: 6}} />
                                <Line type="monotone" dataKey="eng" name="Engagement" stroke="#6366f1" strokeWidth={2} dot={false} />
                                <Legend />
                            </LineChart>
                        ) : (
                            <ComposedChart data={dailyChartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" orientation="left" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" tick={{fontSize: 10, fill: '#64748b'}} axisLine={false} tickLine={false} />
                                <Tooltip 
                                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                                    cursor={{fill: '#f8fafc'}}
                                />
                                <Legend />
                                <Bar yAxisId="right" dataKey="uploads" name="Videos Uploaded" fill="#cbd5e1" barSize={30} radius={[4, 4, 0, 0]} />
                                <Line yAxisId="left" type="monotone" dataKey="views" name="Total Views" stroke="#4f46e5" strokeWidth={3} dot={{r: 4}} />
                            </ComposedChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </Card>
          )}

          {/* KPI Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {viewMode === 'Performance' ? (
                  <>
                    <SimpleMetric label="Total Views (Live)" value="125.0K" subValue="+12% today" active icon={PlayCircle} />
                    <SimpleMetric label="Engagement Rate" value="10.5%" subValue="High Perf." />
                    <SimpleMetric label="Active Videos" value={influencers.filter(i => i.status === 'Content Live').length.toString()} />
                    <SimpleMetric label="Total Shares" value="120" />
                  </>
                ) : viewMode === 'Finance' ? (
                  <>
                    <SimpleMetric label="Budget Utilized" value={`$${currentProject.spent}`} subValue={`of $${currentProject.budget}`} active icon={DollarSign} />
                    <SimpleMetric label="Pending Invoices" value="1" subValue="Needs Approval" />
                    <SimpleMetric label="Cost Per View" value="$0.004" />
                    <SimpleMetric label="Total Paid" value="$0.00" />
                  </>
                ) : (
                  <>
                    <SimpleMetric label="In Negotiation" value={influencers.filter(i => i.status === 'Negotiating').length.toString()} active icon={Calendar} />
                    <SimpleMetric label="Contracts Sent" value={influencers.filter(i => i.contract.status === 'Sent').length.toString()} />
                    <SimpleMetric label="Products Shipped" value={influencers.filter(i => i.logistics.status === 'Shipped').length.toString()} />
                    <SimpleMetric label="Drafts Pending" value={influencers.filter(i => i.content.status === 'Waiting for Draft').length.toString()} />
                  </>
                )}
          </div>

          {/* Main Table Section */}
          <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-0">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-800">
                          {viewMode === 'Negotiation' ? 'Contract & Workflow' : 
                          viewMode === 'Performance' ? 'Content Performance' : 'Financials'}
                        </h3>
                        {viewMode === 'Negotiation' && (
                             <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">{influencers.length} Creators</span>
                        )}
                    </div>
                    <div className="flex gap-2">
                        {viewMode === 'Negotiation' && (
                           <>
                             <Button 
                                icon={Mail} 
                                className={`text-xs h-8 py-0 ${Object.keys(rowSelection).length === 0 ? 'bg-gray-100 text-gray-400 shadow-none' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                                disabled={Object.keys(rowSelection).length === 0}
                                onClick={() => setIsReachOutOpen(true)}
                             >
                                 Reach Out {Object.keys(rowSelection).length > 0 && `(${Object.keys(rowSelection).length})`}
                             </Button>
                             <Button 
                               variant="secondary" 
                               icon={UserPlus} 
                               className="text-xs h-8 py-0" 
                               onClick={() => setIsRecruitOpen(true)}
                             >
                               Add Creator
                             </Button>
                           </>
                        )}
                        {viewMode === 'Performance' && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-400">Synced with TokAPI</span>
                            <Button 
                                variant="secondary" 
                                className="h-7 text-xs px-2"
                                icon={RefreshCw}
                                onClick={handleScanTokAPI}
                            >
                               {isScanning ? 'Scanning...' : 'Scan for New Content'}
                            </Button>
                          </div>
                        )}
                    </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
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
                    {table.getRowModel().rows.length > 0 ? (
                      table.getRowModel().rows.map(row => (
                        <tr 
                           key={row.id} 
                           className={`hover:bg-gray-50 transition-colors ${row.getIsSelected() ? 'bg-indigo-50/30' : ''}`}
                        >
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-4 py-3 text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                       <tr>
                          <td colSpan={columns.length} className="p-8 text-center text-gray-400">No creators found. Click 'Add Creator' to start.</td>
                       </tr>
                    )}
                  </tbody>
                </table>
              </Card>
          </div>
        </div>
      )}

      {selectedInfluencer && (
        <DetailModal 
          influencer={selectedInfluencer} 
          onClose={() => setSelectedId(null)} 
          onUpdate={(updated) => {
            setInfluencers(prev => prev.map(i => i.id === updated.id ? updated : i));
          }}
          macros={macros}
          onUpdateMacro={onUpdateMacro}
        />
      )}

      <RecruitModal 
         isOpen={isRecruitOpen}
         onClose={() => setIsRecruitOpen(false)}
         existingIds={influencers.map(i => i.id)}
         onAdd={handleAddInfluencers}
      />

      <ReachOutModal 
         isOpen={isReachOutOpen}
         onClose={() => { setIsReachOutOpen(false); setRowSelection({}); }}
         recipients={table.getSelectedRowModel().rows.map(r => r.original)}
         onSend={handleBulkReachOut}
         macros={macros}
      />
    </div>
  );
};
