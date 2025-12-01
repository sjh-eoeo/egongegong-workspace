'use client';

import React, { useState, useEffect } from 'react';
import { X, UserPlus } from 'lucide-react';
import { Influencer, InfluencerStatus, CreatorCategory } from '@/types';
import { Button } from '@/components/ui';

interface NewCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CreatorCategory[];
  onSave: (influencer: Influencer) => void;
}

export const NewCreatorModal = ({ isOpen, onClose, categories, onSave }: NewCreatorModalProps) => {
  const [handle, setHandle] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
        setHandle('');
        setName('');
        setEmail('');
        setSelectedCategories([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (categoryName: string) => {
    if (selectedCategories.includes(categoryName)) {
      setSelectedCategories(selectedCategories.filter(c => c !== categoryName));
    } else {
      setSelectedCategories([...selectedCategories, categoryName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handle) return;
    
    // Construct new influencer object
    const newInfluencer: Influencer = {
        id: `manual-${Date.now()}`,
        handle: handle.startsWith('@') ? handle : `@${handle}`,
        name: name || handle,
        email: email,
        category: selectedCategories[0] || '', // Legacy field
        categories: selectedCategories, // Multi-select field
        status: InfluencerStatus.Discovery,
        followerCount: 0,
        country: 'US',
        agreedAmount: 0,
        currency: 'USD',
        paymentStatus: 'Unpaid',
        metrics: { views: 0, likes: 0, comments: 0, shares: 0, engagementRate: 0 },
        contract: {
            totalAmount: 0,
            currency: 'USD',
            videoCount: 1,
            paymentMethod: 'Unselected',
            paymentSchedule: 'Upon Completion',
            milestones: [],
            status: 'Draft',
            platform: 'TikTok'
        },
        logistics: { status: 'Pending' },
        content: { status: 'Waiting for Draft', isApproved: false, postedVideos: [] },
        history: [],
        notes: 'Manually added'
    };

    onSave(newInfluencer);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-xl ring-1 ring-gray-200 dark:ring-gray-800">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
           <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add New Creator</h2>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
             <X size={20} className="text-gray-400" />
           </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Handle</label>
                <input 
                  required 
                  value={handle} 
                  onChange={e => setHandle(e.target.value)} 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  placeholder="@username" 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  placeholder="Full Name" 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  placeholder="email@example.com" 
                />
            </div>
            <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">Categories (Multi-select)</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategory(c.name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedCategories.includes(c.name)
                          ? 'bg-gray-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                {selectedCategories.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Selected: {selectedCategories.join(', ')}
                  </p>
                )}
            </div>
            <div className="pt-2 flex justify-end gap-2">
                <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                <Button icon={UserPlus} type="submit">Add Creator</Button>
            </div>
        </form>
      </div>
    </div>
  );
};
