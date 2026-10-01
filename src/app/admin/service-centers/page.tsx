'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit2,
  MapPin,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Star,
  ToggleLeft,
  ToggleRight,
  Wrench,
  XCircle
} from 'lucide-react';
import { ServiceCenter } from '@/lib/types';

const emptyCenter: Omit<ServiceCenter, 'id'> = {
  name: '',
  type: 'AUTHORIZED',
  brandsSupported: [],
  address: '',
  city: 'Pune',
  lat: 18.52,
  lng: 73.86,
  phone: '',
  websiteUrl: '',
  openingHours: 'Mon - Sat: 9:00 AM - 7:00 PM',
  servicesOffered: ['General Service', 'Engine Oil Change', 'Brake Service'],
  rating: 4.5,
  reviewCount: 0,
  autoConfirm: true,
  isActive: true,
};

export default function AdminServiceCentersPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
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
    try {
      await fetch('/api/admin/centers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: center.id, isActive: !center.isActive }),
      });
      setCenters((prev) =>
        prev.map((c) => (c.id === center.id ? { ...c, isActive: !c.isActive } : c))
      );
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
        setCenters((prev) => [...prev, data.data]);
        setShowModal(false);
        setEditingCenter(emptyCenter);
      }
    } catch {
      setIsSaving(false);
    }
  };

  const filtered = centers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-950">Service Centers Registry</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage authorized, multi-brand, and local partner garages with slot capacity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search centers or cities..."
              className="bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-500 shadow-xs"
            />
          </div>
          <button
            onClick={() => { setEditingCenter(emptyCenter); setShowModal(true); }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Center
          </button>
        </div>
      </div>

      {/* Centers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((center) => (
          <div
            key={center.id}
            className={`bg-white p-5 rounded-2xl border transition-all shadow-xs ${
              center.isActive ? 'border-slate-200/90' : 'border-rose-300 opacity-75 bg-rose-50/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-extrabold text-sm text-slate-950">{center.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      center.type === 'AUTHORIZED'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : center.type === 'MULTI_BRAND'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {center.type}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{center.address}, {center.city}</span>
                </div>
              </div>

              <button
                onClick={() => handleToggleActive(center)}
                title={center.isActive ? 'Deactivate' : 'Activate'}
                className={`p-1.5 rounded-lg transition-colors ${
                  center.isActive
                    ? 'text-emerald-600 hover:bg-emerald-50'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                {center.isActive
                  ? <ToggleRight className="w-6 h-6" />
                  : <ToggleLeft className="w-6 h-6" />}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-3">
              <span className="flex items-center gap-1 font-bold text-amber-700">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {center.rating} ({center.reviewCount || 120})
              </span>
              <span>•</span>
              {center.phone && (
                <span className="flex items-center gap-1 text-slate-600">
                  <Phone className="w-3 h-3" />
                  {center.phone}
                </span>
              )}
              <span>•</span>
              <span className="text-slate-500">{center.openingHours}</span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              {center.servicesOffered.slice(0, 4).map((svc) => (
                <span
                  key={svc}
                  className="px-2 py-0.5 rounded-md bg-slate-50 text-[10px] text-slate-700 border border-slate-200 font-medium"
                >
                  {svc}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3">
              <span>
                Supported: {center.brandsSupported.length > 0 ? center.brandsSupported.join(', ') : 'All Brands'}
              </span>
              <span className={`font-bold ${center.isActive ? 'text-emerald-700' : 'text-rose-600'}`}>
                {center.isActive ? '● Active' : '● Inactive'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD CENTER MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-black text-base text-slate-950 mb-5">Add New Service Center</h3>

            <form onSubmit={handleSaveCenter} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Center Name</label>
                <input
                  type="text"
                  value={editingCenter.name}
                  onChange={(e) => setEditingCenter({ ...editingCenter, name: e.target.value })}
                  placeholder="e.g. Hyundai Authorized - Baner"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Type</label>
                  <select
                    value={editingCenter.type}
                    onChange={(e) => setEditingCenter({ ...editingCenter, type: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden"
                  >
                    <option value="AUTHORIZED">Authorized OEM</option>
                    <option value="MULTI_BRAND">Multi-Brand</option>
                    <option value="LOCAL">Local Garage</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">City</label>
                  <select
                    value={editingCenter.city}
                    onChange={(e) => setEditingCenter({ ...editingCenter, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden"
                  >
                    <option>Pune</option>
                    <option>Mumbai</option>
                    <option>Bengaluru</option>
                    <option>Delhi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Full Address</label>
                <input
                  type="text"
                  value={editingCenter.address}
                  onChange={(e) => setEditingCenter({ ...editingCenter, address: e.target.value })}
                  placeholder="Street, Locality, City"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={editingCenter.phone}
                    onChange={(e) => setEditingCenter({ ...editingCenter, phone: e.target.value })}
                    placeholder="+91 XX XXXX XXXX"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    value={editingCenter.rating}
                    onChange={(e) => setEditingCenter({ ...editingCenter, rating: Number(e.target.value) })}
                    min="1" max="5" step="0.1"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={editingCenter.openingHours}
                  onChange={(e) => setEditingCenter({ ...editingCenter, openingHours: e.target.value })}
                  placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCenter.autoConfirm}
                    onChange={(e) => setEditingCenter({ ...editingCenter, autoConfirm: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-0"
                  />
                  <span className="text-slate-700 font-semibold">Auto-Confirm Bookings</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-950 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Add to Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
