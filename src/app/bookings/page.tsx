'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Wrench,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Booking, BookingStatus } from '@/lib/types';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [isLoading, setIsLoading] = useState(true);

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  // Reschedule modal state
  const [reschedulingBooking, setReschedulingBooking] = useState<Booking | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('10:30 AM');
  const [isRescheduling, setIsRescheduling] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setIsLoading(true);
    const user = getClientSession();
    fetch(`/api/bookings?userId=${user?.id || 'user-customer-1'}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setBookings(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'UPCOMING') return b.status === 'CONFIRMED' || b.status === 'PENDING' || b.status === 'IN_PROGRESS';
    if (activeTab === 'COMPLETED') return b.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED' || b.status === 'NO_SHOW';
    return true;
  });

  const handleCancelBooking = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    setCancelError('');

    try {
      const res = await fetch(`/api/bookings/${cancellingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CANCEL', reason: cancelReason }),
      });
      const data = await res.json();
      setIsCancelling(false);

      if (data.data) {
        setBookings((prev) =>
          prev.map((b) => (b.id === cancellingBooking.id ? data.data : b))
        );
        setCancellingBooking(null);
        setCancelReason('');
      } else {
        setCancelError(data.error || 'Failed to cancel');
      }
    } catch {
      setIsCancelling(false);
      setCancelError('Network error while cancelling');
    }
  };

  const handleRescheduleBooking = async () => {
    if (!reschedulingBooking || !rescheduleDate) return;
    setIsRescheduling(true);

    try {
      const newSlotId = `slot-${reschedulingBooking.centerId}-${rescheduleDate}-${rescheduleTime.replace(/[^a-zA-Z0-9]/g, '')}`;
      const res = await fetch(`/api/bookings/${reschedulingBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESCHEDULE',
          newSlotId,
          newDate: rescheduleDate,
          newTime: rescheduleTime,
        }),
      });
      const data = await res.json();
      setIsRescheduling(false);

      if (data.data) {
        setBookings((prev) =>
          prev.map((b) => (b.id === reschedulingBooking.id ? data.data : b))
        );
        setReschedulingBooking(null);
      } else {
        alert(data.error || 'Failed to reschedule slot');
      }
    } catch {
      setIsRescheduling(false);
      alert('Network error while rescheduling');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Service Bookings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage scheduled visits, reschedule time slots, or view past service invoices.
            </p>
          </div>

          <a
            href="/services/book"
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Wrench className="w-4 h-4" />
            Book New Service
          </a>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6 gap-6">
          {[
            { key: 'UPCOMING', label: 'Upcoming Appointments' },
            { key: 'COMPLETED', label: 'Completed Services' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Bookings */}
        {filteredBookings.length === 0 && !isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center max-w-md mx-auto my-12 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">No {activeTab.toLowerCase()} bookings</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              You do not have any bookings under this status tab.
            </p>
            <a
              href="/services/book"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors shadow-xs"
            >
              Book Service Now
            </a>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredBookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              const isPending = booking.status === 'PENDING';
              const isCompleted = booking.status === 'COMPLETED';
              const isCancelled = booking.status === 'CANCELLED';

              return (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Details */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 px-2 py-0.5 rounded">
                          {booking.bookingCode}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-medium border ${
                            isConfirmed
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                              : isPending
                              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                              : isCompleted
                              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base text-slate-900 dark:text-white">
                        {booking.vehicleName}{' '}
                        <span className="text-xs font-normal text-slate-500 font-mono">
                          ({booking.vehicleReg})
                        </span>
                      </h3>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          {booking.centerName}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {booking.serviceDate} at {booking.serviceTime}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 pt-0.5">
                        <strong className="text-slate-800 dark:text-slate-200">Services:</strong> {booking.services.join(', ')}
                      </div>

                      {booking.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          Special notes: &quot;{booking.notes}&quot;
                        </p>
                      )}
                    </div>

                    {/* Right Cost & Actions */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                      <div className="text-left lg:text-right">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          {isCompleted ? 'Final Total' : 'Estimated Cost'}
                        </span>
                        <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                          {isCompleted && booking.finalCost
                            ? `₹${booking.finalCost.toLocaleString()}`
                            : `₹${booking.estimatedCostMin.toLocaleString()} – ₹${booking.estimatedCostMax.toLocaleString()}`}
                        </span>
                      </div>

                      {/* Action buttons */}
                      {isConfirmed && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setReschedulingBooking(booking);
                              setRescheduleDate(booking.serviceDate);
                            }}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => setCancellingBooking(booking)}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-medium text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* CANCELLATION MODAL */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Cancel Service Booking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Are you sure you want to cancel booking{' '}
              <strong className="text-slate-800 dark:text-slate-200">{cancellingBooking.bookingCode}</strong>? The reserved slot will be freed.
            </p>

            {cancelError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium">
                {cancelError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict or travel"
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-medium shadow-xs transition-colors"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {reschedulingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">Reschedule Service Slot</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Pick a new date and time for {reschedulingBooking.vehicleName}.
            </p>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Select Time Window</label>
                <select
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:30 PM">02:30 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReschedulingBooking(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRescheduling}
                onClick={handleRescheduleBooking}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
              >
                {isRescheduling ? 'Rescheduling...' : 'Save New Slot'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />
    </div>
  );
}
