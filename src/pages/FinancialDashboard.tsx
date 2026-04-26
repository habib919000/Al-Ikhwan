import React, { useState } from 'react';
import { ArrowDownRight, Plus, ArrowUpRight } from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { DashboardStats, Transaction } from '../types';
import { TransactionRow } from '../components/ui/TransactionRow';
import { CategoryProgress } from '../components/ui/CategoryProgress';

interface FinancialDashboardProps {
  stats: DashboardStats | null;
  transactions: Transaction[];
  onRecordPayment: () => void;
  onRecordExpense: () => void;
}

export function FinancialDashboard({ 
  stats, 
  transactions, 
  onRecordPayment, 
  onRecordExpense 
}: FinancialDashboardProps) {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'income') return t.amount > 0;
    if (filter === 'expense') return t.amount < 0;
    return true;
  });

  // Calculate dynamic categories for MTD expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const mtdExpenses = transactions.filter(t => {
    const d = new Date(t.date);
    return t.amount < 0 && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalMtdExpenses = Math.abs(mtdExpenses.reduce((acc, t) => acc + t.amount, 0));
  
  const categoryTotals: Record<string, number> = {};
  mtdExpenses.forEach(t => {
    const cat = t.type || 'Other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amount);
  });

  const categories = Object.entries(categoryTotals)
    .map(([label, amount]) => ({
      label,
      value: totalMtdExpenses > 0 ? Math.round((amount / totalMtdExpenses) * 100) : 0,
      color: label === 'Maintenance' ? 'bg-blue-500' : 
             label === 'Security' ? 'bg-indigo-500' : 
             label === 'Utilities' ? 'bg-amber-500' : 
             label === 'Salary' ? 'bg-purple-500' : 'bg-gray-400'
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h3 className="text-xl font-bold">Financial Management</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onRecordExpense} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <ArrowDownRight size={16} /> Record Expense
          </button>
          <button 
            onClick={onRecordPayment} 
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus size={16} /> Record Payment
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6 order-2 lg:order-1">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-bold">Recent Transactions</h4>
              <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setFilter('all')}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", filter === 'all' ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                >
                  All
                </button>
                <button 
                  onClick={() => setFilter('income')}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", filter === 'income' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                >
                  Income
                </button>
                <button 
                  onClick={() => setFilter('expense')}
                  className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all", filter === 'expense' ? "bg-white text-red-600 shadow-sm" : "text-gray-500 hover:text-gray-700")}
                >
                  Expenses
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {filteredTransactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No transactions found.</p>
              ) : (
                filteredTransactions.map(t => (
                  <TransactionRow 
                    key={t.id} 
                    name={t.name} 
                    type={t.type} 
                    amount={t.amount} 
                    date={new Date(t.date).toLocaleDateString()} 
                    status={t.status as any} 
                  />
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#151619] text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-1">Total Balance</p>
              <h2 className="text-3xl font-bold mb-6">{formatCurrency(stats?.totalBalance || 0)}</h2>
              <div className="flex justify-between text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Income (MTD)</p>
                  <p className="font-bold text-indigo-400">+{formatCurrency(stats?.monthlyCollection || 0)}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Expenses (MTD)</p>
                  <p className="font-bold text-red-400">-{formatCurrency(stats?.recentExpenses || 0)}</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
          </div>
          
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-sm font-bold mb-4">Expense Categories (MTD)</h4>
            <div className="space-y-4">
              {categories.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">No expenses recorded this month.</p>
              ) : (
                categories.map(cat => (
                  <CategoryProgress label={cat.label} value={cat.value} color={cat.color} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
