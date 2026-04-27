"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple demo authentication
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('isAdminAuthenticated', 'true');
      toast.success('Login successful');
      router.push('/admin');
    } else {
      toast.error('Invalid credentials');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-xl border border-gray-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 font-serif">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-500">Please sign in to manage your store</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 w-full bg-gray-50 border-none rounded-xl py-3 focus:ring-2 focus:ring-primary-500"
                  placeholder="admin"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full bg-gray-50 border-none rounded-xl py-3 focus:ring-2 focus:ring-primary-500"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-bold rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-lg"
          >
            {loading ? 'Authenticating...' : (
              <>
                Sign In
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
