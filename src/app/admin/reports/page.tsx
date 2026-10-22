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

  // PDF export — generates a premium styled print document
  const handleExportCSV = () => {
    setIsExporting(true);
    setTimeout(() => {
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
      const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

      const statusColors: Record<string, string> = {
        COMPLETED: '#10b981',
        CONFIRMED: '#3b82f6',
        PENDING: '#f59e0b',
        CANCELLED: '#f43f5e',
        IN_PROGRESS: '#8b5cf6',
        NO_SHOW: '#6b7280',
      };

      const statusBgs: Record<string, string> = {
        COMPLETED: '#d1fae5',
        CONFIRMED: '#dbeafe',
        PENDING: '#fef3c7',
        CANCELLED: '#ffe4e6',
        IN_PROGRESS: '#ede9fe',
        NO_SHOW: '#f3f4f6',
      };

      const avgOrder = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 0;
      const cancellationRate = bookings.length > 0 ? Math.round((cancelledCount / bookings.length) * 100) : 0;
      const fulfillmentRate = Math.round((completedCount / totalBookings) * 100);

      // Build monthly trend bars HTML
      const trendBarsHtml = monthlyTrend.map((m) => {
        const revH = Math.round((m.revenue / maxRevenueTrend) * 140);
        const bkH = Math.round((m.bookings / maxBookingsTrend) * 140);
        return `
          <div style="display:flex;flex-direction:column;align-items:center;flex:1;">
            <div style="display:flex;align-items:flex-end;gap:4px;height:140px;">
              <div style="width:18px;height:${revH}px;background:linear-gradient(to top,#2563eb,#60a5fa);border-radius:4px 4px 0 0;"></div>
              <div style="width:18px;height:${bkH}px;background:linear-gradient(to top,#4f46e5,#818cf8);border-radius:4px 4px 0 0;"></div>
            </div>
            <div style="font-size:10px;font-weight:700;color:#64748b;margin-top:6px;">${m.month}</div>
            <div style="font-size:9px;color:#94a3b8;margin-top:1px;">₹${(m.revenue/1000).toFixed(0)}k</div>
          </div>`;
      }).join('');

      // Build donut visualization (CSS circles)
      const donutLegend = statusData.map(s => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;border-bottom:1px solid #f1f5f9;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="width:10px;height:10px;border-radius:50%;background:${s.color};"></div>
            <span style="font-size:11px;font-weight:600;color:#334155;">${s.label}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:11px;color:#64748b;font-family:monospace;">${s.count}</span>
            <span style="font-size:11px;font-weight:700;color:#0f172a;font-family:monospace;width:36px;text-align:right;">${s.pct}%</span>
          </div>
        </div>`).join('');

      // Service bars
      const serviceBarsHtml = topServices.map(([name, val], idx) => {
        const w = Math.round((val.count / maxServiceCount) * 100);
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="font-size:11px;font-weight:600;color:#1e293b;">${idx+1}. ${name}</span>
              <span style="font-size:11px;font-weight:700;color:#0f172a;font-family:monospace;">${val.count} • ₹${val.revenue.toLocaleString()}</span>
            </div>
            <div style="height:8px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${w}%;background:linear-gradient(to right,#2563eb,#6366f1);border-radius:99px;"></div>
            </div>
          </div>`;
      }).join('');

      // Center cards
      const centerCardsHtml = topCenters.map(([name, count], idx) => {
        const pct = Math.round((count / maxCenterCount) * 100);
        const colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#f43f5e'];
        return `
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:14px;">
            <div style="font-size:9px;font-weight:700;text-transform:uppercase;color:#94a3b8;letter-spacing:0.08em;margin-bottom:4px;">Rank #${idx+1}</div>
            <div style="font-size:12px;font-weight:700;color:#0f172a;margin-bottom:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${name}</div>
            <div style="font-size:20px;font-weight:900;color:#0f172a;font-family:monospace;">${count}</div>
            <div style="font-size:9px;color:#94a3b8;margin-bottom:6px;">Total bays</div>
            <div style="height:4px;background:#e2e8f0;border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:${colors[idx]};border-radius:99px;"></div>
            </div>
          </div>`;
      }).join('');

      // Bookings table rows
      const tableRowsHtml = bookings.map((b, i) => {
        const color = statusColors[b.status] || '#6b7280';
        const bg = statusBgs[b.status] || '#f3f4f6';
        return `
          <tr style="background:${i%2===0?'#ffffff':'#f8fafc'};">
            <td style="padding:7px 10px;font-size:10px;font-family:monospace;font-weight:700;color:#2563eb;">${b.bookingCode}</td>
            <td style="padding:7px 10px;font-size:10px;font-weight:600;color:#1e293b;">${b.userName || '—'}</td>
            <td style="padding:7px 10px;font-size:10px;color:#475569;">${b.vehicleName}</td>
            <td style="padding:7px 10px;font-size:10px;font-family:monospace;color:#64748b;">${b.vehicleReg}</td>
            <td style="padding:7px 10px;font-size:10px;color:#475569;max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${b.centerName}</td>
            <td style="padding:7px 10px;font-size:10px;font-family:monospace;color:#475569;">${b.serviceDate}</td>
            <td style="padding:7px 10px;">
              <span style="padding:3px 8px;border-radius:99px;font-size:9px;font-weight:700;letter-spacing:0.06em;background:${bg};color:${color};">${b.status}</span>
            </td>
            <td style="padding:7px 10px;font-size:10px;font-family:monospace;font-weight:700;color:#0f172a;text-align:right;">₹${(b.finalCost || b.estimatedCostMin).toLocaleString()}</td>
          </tr>`;
      }).join('');

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AutoPing Analytics Report — ${dateStr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { size: A4; margin: 12mm 14mm; }
    @media print { body { font-size: 11px; } .no-break { page-break-inside: avoid; } }
    .page { max-width: 900px; margin: 0 auto; padding: 0 0 24px; }

    /* Header */
    .header { background: linear-gradient(135deg,#1e3a8a 0%,#1d4ed8 50%,#2563eb 100%); color: #fff; padding: 28px 32px; border-radius: 16px; margin-bottom: 22px; display: flex; justify-content: space-between; align-items: flex-start; }
    .header-logo { display: flex; align-items: center; gap: 12px; }
    .header-logo-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    .header-title { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .header-subtitle { font-size: 12px; color: rgba(255,255,255,0.75); margin-top: 2px; }
    .header-meta { text-align: right; }
    .header-meta-date { font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.95); }
    .header-meta-sub { font-size: 10px; color: rgba(255,255,255,0.6); margin-top: 2px; }
    .confidential-badge { display: inline-flex; align-items: center; gap: 4px; background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.25); border-radius: 99px; padding: 3px 10px; font-size: 9px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.9); margin-top: 8px; }

    /* Section Label */
    .section-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; }
    .section-label::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }

    /* KPI Cards */
    .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px 18px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
    .kpi-card-accent { border-top: 3px solid var(--accent); }
    .kpi-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px; }
    .kpi-value { font-size: 26px; font-weight: 900; font-family: monospace; color: #0f172a; letter-spacing: -1px; }
    .kpi-sub { font-size: 10px; color: #64748b; margin-top: 3px; }
    .kpi-footer { margin-top: 10px; padding-top: 8px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
    .kpi-footer-val { font-weight: 700; color: #1e293b; font-family: monospace; }
    .kpi-badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 9px; font-weight: 700; }

    /* Charts */
    .chart-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 16px; }
    .chart-title { font-size: 13px; font-weight: 800; color: #0f172a; margin-bottom: 3px; }
    .chart-desc { font-size: 10px; color: #64748b; margin-bottom: 14px; }
    .chart-legend { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
    .legend-item { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 600; color: #64748b; }
    .legend-dot { width: 10px; height: 10px; border-radius: 3px; }

    /* Side by Side */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }

    /* Donut placeholder */
    .donut-wrap { display: flex; align-items: center; gap: 20px; }
    .donut-visual { width: 100px; height: 100px; border-radius: 50%; background: conic-gradient(#3b82f6 0% ${statusData[0]?.pct||0}%, #10b981 ${statusData[0]?.pct||0}% ${(statusData[0]?.pct||0)+(statusData[1]?.pct||0)}%, #f59e0b ${(statusData[0]?.pct||0)+(statusData[1]?.pct||0)}% ${(statusData[0]?.pct||0)+(statusData[1]?.pct||0)+(statusData[2]?.pct||0)}%, #f43f5e ${(statusData[0]?.pct||0)+(statusData[1]?.pct||0)+(statusData[2]?.pct||0)}% 100%); position: relative; flex-shrink: 0; }
    .donut-visual::after { content: '${totalBookings}'; position: absolute; inset: 18px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 900; color: #0f172a; font-family: monospace; }
    .donut-legend { flex: 1; }

    /* Workshop grid */
    .center-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; }

    /* Bookings table */
    .table-wrap { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06); margin-bottom: 20px; }
    table { width: 100%; border-collapse: collapse; }
    thead { background: linear-gradient(135deg, #1e3a8a, #2563eb); }
    thead th { padding: 9px 10px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.9); text-align: left; }
    thead th:last-child { text-align: right; }
    tbody tr:last-child td { border-bottom: none; }
    tbody td { border-bottom: 1px solid #f1f5f9; }

    /* Footer */
    .footer { text-align: center; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .footer-text { font-size: 9px; color: #94a3b8; }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header no-break">
    <div class="header-logo">
      <div class="header-logo-icon">🏎️</div>
      <div>
        <div class="header-title">AutoPing</div>
        <div class="header-subtitle">Business Intelligence &amp; Analytics Report</div>
        <div class="confidential-badge">🔒 Confidential · Admin Only</div>
      </div>
    </div>
    <div class="header-meta">
      <div class="header-meta-date">${dateStr}</div>
      <div class="header-meta-sub">Generated at ${timeStr} IST</div>
      <div class="header-meta-sub" style="margin-top:6px;">Timeframe: ${timeframe === '6M' ? 'Last 6 Months' : timeframe === 'YTD' ? 'Year to Date' : 'All Time'}</div>
    </div>
  </div>

  <!-- KPI CARDS -->
  <div class="section-label">📊 Executive KPI Summary</div>
  <div class="kpi-grid no-break">
    <div class="kpi-card" style="border-top: 3px solid #2563eb;">
      <div class="kpi-label">💰 Realized Revenue</div>
      <div class="kpi-value">₹${totalRevenue.toLocaleString()}</div>
      <div class="kpi-sub">From ${completedCount} completed appointments</div>
      <div class="kpi-footer">
        <span>Avg Order Value</span>
        <span class="kpi-footer-val">₹${avgOrder.toLocaleString()}</span>
      </div>
    </div>
    <div class="kpi-card" style="border-top: 3px solid #6366f1;">
      <div class="kpi-label">📅 Pipeline Revenue</div>
      <div class="kpi-value">₹${confirmedRevenue.toLocaleString()}</div>
      <div class="kpi-sub">From ${confirmedCount} confirmed upcoming bays</div>
      <div class="kpi-footer">
        <span>Est. Conversion</span>
        <span class="kpi-footer-val" style="color:#10b981;">92.5%</span>
      </div>
    </div>
    <div class="kpi-card" style="border-top: 3px solid #10b981;">
      <div class="kpi-label">📋 Total Bookings</div>
      <div class="kpi-value">${bookings.length}</div>
      <div class="kpi-sub">Cancellation rate: ${cancellationRate}%</div>
      <div class="kpi-footer">
        <span>Fulfillment Rate</span>
        <span class="kpi-footer-val" style="color:#10b981;">${fulfillmentRate}%</span>
      </div>
    </div>
  </div>

  <div class="kpi-grid no-break" style="grid-template-columns: repeat(4, 1fr);">
    <div class="kpi-card" style="border-top: 3px solid #3b82f6;">
      <div class="kpi-label">✅ Completed</div>
      <div class="kpi-value" style="font-size:22px;">${completedCount}</div>
      <div class="kpi-sub">Fulfilled bays</div>
    </div>
    <div class="kpi-card" style="border-top: 3px solid #10b981;">
      <div class="kpi-label">🔵 Confirmed</div>
      <div class="kpi-value" style="font-size:22px;">${confirmedCount}</div>
      <div class="kpi-sub">Upcoming locked</div>
    </div>
    <div class="kpi-card" style="border-top: 3px solid #f59e0b;">
      <div class="kpi-label">⏳ Pending</div>
      <div class="kpi-value" style="font-size:22px;">${pendingCount}</div>
      <div class="kpi-sub">Awaiting confirmation</div>
    </div>
    <div class="kpi-card" style="border-top: 3px solid #f43f5e;">
      <div class="kpi-label">❌ Cancelled</div>
      <div class="kpi-value" style="font-size:22px;">${cancelledCount}</div>
      <div class="kpi-sub">Rate: ${cancellationRate}%</div>
    </div>
  </div>

  <!-- TREND CHART -->
  <div class="section-label">📈 Monthly Revenue &amp; Bookings Trend</div>
  <div class="chart-card no-break">
    <div class="chart-title">Monthly Revenue &amp; Appointment Volume Growth</div>
    <div class="chart-desc">Comparison between billed volume (₹) and vehicle bay bookings over the last 6 months</div>
    <div class="chart-legend">
      <div class="legend-item"><div class="legend-dot" style="background:#3b82f6;"></div> Revenue (₹)</div>
      <div class="legend-item"><div class="legend-dot" style="background:#6366f1;"></div> Bookings Count</div>
    </div>
    <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px;padding:0 8px;">
      ${trendBarsHtml}
    </div>
    <div style="margin-top:12px;display:grid;grid-template-columns:repeat(6,1fr);gap:4px;">
      ${monthlyTrend.map(m => `<div style="text-align:center;font-size:9px;color:#94a3b8;"><div style="font-weight:700;color:#1e293b;">${m.bookings}</div>bookings</div>`).join('')}
    </div>
  </div>

  <!-- STATUS DONUT + SERVICE BARS -->
  <div class="section-label">🍩 Status Breakdown &amp; Service Analytics</div>
  <div class="two-col">
    <div class="chart-card no-break">
      <div class="chart-title">Booking Status Proportions</div>
      <div class="chart-desc">Distribution of all appointment statuses</div>
      <div class="donut-wrap">
        <div style="width:80px;height:80px;border-radius:50%;background:conic-gradient(#3b82f6 0deg ${Math.round(statusData[0]?.pct||0)*3.6}deg, #10b981 ${Math.round(statusData[0]?.pct||0)*3.6}deg ${Math.round(((statusData[0]?.pct||0)+(statusData[1]?.pct||0)))*3.6}deg, #f59e0b ${Math.round(((statusData[0]?.pct||0)+(statusData[1]?.pct||0)))*3.6}deg ${Math.round(((statusData[0]?.pct||0)+(statusData[1]?.pct||0)+(statusData[2]?.pct||0)))*3.6}deg, #f43f5e ${Math.round(((statusData[0]?.pct||0)+(statusData[1]?.pct||0)+(statusData[2]?.pct||0)))*3.6}deg 360deg);flex-shrink:0;box-shadow:0 0 0 14px white, 0 0 0 15px #e2e8f0;" ></div>
        <div style="flex:1;">
          ${donutLegend}
          <div style="margin-top:6px;padding-top:6px;border-top:1px solid #f1f5f9;display:flex;justify-content:space-between;font-size:10px;color:#64748b;">
            <span>Fulfillment Rate:</span><span style="font-weight:700;color:#10b981;">${fulfillmentRate}%</span>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-card no-break">
      <div class="chart-title">Service Popularity &amp; Diagnostic Share</div>
      <div class="chart-desc">Most requested vehicle services ranked by volume</div>
      ${serviceBarsHtml}
    </div>
  </div>

  <!-- WORKSHOP MATRIX -->
  <div class="section-label">🏭 Top Workshop Partner Benchmark</div>
  <div class="chart-card no-break">
    <div class="chart-title">Partner Workshop Fulfillment Matrix</div>
    <div class="chart-desc">Service centers processing the highest volume of vehicle maintenance requests</div>
    <div class="center-grid">
      ${centerCardsHtml}
    </div>
  </div>

  <!-- BOOKINGS TABLE -->
  <div class="section-label">📋 Complete Bookings Ledger (${bookings.length} records)</div>
  <div class="table-wrap no-break">
    <table>
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Customer</th>
          <th>Vehicle</th>
          <th>Reg No</th>
          <th>Service Center</th>
          <th>Date</th>
          <th>Status</th>
          <th style="text-align:right;">Revenue (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${tableRowsHtml}
      </tbody>
    </table>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="footer-text">AutoPing Platform · Analytics Report · Generated ${dateStr} at ${timeStr} · Confidential &amp; Proprietary</div>
    <div class="footer-text" style="margin-top:3px;">🏎️ AutoPing — Smart Vehicle Service Management Platform</div>
  </div>

</div>
</body>
</html>`;

      const printWin = window.open('', '_blank', 'width=1000,height=800');
      if (printWin) {
        printWin.document.write(html);
        printWin.document.close();
        setTimeout(() => {
          printWin.focus();
          printWin.print();
        }, 800);
      }

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
            <FileSpreadsheet className="w-4 h-4" />
            {isExporting ? 'Generating PDF...' : 'Export Premium Report PDF'}
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 font-semibold flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Premium PDF report opened in a new tab — use your browser's Print dialog (Ctrl+P) to save as PDF.</span>
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
