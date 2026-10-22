'use client';

import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
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
  Filter,
  Fuel,
  Gauge,
  Heart,
  History,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
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
  const [confirmedBookingsCount, setConfirmedBookingsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [timeGreeting, setTimeGreeting] = useState('Good day');

  // Search, filter, and sorting states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CAR' | 'TWO_WHEELER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'GOOD' | 'DUE_SOON' | 'OVERDUE'>('ALL');
  const [sortBy, setSortBy] = useState<'URGENCY' | 'MILEAGE' | 'HEALTH' | 'NAME'>('URGENCY');

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
        fetch(`/api/bookings?userId=${userId}`),
      ]);

      const vehData = await vehRes.json();
      const bookData = await bookRes.json();

      if (vehData.data && vehData.data.length > 0) {
        setVehicles(vehData.data);
        setSelectedVehicle(vehData.data[0]);
        setNewKmInput(vehData.data[0].currentKm);
      }

      if (bookData.data && bookData.data.length > 0) {
        const bookingsList: Booking[] = bookData.data;
        const confirmedList = bookingsList.filter((b) => b.status === 'CONFIRMED');
        setConfirmedBookingsCount(confirmedList.length);
        setUpcomingBooking(confirmedList[0] || bookingsList[0] || null);
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

  // KPI counts computed from real data
  const dueSoonCount = vehicles.filter((v) => v.dueStatus === 'DUE_SOON').length;
  const overdueCount = vehicles.filter((v) => v.dueStatus === 'OVERDUE').length;
  const goodCount = vehicles.filter((v) => v.dueStatus === 'GOOD').length;

  // Filter and sort vehicles
  const filteredVehicles = vehicles
    .filter((v) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = `${v.brandName} ${v.modelName}`.toLowerCase().includes(q);
        const matchReg = v.registrationNo.toLowerCase().includes(q);
        if (!matchName && !matchReg) return false;
      }
      if (typeFilter === 'CAR' && v.type !== 'CAR') return false;
      if (typeFilter === 'TWO_WHEELER' && v.type !== 'BIKE' && v.type !== 'SCOOTER') return false;
      if (statusFilter === 'GOOD' && v.dueStatus !== 'GOOD') return false;
      if (statusFilter === 'DUE_SOON' && v.dueStatus !== 'DUE_SOON') return false;
      if (statusFilter === 'OVERDUE' && v.dueStatus !== 'OVERDUE') return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'URGENCY') {
        const order = { OVERDUE: 0, DUE_SOON: 1, GOOD: 2 };
        return (order[a.dueStatus] ?? 3) - (order[b.dueStatus] ?? 3) || a.daysRemaining - b.daysRemaining;
      }
      if (sortBy === 'MILEAGE') {
        return b.currentKm - a.currentKm;
      }
      if (sortBy === 'HEALTH') {
        return a.healthScore - b.healthScore;
      }
      if (sortBy === 'NAME') {
        return `${a.brandName} ${a.modelName}`.localeCompare(`${b.brandName} ${b.modelName}`);
      }
      return 0;
    });

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-7">
        {/* ==================================================
            4. DASHBOARD HEADER
            ================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {timeGreeting}, {userName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage your vehicles, monitor their health, and stay ahead of upcoming services.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center shrink-0 w-full sm:w-auto">
            <a
              href="/onboarding/vehicle"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Add Vehicle</span>
            </a>
            <a
              href="/services/book"
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Book Service</span>
            </a>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-3" />
                <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && vehicles.length === 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center max-w-lg mx-auto my-12 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-900/50">
              <Car className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">No Vehicles Registered</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Register your vehicle to track maintenance intervals, monitor component wear, and schedule service appointments.
            </p>
            <a
              href="/onboarding/vehicle"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Vehicle
            </a>
          </div>
        )}

        {/* Loaded State */}
        {!isLoading && selectedVehicle && (
          <div className="space-y-7">
            {/* ==================================================
                5. COMPACT SERVICE OVERVIEW SECTION
                ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
              {/* Metric 1: Total Vehicles */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
                <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40">
                  <Car className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                    Total Vehicles
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {vehicles.length}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {vehicles.length === 1 ? '1 active vehicle' : `${vehicles.length} active vehicles`}
                  </span>
                </div>
              </div>

              {/* Metric 2: Service Due Soon */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'DUE_SOON' ? 'ALL' : 'DUE_SOON')}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center gap-4 transition-all cursor-pointer hover:shadow-md ${
                  statusFilter === 'DUE_SOON' ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-slate-200/90 dark:border-slate-800'
                }`}
                title="Click to filter due soon vehicles"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/40">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                    Service Due Soon
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                    {dueSoonCount}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {dueSoonCount > 0 ? 'Within next 30 days' : 'No upcoming deadlines'}
                  </span>
                </div>
              </div>

              {/* Metric 3: Overdue Vehicles */}
              <div
                onClick={() => setStatusFilter(statusFilter === 'OVERDUE' ? 'ALL' : 'OVERDUE')}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center gap-4 transition-all cursor-pointer hover:shadow-md ${
                  statusFilter === 'OVERDUE' ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-slate-200/90 dark:border-slate-800'
                }`}
                title="Click to filter overdue vehicles"
              >
                <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/40">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                    Overdue Vehicles
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5">
                    {overdueCount}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {overdueCount > 0 ? 'Urgent maintenance' : 'All maintenance current'}
                  </span>
                </div>
              </div>

              {/* Metric 4: Upcoming Bookings */}
              <a
                href="/bookings"
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex items-center gap-4 transition-all hover:shadow-md hover:border-emerald-500 cursor-pointer"
                title="View active bookings"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/40">
                  <Calendar className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 block truncate">
                    Upcoming Bookings
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                    {confirmedBookingsCount}
                  </div>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {confirmedBookingsCount > 0 ? 'Confirmed service bays' : 'No pending bays'}
                  </span>
                </div>
              </a>
            </div>

            {/* ==================================================
                7. SEARCH & FILTER CONTROLS
                ================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by vehicle name or registration..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters & Sorting */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Type Filter Pills */}
                <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <button
                    onClick={() => setTypeFilter('ALL')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      typeFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    All Types
                  </button>
                  <button
                    onClick={() => setTypeFilter('CAR')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      typeFilter === 'CAR'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Cars
                  </button>
                  <button
                    onClick={() => setTypeFilter('TWO_WHEELER')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      typeFilter === 'TWO_WHEELER'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Bikes / Scooters
                  </button>
                </div>

                {/* Status Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">All Status</option>
                  <option value="GOOD">Good ({goodCount})</option>
                  <option value="DUE_SOON">Due Soon ({dueSoonCount})</option>
                  <option value="OVERDUE">Overdue ({overdueCount})</option>
                </select>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="URGENCY">Sort: Due Urgency</option>
                  <option value="HEALTH">Sort: Health Score</option>
                  <option value="MILEAGE">Sort: Highest KM</option>
                  <option value="NAME">Sort: Name (A-Z)</option>
                </select>

                {(searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline px-1.5"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* ==================================================
                6. REGISTERED VEHICLES GRID
                ================================================== */}
            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Registered Garage ({filteredVehicles.length} of {vehicles.length})
                </span>
                <span className="text-xs text-slate-400">
                  Click a card to switch telemetry &amp; live diagnostics
                </span>
              </div>

              {filteredVehicles.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-800">
                  <Filter className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    No vehicles match your search or filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('ALL');
                      setStatusFilter('ALL');
                    }}
                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-blue-100"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredVehicles.map((v) => {
                    const isSelected = selectedVehicle.id === v.id;
                    const isDueSoon = v.dueStatus === 'DUE_SOON';
                    const isOverdue = v.dueStatus === 'OVERDUE';
                    const vehicleImg = getVehicleImage(v);

                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          setSelectedVehicle(v);
                          setNewKmInput(v.currentKm);
                        }}
                        className={`group relative text-left rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 flex flex-col justify-between cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-600/20 shadow-md'
                            : 'border-slate-200/90 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
                        }`}
                      >
                        {/* Card Image Banner */}
                        <div className="relative h-38 sm:h-40 w-full bg-slate-950 overflow-hidden shrink-0">
                          <img
                            src={vehicleImg}
                            alt={`${v.brandName} ${v.modelName}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              el.src = (v.type === 'BIKE' || v.type === 'SCOOTER') ? '/default-bike.png' : '/default-car.png';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

                          {/* Status Badge in Upper-Right */}
                          <div className="absolute top-3 right-3 z-10">
                            {isOverdue ? (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-600 text-white shadow-md flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Overdue
                              </span>
                            ) : isDueSoon ? (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 text-white shadow-md flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due in {v.daysRemaining}d
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-600 text-white shadow-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Good
                              </span>
                            )}
                          </div>

                          {/* Top-Left Category Pill */}
                          <div className="absolute top-3 left-3 z-10">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase bg-black/60 backdrop-blur-md text-white border border-white/20 shadow-xs">
                              {v.type === 'BIKE' || v.type === 'SCOOTER' ? '2-Wheeler' : v.vehicleClass || 'Car'}
                            </span>
                          </div>

                          {/* Bottom Image Overlay: Vehicle Name */}
                          <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-end justify-between pointer-events-none">
                            <div>
                              <h4 className="font-bold text-base text-white drop-shadow-sm">
                                {v.brandName} {v.modelName}
                              </h4>
                              <p className="text-[11px] text-slate-300 font-mono">
                                {v.registrationNo} • Year {v.purchaseYear}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-white font-mono bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded border border-white/10">
                              {v.currentKm.toLocaleString()} KM
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                          {/* Secondary specs */}
                          <div className="grid grid-cols-3 gap-2 py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-center text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Health</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                {v.healthScore}%
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Fuel</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300 truncate block">
                                {v.fuelType}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 block uppercase">Next In</span>
                              <span className={`font-bold font-mono ${isOverdue ? 'text-rose-600' : isDueSoon ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                {v.kmRemaining.toLocaleString()} KM
                              </span>
                            </div>
                          </div>

                          {/* Card Actions */}
                          <div className="flex items-center justify-between pt-1 gap-2">
                            <span
                              className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                isSelected
                                  ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
                                  : 'text-slate-500'
                              }`}
                            >
                              {isSelected ? '✓ Active Selected' : 'Click to Select'}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {isOverdue && (
                                <a
                                  href={`/services/book?vehicleId=${v.id}`}
                                  onClick={(e) => e.stopPropagation()}
                                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-semibold transition-colors shadow-xs"
                                >
                                  Book Slot
                                </a>
                              )}
                              <a
                                href={`/vehicles`}
                                onClick={(e) => e.stopPropagation()}
                                className="px-2.5 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium transition-colors"
                              >
                                View Details →
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ==================================================
                8. SELECTED VEHICLE OVERVIEW (HORIZONTAL STRIP)
                ================================================== */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Left Details */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
                <span className="font-mono font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  {selectedVehicle.registrationNo}
                </span>
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  {selectedVehicle.brandName} {selectedVehicle.modelName}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{selectedVehicle.fuelType}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400 capitalize font-medium">{selectedVehicle.vehicleClass || selectedVehicle.type}</span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">Model Year {selectedVehicle.purchaseYear}</span>
              </div>

              {/* Right Odometer & Update Button */}
              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Current Odometer:{' '}
                  <strong className="text-slate-900 dark:text-white font-mono text-sm ml-1">
                    {selectedVehicle.currentKm.toLocaleString()} KM
                  </strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKmModal(true)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Update KM</span>
                </button>
              </div>
            </div>

            {/* ==================================================
                9. SERVICE METRICS CARDS (5 Core KPI Cards)
                ================================================== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
              {/* Card 1: Next Service */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Next Service</span>
                  </div>
                  <div className={`text-2xl font-bold font-mono tracking-tight ${
                    selectedVehicle.daysRemaining < 0
                      ? 'text-rose-600'
                      : selectedVehicle.daysRemaining <= 30
                      ? 'text-amber-600'
                      : 'text-slate-900 dark:text-white'
                  }`}>
                    {selectedVehicle.daysRemaining < 0
                      ? `${Math.abs(selectedVehicle.daysRemaining)}d ago`
                      : `${selectedVehicle.daysRemaining} days`}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Target: <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedVehicle.nextServiceDate}</span>
                </p>
              </div>

              {/* Card 2: Distance Remaining */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                    <Gauge className="w-4 h-4 text-slate-400" />
                    <span>Distance to Service</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                    {selectedVehicle.kmRemaining.toLocaleString()}
                    <span className="text-xs font-normal text-slate-500 ml-1">KM</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  At <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedVehicle.nextServiceKm.toLocaleString()} KM</span>
                </p>
              </div>

              {/* Card 3: Estimated Cost */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                    <Wrench className="w-4 h-4 text-slate-400" />
                    <span>Estimated Cost</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    ₹3,500 – ₹4,800
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Standard periodic service</p>
              </div>

              {/* Card 4: Health Score */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                    <Heart className="w-4 h-4 text-slate-400" />
                    <span>Health Score</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                      {selectedVehicle.healthScore}%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {selectedVehicle.healthRating}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      selectedVehicle.healthScore >= 80
                        ? 'bg-emerald-600'
                        : selectedVehicle.healthScore >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-600'
                    }`}
                    style={{ width: `${selectedVehicle.healthScore}%` }}
                    aria-label={`Vehicle health score is ${selectedVehicle.healthScore}%`}
                  />
                </div>
              </div>

              {/* Card 5: Last Service */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-medium mb-2">
                    <History className="w-4 h-4 text-slate-400" />
                    <span>Last Service</span>
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {selectedVehicle.lastServiceDate || 'None recorded'}
                  </div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  At <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{selectedVehicle.lastServiceKm ? `${selectedVehicle.lastServiceKm.toLocaleString()} KM` : '—'}</span>
                </p>
              </div>
            </div>

            {/* Maintenance Advisory Banner */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-l-4 border-l-blue-600 border border-slate-200/90 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <Bell className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">
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
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">Service Appointment</h3>
                    </div>
                    {upcomingBooking && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {upcomingBooking.status}
                      </span>
                    )}
                  </div>

                  {upcomingBooking ? (
                    <div className="space-y-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white">{upcomingBooking.vehicleName}</h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">{upcomingBooking.vehicleReg}</p>
                          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="font-medium">{upcomingBooking.centerName}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                            {upcomingBooking.serviceDate}
                          </span>
                          <span className="text-xs text-slate-500 block">{upcomingBooking.serviceTime}</span>
                          <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                            ID: {upcomingBooking.bookingCode}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider mb-1">
                          Booked Services ({upcomingBooking.services.length})
                        </span>
                        <p className="font-semibold text-slate-700 dark:text-slate-200">{upcomingBooking.services.join(', ')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto mb-2">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">No active service appointment booked.</p>
                      <a
                        href={`/services/book?vehicleId=${selectedVehicle.id}`}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 transition-colors"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Book a Service Slot
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
              <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                        Component Diagnostics ({selectedVehicle.brandName})
                      </h3>
                    </div>
                    <a
                      href={`/vehicles`}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5"
                    >
                      Full Details <ChevronRight className="w-3.5 h-3.5" />
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
                          className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 text-xs bg-slate-50/50 dark:bg-slate-800/40"
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
                          <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
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
                  <span>Sensor checks synchronized with odometer telemetry</span>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">OBD-II Profile Active</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* UPDATE KM MODAL */}
      {showKmModal && selectedVehicle && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/40">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Update Odometer</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedVehicle.brandName} {selectedVehicle.modelName} ({selectedVehicle.registrationNo})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKmModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {kmError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{kmError}</span>
              </div>
            )}

            <div className="mb-6 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Last recorded reading:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                  {selectedVehicle.currentKm.toLocaleString()} KM
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  New Odometer Reading (KM)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={newKmInput}
                    onChange={(e) => setNewKmInput(Number(e.target.value))}
                    min={selectedVehicle.currentKm}
                    step={1}
                    className="w-full bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-base font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                    KM
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Must be equal to or greater than {selectedVehicle.currentKm.toLocaleString()} KM
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowKmModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUpdatingKm}
                onClick={handleUpdateKm}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isUpdatingKm ? 'Updating...' : 'Save & Recalculate'}
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
