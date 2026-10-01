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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Operations Command Center
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Real-time platform metrics, slot utilization, and garage appointment dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRunReminders}
            disabled={isRunningReminders}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            {isRunningReminders ? 'Evaluating Vehicles...' : 'Run Reminder Engine'}
          </button>
        </div>
      </div>

      {reminderStatus && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{reminderStatus}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Customers', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-600' },
          { label: 'Registered Vehicles', value: stats?.totalVehicles ?? '—', icon: Car, color: 'text-cyan-600' },
          { label: "Today's Schedule", value: stats?.todayBookings ?? '—', icon: Clock, color: 'text-amber-600' },
          { label: 'Pending Approvals', value: stats?.pendingRequests ?? '—', icon: AlertCircle, color: 'text-rose-600' },
          { label: 'Confirmed Slots', value: stats?.confirmedSlots ?? '—', icon: CheckCircle2, color: 'text-emerald-600' },
          {
            label: 'Est. GMV Volume',
            value: stats?.totalRevenue ? `₹${(stats.totalRevenue / 1000).toFixed(1)}k` : '—',
            icon: DollarSign,
            color: 'text-purple-600',
          },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Icon className={`w-4 h-4 ${item.color}`} />
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600">{item.label}</span>
              </div>
              <div className="text-2xl font-black text-slate-950">{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* TODAY'S SERVICE SCHEDULE TABLE */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-black text-base text-slate-950">Today&apos;s Service Schedule</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Live queue of vehicle drop-offs across all partner centers
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {stats?.todaySchedule?.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500 font-medium">
            No scheduled service appointments booked for today yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px] bg-slate-50/60">
                  <th className="py-2.5 px-3">Slot Time</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Vehicle</th>
                  <th className="py-2.5 px-3">Service Center</th>
                  <th className="py-2.5 px-3">Est. Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {stats?.todaySchedule?.map((booking: Booking) => (
                  <tr key={booking.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-950 whitespace-nowrap">
                      {booking.serviceTime}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <strong className="text-slate-900 block">{booking.userName}</strong>
                      <span className="text-[10px] text-slate-500 font-medium">{booking.userPhone}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="text-slate-900 font-semibold">{booking.vehicleName}</span>
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {booking.vehicleReg}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap text-slate-700 font-medium">
                      {booking.centerName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap font-black text-slate-950">
                      ₹{booking.estimatedCostMin.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          booking.status === 'CONFIRMED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : booking.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : booking.status === 'COMPLETED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-2">
                      {booking.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CONFIRMED')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] shadow-xs"
                        >
                          Confirm
                        </button>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'COMPLETED')}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] shadow-xs"
                        >
                          Complete
                        </button>
                      )}
                      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdateBookingStatus(booking.id, 'CANCELLED')}
                          className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-[10px]"
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
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Manage All Bookings
            </h4>
            <p className="text-xs text-slate-500 mt-1">Filter by date, center, or completion invoice</p>
          </div>
          <Calendar className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </a>

        <a
          href="/admin/service-centers"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Service Centers & Slots
            </h4>
            <p className="text-xs text-slate-500 mt-1">Configure daily slot capacity and working hours</p>
          </div>
          <Wrench className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </a>

        <a
          href="/admin/reports"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all flex items-center justify-between group shadow-xs"
        >
          <div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Generate & Export Reports
            </h4>
            <p className="text-xs text-slate-500 mt-1">Download CSV records of appointments and revenue</p>
          </div>
          <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </a>
      </div>
    </div>
  );
}
