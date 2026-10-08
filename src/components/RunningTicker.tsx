'use client';

import React, { useState } from 'react';
import { Sparkles, Shield, Wrench, Zap, Clock, Star, X } from 'lucide-react';

export default function RunningTicker() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const tickerItems = [
    {
      icon: Zap,
      badge: 'Live',
      badgeColor: 'bg-[#34C759] text-white',
      text: 'Instant Slot Booking confirmed in under 60 seconds with live garage availability',
    },
    {
      icon: Shield,
      badge: 'Certified',
      badgeColor: 'bg-[#0071E3] text-white',
      text: '100% Genuine OEM & Manufacturer Certified Workshop Network',
    },
    {
      icon: Sparkles,
      badge: 'Special',
      badgeColor: 'bg-[#FF9500] text-white',
      text: 'Exclusive 20% Off Comprehensive Vehicle Health Checkup & Diagnostics this month',
    },
    {
      icon: Wrench,
      badge: 'Smart Telemetry',
      badgeColor: 'bg-[#5856D6] text-white',
      text: 'Algorithmic Component Wear Prediction for Brakes, Engine Oil & Battery',
    },
    {
      icon: Star,
      badge: 'Top Rated',
      badgeColor: 'bg-[#FF2D55] text-white',
      text: 'Over 25,000+ happy vehicle owners · 4.9/5 Service Satisfaction',
    },
  ];

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0d1117] via-[#161b22] to-[#0d1117] dark:from-[#050505] dark:via-[#111111] dark:to-[#050505] text-[#f5f5f7] border-b border-white/[0.08] text-[12px] h-9 flex items-center z-50 select-none shadow-sm">
      {/* Ambient glowing accent lines */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#0071E3] via-[#34C759] to-transparent opacity-75" />

      {/* Left fixed badge */}
      <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md z-10 shrink-0 font-medium text-[11px] border-r border-white/10 tracking-wider uppercase">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C759] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34C759]" />
        </span>
        <span className="text-[#34C759] font-bold">AutoPing</span>
        <span className="text-white/60">Live Feed</span>
      </div>

      {/* Marquee Track container */}
      <div className="relative flex-1 overflow-hidden group flex items-center">
        <div className="flex animate-running-ticker whitespace-nowrap group-hover:[animation-play-state:paused]">
          {[...tickerItems, ...tickerItems].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-2.5 mx-6 transition-opacity hover:opacity-100 opacity-90 cursor-default"
              >
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${item.badgeColor}`}
                >
                  {item.badge}
                </span>
                <Icon className="w-3.5 h-3.5 text-[#2997FF] shrink-0" />
                <span className="text-white/90 text-[12px] font-medium tracking-tight">
                  {item.text}
                </span>
                <span className="text-white/30 ml-4">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={() => setIsVisible(false)}
        title="Dismiss announcement"
        className="px-2.5 h-full flex items-center text-white/50 hover:text-white hover:bg-white/10 transition-colors shrink-0 z-10"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
