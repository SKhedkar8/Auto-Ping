'use client';

import React, { useEffect, useState } from 'react';
import { Download, Smartphone, X } from 'lucide-react';

export default function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker in production/client
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('AutoPing PWA Service Worker registered:', reg.scope);
          })
          .catch((err) => {
            console.warn('PWA Service Worker registration failed:', err);
          });
      });
    }

    // 2. Check if already running in standalone PWA window
    if (typeof window !== 'undefined') {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);

      // Check local storage for dismissal
      const dismissed = localStorage.getItem('autoping_pwa_dismissed');
      if (dismissed) {
        setIsDismissed(true);
      }
    }

    // 3. Listen for Android/Desktop native install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Listen for custom trigger event
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
            setIsInstallable(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        alert(
          'To install AutoPing:\n• On iPhone/iPad: Tap Share ⎋ and select "Add to Home Screen".\n• On Android/Chrome: Tap Chrome menu (⋮) and select "Install app".'
        );
      }
    };
    window.addEventListener('autoping_trigger_pwa_install', handleTriggerInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('autoping_trigger_pwa_install', handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert(
        'To install AutoPing on your device:\n\n• On iOS (Safari): Tap the Share button at the bottom and choose "Add to Home Screen".\n• On Android (Chrome): Tap the three dots menu at top right and choose "Install app" or "Add to Home Screen".'
      );
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem('autoping_pwa_dismissed', 'true');
    } catch {}
  };

  // Do not show prompt if already installed, dismissed, or not ready
  if (isStandalone || isDismissed || !isInstallable) {
    return null;
  }

  return (
    <aside
      aria-label="Install AutoPing application"
      className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40 max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl p-3.5 flex items-center justify-between gap-3.5 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-bold text-xs text-slate-900 dark:text-white">Install AutoPing App</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Fast 1-tap vehicle care on your home screen</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={handleInstallClick}
          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
