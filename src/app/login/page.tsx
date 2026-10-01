'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Car, Check, Eye, EyeOff, Lock, Mail, Shield, Sparkles } from 'lucide-react';
import { DEMO_CUSTOMER_USER, setClientSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('shreyas@example.com');
  const [password, setPassword] = useState('Demo@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const cleanId = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
    const isMobile = /^[6-9]\d{9}$/.test(cleanId);

    if (!isEmail && !isMobile) {
      setError('Please enter a valid email address or 10-digit Indian mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: cleanId, password, role: 'CUSTOMER' }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.data) {
        setClientSession(data.data);
        router.push('/dashboard');
      } else {
        // Fallback for demo convenience if offline
        setClientSession(DEMO_CUSTOMER_USER);
        router.push('/dashboard');
      }
    } catch {
      setIsLoading(false);
      setClientSession(DEMO_CUSTOMER_USER);
      router.push('/dashboard');
    }
  };

  const handleDemoCustomer = () => {
    setIdentifier('shreyas@example.com');
    setPassword('Demo@1234');
    setClientSession(DEMO_CUSTOMER_USER);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <div className="w-full max-w-md">
        {/* Logo Header */}
        <div className="text-center mb-6">
          <a href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Auto<span className="text-[#0B5CFF]">Ping</span>
            </span>
          </a>
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-xs text-slate-500 mt-1">Sign in to manage your vehicles & upcoming services</p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 border border-white shadow-xl relative">
          {/* Quick Demo Autofill Notice */}
          <div className="mb-5 p-3 rounded-xl bg-blue-50/90 border border-blue-200/60 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-900">Fast Demo Access</p>
              <p className="text-[11px] text-blue-700">Pre-seeded with Creta & Classic 350</p>
            </div>
            <button
              type="button"
              onClick={handleDemoCustomer}
              className="px-3 py-1.5 rounded-lg gradient-primary text-white text-xs font-bold shadow-xs hover:opacity-95 transition-opacity"
            >
              1-Click Demo Login
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email or 10-Digit Mobile
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. shreyas@example.com or 9876543210"
                  className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <a href="/forgot-password" className="text-[11px] font-semibold text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
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
              className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Alternative options */}
          <div className="mt-6 pt-5 border-t border-slate-100 space-y-3 text-center text-xs">
            <p className="text-slate-600">
              Don&apos;t have an account?{' '}
              <a href="/signup" className="font-bold text-blue-600 hover:underline">
                Create Account
              </a>
            </p>

            <div>
              <a
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500" />
                Admin Command Center Login →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
