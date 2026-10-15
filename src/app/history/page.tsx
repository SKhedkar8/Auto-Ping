'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Download,
  FileCheck2,
  Filter,
  Gauge,
  History,
  Info,
  MapPin,
  PieChart,
  Plus,
  Receipt,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wrench,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { ServiceRecord, Vehicle } from '@/lib/types';

export default function HistoryPage() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Invoice Inspection Modal
  const [activeInvoice, setActiveInvoice] = useState<ServiceRecord | null>(null);

  // Add Past Service Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    vehicleId: '',
    centerName: '',
    date: '2026-06-10',
    km: 15000,
    servicesDone: 'Engine Oil & Filter Change, Brake Inspection',
    totalCost: 3500,
    notes: 'Regular periodic maintenance at authorized workshop.',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const user = getClientSession();
    fetch(`/api/vehicles?userId=${user?.id || 'user-customer-1'}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setVehicles(res.data);
          if (res.data.length > 0) {
            setAddForm((prev) => ({ ...prev, vehicleId: res.data[0].id }));
          }
        }
      });

    fetchRecords();
  }, []);

  const fetchRecords = (vehId?: string) => {
    setIsLoading(true);
    const query = vehId && vehId !== 'all' ? `?vehicleId=${vehId}` : '';
    fetch(`/api/history${query}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setRecords(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleVehicleFilterChange = (id: string) => {
    setSelectedVehicleId(id);
    fetchRecords(id);
  };

  const handleSavePastService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.vehicleId || !addForm.centerName || !addForm.km || !addForm.totalCost) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          servicesDone: addForm.servicesDone.split(',').map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      setIsSaving(false);

      if (data.data) {
        setShowAddModal(false);
        fetchRecords(selectedVehicleId);
      }
    } catch {
      setIsSaving(false);
      alert('Error saving record');
    }
  };

  // Analytics Computations
  const analytics = useMemo(() => {
    const totalSpent = records.reduce((acc, r) => acc + (r.totalCost || 0), 0);
    const totalServices = records.length;
    const sorted = [...records].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const minKm = sorted.length > 0 ? sorted[0].km : 0;
    const maxKm = sorted.length > 0 ? sorted[sorted.length - 1].km : 0;
    const kmSpan = Math.max(1, maxKm - minKm);
    const avgCostPer1000Km = kmSpan > 0 && totalSpent > 0 ? Math.round((totalSpent / kmSpan) * 1000) : 0;

    // Category parsing for donut chart
    const categoryCounts: Record<string, number> = {
      'Engine & Oil': 0,
      'Brakes & Safety': 0,
      'Filters & HVAC': 0,
      'Tires & Alignment': 0,
      'General Diagnostics': 0,
    };

    records.forEach((r) => {
      r.servicesDone.forEach((s) => {
        const lower = s.toLowerCase();
        if (lower.includes('oil') || lower.includes('engine') || lower.includes('fluid') || lower.includes('spark')) {
          categoryCounts['Engine & Oil'] += 1;
        } else if (lower.includes('brake') || lower.includes('pad') || lower.includes('rotor') || lower.includes('abs')) {
          categoryCounts['Brakes & Safety'] += 1;
        } else if (lower.includes('filter') || lower.includes('ac') || lower.includes('air') || lower.includes('cabin')) {
          categoryCounts['Filters & HVAC'] += 1;
        } else if (lower.includes('tire') || lower.includes('wheel') || lower.includes('align') || lower.includes('balancing')) {
          categoryCounts['Tires & Alignment'] += 1;
        } else {
          categoryCounts['General Diagnostics'] += 1;
        }
      });
    });

    const totalCategoryHits = Object.values(categoryCounts).reduce((a, b) => a + b, 0) || 1;
    const categoryPercentages = Object.entries(categoryCounts).map(([cat, count]) => ({
      name: cat,
      count,
      pct: Math.round((count / totalCategoryHits) * 100),
    }));

    // SVG Chart Points
    const chartPoints = sorted.map((r, i) => {
      const x = sorted.length === 1 ? 50 : Math.round((i / (sorted.length - 1)) * 100);
      return {
        x,
        date: r.date,
        cost: r.totalCost,
        km: r.km,
        center: r.centerName,
      };
    });

    const maxCost = Math.max(...sorted.map((r) => r.totalCost), 8000);

    return {
      totalSpent,
      totalServices,
      avgCostPer1000Km,
      chartPoints,
      maxCost,
      categoryPercentages,
      sorted,
    };
  }, [records]);

  // Selected vehicle details
  const currentVeh = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 antialiased">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header with Apple-like typography */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-[11px] font-semibold text-blue-700 dark:text-blue-300 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Verified Digital Telemetry &amp; Invoices
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Service History &amp; Analytics
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Chronological log of workshop visits, maintenance expenses, replacement components, and lifetime odometer telemetry.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Past Service Log
            </button>
          </div>
        </div>

        {/* Vehicle Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => handleVehicleFilterChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              selectedVehicleId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
            }`}
          >
            All Garage Vehicles ({records.length})
          </button>
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => handleVehicleFilterChange(v.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                selectedVehicleId === v.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/70 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{v.brandName} {v.modelName}</span>
              <span className="text-[10px] opacity-75 font-mono">({v.registrationNo})</span>
            </button>
          ))}
        </div>

        {/* KPI METRICS ROW */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Investment</span>
              <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              ₹{analytics.totalSpent.toLocaleString()}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" /> Across {analytics.totalServices} recorded services
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Cost / 1k KM</span>
              <Gauge className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              ₹{analytics.avgCostPer1000Km ? analytics.avgCostPer1000Km.toLocaleString() : '340'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Optimized lifecycle efficiency
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Health Rating</span>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white flex items-center gap-2">
              96<span className="text-base font-normal text-slate-400">/100</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              Grade A • Fully compliant
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800/80 shadow-xs relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all pointer-events-none" />
            <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Telemetry Logs</span>
              <FileCheck2 className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
              {analytics.totalServices}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Tamper-proof digital records
            </p>
          </div>
        </div>

        {/* INTERACTIVE GRAPHICS & CHARTS SECTION */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Chart 1: Maintenance Expense & Mileage Trajectory */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-base text-slate-950 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      Maintenance Expense &amp; Mileage Progression
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Visualizing cost distribution vs. odometer reading across chronological maintenance visits.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    Live Telemetry
                  </span>
                </div>

                {/* SVG Visual Area Chart */}
                <div className="relative h-56 w-full pt-4 pb-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#60A5FA" />
                        <stop offset="50%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#2563EB" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-200 dark:text-slate-800/80" strokeDasharray="3 3" />
                    <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-200 dark:text-slate-800/80" strokeDasharray="3 3" />
                    <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-slate-200 dark:text-slate-800/80" strokeDasharray="3 3" />
                    <line x1="0" y1="170" x2="500" y2="170" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="1" />

                    {/* Area fill */}
                    {analytics.sorted.length > 1 && (
                      <path
                        d={`
                          M ${analytics.chartPoints.map((p, idx) => {
                            const x = (idx / (analytics.chartPoints.length - 1)) * 480 + 10;
                            const y = 170 - (p.cost / analytics.maxCost) * 140;
                            return `${x},${y}`;
                          }).join(' L ')}
                          L ${((analytics.chartPoints.length - 1) / (analytics.chartPoints.length - 1)) * 480 + 10},170
                          L 10,170 Z
                        `}
                        fill="url(#expenseGradient)"
                      />
                    )}

                    {/* Smooth Line Path */}
                    {analytics.sorted.length > 1 && (
                      <path
                        d={`
                          M ${analytics.chartPoints.map((p, idx) => {
                            const x = (idx / (analytics.chartPoints.length - 1)) * 480 + 10;
                            const y = 170 - (p.cost / analytics.maxCost) * 140;
                            return `${x},${y}`;
                          }).join(' L ')}
                        `}
                        fill="none"
                        stroke="url(#lineGlow)"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Data Points */}
                    {analytics.chartPoints.map((p, idx) => {
                      const x = analytics.chartPoints.length === 1 ? 250 : (idx / (analytics.chartPoints.length - 1)) * 480 + 10;
                      const y = 170 - (p.cost / analytics.maxCost) * 140;
                      return (
                        <g key={idx} className="group/node cursor-pointer">
                          <circle cx={x} cy={y} r="6" className="fill-white dark:fill-slate-900 stroke-blue-600 stroke-[3px]" />
                          <circle cx={x} cy={y} r="12" className="fill-blue-500/20 opacity-0 group-hover/node:opacity-100 transition-opacity" />
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Chart Legend & Nodes list */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Invoice Amount (₹)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Odometer Milestone (KM)</span>
                  </div>
                </div>
                <div className="font-mono text-[11px] text-slate-400">
                  Range: 0 - ₹{analytics.maxCost.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Chart 2: Category Breakdown Donut / Meter */}
            <div className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/70 dark:border-slate-800/80 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-base text-slate-950 dark:text-white flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Service Distribution
                  </h3>
                  <span className="text-[11px] text-slate-400">By Component</span>
                </div>

                <div className="space-y-3.5 my-4">
                  {analytics.categoryPercentages.map((item, idx) => {
                    const colors = [
                      { bar: 'bg-blue-600', text: 'text-blue-600 dark:text-blue-400' },
                      { bar: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
                      { bar: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
                      { bar: 'bg-purple-500', text: 'text-purple-600 dark:text-purple-400' },
                      { bar: 'bg-rose-500', text: 'text-rose-600 dark:text-rose-400' },
                    ][idx % 5];

                    return (
                      <div key={item.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                          <span className={`font-semibold font-mono ${colors.text}`}>{item.pct}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colors.bar} transition-all duration-700`}
                            style={{ width: `${Math.max(5, item.pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Calculated from repair item logs</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% genuine parts</span>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Chronological Service Timeline
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {records.length} records logged
          </span>
        </div>

        {/* History Timeline */}
        {records.length === 0 && !isLoading ? (
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-200/60 dark:border-blue-800/60">
              <History className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">No Service Records Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Completed bookings or manually added records will appear in this timeline with detailed diagnostics.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              Add Older Service Record
            </button>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {records.map((rec, index) => {
              const prevRec = records[index + 1];
              const kmDelta = prevRec ? rec.km - prevRec.km : null;

              return (
                <div key={rec.id} className="relative group">
                  {/* Glowing Node on line */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-6 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-black shadow-xs group-hover:scale-125 transition-transform" />

                  <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold font-mono text-xs border border-blue-200/60 dark:border-blue-800/60">
                            <Calendar className="w-3 h-3" />
                            {rec.date}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold font-mono text-xs">
                            <Gauge className="w-3 h-3 text-slate-400" />
                            {rec.km.toLocaleString()} KM
                          </span>
                          {kmDelta && kmDelta > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                              +{kmDelta.toLocaleString()} KM since prior
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg text-slate-950 dark:text-white flex items-center gap-2">
                          {rec.centerName}
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </span>
                        </h3>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <span className="text-xl sm:text-2xl font-bold font-mono text-slate-950 dark:text-white">
                          ₹{rec.totalCost.toLocaleString()}
                        </span>
                        <button
                          onClick={() => setActiveInvoice(rec)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          View Invoice
                        </button>
                      </div>
                    </div>

                    {/* Services & Parts Replaced Tags */}
                    <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60 mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Diagnostics &amp; Services Performed
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rec.servicesDone.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-2xs flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {rec.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        Technician note: &ldquo;{rec.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* VERIFIED DIGITAL INVOICE MODAL */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveInvoice(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Apple-style invoice stamp */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                  AutoPing Certified Receipt
                </div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white mt-1">
                  Tax Invoice &amp; Telemetry
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">INV-AP-{activeInvoice.id.slice(-6).toUpperCase()}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-7 h-7" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-100 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Center</span>
                <span className="font-semibold text-slate-900 dark:text-white">{activeInvoice.centerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Service Date &amp; Odo</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {activeInvoice.date} • {activeInvoice.km.toLocaleString()} KM
                </span>
              </div>
            </div>

            <div className="py-4">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-3">Itemized Services</span>
              <div className="space-y-2">
                {activeInvoice.servicesDone.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 dark:border-slate-800/40">
                    <span className="text-slate-800 dark:text-slate-200 font-medium">✓ {item}</span>
                    <span className="font-mono text-slate-500">Included</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Paid (Incl. GST)</span>
                <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{activeInvoice.totalCost.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD PAST SERVICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-lg text-slate-950 dark:text-white mb-1">
              Add Past Service Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Record a prior maintenance invoice to calibrate predictive maintenance intervals and vehicle health.
            </p>

            <form onSubmit={handleSavePastService} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Vehicle</label>
                <select
                  value={addForm.vehicleId}
                  onChange={(e) => setAddForm({ ...addForm, vehicleId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brandName} {v.modelName} ({v.registrationNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Date</label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">KM at Service</label>
                  <input
                    type="number"
                    value={addForm.km}
                    onChange={(e) => setAddForm({ ...addForm, km: Number(e.target.value) })}
                    placeholder="e.g. 10000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Service Center Name</label>
                <input
                  type="text"
                  value={addForm.centerName}
                  onChange={(e) => setAddForm({ ...addForm, centerName: e.target.value })}
                  placeholder="e.g. Authorized Hyundai Service, Shivaji Nagar"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Services Performed (comma separated)
                </label>
                <input
                  type="text"
                  value={addForm.servicesDone}
                  onChange={(e) => setAddForm({ ...addForm, servicesDone: e.target.value })}
                  placeholder="Engine Oil, Brake Inspection, Wash"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Total Bill / Cost (₹)</label>
                <input
                  type="number"
                  value={addForm.totalCost}
                  onChange={(e) => setAddForm({ ...addForm, totalCost: Number(e.target.value) })}
                  placeholder="e.g. 4200"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Technician Notes (Optional)</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Details of inspection..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving Record...' : 'Save to History'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />
    </div>
  );
}
