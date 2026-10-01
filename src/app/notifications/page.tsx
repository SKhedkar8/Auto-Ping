'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Filter,
  Info,
  Sparkles,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = () => {
    setIsLoading(true);
    const user = getClientSession();
    fetch(`/api/notifications?userId=${user?.id || 'user-customer-1'}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setNotifications(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleMarkRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {}
  };

  const handleMarkAllRead = async () => {
    const user = getClientSession();
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id || 'user-customer-1', markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const filteredNotifs = notifications.filter((n) => {
    if (filterType === 'REMINDERS') return n.type.startsWith('REMINDER') || n.type === 'OVERDUE' || n.type === 'DUE_TODAY';
    if (filterType === 'BOOKINGS') return n.type.startsWith('BOOKING') || n.type === 'SERVICE_COMPLETED';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Notifications & Alerts
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  {unreadCount} unread
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Automated reminders, appointment confirmations, and mileage wear warnings.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-blue-600 shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          {[
            { key: 'ALL', label: 'All Alerts' },
            { key: 'REMINDERS', label: 'Service Reminders' },
            { key: 'BOOKINGS', label: 'Booking Updates' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                filterType === tab.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white/80 border border-slate-200 text-slate-600 hover:bg-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifs.length === 0 && !isLoading ? (
          <div className="glass-card p-12 text-center max-w-md mx-auto my-12 border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">No Notifications</h3>
            <p className="text-xs text-slate-500">You are all caught up with your vehicle alerts.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifs.map((notif) => {
              const isReminder = notif.type.startsWith('REMINDER') || notif.type === 'OVERDUE';
              const isBooking = notif.type.startsWith('BOOKING') || notif.type === 'SERVICE_COMPLETED';

              return (
                <div
                  key={notif.id}
                  onClick={() => !notif.isRead && handleMarkRead(notif.id)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    notif.isRead
                      ? 'bg-white/70 border-slate-200/80 shadow-xs'
                      : 'bg-blue-50/90 border-blue-200 ring-1 ring-blue-500/20 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          isReminder
                            ? 'bg-amber-100 text-amber-600'
                            : isBooking
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        {isReminder ? (
                          <AlertTriangle className="w-5 h-5" />
                        ) : isBooking ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Bell className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900">{notif.title}</h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    </div>

                    <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                      {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
