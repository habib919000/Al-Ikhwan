import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Calendar, 
  MessageSquare, 
  Settings, 
  LogOut,
  Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { User } from '../../types';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

function NavItem({ icon, label, active, onClick }: NavItemProps) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
        active 
          ? "bg-indigo-500/10 text-indigo-400" 
          : "text-gray-400 hover:text-white hover:bg-white/5"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
    </button>
  );
}

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: User;
  onLogout: () => void;
}

export function Sidebar({ 
  isOpen, 
  setIsOpen, 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout 
}: SidebarProps) {
  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-[#151619] text-white flex flex-col border-r border-[#2D2E32] transition-transform duration-300 lg:relative lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-6 flex items-center justify-between lg:justify-start gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center font-bold text-white">AI</div>
          <h1 className="text-xl font-bold tracking-tight">Al-Ikhwan</h1>
        </div>
        <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
          <Plus size={24} className="rotate-45" />
        </button>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <NavItem 
          icon={<LayoutDashboard size={18} />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => handleNavClick('dashboard')} 
        />
        {user.role === 'admin' && (
          <>
            <NavItem 
              icon={<Users size={18} />} 
              label="Members" 
              active={activeTab === 'members' || activeTab === 'member-profile'} 
              onClick={() => handleNavClick('members')} 
            />
            <NavItem 
              icon={<Wallet size={18} />} 
              label="Financials" 
              active={activeTab === 'finance'} 
              onClick={() => handleNavClick('finance')} 
            />
            <NavItem 
              icon={<Calendar size={18} />} 
              label="Events" 
              active={activeTab === 'events'} 
              onClick={() => handleNavClick('events')} 
            />
            <NavItem 
              icon={<MessageSquare size={18} />} 
              label="Communication" 
              active={activeTab === 'communication'} 
              onClick={() => handleNavClick('communication')} 
            />
            <div className="pt-4 pb-2 px-3 text-[10px] uppercase tracking-widest text-gray-500 font-semibold">System</div>
            <NavItem 
              icon={<Settings size={18} />} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => handleNavClick('settings')} 
            />
          </>
        )}
      </nav>

      <div className="p-4 border-t border-[#2D2E32]">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold">
            {(user.name || user.email || 'A').charAt(0)}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user.name || user.email || 'Admin'}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{user.role}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
