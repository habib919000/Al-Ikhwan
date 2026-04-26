import React from 'react';
import { cn } from '../../lib/utils';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

export function ActionButton({ icon, label, color, onClick }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={cn("w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98]", color)}
    >
      {icon}
      {label}
    </button>
  );
}
