import React, { useState } from 'react';

interface AnnouncementFormProps {
  onSuccess: () => void;
}

export function AnnouncementForm({ onSuccess }: AnnouncementFormProps) {
  const [formData, setFormData] = useState({ 
    title: '', 
    message: '', 
    type: 'all' 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to send announcement', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Announcement Title</label>
        <input 
          required
          type="text" 
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          placeholder="e.g. Water Supply Update"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recipient Group</label>
        <select 
          value={formData.type}
          onChange={e => setFormData({ ...formData, type: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
        >
          <option value="all">All Members</option>
          <option value="committee">Committee Members Only</option>
          <option value="pending">Members with Pending Dues</option>
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Message</label>
        <textarea 
          required
          value={formData.message}
          onChange={e => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          rows={4}
          placeholder="Type your announcement here..."
        />
      </div>
      <button 
        disabled={submitting}
        type="submit" 
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Sending...' : 'Send Announcement'}
      </button>
    </form>
  );
}
