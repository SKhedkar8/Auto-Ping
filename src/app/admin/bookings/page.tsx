'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  Filter,
  Grid,
  List,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Wrench,
  X,
  XCircle,
  FileText
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCenter, setFilterCenter] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'TABLE' | 'CARDS'>('TABLE');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [inspectBooking, setInspectBooking] = useState<Booking | null>(null);
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);
  const [finalCost, setFinalCost] = useState(4200);
  const [finalKm, setFinalKm] = useState(19500);
  const [completionNotes, setCompletionNotes] = useState('Full multi-point inspection passed.');
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setIsLoading(true);
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setBookings(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleStatusChange = async (id: string, action: string) => {
    try {
      if (action === 'CANCEL') {
        await fetch(`/api/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CANCEL', reason: 'Admin operational cancellation' }),
        });
      } else if (action === 'CONFIRM') {
        await fetch(`/api/bookings/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'CONFIRM' }),
        });
      }
      fetchBookings();
      if (inspectBooking && inspectBooking.id === id) {
        setInspectBooking(null);
      }
    } catch {}
  };

  const handleSubmitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingBooking) return;
    setIsSubmittingComplete(true);

    try {
      await fetch(`/api/bookings/${completingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'COMPLETE',
          finalCost: Number(finalCost),
          finalKm: Number(finalKm),
          servicesDone: completingBooking.services,
          notes: completionNotes,
        }),
      });
      setIsSubmittingComplete(false);
      setCompletingBooking(null);
      fetchBookings();
    } catch {
      setIsSubmittingComplete(false);
      alert('Error updating completion');
    }
  };

  // Unique centers for filter
  const centerOptions = Array.from(new Set(bookings.map((b) => b.centerName))).filter(Boolean);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filter logic
  const filtered = bookings.filter((b) => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (filterCenter !== 'ALL' && b.centerName !== filterCenter) return false;

    if (filterDate === 'TODAY' && b.serviceDate !== todayStr) return false;
    if (filterDate === 'UPCOMING' && b.serviceDate < todayStr) return false;
    if (filterDate === 'PAST' && b.serviceDate >= todayStr) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        b.bookingCode.toLowerCase().includes(q) ||
        b.userName.toLowerCase().includes(q) ||
        b.userPhone.toLowerCase().includes(q) ||
        b.vehicleName.toLowerCase().includes(q) ||
        b.vehicleReg.toLowerCase().includes(q) ||
        b.centerName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const totalRevenue = bookings
    .filter((b) => b.status === 'COMPLETED')
    .reduce((sum, b) => sum + (b.finalCost || b.estimatedCostMin), 0);
  const avgTicket = completedCount > 0 ? Math.round(totalRevenue / completedCount) : 3800;

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bookings Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Real-time appointment schedule, customer dispatch, and workshop billing records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'TABLE'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('CARDS')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
              title="Cards Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchBookings}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-sm transition-colors cursor-pointer"
            title="Refresh Bookings"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── METRIC SUMMARY TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Total Bookings
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalCount}
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">All time records</span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80 block mb-1">
            Confirmed Slots
          </span>
          <div className="text-2xl font-black font-mono">
            {confirmedCount}
          </div>
          <span className="text-[11px] opacity-75 block mt-0.5">Upcoming appointments</span>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80 block mb-1">
            Pending Review
          </span>
          <div className="text-2xl font-black font-mono">
            {pendingCount}
          </div>
          <span className="text-[11px] opacity-75 block mt-0.5">Awaiting confirmation</span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600/80 dark:text-blue-400/80 block mb-1">
            Completed Services
          </span>
          <div className="text-2xl font-black font-mono">
            {completedCount}
          </div>
          <span className="text-[11px] opacity-75 block mt-0.5">Invoiced &amp; delivered</span>
        </div>

        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600/80 dark:text-purple-400/80 block mb-1">
            Avg. Ticket Value
          </span>
          <div className="text-2xl font-black font-mono">
            ₹{avgTicket.toLocaleString()}
          </div>
          <span className="text-[11px] opacity-75 block mt-0.5">Per completed service</span>
        </div>
      </div>

      {/* ── FILTER & SEARCH TOOLBAR ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by code, customer, car model, phone, or center..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Center Filter */}
            <select
              value={filterCenter}
              onChange={(e) => setFilterCenter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Centers</option>
              {centerOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Date Quick Filter */}
            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Dates</option>
              <option value="TODAY">Today Only</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="PAST">Past Services</option>
            </select>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'ALL', label: 'All', count: bookings.length },
            { id: 'CONFIRMED', label: 'Confirmed', count: confirmedCount },
            { id: 'PENDING', label: 'Pending', count: pendingCount },
            { id: 'COMPLETED', label: 'Completed', count: completedCount },
            { id: 'CANCELLED', label: 'Cancelled', count: bookings.filter((b) => b.status === 'CANCELLED').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                filterStatus === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── CONDITIONAL VIEW: TABLE OR CARDS ── */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Bookings Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, status tabs, or service center filter.
          </p>
        </div>
      ) : viewMode === 'TABLE' ? (
        /* ── TABLE VIEW ── */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/60 dark:bg-slate-800/30">
                  <th className="py-3.5 px-4">Booking Code</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Center &amp; Schedule</th>
                  <th className="py-3.5 px-4">Services</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-700 dark:text-slate-300">
                {filtered.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    onClick={() => setInspectBooking(b)}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50">
                        {b.bookingCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <strong className="text-slate-900 dark:text-white block font-semibold">{b.userName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">{b.userPhone}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-900 dark:text-white font-medium block">{b.vehicleName}</span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold uppercase">{b.vehicleReg}</span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-700 dark:text-slate-300 font-medium block truncate max-w-[170px]">{b.centerName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {b.serviceDate} at {b.serviceTime}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[160px] inline-block">
                        {b.services?.join(', ') || 'General Service'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 dark:text-white font-mono">
                      {b.status === 'COMPLETED' && b.finalCost
                        ? `₹${b.finalCost.toLocaleString()}`
                        : `₹${b.estimatedCostMin.toLocaleString()}`}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                          b.status === 'CONFIRMED'
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                            : b.status === 'PENDING'
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                            : b.status === 'COMPLETED'
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                            : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          b.status === 'CONFIRMED' ? 'bg-emerald-500' :
                          b.status === 'PENDING' ? 'bg-amber-500' :
                          b.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-rose-500'
                        }`} />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setInspectBooking(b)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-[10px] transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-3 h-3 inline mr-1" />
                        Inspect
                      </button>

                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'CONFIRM')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] shadow-xs transition-colors cursor-pointer"
                        >
                          Confirm
                        </button>
                      )}

                      {b.status === 'CONFIRMED' && (
                        <button
                          onClick={() => {
                            setCompletingBooking(b);
                            setFinalCost(b.estimatedCostMin);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] shadow-xs transition-colors cursor-pointer"
                        >
                          Record Complete
                        </button>
                      )}

                      {b.status === 'COMPLETED' && (
                        <button
                          type="button"
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent('autoping_open_bill', {
                                detail: { bookingId: b.id, invoice: b.invoice },
                              })
                            );
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 font-semibold text-[10px] shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                          title="View Generated Tax Invoice & Bill"
                        >
                          <FileText className="w-3 h-3" />
                          Bill
                        </button>
                      )}

                      {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleStatusChange(b.id, 'CANCEL')}
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
        </div>
      ) : (
        /* ── CARDS GRID VIEW ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              onClick={() => setInspectBooking(b)}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-500/40 transition-all flex flex-col justify-between group cursor-pointer"
            >
              <div>
                {/* Card Top: Code & Status */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-mono font-bold text-xs border border-blue-200 dark:border-blue-900/40">
                    {b.bookingCode}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : b.status === 'PENDING'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                        : b.status === 'COMPLETED'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      b.status === 'CONFIRMED' ? 'bg-emerald-500' :
                      b.status === 'PENDING' ? 'bg-amber-500' :
                      b.status === 'COMPLETED' ? 'bg-blue-500' : 'bg-rose-500'
                    }`} />
                    {b.status}
                  </span>
                </div>

                {/* Customer & Vehicle */}
                <div className="space-y-1 mb-3">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {b.userName}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-slate-400" />
                    <span>{b.vehicleName}</span>
                    <span className="font-mono font-semibold uppercase text-slate-400">({b.vehicleReg})</span>
                  </p>
                </div>

                {/* Schedule & Center */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium">{b.centerName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{b.serviceDate} • {b.serviceTime}</span>
                  </div>
                </div>

                {/* Services Pills */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {b.services?.map((svc, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-blue-50/70 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-[10px] font-medium border border-blue-200/50 dark:border-blue-900/30">
                      {svc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom: Price & Quick Action */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Billed</span>
                  <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">
                    {b.status === 'COMPLETED' && b.finalCost
                      ? `₹${b.finalCost.toLocaleString()}`
                      : `₹${b.estimatedCostMin.toLocaleString()}`}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {b.status === 'CONFIRMED' && (
                    <button
                      onClick={() => {
                        setCompletingBooking(b);
                        setFinalCost(b.estimatedCostMin);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Complete
                    </button>
                  )}
                  {b.status === 'PENDING' && (
                    <button
                      onClick={() => handleStatusChange(b.id, 'CONFIRM')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      Confirm
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── RECORD COMPLETION MODAL ── */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Mark Service Completed
                </h3>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {completingBooking.bookingCode}
                </p>
              </div>
              <button
                onClick={() => setCompletingBooking(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitComplete} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Final Billed Amount (₹)
                </label>
                <input
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Odometer KM at Workshop
                </label>
                <input
                  type="number"
                  value={finalKm}
                  onChange={(e) => setFinalKm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Technician Inspection Notes
                </label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComplete}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isSubmittingComplete ? 'Saving...' : 'Confirm & Generate Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INSPECT BOOKING MODAL ── */}
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
                    Booking Registry Details
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
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Customer Name:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{inspectBooking.userName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Contact Number:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">{inspectBooking.userPhone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Vehicle:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {inspectBooking.vehicleName} <span className="font-mono text-slate-400">({inspectBooking.vehicleReg})</span>
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Workshop Center:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{inspectBooking.centerName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Slot Scheduled:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {inspectBooking.serviceDate} at {inspectBooking.serviceTime}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Booked Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {inspectBooking.services?.map((s, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-semibold text-xs border border-blue-200 dark:border-blue-800">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {inspectBooking.notes && (
                <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-300">
                  <span className="font-bold block text-[10px] uppercase tracking-wider mb-0.5">Customer &amp; Dispatch Notes</span>
                  <p>{inspectBooking.notes}</p>
                </div>
              )}

              <div className="flex justify-between items-center p-3.5 rounded-2xl bg-slate-100/70 dark:bg-white/[0.05]">
                <span className="text-slate-500 font-medium">Billed / Estimated Amount:</span>
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                  ₹{(inspectBooking.finalCost || inspectBooking.estimatedCostMin).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              {inspectBooking.status === 'PENDING' && (
                <button
                  onClick={() => handleStatusChange(inspectBooking.id, 'CONFIRM')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Confirm Appointment
                </button>
              )}
              {inspectBooking.status === 'CONFIRMED' && (
                <button
                  onClick={() => {
                    const b = inspectBooking;
                    setInspectBooking(null);
                    setCompletingBooking(b);
                    setFinalCost(b.estimatedCostMin);
                  }}
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
