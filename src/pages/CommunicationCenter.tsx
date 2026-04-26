import React, { useState, useEffect } from 'react';
import { Plus, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { Announcement } from '../types';

interface CommunicationCenterProps {
  announcements: Announcement[];
  onSendAnnouncement: () => void;
}

export function CommunicationCenter({ announcements, onSendAnnouncement }: CommunicationCenterProps) {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(announcements[0] || null);

  useEffect(() => {
    if (!selectedAnnouncement && announcements.length > 0) {
      setSelectedAnnouncement(announcements[0]);
    }
  }, [announcements, selectedAnnouncement]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-[600px] flex flex-col md:flex-row overflow-hidden">
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col h-1/3 md:h-full">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h4 className="font-bold">Messages</h4>
          <button 
            onClick={onSendAnnouncement} 
            className="p-1 hover:bg-gray-100 rounded text-indigo-600 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {announcements.length === 0 ? (
            <p className="p-4 text-xs text-gray-500 italic">No announcements found.</p>
          ) : (
            announcements.map((ann) => (
              <div 
                key={ann.id}
                onClick={() => setSelectedAnnouncement(ann)}
                className={cn(
                  "p-4 cursor-pointer border-l-4 transition-colors",
                  selectedAnnouncement?.id === ann.id 
                    ? "bg-indigo-50/50 border-indigo-500" 
                    : "hover:bg-gray-50 border-transparent"
                )}
              >
                <p className="text-xs font-bold">{ann.title}</p>
                <p className="text-[11px] text-gray-500 truncate">{ann.message}</p>
                <p className="text-[9px] text-gray-400 mt-1">{new Date(ann.date).toLocaleDateString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 flex flex-col h-2/3 md:h-full">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h4 className="font-bold">{selectedAnnouncement?.title || 'Select an announcement'}</h4>
          <button onClick={onSendAnnouncement} className="text-xs font-bold text-indigo-600 hover:underline">New Broadcast</button>
        </div>
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {selectedAnnouncement ? (
            <div className="max-w-md bg-gray-100 p-4 rounded-2xl rounded-tl-none">
              <p className="text-xs font-bold mb-1">{selectedAnnouncement.author || 'System Admin'}</p>
              <p className="text-sm">{selectedAnnouncement.message}</p>
              <p className="text-[10px] text-gray-400 mt-2">
                {new Date(selectedAnnouncement.date).toLocaleString()}
              </p>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
              No announcement selected
            </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100">
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-gray-100 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
            />
            <button className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
