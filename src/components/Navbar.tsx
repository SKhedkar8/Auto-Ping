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
import RunningTicker from './RunningTicker';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggle } = useDarkMode();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    setCurrentUser(session);
    const handleSessionChange = () => setCurrentUser(getClientSession());
    window.addEventListener('autoping_session_change', handleSessionChange);
    return () => window.removeEventListener('autoping_session_change', handleSessionChange);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetch(`/api/notifications?userId=${currentUser.id}`)
        .then((res) => res.json())
        .then((res) => { if (res.data) setNotifications(res.data); })
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

  const AvatarEl = () =>
    currentUser?.photoUrl ? (
      <img
        src={currentUser.photoUrl}
        alt={currentUser.name}
        className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20"
      />
    ) : (
      <div className="w-7 h-7 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-semibold text-xs">
        {currentUser?.name?.charAt(0) || 'U'}
      </div>
    );

  return (
    <>
      <RunningTicker />
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-black/[0.06] dark:border-white/[0.08] shadow-sm'
            : 'bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-black/[0.04] dark:border-white/[0.05]'
        }`}
        style={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)', backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[52px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-[8px] bg-[#0071E3] flex items-center justify-center">
                <Car className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-[15px] tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                Auto<span className="text-[#0071E3]">Ping</span>
              </span>
            </a>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]'
                        : 'text-[#1d1d1f]/70 dark:text-[#f5f5f7]/60 hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                    }`}
                  >
                    <Icon className={`w-[14px] h-[14px] ${isActive ? 'text-[#0071E3] dark:text-[#2997FF]' : ''}`} />
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Demo role switcher — Apple segmented pill */}
            <div className="hidden lg:flex items-center gap-0.5 bg-black/[0.06] dark:bg-white/[0.08] p-0.5 rounded-full text-[12px]">
              <button
                onClick={() => { setClientSession(DEMO_CUSTOMER_USER); router.push('/dashboard'); }}
                className={`px-3 py-1 rounded-full transition-all duration-200 font-medium ${
                  currentUser?.role === 'CUSTOMER'
                    ? 'bg-white dark:bg-[#1c1c1e] shadow-sm text-[#0071E3] dark:text-[#2997FF]'
                    : 'text-[#1d1d1f]/60 dark:text-[#f5f5f7]/50 hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => { setClientSession(DEMO_ADMIN_USER); router.push('/admin'); }}
                className={`px-3 py-1 rounded-full transition-all duration-200 font-medium flex items-center gap-1 ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-white dark:bg-[#1c1c1e] shadow-sm text-[#1d1d1f] dark:text-[#f5f5f7]'
                    : 'text-[#1d1d1f]/60 dark:text-[#f5f5f7]/50 hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                }`}
              >
                <Shield className="w-[11px] h-[11px] text-[#FF9500]" />
                Admin
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? 'Light Mode' : 'Dark Mode'}
              className="p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all duration-200 apple-btn"
            >
              {isDark
                ? <Sun className="w-[15px] h-[15px] text-[#FF9500]" />
                : <Moon className="w-[15px] h-[15px] text-[#1d1d1f]/70" />
              }
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); }}
                aria-label="Notifications"
                className="relative p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] text-[#1d1d1f] dark:text-[#f5f5f7] transition-all duration-200 apple-btn"
              >
                <Bell className="w-[15px] h-[15px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-[16px] h-[16px] bg-[#FF3B30] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.1] shadow-2xl z-50 apple-scale-in overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-[12px] font-medium text-[#0071E3] dark:text-[#2997FF] hover:opacity-80 transition-opacity">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-[#86868b] text-[13px]">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          className={`px-4 py-3 border-b border-black/[0.04] dark:border-white/[0.05] last:border-0 transition-colors ${
                            notif.isRead ? '' : 'bg-[#0071E3]/[0.04] dark:bg-[#2997FF]/[0.06]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-medium text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">{notif.title}</h5>
                            <span className="text-[11px] text-[#86868b] whitespace-nowrap shrink-0">
                              {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#86868b] mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-black/[0.06] dark:border-white/[0.08] text-center">
                    <a href="/notifications" onClick={() => setShowNotifMenu(false)} className="text-[13px] font-medium text-[#0071E3] dark:text-[#2997FF] hover:opacity-80 transition-opacity">
                      View all notifications →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); }}
                className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] hover:bg-black/[0.09] dark:hover:bg-white/[0.12] border border-transparent transition-all duration-200 apple-btn"
              >
                <AvatarEl />
                <span className="hidden sm:block text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {currentUser?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-[#86868b]" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-2xl border border-black/[0.06] dark:border-white/[0.1] shadow-2xl z-50 apple-scale-in overflow-hidden">
                  <div className="px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
                    <div className="flex items-center gap-2.5">
                      {currentUser?.photoUrl ? (
                        <img src={currentUser.photoUrl} alt={currentUser.name} className="w-9 h-9 rounded-full object-cover ring-1 ring-black/10" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#0071E3] text-white flex items-center justify-center font-semibold text-sm">
                          {currentUser?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{currentUser?.name}</p>
                        <p className="text-[11px] text-[#86868b] truncate">{currentUser?.email}</p>
                      </div>
                    </div>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]">
                      {currentUser?.role === 'ADMIN' ? 'Administrator' : 'Vehicle Owner'}
                    </span>
                  </div>

                  <div className="py-1">
                    <a href="/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                      <User className="w-3.5 h-3.5 text-[#86868b]" />
                      Profile & Preferences
                    </a>
                    {currentUser?.role === 'ADMIN' ? (
                      <a href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#FF9500] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                        <Shield className="w-3.5 h-3.5 text-[#FF9500]" />
                        Admin Center
                      </a>
                    ) : (
                      <a href="/admin/login" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors">
                        <Shield className="w-3.5 h-3.5 text-[#86868b]" />
                        Admin Login
                      </a>
                    )}
                  </div>

                  <div className="border-t border-black/[0.06] dark:border-white/[0.08] py-1">
                    <button
                      onClick={() => { clearClientSession(); setShowUserMenu(false); router.push('/login'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#FF3B30] hover:bg-[#FF3B30]/[0.05] transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] apple-btn"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.06] bg-white/92 dark:bg-black/92 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-0.5 apple-fade-in">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]'
                      : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.06]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </a>
              );
            })}
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] flex items-center gap-2 mt-1">
              <button
                onClick={() => { toggle(); setMobileMenuOpen(false); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/[0.05] dark:bg-white/[0.08] rounded-xl"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#FF9500]" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <a
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2.5 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/[0.05] dark:bg-white/[0.08] rounded-xl"
              >
                Go to Admin
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Mobile bottom nav bar — iOS tab bar style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/85 dark:bg-black/85 backdrop-blur-xl border-t border-black/[0.06] dark:border-white/[0.08] px-2 py-1 flex justify-around items-center safe-area-inset-bottom">
        {navLinks.slice(0, 5).map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
          return (
            <a
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 min-w-[52px] ${
                isActive ? 'text-[#0071E3] dark:text-[#2997FF]' : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </a>
          );
        })}
      </nav>
    </>
  );
}
