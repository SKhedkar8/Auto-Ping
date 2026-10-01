'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Calendar,
  Car,
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  User,
  Wrench,
  X
} from 'lucide-react';
import { clearClientSession, DEMO_ADMIN_USER, DEMO_CUSTOMER_USER, getClientSession, setClientSession } from '@/lib/auth';
import { Notification, User as UserType } from '@/lib/types';
import { useDarkMode } from './DarkModeProvider';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggle } = useDarkMode();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    setCurrentUser(session);

    const handleSessionChange = () => {
      setCurrentUser(getClientSession());
    };
    window.addEventListener('autoping_session_change', handleSessionChange);

    return () => window.removeEventListener('autoping_session_change', handleSessionChange);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/notifications?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) setNotifications(res.data);
        })
        .catch(() => {});
    }
  }, [currentUser]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'My Vehicles', icon: Car },
    { href: '/services/book', label: 'Book Service', icon: Wrench },
    { href: '/bookings', label: 'Bookings', icon: Calendar },
    { href: '/history', label: 'History', icon: History },
  ];

  // Avatar element: photo or initials
  const AvatarEl = () =>
    currentUser?.photoUrl ? (
      <img
        src={currentUser.photoUrl}
        alt={currentUser.name}
        className="w-7 h-7 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
      />
    ) : (
      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
        {currentUser?.name?.charAt(0) || 'U'}
      </div>
    );

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-slate-100">
                    Auto<span className="text-[#0B5CFF]">Ping</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase -mt-0.5">
                  Never Miss a Service
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600/10 text-[#0B5CFF] font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#0B5CFF]' : 'text-slate-400'}`} />
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Demo switcher */}
            <div className="hidden lg:flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                onClick={() => {
                  setClientSession(DEMO_CUSTOMER_USER);
                  router.push('/dashboard');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  currentUser?.role === 'CUSTOMER'
                    ? 'bg-white dark:bg-slate-700 shadow-xs text-blue-600 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => {
                  setClientSession(DEMO_ADMIN_USER);
                  router.push('/admin');
                }}
                className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-slate-900 text-white shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Shield className="w-3 h-3 text-amber-400" />
                Admin
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                aria-label="Notifications"
                className="relative p-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-dropdown p-4 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-xs font-medium text-blue-600 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 py-1">
                    {notifications.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`p-3 rounded-xl transition-all ${
                            notif.isRead ? 'bg-slate-50/70 dark:bg-slate-800/50' : 'bg-blue-50/80 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{notif.title}</h5>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">
                              {new Date(notif.createdAt).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-center">
                    <a
                      href="/notifications"
                      onClick={() => setShowNotifMenu(false)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View all notifications →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700/60 shadow-xs transition-all"
              >
                <AvatarEl />
                <span className="hidden sm:block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-dropdown p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
                    <div className="flex items-center gap-2 mb-1">
                      {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt={currentUser.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                          {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentUser?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700">
                      {currentUser?.role === 'ADMIN' ? 'Platform Administrator' : 'Vehicle Owner'}
                    </span>
                  </div>

                  <a
                    href="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Profile & Preferences
                  </a>

                  {currentUser?.role === 'ADMIN' ? (
                    <a
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-500" />
                      Admin Command Center
                    </a>
                  ) : (
                    <a
                      href="/admin/login"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-all"
                    >
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      Admin Login
                    </a>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
                    <button
                      onClick={() => {
                        clearClientSession();
                        setShowUserMenu(false);
                        router.push('/login');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/60 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg px-4 pt-3 pb-5 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-150">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </a>
              );
            })}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2">
              <button
                onClick={() => { toggle(); setMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-xl"
              >
                Go to Admin
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-700/80 px-2 py-1.5 flex justify-around items-center">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#0B5CFF] font-semibold' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{link.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
