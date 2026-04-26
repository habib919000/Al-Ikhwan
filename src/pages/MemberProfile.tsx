import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  AlertCircle, 
  CheckCircle2, 
  Edit2, 
  Trash2, 
  Clock, 
  Upload, 
  FileText, 
  Download,
  Plus
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { User } from '../types';

interface MemberProfileProps {
  memberId: string;
  currentUser: User;
  onBack: () => void;
  onRecordPayment: () => void;
  onRefresh: () => void;
}

export function MemberProfile({ 
  memberId, 
  currentUser, 
  onBack, 
  onRecordPayment, 
  onRefresh 
}: MemberProfileProps) {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [filterMonth, setFilterMonth] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [uploading, setUploading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    phone: '', 
    status: '', 
    dues: 0, 
    membershipId: '', 
    joinedDate: '' 
  });

  const isAdmin = currentUser.role === 'admin';

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/members/${memberId}/profile`);
      if (!res.ok) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setProfile(data);
      if (data.member) {
        setEditForm({
          name: data.member.name,
          phone: data.member.phone,
          status: data.member.status,
          dues: data.member.dues,
          membershipId: data.member.membershipId,
          joinedDate: data.member.joinedDate || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        fetchProfile();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update member', error);
    }
  };

  const handleDeleteMember = async () => {
    if (!window.confirm('Are you sure you want to delete this member? This will also delete all their transactions and files.')) return;
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
        onBack();
      }
    } catch (error) {
      console.error('Failed to delete member', error);
    }
  };

  const handleToggleStatus = async () => {
    const newStatus = profile.member.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/members/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, status: newStatus }),
      });
      if (res.ok) {
        fetchProfile();
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [memberId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`/api/members/${memberId}/files`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileDelete = async (fileId: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const res = await fetch(`/api/files/${fileId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchProfile();
      }
    } catch (error) {
      console.error('Failed to delete file', error);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Clock className="animate-spin text-indigo-600" /></div>;
  if (!profile) return <div>Member not found</div>;

  const filteredTransactions = profile.transactions
    .filter((t: any) => {
      if (filterMonth === 'all') return true;
      const d = new Date(t.date);
      return d.getMonth() === parseInt(filterMonth);
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-xl font-bold">{profile.member.name}</h3>
            <p className="text-sm text-gray-500">Member Profile & History</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button 
            onClick={onRecordPayment}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Wallet size={16} /> Record Payment
          </button>
          {isAdmin && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleToggleStatus}
                className={cn(
                  "flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  profile.member.status === 'active' ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
              >
                {profile.member.status === 'active' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                {profile.member.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <button 
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit Member"
                >
                  <Edit2 size={20} />
                </button>
                <button 
                  onClick={handleDeleteMember}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete Member"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {/* Horizontal Header Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-700 shrink-0">
              {profile.member.name.split(' ').map((n: string) => n[0]).join('')}
            </div>
            <div>
              <h4 className="text-xl font-bold">{profile.member.name}</h4>
              <p className="text-sm text-gray-500 font-mono">{profile.member.membershipId}</p>
              <span className={cn(
                "mt-2 inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                profile.member.status === 'active' ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
              )}>
                {profile.member.status}
              </span>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6 border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 w-full">
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Phone</p>
              <p className="font-semibold text-sm">{profile.member.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider mb-1">Joined</p>
              <p className="font-semibold text-sm">{profile.member.joinedDate}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 flex">
              <button 
                onClick={() => setActiveSubTab('overview')}
                className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors", activeSubTab === 'overview' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900")}
              >
                Overview
              </button>
              <button 
                onClick={() => setActiveSubTab('deposits')}
                className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors", activeSubTab === 'deposits' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900")}
              >
                Deposit History
              </button>
              <button 
                onClick={() => setActiveSubTab('files')}
                className={cn("px-6 py-4 text-sm font-bold border-b-2 transition-colors", activeSubTab === 'files' ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-900")}
              >
                Files
              </button>
            </div>

            <div className="p-6">
              {activeSubTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Total Deposits</p>
                      <p className="text-xl font-bold text-indigo-700">{formatCurrency(profile.totalDeposits)}</p>
                    </div>
                    <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider mb-1">Amount Due</p>
                      <p className="text-xl font-bold text-red-700">{formatCurrency(profile.member.dues)}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Payment</p>
                      <p className="text-lg font-bold">
                        {profile.transactions[0] ? formatCurrency(profile.transactions[0].amount) : 'N/A'}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {profile.transactions[0] ? new Date(profile.transactions[0].date).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Payment Method</p>
                      <p className="text-lg font-bold">
                        {profile.transactions[0]?.method || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-bold mb-4">Recent Deposits</h5>
                    <div className="space-y-3">
                      {profile.transactions.slice(0, 3).map((t: any) => (
                        <div key={t.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                              <Wallet size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">Monthly Deposit</p>
                              <p className="text-[10px] text-gray-500">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-indigo-600">+{formatCurrency(t.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeSubTab === 'deposits' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex gap-2">
                      <select 
                        value={filterMonth}
                        onChange={(e) => setFilterMonth(e.target.value)}
                        className="text-xs font-semibold border border-gray-200 rounded-lg px-3 py-1.5 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="all">All Months</option>
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                          <option key={m} value={i}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{filteredTransactions.length} records found</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-wider text-gray-400 font-bold border-b border-gray-100">
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 px-4">Method</th>
                          <th className="pb-3 px-4">Status</th>
                          <th className="pb-3 pl-4 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {filteredTransactions.map((t: any) => (
                          <tr key={t.id} className="text-sm">
                            <td className="py-3 pr-4 font-medium">{new Date(t.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4 text-gray-500">{t.method || 'Cash'}</td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-full">
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 pl-4 text-right font-bold text-indigo-600">
                              {formatCurrency(t.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeSubTab === 'files' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-bold">Documents & Files</h5>
                    <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 cursor-pointer transition-colors">
                      <Upload size={16} />
                      <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile.files.length === 0 ? (
                      <div className="col-span-2 py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <FileText size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-500 font-medium">No files uploaded yet</p>
                        <p className="text-xs text-gray-400 mt-1">Upload ID proofs, payment receipts, or other docs</p>
                      </div>
                    ) : (
                      profile.files.map((file: any) => (
                        <div key={file.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gray-100 text-gray-500 rounded-lg group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                              <FileText size={20} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold truncate max-w-[150px]">{file.name}</p>
                              <p className="text-[10px] text-gray-500">{(file.size / 1024).toFixed(1)} KB • {new Date(file.uploadDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <a 
                              href={file.path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                              <Download size={16} />
                            </a>
                            <button 
                              onClick={() => handleFileDelete(file.id)}
                              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Member Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsEditModalOpen(false)}>
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-xl font-bold text-gray-900">Edit Member</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                  <Plus size={20} className="rotate-45" />
                </button>
              </div>
              <form onSubmit={handleUpdateMember} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      required
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Membership ID</label>
                    <input 
                      type="text" 
                      required
                      value={editForm.membershipId}
                      onChange={(e) => setEditForm({...editForm, membershipId: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined Date</label>
                  <input 
                    type="date" 
                    required
                    value={editForm.joinedDate}
                    onChange={(e) => setEditForm({...editForm, joinedDate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Status</label>
                    <select 
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Dues (৳)</label>
                    <input 
                      type="number" 
                      required
                      value={editForm.dues}
                      onChange={(e) => setEditForm({...editForm, dues: Number(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
}
