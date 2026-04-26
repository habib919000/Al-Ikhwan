import React from 'react';
import { Search, Bell, MoreVertical } from 'lucide-react';

interface TopbarProps {
  activeTab: string;
  onMenuClick: () => void;
}

export function Topbar({ activeTab, onMenuClick }: TopbarProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-10">
      <div className="flex items-center gap-3 lg:gap-4 text-gray-500">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical size={20} className="rotate-90" />
        </button>
        <h2 className="text-base lg:text-lg font-semibold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h2>
      </div>
      <div className="flex items-center gap-3 lg:gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 w-48 lg:w-64 transition-all"
          />
        </div>
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors p-2">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">3</span>
        </button>
      </div>
    </header>
  );
}
