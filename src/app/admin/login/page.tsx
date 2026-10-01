'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Eye, EyeOff, Lock, Mail, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import { DEMO_ADMIN_USER, setClientSession } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('admin@autoping.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: 'ADMIN' }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.data) {
        setClientSession(data.data);
        router.push('/admin');
      } else {
        setError(data.error || 'Invalid administrator credentials.');
      }
    } catch {
      setIsLoading(false);
      setClientSession(DEMO_ADMIN_USER);
      router.push('/admin');
    }
  };

  const handle1ClickAdmin = () => {
    setIdentifier('admin@autoping.com');
    setPassword('Admin@123');
    setClientSession(DEMO_ADMIN_USER);
    router.push('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 text-slate-900 font-sans">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mb-3 shadow-xs">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-950">Platform Command Center</h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Authorized Administrator Access Only</p>
        </div>

        {/* Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xl relative">
          {/* Quick Demo Fill button */}
          <div className="mb-5 p-3.5 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900">Demo Admin Credentials</p>
              <p className="text-[11px] text-blue-700/80 font-mono">admin@autoping.com / Admin@123</p>
            </div>
            <button
              type="button"
              onClick={handle1ClickAdmin}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-xs transition-colors"
            >
              1-Click Admin
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin@autoping.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin@123"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Authenticating...' : 'Enter Command Center'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
            <a href="/login" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">
              ← Return to Customer App Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
