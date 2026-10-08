'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Battery,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  Gauge,
  Heart,
  History,
  Info,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wind,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { ServiceRecord, Vehicle } from '@/lib/types';

export default function VehicleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vehicleId = params?.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // KM update state
  const [showKmModal, setShowKmModal] = useState(false);
  const [newKm, setNewKm] = useState<number>(0);
  const [kmError, setKmError] = useState('');
  const [isUpdatingKm, setIsUpdatingKm] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;

    Promise.all([
      fetch(`/api/vehicles/${vehicleId}`).then((r) => r.json()),
      fetch(`/api/history?vehicleId=${vehicleId}`).then((r) => r.json()),
    ])
      .then(([vehData, recData]) => {
        if (vehData.data) {
          setVehicle(vehData.data);
          setNewKm(vehData.data.currentKm);
        }
        if (recData.data) {
          setRecords(recData.data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [vehicleId]);

  const handleUpdateKm = async () => {
    if (!vehicle) return;
    if (newKm < vehicle.currentKm) {
      setKmError(`New reading cannot be lower than current reading (${vehicle.currentKm.toLocaleString()} KM).`);
      return;
    }

    setIsUpdatingKm(true);
    setKmError('');

    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentKm: newKm }),
      });
      const data = await res.json();
      setIsUpdatingKm(false);

      if (data.data) {
        setVehicle(data.data);
        setShowKmModal(false);
      } else {
        setKmError(data.error || 'Failed to update KM');
      }
    } catch {
      setIsUpdatingKm(false);
      setKmError('Network error while updating KM');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Vehicle Not Found</h2>
            <a href="/vehicles" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              ← Return to vehicles
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Interval milestones for schedule
  const baseInterval = vehicle.type === 'CAR' ? 10000 : 5000;
  const milestones = [
    Math.ceil(vehicle.currentKm / baseInterval) * baseInterval,
    (Math.ceil(vehicle.currentKm / baseInterval) + 1) * baseInterval,
    (Math.ceil(vehicle.currentKm / baseInterval) + 2) * baseInterval,
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Actions */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Vehicles
          </a>

          <a
            href={`/services/book?vehicleId=${vehicle.id}`}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            Book Service
          </a>
        </div>

        {/* HERO VEHICLE HEADER CARD */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xl border border-blue-100 dark:border-blue-800/50">
                <Car className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {vehicle.brandName} {vehicle.modelName}
                  </h1>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 uppercase">
                    {vehicle.fuelType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Registration: <strong className="text-slate-700 dark:text-slate-200 font-mono">{vehicle.registrationNo}</strong> • Year: {vehicle.purchaseYear} • Class: {vehicle.vehicleClass.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 px-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-right">
                <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block tracking-wider">
                  Current Odometer
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {vehicle.currentKm.toLocaleString()} KM
                </span>
              </div>

              <button
                onClick={() => setShowKmModal(true)}
                className="px-3.5 py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                title="Update Current KM"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Update KM
              </button>
            </div>
          </div>
        </div>

        {/* HEALTH SCORE RING & OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Health Score Ring Card */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Vehicle Health Score</h3>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${
                    vehicle.healthScore >= 85
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      : vehicle.healthScore >= 70
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800'
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {vehicle.healthRating}
                </span>
              </div>

              {/* Visual Radial Score Ring */}
              <div className="relative w-40 h-40 mx-auto my-3 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={
                      vehicle.healthScore >= 85 ? '#16A34A' : vehicle.healthScore >= 70 ? '#1D4ED8' : '#D97706'
                    }
                    strokeWidth="8"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * vehicle.healthScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">{vehicle.healthScore}%</span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Health Index</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-600 dark:text-slate-300 mt-2">
                <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-200 mb-1">
                  <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Diagnostic Methodology
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  Weighted evaluation of 7 essential subsystems. Engine oil and brake pad inspection intervals carry 40% total weight.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-3 text-center text-xs mt-4">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-semibold uppercase">Service Due In</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{vehicle.daysRemaining} Days</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500 block text-[10px] font-semibold uppercase">Distance Left</span>
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono">{vehicle.kmRemaining.toLocaleString()} KM</span>
              </div>
            </div>
          </div>

          {/* Component Diagnostics Timeline */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Subsystem Health Diagnostics
                </h3>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">7 Monitored Systems</span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {vehicle.components.map((comp) => {
                const isGood = comp.status === 'GOOD';
                const isDueSoon = comp.status === 'DUE_SOON';

                return (
                  <div
                    key={comp.component}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${
                          isGood ? 'bg-emerald-500' : isDueSoon ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                      />
                      <div>
                        <h4 className="font-semibold text-xs text-slate-900 dark:text-slate-100">{comp.label}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{comp.reason}</p>
                        {comp.nextDueKm && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                            Next milestone: {comp.nextDueKm.toLocaleString()} KM
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold shrink-0 border ${
                        isGood
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : isDueSoon
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {isGood ? 'Good' : isDueSoon ? 'Due Soon' : 'Overdue'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* MAINTENANCE SCHEDULE & SERVICE RECORDS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Upcoming Milestones Schedule */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Recommended Milestone Schedule</h3>
            </div>

            <div className="space-y-3">
              {milestones.map((km, idx) => (
                <div
                  key={km}
                  className={`p-3.5 rounded-lg border ${
                    idx === 0
                      ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80'
                      : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100 font-mono">{km.toLocaleString()} KM Service</span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white">
                        Next Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {idx === 0
                      ? 'Full synthetic engine oil, oil filter, tyre rotation, and brake pad check.'
                      : 'Spark plug diagnosis, coolant flush, fuel filter replacement, and suspension tuning.'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Est. Cost: ₹3,500 – ₹5,000</span>
                    <span>Interval: Every {baseInterval.toLocaleString()} KM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Service History Records */}
          <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Service History Records</h3>
              </div>
              <a href="/history" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                View All →
              </a>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                No past service logs entered yet for this vehicle.
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{rec.centerName}</h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {rec.date} • {rec.km.toLocaleString()} KM
                        </span>
                      </div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded text-[11px]">
                        ₹{rec.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-2 font-medium">{rec.servicesDone.join(' • ')}</p>
                    {rec.notes && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">{rec.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* UPDATE KM MODAL */}
      {showKmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">Update Current KM</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter current odometer reading for {vehicle.brandName} {vehicle.modelName}.
            </p>

            {kmError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 font-medium">
                {kmError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Odometer Reading
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newKm}
                  onChange={(e) => setNewKm(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
                <span className="absolute right-3.5 top-2 text-xs font-bold text-slate-400">KM</span>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                Previous: {vehicle.currentKm.toLocaleString()} KM
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKmModal(false)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingKm}
                onClick={handleUpdateKm}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                {isUpdatingKm ? 'Recalculating...' : 'Update & Recalculate'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />
    </div>
  );
}
