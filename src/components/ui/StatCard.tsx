import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        {trendUp !== undefined && (
          <div className={cn("flex items-center text-xs font-medium", trendUp ? "text-indigo-600" : "text-red-600")}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendUp ? "8.2%" : "4.1%"}
          </div>
        )}
      </div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h4 className="text-2xl font-bold mt-1">{value}</h4>
      {trend && <p className="text-[10px] text-gray-400 mt-2 font-medium">{trend}</p>}
    </div>
  );
}
