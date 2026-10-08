'use client';

import React, { useEffect, useState } from 'react';
import {
  BarChart2,
  Calendar,
  Download,
  FileSpreadsheet,
  RefreshCw,
  TrendingUp,
  Users,
  Wrench
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((res) => { if (res.data) setBookings(res.data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  // Compute aggregates
  const totalRevenue = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((s, b) => s + (b.finalCost || b.estimatedCostMin), 0);

  const confirmedRevenue = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((s, b) => s + b.estimatedCostMin, 0);

  const statusBreakdown = ['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].map((st) => ({
    status: st,
    count: bookings.filter((b) => b.status === st).length,
  }));

  // Service popularity
  const serviceCounts: Record<string, number> = {};
  for (const b of bookings) {
    for (const svc of b.services) {
      serviceCounts[svc] = (serviceCounts[svc] || 0) + 1;
    }
  }
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // Center-level bookings
  const centerCounts: Record<string, number> = {};
  for (const b of bookings) {
    centerCounts[b.centerName] = (centerCounts[b.centerName] || 0) + 1;
  }
  const topCenters = Object.entries(centerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  // CSV export
  const handleExportCSV = () => {
    const headers = [
      'Booking Code', 'Customer', 'Vehicle', 'Reg No', 'Center',
      'Date', 'Time', 'Services', 'Status', 'Est Min (₹)', 'Final Cost (₹)'
    ];
    const rows = bookings.map((b) => [
      b.bookingCode,
      b.userName,
      b.vehicleName,
      b.vehicleReg,
      b.centerName,
      b.serviceDate,
      b.serviceTime,
      `"${b.services.join(', ')}"`,
      b.status,
      b.estimatedCostMin,
      b.finalCost || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AutoPing-Bookings-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Reports &amp; Analytics</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Platform-wide performance, revenue trends, and popular service diagnostics.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Export All Bookings CSV
        </button>
      </div>

      {/* Revenue KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Realized Revenue</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">₹{totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">From {bookings.filter((b) => b.status === 'COMPLETED').length} completed services</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 mb-2">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Pipeline Revenue</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">₹{confirmedRevenue.toLocaleString()}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">From {bookings.filter((b) => b.status === 'CONFIRMED').length} confirmed upcoming slots</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Bookings</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">{bookings.length}</div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Cancellation rate: {bookings.length > 0 ? Math.round((bookings.filter((b) => b.status === 'CANCELLED').length / bookings.length) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* Status Breakdown & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status breakdown bars */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-4">Booking Status Distribution</h3>
          <div className="space-y-3">
            {statusBreakdown.map(({ status, count }) => {
              const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
              const colorMap: Record<string, string> = {
                CONFIRMED: 'bg-emerald-500',
                PENDING: 'bg-amber-500',
                COMPLETED: 'bg-blue-600',
                CANCELLED: 'bg-rose-500',
                NO_SHOW: 'bg-slate-400',
              };
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{status}</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`${colorMap[status] || 'bg-slate-400'} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Services */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-4">Most Booked Services</h3>
          <div className="space-y-2.5">
            {topServices.map(([service, count], idx) => {
              const pct = bookings.length > 0 ? Math.round((count / bookings.length) * 100) : 0;
              return (
                <div key={service} className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{service}</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono ml-2">{count}x</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Service Centers Table */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider mb-3.5">Top Performing Centers by Volume</h3>
        <div className="space-y-2.5">
          {topCenters.map(([name, count], idx) => (
            <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center border border-blue-200 dark:border-blue-800">
                  #{idx + 1}
                </span>
                <span className="font-medium text-xs text-slate-900 dark:text-slate-100">{name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-slate-900 dark:text-white text-xs font-mono">{count} bookings</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Data Table Preview */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">All Booking Records ({bookings.length})</h3>
          <button
            onClick={handleExportCSV}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Download CSV
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/70 dark:bg-slate-800/40">
              <tr>
                <th className="py-2.5 px-3">Booking ID</th>
                <th className="py-2.5 px-3">Customer</th>
                <th className="py-2.5 px-3">Vehicle</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bookings.slice(0, 12).map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">{b.bookingCode}</td>
                  <td className="py-2.5 px-3 text-slate-900 dark:text-slate-100 font-semibold">{b.userName}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300">{b.vehicleName}</td>
                  <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400">{b.serviceDate}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      b.status === 'COMPLETED' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800' :
                      b.status === 'CONFIRMED' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' :
                      b.status === 'CANCELLED' ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800' :
                      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                    }`}>{b.status}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                    ₹{(b.finalCost || b.estimatedCostMin).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
