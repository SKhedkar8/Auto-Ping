'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  ExternalLink,
  Fuel,
  Gauge,
  Heart,
  History,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  ShieldCheck,
  Wrench,
  X
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Booking, User, Vehicle } from '@/lib/types';

// Vehicle image map for known models
const MODEL_IMAGE_MAP: Record<string, string> = {
  // Cars
  'creta': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'venue': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
  'verna': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
  'i20': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80',
  'exter': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
  'tucson': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'nexon': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'punch': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&auto=format&fit=crop&q=80',
  'harrier': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'safari': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
  'altroz': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
  'tiago': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'swift': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'baleno': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80',
  'brezza': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'grand vitara': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'thar': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'xuv700': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
  'scorpio': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'city': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',

  // Bikes & Scooters
  'classic 350': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'hunter': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'bullet': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'activa': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'jupiter': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'pulsar': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
};

function getVehicleImage(vehicle: Vehicle): string {
  if (vehicle.imageUrl) return vehicle.imageUrl;
  const modelLower = vehicle.modelName.toLowerCase();
  for (const [key, url] of Object.entries(MODEL_IMAGE_MAP)) {
    if (modelLower.includes(key)) return url;
  }
  if (vehicle.type === 'BIKE' || vehicle.type === 'SCOOTER') {
    return '/default-bike.png';
  }
  return '/default-car.png';
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState('Good day');

  // Quick KM update modal
  const [showKmModal, setShowKmModal] = useState(false);
  const [newKmInput, setNewKmInput] = useState<number>(0);
  const [kmError, setKmError] = useState('');
  const [isUpdatingKm, setIsUpdatingKm] = useState(false);

  useEffect(() => {
    const session = getClientSession();
    setUser(session);

    const hour = new Date().getHours();
    if (hour < 12) setTimeGreeting('Good morning');
    else if (hour < 17) setTimeGreeting('Good afternoon');
    else setTimeGreeting('Good evening');

    fetchDashboardData(session?.id || 'user-customer-1');
  }, []);

  const fetchDashboardData = async (userId: string) => {
    setIsLoading(true);
    try {
      const [vehRes, bookRes] = await Promise.all([
        fetch(`/api/vehicles?userId=${userId}`),
        fetch(`/api/bookings?userId=${userId}&status=CONFIRMED`),
      ]);

      const vehData = await vehRes.json();
      const bookData = await bookRes.json();

      if (vehData.data && vehData.data.length > 0) {
        setVehicles(vehData.data);
        setSelectedVehicle(vehData.data[0]);
        setNewKmInput(vehData.data[0].currentKm);
      }

      if (bookData.data && bookData.data.length > 0) {
        setUpcomingBooking(bookData.data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateKm = async () => {
    if (!selectedVehicle) return;
    if (newKmInput < selectedVehicle.currentKm) {
      setKmError(`New reading cannot be lower than current reading (${selectedVehicle.currentKm.toLocaleString()} KM).`);
      return;
    }

    setIsUpdatingKm(true);
    setKmError('');

    try {
      const res = await fetch(`/api/vehicles/${selectedVehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentKm: newKmInput }),
      });
      const data = await res.json();
      setIsUpdatingKm(false);

      if (data.data) {
        setSelectedVehicle(data.data);
        setVehicles((prev) => prev.map((v) => (v.id === data.data.id ? data.data : v)));
        setShowKmModal(false);
      } else {
        setKmError(data.error || 'Failed to update KM');
      }
    } catch {
      setIsUpdatingKm(false);
      setKmError('Network error while updating KM');
    }
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'Motorist';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {timeGreeting}, {userName}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Vehicle telemetry status and scheduled maintenance intervals.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/onboarding/vehicle"
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              Add Vehicle
            </a>
            <a
              href="/services/book"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Wrench className="w-3.5 h-3.5" />
              Book Service
            </a>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-3" />
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && vehicles.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No Vehicles Registered</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Register your vehicle to track maintenance intervals, monitor component wear, and schedule service appointments.
            </p>
            <a
              href="/onboarding/vehicle"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Your First Vehicle
            </a>
          </div>
        )}

        {/* Loaded State */}
        {!isLoading && selectedVehicle && (
          <div className="space-y-8">
            {/* Vehicle Selector Tabs */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Registered Vehicles ({vehicles.length})
                </span>
                <span className="text-xs text-slate-400">Select to view telemetry</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {vehicles.map((v) => {
                  const isSelected = selectedVehicle.id === v.id;
                  const isDueSoon = v.dueStatus === 'DUE_SOON';
                  const isOverdue = v.dueStatus === 'OVERDUE';
                  const vehicleImg = getVehicleImage(v);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        setSelectedVehicle(v);
                        setNewKmInput(v.currentKm);
                      }}
                      className={`text-left rounded-xl border transition-all overflow-hidden bg-white dark:bg-slate-900 cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="relative h-28 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <img
                          src={vehicleImg}
                          alt={`${v.brandName} ${v.modelName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const el = e.currentTarget as HTMLImageElement;
                            el.src = (v.type === 'BIKE' || v.type === 'SCOOTER') ? '/default-bike.png' : '/default-car.png';
                          }}
                        />
                        <div className="absolute top-2 right-2">
                          {isOverdue ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-600 text-white">
                              Overdue
                            </span>
                          ) : isDueSoon ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-white">
                              Due in {v.daysRemaining}d
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                              Good
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                              {v.brandName} {v.modelName}
                            </h4>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">
                              {v.registrationNo} • {v.purchaseYear}
                            </p>
                          </div>
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
                            {v.currentKm.toLocaleString()} KM
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Vehicle Specifications Strip */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700">
                  {selectedVehicle.registrationNo}
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  {selectedVehicle.brandName} {selectedVehicle.modelName}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{selectedVehicle.fuelType}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 capitalize">{selectedVehicle.vehicleClass}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">Year {selectedVehicle.purchaseYear}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Odometer: <strong className="text-slate-900 dark:text-slate-100 font-mono">{selectedVehicle.currentKm.toLocaleString()} KM</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowKmModal(true)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  Update KM
                </button>
              </div>
            </div>

            {/* 5 Core KPI Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Card 1: Next Service */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Next Service</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {selectedVehicle.daysRemaining < 0
                    ? `${Math.abs(selectedVehicle.daysRemaining)}d ago`
                    : `${selectedVehicle.daysRemaining} days`}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Target: <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedVehicle.nextServiceDate}</span>
                </p>
              </div>

              {/* Card 2: Distance Remaining */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
                  <Gauge className="w-4 h-4 text-slate-400" />
                  <span>Distance to Service</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                  {selectedVehicle.kmRemaining.toLocaleString()}
                  <span className="text-xs font-normal text-slate-500 ml-1">KM</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  At <span className="text-slate-700 dark:text-slate-300 font-medium font-mono">{selectedVehicle.nextServiceKm.toLocaleString()} KM</span>
                </p>
              </div>

              {/* Card 3: Estimated Cost */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
                  <Wrench className="w-4 h-4 text-slate-400" />
                  <span>Estimated Cost</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  ₹3,500 – ₹4,800
                </div>
                <p className="text-xs text-slate-500 mt-1">Standard periodic service</p>
              </div>

              {/* Card 4: Health Score */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
                  <Heart className="w-4 h-4 text-slate-400" />
                  <span>Health Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {selectedVehicle.healthScore}%
                  </span>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {selectedVehicle.healthRating}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full"
                    style={{ width: `${selectedVehicle.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Card 5: Last Service */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-1.5">
                  <History className="w-4 h-4 text-slate-400" />
                  <span>Last Service</span>
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100 truncate mt-1">
                  {selectedVehicle.lastServiceDate || 'None recorded'}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  At <span className="font-mono text-slate-700 dark:text-slate-300">{selectedVehicle.lastServiceKm ? `${selectedVehicle.lastServiceKm.toLocaleString()} KM` : '—'}</span>
                </p>
              </div>
            </div>

            {/* Maintenance Advisory Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border-l-4 border-l-blue-600 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Bell className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Recommended Service Package — {selectedVehicle.brandName} {selectedVehicle.modelName}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Manufacturer periodic checklist for the upcoming {selectedVehicle.nextServiceKm.toLocaleString()} KM milestone:
                  </p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>Full synthetic engine oil replacement & OEM oil filter</li>
                    <li>Brake pad wear measurement and rotor safety check</li>
                    <li>Air filter and cabin pollen filter inspection</li>
                    <li>Suspension alignment and tire pressure calibration</li>
                  </ul>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowKmModal(true)}
                    className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Update KM
                  </button>
                  <a
                    href={`/services/book?vehicleId=${selectedVehicle.id}`}
                    className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                  >
                    Schedule Service
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* 2-Column Section: Appointment & Component Diagnostics */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upcoming Appointment */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Service Appointment</h3>
                    </div>
                    {upcomingBooking && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Confirmed
                      </span>
                    )}
                  </div>

                  {upcomingBooking ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{upcomingBooking.vehicleName}</h4>
                          <p className="text-xs text-slate-500 font-mono">{upcomingBooking.vehicleReg}</p>
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{upcomingBooking.centerName}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                            {upcomingBooking.serviceDate}
                          </span>
                          <span className="text-xs text-slate-500 block">{upcomingBooking.serviceTime}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                            ID: {upcomingBooking.bookingCode}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500 block text-[10px] font-medium uppercase mb-1">
                          Booked Services:
                        </span>
                        <p className="font-medium text-slate-700 dark:text-slate-300">{upcomingBooking.services.join(', ')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 mb-4">No active service appointment booked.</p>
                      <a
                        href={`/services/book?vehicleId=${selectedVehicle.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs"
                      >
                        Book a Slot
                      </a>
                    </div>
                  )}
                </div>

                {upcomingBooking && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between">
                    <a
                      href="/bookings"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                    >
                      Manage Booking →
                    </a>
                  </div>
                )}
              </div>

              {/* Component Wear Telemetry */}
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        Component Diagnostics ({selectedVehicle.brandName})
                      </h3>
                    </div>
                    <a
                      href={`/vehicles/${selectedVehicle.id}`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5"
                    >
                      Details <ChevronRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="space-y-2.5">
                    {selectedVehicle.components.slice(0, 5).map((comp) => {
                      const isGood = comp.status === 'GOOD';
                      const isDueSoon = comp.status === 'DUE_SOON';
                      const wearPercent = isGood ? 85 : isDueSoon ? 50 : 20;

                      return (
                        <div
                          key={comp.component}
                          className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/40"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{comp.label}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isGood
                                  ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                  : isDueSoon
                                  ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                  : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                              }`}
                            >
                              {comp.status === 'GOOD' ? 'Good' : comp.status === 'DUE_SOON' ? 'Due Soon' : 'Overdue'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isGood ? 'bg-emerald-600' : isDueSoon ? 'bg-amber-500' : 'bg-rose-600'
                              }`}
                              style={{ width: `${wearPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Sensor checks synchronized with vehicle mileage</span>
                  <span className="font-medium text-slate-500">OBD-II Profile Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* UPDATE KM MODAL */}
      {showKmModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">Update Current KM</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter current odometer reading for {selectedVehicle.brandName} {selectedVehicle.modelName}.
            </p>

            {kmError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {kmError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Odometer Reading
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newKmInput}
                  onChange={(e) => setNewKmInput(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-600"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-400">KM</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Last recorded: {selectedVehicle.currentKm.toLocaleString()} KM
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKmModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingKm}
                onClick={handleUpdateKm}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                {isUpdatingKm ? 'Updating...' : 'Save & Update'}
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
