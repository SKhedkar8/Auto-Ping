'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Bell,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Flame,
  Gauge,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  Users,
  Wrench,
  XCircle
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reminderStatus, setReminderStatus] = useState<string | null>(null);
  const [isRunningReminders, setIsRunningReminders] = useState(false);

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
      }
      fetchStats();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Real-time platform metrics, slot utilization, and garage appointment dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunReminders}
            disabled={isRunningReminders}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunningReminders ? 'Evaluating Vehicles...' : 'Run Reminder Engine'}
          </button>
        </div>
      </div>

      {reminderStatus && (
        <div className="p-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-semibold flex items-center gap-2 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>{reminderStatus}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {[
          { label: 'Total Customers', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-600 dark:text-blue-400' },
          { label: 'Registered Vehicles', value: stats?.totalVehicles ?? '—', icon: Car, color: 'text-cyan-600 dark:text-cyan-400' },
          { label: "Today's Schedule", value: stats?.todayBookings ?? '—', icon: Clock, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Pending Approvals', value: stats?.pendingRequests ?? '—', icon: AlertCircle, color: 'text-rose-600 dark:text-rose-400' },
          { label: 'Confirmed Slots', value: stats?.confirmedSlots ?? '—', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400' },
          {
            label: 'Est. GMV Volume',
            value: stats?.totalRevenue ? `₹${(stats.totalRevenue / 1000).toFixed(1)}k` : '—',
            icon: DollarSign,
            color: 'text-purple-600 dark:text-purple-400',
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1.5">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{item.label}</span>
              </div>
              <div className="text-xl font-bold text-slate-900 dark:text-white font-mono">{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* TODAY'S SERVICE SCHEDULE TABLE */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Today&apos;s Service Schedule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live queue of vehicle drop-offs across all partner centers
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.todaySchedule?.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 dark:text-slate-400">
            No scheduled service appointments booked for today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/70 dark:bg-slate-800/40">
                  <th className="py-2.5 px-3">Slot Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Service Center</th>
                  <th className="py-2.5 px-3">Est. Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {stats?.todaySchedule?.map((booking: Booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {booking.serviceTime}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <strong className="text-slate-900 dark:text-slate-100 block">{booking.userName}</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{booking.userPhone}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-slate-900 dark:text-slate-100 font-medium">{booking.vehicleName}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                        {booking.vehicleReg}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {booking.centerName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-white font-mono">
                      ₹{booking.estimatedCostMin.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : booking.status === 'PENDING'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-xs transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] shadow-xs transition-colors"
                        >
                          Complete
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                          className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-slate-200 dark:border-slate-700 font-semibold text-[10px] transition-colors"
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

      {/* QUICK SYSTEM ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a
          href="/admin/bookings"
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Manage All Bookings
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Filter by date, center, or completion invoice</p>
          </div>
          <Calendar className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </a>

        <a
          href="/admin/service-centers"
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Service Centers & Slots
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Configure daily slot capacity and working hours</p>
          </div>
          <Wrench className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </a>

        <a
          href="/admin/reports"
          className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs transition-all flex items-center justify-between group"
        >
          <div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Generate & Export Reports
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Download CSV records of appointments and revenue</p>
          </div>
          <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        </a>
      </div>
    </div>
  );
}
