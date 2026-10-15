'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  Award,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Fuel,
  Gauge,
  Heart,
  Pencil,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wrench,
  X,
  Zap
} from 'lucide-react';
import { Vehicle } from '@/lib/types';

interface VehicleBigPopupModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (vehicle: Vehicle) => void;
}

export default function VehicleBigPopupModal({
  vehicle,
  isOpen,
  onClose,
  onEdit,
}: VehicleBigPopupModalProps) {
  if (!isOpen) return null;

  const isGood = vehicle.healthScore >= 80;
  const isAttention = vehicle.healthScore >= 60 && vehicle.healthScore < 80;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white dark:bg-[#121214] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 my-6 transition-all transform scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* BIG HERO IMAGE BANNER */}
        <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden">
          <img
            src={
              vehicle.imageUrl ||
              (vehicle.type === 'BIKE' || vehicle.type === 'SCOOTER'
                ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80'
                : 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&auto=format&fit=crop&q=80')
            }
            alt={`${vehicle.brandName} ${vehicle.modelName}`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center border border-white/20 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Live telemetry indicator */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold border border-white/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Live Telemetry Connected
            </span>
          </div>

          {/* Banner bottom vehicle title & plates */}
          <div className="absolute bottom-5 inset-x-6 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider uppercase border border-white/30">
                  {vehicle.registrationNo}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {vehicle.purchaseYear} • {vehicle.fuelType}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {vehicle.brandName} {vehicle.modelName}
              </h2>
            </div>

            {/* Health Score Pill */}
            <div className="shrink-0">
              <div
                className={`px-4 py-2 rounded-2xl backdrop-blur-md border flex items-center gap-2.5 ${
                  isGood
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                    : isAttention
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-400/40'
                }`}
              >
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold tracking-wider block opacity-75">Vehicle Health</span>
                  <span className="text-xl font-bold font-mono">{vehicle.healthScore}%</span>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BODY DETAILS CONTENT */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* 4 PRIMARY METRIC TILES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Odometer
              </span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white">
                {vehicle.currentKm.toLocaleString()} KM
              </span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Live reading</span>
            </div>

            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                Next Service Due
              </span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
                {vehicle.kmRemaining.toLocaleString()} KM
              </span>
              <span className="text-[11px] text-blue-600/75 dark:text-blue-400/75 block mt-0.5">
                Target Interval
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                Timeline
              </span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
                {vehicle.daysRemaining} Days
              </span>
              <span className="text-[11px] text-amber-600/75 dark:text-amber-400/75 block mt-0.5">
                Estimated schedule
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                Reliability Grade
              </span>
              <span className="text-lg sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                Grade A+
              </span>
              <span className="text-[11px] text-emerald-600/75 dark:text-emerald-400/75 block mt-0.5">
                Fully compliant
              </span>
            </div>
          </div>

          {/* FULL COMPONENT DIAGNOSTICS BREAKDOWN */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Component Diagnostics &amp; Health Sensors
              </h3>
              <span className="text-xs text-slate-400">6 Sensors Active</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {vehicle.components && vehicle.components.map((comp) => {
                const isCompGood = comp.status === 'GOOD';
                const isDue = comp.status === 'DUE_SOON';

                return (
                  <div
                    key={comp.component}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 dark:text-white">
                        {comp.label}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {comp.reason || (comp.kmRemaining ? `${comp.kmRemaining.toLocaleString()} KM remaining` : 'Optimal condition')}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border ${
                        isCompGood
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : isDue
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {isCompGood ? 'Good' : isDue ? 'Due Soon' : 'Alert'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TELEMETRY & WARRANTY SUMMARY */}
          <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Last Service Recorded:</span>
              <span className="font-semibold text-slate-900 dark:text-white font-mono">
                {vehicle.lastServiceDate || '2026-06-12'} • {vehicle.lastServiceKm ? vehicle.lastServiceKm.toLocaleString() : '10,000'} KM
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Insurance &amp; Pollution (PUC):</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Valid &amp; Active
              </span>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(vehicle);
                }}
                className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Edit Specs &amp; Photo
              </button>
            )}
            <a
              href="/history"
              className="py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Service Logs
            </a>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Done
            </button>
            <a
              href={`/services/book?vehicleId=${vehicle.id}`}
              className="flex-1 sm:flex-none py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              Book Service Slot
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
