'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Calendar,
  Car,
  ChevronRight,
  Flame,
  Gauge,
  Heart,
  Plus,
  Trash2,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Vehicle } from '@/lib/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getClientSession();
    fetch(`/api/vehicles?userId=${user?.id || 'user-customer-1'}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setVehicles(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to remove this vehicle from your account?')) return;

    try {
      await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      setVehicles((prev) => prev.filter((v) => v.id !== id));
    } catch {}
  };

  return (
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Registered Vehicles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live diagnostics, component status timelines, and service intervals for your garage.
            </p>
          </div>

          <a
            href="/onboarding/vehicle"
            className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 flex items-center gap-2 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Vehicle
          </a>
        </div>

        {vehicles.length === 0 && !isLoading ? (
          <div className="glass-card p-12 text-center max-w-lg mx-auto my-12">
            <Car className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">No Vehicles Registered</h3>
            <p className="text-xs text-slate-500 mb-6">Add a vehicle to enable predictive tracking.</p>
            <a
              href="/onboarding/vehicle"
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-xs inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Vehicle
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((v) => {
              const isOverdue = v.dueStatus === 'OVERDUE';
              const isDueSoon = v.dueStatus === 'DUE_SOON';

              return (
                <div
                  key={v.id}
                  className="glass-card border border-white dark:border-slate-700/50 relative overflow-hidden flex flex-col justify-between"
                >
                  {/* Vehicle Image Banner */}
                  <div className="relative h-36 overflow-hidden rounded-t-[1.25rem]">
                    <img
                      src={
                        v.imageUrl ||
                        (v.type === 'BIKE' || v.type === 'SCOOTER'
                          ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80')
                      }
                      alt={`${v.brandName} ${v.modelName}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      {isOverdue ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm">
                          Overdue
                        </span>
                      ) : isDueSoon ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm">
                          Due in {v.daysRemaining}d
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                          Good
                        </span>
                      )}
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDelete(v.id, e)}
                      title="Remove Vehicle"
                      className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/30 hover:bg-rose-600/80 text-white transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Name overlay */}
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-extrabold text-base text-white drop-shadow">
                        {v.brandName} {v.modelName}
                      </h3>
                      <p className="text-[11px] text-white/80 font-mono">
                        {v.registrationNo} • {v.fuelType} • Year {v.purchaseYear}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">


                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-5 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-600 block mb-0.5">
                          Odometer
                        </span>
                        <span className="text-sm font-black text-slate-950">
                          {v.currentKm.toLocaleString()} KM
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-600 block mb-0.5">
                          Next Service
                        </span>
                        <span className="text-sm font-black text-blue-700">
                          {v.kmRemaining.toLocaleString()} KM
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-extrabold text-slate-600 block mb-0.5">
                          Health Score
                        </span>
                        <span className="text-sm font-black text-emerald-700">
                          {v.healthScore}%
                        </span>
                      </div>
                    </div>

                    {/* Component Pills preview */}
                    <div className="space-y-1.5 mb-6">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Component Condition Status:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {v.components.slice(0, 5).map((c) => (
                          <span
                            key={c.component}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              c.status === 'GOOD'
                                ? 'bg-emerald-50 text-emerald-700'
                                : c.status === 'DUE_SOON'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {c.label.split(' ')[0]}: {c.status === 'GOOD' ? '🟢' : c.status === 'DUE_SOON' ? '🟡' : '🔴'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                      <a
                        href={`/vehicles/${v.id}`}
                        className="flex-1 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 text-center shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        View Health & Timeline
                      </a>
                      <a
                        href={`/services/book?vehicleId=${v.id}`}
                        className="flex-1 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold text-center shadow-xs hover:opacity-95 flex items-center justify-center gap-1.5"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Book Service
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
