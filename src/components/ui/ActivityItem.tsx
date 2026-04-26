import React from 'react';

interface ActivityItemProps {
  key?: string;
  title: string;
  desc: string;
  time: string;
}

export function ActivityItem({ title, desc, time }: ActivityItemProps) {
  return (
    <div className="flex gap-3">
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5" />
      <div>
        <p className="text-xs font-bold">{title}</p>
        <p className="text-[11px] text-gray-500">{desc}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
