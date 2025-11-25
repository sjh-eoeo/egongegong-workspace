
import React, { useMemo, useState, useRef } from 'react';
import { 
  useReactTable, 
  getCoreRowModel, 
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState
} from '@tanstack/react-table';
import { MOCK_INFLUENCERS, MOCK_PROJECTS } from '../constants';
import { Influencer, InfluencerStatus, PaymentRecord } from '../types';
import { Card, Button } from '../components/UI';
import { DollarSign, Download, CheckCircle, ArrowUpDown, ArrowUp, ArrowDown, CreditCard, Copy, Upload, X, FileText, Video, Eye, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../components/Toast';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

// --- Payment Process Modal ---
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: Influencer | null;
  onConfirm: (id: string, record: PaymentRecord) => void;
}

const PaymentModal = ({ isOpen, onClose, influencer, onConfirm }: PaymentModalProps) => {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Two distinct file uploads
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  
  const proofInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);

  // Initialize amount when influencer opens
  React.useEffect(() => {
    if (influencer) {
      setAmount(influencer.contract.totalAmount);
      setProofFile(null);
      setScreenshotFile(null);
    }
  }, [influencer]);

  if (!isOpen || !influencer) return null;

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    onConfirm(influencer.id, {
      amountPaid: amount,
      date: date,
      proofFileName: proofFile ? proofFile.name : 'proof_missing.pdf',
      screenshotFileName: screenshotFile ? screenshotFile.name : 'screenshot_missing.png'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl ring-1 ring-gray-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-2xl">
           <div>
             <h2 className="text-lg font-bold text-gray-900">Process Payment</h2>
             <p className="text-xs text-gray-500">Confirm transfer for {influencer.name}</p>
           </div>
           <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        
        <div className="p-6 space-y-4">
           {/* Payment Details View */}
           <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 space-y-1">
              <div className="font-bold flex items-center gap-2">
                 <CreditCard size={12} />
                 {influencer.contract.paymentMethod}
              </div>
              {influencer.contract.paymentMethod === 'PayPal' ? (
                <div>{influencer.contract.paypalEmail}</div>
              ) : (
                <div>{influencer.contract.bankName} - {influencer.contract.accountNumber}</div>
              )}
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Amount Paid ({influencer.contract.currency})</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm font-bold text-gray-900"
              />
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Payment Date</label>
              <input 
                type="date" 
                value={date} 
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
              />
           </div>

           <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Upload Slip</label>
                  <input type="file" ref={proofInputRef} onChange={handleProofChange} className="hidden" />
                  <div 
                    onClick={() => proofInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                     {proofFile ? (
                        <div className="flex flex-col items-center text-center">
                           <FileText size={16} className="text-indigo-600 mb-1" />
                           <span className="text-[10px] text-indigo-600 font-medium truncate max-w-[80px]">{proofFile.name}</span>
                        </div>
                     ) : (
                        <>
                           <Upload size={16} className="text-gray-400 mb-1" />
                           <span className="text-[10px] text-gray-400">Payment Proof</span>
                        </>
                     )}
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Video Screenshot</label>
                  <input type="file" ref={screenshotInputRef} onChange={handleScreenshotChange} className="hidden" />
                  <div 
                    onClick={() => screenshotInputRef.current?.click()}
                    className="w-full h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                     {screenshotFile ? (
                        <div className="flex flex-col items-center text-center">
                           <ImageIcon size={16} className="text-emerald-600 mb-1" />
                           <span className="text-[10px] text-emerald-600 font-medium truncate max-w-[80px]">{screenshotFile.name}</span>
                        </div>
                     ) : (
                        <>
                           <Upload size={16} className="text-gray-400 mb-1" />
                           <span className="text-[10px] text-gray-400">Content Cap</span>
                        </>
                     )}
                  </div>
               </div>
           </div>
        </div>

        <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
           <Button variant="secondary" onClick={onClose}>Cancel</Button>
           <Button className="bg-emerald-600 hover:bg-emerald-700" icon={CheckCircle} onClick={handleSubmit}>
             Confirm Payment
           </Button>
        </div>
      </div>
    </div>
  );
};

// --- Helper Components ---
const PaymentInfoCell = ({ contract }: { contract: any }) => {
  const { addToast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('info', 'Copied to clipboard', text);
  };

  if (contract.paymentMethod === 'PayPal') {
    return (
        <div className="flex flex-col">
           <div className="text-xs font-bold text-blue-700 flex items-center gap-1 mb-0.5"><CreditCard size={10} /> PayPal</div>
           <div className="text-xs text-gray-600 flex items-center gap-1 group cursor-pointer hover:text-blue-600" onClick={() => copyToClipboard(contract.paypalEmail || '')}>
              <span className="truncate max-w-[120px]">{contract.paypalEmail || 'No email'}</span>
              <Copy size={10} className="opacity-0 group-hover:opacity-100" />
           </div>
        </div>
    );
  } else if (contract.paymentMethod === 'Bank Transfer' || contract.paymentMethod === 'Wise') {
    return (
        <div className="flex flex-col">
           <div className="text-xs font-bold text-gray-800 flex items-center gap-1 mb-0.5"><CreditCard size={10} /> {contract.bankName || 'Bank'}</div>
           <div className="text-xs text-gray-600 flex items-center gap-1 group cursor-pointer hover:text-blue-600" onClick={() => copyToClipboard(contract.accountNumber || '')}>
              <span className="truncate max-w-[120px]">{contract.accountNumber ? `**** ${contract.accountNumber.slice(-4)}` : 'No info'}</span>
              <Copy size={10} className="opacity-0 group-hover:opacity-100" />
           </div>
        </div>
    );
  }
  return <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">No Method Selected</span>;
};

// --- Main Page ---
export const FinanceHQ = () => {
  const { addToast } = useToast();
  const [data, setData] = useState<Influencer[]>(MOCK_INFLUENCERS.filter(i => i.contract.totalAmount > 0));
  const [sorting, setSorting] = useState<SortingState>([]);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);

  // Document Viewer State
  const [viewingDoc, setViewingDoc] = useState<{name: string, type: 'pdf' | 'image' | 'contract'} | null>(null);

  // Derive Lists
  const pendingPayments = useMemo(() => data.filter(i => i.paymentStatus !== 'Paid'), [data]);
  const paymentHistory = useMemo(() => data.filter(i => i.paymentStatus === 'Paid'), [data]);

  const totalLiability = useMemo(() => data.reduce((sum, item) => sum + (item.contract.totalAmount || 0), 0), [data]);
  const totalPaid = useMemo(() => paymentHistory.reduce((sum, item) => sum + (item.contract.totalAmount || 0), 0), [data]);
  const pendingAmount = totalLiability - totalPaid;

  const handleOpenPayment = (influencer: Influencer) => {
    setSelectedInfluencer(influencer);
    setModalOpen(true);
  };

  const handleConfirmPayment = (id: string, record: PaymentRecord) => {
    setData(prev => prev.map(i => i.id === id ? { 
      ...i, 
      paymentStatus: 'Paid', 
      status: InfluencerStatus.Paid,
      paymentRecord: record
    } : i));
    addToast('success', 'Payment Recorded', 'The transaction has been settled successfully.');
  };

  // Trigger browser download simulation
  const handleDownload = (filename: string | undefined) => {
      if(!filename) return;
      
      addToast('info', 'Downloading File', `Starting download for ${filename}...`);
      
      // Simulate real file download using Blob
      setTimeout(() => {
          const element = document.createElement("a");
          const file = new Blob([`Mock content for ${filename}.\nDownloaded from TikTok Seeding OS.`], {type: 'text/plain'});
          element.href = URL.createObjectURL(file);
          element.download = filename;
          document.body.appendChild(element); 
          element.click();
          document.body.removeChild(element);
      }, 500);
  };

  const handleDownloadAll = (influencer: Influencer) => {
      addToast('success', 'Downloading All Assets', `Zipping files for ${influencer.name}...`);
      setTimeout(() => {
          const element = document.createElement("a");
          const file = new Blob([`Mock ZIP content for ${influencer.name}`], {type: 'application/zip'});
          element.href = URL.createObjectURL(file);
          element.download = `${influencer.name}_assets.zip`;
          document.body.appendChild(element); 
          element.click();
          document.body.removeChild(element);
      }, 800);
  };

  const handleView = (name: string, type: 'pdf' | 'image' | 'contract') => {
      setViewingDoc({ name, type });
  };

  // --- Columns for Pending Table ---
  const pendingColumnHelper = createColumnHelper<Influencer>();
  const pendingColumns = useMemo(() => [
    pendingColumnHelper.accessor('name', {
      header: 'Payee',
      cell: info => (
        <div>
          <div className="font-bold text-gray-900">{info.getValue()}</div>
          <div className="text-xs text-gray-500">{info.row.original.handle}</div>
        </div>
      )
    }),
    pendingColumnHelper.accessor('projectId', {
      header: 'Campaign',
      cell: info => {
        const project = MOCK_PROJECTS.find(p => p.id === info.getValue());
        return <span className="text-xs text-gray-500">{project?.title || 'Unknown'}</span>
      }
    }),
    pendingColumnHelper.display({
      id: 'videoProgress',
      header: 'Video Progress',
      cell: info => {
        const posted = info.row.original.content.postedVideos.length;
        const target = info.row.original.contract.videoCount;
        const isComplete = posted >= target;
        return (
          <div className="flex items-center gap-2">
             <div className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${isComplete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                <Video size={10} />
                {posted} / {target}
             </div>
          </div>
        )
      }
    }),
    pendingColumnHelper.display({
      id: 'paymentDetails',
      header: 'Payment Info',
      cell: info => <PaymentInfoCell contract={info.row.original.contract} />
    }),
    pendingColumnHelper.accessor('contract.totalAmount', {
      header: 'Amount Due',
      cell: info => <span className="font-bold text-gray-900">${info.getValue().toLocaleString()}</span>
    }),
    pendingColumnHelper.display({
      id: 'actions',
      header: 'Action',
      cell: info => (
        <div className="flex justify-end">
             <Button 
                onClick={() => handleOpenPayment(info.row.original)}
                className="bg-gray-900 hover:bg-gray-800 text-white text-xs py-1.5 px-3 h-auto shadow-sm"
                icon={CreditCard}
             >
               Process
             </Button>
        </div>
      )
    })
  ], []);

  // --- Columns for History Table (Expanded as requested) ---
  const historyColumnHelper = createColumnHelper<Influencer>();
  const historyColumns = useMemo(() => [
    historyColumnHelper.accessor('paymentRecord.date', {
      header: 'Date Paid',
      cell: info => <span className="text-xs text-gray-600 font-mono">{info.getValue() || '-'}</span>
    }),
    historyColumnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <span className="font-bold text-gray-900 text-sm">{info.getValue()}</span>
      )
    }),
    historyColumnHelper.display({
        id: 'paymentInfo',
        header: 'Payment Info',
        cell: info => {
            const c = info.row.original.contract;
            return <div className="text-xs text-gray-500">{c.paymentMethod === 'PayPal' ? 'PayPal' : c.bankName}</div>
        }
    }),
    historyColumnHelper.accessor('paymentRecord.amountPaid', {
      header: 'Amount',
      cell: info => <span className="font-bold text-emerald-600 text-sm">${info.getValue()?.toLocaleString()}</span>
    }),
    historyColumnHelper.display({
        id: 'duration',
        header: 'Contract Duration',
        cell: info => {
            const start = info.row.original.contract.startDate || 'N/A';
            const end = info.row.original.contract.endDate || 'N/A';
            return <span className="text-[10px] text-gray-500 font-mono">{start} - {end}</span>
        }
    }),
    historyColumnHelper.display({
      id: 'documents',
      header: 'Documents & Assets',
      cell: info => {
         const rec = info.row.original.paymentRecord;
         const contractFile = info.row.original.contract.contractFileName;
         
         const ButtonGroup = ({ label, filename, type, onDownload, onView }: any) => (
             <div className="flex flex-col items-center group">
                 <div className="flex bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                     <button 
                       disabled={!filename}
                       className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed border-r border-gray-200"
                       title={`View ${label}`}
                       onClick={() => onView(filename, type)}
                     >
                        <Eye size={12} className="text-gray-600" />
                     </button>
                     <button 
                       disabled={!filename}
                       className="p-1.5 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                       title={`Download ${label}`}
                       onClick={() => onDownload(filename)}
                     >
                        <Download size={12} className="text-gray-600" />
                     </button>
                 </div>
                 <span className="text-[9px] text-gray-400 mt-0.5">{label}</span>
             </div>
         );

         return (
             <div className="flex items-center gap-2">
                 {/* Proof of Payment */}
                 <ButtonGroup 
                    label="Slip" 
                    filename={rec?.proofFileName}
                    type="pdf"
                    onDownload={handleDownload}
                    onView={handleView}
                 />

                 {/* Contract */}
                 <ButtonGroup 
                    label="Contract" 
                    filename={contractFile}
                    type="contract"
                    onDownload={handleDownload}
                    onView={handleView}
                 />

                 {/* Video Screenshot */}
                 <ButtonGroup 
                    label="Video" 
                    filename={rec?.screenshotFileName}
                    type="image"
                    onDownload={handleDownload}
                    onView={handleView}
                 />

                 {/* Divider */}
                 <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

                 {/* Download All */}
                 <button 
                    onClick={() => handleDownloadAll(info.row.original)}
                    className="flex flex-col items-center group"
                    title="Download All Assets (Zip)"
                 >
                     <div className="p-1.5 bg-indigo-50 rounded-lg border border-indigo-100 group-hover:bg-indigo-100 group-hover:border-indigo-200 transition-colors">
                        <Download size={14} className="text-indigo-600" />
                     </div>
                     <span className="text-[9px] text-indigo-600 mt-0.5 font-medium">All</span>
                 </button>
             </div>
         )
      }
    }),
  ], []);

  const pendingTable = useReactTable({
    data: pendingPayments,
    columns: pendingColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const historyTable = useReactTable({
    data: paymentHistory,
    columns: historyColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 w-full space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 mb-2">Finance HQ</h2>
           <p className="text-gray-500">Manage payment queue, process transfers, and upload proof.</p>
        </div>
        <div className="bg-gray-900 text-white rounded-xl p-4 flex gap-8 shadow-lg">
             <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Total Liability</p>
                <p className="text-2xl font-bold text-white">${pendingAmount.toLocaleString()}</p>
             </div>
             <div className="w-[1px] bg-gray-700 h-full"></div>
             <div className="text-right">
                <p className="text-xs text-gray-400 font-medium uppercase mb-1">Total Settled</p>
                <p className="text-2xl font-bold text-emerald-400">${totalPaid.toLocaleString()}</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
         {/* 1. Payment Queue */}
         <div className="space-y-4">
            <div className="flex items-center gap-2">
               <div className="w-2 h-6 bg-amber-500 rounded-full"></div>
               <h3 className="text-lg font-bold text-gray-800">Payment Queue ({pendingPayments.length})</h3>
            </div>
            <Card className="p-0 overflow-hidden border-amber-200 shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-amber-50/50 border-b border-amber-100">
                    {pendingTable.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                            </div>
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingTable.getRowModel().rows.length > 0 ? (
                      pendingTable.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-amber-50/20 transition-colors">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-6 py-4 text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-400">All caught up! No pending payments.</td></tr>
                    )}
                  </tbody>
                </table>
            </Card>
         </div>

         {/* 2. Payment History */}
         <div className="space-y-4">
             <div className="flex items-center gap-2">
               <div className="w-2 h-6 bg-gray-200 rounded-full"></div>
               <h3 className="text-lg font-bold text-gray-800">Settled History & Audit Log</h3>
            </div>
            <Card className="p-0 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    {historyTable.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                              {flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {historyTable.getRowModel().rows.length > 0 ? (
                        historyTable.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                          {row.getVisibleCells().map(cell => (
                            <td key={cell.id} className="px-6 py-3 text-sm">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                     ) : (
                       <tr><td colSpan={6} className="p-6 text-center text-gray-400 text-xs">No history yet.</td></tr>
                     )}
                  </tbody>
                </table>
            </Card>
         </div>
      </div>

      <PaymentModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        influencer={selectedInfluencer}
        onConfirm={handleConfirmPayment}
      />
      
      <DocumentViewerModal 
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        document={viewingDoc}
      />
    </div>
  );
};
