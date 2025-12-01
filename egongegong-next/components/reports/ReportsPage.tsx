'use client';

import React, { useMemo } from 'react';
import { useInfluencers, useProjects } from '@/hooks/useCollection';
import { InfluencerStatus, Influencer, Project } from '@/types';
import { Card, MetricCard } from '@/components/ui';
import { BarChart3, Users, DollarSign, TrendingUp, Video, Eye, Target, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { formatNumber, formatCurrency, formatCompact } from '@/lib/utils';

export const ReportsPage = () => {
  const { data: influencersData } = useInfluencers();
  const { data: projectsData } = useProjects();
  
  const influencers = influencersData as Influencer[];
  const projects = projectsData as Project[];

  // Calculate various metrics
  const stats = useMemo(() => {
    const totalCreators = influencers.length;
    const activeCreators = influencers.filter(i => 
      i.status !== InfluencerStatus.Discovery && i.status !== InfluencerStatus.Paid
    ).length;
    const totalPaid = influencers.filter(i => i.status === InfluencerStatus.Paid).length;
    const contentLive = influencers.filter(i => i.status === InfluencerStatus.ContentLive).length;
    
    const totalViews = influencers.reduce((sum, i) => sum + (i.metrics?.views || 0), 0);
    const avgEngagement = totalCreators > 0 
      ? influencers.reduce((sum, i) => sum + (i.metrics?.engagementRate || 0), 0) / totalCreators 
      : 0;
    
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    
    return {
      totalCreators,
      activeCreators,
      totalPaid,
      contentLive,
      totalViews,
      avgEngagement: avgEngagement.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalBudget,
      totalSpent,
      activeProjects: projects.filter(p => p.status === 'Active').length,
    };
  }, [influencers, projects]);

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    influencers.forEach(i => {
      breakdown[i.status] = (breakdown[i.status] || 0) + 1;
    });
    return breakdown;
  }, [influencers]);

  return (
    <Layout>
      <div className="p-6 w-full space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Reporting Hub</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of campaign performance and key metrics</p>
        </div>

        {/* Top Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            label="Active Campaigns" 
            value={formatNumber(stats.activeProjects)}
            icon={Target}
            active
          />
          <MetricCard 
            label="Total Creators" 
            value={formatNumber(stats.totalCreators)}
            icon={Users}
          />
          <MetricCard 
            label="Total Views" 
            value={formatCompact(stats.totalViews)}
            icon={Eye}
          />
          <MetricCard 
            label="Avg Engagement" 
            value={`${stats.avgEngagement}%`}
            icon={Zap}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Overview */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-gray-400" size={20} />
              <h3 className="font-bold text-gray-900 dark:text-white">Budget Overview</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Total Budget</span>
                  <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(stats.totalBudget)}</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-600 rounded-full transition-all duration-500"
                    style={{ width: `${(stats.totalSpent / stats.totalBudget) * 100}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Spent</span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {formatCurrency(stats.totalSpent)} ({((stats.totalSpent / stats.totalBudget) * 100).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}%)
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Remaining</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(stats.totalBudget - stats.totalSpent)}
                </span>
              </div>
            </div>
          </Card>

          {/* Creator Status Breakdown */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="text-gray-400" size={20} />
              <h3 className="font-bold text-gray-900 dark:text-white">Creator Pipeline</h3>
            </div>
            <div className="space-y-3">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      status === 'Discovery' ? 'bg-gray-400' :
                      status === 'Contacted' ? 'bg-blue-500' :
                      status === 'Negotiating' ? 'bg-gray-500' :
                      status === 'Approved' ? 'bg-gray-500' :
                      status === 'Content Live' ? 'bg-emerald-500' :
                      status === 'Payment Pending' ? 'bg-amber-500' :
                      'bg-gray-800'
                    }`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gray-600 rounded-full"
                        style={{ width: `${(count / stats.totalCreators) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Campaign Performance */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="text-gray-400" size={20} />
            <h3 className="font-bold text-gray-900 dark:text-white">Campaign Performance</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Campaign</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Brand</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Budget</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Spent</th>
                  <th className="pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {projects.map(project => (
                  <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{project.title}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded uppercase">
                        {project.brand}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'Active' 
                          ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                          : project.status === 'Completed'
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                          : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-900/30'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{formatCurrency(project.budget)}</td>
                    <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(project.spent)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gray-600 rounded-full"
                            style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {Math.round((project.spent / project.budget) * 100).toLocaleString('ko-KR')}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
