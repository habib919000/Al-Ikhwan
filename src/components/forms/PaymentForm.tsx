import React, { useState } from 'react';
import { Member } from '../../types';

interface PaymentFormProps {
  members: Member[];
  onSuccess: () => void;
}

export function PaymentForm({ members, onSuccess }: PaymentFormProps) {
  const [formData, setFormData] = useState({ 
    memberId: '', 
    amount: '', 
    method: 'cash' 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/payments', {
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Member</label>
        <select 
          required
          value={formData.memberId}
          onChange={e => setFormData({ ...formData, memberId: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="">Choose a member...</option>
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.membershipId})</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (৳)</label>
        <input 
          required
          type="number" 
          value={formData.amount}
          onChange={e => setFormData({ ...formData, amount: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="500"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Method</label>
        <select 
          value={formData.method}
          onChange={e => setFormData({ ...formData, method: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
        >
          <option value="cash">Cash</option>
          <option value="bank_transfer">Bank Transfer</option>
          <option value="online">Online Payment</option>
        </select>
      </div>
      <button 
        disabled={submitting}
        type="submit" 
        className="w-full py-3 bg-emerald-600 text-white rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Recording...' : 'Record Payment'}
      </button>
    </form>
  );
}
