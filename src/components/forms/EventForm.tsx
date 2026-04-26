import React, { useState } from 'react';

interface EventFormProps {
  onSuccess: () => void;
}

export function EventForm({ onSuccess }: EventFormProps) {
  const [formData, setFormData] = useState({ 
    title: '', 
    date: '', 
    location: '', 
    description: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Event Title</label>
        <input 
          required
          type="text" 
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="e.g. Eid Gathering"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
          <input 
            required
            type="date" 
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</label>
          <input 
            required
            type="text" 
            value={formData.location}
            onChange={e => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Hall A"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
        <textarea 
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          rows={2}
          placeholder="Brief details about the event..."
        />
      </div>
      <button 
        disabled={submitting}
        type="submit" 
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Scheduling...' : 'Schedule Event'}
      </button>
    </form>
  );
}
