import React, { useState } from 'react';

interface MemberFormProps {
  onSuccess: () => void;
}

export function MemberForm({ onSuccess }: MemberFormProps) {
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    email: '', 
    address: '', 
    bloodGroup: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/members', {
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
        <input 
          required
          type="text" 
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="e.g. Zaid Ali"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
          <input 
            required
            type="tel" 
            value={formData.phone}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="+91 98765 43210"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
          <input 
            type="email" 
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="zaid@example.com"
          />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Blood Group</label>
        <select 
          value={formData.bloodGroup}
          onChange={e => setFormData({ ...formData, bloodGroup: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Select Blood Group</option>
          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
            <option key={bg} value={bg}>{bg}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</label>
        <textarea 
          required
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          rows={3}
          placeholder="House No, Street, Area..."
        />
      </div>
      <button 
        disabled={submitting}
        type="submit" 
        className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Adding...' : 'Add Member'}
      </button>
    </form>
  );
}
