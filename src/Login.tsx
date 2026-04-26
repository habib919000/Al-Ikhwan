import React, { useState } from 'react';
import { setToken } from './lib/api';

export default function Login({ onLogin, onBack }: { onLogin: (userData: any) => void, onBack?: () => void }) {
  const [mode, setMode] = useState<'admin' | 'member'>('admin');
  const [email, setEmail] = useState('');
  const [membershipId, setMembershipId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const body = mode === 'admin' 
      ? { email, password } 
      : { membershipId, password };

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid credentials');
      }

      const data = await res.json();
      setToken(data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative">
        {onBack && (
          <button 
            onClick={onBack}
            className="absolute top-6 left-6 p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider">
              <span>← Back</span>
            </div>
          </button>
        )}
        
        <div className="pt-4">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-indigo-100">
            AI
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight">
            Al-Ikhwan
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">Welcome back! Please sign in to continue.</p>
          
          <div className="mt-8 flex p-1.5 bg-slate-100 rounded-xl">
            <button 
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'admin' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Admin Portal
            </button>
            <button 
              onClick={() => { setMode('member'); setError(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === 'member' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Member Portal
            </button>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-xs text-center bg-red-50 p-4 rounded-xl font-bold border border-red-100 animate-in shake duration-300">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {mode === 'admin' ? (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email address</label>
                <input
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                  placeholder="admin@alikhwan.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Membership ID</label>
                <input
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                  placeholder="e.g. IK-001"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3.5 bg-slate-50 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-[0.98]"
            >
              {loading ? 'Signing in...' : `Enter ${mode === 'admin' ? 'Admin' : 'Member'} Portal`}
            </button>
          </div>
          {mode === 'member' && (
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider rounded-full border border-amber-100">
                Default password is <span className="font-black underline">member123</span>
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
