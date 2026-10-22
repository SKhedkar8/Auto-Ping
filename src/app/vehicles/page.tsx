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
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import EditVehicleModal from '@/components/EditVehicleModal';
import ServiceBackground from '@/components/ServiceBackground';
import VehicleBigPopupModal from '@/components/VehicleBigPopupModal';
import { getClientSession } from '@/lib/auth';
import { Vehicle } from '@/lib/types';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [inspectedVehicle, setInspectedVehicle] = useState<Vehicle | null>(null);

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

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!confirm('Are you sure you want to remove this vehicle from your account? This action cannot be undone.')) return;

    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVehicles((prev) => prev.filter((v) => v.id !== id));
        if (inspectedVehicle?.id === id) {
          setInspectedVehicle(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete vehicle', err);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 overflow-x-hidden">
      <ServiceBackground />
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Registered Vehicles
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live diagnostics, component status timelines, and service intervals for your garage.
            </p>
          </div>

          <a
            href="/onboarding/vehicle"
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add New Vehicle
          </a>
        </div>

        {vehicles.length === 0 && !isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center max-w-md mx-auto my-12 border border-slate-200 dark:border-slate-800 shadow-xs">
            <Car className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">No Vehicles Registered</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Add a vehicle to enable predictive tracking.</p>
            <a
              href="/onboarding/vehicle"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium inline-flex items-center gap-2 transition-colors shadow-xs"
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
                  className="group relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between transition-all hover:shadow-lg hover:border-blue-500/50"
                >
                  {/* Vehicle Image Banner with Big Popup Hover Trigger */}
                  <div
                    onClick={() => setInspectedVehicle(v)}
                    className="relative h-48 overflow-hidden bg-slate-900 cursor-pointer"
                  >
                    <img
                      src={
                        v.imageUrl ||
                        (v.type === 'BIKE' || v.type === 'SCOOTER'
                          ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80'
                          : 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80')
                      }
                      alt={`${v.brandName} ${v.modelName}`}
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Status badge - top right, high z-index */}
                    <div className="absolute top-3 right-3 z-30 pointer-events-none">
                      {isOverdue ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 text-white shadow-md">
                          Overdue
                        </span>
                      ) : isDueSoon ? (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-white shadow-md">
                          Due in {v.daysRemaining}d
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white shadow-md">
                          Good
                        </span>
                      )}
                    </div>

                    {/* Delete and Edit buttons - ALWAYS visible and clickable (z-30), never hidden by hover */}
                    <div className="absolute top-3 left-3 z-30 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(v.id, e)}
                        title="Delete Vehicle"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 shadow-md transition-all flex items-center gap-1.5 text-xs font-semibold hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:text-white" />
                        <span>Delete</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingVehicle(v);
                        }}
                        title="Edit Details & Image"
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-[#0071E3] text-white backdrop-blur-md border border-white/20 shadow-md transition-all flex items-center gap-1.5 text-xs font-semibold hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5 text-blue-300" />
                        <span>Edit</span>
                      </button>
                    </div>

                    {/* Smooth Hover Overlay: Click to Popup Big Size (z-10 and pointer-events-none so it NEVER obscures or blocks clicks to buttons) */}
                    <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-xs pointer-events-none">
                      <span className="px-4 py-2 rounded-full bg-white/95 dark:bg-black/90 text-slate-900 dark:text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Click to View Full Details
                      </span>
                    </div>

                    {/* Name overlay */}
                    <div className="absolute bottom-3 left-4">
                      <h3 className="font-bold text-base text-white">
                        {v.brandName} {v.modelName}
                      </h3>
                      <p className="text-xs text-slate-300 font-mono">
                        {v.registrationNo} • {v.fuelType} • Year {v.purchaseYear}
                      </p>
                    </div>
                  </div>

                  <div className="p-5">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 mb-5 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          Odometer
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">
                          {v.currentKm.toLocaleString()} KM
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          Next Service
                        </span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400 font-mono">
                          {v.kmRemaining.toLocaleString()} KM
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                          Health
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {v.healthScore}%
                        </span>
                      </div>
                    </div>

                    {/* Component Pills preview */}
                    <div className="space-y-1.5 mb-5">
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                        Diagnostics Status:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {v.components.slice(0, 5).map((c) => (
                          <span
                            key={c.component}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                              c.status === 'GOOD'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                                : c.status === 'DUE_SOON'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                            }`}
                          >
                            {c.label.split(' ')[0]}: {c.status === 'GOOD' ? 'Good' : c.status === 'DUE_SOON' ? 'Due' : 'Alert'}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => handleDelete(v.id, e)}
                        className="py-2 px-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                      <button
                        onClick={() => setEditingVehicle(v)}
                        className="py-2 px-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 shrink-0"
                        title="Edit Vehicle Details & Image"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#0071E3]" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setInspectedVehicle(v)}
                        className="flex-1 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500" />
                        Inspect Health
                      </button>
                      <a
                        href={`/services/book?vehicleId=${v.id}`}
                        className="flex-1 py-2 rounded-lg bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-medium text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Book
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Big Size Vehicle Detail Popup Modal */}
        {inspectedVehicle && (
          <VehicleBigPopupModal
            vehicle={inspectedVehicle}
            isOpen={true}
            onClose={() => setInspectedVehicle(null)}
            onEdit={(veh) => setEditingVehicle(veh)}
            onDelete={(id) => handleDelete(id)}
          />
        )}

        {/* Edit Vehicle Modal */}
        {editingVehicle && (
          <EditVehicleModal
            vehicle={editingVehicle}
            isOpen={true}
            onClose={() => setEditingVehicle(null)}
            onUpdated={(updated) => {
              setVehicles((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
              setEditingVehicle(null);
            }}
          />
        )}
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
