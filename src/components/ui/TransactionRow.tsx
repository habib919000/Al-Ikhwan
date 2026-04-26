import React from 'react';
import { ArrowUpRight, ArrowDownRight, CheckCircle2, Clock } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';

interface TransactionRowProps {
  key?: string;
  name: string;
  type: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending';
}

export function TransactionRow({ name, type, amount, date, status }: TransactionRowProps) {
  return (
    <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center", 
          amount > 0 ? "bg-indigo-50 text-indigo-600" : "bg-red-50 text-red-600"
        )}>
          {amount > 0 ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
        </div>
        <div>
          <p className="text-sm font-bold">{name}</p>
          <p className="text-[11px] text-gray-500">{type} • {date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={cn("text-sm font-bold", amount > 0 ? "text-indigo-600" : "text-gray-900")}>
          {amount > 0 ? "+" : ""}{formatCurrency(amount)}
        </p>
        <div className="flex items-center justify-end gap-1 mt-1">
          {status === 'completed' ? (
            <CheckCircle2 size={10} className="text-indigo-500" />
          ) : (
            <Clock size={10} className="text-amber-500" />
          )}
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider", 
            status === 'completed' ? "text-indigo-500" : "text-amber-500"
          )}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}
