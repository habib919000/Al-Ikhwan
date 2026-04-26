import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Wallet,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface MobileNavItemProps {
  icon: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}

function MobileNavItem({ icon, active, onClick }: MobileNavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "p-2 rounded-xl transition-all duration-200",
        active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 scale-110" : "text-gray-400 hover:text-gray-600"
      )}
    >
      {icon}
    </button>
  );
}

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddPayment: () => void;
}

export function MobileNav({ activeTab, setActiveTab, onAddPayment }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between z-30">
      <MobileNavItem 
        icon={<LayoutDashboard size={20} />} 
        active={activeTab === 'dashboard'} 
        onClick={() => setActiveTab('dashboard')} 
      />
      <MobileNavItem 
        icon={<Users size={20} />} 
        active={activeTab === 'members'} 
        onClick={() => setActiveTab('members')} 
      />
      
      <div className="relative -top-6">
        <button 
          onClick={onAddPayment}
          className="w-12 h-12 bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-700 transition-transform active:scale-90"
        >
          <Plus size={24} />
        </button>
      </div>
      
      <MobileNavItem 
        icon={<Calendar size={20} />} 
        active={activeTab === 'events'} 
        onClick={() => setActiveTab('events')} 
      />
      <MobileNavItem 
        icon={<Wallet size={20} />} 
        active={activeTab === 'finance'} 
        onClick={() => setActiveTab('finance')} 
      />
    </nav>
  );
}
