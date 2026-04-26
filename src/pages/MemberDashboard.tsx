import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  FileText, 
  Download,
  Megaphone,
  Droplet
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';

interface MemberDashboardProps {
  memberData: any;
  onRefresh: () => void;
}

export function MemberDashboard({ memberData, onRefresh }: MemberDashboardProps) {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  
  if (!memberData || !memberData.member) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-medium animate-pulse">Loading your portal...</p>
      </div>
    );
  }

  const { member, transactions, files } = memberData;

  const totalDeposits = transactions
    .filter((t: any) => t.status === 'completed')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Welcome, {member.name}!</h3>
          <p className="text-sm text-gray-500">Member Portal • {member.membershipId}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Account Status</p>
            <div className="flex items-center gap-1.5">
              <div className={cn("w-2 h-2 rounded-full", member.status === 'active' ? "bg-indigo-500" : "bg-gray-400")} />
              <span className="text-sm font-bold text-gray-700 capitalize">{member.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats & Profile */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700" />
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg mb-4">
                <Wallet size={28} />
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Savings</p>
              <h4 className="text-3xl font-black text-indigo-600 mt-1">{formatCurrency(totalDeposits)}</h4>
              <div className="mt-6 p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Outstanding Dues</p>
                <p className="text-xl font-bold text-red-700">{formatCurrency(member.dues)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h5 className="text-sm font-bold text-gray-900 mb-5 flex items-center gap-2">
              <Clock size={16} className="text-indigo-500" />
              Member Information
            </h5>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Droplet size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Blood Group</p>
                  <p className="text-sm font-bold text-gray-900">{member.bloodGroup || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone</p>
                  <p className="text-sm font-bold text-gray-900">{member.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Address</p>
                  <p className="text-sm font-bold text-gray-900 line-clamp-1">{member.address || 'Not set'}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Joined Date</p>
                  <p className="text-sm font-bold text-gray-900">{member.joinedDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Transactions & Files */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 flex p-1 m-1 bg-gray-50 rounded-xl">
              <button 
                onClick={() => setActiveSubTab('overview')}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all", 
                  activeSubTab === 'overview' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                Recent Activity
              </button>
              <button 
                onClick={() => setActiveSubTab('files')}
                className={cn(
                  "flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all", 
                  activeSubTab === 'files' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
                )}
              >
                My Documents
              </button>
            </div>

            <div className="p-6">
              {activeSubTab === 'overview' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-sm font-bold">Latest Transactions</h5>
                    <span className="text-xs text-gray-400">{transactions.length} total</span>
                  </div>
                  {transactions.length === 0 ? (
                    <div className="py-12 text-center">
                      <Wallet size={48} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-gray-500 text-sm font-medium">No transactions found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {transactions.slice(0, 5).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-200 transition-colors group">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                              <Wallet size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">Monthly Contribution</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={cn(
                                  "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter",
                                  t.status === 'completed' ? "bg-indigo-100 text-indigo-700" : "bg-amber-100 text-amber-700"
                                )}>
                                  {t.status}
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium">{new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-indigo-600">+{formatCurrency(t.amount)}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{t.method || 'Cash'}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {files.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-100 rounded-2xl">
                      <FileText size={48} className="mx-auto text-gray-200 mb-3" />
                      <p className="text-sm text-gray-500 font-medium">No documents uploaded</p>
                    </div>
                  ) : (
                    files.map((file: any) => (
                      <div key={file.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 text-gray-400 rounded-xl group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate max-w-[150px]">{file.name}</p>
                            <p className="text-[10px] text-gray-400 font-medium">{(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a 
                          href={file.path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        >
                          <Download size={18} />
                        </a>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-indigo-600 p-8 rounded-2xl shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="relative flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <Megaphone size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Need support?</h4>
                <p className="text-indigo-100 text-sm mt-1">If you notice any discrepancies in your data, please contact the association secretary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
