
import React from 'react';
import { Card } from '../components/UI';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MOCK_INFLUENCERS } from '../constants';

export const CalendarView = () => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  
  // Simple Mock Calendar Generation
  const generateCalendarDays = () => {
    const dates = [];
    for (let i = 1; i <= 31; i++) {
        dates.push(i);
    }
    return dates;
  };

  const getEventsForDay = (day: number) => {
      // Mock logic: Spread influencers across the month based on ID hash
      return MOCK_INFLUENCERS.filter((inf, idx) => (idx % 30) + 1 === day).slice(0, 3);
  };

  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-gray-900 mb-2">Content Calendar</h2>
           <p className="text-gray-500">Schedule of product shipments and content go-live dates.</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronLeft size={20} /></button>
            <span className="font-bold text-gray-900 w-32 text-center">October 2023</span>
            <button className="p-1 hover:bg-gray-100 rounded-lg"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
         <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
            {days.map(day => (
                <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {day}
                </div>
            ))}
         </div>
         <div className="grid grid-cols-7 auto-rows-[140px] divide-x divide-gray-100">
             {/* Offset for start of month (Mock) */}
             <div className="bg-gray-50/50"></div>
             <div className="bg-gray-50/50"></div>
             
             {generateCalendarDays().map(day => (
                 <div key={day} className="p-2 relative hover:bg-gray-50 transition-colors border-b border-gray-100 group">
                     <span className={`text-sm font-medium ${day === 15 ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-700'}`}>
                         {day}
                     </span>
                     
                     <div className="mt-2 space-y-1.5">
                        {getEventsForDay(day).map((evt, i) => (
                            <div key={i} className={`text-[10px] px-2 py-1 rounded truncate border ${
                                i % 2 === 0 
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                                : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {i % 2 === 0 ? '📦 Ship: ' : '🎥 Live: '}
                                <span className="font-medium">{evt.name}</span>
                            </div>
                        ))}
                     </div>
                     
                     {/* Add Event Button on Hover */}
                     <button className="absolute bottom-2 right-2 w-6 h-6 bg-gray-900 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex text-sm">
                        +
                     </button>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};
