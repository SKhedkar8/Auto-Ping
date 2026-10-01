'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Calendar,
  Car,
  ChevronDown,
  Clock,
  Download,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  RefreshCw,
  Shield,
  Users,
  Wrench
} from 'lucide-react';
import { DEMO_CUSTOMER_USER, getClientSession, setClientSession } from '@/lib/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    const session = getClientSession();
    // Allow admin preview
    if (session && session.role !== 'ADMIN') {
      // User is customer, but if visiting admin, offer quick switch or redirect
    }
  }, []);

  const navItems = [
    { href: '/admin', label: 'Command Center', icon: LayoutDashboard },
    { href: '/admin/bookings', label: 'All Bookings', icon: Calendar },
    { href: '/admin/service-centers', label: 'Service Centers', icon: MapPin },
    { href: '/admin/reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Admin Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold shadow-xs">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-base tracking-tight text-slate-950">
                    AutoPing <span className="text-blue-600">Admin</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                    Console
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider">
                  Platform Operations
                </span>
              </div>
            </a>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 font-semibold'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setClientSession(DEMO_CUSTOMER_USER);
                router.push('/dashboard');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Car className="w-3.5 h-3.5" />
              Switch to Customer App
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Body */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
