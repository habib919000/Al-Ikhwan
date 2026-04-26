import React from 'react';
import { cn } from '../../lib/utils';

interface CategoryProgressProps {
  label: string;
  value: number;
  color: string;
}

export function CategoryProgress({ label, value, color }: CategoryProgressProps) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-semibold text-gray-600">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", color)} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
