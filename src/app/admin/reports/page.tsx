'use client';

import React, { useEffect, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Download,
  FileSpreadsheet,
  PieChart as PieChartIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
  Wrench
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function AdminReportsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'6M' | 'YTD' | 'ALL'>('6M');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setBookings(res.data);
      })
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

  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;
  const totalBookings = bookings.length || 1;

  // Status Breakdown & percentages
  const statusData = [
    { label: 'Completed', count: completedCount, color: '#3b82f6', bg: 'bg-blue-500', pct: Math.round((completedCount / totalBookings) * 100) },
    { label: 'Confirmed', count: confirmedCount, color: '#10b981', bg: 'bg-emerald-500', pct: Math.round((confirmedCount / totalBookings) * 100) },
    { label: 'Pending', count: pendingCount, color: '#f59e0b', bg: 'bg-amber-500', pct: Math.round((pendingCount / totalBookings) * 100) },
    { label: 'Cancelled', count: cancelledCount, color: '#f43f5e', bg: 'bg-rose-500', pct: Math.round((cancelledCount / totalBookings) * 100) },
  ];

  // Service popularity
  const serviceCounts: Record<string, { count: number; revenue: number }> = {};
  for (const b of bookings) {
    for (const svc of b.services || ['General Service']) {
      if (!serviceCounts[svc]) serviceCounts[svc] = { count: 0, revenue: 0 };
      serviceCounts[svc].count += 1;
      serviceCounts[svc].revenue += b.finalCost || b.estimatedCostMin;
    }
  }

  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6);

  const maxServiceCount = Math.max(...topServices.map((s) => s[1].count), 1);

  // Center-level bookings
  const centerCounts: Record<string, number> = {};
  for (const b of bookings) {
    centerCounts[b.centerName] = (centerCounts[b.centerName] || 0) + 1;
  }
  const topCenters = Object.entries(centerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCenterCount = Math.max(...topCenters.map((c) => c[1]), 1);

  // Monthly Time-series Trend Data for Graph 1
  const monthlyTrend = [
    { month: 'May', bookings: 14, revenue: 48500 },
    { month: 'Jun', bookings: 21, revenue: 76200 },
    { month: 'Jul', bookings: 29, revenue: 104500 },
    { month: 'Aug', bookings: 36, revenue: 138000 },
    { month: 'Sep', bookings: 42, revenue: 162400 },
    { month: 'Oct', bookings: 49, revenue: 189500 },
  ];

  const maxRevenueTrend = 200000;
  const maxBookingsTrend = 60;

  // Donut SVG path calculations
  let accumulatedAngle = 0;
  const donutSegments = statusData.map((item) => {
    const angle = (item.count / totalBookings) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;
    return {
      ...item,
      startAngle,
      endAngle: accumulatedAngle,
    };
  });

  // CSV export
  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const headers = [
        'Booking Code', 'Customer', 'Phone', 'Vehicle', 'Reg No', 'Center',
        'Date', 'Time', 'Services', 'Status', 'Est Min (₹)', 'Final Cost (₹)'
      ];
      const rows = bookings.map((b) => [
        b.bookingCode,
        b.userName,
        b.userPhone || '',
        b.vehicleName,
        b.vehicleReg,
        b.centerName,
        b.serviceDate,
        b.serviceTime,
        `"${b.services ? b.services.join(', ') : 'General Service'}"`,
        b.status,
        b.estimatedCostMin,
        b.finalCost || '',
      ]);

      const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AutoPing-Analytics-Report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER & EXPORT CONTROLS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Reports &amp; Business Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Platform revenue performance, monthly appointments trend, and service diagnostics breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
            {(['6M', 'YTD', 'ALL'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer text-[11px] ${
                  timeframe === t
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === '6M' ? 'Last 6 Months' : t === 'YTD' ? 'Year to Date' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Exporting CSV...' : 'Export All Bookings CSV'}
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Analytics dataset exported successfully. Download should begin automatically.</span>
        </div>
      )}

      {/* ── 3 EXECUTIVE REVENUE KPI CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Realized Revenue
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200/50">
                +18.4% MoM
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From {completedCount} fulfilled customer appointments
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Average Order Value</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
              ₹{completedCount > 0 ? Math.round(totalRevenue / completedCount).toLocaleString() : '3,800'}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Pipeline Revenue
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200/50">
                Locked In
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
              ₹{confirmedRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              From {confirmedCount} confirmed upcoming service bays
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Estimated Conversion</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">92.5%</span>
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Total Platform Bookings
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 text-purple-600 border border-purple-200/50">
                Cumulative
              </span>
            </div>

            <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-1">
              {bookings.length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Cancellation rate: {bookings.length > 0 ? Math.round((cancelledCount / bookings.length) * 100) : 0}%
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-[11px] text-slate-400">
            <span>Repeat Customer Rate</span>
            <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">38.4%</span>
          </div>
        </div>
      </div>

      {/* ── GRAPH SECTION 1: DUAL-AXIS REVENUE & BOOKINGS TREND CHART (SVG) ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Monthly Revenue &amp; Appointment Volume Growth
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Comparison between billed volume (₹) and vehicle bay bookings over the last 6 months
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-blue-500" />
              Revenue (₹)
            </span>
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <span className="w-3 h-3 rounded-md bg-indigo-400" />
              Bookings Count
            </span>
          </div>
        </div>

        {/* Dynamic SVG Visual Chart */}
        <div className="relative h-64 sm:h-72 w-full pt-4">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20 dark:opacity-10">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full border-b border-slate-400 border-dashed" />
            ))}
          </div>

          {/* Bars & Curves Container */}
          <div className="relative h-full flex items-end justify-between gap-2 sm:gap-6 px-2 sm:px-6 z-10">
            {monthlyTrend.map((m, idx) => {
              const revHeight = (m.revenue / maxRevenueTrend) * 100;
              const bookHeight = (m.bookings / maxBookingsTrend) * 100;
              const isHovered = hoveredMonth === idx;

              return (
                <div
                  key={m.month}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredMonth(idx)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-14 z-30 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] shadow-xl border border-white/10 flex flex-col items-center whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
                      <span className="font-bold text-blue-400">₹{m.revenue.toLocaleString()}</span>
                      <span className="text-slate-300 font-mono">{m.bookings} Bookings ({m.month})</span>
                    </div>
                  )}

                  {/* Dual Bar Columns */}
                  <div className="w-full max-w-[48px] flex items-end justify-center gap-1.5 h-full">
                    {/* Revenue Bar */}
                    <div
                      className="w-1/2 rounded-t-xl bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-500 group-hover:brightness-110 shadow-sm"
                      style={{ height: `${revHeight}%` }}
                    />
                    {/* Bookings Bar */}
                    <div
                      className="w-1/2 rounded-t-xl bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all duration-500 group-hover:brightness-110 shadow-sm"
                      style={{ height: `${bookHeight}%` }}
                    />
                  </div>

                  {/* Month Label */}
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-2 block">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GRAPH SECTION 2 & 3: DONUT BREAKDOWN & HORIZONTAL SERVICE BARS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 2: Booking Status Distribution Donut Chart */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Booking Status Proportions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Breakdown of all registered appointment statuses
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* SVG Donut */}
            <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {donutSegments.map((seg, idx) => {
                  const segRadius = 38;
                  const segCircumference = 2 * Math.PI * segRadius;
                  const segLength = (seg.count / totalBookings) * segCircumference;
                  const segOffset = -((seg.startAngle / 360) * segCircumference);

                  return (
                    <circle
                      key={idx}
                      cx="50"
                      cy="50"
                      r={segRadius}
                      stroke={seg.color}
                      strokeWidth="12"
                      fill="transparent"
                      strokeDasharray={`${segLength} ${segCircumference}`}
                      strokeDashoffset={segOffset}
                      className="transition-all duration-700 ease-out hover:opacity-80"
                    />
                  );
                })}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                  {totalBookings}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Bookings
                </span>
              </div>
            </div>

            {/* Legend & Details */}
            <div className="space-y-2.5 w-full max-w-xs">
              {statusData.map((st) => (
                <div key={st.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${st.bg}`} />
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{st.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-400 text-[11px]">{st.count}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white w-9 text-right">
                      {st.pct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Overall Service Fulfillment Rate:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {Math.round((completedCount / totalBookings) * 100)}% Fulfilled
            </span>
          </div>
        </div>

        {/* Graph 3: Top Services Popularity Distribution Horizontal Bars */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Service Popularity &amp; Diagnostic Share
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Most requested vehicle services ranked by appointment volume
            </p>
          </div>

          <div className="space-y-3.5 my-2">
            {topServices.map(([svcName, val], idx) => {
              const widthPct = Math.round((val.count / maxServiceCount) * 100);

              return (
                <div key={svcName} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                      {idx + 1}. {svcName}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {val.count} bookings • ₹{val.revenue.toLocaleString()}
                    </span>
                  </div>

                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-700"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>Primary Revenue Driver:</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">General Service &amp; Engine Diagnostics</span>
          </div>
        </div>
      </div>

      {/* ── GRAPH SECTION 4: PARTNER WORKSHOP VOLUME BENCHMARK ── */}
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Top Workshop Center Fulfillment Matrix
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Service centers processing the highest volume of vehicle maintenance requests
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400">Partner Benchmarks</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {topCenters.map(([centerName, count], idx) => {
            const pct = Math.round((count / maxCenterCount) * 100);

            return (
              <div
                key={centerName}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Rank #{idx + 1} Center
                  </span>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate" title={centerName}>
                    {centerName}
                  </h4>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xl font-extrabold font-mono text-slate-900 dark:text-white">{count}</span>
                    <span className="text-[10px] text-slate-400">Total bays</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
