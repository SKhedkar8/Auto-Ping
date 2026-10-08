'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  MapPin,
  RefreshCw,
  Search,
  Wrench,
  XCircle
} from 'lucide-react';
import { Booking } from '@/lib/types';

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Complete modal
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
      }
      fetchBookings();
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

  const filtered = bookings.filter((b) => {
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Bookings</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Filter, inspect, confirm, or record final invoices for appointments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code, customer, car..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-xs"
            />
          </div>
          <button
            onClick={fetchBookings}
            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 shadow-xs transition-colors"
            title="Refresh Table"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shadow-xs ${
              filterStatus === st
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px] bg-slate-50/70 dark:bg-slate-800/40">
                <th className="py-2.5 px-3.5">Booking Code</th>
                <th className="py-2.5 px-3.5">Customer</th>
                <th className="py-2.5 px-3.5">Vehicle</th>
                <th className="py-2.5 px-3.5">Center &amp; Schedule</th>
                <th className="py-2.5 px-3.5">Services</th>
                <th className="py-2.5 px-3.5">Amount</th>
                <th className="py-2.5 px-3.5">Status</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {b.bookingCode}
                  </td>
                  <td className="py-3 px-3.5">
                    <strong className="text-slate-900 dark:text-slate-100 block">{b.userName}</strong>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">{b.userPhone}</span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="text-slate-900 dark:text-slate-100 font-medium">{b.vehicleName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">{b.vehicleReg}</span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="text-slate-700 dark:text-slate-300 font-medium block truncate max-w-[160px]">{b.centerName}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {b.serviceDate} at {b.serviceTime}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span className="text-slate-600 dark:text-slate-400 truncate max-w-[180px] block">
                      {b.services.join(', ')}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white font-mono">
                    {b.status === 'COMPLETED' && b.finalCost
                      ? `₹${b.finalCost.toLocaleString()}`
                      : `₹${b.estimatedCostMin.toLocaleString()}`}
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        b.status === 'CONFIRMED'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : b.status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : b.status === 'COMPLETED'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                    {b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => {
                          setCompletingBooking(b);
                          setFinalCost(b.estimatedCostMin);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] shadow-xs transition-colors"
                      >
                        Record Complete
                      </button>
                    )}
                    {b.status !== 'CANCELLED' && b.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleStatusChange(b.id, 'CANCEL')}
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
      </div>

      {/* RECORD COMPLETION MODAL */}
      {completingBooking && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-xl">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Mark Service Completed ({completingBooking.bookingCode})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Enter final invoice amount and odometer reading. Auto Ping will generate a ServiceRecord and notify the customer.
            </p>

            <form onSubmit={handleSubmitComplete} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Final Billed Cost (₹)</label>
                <input
                  type="number"
                  value={finalCost}
                  onChange={(e) => setFinalCost(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Odometer KM at Service</label>
                <input
                  type="number"
                  value={finalKm}
                  onChange={(e) => setFinalKm(Number(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Technician Checklist Memo</label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCompletingBooking(null)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingComplete}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs transition-colors"
                >
                  {isSubmittingComplete ? 'Saving...' : 'Finalize & Update Health'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
