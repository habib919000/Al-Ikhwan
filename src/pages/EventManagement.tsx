import React from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Event } from '../types';
import { EventCard } from '../components/ui/EventCard';

interface EventManagementProps {
  events: Event[];
  onAddEvent: () => void;
}

export function EventManagement({ events, onAddEvent }: EventManagementProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold">Events & Community</h3>
        <button 
          onClick={onAddEvent} 
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> New Event
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500 font-medium">No events scheduled yet.</p>
          </div>
        ) : (
          events.map(event => (
            <EventCard 
              key={event.id}
              title={event.title} 
              date={new Date(event.date).toLocaleDateString()} 
              location={event.location} 
              attendees={event.attendees} 
              status={event.status} 
            />
          ))
        )}
      </div>
    </div>
  );
}
