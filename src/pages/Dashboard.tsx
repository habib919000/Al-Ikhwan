import React from 'react';
import { 
  Users, 
  Wallet, 
  Calendar, 
  AlertCircle, 
  Plus, 
  MessageSquare 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { StatCard } from '../components/ui/StatCard';
import { ActionButton } from '../components/ui/ActionButton';
import { ActivityItem } from '../components/ui/ActivityItem';
import { DashboardStats } from '../types';
import { formatCurrency } from '../lib/utils';

interface DashboardProps {
  stats: DashboardStats | null;
  onAddMember: () => void;
  onRecordPayment: () => void;
  onScheduleEvent: () => void;
  onSendAnnouncement: () => void;
}

export function Dashboard({ 
  stats, 
  onAddMember, 
  onRecordPayment, 
  onScheduleEvent, 
  onSendAnnouncement 
}: DashboardProps) {
  if (!stats) return null;

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Members" 
          value={stats.totalMembers.toString()} 
          icon={<Users className="text-blue-500" />} 
          trend="+12 this month" 
          trendUp 
        />
        <StatCard 
          title="Monthly Collection" 
          value={formatCurrency(stats.monthlyCollection)} 
          icon={<Wallet className="text-indigo-500" />} 
          trend="+8.2% vs last month" 
          trendUp 
        />
        <StatCard 
          title="Pending Dues" 
          value={formatCurrency(stats.pendingDues)} 
          icon={<AlertCircle className="text-amber-500" />} 
          trend="-4.1% vs last month" 
          trendUp={false} 
        />
        <StatCard 
          title="Upcoming Events" 
          value={stats.upcomingEvents.toString()} 
          icon={<Calendar className="text-purple-500" />} 
          trend="Next: Eid Gathering" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold">Financial Overview</h3>
            <select className="text-xs border-gray-200 rounded-md bg-gray-50 px-2 py-1">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.chartData}>
                <defs>
                  <linearGradient id="colorCollection" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B'}} tickFormatter={(v) => `৳${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(v: number) => [formatCurrency(v), '']}
                />
                <Area type="monotone" dataKey="collection" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCollection)" />
                <Area type="monotone" dataKey="expenses" stroke="#EF4444" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-base font-bold mb-6">Quick Actions</h3>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <ActionButton onClick={onAddMember} icon={<Plus size={18} />} label="Add Member" color="bg-blue-50 text-blue-600" />
            <ActionButton onClick={onRecordPayment} icon={<Wallet size={18} />} label="Payment" color="bg-indigo-50 text-indigo-600" />
            <ActionButton onClick={onScheduleEvent} icon={<Calendar size={18} />} label="Event" color="bg-purple-50 text-purple-600" />
            <ActionButton onClick={onSendAnnouncement} icon={<MessageSquare size={18} />} label="Broadcast" color="bg-amber-50 text-amber-600" />
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Recent Activity</h4>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <ActivityItem 
                  key={activity.id}
                  title={activity.title} 
                  desc={activity.desc} 
                  time={new Date(activity.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
