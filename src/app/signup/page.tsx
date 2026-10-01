'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Car, Check, Lock, Mail, MapPin, Phone, Shield, User } from 'lucide-react';
import { setClientSession } from '@/lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    city: 'Pune',
    preferredCity: 'Pune',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.mobile)) {
      setError('Mobile must be a valid 10-digit Indian phone number.');
      return;
    }

    if (formData.password.length < 8 || !/\d/.test(formData.password) || !/[a-zA-Z]/.test(formData.password)) {
      setError('Password must be at least 8 characters with at least 1 letter and 1 number.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setIsLoading(false);

      if (data.data) {
        setClientSession(data.data);
        router.push('/onboarding/vehicle');
      } else {
        setError(data.error || 'Failed to create account.');
      }
    } catch {
      setIsLoading(false);
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-mesh">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <a href="/" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">
              Auto<span className="text-[#0B5CFF]">Ping</span>
            </span>
          </a>
          <h2 className="text-xl font-bold text-slate-900">Create an Account</h2>
          <p className="text-xs text-slate-500 mt-1">Start tracking maintenance and booking slots</p>
        </div>

        <div className="glass-card p-6 sm:p-8 border border-white shadow-xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shreyas Patil"
                  className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="shreyas@example.com"
                  className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mobile (+91)</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full bg-white/90 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred City</label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={formData.preferredCity}
                    onChange={(e) => setFormData({ ...formData, preferredCity: e.target.value, city: e.target.value })}
                    className="w-full bg-white/90 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="Pune">Pune</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Delhi">Delhi NCR</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 characters (letters + numbers)"
                  className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:opacity-95 transition-opacity flex items-center justify-center gap-2 mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Continue to Add Vehicle'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{' '}
            <a href="/login" className="font-bold text-blue-600 hover:underline">
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
