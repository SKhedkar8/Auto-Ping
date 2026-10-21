'use client';

import React, { useEffect, useState } from 'react';
import {
  Award,
  Calendar,
  Car,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Edit2,
  ExternalLink,
  Filter,
  Flame,
  Globe,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Shield,
  Sparkles,
  Star,
  ToggleLeft,
  ToggleRight,
  Wrench,
  X,
  XCircle,
  Zap
} from 'lucide-react';
import { CenterType, ServiceCenter } from '@/lib/types';

const POPULAR_SERVICES = [
  { name: 'General Service', icon: '🔧' },
  { name: 'Engine Oil Change', icon: '🛢️' },
  { name: 'Brake Service', icon: '🛑' },
  { name: 'AC Gas & Cooling', icon: '❄️' },
  { name: 'Battery Health & Terminal', icon: '🔋' },
  { name: 'Periodic Maintenance', icon: '📋' },
  { name: 'Tyre Rotation & Alignment', icon: '🛞' },
  { name: 'Multi-Point Inspection', icon: '🔍' },
];

const POPULAR_BRANDS = [
  'Tata', 'Hyundai', 'Maruti Suzuki', 'Mahindra', 'Toyota', 'Honda', 'Kia', 'Volkswagen', 'Skoda'
];

const emptyCenter: Omit<ServiceCenter, 'id'> = {
  name: '',
  type: 'AUTHORIZED',
  brandsSupported: ['Tata', 'Hyundai'],
  address: '',
  city: 'Pune',
  lat: 18.52,
  lng: 73.86,
  phone: '+91 98230 11223',
  websiteUrl: '',
  openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  servicesOffered: ['General Service', 'Engine Oil Change', 'Brake Service'],
  rating: 4.8,
  reviewCount: 42,
  autoConfirm: true,
  isActive: true,
};

export default function AdminServiceCentersPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Add/Edit Modal
  const [showModal, setShowModal] = useState(false);
  const [editingCenter, setEditingCenter] = useState<Omit<ServiceCenter, 'id'> & { id?: string }>(emptyCenter);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = () => {
    setIsLoading(true);
    fetch('/api/centers')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setCenters(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleToggleActive = async (center: ServiceCenter) => {
    const nextState = !center.isActive;
    // Optimistic update
    setCenters((prev) =>
      prev.map((c) => (c.id === center.id ? { ...c, isActive: nextState } : c))
    );

    try {
      await fetch('/api/admin/centers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: center.id, isActive: nextState }),
      });
    } catch {
      // Revert if error
      setCenters((prev) =>
        prev.map((c) => (c.id === center.id ? { ...c, isActive: !nextState } : c))
      );
    }
  };

  const handleToggleAutoConfirm = async (center: ServiceCenter) => {
    const nextState = !center.autoConfirm;
    setCenters((prev) =>
      prev.map((c) => (c.id === center.id ? { ...c, autoConfirm: nextState } : c))
    );

    try {
      await fetch('/api/admin/centers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: center.id, autoConfirm: nextState }),
      });
    } catch {}
  };

  const handleSaveCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCenter),
      });
      const data = await res.json();
      setIsSaving(false);
      if (data.data) {
        setCenters((prev) => {
          const exists = prev.some((c) => c.id === data.data.id);
          if (exists) {
            return prev.map((c) => (c.id === data.data.id ? data.data : c));
          }
          return [data.data, ...prev];
        });
        setShowModal(false);
        setEditingCenter(emptyCenter);
      }
    } catch {
      setIsSaving(false);
    }
  };

  const toggleModalService = (serviceName: string) => {
    setEditingCenter((prev) => {
      const current = prev.servicesOffered || [];
      if (current.includes(serviceName)) {
        return { ...prev, servicesOffered: current.filter((s) => s !== serviceName) };
      } else {
        return { ...prev, servicesOffered: [...current, serviceName] };
      }
    });
  };

  const toggleModalBrand = (brandName: string) => {
    setEditingCenter((prev) => {
      const current = prev.brandsSupported || [];
      if (current.includes(brandName)) {
        return { ...prev, brandsSupported: current.filter((b) => b !== brandName) };
      } else {
        return { ...prev, brandsSupported: [...current, brandName] };
      }
    });
  };

  // Cities extracted
  const cities = Array.from(new Set(centers.map((c) => c.city))).filter(Boolean);

  // Filter centers
  const filtered = centers.filter((c) => {
    if (selectedType !== 'ALL' && c.type !== selectedType) return false;
    if (selectedCity !== 'ALL' && c.city !== selectedCity) return false;
    if (selectedBrand !== 'ALL' && !c.brandsSupported?.includes(selectedBrand)) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match =
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.servicesOffered?.some((s) => s.toLowerCase().includes(q)) ||
        c.brandsSupported?.some((b) => b.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── TOP HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Partner Workshops &amp; Service Centers
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Configure partner garages, brands serviced, certified slots, and service offerings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setEditingCenter(emptyCenter);
              setShowModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Add New Workshop
          </button>

          <button
            onClick={fetchCenters}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-colors cursor-pointer"
            title="Refresh Centers"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ── DYNAMIC WORKSHOP SELECTION TABS & FILTERS (Just like customer booking page) ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Type Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'ALL', label: 'All Workshops', count: centers.length },
            { id: 'AUTHORIZED', label: 'Authorized OEM', count: centers.filter((c) => c.type === 'AUTHORIZED').length },
            { id: 'MULTI_BRAND', label: 'Multi-Brand Specialists', count: centers.filter((c) => c.type === 'MULTI_BRAND').length },
            { id: 'LOCAL', label: 'Certified Local Garages', count: centers.filter((c) => c.type === 'LOCAL').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedType === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                selectedType === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search, City & Brand Pills */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by workshop name, city, service, or brand..."
              className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-xs"
            />
          </div>

          {/* Quick Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            {/* Brand Specialty Selector */}
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Brands Serviced</option>
              {POPULAR_BRANDS.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── DYNAMIC WORKSHOP CARDS GRID ── */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">No Service Centers Found</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query, type tabs, or brand filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => {
            const isAuthorized = c.type === 'AUTHORIZED';
            const isMultiBrand = c.type === 'MULTI_BRAND';

            return (
              <div
                key={c.id}
                className={`group relative p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-md ${
                  c.isActive
                    ? 'border-slate-200/80 dark:border-slate-800 hover:border-blue-500/50'
                    : 'border-slate-200/60 dark:border-slate-800/60 opacity-60 bg-slate-50/50 dark:bg-slate-900/50'
                }`}
              >
                <div>
                  {/* Top Bar: Type Badge, Rating & Status Switch */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                        isAuthorized
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                          : isMultiBrand
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {c.type === 'AUTHORIZED' ? 'Authorized OEM' : c.type === 'MULTI_BRAND' ? 'Multi-Brand' : 'Local Garage'}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{c.rating || 4.8}</span>
                        <span className="text-[10px] opacity-75 font-normal">({c.reviewCount || 34})</span>
                      </div>

                      {/* Active Toggle Switch */}
                      <button
                        onClick={() => handleToggleActive(c)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title={c.isActive ? 'Deactivate Workshop' : 'Activate Workshop'}
                      >
                        {c.isActive ? (
                          <ToggleRight className="w-6 h-6 text-emerald-500" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Workshop Title & Location */}
                  <div className="mb-3">
                    <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.address}, {c.city}</span>
                    </p>
                  </div>

                  {/* Supported Brands Pills */}
                  {c.brandsSupported && c.brandsSupported.length > 0 && (
                    <div className="mb-3.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Supported Brands
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {c.brandsSupported.map((brand) => (
                          <span
                            key={brand}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700/60"
                          >
                            {brand}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Services Offered Badges with Icons */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Services Catalog
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {c.servicesOffered?.map((srv) => (
                        <span
                          key={srv}
                          className="px-2.5 py-1 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-[11px] font-medium border border-blue-200/50 dark:border-blue-900/40"
                        >
                          {srv}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Workshop Details: Hours & Contact */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/5 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.openingHours || 'Mon - Sat: 9:00 AM - 7:00 PM'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.phone || '+91 98220 12345'}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> CAN-Bus Ready
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions & Instant Auto-Confirm Switch */}
                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleAutoConfirm(c)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer border ${
                        c.autoConfirm
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Toggle Automatic Booking Confirmation"
                    >
                      <Zap className="w-3 h-3" />
                      {c.autoConfirm ? 'Instant Confirm' : 'Manual Review'}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setEditingCenter(c);
                      setShowModal(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Configure
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DYNAMIC ADD / EDIT WORKSHOP MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl my-6 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {editingCenter.id ? 'Configure Partner Workshop' : 'Register New Workshop'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Set up service offerings, supported brands, and contact details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCenter} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Workshop Center Name
                  </label>
                  <input
                    type="text"
                    value={editingCenter.name}
                    onChange={(e) => setEditingCenter({ ...editingCenter, name: e.target.value })}
                    placeholder="e.g. Pune Motor Works & Diagnostics"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Workshop Type
                  </label>
                  <select
                    value={editingCenter.type}
                    onChange={(e) => setEditingCenter({ ...editingCenter, type: e.target.value as CenterType })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="AUTHORIZED">Authorized OEM Center</option>
                    <option value="MULTI_BRAND">Multi-Brand Specialist</option>
                    <option value="LOCAL">Certified Local Garage</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    value={editingCenter.city}
                    onChange={(e) => setEditingCenter({ ...editingCenter, city: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={editingCenter.phone}
                    onChange={(e) => setEditingCenter({ ...editingCenter, phone: e.target.value })}
                    placeholder="+91 98220 12345"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Full Workshop Address
                </label>
                <input
                  type="text"
                  value={editingCenter.address}
                  onChange={(e) => setEditingCenter({ ...editingCenter, address: e.target.value })}
                  placeholder="Plot 45, MIDC Industrial Area, Pune 411018"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white text-xs focus:outline-none"
                  required
                />
              </div>

              {/* DYNAMIC SERVICE SELECTOR (Like Service Configurator) */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Select Services Offered (Click to toggle)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {POPULAR_SERVICES.map((srv) => {
                    const isSelected = editingCenter.servicesOffered?.includes(srv.name);
                    return (
                      <button
                        key={srv.name}
                        type="button"
                        onClick={() => toggleModalService(srv.name)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-sm">{srv.icon}</span>
                        <span className="truncate flex-1">{srv.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC BRANDS SELECTOR */}
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                  Supported Vehicle Brands
                </label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_BRANDS.map((brand) => {
                    const isSelected = editingCenter.brandsSupported?.includes(brand);
                    return (
                      <button
                        key={brand}
                        type="button"
                        onClick={() => toggleModalBrand(brand)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-500'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {brand} {isSelected ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Operating Hours & Auto-Confirm Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1.5">
                    Operating Schedule
                  </label>
                  <input
                    type="text"
                    value={editingCenter.openingHours}
                    onChange={(e) => setEditingCenter({ ...editingCenter, openingHours: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCenter.autoConfirm}
                      onChange={(e) => setEditingCenter({ ...editingCenter, autoConfirm: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Auto-Confirm Incoming Bookings
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  {isSaving ? 'Saving Workshop...' : 'Save & Publish Workshop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
