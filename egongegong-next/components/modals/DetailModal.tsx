'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Send, Plus, Trash, ExternalLink, Settings as SettingsIcon, 
  Save, FileText, Upload, RefreshCw, AlertTriangle, Link as LinkIcon
} from 'lucide-react';
import { Influencer, ChatMessage, ZendeskMacro, PaymentMilestone, PostedVideo, InfluencerStatus } from '@/types';
import { Button } from '@/components/ui';
import { useToast } from '@/components/Toast';

// --- Macro Editor Modal ---
interface MacroEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  macros: ZendeskMacro[];
  onUpdateMacro: (macro: ZendeskMacro) => void;
}

const MacroEditorModal = ({ isOpen, onClose, macros, onUpdateMacro }: MacroEditorModalProps) => {
  const { addToast } = useToast();
  const [selectedMacroId, setSelectedMacroId] = useState(macros[0]?.id);
  const [editForm, setEditForm] = useState<ZendeskMacro | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (selectedMacroId) {
      const macro = macros.find(m => m.id === selectedMacroId);
      if (macro) {
        setEditForm({ ...macro });
        setHasChanges(false);
      }
    }
  }, [selectedMacroId, macros]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (editForm) {
      onUpdateMacro(editForm);
      setHasChanges(false);
      addToast('success', 'Macro Updated', 'Email template saved successfully.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl h-[600px] flex overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800">
        {/* Left Sidebar: List */}
        <div className="w-64 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
           <div className="p-4 border-b border-gray-200 dark:border-gray-700">
             <h3 className="font-bold text-gray-800 dark:text-white">Macros</h3>
             <p className="text-xs text-gray-500 dark:text-gray-400">Edit your email templates</p>
           </div>
           <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {macros.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMacroId(m.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedMacroId === m.id 
                      ? 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-500' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {m.title}
                </button>
              ))}
           </div>
           <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" className="w-full text-xs" onClick={onClose}>Close Settings</Button>
           </div>
        </div>

        {/* Right Content: Editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
           {editForm ? (
             <>
               <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Edit Template</h2>
                  </div>
                  <Button 
                    onClick={handleSave} 
                    disabled={!hasChanges}
                    icon={Save}
                    className={`transition-all ${hasChanges ? 'bg-gray-700' : 'bg-gray-200 text-gray-400 shadow-none'}`}
                  >
                    Save Changes
                  </Button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Macro Title (Internal)</label>
                     <input 
                        value={editForm.title} 
                        onChange={e => { setEditForm({...editForm, title: e.target.value}); setHasChanges(true); }}
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-1000/20 outline-none transition-all text-gray-900 dark:text-white"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Subject Line</label>
                     <input 
                        value={editForm.subject} 
                        onChange={e => { setEditForm({...editForm, subject: e.target.value}); setHasChanges(true); }}
                        className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-1000/20 outline-none transition-all text-gray-900 dark:text-white"
                     />
                  </div>
                  <div className="flex-1 flex flex-col min-h-[250px]">
                     <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email Body</label>
                     <textarea 
                        value={editForm.body} 
                        onChange={e => { setEditForm({...editForm, body: e.target.value}); setHasChanges(true); }}
                        className="flex-1 w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-mono leading-relaxed bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-gray-1000/20 outline-none resize-none transition-all text-gray-900 dark:text-white"
                     />
                     <p className="text-[10px] text-gray-400 mt-2">Use [Name] as a placeholder for the creator&apos;s name.</p>
                  </div>
               </div>
             </>
           ) : (
             <div className="flex-1 flex items-center justify-center text-gray-400">Select a macro to edit</div>
           )}
        </div>
      </div>
    </div>
  );
};

// --- AI Drawer (Stub - needs Gemini service) ---
export const AIDrawer = ({ isOpen, onClose, influencer }: { isOpen: boolean, onClose: () => void, influencer: Influencer | null }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!influencer) return;
    setLoading(true);
    try {
      // TODO: Implement Gemini service integration
      setAnalysis("AI Strategy Analysis is not yet configured. Please set up the Gemini API service.");
    } catch {
      setAnalysis("System Error: Unable to connect to Strategy AI.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && influencer && !analysis) {
      handleAnalyze();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, influencer]);

  if (!isOpen || !influencer) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out border-l border-gray-100 dark:border-gray-800 flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Negotiation Strategy</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Assistant</p>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-900 dark:hover:text-white">Close</button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="text-sm text-center text-gray-500 mt-10">Generating strategy...</div>
        ) : (
          <div className="prose prose-sm prose-gray dark:prose-invert max-w-none">
             <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{analysis}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main Detail Modal ---
interface DetailModalProps {
  influencer: Influencer;
  onClose: () => void;
  onUpdate: (i: Influencer) => void;
  macros: ZendeskMacro[];
  onUpdateMacro: (macro: ZendeskMacro) => void;
}

export const DetailModal = ({ influencer: rawInfluencer, onClose, onUpdate, macros, onUpdateMacro }: DetailModalProps) => {
  const { addToast } = useToast();
  
  // Ensure influencer has all required nested objects with defaults
  const defaultInfluencer: Influencer = {
    ...rawInfluencer,
    contract: rawInfluencer.contract || {
      status: 'Draft',
      videoCount: 1,
      fee: 0,
      totalAmount: 0,
      currency: 'USD',
      paymentMethod: 'Unselected',
      paymentSchedule: 'Upon Completion',
      paypalEmail: '',
      milestones: [],
      contractFileName: ''
    },
    logistics: rawInfluencer.logistics || {
      status: 'Pending',
      trackingNumber: '',
      shippingAddress: ''
    },
    content: rawInfluencer.content || {
      postedVideos: [],
      status: 'Waiting for Draft',
      isApproved: false,
      lastDetectedAt: ''
    },
    history: rawInfluencer.history || [],
    metrics: rawInfluencer.metrics || {
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      engagementRate: 0
    }
  };

  // LOCAL state for editing - only saves on button click
  const [localData, setLocalData] = useState<Influencer>(defaultInfluencer);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [msgInput, setMsgInput] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [activeTab, setActiveTab] = useState<'email' | 'internal'>('email');
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isMacroSettingsOpen, setIsMacroSettingsOpen] = useState(false);
  
  // Pacing Generator State
  const [pacingVideos, setPacingVideos] = useState(12);
  const [pacingAmount, setPacingAmount] = useState(100);

  // Manual Video Entry State
  const [manualVideoLink, setManualVideoLink] = useState('');
  const [manualVideoError, setManualVideoError] = useState('');

  const contractInputRef = React.useRef<HTMLInputElement>(null);

  // Accordion state
  const [sections, setSections] = useState({
    contract: true,
    logistics: true,
    content: true
  });

  const toggleSection = (key: keyof typeof sections) => {
    setSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Helper to update local data
  const updateLocal = (updates: Partial<Influencer>) => {
    setLocalData(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Save to DB
  const handleSave = () => {
    onUpdate(localData);
    setHasChanges(false);
    addToast('success', 'Saved', 'Changes saved successfully.');
  };

  // Close with confirmation if unsaved changes
  const handleClose = () => {
    if (hasChanges) {
      if (confirm('You have unsaved changes. Discard them?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSend = () => {
    if (!msgInput) return;
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: isInternal ? 'me@brand.com' : 'operator.team',
      content: msgInput,
      timestamp: new Date().toISOString(),
      isInternal: isInternal,
      type: 'text'
    };
    updateLocal({ history: [...localData.history, newMessage] });
    setMsgInput('');
    addToast('success', isInternal ? 'Note Added' : 'Email Queued', isInternal ? 'Internal note saved locally.' : 'Message queued. Click Save to send.');
  };

  const updateContract = (field: string, value: unknown) => {
    const updates: Partial<Influencer> = {
      contract: { ...localData.contract, [field]: value }
    };
    
    // When contract status changes to "Signed", update influencer status to Contracted
    if (field === 'status' && value === 'Signed') {
      updates.status = InfluencerStatus.Contracted;
    }
    
    updateLocal(updates);
  };

  const addMilestone = () => {
      const newMilestone: PaymentMilestone = {
          id: Date.now().toString(),
          label: 'New Milestone',
          amount: 0,
          dueDate: new Date().toISOString().split('T')[0],
          status: 'Pending',
          videoRequirement: 0
      };
      updateContract('milestones', [...(localData.contract.milestones || []), newMilestone]);
  };

  const removeMilestone = (id: string) => {
      updateContract('milestones', localData.contract.milestones.filter(m => m.id !== id));
  };
  
  const generateBatchMilestones = () => {
     if (pacingVideos <= 0 || pacingAmount <= 0) return;
     
     const totalVideos = localData.contract.videoCount || 100;
     const batches = Math.ceil(totalVideos / pacingVideos);
     const newMilestones: PaymentMilestone[] = [];

     for (let i = 1; i <= batches; i++) {
        const target = Math.min(i * pacingVideos, totalVideos);
        newMilestones.push({
            id: `gen-ms-${Date.now()}-${i}`,
            label: `Batch ${i} (Cumulative: ${target} videos)`,
            amount: pacingAmount,
            status: 'Pending',
            videoRequirement: target
        });
     }

     updateContract('milestones', newMilestones);
     updateContract('pacingConfig', {
         videosPerBatch: pacingVideos,
         amountPerBatch: pacingAmount,
         frequencyLabel: 'Custom Batch'
     });
     
     addToast('info', 'Milestones Generated', `Created ${batches} payment batches. Click Save to apply.`);
  };

  const updateLogistics = (field: string, value: unknown) => {
    const updates: Partial<Influencer> = {
      logistics: { ...localData.logistics, [field]: value }
    };
    
    // When logistics status changes to "Shipped", update influencer status to Shipped
    if (field === 'status' && value === 'Shipped') {
      updates.status = InfluencerStatus.Shipped;
    }
    
    updateLocal(updates);
  };

  const handleContractUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateContract('contractFileName', file.name);
      addToast('success', 'Contract Attached', `${file.name} uploaded successfully.`);
    }
  };

  // Google Search for tracking
  const handleTrackPackage = () => {
    const { carrier, trackingNumber } = localData.logistics;
    if (carrier && trackingNumber) {
        const query = `${carrier} tracking ${trackingNumber}`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    }
  };

  // Manual Video Entry Handler
  const handleAddManualVideo = () => {
     if (!manualVideoLink) return;

     let extractedId = '';
     if (manualVideoLink.includes('/video/')) {
         const parts = manualVideoLink.split('/video/');
         extractedId = parts[1]?.split('?')[0];
     } else if (manualVideoLink.includes('v=')) {
         extractedId = manualVideoLink.split('v=')[1]?.split('&')[0];
     } else {
         extractedId = `manual-${Date.now()}`;
     }
     
     if (!extractedId) {
         setManualVideoError('Could not extract Video ID from link.');
         return;
     }

     const isDuplicate = localData.content.postedVideos.some(v => v.id === extractedId || v.link === manualVideoLink);
     if (isDuplicate) {
         setManualVideoError('This video has already been logged (Duplicate ID/Link).');
         return;
     }

     const newVideo: PostedVideo = {
         id: extractedId,
         link: manualVideoLink,
         date: new Date().toISOString(),
         isManual: true
     };

     // Update content and change status to ContentLive when first video is added
     updateLocal({
         content: {
             ...localData.content,
             postedVideos: [...localData.content.postedVideos, newVideo],
             status: localData.content.status === 'Waiting for Draft' ? 'Live' : localData.content.status
         },
         // Auto-transition to ContentLive when first video is posted
         status: localData.content.postedVideos.length === 0 ? InfluencerStatus.ContentLive : localData.status
     });

     setManualVideoLink('');
     setManualVideoError('');
     addToast('info', 'Video Added', 'Click Save to apply changes.');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-40 flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden shadow-2xl ring-1 ring-gray-200 dark:ring-gray-800" onClick={e => e.stopPropagation()}>
        
        {/* Sidebar Info & Workflow */}
        <div className="w-96 bg-gray-50 dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col overflow-y-auto">
           {/* Profile Header */}
           <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
               <div className="flex justify-between items-start mb-4">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{localData.name}</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{localData.handle}</p>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs font-medium border border-gray-200 dark:border-gray-700">{localData.followerCount.toLocaleString()} Followers</span>
                    </div>
                 </div>
                 <div className="flex gap-2">
                   {hasChanges && (
                     <Button 
                       onClick={handleSave}
                       className="text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white"
                       icon={Save}
                     >
                       Save
                     </Button>
                   )}
                   <button onClick={handleClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                     <X size={18} className="text-gray-400" />
                   </button>
                 </div>
               </div>
               <Button className="w-full text-xs py-2 bg-gray-900 dark:bg-gray-700 text-white" onClick={() => setIsAIOpen(true)}>AI Strategy Analysis</Button>
           </div>

           <div className="p-4 space-y-4">
             {/* 1. Negotiation & Contract */}
             <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <button onClick={() => toggleSection('contract')} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-bold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Negotiation & Contract
                    </div>
                    <div className="text-xs text-gray-400">{sections.contract ? 'Hide' : 'Show'}</div>
                </button>
                {sections.contract && (
                    <div className="p-4 space-y-3">
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Contract Status</label>
                            <select 
                                value={localData.contract.status}
                                onChange={(e) => updateContract('status', e.target.value)}
                                className={`w-full text-xs p-2 rounded-lg border ${
                                  localData.contract.status === 'Signed' 
                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' 
                                    : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                                }`}
                            >
                                <option value="Draft">Drafting</option>
                                <option value="Sent">Sent to Creator</option>
                                <option value="Signed">Signed</option>
                            </select>
                        </div>

                         {/* Upload Signed Contract Button */}
                         <div className="pt-1 pb-1">
                            <input type="file" ref={contractInputRef} className="hidden" onChange={handleContractUpload} />
                            <button 
                                onClick={() => contractInputRef.current?.click()}
                                className="w-full border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-2 flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                {localData.contract.contractFileName ? (
                                    <>
                                        <FileText size={14} className="text-gray-700 dark:text-gray-500" />
                                        <span className="text-xs text-gray-700 dark:text-gray-500 font-medium truncate max-w-[150px]">{localData.contract.contractFileName}</span>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={14} className="text-gray-400" />
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Upload Signed Contract</span>
                                    </>
                                )}
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Start Date</label>
                                <input 
                                    type="date"
                                    value={localData.contract.startDate || ''}
                                    onChange={(e) => updateContract('startDate', e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">End Date</label>
                                <input 
                                    type="date"
                                    value={localData.contract.endDate || ''}
                                    onChange={(e) => updateContract('endDate', e.target.value)}
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Platform</label>
                            <select 
                                value={localData.contract.platform}
                                onChange={(e) => updateContract('platform', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                            >
                                <option value="TikTok">TikTok</option>
                                <option value="Instagram">Instagram</option>
                                <option value="YouTube">YouTube</option>
                                <option value="X (Twitter)">X (Twitter)</option>
                            </select>
                        </div>

                        {localData.contract.platform === 'TikTok' && (
                             <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">TikTok Shop Fee (%)</label>
                                <input 
                                    type="number" 
                                    value={localData.contract.tiktokShopFee} 
                                    onChange={(e) => updateContract('tiktokShopFee', Number(e.target.value))}
                                    placeholder="e.g. 5.0"
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800" 
                                />
                             </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                             <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Total Fee ({localData.contract.currency})</label>
                                <input 
                                    type="number" 
                                    value={localData.contract.totalAmount} 
                                    onChange={(e) => updateContract('totalAmount', Number(e.target.value))}
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800" 
                                />
                             </div>
                             <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Total Video Count</label>
                                <input 
                                    type="number" 
                                    value={localData.contract.videoCount} 
                                    onChange={(e) => updateContract('videoCount', Number(e.target.value))}
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800" 
                                />
                             </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Payment Method</label>
                            <select 
                                value={localData.contract.paymentMethod}
                                onChange={(e) => updateContract('paymentMethod', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="Unselected">Select Method...</option>
                                <option value="Wise">Wise (Transfer)</option>
                                <option value="PayPal">PayPal</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                        </div>

                        {/* Conditional Payment Inputs */}
                        {(localData.contract.paymentMethod === 'PayPal' || localData.contract.paymentMethod === 'Wise') && (
                             <div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">{localData.contract.paymentMethod} Email/ID</label>
                                <input 
                                    type="text" 
                                    value={localData.contract.paypalEmail || ''} 
                                    onChange={(e) => updateContract('paypalEmail', e.target.value)}
                                    placeholder="name@example.com"
                                    className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800" 
                                />
                             </div>
                        )}

                        {(localData.contract.paymentMethod === 'Bank Transfer' || localData.contract.paymentMethod === 'Wise') && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 space-y-2">
                                <p className="text-xs font-bold text-gray-700 dark:text-gray-300">Bank Details</p>
                                <div>
                                    <input 
                                        type="text" 
                                        value={localData.contract.bankName || ''} 
                                        onChange={(e) => updateContract('bankName', e.target.value)}
                                        placeholder="Bank Name"
                                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-900 mb-2" 
                                    />
                                    <input 
                                        type="text" 
                                        value={localData.contract.accountNumber || ''} 
                                        onChange={(e) => updateContract('accountNumber', e.target.value)}
                                        placeholder="Account Number / IBAN"
                                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-900 mb-2" 
                                    />
                                    <input 
                                        type="text" 
                                        value={localData.contract.swiftCode || ''} 
                                        onChange={(e) => updateContract('swiftCode', e.target.value)}
                                        placeholder="SWIFT / BIC Code"
                                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-900" 
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Payment Schedule</label>
                            <select 
                                value={localData.contract.paymentSchedule}
                                onChange={(e) => updateContract('paymentSchedule', e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            >
                                <option value="Upon Completion">Upon Completion</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Net30">Net 30</option>
                                <option value="Custom (Milestones)">Custom (Milestones)</option>
                                <option value="Performance Batches">Performance Batches (Recurring)</option>
                            </select>
                        </div>
                        
                        {/* Logic for Performance Batches */}
                        {localData.contract.paymentSchedule === 'Performance Batches' && (
                             <div className="mt-2 bg-gray-100 dark:bg-gray-950/20 rounded-lg p-3 border border-gray-200 dark:border-gray-950/30">
                                 <p className="text-xs font-bold text-gray-800 dark:text-gray-400 mb-2">Auto-Generate Payment Batches</p>
                                 <div className="grid grid-cols-2 gap-2 mb-2">
                                     <div>
                                         <label className="text-[10px] text-gray-700 dark:text-gray-500 block">Videos per Batch</label>
                                         <input 
                                            type="number"
                                            value={pacingVideos}
                                            onChange={e => setPacingVideos(Number(e.target.value))}
                                            className="w-full p-1 text-xs rounded border border-gray-300 dark:border-gray-950/30 bg-white dark:bg-gray-900"
                                         />
                                     </div>
                                     <div>
                                         <label className="text-[10px] text-gray-700 dark:text-gray-500 block">Amount per Batch</label>
                                         <input 
                                            type="number"
                                            value={pacingAmount}
                                            onChange={e => setPacingAmount(Number(e.target.value))}
                                            className="w-full p-1 text-xs rounded border border-gray-300 dark:border-gray-950/30 bg-white dark:bg-gray-900"
                                         />
                                     </div>
                                 </div>
                                 <button 
                                    onClick={generateBatchMilestones}
                                    className="w-full flex items-center justify-center gap-1 bg-gray-700 text-white text-xs py-1.5 rounded hover:bg-gray-800"
                                 >
                                     <RefreshCw size={10} /> Generate Milestones
                                 </button>
                             </div>
                        )}

                        {/* Milestones Editor for Custom/Performance Schedule */}
                        {(localData.contract.paymentSchedule === 'Custom (Milestones)' || localData.contract.paymentSchedule === 'Performance Batches') && (
                            <div className="mt-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Milestones</span>
                                    <button onClick={addMilestone} className="text-xs text-gray-700 dark:text-gray-500 font-medium hover:underline flex items-center gap-1">
                                        <Plus size={10} /> Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {localData.contract.milestones?.map((ms) => (
                                        <div key={ms.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-2 rounded-md shadow-sm text-xs">
                                            <div className="flex justify-between mb-1">
                                                <input 
                                                    value={ms.label} 
                                                    onChange={(e) => {
                                                        const updated = localData.contract.milestones.map(m => m.id === ms.id ? { ...m, label: e.target.value } : m);
                                                        updateContract('milestones', updated);
                                                    }}
                                                    className="w-3/4 p-1 border-b border-gray-100 dark:border-gray-700 bg-transparent focus:outline-none text-gray-900 dark:text-white font-medium" 
                                                    placeholder="Label"
                                                />
                                                <button onClick={() => removeMilestone(ms.id)} className="text-red-400 hover:text-red-600"><Trash size={12} /></button>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                 <span className="text-gray-400">$</span>
                                                 <input 
                                                    type="number"
                                                    value={ms.amount} 
                                                    onChange={(e) => {
                                                        const updated = localData.contract.milestones.map(m => m.id === ms.id ? { ...m, amount: Number(e.target.value) } : m);
                                                        updateContract('milestones', updated);
                                                    }}
                                                    className="w-16 p-1 bg-gray-50 dark:bg-gray-800 rounded text-gray-900 dark:text-white" 
                                                    placeholder="Amount"
                                                 />
                                                 <span className="text-gray-400 text-[10px]">Req:</span>
                                                 <input 
                                                    type="number"
                                                    value={ms.videoRequirement || 0}
                                                    onChange={(e) => {
                                                        const updated = localData.contract.milestones.map(m => m.id === ms.id ? { ...m, videoRequirement: Number(e.target.value) } : m);
                                                        updateContract('milestones', updated);
                                                    }}
                                                    className="w-12 p-1 bg-gray-50 dark:bg-gray-800 rounded text-gray-900 dark:text-white" 
                                                    placeholder="Videos"
                                                    title="Cumulative videos required"
                                                 />
                                            </div>
                                        </div>
                                    ))}
                                    {(!localData.contract.milestones || localData.contract.milestones.length === 0) && (
                                        <div className="text-center py-2 text-xs text-gray-400">No milestones set</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>

             {/* 2. Logistics */}
             <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <button onClick={() => toggleSection('logistics')} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-bold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Shipping & Logistics
                    </div>
                    <div className="text-xs text-gray-400">{sections.logistics ? 'Hide' : 'Show'}</div>
                </button>
                {sections.logistics && (
                    <div className="p-4 space-y-3">
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                checked={localData.logistics.status !== 'Pending'} 
                                onChange={(e) => updateLogistics('status', e.target.checked ? 'Shipped' : 'Pending')}
                                className="rounded text-gray-700 focus:ring-gray-1000"
                            />
                            <span className="text-xs text-gray-700 dark:text-gray-300">Product Shipped</span>
                        </div>
                        {localData.logistics.status !== 'Pending' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Carrier</label>
                                    <input 
                                        type="text" 
                                        placeholder="FedEx, DHL..." 
                                        value={localData.logistics.carrier || ''}
                                        onChange={(e) => updateLogistics('carrier', e.target.value)}
                                        className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Tracking Number</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            placeholder="#123456789" 
                                            value={localData.logistics.trackingNumber || ''}
                                            onChange={(e) => updateLogistics('trackingNumber', e.target.value)}
                                            className="flex-1 text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                                        />
                                        <button 
                                            onClick={handleTrackPackage}
                                            disabled={!localData.logistics.trackingNumber}
                                            className="px-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-600 dark:text-gray-300 disabled:opacity-50"
                                            title="Search Tracking on Google"
                                        >
                                            <ExternalLink size={14} />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}
             </div>

             {/* 3. Content & Finance */}
             <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                <button onClick={() => toggleSection('content')} className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                    <div className="font-bold text-xs text-gray-800 dark:text-gray-200 uppercase tracking-wide">
                        Content & Finance
                    </div>
                    <div className="text-xs text-gray-400">{sections.content ? 'Hide' : 'Show'}</div>
                </button>
                {sections.content && (
                    <div className="p-4 space-y-3">
                         <div>
                            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Draft Link</label>
                            <input 
                              type="text" 
                              className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-blue-600 underline bg-white dark:bg-gray-800" 
                              placeholder="https://drive.google.com..." 
                              value={localData.content.draftLink || ''}
                              onChange={(e) => onUpdate({
                                ...localData,
                                content: { ...localData.content, draftLink: e.target.value }
                              })}
                            />
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Draft Approved</span>
                            <div 
                              className={`w-8 h-4 rounded-full relative cursor-pointer transition-colors ${localData.content.isApproved ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} 
                              onClick={() => {
                                const newApproved = !localData.content.isApproved;
                                updateLocal({
                                  content: { ...localData.content, isApproved: newApproved },
                                  // Auto-transition to PaymentPending when content is approved
                                  status: newApproved ? InfluencerStatus.PaymentPending : localData.status
                                });
                              }}
                            >
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${localData.content.isApproved ? 'left-4' : 'left-0.5'}`}></div>
                            </div>
                        </div>

                         {/* Posted Videos List (Simple View) */}
                         <div className="mt-2">
                             <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">Live Videos ({localData.content.postedVideos.length})</label>
                             <div className="max-h-24 overflow-y-auto space-y-1 mb-2">
                                 {localData.content.postedVideos.map(vid => (
                                     <div key={vid.id} className="text-xs bg-gray-50 dark:bg-gray-800 p-1.5 rounded border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                                         <a href={vid.link} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[200px] flex items-center gap-1">
                                             <LinkIcon size={10} /> {vid.link}
                                         </a>
                                         {vid.isManual && <span className="text-[10px] text-gray-400">(Manual)</span>}
                                     </div>
                                 ))}
                                 {localData.content.postedVideos.length === 0 && <p className="text-xs text-gray-400 italic">No videos detected yet.</p>}
                             </div>
                         </div>

                         {/* Add Manual Video Section */}
                         <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                             <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Add Video Manually</p>
                             <div className="flex gap-2 mb-1">
                                 <input 
                                    type="text" 
                                    value={manualVideoLink}
                                    onChange={e => setManualVideoLink(e.target.value)}
                                    placeholder="Paste video link..."
                                    className="flex-1 text-xs p-1.5 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:border-gray-1000 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                 />
                                 <button onClick={handleAddManualVideo} className="bg-gray-800 dark:bg-gray-700 text-white px-2 py-1 rounded text-xs hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                                     Add
                                 </button>
                             </div>
                             {manualVideoError && (
                                 <div className="flex items-center gap-1 text-[10px] text-red-500 mt-1">
                                     <AlertTriangle size={10} />
                                     {manualVideoError}
                                 </div>
                             )}
                         </div>

                        {localData.content.isApproved && (
                             <div className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">
                                <Button 
                                  className="w-full text-xs py-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-none"
                                  onClick={() => {
                                    onUpdate({ ...localData, paymentStatus: 'Paid', status: InfluencerStatus.Paid });
                                    addToast('success', 'Payment Released', 'Payment has been marked as released.');
                                  }}
                                >
                                  Release Payment
                                </Button>
                             </div>
                        )}
                    </div>
                )}
             </div>

           </div>
           
           <div className="mt-auto p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-900">
             <Button variant="secondary" className="w-full" onClick={onClose}>Close</Button>
           </div>
        </div>

        {/* Main Content Area (Chat) */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="h-16 border-b border-gray-100 dark:border-gray-800 flex items-center px-6 justify-between bg-white dark:bg-gray-900">
             <div className="flex gap-6 h-full">
               <button 
                  onClick={() => { setActiveTab('email'); setIsInternal(false); }}
                  className={`h-full flex items-center gap-2 px-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'email' ? 'border-gray-900 dark:border-white text-gray-900 dark:text-white' : 'border-transparent text-gray-500'}`}
               >
                 Zendesk (External)
               </button>
               <button 
                  onClick={() => { setActiveTab('internal'); setIsInternal(true); }}
                  className={`h-full flex items-center gap-2 px-2 border-b-2 text-sm font-medium transition-colors ${activeTab === 'internal' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500'}`}
               >
                 Internal Team
               </button>
             </div>
          </div>

          {/* Messages */}
          <div className={`flex-1 overflow-y-auto p-6 ${activeTab === 'internal' ? 'bg-amber-50/30 dark:bg-amber-900/10' : 'bg-gray-50 dark:bg-gray-800'}`}>
            <div className="space-y-6">
              {localData.history
                .filter(m => activeTab === 'internal' ? true : !m.isInternal) 
                .map((msg) => (
                <div key={msg.id} className={`flex ${!msg.isInternal && msg.sender === localData.name ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] rounded-2xl p-4 shadow-sm border ${
                    msg.isInternal 
                      ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-100' 
                      : msg.sender !== localData.name
                        ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'
                        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    <div className={`flex items-center gap-2 mb-1 opacity-80 text-xs font-bold ${msg.sender !== localData.name ? 'justify-end' : ''}`}>
                       <span>{msg.sender}</span>
                       <span>•</span>
                       <span>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            {activeTab === 'email' && (
              <div className="flex justify-between items-center mb-4">
                 <div className="flex gap-2 overflow-x-auto pb-2 flex-1">
                    {macros.map(m => (
                      <button 
                        key={m.id} 
                        onClick={() => setMsgInput(m.body.replace('[Name]', localData.name))}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 whitespace-nowrap"
                      >
                        {m.title}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setIsMacroSettingsOpen(true)}
                    className="p-2 ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    title="Manage Macros"
                  >
                     <SettingsIcon size={16} />
                  </button>
              </div>
            )}
            <div className="flex gap-3">
              <textarea
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                placeholder={activeTab === 'email' ? `Reply to ${localData.name} via Zendesk...` : "Write a note to the team..."}
                className={`flex-1 rounded-xl border p-3 text-sm focus:outline-none focus:ring-2 resize-none h-24 text-gray-900 dark:text-white ${
                  activeTab === 'internal' 
                    ? 'border-amber-200 dark:border-amber-900/30 focus:ring-amber-200 bg-amber-50 dark:bg-amber-900/20' 
                    : 'border-gray-200 dark:border-gray-700 focus:ring-gray-900 dark:focus:ring-gray-700 bg-gray-50 dark:bg-gray-800'
                }`}
              />
              <Button 
                className={`h-24 w-24 flex flex-col ${activeTab === 'internal' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'}`} 
                onClick={handleSend}
              >
                <Send size={20} />
                <span className="text-xs mt-1">Send</span>
              </Button>
            </div>
          </div>
        </div>
        
        <AIDrawer isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} influencer={localData} />
        
        <MacroEditorModal 
           isOpen={isMacroSettingsOpen}
           onClose={() => setIsMacroSettingsOpen(false)}
           macros={macros}
           onUpdateMacro={onUpdateMacro}
        />
      </div>
    </div>
  );
};
