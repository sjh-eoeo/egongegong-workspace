
import React from 'react';
import { Card, Button } from '../components/UI';
import { Download, TrendingUp, Users, Eye, MousePointer } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MOCK_CHART_DATA = [
  { name: 'Week 1', views: 4000, spend: 2400 },
  { name: 'Week 2', views: 3000, spend: 1398 },
  { name: 'Week 3', views: 2000, spend: 9800 },
  { name: 'Week 4', views: 2780, spend: 3908 },
  { name: 'Week 5', views: 1890, spend: 4800 },
  { name: 'Week 6', views: 2390, spend: 3800 },
  { name: 'Week 7', views: 3490, spend: 4300 },
];

const MOCK_DAILY_UPLOADS = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 18 },
  { day: 'Wed', count: 8 },
  { day: 'Thu', count: 25 },
  { day: 'Fri', count: 32 },
  { day: 'Sat', count: 15 },
  { day: 'Sun', count: 10 },
];

export const ReportingHub = () => {
  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 mb-2">Performance Reports</h2>
           <p className="text-gray-500">Aggregate analytics across all campaigns for client reporting.</p>
        </div>
        <div className="flex gap-2">
             <select className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none">
                 <option>All Campaigns</option>
                 <option>Summer Glow</option>
                 <option>Holiday Special</option>
             </select>
             <Button icon={Download}>Export PDF</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6">
          {/* Using div instead of Card to avoid bg-white class conflict for colored card */}
          <div className="rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-6 bg-indigo-600 text-white border-none">
              <div className="flex items-center gap-3 mb-2 opacity-80">
                  <Eye size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Total Views</span>
              </div>
              <div className="text-4xl font-bold">2.4M</div>
              <div className="mt-4 text-sm bg-white/10 w-fit px-2 py-1 rounded text-white flex items-center gap-1">
                  <TrendingUp size={14} /> +12.5% vs last month
              </div>
          </div>
          <Card className="p-6">
              <div className="flex items-center gap-3 mb-2 text-gray-500">
                  <MousePointer size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Avg Engagement</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">8.2%</div>
              <div className="mt-4 text-xs text-gray-400">Target: 5.0%</div>
          </Card>
          <Card className="p-6">
               <div className="flex items-center gap-3 mb-2 text-gray-500">
                  <Users size={18} />
                  <span className="text-xs font-bold uppercase tracking-wider">Creators Live</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">142</div>
              <div className="mt-4 text-xs text-gray-400">35 pending draft</div>
          </Card>
           <Card className="p-6">
               <div className="flex items-center gap-3 mb-2 text-gray-500">
                  <span className="text-lg font-bold">$</span>
                  <span className="text-xs font-bold uppercase tracking-wider">CPE (Cost Per Eng.)</span>
              </div>
              <div className="text-4xl font-bold text-gray-900">$0.12</div>
              <div className="mt-4 text-xs text-emerald-600 font-bold">-4% efficient</div>
          </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-2 gap-6 h-[350px]">
          <Card className="flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6">Views Growth</h3>
              <div className="flex-1">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA}>
                        <defs>
                            <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Area type="monotone" dataKey="views" stroke="#4f46e5" fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
          </Card>

          <Card className="flex flex-col">
              <h3 className="font-bold text-gray-900 mb-6">Spend vs Performance</h3>
              <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHART_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="spend" fill="#1f2937" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
          </Card>
      </div>

      {/* Charts Row 2: Daily Uploads */}
      <div className="h-[300px]">
         <Card className="flex flex-col h-full">
            <h3 className="font-bold text-gray-900 mb-2">Daily Video Uploads</h3>
            <p className="text-xs text-gray-500 mb-4">Volume of live content detected per day</p>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={MOCK_DAILY_UPLOADS}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="day" tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                       <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{fill: '#f8fafc'}} />
                       <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}>
                       </Bar>
                   </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>
    </div>
  );
};
