'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Calendar,
  Car,
  FileSpreadsheet,
  LayoutDashboard,
  MapPin,
  Moon,
  Shield,
  Sun,
} from 'lucide-react';
import { DEMO_CUSTOMER_USER, getClientSession, setClientSession } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);

  // Persist & restore theme
  useEffect(() => {
    const saved = localStorage.getItem('admin-theme');
    if (saved === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem('admin-theme', next ? 'dark' : 'light');
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { href: '/admin', label: 'Command Center', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'All Bookings', icon: Calendar },
    { href: '/admin/service-centers', label: 'Service Centers', icon: MapPin },
    { href: '/admin/reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  /* ── CSS custom-property palette ── */
  const t = isDark
    ? {
        '--abg':        '#0f1117',
        '--asurface':   '#1a1d2e',
        '--aborder':    '#2a2d3e',
        '--atext':      '#e2e8f0',
        '--amuted':     '#8892a4',
        '--astrong':    '#f1f5f9',
        '--anavbg':     '#12141f',
        '--anavborder': '#1f2235',
        '--anavact':    '#1e3a5f',
        '--anavacttxt': '#60a5fa',
        '--anavactbdr': '#2d5a9e',
        '--anavhover':  '#1e2235',
        '--abadge':     '#1e3a5f',
        '--abadgetxt':  '#60a5fa',
        '--abadgebdr':  '#2d5a9e',
        '--alogo':      '#1e3a5f',
        '--alogobdr':   '#2d5a9e',
        '--alogotxt':   '#60a5fa',
        '--abtn':       '#1e3a5f',
        '--abtntxt':    '#93c5fd',
        '--abtnbdr':    '#2d5a9e',
        '--atoggle':    '#1e3a5f',
        '--atogglebdr': '#2d5a9e',
        '--atoggletxt': '#60a5fa',
      }
    : {
        '--abg':        '#f8fafc',
        '--asurface':   '#ffffff',
        '--aborder':    '#e2e8f0',
        '--atext':      '#334155',
        '--amuted':     '#64748b',
        '--astrong':    '#0f172a',
        '--anavbg':     '#ffffff',
        '--anavborder': '#e2e8f0',
        '--anavact':    '#eff6ff',
        '--anavacttxt': '#1d4ed8',
        '--anavactbdr': '#bfdbfe',
        '--anavhover':  '#f1f5f9',
        '--abadge':     '#eff6ff',
        '--abadgetxt':  '#1d4ed8',
        '--abadgebdr':  '#bfdbfe',
        '--alogo':      '#eff6ff',
        '--alogobdr':   '#bfdbfe',
        '--alogotxt':   '#2563eb',
        '--abtn':       '#0f172a',
        '--abtntxt':    '#ffffff',
        '--abtnbdr':    'transparent',
        '--atoggle':    '#f1f5f9',
        '--atogglebdr': '#e2e8f0',
        '--atoggletxt': '#64748b',
      };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans ${isDark ? 'dark' : ''}`}
      style={{
        ...(t as React.CSSProperties),
        background: 'var(--abg)',
        color: 'var(--atext)',
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      {/* ── Admin Navbar ── */}
      <header
        className="sticky top-0 z-40 w-full backdrop-blur-md"
        style={{
          background: 'var(--anavbg)',
          borderBottom: '1px solid var(--anavborder)',
          transition: 'background 0.3s ease, border-color 0.3s ease',
          boxShadow: isDark
            ? '0 1px 0 0 rgba(255,255,255,0.04)'
            : '0 1px 3px 0 rgba(0,0,0,0.06)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

          {/* Left: Logo + Nav */}
          <div className="flex items-center gap-8">
            <a href="/admin" className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold"
                style={{
                  background: 'var(--alogo)',
                  border: '1px solid var(--alogobdr)',
                  color: 'var(--alogotxt)',
                }}
              >
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span
                    className="font-black text-base tracking-tight"
                    style={{ color: 'var(--astrong)' }}
                  >
                    AutoPing{' '}
                    <span style={{ color: 'var(--alogotxt)' }}>Admin</span>
                  </span>
                  <span
                    className="px-1.5 rounded text-[10px] font-extrabold"
                    style={{
                      background: 'var(--abadge)',
                      color: 'var(--abadgetxt)',
                      border: '1px solid var(--abadgebdr)',
                    }}
                  >
                    Console
                  </span>
                </div>
                <span
                  className="text-[10px] font-medium tracking-wider"
                  style={{ color: 'var(--amuted)' }}
                >
                  Platform Operations
                </span>
              </div>
            </a>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                    style={
                      isActive
                        ? {
                            background: 'var(--anavact)',
                            color: 'var(--anavacttxt)',
                            border: '1px solid var(--anavactbdr)',
                            fontWeight: 700,
                          }
                        : {
                            color: 'var(--amuted)',
                            border: '1px solid transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'var(--anavhover)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--astrong)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                        (e.currentTarget as HTMLElement).style.color = 'var(--amuted)';
                      }
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right: Theme toggle + Switch button */}
          <div className="flex items-center gap-3">
            {/* 🌙 / ☀️ Toggle */}
            <button
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'var(--atoggle)',
                border: '1px solid var(--atogglebdr)',
                color: 'var(--atoggletxt)',
              }}
            >
              <div
                style={{
                  transition: 'transform 0.4s ease, opacity 0.3s ease',
                  transform: isDark ? 'rotate(0deg)' : 'rotate(90deg)',
                }}
              >
                {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
            </button>

            <button
              onClick={() => {
                setClientSession(DEMO_CUSTOMER_USER);
                router.push('/dashboard');
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all duration-150 hover:opacity-80"
              style={{
                background: 'var(--abtn)',
                color: 'var(--abtntxt)',
                border: '1px solid var(--abtnbdr)',
              }}
            >
              <Car className="w-3.5 h-3.5" />
              Switch to Customer App
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
