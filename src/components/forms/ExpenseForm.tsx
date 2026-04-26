import React, { useState } from 'react';

interface ExpenseFormProps {
  onSuccess: () => void;
}

export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [formData, setFormData] = useState({ 
    name: '', 
    amount: '', 
    category: 'Maintenance', 
    date: new Date().toISOString().split('T')[0], 
    method: 'cash' 
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/expenses', {
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
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Expense Name / Vendor</label>
        <input 
          required
          type="text" 
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          placeholder="e.g. Security Guard Salary"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount (৳)</label>
          <input 
            required
            type="number" 
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            placeholder="15000"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
          <select 
            value={formData.category}
            onChange={e => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Maintenance">Maintenance</option>
            <option value="Security">Security</option>
            <option value="Utilities">Utilities</option>
            <option value="Events">Events</option>
            <option value="Salary">Salary</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
          <input 
            required
            type="date" 
            value={formData.date}
            onChange={e => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Method</label>
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
      </div>
      <button 
        disabled={submitting}
        type="submit" 
        className="w-full py-3 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Recording...' : 'Record Expense'}
      </button>
    </form>
  );
}
