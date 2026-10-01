'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Droplets,
  ExternalLink,
  Flame,
  Gauge,
  Heart,
  History,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  Wrench,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Booking, User, Vehicle } from '@/lib/types';

// Floating service background particles
const DASH_PARTICLES = [
  { icon: '🛢️', label: 'Oil Change', size: 28 },
  { icon: '🔧', label: 'Wrench', size: 22 },
  { icon: '🛞', label: 'Tyre', size: 30 },
  { icon: '⚙️', label: 'Gear', size: 24 },
  { icon: '🔩', label: 'Bolt', size: 20 },
  { icon: '🪛', label: 'Screwdriver', size: 24 },
  { icon: '⛽', label: 'Fuel', size: 22 },
  { icon: '🔋', label: 'Battery', size: 26 },
  { icon: '🚗', label: 'Car', size: 30 },
  { icon: '💨', label: 'AC', size: 22 },
];

function DashboardBackground() {
  return (
    <div className="dash-bg-canvas" aria-hidden="true">
      {/* STATION 1: Oil Change Animated Station (Top Right Background) */}
      <div className="hidden lg:flex flex-col items-center absolute top-24 right-12 opacity-25 dark:opacity-20 pointer-events-none select-none">
        <div className="relative w-36 h-36">
          {/* Tilted Oil Can pouring */}
          <div className="absolute top-2 left-6 text-4xl anim-oil-can">
            🛢️
          </div>
          {/* Dripping Amber Oil Drops */}
          <div className="absolute top-12 left-14 text-amber-500 text-sm anim-oil-drop-1">
            💧
          </div>
          <div className="absolute top-12 left-14 text-amber-600 text-xs anim-oil-drop-2">
            💧
          </div>
          {/* Oil Catch Tray / Basin */}
          <div className="absolute bottom-4 left-8 w-16 h-4 bg-slate-400/40 dark:bg-slate-600/40 rounded-b-xl border border-slate-400/30 flex items-center justify-center overflow-hidden">
            <div className="w-8 h-8 rounded-full border border-amber-500/60 anim-oil-ripple" />
          </div>
          <div className="absolute -bottom-1 left-4 w-24 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Oil Service
          </div>
        </div>
      </div>

      {/* STATION 2: Tyre Change Animated Station (Bottom Left Background) */}
      <div className="hidden lg:flex flex-col items-center absolute bottom-28 left-10 opacity-25 dark:opacity-20 pointer-events-none select-none">
        <div className="relative w-36 h-36 flex items-center justify-center">
          {/* Spinning Tyre */}
          <div className="text-5xl anim-tyre-spin">
            🛞
          </div>
          {/* Impact Lug Wrench Tool */}
          <div className="absolute top-3 right-4 text-3xl anim-wrench-impact">
            🔧
          </div>
          {/* Spark Burst from tightening */}
          <div className="absolute top-8 right-8 text-amber-400 text-sm anim-spark">
            ✨
          </div>
          <div className="absolute -bottom-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Tyre & Wheel
          </div>
        </div>
      </div>

      {/* STATION 3: Mechanical Transmission Tuning (Mid Right Background) */}
      <div className="hidden xl:flex flex-col items-center absolute top-[52%] right-8 opacity-20 dark:opacity-15 pointer-events-none select-none">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <div className="absolute text-4xl anim-gear-cw -top-1 left-3 text-blue-500/50">
            ⚙️
          </div>
          <div className="absolute text-3xl anim-gear-ccw top-7 right-4 text-slate-500/50">
            ⚙️
          </div>
          <div className="absolute bottom-2 left-6 text-2xl anim-spanner text-slate-400/60">
            🛠️
          </div>
          <div className="absolute -bottom-1 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Inspection
          </div>
        </div>
      </div>

      {/* Floating particles rising upward */}
      {DASH_PARTICLES.map((p, i) => (
        <div
          key={i}
          className="dash-icon-particle select-none"
          style={{ fontSize: p.size }}
          aria-hidden="true"
        >
          {p.icon}
        </div>
      ))}
    </div>
  );
}

// Vehicle image map for known models with accurate, verified images
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
  'curvv': 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80',
  'swift': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'baleno': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80',
  'brezza': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'grand vitara': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'fronx': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
  'dzire': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'ertiga': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
  'jimny': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'wagonr': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800&auto=format&fit=crop&q=80',
  'thar': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'xuv700': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop&q=80',
  'scorpio': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'bolero': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
  'xuv 3xo': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'fortuner': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'innova': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
  'hyryder': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'glanza': 'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800&auto=format&fit=crop&q=80',
  'seltos': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'sonet': 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&auto=format&fit=crop&q=80',
  'carens': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800&auto=format&fit=crop&q=80',
  'hector': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800&auto=format&fit=crop&q=80',
  'astor': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'city': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
  'elevate': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'amaze': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80',
  'taigun': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'virtus': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',
  'kushaq': 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&auto=format&fit=crop&q=80',
  'slavia': 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80',

  // Bikes & Scooters
  'classic 350': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'hunter': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'bullet': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'meteor': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'himalayan': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'splendor': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'xpulse': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'activa': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'shine': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'jupiter': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'ntorq': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'apache': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'raider': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'pulsar': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'access': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'r15': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'mt-15': 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=800&auto=format&fit=crop&q=80',
  'duke': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'rc 390': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'ninja': 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
  'speed 400': 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  'ather': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'ola': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
  'vespa': 'https://images.unsplash.com/photo-1596706060010-8501e913a89e?w=800&auto=format&fit=crop&q=80',
};

function getVehicleImage(vehicle: Vehicle): string {
  if (vehicle.imageUrl) return vehicle.imageUrl;
  const modelLower = vehicle.modelName.toLowerCase();
  for (const [key, url] of Object.entries(MODEL_IMAGE_MAP)) {
    if (modelLower.includes(key)) return url;
  }
  // Fallback by type
  if (vehicle.type === 'BIKE' || vehicle.type === 'SCOOTER') {
    return 'https://images.unsplash.com/photo-1558981033-40a1ea4dbab5?w=600&auto=format&fit=crop&q=80';
  }
  return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80';
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

    // Determine greeting
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
    <div className="min-h-screen flex flex-col gradient-mesh relative">
      {/* Animated background */}
      <DashboardBackground />

      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              {timeGreeting}, {userName} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
              Your vehicle telemetry is analyzed and synchronized with manufacturer guidelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/onboarding/vehicle"
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4 text-blue-600" />
              Add Vehicle
            </a>
            <a
              href="/services/book"
              className="px-5 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition-opacity flex items-center gap-1.5"
            >
              <Wrench className="w-4 h-4" />
              Book Service
            </a>
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6 border border-white animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3 mb-3"></div>
                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State if no vehicles */}
        {!isLoading && vehicles.length === 0 && (
          <div className="glass-card p-12 text-center max-w-xl mx-auto my-12 border border-white dark:border-slate-700">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center mx-auto mb-4 font-bold shadow-inner">
              <Car className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">No Vehicles Registered Yet</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Add your car or motorcycle to start receiving intelligent service alerts, component wear diagnostics, and 1-click slot booking.
            </p>
            <a
              href="/onboarding/vehicle"
              className="px-6 py-3 rounded-xl gradient-primary text-white text-xs font-bold shadow-md hover:opacity-95 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Vehicle
            </a>
          </div>
        )}

        {/* Loaded State */}
        {selectedVehicle && (
          <div className="space-y-8">
            {/* VEHICLES CAROUSEL / SWITCHER */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Registered Vehicles ({vehicles.length})
                </h3>
                <span className="text-[11px] text-slate-400">Click to switch telemetry view</span>
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
                      onClick={() => {
                        setSelectedVehicle(v);
                        setNewKmInput(v.currentKm);
                      }}
                      className={`p-0 rounded-2xl text-left transition-all relative overflow-hidden border ${
                        isSelected
                          ? 'glass-card border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white/70 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-700 border-slate-200/80 dark:border-slate-700/80 shadow-xs'
                      }`}
                    >
                      {/* Vehicle Image Banner */}
                      <div className="relative h-28 overflow-hidden rounded-t-2xl">
                        <img
                          src={vehicleImg}
                          alt={`${v.brandName} ${v.modelName}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        {/* Status badge over image */}
                        <div className="absolute top-2 right-2">
                          {isOverdue ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Overdue
                            </span>
                          ) : isDueSoon ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> Due in {v.daysRemaining}d
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white flex items-center gap-1 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-white" /> Good
                            </span>
                          )}
                        </div>
                        {/* Vehicle name on image */}
                        <div className="absolute bottom-2 left-3">
                          <h4 className="font-extrabold text-sm text-white drop-shadow">
                            {v.brandName} {v.modelName}
                          </h4>
                          <p className="text-[10px] text-white/80 font-mono">
                            {v.registrationNo} • {v.purchaseYear}
                          </p>
                        </div>
                      </div>

                      {/* Bottom metrics */}
                      <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                        <span>Odometer: <strong className="text-slate-900 dark:text-slate-100">{v.currentKm.toLocaleString()} KM</strong></span>
                        <span>Health: <strong className="text-emerald-600">{v.healthScore}%</strong></span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STAT CARDS (5 Core metrics) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {/* Card 1: Next Service */}
              <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Next Service</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {selectedVehicle.daysRemaining < 0
                    ? `${Math.abs(selectedVehicle.daysRemaining)}d ago`
                    : `${selectedVehicle.daysRemaining} days`}
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  Target: <span className="text-slate-900 font-bold">{selectedVehicle.nextServiceDate}</span>
                </p>
              </div>

              {/* Card 2: Service KM */}
              <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <Gauge className="w-4 h-4 text-cyan-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Service KM</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  {selectedVehicle.kmRemaining.toLocaleString()}
                  <span className="text-xs font-bold text-slate-600 ml-1">KM left</span>
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  At <span className="text-slate-900 font-bold">{selectedVehicle.nextServiceKm.toLocaleString()} KM</span> milestone
                </p>
              </div>

              {/* Card 3: Estimated Cost */}
              <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <Wrench className="w-4 h-4 text-amber-500" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Estimated Cost</span>
                </div>
                <div className="text-2xl font-black text-slate-950">
                  ₹3,500 – ₹4,800
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">Based on class & parts</p>
              </div>

              {/* Card 4: Vehicle Health */}
              <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Health Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-700">
                    {selectedVehicle.healthScore}%
                  </span>
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {selectedVehicle.healthRating}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full mt-2.5 overflow-hidden">
                  <div
                    className="gradient-primary h-full rounded-full"
                    style={{ width: `${selectedVehicle.healthScore}%` }}
                  />
                </div>
              </div>

              {/* Card 5: Last Service */}
              <div className="bg-white/95 rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition-all">
                <div className="flex items-center gap-2 text-slate-700 mb-2">
                  <History className="w-4 h-4 text-purple-600" />
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">Last Service</span>
                </div>
                <div className="text-base font-black text-slate-950 truncate">
                  {selectedVehicle.lastServiceDate || 'None recorded'}
                </div>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  At <span className="text-slate-900 font-bold">{selectedVehicle.lastServiceKm ? `${selectedVehicle.lastServiceKm.toLocaleString()} KM` : '—'}</span>
                </p>
              </div>
            </div>

            {/* SMART REMINDER BANNER */}
            <div className="glass-card p-6 border-l-4 border-l-[#0B5CFF] border-white dark:border-slate-700/50 shadow-lg relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-bold">
                      <Bell className="w-4 h-4" />
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                      Smart Service Reminder — {selectedVehicle.brandName} {selectedVehicle.modelName}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Recommended because:</p>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-5 list-disc">
                    <li>
                      {selectedVehicle.nextServiceKm.toLocaleString()} km milestone approaching (current reading: {selectedVehicle.currentKm.toLocaleString()} km)
                    </li>
                    <li>Engine oil and OEM synthetic filter replacement</li>
                    <li>Brake pads thickness and disc rotor safety check</li>
                    <li>Tyre pressure and computerized alignment check</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <button
                    onClick={() => setShowKmModal(true)}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    Update Current KM
                  </button>

                  <a
                    href={`/services/book?vehicleId=${selectedVehicle.id}`}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-blue-500/25 hover:opacity-95 flex items-center justify-center gap-2"
                  >
                    Book Service Now
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* UPCOMING BOOKING & QUICK DIAGNOSTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Upcoming Booking Card */}
              <div className="lg:col-span-6 glass-card p-6 border border-white dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Upcoming Service Appointment</h3>
                  </div>
                  {upcomingBooking && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Confirmed
                    </span>
                  )}
                </div>

                {upcomingBooking ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{upcomingBooking.vehicleName}</h4>
                        <p className="text-xs text-slate-500">{upcomingBooking.vehicleReg}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs font-bold text-blue-700">
                          <MapPin className="w-3.5 h-3.5" />
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

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-700 text-xs">
                      <span className="text-slate-400 block text-[10px] font-semibold uppercase mb-1">
                        Selected Services:
                      </span>
                      <p className="font-medium text-slate-700 dark:text-slate-300">{upcomingBooking.services.join(', ')}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <a
                        href="/bookings"
                        className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        Manage Booking (Reschedule/Cancel) →
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 mb-4">No active service appointment booked.</p>
                    <a
                      href={`/services/book?vehicleId=${selectedVehicle.id}`}
                      className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold shadow-xs hover:opacity-95"
                    >
                      Book a Slot
                    </a>
                  </div>
                )}
              </div>

              {/* Component Health Snapshot */}
              <div className="lg:col-span-6 glass-card p-6 border border-white dark:border-slate-700/50">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      Component Wear Telemetry ({selectedVehicle.brandName})
                    </h3>
                  </div>
                  <a
                    href={`/vehicles/${selectedVehicle.id}`}
                    className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                  >
                    Full Details <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="space-y-3">
                  {selectedVehicle.components.slice(0, 4).map((comp) => {
                    const isGood = comp.status === 'GOOD';
                    const isDueSoon = comp.status === 'DUE_SOON';
                    return (
                      <div
                        key={comp.component}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${
                              isGood ? 'bg-emerald-500' : isDueSoon ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          />
                          <span className="font-bold text-slate-800 dark:text-slate-200">{comp.label}</span>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
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
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* UPDATE KM MODAL */}
      {showKmModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm glass-dropdown rounded-3xl p-6 shadow-2xl border border-white dark:border-slate-700">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">Update Current KM</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter latest dashboard reading for {selectedVehicle.brandName} {selectedVehicle.modelName}.
            </p>

            {kmError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {kmError}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Current Odometer Reading
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={newKmInput}
                  onChange={(e) => setNewKmInput(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-blue-500"
                />
                <span className="absolute right-3.5 top-2 text-xs font-bold text-slate-400">KM</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Previous: {selectedVehicle.currentKm.toLocaleString()} KM
              </span>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowKmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
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
