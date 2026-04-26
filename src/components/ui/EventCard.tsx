import React from 'react';
import { Calendar, TrendingUp, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EventCardProps {
  key?: string;
  title: string;
  date: string;
  location: string;
  attendees: number;
  status: 'published' | 'draft' | 'cancelled';
}

export function EventCard({ title, date, location, attendees, status }: EventCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className={cn(
          "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
          status === 'published' ? "bg-indigo-100 text-indigo-700" : 
          status === 'cancelled' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
        )}>
          {status}
        </span>
        <button className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreVertical size={16} />
        </button>
      </div>
      <h4 className="text-base font-bold mb-2">{title}</h4>
      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} /> {date}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp size={14} /> {location}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[8px] font-bold">
              U{i}
            </div>
          ))}
          <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-50 text-indigo-600 flex items-center justify-center text-[8px] font-bold">
            +{attendees}
          </div>
        </div>
        <button className="text-xs font-bold text-indigo-600 hover:underline">View Details</button>
      </div>
    </div>
  );
}
