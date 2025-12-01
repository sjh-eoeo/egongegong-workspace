'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Mail } from 'lucide-react';
import { Influencer, ZendeskMacro } from '@/types';
import { ZENDESK_MACROS } from '@/lib/constants';
import { Button } from '@/components/ui';

interface ReachOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Influencer[];
  onSend: (macroId: string, notes: string, customBody?: string) => void;
  macros?: ZendeskMacro[];
}

export const ReachOutModal = ({ isOpen, onClose, recipients, onSend, macros }: ReachOutModalProps) => {
  // Use passed macros or fallback to default constant
  const activeMacros = macros || ZENDESK_MACROS;
  
  const [selectedMacroId, setSelectedMacroId] = useState<string>(activeMacros[0]?.id || '');
  const [emailBody, setEmailBody] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Update email body when macro changes
  useEffect(() => {
    const macro = activeMacros.find(m => m.id === selectedMacroId);
    if (macro) {
        // Reset body to macro default when switching macros
        setEmailBody(macro.body);
    }
  }, [selectedMacroId, isOpen, activeMacros]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-100 dark:bg-gray-950/30 rounded-lg text-gray-700 dark:text-gray-500">
                <Mail size={20} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Reach Out via Zendesk</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sending to <span className="font-bold text-gray-900 dark:text-white">{recipients.length}</span> creators</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-500"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-6">
           {/* Recipient List (Preview) */}
           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipients</label>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 border border-gray-100 dark:border-gray-800 rounded-xl bg-gray-50 dark:bg-gray-800">
                  {recipients.map(r => (
                      <span key={r.id} className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 shadow-sm">
                          {r.handle}
                      </span>
                  ))}
              </div>
           </div>

           {/* Macro Selection */}
           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Email Template</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                  {activeMacros.slice(0, 2).map(macro => (
                      <div 
                        key={macro.id}
                        onClick={() => setSelectedMacroId(macro.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedMacroId === macro.id 
                            ? 'bg-gray-100 dark:bg-gray-950/30 border-gray-1000 ring-1 ring-gray-1000' 
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                          <div className="font-bold text-sm text-gray-900 dark:text-white mb-1">{macro.title}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{macro.subject}</div>
                      </div>
                  ))}
              </div>
              
              <div className="relative">
                  <div className="absolute top-3 left-4 text-xs font-bold text-gray-400 uppercase tracking-wide pointer-events-none">Email Body</div>
                  <textarea 
                    className="w-full p-4 pt-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-mono focus:ring-2 focus:ring-gray-1000/20 focus:outline-none resize-y min-h-[150px] leading-relaxed text-gray-900 dark:text-white"
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Compose your email here..."
                  />
              </div>
           </div>
           
           {/* Internal Note */}
           <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Internal Note (Optional)</label>
              <textarea 
                 value={additionalNotes}
                 onChange={(e) => setAdditionalNotes(e.target.value)}
                 className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-gray-1000/20 focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                 placeholder="Add a note to the creator's profile..."
                 rows={2}
              />
           </div>
        </div>

        <div className="p-6 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end gap-3">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button icon={Send} onClick={() => { onSend(selectedMacroId, additionalNotes, emailBody); onClose(); }}>Send {recipients.length} Emails</Button>
        </div>
      </div>
    </div>
  );
};
