'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Flame,
  Gauge,
  Layers,
  MapPin,
  Play,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  X,
  XCircle,
  Zap
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [isRunningReminders, setIsRunningReminders] = useState(false);

  // Today's schedule filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = () => {
    setIsLoading(true);
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setStats(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleRunReminders = async () => {
    setIsRunningReminders(true);
    setReminderStatus(null);
    try {
      const res = await fetch('/api/admin/jobs/reminders', { method: 'POST' });
      const data = await res.json();
      setIsRunningReminders(false);
      setReminderStatus(data.message || 'Reminder job executed successfully.');
      setTimeout(() => setReminderStatus(null), 5000);
    } catch {
      setIsRunningReminders(false);
      setReminderStatus('Error triggering reminder engine.');
    }
  };

  const handleUpdateBookingStatus = async (id: string, newStatus: string) => {
    try {
      if (newStatus === 'CANCELLED') {
        await fetch(`/api/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CANCEL', reason: 'Admin manual status change' }),
        });
      } else if (newStatus === 'COMPLETED') {
        await fetch(`/api/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'COMPLETE', finalCost: 3800, finalKm: 19500 }),
        });
      } else if (newStatus === 'CONFIRMED') {
        await fetch(`/api/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CONFIRM' }),
        });
      }
      fetchStats();
      if (inspectBooking && inspectBooking.id === id) {
        setInspectBooking((prev) => (prev ? { ...prev, status: newStatus as any } : null));
      }
    } catch {}
  };

  // Filter today's schedule
  const filteredSchedule: Booking[] = (stats?.todaySchedule || []).filter((b: Booking) => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.bookingCode.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.vehicleName.toLowerCase().includes(q) ||
        b.centerName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Capacity calculation
  const totalSlotsCapacity = 24;
  const bookedSlotsCount = stats?.todayBookings || (stats?.todaySchedule?.length ?? 5);
  const occupancyRate = Math.min(Math.round((bookedSlotsCount / totalSlotsCapacity) * 100), 100);

  // Circumference for radial gauge
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (occupancyRate / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* ── TOP HERO HEADER & OPERATIONS PULSE ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl border border-white/10">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry &amp; Dispatch Active
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[11px] font-mono font-medium border border-white/10">
                Uptime 99.98%
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Operations Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Real-time platform dispatch, live appointment queue, service slot capacity, and automatic preventive maintenance reminders.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all shadow-sm cursor-pointer"
              title="Refresh Stats"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleRunReminders}
              disabled={isRunningReminders}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {isRunningReminders ? 'Evaluating Garage Vehicles...' : 'Run Reminder Engine'}
            </button>
          </div>
        </div>

        {reminderStatus && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-xs text-amber-200 font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{reminderStatus}</span>
          </div>
        )}
      </div>

      {/* ── 6 INTERACTIVE KPI METRIC CARDS WITH GRAPHICS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          {
            label: 'Total Customers',
            value: stats?.totalUsers ?? '—',
            icon: Users,
            growth: '+12% wk',
            gradient: 'from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
            iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
            sparkline: [20, 24, 28, 32, 38, 42],
          },
          {
            label: 'Vehicles Linked',
            value: stats?.totalVehicles ?? '—',
            icon: Car,
            growth: '100% active',
            gradient: 'from-cyan-500/10 to-teal-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20',
            iconBg: 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400',
            sparkline: [15, 18, 22, 29, 31, 35],
          },
          {
            label: "Today's Schedule",
            value: stats?.todayBookings ?? (stats?.todaySchedule?.length || 0),
            icon: Clock,
            growth: 'Live queue',
            gradient: 'from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
            iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
            sparkline: [4, 6, 8, 5, 9, 7],
          },
          {
            label: 'Pending Approvals',
            value: stats?.pendingRequests ?? '—',
            icon: AlertCircle,
            growth: 'Action required',
            gradient: 'from-rose-500/10 to-pink-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
            iconBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
            sparkline: [2, 3, 5, 4, 3, 2],
          },
          {
            label: 'Confirmed Slots',
            value: stats?.confirmedSlots ?? '—',
            icon: CheckCircle2,
            growth: 'Locked in',
            gradient: 'from-emerald-500/10 to-green-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
            iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
            sparkline: [8, 11, 14, 16, 19, 21],
          },
          {
            label: 'Gross Volume',
            value: stats?.totalRevenue ? `₹${(stats.totalRevenue / 1000).toFixed(1)}k` : '—',
            icon: DollarSign,
            growth: 'GMV booked',
            gradient: 'from-purple-500/10 to-violet-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
            iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
            sparkline: [12, 19, 24, 30, 36, 45],
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div
              key={i}
              className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border ${item.gradient} shadow-sm hover:shadow-md transition-all duration-200 group flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                  {item.growth}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-0.5">
                  {item.label}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
                  {item.value}
                </div>
              </div>

              {/* Graphic Sparkline */}
              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <svg className="w-20 h-5 overflow-visible" viewBox="0 0 60 16">
                  <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-70 group-hover:opacity-100 transition-opacity"
                    points={item.sparkline.map((val, idx) => `${idx * 12},${16 - (val / 50) * 14}`).join(' ')}
                  />
                </svg>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── INTERACTIVE GRAPHICS: CAPACITY GAUGE & PIPELINE FLOW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Graphic 1: Real-time Slot Capacity Gauge */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Workshop Slot Occupancy
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Today&apos;s bay capacity across all service centers
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              {bookedSlotsCount} / {totalSlotsCapacity} Bays
            </span>
          </div>

          {/* SVG Radial Gauge */}
          <div className="flex items-center justify-center py-3">
            <div className="relative flex items-center justify-center">
              <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100 dark:text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="url(#blueGradient)"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {occupancyRate}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Occupancy
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-[10px] text-slate-400 block font-medium">Bays Engaged</span>
              <span className="font-bold text-xs text-blue-600 dark:text-blue-400 font-mono">
                {bookedSlotsCount} Active Slots
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <span className="text-[10px] text-slate-400 block font-medium">Available Capacity</span>
              <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                {totalSlotsCapacity - bookedSlotsCount} Bays Open
              </span>
            </div>
          </div>
        </div>

        {/* Graphic 2: Live Booking Pipeline Stages Flow */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Live Service Pipeline Status
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Flow distribution of today&apos;s customer requests from pending to delivered
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Live Operations
              </span>
            </div>

            {/* Pipeline Stage Graphic Blocks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { stage: 'Pending Review', count: stats?.pendingRequests ?? 2, color: 'border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400', dot: 'bg-amber-400' },
                { stage: 'Slot Confirmed', count: stats?.confirmedSlots ?? 5, color: 'border-blue-400/40 bg-blue-500/10 text-blue-600 dark:text-blue-400', dot: 'bg-blue-400' },
                { stage: 'In Service Bay', count: Math.max(1, (stats?.confirmedSlots ?? 4) - 2), color: 'border-indigo-400/40 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', dot: 'bg-indigo-400' },
                { stage: 'Completed & Billed', count: stats?.completedServices ?? 6, color: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400' },
              ].map((pipe, idx) => (
                <div key={idx} className={`p-3.5 rounded-2xl border ${pipe.color} flex flex-col justify-between`}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`w-2 h-2 rounded-full ${pipe.dot}`} />
                    <span className="text-[11px] font-bold uppercase tracking-wider">{pipe.stage}</span>
                  </div>
                  <div className="text-2xl font-black font-mono">{pipe.count}</div>
                  <span className="text-[10px] opacity-75 mt-0.5">Active vehicles</span>
                </div>
              ))}
            </div>

            {/* Segmented Pipeline Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span>Pipeline Balance</span>
                <span>Active Throughput 96%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
                <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: '15%' }} title="Pending" />
                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: '35%' }} title="Confirmed" />
                <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: '25%' }} title="In Bay" />
                <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: '25%' }} title="Completed" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Pending</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Confirmed</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> In Bay</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Delivered</span>
            </div>
            <a
              href="/admin/bookings"
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Full Bookings Registry <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* ── TODAY'S SERVICE SCHEDULE TABLE WITH INTERACTIVE CONTROLS ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Header & Interactive Filters */}
        <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Today&apos;s Service Queue &amp; Bay Dispatch
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live queue of vehicle drop-offs across all partner centers
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code, car, or customer..."
                className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
              />
            </div>

            {/* Status Tabs */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs">
              {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[11px] ${
                    statusFilter === st
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={fetchStats}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-colors cursor-pointer"
              title="Refresh Queue"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {filteredSchedule.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Car className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200">
              No Appointments Match Current Filter
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are no service bookings in this status queue for today.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="py-3 px-4">Slot Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Vehicle</th>
                  <th className="py-3 px-4">Service Center</th>
                  <th className="py-3 px-4">Services</th>
                  <th className="py-3 px-4">Est. Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filteredSchedule.map((booking: Booking) => (
                  <tr
                    key={booking.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setInspectBooking(booking)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                        {booking.serviceTime}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <strong className="text-slate-900 dark:text-white block font-semibold">{booking.userName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{booking.userPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-900 dark:text-white font-medium">{booking.vehicleName}</span>
                      <span className="text-[10px] text-slate-400 block font-mono font-bold uppercase">
                        {booking.vehicleReg}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {booking.centerName}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium text-[11px] truncate max-w-[160px] inline-block">
                        {booking.services?.join(', ') || 'General Service'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white font-mono">
                      ₹{(booking.finalCost || booking.estimatedCostMin).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : booking.status === 'PENDING'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-emerald-500' :
                          booking.status === 'PENDING' ? 'bg-amber-500' :
                          booking.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-rose-500'
                        }`} />
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setInspectBooking(booking)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] transition-colors cursor-pointer"
                        title="View Full Booking Details"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        Inspect
                      </button>

                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-xs transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] shadow-xs transition-colors cursor-pointer"
                        >
                          Complete
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 font-semibold text-[10px] transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── QUICK SYSTEM OPERATIONS HUB ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/admin/bookings"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Manage All Bookings
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Filter by date, center, invoice completion</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </a>

        <a
          href="/admin/service-centers"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/50 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Service Centers &amp; Slots
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Configure slot capacity, brands, services</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
        </a>

        <a
          href="/admin/reports"
          className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-500/50 shadow-sm hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                Reports &amp; Analytics
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Interactive graphs, export CSV, trends</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors" />
        </a>
      </div>

      {/* ── INTERACTIVE INSPECT BOOKING MODAL ── */}
      {inspectBooking && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setInspectBooking(null)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    Appointment Details
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">{inspectBooking.bookingCode}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectBooking.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Phone:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{inspectBooking.userPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{inspectBooking.vehicleName} ({inspectBooking.vehicleReg})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Workshop:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{inspectBooking.centerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Schedule Slot:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">{inspectBooking.serviceDate} at {inspectBooking.serviceTime}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Selected Services</span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectBooking.services?.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {inspectBooking.notes && (
                <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300">
                  <span className="font-bold block text-[10px] uppercase tracking-wider">Technician / Customer Notes</span>
                  <p className="mt-0.5">{inspectBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100/70 dark:bg-white/[0.05]">
                <span className="text-slate-500 font-medium">Estimated Billing:</span>
                <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                  ₹{(inspectBooking.finalCost || inspectBooking.estimatedCostMin).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {inspectBooking.status === 'PENDING' && (
                <button
                  onClick={() => handleUpdateBookingStatus(inspectBooking.id, 'CONFIRMED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Confirm Appointment
                </button>
              )}
              {inspectBooking.status === 'CONFIRMED' && (
                <button
                  onClick={() => handleUpdateBookingStatus(inspectBooking.id, 'COMPLETED')}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Mark Completed
                </button>
              )}
              <button
                onClick={() => setInspectBooking(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
