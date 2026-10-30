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
  Wrench,
  LayoutGrid,
  List,
  Table
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
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'content'>('grid');

  useEffect(() => {
    const user = getClientSession();
    fetch(`/api/vehicles?userId=${user?.id || 'user-customer-1'}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
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
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40 uppercase tracking-wider">
                Garage Inventory
              </span>
              <span className="text-xs text-slate-400">
                • {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              My Garage
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Live diagnostics, component status timelines, and service intervals for your garage vehicles.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            {/* View Mode Toggle: Grid, List, Content */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-slate-700/80 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="List Rows View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">List</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('content')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'content'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title="Compact Table / Content View"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Content</span>
              </button>
            </div>

            <a
              href="/onboarding/vehicle"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add Vehicle to Garage
            </a>
          </div>
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
        ) : viewMode === 'content' ? (
          /* CONTENT / COMPACT TABLE VIEW */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="py-3 px-4">Vehicle</th>
                    <th className="py-3 px-4">Registration</th>
                    <th className="py-3 px-4">Odometer</th>
                    <th className="py-3 px-4">Next Service Due</th>
                    <th className="py-3 px-4">Health Score</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {vehicles.map((v) => {
                    const isOverdue = v.dueStatus === 'OVERDUE';
                    const isDueSoon = v.dueStatus === 'DUE_SOON';
                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={v.imageUrl || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80'}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 cursor-pointer"
                              onClick={() => setInspectedVehicle(v)}
                            />
                            <div>
                              <p className="font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer" onClick={() => setInspectedVehicle(v)}>
                                {v.brandName} {v.modelName}
                              </p>
                              <span className="text-[10px] text-slate-400 uppercase font-mono">{v.fuelType} • {v.purchaseYear}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {v.registrationNo}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                          {v.currentKm.toLocaleString()} km
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : isDueSoon ? 'text-amber-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                            {v.kmRemaining.toLocaleString()} km ({v.daysRemaining}d)
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {v.healthScore}%
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOverdue
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                              : isDueSoon
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {isOverdue ? 'Overdue' : isDueSoon ? `Due Soon` : 'Optimal'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectedVehicle(v)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Inspect Details"
                            >
                              <Heart className="w-3.5 h-3.5 text-rose-500" />
                            </button>
                            <button
                              onClick={() => setEditingVehicle(v)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                              title="Edit Vehicle"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(v.id, e)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <a
                              href={`/services/book?vehicleId=${v.id}`}
                              className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-[11px] transition-colors"
                            >
                              Book
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : viewMode === 'list' ? (
          /* LIST VIEW (HORIZONTAL CARDS) */
          <div className="space-y-4">
            {vehicles.map((v) => {
              const isOverdue = v.dueStatus === 'OVERDUE';
              const isDueSoon = v.dueStatus === 'DUE_SOON';
              return (
                <div
                  key={v.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-4 flex flex-col md:flex-row items-center justify-between gap-4 transition-all hover:shadow-md hover:border-blue-400/50"
                >
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <img
                      src={v.imageUrl || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80'}
                      alt=""
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-800 shrink-0 cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => setInspectedVehicle(v)}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-bold text-base text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                          onClick={() => setInspectedVehicle(v)}
                        >
                          {v.brandName} {v.modelName}
                        </h3>
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {v.registrationNo}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">
                        {v.fuelType} • Year {v.purchaseYear} • Class: {v.vehicleClass}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Odometer: <strong className="text-slate-900 dark:text-white font-mono">{v.currentKm.toLocaleString()} km</strong>
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Health: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{v.healthScore}%</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                    <div className="text-left md:text-right">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOverdue
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                          : isDueSoon
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {isOverdue ? 'Overdue' : isDueSoon ? `Due in ${v.daysRemaining}d` : 'Optimal'}
                      </span>
                      <p className="text-[11px] font-mono text-slate-500 mt-1">
                        Due: {v.kmRemaining.toLocaleString()} km left
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectedVehicle(v)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="View Full Vehicle Details"
                      >
                        <Heart className="w-4 h-4 text-rose-500" />
                      </button>
                      <button
                        onClick={() => setEditingVehicle(v)}
                        className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                        title="Edit Vehicle"
                      >
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(v.id, e)}
                        className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Vehicle"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <a
                        href={`/services/book?vehicleId=${v.id}`}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
                      >
                        Book Slot
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW (ORIGINAL RICH CARDS) */
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
