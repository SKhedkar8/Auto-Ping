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
  Trash2,
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
  onDelete?: (id: string) => void;
}

export default function VehicleBigPopupModal({
  vehicle,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: VehicleBigPopupModalProps) {
  if (!isOpen) return null;

  const isGood = vehicle.healthScore >= 80;
  const isAttention = vehicle.healthScore >= 60 && vehicle.healthScore < 80;

  const isBike = vehicle.type === 'BIKE' || vehicle.type === 'SCOOTER';
  const defaultImage = isBike
    ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=900&auto=format&fit=crop&q=80';

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto md:overflow-hidden animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl lg:max-w-6xl max-h-[92vh] flex flex-col md:flex-row bg-white dark:bg-[#121214] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* TOP-RIGHT CLOSE BUTTON (Always visible across all screen resolutions) */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-50 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/85 hover:bg-slate-900 text-white dark:bg-white/15 dark:hover:bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-105 active:scale-95"
          aria-label="Close vehicle details"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* LEFT COLUMN: Vehicle Showcase, Photo & Identity */}
        <div className="w-full md:w-[380px] lg:w-[420px] xl:w-[460px] shrink-0 bg-slate-950 text-white flex flex-col justify-between overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800">
          {/* Vehicle Image Container */}
          <div className="relative h-56 sm:h-64 md:h-72 w-full bg-slate-900 overflow-hidden flex items-center justify-center shrink-0">
            <img
              src={vehicle.imageUrl || defaultImage}
              alt={`${vehicle.brandName} ${vehicle.modelName}`}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = defaultImage;
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />

            {/* Live Telemetry Connected Pill */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 shadow-md">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Telemetry Connected
              </span>
            </div>
          </div>

          {/* Vehicle Identity Details & Health Score on Left */}
          <div className="p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-3">
              {/* Registration & Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-white/15 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider uppercase border border-white/25 text-white shadow-xs">
                  {vehicle.registrationNo}
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {vehicle.purchaseYear} • {vehicle.fuelType}
                </span>
                <span className="text-[11px] uppercase text-slate-400 font-semibold px-2 py-0.5 rounded bg-white/10 border border-white/10">
                  {vehicle.type}
                </span>
              </div>

              {/* Vehicle Title */}
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {vehicle.brandName} {vehicle.modelName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {vehicle.vehicleClass ? `${vehicle.vehicleClass.toUpperCase()} Class` : 'Personal Vehicle'}
                </p>
              </div>
            </div>

            {/* Health Score Card */}
            <div
              className={`p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between ${
                isGood
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : isAttention
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/30'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                  Vehicle Health Score
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
                    {vehicle.healthScore}%
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white/15 text-slate-200">
                    {vehicle.healthRating || (isGood ? 'Optimal' : isAttention ? 'Attention' : 'Critical')}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {isGood ? 'All systems nominal' : isAttention ? 'Service recommended soon' : 'Immediate service needed'}
                </span>
              </div>

              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                  isGood
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : isAttention
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>

            {/* Left Column Quick Stats / Status */}
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Current Reading:</span>
                <span className="font-semibold text-white font-mono">{vehicle.currentKm.toLocaleString()} KM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">PUC &amp; Insurance:</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid &amp; Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Information, Diagnostics, Telemetry & Actions */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#121214] overflow-hidden">
          {/* Header Bar */}
          <div className="p-5 sm:p-6 pb-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between pr-14 sm:pr-16 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Diagnostics &amp; Telemetry Overview
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Real-time predictive telemetry, sensor statuses, and maintenance intervals
              </p>
            </div>
          </div>

          {/* Scrollable Information Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* 4 PRIMARY METRIC TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Odometer
                </span>
                <span className="text-base sm:text-xl font-extrabold font-mono text-slate-900 dark:text-white block">
                  {vehicle.currentKm.toLocaleString()} KM
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Live reading</span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Next Service Due
                </span>
                <span className="text-base sm:text-xl font-extrabold font-mono text-blue-600 dark:text-blue-400 block">
                  {vehicle.kmRemaining.toLocaleString()} KM
                </span>
                <span className="text-[11px] text-blue-600/75 dark:text-blue-400/75 block mt-0.5">
                  Target Interval
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                  Timeline
                </span>
                <span className="text-base sm:text-xl font-extrabold font-mono text-amber-600 dark:text-amber-400 block">
                  {vehicle.daysRemaining} Days
                </span>
                <span className="text-[11px] text-amber-600/75 dark:text-amber-400/75 block mt-0.5">
                  Estimated schedule
                </span>
              </div>

              <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
                  Reliability Grade
                </span>
                <span className="text-base sm:text-xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 block">
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
                <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Component Diagnostics &amp; Health Sensors
                </h4>
                <span className="text-xs text-slate-400 font-medium">
                  {vehicle.components?.length || 6} Sensors Active
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vehicle.components &&
                  vehicle.components.map((comp) => {
                    const isCompGood = comp.status === 'GOOD';
                    const isDue = comp.status === 'DUE_SOON';

                    return (
                      <div
                        key={comp.component}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200/70 dark:border-white/10 flex items-center justify-between transition-all hover:border-slate-300 dark:hover:border-white/20"
                      >
                        <div className="pr-2 min-w-0">
                          <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                            {comp.label}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            {comp.reason ||
                              (comp.kmRemaining
                                ? `${comp.kmRemaining.toLocaleString()} KM remaining`
                                : 'Component in normal operating condition')}
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0 border ${
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

            {/* RECOMMENDED SERVICES (IF ANY) */}
            {vehicle.recommendedServices && vehicle.recommendedServices.length > 0 && (
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-2">
                  System Recommended Interventions
                </span>
                <div className="flex flex-wrap gap-2">
                  {vehicle.recommendedServices.map((service, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-100/70 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TELEMETRY & WARRANTY SUMMARY */}
            <div className="p-4 rounded-2xl bg-slate-100/70 dark:bg-white/[0.04] border border-slate-200/70 dark:border-white/[0.08] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Last Service Recorded:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {vehicle.lastServiceDate || '2026-06-12'} •{' '}
                  {vehicle.lastServiceKm ? vehicle.lastServiceKm.toLocaleString() : '10,000'} KM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Next Service Threshold:</span>
                <span className="font-semibold text-slate-900 dark:text-white font-mono">
                  {vehicle.nextServiceKm ? vehicle.nextServiceKm.toLocaleString() : '20,000'} KM
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Diagnostic Connectivity:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> High Precision CAN-Bus Active
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM PINNED ACTION BAR */}
          <div className="shrink-0 p-4 sm:p-5 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(vehicle);
                  }}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Edit Specs &amp; Photo
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(vehicle.id);
                  }}
                  className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 hover:text-white border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-600 dark:text-rose-400 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Remove vehicle from account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete Vehicle
                </button>
              )}
              <a
                href="/history"
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Service Logs
              </a>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
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
    </div>
  );
}
