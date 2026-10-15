'use client';

import React from 'react';
import {
  Heart,
  Gauge,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Fuel,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Vehicle } from '@/lib/types';

interface VehicleHoverCardProps {
  vehicle: Vehicle;
}

export default function VehicleHoverCard({ vehicle }: VehicleHoverCardProps) {
  const isGood = vehicle.healthScore >= 80;
  const isAttention = vehicle.healthScore >= 60 && vehicle.healthScore < 80;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3.5">
      {/* Frosted Glass Telemetry HUD Card */}
      <div className="w-full bg-black/85 dark:bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-3.5 text-white shadow-2xl transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
        {/* Top Header Row */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/90">
              Garage Live Telemetry
            </span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isGood
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : isAttention
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {vehicle.healthScore}% {vehicle.healthRating}
          </span>
        </div>

        {/* 3 Metrics Mini Grid */}
        <div className="grid grid-cols-3 gap-1.5 mb-2.5 text-center">
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] uppercase text-white/60 block">Odometer</span>
            <span className="text-xs font-bold font-mono text-white">
              {vehicle.currentKm.toLocaleString()} KM
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] uppercase text-white/60 block">Next Service</span>
            <span className="text-xs font-bold font-mono text-[#2997FF]">
              {vehicle.kmRemaining.toLocaleString()} KM
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
            <span className="text-[9px] uppercase text-white/60 block">Timeline</span>
            <span className="text-xs font-bold text-amber-300">
              {vehicle.daysRemaining}d left
            </span>
          </div>
        </div>

        {/* Components Health Badges */}
        <div className="mb-2">
          <span className="text-[9px] uppercase tracking-wider text-white/60 block mb-1">
            Component Diagnostics:
          </span>
          <div className="flex flex-wrap gap-1">
            {vehicle.components && vehicle.components.slice(0, 4).map((c) => (
              <span
                key={c.component}
                className={`px-1.5 py-0.5 rounded text-[9px] font-medium flex items-center gap-1 ${
                  c.status === 'GOOD'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/50'
                    : c.status === 'DUE_SOON'
                    ? 'bg-amber-950/80 text-amber-300 border border-amber-800/50'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                }`}
              >
                <span>{c.label.split(' ')[0]}</span>
                <span>{c.status === 'GOOD' ? '✓' : '!'}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Details Footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/70">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#2997FF]" />
            Last: {vehicle.lastServiceDate || 'Factory New'}
          </span>
          <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
            <Sparkles className="w-2.5 h-2.5" />
            Live Monitored
          </span>
        </div>
      </div>
    </div>
  );
}
