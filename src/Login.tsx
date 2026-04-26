import React, { useState } from 'react';
import { setToken } from './lib/api';

export default function Login({ onLogin }: { onLogin: (userData: any) => void }) {
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
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div>
          <div className="mx-auto h-12 w-12 bg-emerald-500 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-md">
            AI
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Al-Ikhwan Management
          </h2>
          <div className="mt-4 flex p-1 bg-gray-100 rounded-lg">
            <button 
              onClick={() => { setMode('admin'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'admin' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Admin Portal
            </button>
            <button 
              onClick={() => { setMode('member'); setError(''); }}
              className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'member' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Member Portal
            </button>
          </div>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg font-medium">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm space-y-4">
            {mode === 'admin' ? (
              <div>
                <label className="sr-only">Email address</label>
                <input
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label className="sr-only">Membership ID</label>
                <input
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                  placeholder="Membership ID (e.g., IK-001)"
                  value={membershipId}
                  onChange={(e) => setMembershipId(e.target.value)}
                />
              </div>
            )}
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg"
            >
              {loading ? 'Signing in...' : `Enter ${mode === 'admin' ? 'Admin' : 'Member'} Portal`}
            </button>
          </div>
          {mode === 'member' && (
            <p className="text-center text-xs text-gray-500">
              Default password is <strong>member123</strong>
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
