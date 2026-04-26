import React from 'react';

export function SettingsPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Association Profile</h4>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Association Name</label>
              <input type="text" defaultValue="Al-Ikhwan Welfare Association" className="w-full text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Registration ID</label>
              <input type="text" defaultValue="RWA-2024-001" className="w-full text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase">Address</label>
            <textarea className="w-full text-sm border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" rows={3}>Sector 4, Green Valley, Hyderabad</textarea>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">Save Changes</button>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Role Management</h4>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] font-bold uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Permissions</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              <tr>
                <td className="px-6 py-4 font-bold">Admin</td>
                <td className="px-6 py-4 text-gray-500">Full Access</td>
                <td className="px-6 py-4 text-right"><button className="text-indigo-600 font-bold hover:underline">Edit</button></td>
              </tr>
              <tr>
                <td className="px-6 py-4 font-bold">Committee</td>
                <td className="px-6 py-4 text-gray-500">Events, Member View</td>
                <td className="px-6 py-4 text-right"><button className="text-indigo-600 font-bold hover:underline">Edit</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
