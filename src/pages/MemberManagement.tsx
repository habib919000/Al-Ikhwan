import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  Filter, 
  Eye, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { Member, User } from '../types';

interface MemberManagementProps {
  members: Member[];
  totalMembers: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  currentUser: User;
  onAddMember: () => void;
  onViewProfile: (id: string) => void;
  onRefresh: () => void;
}

export function MemberManagement({ 
  members, 
  totalMembers,
  currentPage,
  onPageChange,
  currentUser, 
  onAddMember, 
  onViewProfile, 
  onRefresh 
}: MemberManagementProps) {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ 
    name: '', 
    phone: '', 
    status: '', 
    dues: 0, 
    membershipId: '', 
    joinedDate: '', 
    email: '', 
    address: '', 
    bloodGroup: '' 
  });

  const isAdmin = currentUser.role === 'admin';

  const handleEditClick = (member: Member) => {
    setSelectedMember(member);
    setEditForm({
      name: member.name,
      phone: member.phone,
      status: member.status,
      dues: member.dues,
      membershipId: member.membershipId,
      joinedDate: member.joinedDate || '',
      email: member.email || '',
      address: member.address || '',
      bloodGroup: member.bloodGroup || ''
    });
    setIsEditModalOpen(true);
    setActiveDropdown(null);
  };

  const handleUpdateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    try {
      const res = await fetch(`/api/members/${selectedMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        setIsEditModalOpen(false);
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to update member', error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this member? This will also delete all their transactions and files.')) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to delete member', error);
    }
    setActiveDropdown(null);
  };

  const handleToggleStatus = async (member: Member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...member,
          status: newStatus
        }),
      });
      if (res.ok) {
        onRefresh();
      }
    } catch (error) {
      console.error('Failed to toggle status', error);
    }
    setActiveDropdown(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold">Member Directory</h3>
          <p className="text-sm text-gray-500">Manage and track all association members</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
            <Download size={16} /> Export
          </button>
          {isAdmin && (
            <button onClick={onAddMember} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Plus size={16} /> Add Member
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/50 gap-4">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-semibold flex items-center gap-2">
              <Filter size={14} /> Filter
            </button>
            <div className="hidden sm:block h-8 w-px bg-gray-200 mx-1" />
            <button className="px-3 py-1.5 text-indigo-600 text-xs font-bold border-b-2 border-indigo-600">All</button>
            <button className="px-3 py-1.5 text-gray-500 text-xs font-semibold hover:text-gray-900">Active</button>
            <button className="px-3 py-1.5 text-gray-500 text-xs font-semibold hover:text-gray-900">Pending</button>
          </div>
          <p className="text-xs text-gray-400 font-medium">Showing {members.length} of {totalMembers} members</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-gray-50/50 text-[11px] uppercase tracking-wider text-gray-500 font-bold border-b border-gray-100">
              <th className="px-6 py-4">Member Name</th>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Pending Dues</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onViewProfile(member.id)}
                    className="flex items-center gap-3 hover:text-indigo-600 transition-colors text-left group/name"
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 group-hover/name:bg-indigo-100 group-hover/name:text-indigo-700 transition-colors">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <span className="text-sm font-semibold group-hover/name:underline decoration-indigo-500/30 underline-offset-4">{member.name}</span>
                  </button>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{member.membershipId}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    member.status === 'active' ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                  )}>
                    {member.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{member.phone}</td>
                <td className="px-6 py-4">
                  <span className={cn("text-sm font-bold", member.dues > 0 ? "text-red-600" : "text-indigo-600")}>
                    {formatCurrency(member.dues)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right relative">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onViewProfile(member.id)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Eye size={16} />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === member.id ? null : member.id)}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {activeDropdown === member.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={() => onViewProfile(member.id)}
                            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <Eye size={14} /> View Profile
                          </button>
                          {isAdmin && (
                            <>
                              <div className="h-px bg-gray-100 my-1" />
                              <button 
                                onClick={() => handleEditClick(member)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <Edit2 size={14} /> Edit Member
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(member)}
                                className={cn(
                                  "w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors",
                                  member.status === 'active' ? "text-amber-600 hover:bg-amber-50" : "text-indigo-600 hover:bg-indigo-50"
                                )}
                              >
                                {member.status === 'active' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                {member.status === 'active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button 
                                onClick={() => handleDeleteMember(member.id)}
                                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={14} /> Delete Member
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
          <p className="text-xs text-gray-500">Page {currentPage} of {Math.ceil(totalMembers / 10) || 1}</p>
          <div className="flex gap-2">
            <button 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold disabled:opacity-50 hover:bg-white transition-colors"
            >
              Previous
            </button>
            <button 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= Math.ceil(totalMembers / 10)}
              className="px-3 py-1.5 border border-gray-200 rounded-md text-xs font-semibold hover:bg-white transition-colors disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
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
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input 
                    type="email" 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Blood Group</label>
                  <select 
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({...editForm, bloodGroup: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  >
                    <option value="">Select Blood Group</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
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
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Address</label>
                <textarea 
                  required
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  rows={2}
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
