'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Car,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { DEMO_ADMIN_USER, DEMO_CUSTOMER_USER, setClientSession } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('User@gmail.com');
  const [password, setPassword] = useState('Demo@1234');
  const [showPassword, setShowPassword] = useState(false);
  const [userRole, setUserRole] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = identifier.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanId);
    const isMobile = /^[6-9]\d{9}$/.test(cleanId) || cleanId === '123456789';

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
        body: JSON.stringify({ identifier: cleanId, password, role: userRole }),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.data) {
        setClientSession(data.data);
        router.push(userRole === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError(data.error || 'Unable to sign in. Please check your details and try again.');
      }
    } catch {
      setIsLoading(false);
      setError('Unable to connect. Please try again.');
    }
  };

  const handleDemoLogin = (role: 'CUSTOMER' | 'ADMIN') => {
    if (role === 'CUSTOMER') {
      setIdentifier('User@gmail.com');
      setPassword('Demo@1234');
      setUserRole('CUSTOMER');
      setClientSession(DEMO_CUSTOMER_USER);
      router.push('/dashboard');
    } else {
      setIdentifier('admin@autoping.in');
      setPassword('Admin@1234');
      setUserRole('ADMIN');
      setClientSession(DEMO_ADMIN_USER);
      router.push('/admin');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-[#0A0A0C] text-white selection:bg-blue-500 selection:text-white antialiased">
      {/* Apple-style Dynamic Ambient Light Radiance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Iris Aura */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        {/* Soft Cobalt Aura */}
        <div className="absolute top-1/2 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-500/15 blur-[160px] animate-pulse" style={{ animationDuration: '10s' }} />
        {/* Warm Specular Core */}
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        {/* Ambient Subtle Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="w-full max-w-[440px] relative z-10 flex flex-col items-center">
        {/* APPLE-STYLE METALLIC BRAND GRAPHIC & LOGO */}
        <div className="flex flex-col items-center text-center mb-7 group">
          {/* Futuristic Metallic Orb with Ping Wavefront */}
          <div className="relative mb-4">
            {/* Ambient specular bloom */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-blue-600 to-cyan-400 blur-xl opacity-40 group-hover:opacity-75 transition-opacity duration-700" />
            
            {/* Apple Metallic Badge Container */}
            <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-b from-white/20 via-white/5 to-white/0 p-[1.5px] shadow-2xl backdrop-blur-2xl">
              <div className="w-full h-full rounded-[22px] bg-gradient-to-b from-[#1E2330] via-[#10141D] to-[#0A0D14] flex items-center justify-center relative overflow-hidden">
                {/* Specular Light Sweep animation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                {/* Animated Pulsing Wavefront Rings */}
                <span className="absolute w-12 h-12 rounded-full border border-blue-400/30 animate-ping opacity-30" style={{ animationDuration: '3s' }} />
                <span className="absolute w-16 h-16 rounded-full border border-cyan-400/20 animate-ping opacity-20" style={{ animationDuration: '4s' }} />

                {/* SVG Brand Car Emblem */}
                <svg className="w-10 h-10 text-white relative z-10 drop-shadow-[0_4px_12px_rgba(59,130,246,0.6)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2 10.9 2 11.2 2 11.5V16c0 .6.4 1 1 1h2" />
                  <circle cx="7" cy="17" r="2" />
                  <path d="M9 17h6" />
                  <circle cx="17" cy="17" r="2" />
                  {/* Ping Wi-Fi waves emitting from roof */}
                  <path d="M9 4a4 4 0 0 1 6 0" stroke="url(#logoGlow)" strokeWidth="2" />
                  <path d="M7 2a8 8 0 0 1 10 0" stroke="url(#logoGlow)" strokeWidth="1.5" strokeDasharray="2 2" />
                  <defs>
                    <linearGradient id="logoGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#818CF8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white flex items-center gap-1.5">
            Auto<span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">Ping</span> ID
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs font-normal">
            The intelligent telemetry platform for your connected automobile.
          </p>
        </div>

        {/* GLASSMORHPIC FROSTED CARD */}
        <div className="w-full relative rounded-[32px] bg-white/[0.04] border border-white/[0.12] backdrop-blur-3xl shadow-[0_32px_64px_rgba(0,0,0,0.6)] p-7 sm:p-8">
          {/* Subtle Inner Glass Highlight */}
          <div className="absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* Quick Demo 1-Click Access Pill */}
          <div className="mb-6 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-white">Instant Demo Access</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Explore pre-seeded garage &amp; AI logs</p>
            </div>
            <button
              type="button"
              onClick={() => handleDemoLogin('CUSTOMER')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              1-Click
            </button>
          </div>

          {/* Role Pill Switch */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-black/40 border border-white/[0.06] mb-5">
            <button
              type="button"
              onClick={() => setUserRole('CUSTOMER')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                userRole === 'CUSTOMER'
                  ? 'bg-white/15 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Vehicle Owner
            </button>
            <button
              type="button"
              onClick={() => setUserRole('ADMIN')}
              className={`py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                userRole === 'ADMIN'
                  ? 'bg-white/15 text-white shadow-sm border border-white/10'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Workshop / Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="User@gmail.com or 123456789"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  Password
                </label>
                <a href="#" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 active:scale-[0.99] font-semibold text-sm shadow-xl shadow-white/10 flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Signing in securely...</span>
              ) : (
                <>
                  <span>Sign In with AutoPing ID</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Security Footer */}
          <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              End-to-End Encrypted
            </span>
            <a href="/" className="hover:text-white transition-colors">
              Return Home
            </a>
          </div>
        </div>

        {/* Apple-style Footer disclaimer */}
        <p className="text-[11px] text-slate-500 mt-6 text-center">
          Designed with precision in California &amp; Pune • AutoPing ID v2.4
        </p>
      </div>
    </div>
  );
}
