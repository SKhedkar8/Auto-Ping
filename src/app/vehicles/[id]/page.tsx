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
      <div className="min-h-screen flex flex-col gradient-mesh">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-8 h-8 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex flex-col gradient-mesh">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8 text-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Vehicle Not Found</h2>
            <a href="/vehicles" className="text-sm font-semibold text-blue-600 hover:underline">
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
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between mb-6">
          <a
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Vehicles
          </a>

          <a
            href={`/services/book?vehicleId=${vehicle.id}`}
            className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 flex items-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            Book Service for this Vehicle
          </a>
        </div>

        {/* HERO VEHICLE HEADER CARD */}
        <div className="glass-card p-6 sm:p-8 border border-white shadow-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-2xl shadow-inner">
                <Car className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {vehicle.brandName} {vehicle.modelName}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-700 text-xs font-bold uppercase">
                    {vehicle.fuelType}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">
                  Registration: <strong className="text-slate-700">{vehicle.registrationNo}</strong> • Year: {vehicle.purchaseYear} • Class: {vehicle.vehicleClass.toUpperCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 px-4 rounded-xl bg-white border border-slate-200 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Current Odometer
                </span>
                <span className="text-lg font-black text-slate-900">
                  {vehicle.currentKm.toLocaleString()} KM
                </span>
              </div>

              <button
                onClick={() => setShowKmModal(true)}
                className="px-3.5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Update Current KM"
              >
                <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                Update KM
              </button>
            </div>
          </div>
        </div>

        {/* HEALTH SCORE RING & OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Health Score Ring Card */}
          <div className="lg:col-span-5 glass-card p-6 sm:p-8 border border-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
                  <h3 className="font-extrabold text-base text-slate-900">Vehicle Health Score</h3>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    vehicle.healthScore >= 85
                      ? 'bg-emerald-100 text-emerald-800'
                      : vehicle.healthScore >= 70
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {vehicle.healthRating}
                </span>
              </div>

              {/* Visual Radial Score Ring */}
              <div className="relative w-48 h-48 mx-auto my-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="#E2E8F0"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  {/* Progress */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke={
                      vehicle.healthScore >= 85 ? '#22C55E' : vehicle.healthScore >= 70 ? '#0B5CFF' : '#F59E0B'
                    }
                    strokeWidth="10"
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * vehicle.healthScore) / 100}
                    strokeLinecap="round"
                    fill="transparent"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-4xl font-black text-slate-900">{vehicle.healthScore}%</span>
                  <span className="text-[11px] font-semibold text-slate-500">Diagnostic Score</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-100 text-xs text-slate-600 mt-2">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 mb-1">
                  <Info className="w-3.5 h-3.5" />
                  Why this score?
                </div>
                <p className="text-[11px] leading-relaxed">
                  Weighted evaluation of 7 essential subsystems. Engine oil and brake pad inspection intervals carry 40% total weight.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center text-xs mt-4">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] font-semibold">Service Due In</span>
                <span className="text-sm font-bold text-slate-900">{vehicle.daysRemaining} Days</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <span className="text-slate-400 block text-[10px] font-semibold">Distance Remaining</span>
                <span className="text-sm font-bold text-slate-900">{vehicle.kmRemaining.toLocaleString()} KM</span>
              </div>
            </div>
          </div>

          {/* Component Diagnostics Timeline */}
          <div className="lg:col-span-7 glass-card p-6 sm:p-8 border border-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-600" />
                <h3 className="font-extrabold text-base text-slate-900">
                  Subsystem Health Timeline
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">7 Monitored Systems</span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {vehicle.components.map((comp) => {
                const isGood = comp.status === 'GOOD';
                const isDueSoon = comp.status === 'DUE_SOON';
                const isOverdue = comp.status === 'OVERDUE';

                return (
                  <div
                    key={comp.component}
                    className="p-3.5 rounded-2xl bg-white/80 border border-slate-100 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                          isGood ? 'bg-emerald-500' : isDueSoon ? 'bg-amber-500 animate-pulse' : 'bg-rose-500'
                        }`}
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900">{comp.label}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">{comp.reason}</p>
                        {comp.nextDueKm && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Next milestone: {comp.nextDueKm.toLocaleString()} KM
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 ${
                        isGood
                          ? 'bg-emerald-100 text-emerald-800'
                          : isDueSoon
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Upcoming Milestones Schedule */}
          <div className="lg:col-span-6 glass-card p-6 border border-white">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-extrabold text-sm text-slate-900">Recommended Milestone Schedule</h3>
            </div>

            <div className="space-y-4">
              {milestones.map((km, idx) => (
                <div
                  key={km}
                  className={`p-4 rounded-2xl border ${
                    idx === 0
                      ? 'bg-blue-50/70 border-blue-200'
                      : 'bg-white/70 border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900">{km.toLocaleString()} KM Service</span>
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                        Next Up
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {idx === 0
                      ? 'Full synthetic engine oil, oil filter, tyre rotation, and brake pad check.'
                      : 'Spark plug diagnosis, coolant flush, fuel filter replacement, and suspension tuning.'}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Est. Cost: ₹3,500 – ₹5,000</span>
                    <span>Interval: Every {baseInterval.toLocaleString()} KM</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Past Service History Records */}
          <div className="lg:col-span-6 glass-card p-6 border border-white">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-purple-600" />
                <h3 className="font-extrabold text-sm text-slate-900">Service History Records</h3>
              </div>
              <a href="/history" className="text-xs font-bold text-blue-600 hover:underline">
                View All →
              </a>
            </div>

            {records.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No past service logs entered yet for this vehicle.
              </div>
            ) : (
              <div className="space-y-3">
                {records.map((rec) => (
                  <div key={rec.id} className="p-3.5 rounded-2xl bg-white/70 border border-slate-100 text-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900">{rec.centerName}</h4>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {rec.date} • {rec.km.toLocaleString()} KM
                        </span>
                      </div>
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                        ₹{rec.totalCost.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-600 mt-2 font-medium">{rec.servicesDone.join(' • ')}</p>
                    {rec.notes && <p className="text-[11px] text-slate-400 mt-1 italic">{rec.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* UPDATE KM MODAL */}
      {showKmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm glass-dropdown rounded-3xl p-6 shadow-2xl border border-white">
            <h3 className="font-extrabold text-base text-slate-900 mb-1">Update Current KM</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter current odometer reading for {vehicle.brandName} {vehicle.modelName}.
            </p>

            {kmError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {kmError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current Odometer Reading
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newKm}
                  onChange={(e) => setNewKm(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500"
                />
                <span className="absolute right-3.5 top-2 text-xs font-bold text-slate-400">KM</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Previous: {vehicle.currentKm.toLocaleString()} KM
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingKm}
                onClick={handleUpdateKm}
                className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-xs hover:opacity-95"
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
