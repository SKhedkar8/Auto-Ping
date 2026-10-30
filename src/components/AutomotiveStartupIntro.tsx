'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Car, ChevronRight, Shield, Zap } from 'lucide-react';
import { DEMO_ADMIN_USER, DEMO_CUSTOMER_USER, setClientSession } from '@/lib/auth';

/**
 * AutomotiveStartupIntro
 * 
 * Cinematic automotive startup intro animation for AutoPing:
 * - Shared for both:
 *   1. Initial site launch startup intro (plays once per browser session, ~3.5s)
 *   2. Customer <-> Admin mode switching transition (1.5 - 1.8s calibrated duration)
 */
export default function AutomotiveStartupIntro() {
  const router = useRouter();

  // Overlay visibility and phase
  const [isOpen, setIsOpen] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Active role switch target metadata
  const [switchTarget, setSwitchTarget] = useState<{
    role: 'ADMIN' | 'CUSTOMER';
    url: string;
  } | null>(null);

  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const isTransitioningRef = useRef(false);
  const switchTargetRef = useRef<{ role: 'ADMIN' | 'CUSTOMER'; url: string } | null>(null);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const notifySwitchingState = useCallback((isSwitching: boolean) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('autoping_role_switching_state', {
          detail: { isSwitching },
        })
      );
    }
  }, []);

  const finishTransition = useCallback(() => {
    clearAllTimers();
    setIsOpen(false);
    setIsFadingOut(false);
    setSwitchTarget(null);
    switchTargetRef.current = null;
    isTransitioningRef.current = false;
    notifySwitchingState(false);
    if (typeof document !== 'undefined') {
      const curtain = document.getElementById('autoping-instant-curtain');
      if (curtain) curtain.style.display = 'none';
      document.documentElement.classList.remove('autoping-intro-active');
    }
  }, [clearAllTimers, notifySwitchingState]);

  const applyRoleAndNavigate = useCallback(
    (targetRole: 'ADMIN' | 'CUSTOMER', targetUrl: string) => {
      if (targetRole === 'ADMIN') {
        setClientSession(DEMO_ADMIN_USER);
      } else {
        setClientSession(DEMO_CUSTOMER_USER);
      }
      try {
        router.push(targetUrl);
      } catch {
        window.location.href = targetUrl;
      }
    },
    [router]
  );

  // Full Initial Startup Intro sequence (~3.2 - 3.5s)
  const playStartupIntro = useCallback(() => {
    clearAllTimers();
    setSwitchTarget(null);
    switchTargetRef.current = null;
    setPhase(0);
    setIsFadingOut(false);
    setIsOpen(true);

    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('autoping-intro-active');
      // Instant curtain can now be hidden as the interactive React overlay is active
      const curtain = document.getElementById('autoping-instant-curtain');
      if (curtain) curtain.style.display = 'none';
    }

    // Phase 2: Automotive Light Trail (500ms)
    const t1 = setTimeout(() => setPhase(1), 500);
    // Phase 3: AutoPing Logo Reveal (1450ms)
    const t2 = setTimeout(() => setPhase(2), 1450);
    // Phase 4: Tagline Reveal (2200ms)
    const t3 = setTimeout(() => setPhase(3), 2200);
    // Phase 5: Fade out & complete (3150ms)
    const t4 = setTimeout(() => {
      setPhase(4);
      setIsFadingOut(true);
      try {
        sessionStorage.setItem('autoping_intro_played', '1');
      } catch {}
      const exit = setTimeout(() => {
        finishTransition();
        // Item 2: Always open the default home page uploaded by user
        try {
          router.push('/');
        } catch {
          window.location.href = '/';
        }
      }, 550);
      timersRef.current.push(exit);
    }, 3150);

    timersRef.current = [t1, t2, t3, t4];
  }, [clearAllTimers, finishTransition, router]);

  // Calibrated Role-Switch Intro sequence (~1.5 - 1.8s)
  const playRoleSwitchIntro = useCallback(
    (targetRole: 'ADMIN' | 'CUSTOMER', targetUrl: string) => {
      // Send acknowledgment to caller
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('autoping_role_switch_ack'));
      }

      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;
      notifySwitchingState(true);

      clearAllTimers();
      const target = { role: targetRole, url: targetUrl };
      setSwitchTarget(target);
      switchTargetRef.current = target;

      setPhase(0);
      setIsFadingOut(false);
      setIsOpen(true);

      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('autoping-intro-active');
      }

      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      if (prefersReducedMotion) {
        applyRoleAndNavigate(targetRole, targetUrl);
        const fastExit = setTimeout(() => {
          finishTransition();
        }, 250);
        timersRef.current.push(fastExit);
        return;
      }

      // Phase 1 (0-300ms): Ambient intro overlay active
      // Phase 2: Automotive Light Trail (300ms)
      const t1 = setTimeout(() => setPhase(1), 300);
      // Phase 3: AutoPing Logo Reveal (700ms)
      const t2 = setTimeout(() => setPhase(2), 700);
      // Phase 4: Tagline Reveal (900ms)
      const t3 = setTimeout(() => setPhase(3), 900);

      // Phase 5: Apply session & navigate (1350ms)
      const t4 = setTimeout(() => {
        applyRoleAndNavigate(targetRole, targetUrl);
      }, 1350);

      // Fade out overlay (1650ms)
      const t5 = setTimeout(() => {
        setIsFadingOut(true);
      }, 1650);

      // Final unmount and unlock (1950ms)
      const t6 = setTimeout(() => {
        finishTransition();
      }, 1950);

      // Hard safety timer (3200ms)
      const safety = setTimeout(() => {
        if (isTransitioningRef.current) {
          applyRoleAndNavigate(targetRole, targetUrl);
          finishTransition();
        }
      }, 3200);

      timersRef.current = [t1, t2, t3, t4, t5, t6, safety];
    },
    [clearAllTimers, notifySwitchingState, applyRoleAndNavigate, finishTransition]
  );

  // 1. One-time initial mount check for startup intro (runs only on mount!)
  useEffect(() => {
    let hasPlayed = false;
    try {
      hasPlayed = !!sessionStorage.getItem('autoping_intro_played');
    } catch {
      hasPlayed = false;
    }

    if (hasPlayed) {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('autoping-intro-active');
      }
      return;
    }

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (prefersReducedMotion) {
      try {
        sessionStorage.setItem('autoping_intro_played', '1');
      } catch {}
      return;
    }

    playStartupIntro();
  }, [playStartupIntro]);

  // 2. Global event listeners for role switching & manual replay
  useEffect(() => {
    const handleRoleSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<{
        targetRole: 'ADMIN' | 'CUSTOMER';
        targetUrl?: string;
      }>;
      const { targetRole, targetUrl } = customEvent.detail || {};
      if (!targetRole) return;
      const dest = targetUrl || (targetRole === 'ADMIN' ? '/admin' : '/dashboard');
      playRoleSwitchIntro(targetRole, dest);
    };

    const handleReplay = () => {
      try {
        sessionStorage.removeItem('autoping_intro_played');
      } catch {}
      playStartupIntro();
    };

    window.addEventListener('autoping_role_switch_request', handleRoleSwitch);
    window.addEventListener('autoping_replay_intro', handleReplay);

    // Escape key listener for skipping
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (switchTargetRef.current) {
          applyRoleAndNavigate(switchTargetRef.current.role, switchTargetRef.current.url);
          finishTransition();
        } else {
          try {
            sessionStorage.setItem('autoping_intro_played', '1');
          } catch {}
          finishTransition();
          try {
            router.push('/');
          } catch {
            window.location.href = '/';
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearAllTimers();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('autoping_replay_intro', handleReplay);
      window.removeEventListener('autoping_role_switch_request', handleRoleSwitch);
    };
  }, [playRoleSwitchIntro, playStartupIntro, applyRoleAndNavigate, finishTransition, clearAllTimers, router]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="AutoPing Cinematic Transition"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center overflow-hidden bg-[#07111F] text-white select-none transition-opacity duration-500 ease-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        backgroundColor: '#07111F',
      }}
    >
      {/* Skip Button */}
      <div className="absolute top-5 right-5 sm:top-8 sm:right-8 z-50">
        <button
          type="button"
          onClick={() => {
            if (switchTargetRef.current) {
              applyRoleAndNavigate(switchTargetRef.current.role, switchTargetRef.current.url);
              finishTransition();
            } else {
              try {
                sessionStorage.setItem('autoping_intro_played', '1');
              } catch {}
              finishTransition();
              try {
                router.push('/');
              } catch {
                window.location.href = '/';
              }
            }
          }}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 hover:bg-slate-800/80 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-medium tracking-wide backdrop-blur-md transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
          aria-label="Skip transition animation"
        >
          <span>Skip intro</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] uppercase font-mono text-slate-400 bg-white/5 rounded border border-white/10 group-hover:text-cyan-300 group-hover:border-cyan-500/30 transition-colors">
            Esc
          </kbd>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </button>
      </div>

      {/* PHASE 1: AMBIENT LUXURY COCKPIT GLOW */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial blue / cyan aura */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] sm:w-[950px] sm:h-[950px] rounded-full blur-[110px] pointer-events-none transition-opacity duration-800 ease-out"
          style={{
            background:
              switchTarget?.role === 'ADMIN'
                ? 'radial-gradient(circle, rgba(37, 99, 235, 0.28) 0%, rgba(217, 119, 6, 0.12) 32%, rgba(7, 17, 31, 0) 70%)'
                : 'radial-gradient(circle, rgba(37, 99, 235, 0.22) 0%, rgba(6, 182, 212, 0.12) 32%, rgba(7, 17, 31, 0) 70%)',
            opacity: phase >= 0 ? 1 : 0,
          }}
        />

        {/* Ambient horizon line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent transform -translate-y-1/2 pointer-events-none" />

        {/* Luxury subtle telemetry grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
            backgroundPosition: 'center center',
          }}
        />
      </div>

      {/* PHASE 2: AUTOMOTIVE HORIZONTAL LIGHT TRAIL */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none z-10 overflow-hidden h-32 flex items-center justify-center">
        {/* Sweeping dynamic vehicle beam */}
        <div
          className={`absolute left-0 w-full h-[2px] transition-all ${
            phase >= 1
              ? 'opacity-100 translate-x-0 duration-800 ease-[cubic-bezier(0.22,1,0.36,1)]'
              : 'opacity-0 -translate-x-full'
          }`}
        >
          {/* Main photon laser beam */}
          <div
            className="w-full h-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.05) 15%, rgba(37,99,235,0.7) 50%, rgba(6,182,212,0.95) 75%, #FFFFFF 96%, transparent 100%)',
              boxShadow: '0 0 24px 3px rgba(6, 182, 212, 0.7), 0 0 50px 8px rgba(37, 99, 235, 0.4)',
            }}
          />

          {/* Leading flare head */}
          <div
            className="absolute right-[3%] top-1/2 -translate-y-1/2 w-4 sm:w-6 h-4 sm:h-6 rounded-full bg-white blur-[2px]"
            style={{
              boxShadow: '0 0 30px 10px #38BDF8, 0 0 60px 20px #2563EB',
            }}
          />
        </div>

        {/* Reflected asphalt/windshield glow */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-3/4 max-w-2xl h-16 rounded-full blur-2xl transition-all duration-600 ease-out ${
            phase >= 1 ? 'opacity-35 scale-100' : 'opacity-0 scale-75'
          }`}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.6) 0%, rgba(37,99,235,0.3) 50%, transparent 80%)',
          }}
        />
      </div>

      {/* PHASE 3 & 4: LOGO & BRAND IDENTITY REVEAL */}
      <div className="relative z-20 flex flex-col items-center justify-center px-6 text-center max-w-xl">
        {/* Animated Brand Badge */}
        <div
          className={`relative transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase >= 2
              ? 'opacity-100 scale-100 translate-y-0 blur-0'
              : 'opacity-0 scale-85 translate-y-6 blur-sm'
          }`}
        >
          {/* Subtle shockwave ring */}
          <div
            className={`absolute -inset-4 sm:-inset-6 rounded-3xl border border-cyan-400/30 transition-all duration-800 ease-out pointer-events-none ${
              phase >= 2 ? 'opacity-100 scale-105' : 'opacity-0 scale-75'
            }`}
            style={{
              boxShadow: '0 0 45px rgba(6, 182, 212, 0.25)',
            }}
          />

          {/* Center Brand Icon (AutoPing Car) */}
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 border border-cyan-400/40 shadow-[0_0_50px_rgba(37,99,235,0.6)]">
            <Car className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]" />

            {/* Micro pulse corner pip */}
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22D3EE] animate-pulse" />
          </div>
        </div>

        {/* Brand Name Text */}
        <div
          className={`mt-5 sm:mt-6 transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            phase >= 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white flex items-center justify-center">
            <span>Auto</span>
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-sky-200 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(56,189,248,0.5)]">
              Ping
            </span>
          </h1>
        </div>

        {/* PHASE 4: TAGLINE REVEAL */}
        <div
          className={`mt-2.5 sm:mt-3 flex flex-col items-center transition-all duration-600 ease-out ${
            phase >= 3
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          {/* Primary Tagline */}
          <p className="text-xs sm:text-sm font-semibold tracking-[0.26em] uppercase text-cyan-300/90 drop-shadow-[0_0_12px_rgba(6,182,212,0.4)]">
            Never Miss a Service
          </p>

          {/* Secondary Subtitle */}
          <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-light tracking-wide">
            Smarter vehicle care. Every journey.
          </p>

          {/* Dynamic Telemetry Status Bar */}
          <div className="mt-6 flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm shadow-inner">
            {switchTarget?.role === 'ADMIN' ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-[0_0_8px_#F59E0B]" />
                </span>
                <span className="text-[10px] font-mono tracking-widest text-amber-300 font-semibold uppercase flex items-center gap-1.5">
                  <Shield className="w-3 h-3 text-amber-400 inline" />
                  Switching to Admin Console • Authorized
                </span>
              </>
            ) : switchTarget?.role === 'CUSTOMER' ? (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22D3EE]" />
                </span>
                <span className="text-[10px] font-mono tracking-widest text-cyan-300 font-semibold uppercase flex items-center gap-1.5">
                  <Car className="w-3 h-3 text-cyan-400 inline" />
                  Switching to Customer Dashboard • Ready
                </span>
              </>
            ) : (
              <>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10B981]" />
                </span>
                <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">
                  System Online • Telemetry Synced
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cinematic Edge Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.85)',
        }}
      />
    </div>
  );
}
