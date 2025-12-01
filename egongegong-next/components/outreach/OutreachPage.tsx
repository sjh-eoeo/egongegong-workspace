'use client';

import React, { useState, useMemo } from 'react';
import { ZENDESK_MACROS } from '@/lib/constants';
import { useInfluencers } from '@/hooks/useCollection';
import { Influencer, InfluencerStatus, ChatMessage } from '@/types';
import { Card, Button } from '@/components/ui';
import { MessageSquare, Send, Copy, Check, Mail, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatCompact } from '@/lib/utils';
import { updateInfluencer } from '@/lib/firebase/firestore';
import { useToast } from '@/components/Toast';

export const OutreachPage = () => {
  const { data: influencersData } = useInfluencers();
  const influencers = influencersData as Influencer[];
  const { addToast } = useToast();
  
  const [selectedCreator, setSelectedCreator] = useState<Influencer | null>(null);
  const [selectedMacro, setSelectedMacro] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);

  // Filter creators who need outreach (Discovery or Contacted)
  const outreachQueue = useMemo(() => 
    influencers.filter(i => 
      i.status === InfluencerStatus.Discovery || i.status === InfluencerStatus.Contacted
    ),
    [influencers]
  );

  const handleCopyEmail = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getMacroContent = (macroId: string, creator: Influencer) => {
    const macro = ZENDESK_MACROS.find(m => m.id === macroId);
    if (!macro) return '';
    
    return macro.body
      .replace(/\{name\}/g, creator.name)
      .replace(/\{handle\}/g, creator.handle);
  };

  // Send outreach and log to DB
  const handleSendOutreach = async (creator: Influencer) => {
    if (!selectedMacro) {
      addToast('error', 'Error', 'Please select a template first.');
      return;
    }
    
    setSending(true);
    try {
      const macro = ZENDESK_MACROS.find(m => m.id === selectedMacro);
      const content = getMacroContent(selectedMacro, creator);
      
      // Create history entry
      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'operator.team',
        content: content,
        timestamp: new Date().toISOString(),
        isInternal: false,
        type: 'macro'
      };
      
      // Update influencer with history and status
      await updateInfluencer(creator.id, {
        history: [...(creator.history || []), newMessage],
        status: creator.status === InfluencerStatus.Discovery 
          ? InfluencerStatus.Contacted 
          : creator.status
      });
      
      // Open mail client
      window.open(`mailto:${creator.email}?subject=${encodeURIComponent(macro?.title || 'Collaboration Opportunity')}&body=${encodeURIComponent(content)}`);
      
      addToast('success', 'Outreach Sent', `Message logged for ${creator.name}`);
      
      // Move to next creator
      const currentIndex = outreachQueue.findIndex(c => c.id === creator.id);
      if (currentIndex < outreachQueue.length - 1) {
        setSelectedCreator(outreachQueue[currentIndex + 1]);
      } else {
        setSelectedCreator(null);
      }
      setSelectedMacro(null);
    } catch (error) {
      console.error('Error sending outreach:', error);
      addToast('error', 'Error', 'Failed to log outreach.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 w-full h-[calc(100vh-64px)] flex gap-6">
        {/* Creator Queue */}
        <div className="w-80 shrink-0 flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Outreach Queue</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{outreachQueue.length} creators awaiting contact</p>
          </div>
          
          <Card className="flex-1 overflow-hidden p-0">
            <div className="overflow-y-auto h-full">
              {outreachQueue.map(creator => (
                <button
                  key={creator.id}
                  onClick={() => setSelectedCreator(creator)}
                  className={`w-full p-4 text-left border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                    selectedCreator?.id === creator.id ? 'bg-gray-100 dark:bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 dark:text-white truncate">{creator.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{creator.handle}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      creator.status === InfluencerStatus.Discovery 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    }`}>
                      {creator.status}
                    </span>
                  </div>
                </button>
              ))}
              {outreachQueue.length === 0 && (
                <div className="p-8 text-center text-gray-400 dark:text-gray-500">
                  No creators in queue
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {selectedCreator ? (
            <>
              {/* Creator Info */}
              <Card className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedCreator.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                      <span>{selectedCreator.handle}</span>
                      <span>•</span>
                      <span>{formatCompact(selectedCreator.followerCount)} followers</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="secondary" 
                      icon={Mail}
                      onClick={() => handleCopyEmail(selectedCreator.email)}
                    >
                      {copied ? 'Copied!' : 'Copy Email'}
                    </Button>
                    <Button 
                      variant="primary" 
                      icon={sending ? Loader2 : Send}
                      disabled={sending || !selectedMacro}
                      onClick={() => handleSendOutreach(selectedCreator)}
                    >
                      {sending ? 'Sending...' : 'Send & Log'}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Macro Templates */}
              <div className="mb-4">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Quick Templates</h4>
                <div className="flex gap-2 flex-wrap">
                  {ZENDESK_MACROS.map(macro => (
                    <button
                      key={macro.id}
                      onClick={() => setSelectedMacro(macro.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedMacro === macro.id
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {macro.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email Preview */}
              <Card className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                  <h4 className="font-bold text-gray-900 dark:text-white">Email Preview</h4>
                  <Button 
                    variant="ghost" 
                    icon={copied ? Check : Copy}
                    className="text-xs"
                    onClick={() => selectedMacro && handleCopyEmail(getMacroContent(selectedMacro, selectedCreator))}
                  >
                    Copy Content
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto mt-4">
                  {selectedMacro ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg font-sans">
                        {getMacroContent(selectedMacro, selectedCreator)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 dark:text-gray-500 py-8">
                      Select a template above to preview
                    </div>
                  )}
                </div>
              </Card>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400">Select a Creator</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500">Choose from the queue to start outreach</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};
