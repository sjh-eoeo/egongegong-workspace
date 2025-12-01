
import React, { useState } from 'react';
import { Project, Influencer, InfluencerStatus } from '../types';
import { Card, Button } from './UI';
import { Save, Search, UserPlus, Send, Settings, Check } from 'lucide-react';
import { MOCK_INFLUENCERS, MOCK_BRANDS } from '../constants';
import { ReachOutModal } from './ReachOutModal';

interface ProjectSettingsTabProps {
  project: Project;
  onUpdate: (project: Project) => void;
  existingInfluencerIds: string[];
  onAddInfluencers: (influencers: Influencer[]) => void;
}

export const ProjectSettingsTab = ({ project, onUpdate, existingInfluencerIds, onAddInfluencers }: ProjectSettingsTabProps) => {
  const [formData, setFormData] = useState(project);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for recruitment
  const [selectedRecruits, setSelectedRecruits] = useState<Influencer[]>([]);
  const [isReachOutOpen, setIsReachOutOpen] = useState(false);

  // Filter influencers that are NOT in this project
  const availableCreators = MOCK_INFLUENCERS.filter(i => 
    !existingInfluencerIds.includes(i.id) &&
    (i.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     i.handle.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSaveProject = () => {
    onUpdate(formData);
  };

  const toggleRecruitSelection = (influencer: Influencer) => {
      if (selectedRecruits.find(i => i.id === influencer.id)) {
          setSelectedRecruits(selectedRecruits.filter(i => i.id !== influencer.id));
      } else {
          setSelectedRecruits([...selectedRecruits, influencer]);
      }
  };

  const handleAddToProject = () => {
      // Just add them to the project list with 'Discovery' status
      const newInfluencers = selectedRecruits.map(inf => ({
          ...inf,
          projectId: project.id,
          status: InfluencerStatus.Discovery
      }));
      onAddInfluencers(newInfluencers);
      setSelectedRecruits([]);
  };

  const handleReachOutSend = (macroId: string, notes: string) => {
      // Add to project AND set status to Contacted
       const newInfluencers = selectedRecruits.map(inf => ({
          ...inf,
          projectId: project.id,
          status: InfluencerStatus.Contacted,
          history: [
             ...inf.history,
             {
                 id: Date.now().toString(),
                 sender: 'operator.team',
                 content: `[Zendesk Macro ${macroId}] ${notes}`,
                 timestamp: new Date().toISOString(),
                 isInternal: false,
                 type: 'macro' as const
             }
          ]
      }));
      onAddInfluencers(newInfluencers);
      setSelectedRecruits([]);
  };

  return (
    <div className="space-y-8">
       {/* 1. General Campaign Settings */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1">
               <h3 className="text-lg font-bold text-gray-900 mb-1">Campaign Details</h3>
               <p className="text-sm text-gray-500">Update general information and managers.</p>
           </div>
           <Card className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Title</label>
                      <input 
                        value={formData.title} 
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                      />
                  </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Brand</label>
                      <select 
                        value={MOCK_BRANDS.find(b => b.name === formData.brand)?.id || ''}
                        onChange={(e) => {
                            const b = MOCK_BRANDS.find(brand => brand.id === e.target.value);
                            if(b) setFormData({...formData, brand: b.name});
                        }}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm bg-white"
                      >
                          {MOCK_BRANDS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Budget Allocation</label>
                      <input 
                        type="number"
                        value={formData.budget} 
                        onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label>
                      <input 
                        type="date"
                        value={formData.startDate} 
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full p-2 border border-gray-200 rounded-lg text-sm"
                      />
                  </div>
              </div>
              <div className="pt-2 flex justify-end">
                  <Button icon={Save} onClick={handleSaveProject} className="text-xs">Save Changes</Button>
              </div>
           </Card>
       </div>

       <hr className="border-gray-100" />

       {/* 2. Creator Recruitment */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="md:col-span-1">
               <h3 className="text-lg font-bold text-gray-900 mb-1">Recruit Creators</h3>
               <p className="text-sm text-gray-500">Find new talent from the pool or reach out to them directly via Zendesk.</p>
           </div>
           <Card className="md:col-span-2 p-0 overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                   <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                       <input 
                         placeholder="Search creator pool..."
                         value={searchTerm}
                         onChange={(e) => setSearchTerm(e.target.value)}
                         className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none w-64"
                       />
                   </div>
                   <div className="flex gap-2">
                       {selectedRecruits.length > 0 && (
                           <>
                               <Button variant="secondary" icon={UserPlus} className="text-xs" onClick={handleAddToProject}>
                                   Add to Project ({selectedRecruits.length})
                               </Button>
                               <Button icon={Send} className="text-xs" onClick={() => setIsReachOutOpen(true)}>
                                   Reach Out ({selectedRecruits.length})
                               </Button>
                           </>
                       )}
                   </div>
               </div>

               <div className="max-h-96 overflow-y-auto">
                   <table className="w-full text-left">
                       <thead className="bg-white border-b border-gray-100 sticky top-0">
                           <tr>
                               <th className="px-4 py-3 w-8"></th>
                               <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Creator</th>
                               <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Followers</th>
                               <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">Avg Views</th>
                               <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase">ER%</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-50">
                           {availableCreators.slice(0, 20).map(creator => {
                               const isSelected = !!selectedRecruits.find(i => i.id === creator.id);
                               return (
                                   <tr 
                                     key={creator.id} 
                                     className={`hover:bg-gray-50 cursor-pointer transition-colors ${isSelected ? 'bg-indigo-50/50' : ''}`}
                                     onClick={() => toggleRecruitSelection(creator)}
                                   >
                                       <td className="px-4 py-3">
                                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                                {isSelected && <Check size={10} className="text-white" />}
                                            </div>
                                       </td>
                                       <td className="px-4 py-3">
                                           <div className="text-sm font-medium text-gray-900">{creator.name}</div>
                                           <div className="text-xs text-gray-500">{creator.handle}</div>
                                       </td>
                                       <td className="px-4 py-3 text-sm text-gray-600">{(creator.followerCount / 1000).toFixed(0)}k</td>
                                       <td className="px-4 py-3 text-sm text-gray-600">{(creator.metrics?.avgViewsPerVideo ? (creator.metrics.avgViewsPerVideo/1000).toFixed(1) + 'k' : '-')}</td>
                                       <td className="px-4 py-3 text-sm text-gray-600">{creator.metrics?.engagementRate}%</td>
                                   </tr>
                               );
                           })}
                           {availableCreators.length === 0 && (
                               <tr><td colSpan={5} className="p-4 text-center text-sm text-gray-400">No creators found matching search.</td></tr>
                           )}
                       </tbody>
                   </table>
               </div>
           </Card>
       </div>

       <ReachOutModal 
          isOpen={isReachOutOpen}
          onClose={() => setIsReachOutOpen(false)}
          recipients={selectedRecruits}
          onSend={handleReachOutSend}
       />
    </div>
  );
};
