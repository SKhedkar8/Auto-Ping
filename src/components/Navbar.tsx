'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  Calendar,
  Car,
  ChevronDown,
  Compass,
  Download,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  QrCode,
  Scan,
  Shield,
  Smartphone,
  Sparkles,
  Sun,
  User,
  Wrench,
  X,
  FileText
} from 'lucide-react';
import { clearClientSession, DEMO_ADMIN_USER, DEMO_CUSTOMER_USER, getClientSession, setClientSession } from '@/lib/auth';
import { switchUserRoleWithAnimation } from '@/lib/roleTransition';
import { Notification, User as UserType } from '@/lib/types';
import { useDarkMode } from './DarkModeProvider';
import RunningTicker from './RunningTicker';
import AiCharacterAssistant from './character/AiCharacterAssistant';
import { QRCodeSVG } from 'qrcode.react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDark, toggle } = useDarkMode();
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  useEffect(() => {
    const handleRoleSwitchState = (e: Event) => {
      const ce = e as CustomEvent<{ isSwitching: boolean }>;
      setIsSwitchingRole(!!ce.detail?.isSwitching);
    };
    window.addEventListener('autoping_role_switching_state', handleRoleSwitchState);
    return () => window.removeEventListener('autoping_role_switching_state', handleRoleSwitchState);
  }, []);

  useEffect(() => {
    const handleOpenAi = () => setIsAiAssistantOpen(true);
    window.addEventListener('open_ai_character_assistant', handleOpenAi);
    return () => window.removeEventListener('open_ai_character_assistant', handleOpenAi);
  }, []);

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
    if (!isQrModalOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsQrModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQrModalOpen]);

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

  const primaryNavLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/vehicles', label: 'Garage', icon: Car },
    { href: '/services/book', label: 'Book Service', icon: Wrench },
    { href: '/bookings', label: 'Bookings', icon: Calendar },
  ];

  const secondaryNavLinks = [
    { href: '/services/inspection', label: 'Inspection', icon: Scan },
    { href: '/map', label: 'Service Map', icon: Compass },
    { href: '/history', label: 'History', icon: History },
  ];

  const navLinks = [...primaryNavLinks, ...secondaryNavLinks];

  const AvatarEl = () =>
    currentUser?.photoUrl ? (
      <img
        src={currentUser.photoUrl}
        alt={currentUser.name}
        className="w-7 h-7 rounded-full object-cover ring-1 ring-black/10 dark:ring-white/20"
      />
    ) : (
      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-xs shadow-xs">
        {currentUser?.name?.charAt(0) || 'U'}
      </div>
    );

  return (
    <>
      <RunningTicker />
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-xs'
            : 'bg-white/75 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60'
        }`}
        style={{ WebkitBackdropFilter: 'blur(20px) saturate(180%)', backdropFilter: 'blur(20px) saturate(180%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[54px] flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-6 lg:gap-8">
            <a href="/" className="flex items-center gap-2.5 shrink-0 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                <Car className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-[15px] tracking-tight text-slate-900 dark:text-white">
                Auto<span className="text-blue-600">Ping</span>
              </span>
            </a>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {primaryNavLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold shadow-2xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{link.label}</span>
                  </a>
                );
              })}

              {/* More Dropdown for Secondary Navigation */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreMenu(!showMoreMenu);
                    setShowNotifMenu(false);
                    setShowUserMenu(false);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    secondaryNavLinks.some((l) => pathname.startsWith(l.href))
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span>More</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMoreMenu ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
                </button>

                {showMoreMenu && (
                  <div className="absolute left-0 mt-2 w-48 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-1.5 animate-in fade-in zoom-in-95">
                    {secondaryNavLinks.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname.startsWith(link.href);
                      return (
                        <a
                          key={link.href}
                          href={link.href}
                          onClick={() => setShowMoreMenu(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{link.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 🤖 AI Assistant Button */}
              <button
                type="button"
                onClick={() => setIsAiAssistantOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 border border-cyan-200 dark:border-cyan-800/60 shadow-xs transition-all duration-200 cursor-pointer ml-1"
                title="Launch Talking Cars AI Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>AI Assistant</span>
              </button>

              {/* 📲 Install App Button */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('autoping_trigger_pwa_install'))}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer ml-0.5"
                title="Install AutoPing as an app on your device"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                <span>Install App</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setQrUrl(`${window.location.origin}/signup`);
                  setIsQrModalOpen(true);
                }}
                className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                title="Show a QR code to create an AutoPing account"
                aria-label="Show QR code to create an AutoPing account"
              >
                <QrCode className="w-3.5 h-3.5 text-slate-400" />
                <span>QR Code</span>
              </button>
            </nav>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Demo role switcher */}
            <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-full text-xs">
              <button
                type="button"
                disabled={isSwitchingRole}
                onClick={() => {
                  if (currentUser?.role === 'CUSTOMER' || isSwitchingRole) return;
                  switchUserRoleWithAnimation('CUSTOMER', '/dashboard');
                }}
                className={`px-3 py-1 rounded-full transition-all duration-200 font-medium ${
                  currentUser?.role === 'CUSTOMER'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                } ${isSwitchingRole ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Switch to Customer Mode"
              >
                Customer
              </button>
              <button
                type="button"
                disabled={isSwitchingRole}
                onClick={() => {
                  if (currentUser?.role === 'ADMIN' || isSwitchingRole) return;
                  switchUserRoleWithAnimation('ADMIN', '/admin');
                }}
                className={`px-3 py-1 rounded-full transition-all duration-200 font-medium flex items-center gap-1 ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                } ${isSwitchingRole ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                title="Switch to Admin Console"
              >
                <Shield className="w-3 h-3 text-amber-500" />
                Admin
              </button>
            </div>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              aria-label={isDark ? 'Light Mode' : 'Dark Mode'}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200 cursor-pointer"
            >
              {isDark
                ? <Sun className="w-4 h-4 text-amber-500" />
                : <Moon className="w-4 h-4 text-slate-600" />
              }
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifMenu(!showNotifMenu); setShowUserMenu(false); setShowMoreMenu(false); }}
                aria-label="Notifications"
                className="relative p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all duration-200 cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button onClick={handleMarkAllRead} className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">No notifications yet.</div>
                    ) : (
                      notifications.slice(0, 5).map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (notif.type === 'SERVICE_COMPLETED' && notif.bookingId) {
                              setShowNotifMenu(false);
                              window.dispatchEvent(
                                new CustomEvent('autoping_open_bill', {
                                  detail: { bookingId: notif.bookingId },
                                })
                              );
                            }
                          }}
                          className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 transition-colors ${
                            notif.isRead ? '' : 'bg-blue-50/40 dark:bg-blue-950/20'
                          } ${notif.type === 'SERVICE_COMPLETED' ? 'cursor-pointer hover:bg-blue-50/70 dark:hover:bg-blue-950/40' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                              {notif.title}
                            </h5>
                            <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                              {new Date(notif.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                          {notif.type === 'SERVICE_COMPLETED' && notif.bookingId && (
                            <div className="mt-1.5">
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline">
                                <FileText className="w-3 h-3" />
                                View Detailed Bill & Receipt →
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
                    <a href="/notifications" onClick={() => setShowNotifMenu(false)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                      View all notifications →
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifMenu(false); setShowMoreMenu(false); }}
                className="flex items-center gap-2 py-1 pl-1 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700/80 transition-all duration-200 cursor-pointer"
              >
                <AvatarEl />
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser?.name?.split(' ')[0] || 'Account'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
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
                      <button
                        type="button"
                        disabled={isSwitchingRole}
                        onClick={() => {
                          setShowUserMenu(false);
                          switchUserRoleWithAnimation('ADMIN', '/admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#FF9500] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-[#FF9500]" />
                        Admin Center
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSwitchingRole}
                        onClick={() => {
                          setShowUserMenu(false);
                          switchUserRoleWithAnimation('ADMIN', '/admin');
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-left cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-500" />
                        Switch to Admin Console
                      </button>
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
          <div className="md:hidden border-t border-black/[0.06] dark:border-white/[0.06] bg-white/92 dark:bg-black/92 backdrop-blur-2xl px-4 pt-2 pb-4 space-y-1 apple-fade-in">
            {/* 🤖 AI Assistant Mobile Button */}
            <button
              type="button"
              onClick={() => {
                setIsAiAssistantOpen(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-[14px] font-semibold bg-gradient-to-r from-[#0071E3]/15 to-[#34C759]/15 text-[#0071E3] dark:text-[#2997FF] border border-[#0071E3]/30 w-full mb-1 transition-all apple-btn"
            >
              <span className="text-base">🤖</span>
              <span>AI Assistant</span>
              <span className="ml-auto text-[10px] font-bold uppercase tracking-wider bg-[#0071E3] text-white px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </button>

            {/* Mobile Role Switcher */}
            <div className="flex items-center gap-1 p-1 bg-black/[0.04] dark:bg-white/[0.06] rounded-xl text-xs mb-2">
              <button
                type="button"
                disabled={isSwitchingRole}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentUser?.role === 'CUSTOMER' || isSwitchingRole) return;
                  switchUserRoleWithAnimation('CUSTOMER', '/dashboard');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all ${
                  currentUser?.role === 'CUSTOMER'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                } ${isSwitchingRole ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                Customer App
              </button>
              <button
                type="button"
                disabled={isSwitchingRole}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentUser?.role === 'ADMIN' || isSwitchingRole) return;
                  switchUserRoleWithAnimation('ADMIN', '/admin');
                }}
                className={`flex-1 py-1.5 rounded-lg text-center font-medium transition-all flex items-center justify-center gap-1 ${
                  currentUser?.role === 'ADMIN'
                    ? 'bg-white dark:bg-slate-900 shadow-xs text-amber-600 dark:text-amber-400 font-semibold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                } ${isSwitchingRole ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Shield className="w-3 h-3 text-amber-500" />
                Admin Console
              </button>
            </div>

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
            <div className="pt-2 border-t border-black/[0.06] dark:border-white/[0.06] mt-1 space-y-2">
              <button
                onClick={() => { toggle(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] bg-black/[0.05] dark:bg-white/[0.08] rounded-xl"
              >
                {isDark ? <Sun className="w-4 h-4 text-[#FF9500]" /> : <Moon className="w-4 h-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('autoping_trigger_pwa_install'));
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/40 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQrUrl(`${window.location.origin}/signup`);
                    setIsQrModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Show QR code to create an AutoPing account"
                  title="Show signup QR code"
                >
                  <QrCode className="h-4 w-4" />
                </button>
              </div>
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

      {/* 🤖 Interactive AI Character Assistant Modal */}
      <AiCharacterAssistant
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />

      {isQrModalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsQrModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="share-qr-title"
            className="relative w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={() => setIsQrModalOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close QR code"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <QrCode className="h-5 w-5" />
            </div>
            <h2 id="share-qr-title" className="text-base font-bold text-slate-900 dark:text-white">
              Create an AutoPing account
            </h2>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Scan with a phone camera to open signup. After signup, choose Install App to add AutoPing to your home screen.
            </p>
            <div className="mx-auto mt-5 inline-flex rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
              {qrUrl && <QRCodeSVG value={qrUrl} size={208} level="M" title="Scan to create an AutoPing account" />}
            </div>
            <p className="mt-3 break-all text-[11px] text-slate-500 dark:text-slate-400">{qrUrl}</p>
          </section>
        </div>
      )}
    </>
  );
}
