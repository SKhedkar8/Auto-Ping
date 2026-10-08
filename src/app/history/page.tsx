'use client';

import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Car,
  CheckCircle2,
  DollarSign,
  Download,
  Filter,
  History,
  MapPin,
  Plus,
  Receipt,
  Sparkles,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { ServiceRecord, Vehicle } from '@/lib/types';

export default function HistoryPage() {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Add Past Service Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({
    vehicleId: '',
    centerName: '',
    date: '2026-06-10',
    km: 15000,
    servicesDone: 'Engine Oil & Filter Change, Brake Inspection',
    totalCost: 3500,
    notes: 'Regular periodic maintenance at authorized workshop.',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const user = getClientSession();
    fetch(`/api/vehicles?userId=${user?.id || 'user-customer-1'}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setVehicles(res.data);
          if (res.data.length > 0) {
            setAddForm((prev) => ({ ...prev, vehicleId: res.data[0].id }));
          }
        }
      });

    fetchRecords();
  }, []);

  const fetchRecords = (vehId?: string) => {
    setIsLoading(true);
    const query = vehId && vehId !== 'all' ? `?vehicleId=${vehId}` : '';
    fetch(`/api/history${query}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setRecords(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  const handleVehicleFilterChange = (id: string) => {
    setSelectedVehicleId(id);
    fetchRecords(id);
  };

  const handleSavePastService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.vehicleId || !addForm.centerName || !addForm.km || !addForm.totalCost) {
      alert('Please fill out all required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...addForm,
          servicesDone: addForm.servicesDone.split(',').map((s) => s.trim()),
        }),
      });
      const data = await res.json();
      setIsSaving(false);

      if (data.data) {
        setShowAddModal(false);
        fetchRecords(selectedVehicleId);
      }
    } catch {
      setIsSaving(false);
      alert('Error saving record');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Service History Logs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Verified records of parts replaced, service invoices, and odometer milestones.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Add Past Service Record
            </button>
          </div>
        </div>

        {/* Vehicle Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
          <button
            onClick={() => handleVehicleFilterChange('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedVehicleId === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            All Vehicles
          </button>
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => handleVehicleFilterChange(v.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedVehicleId === v.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {v.brandName} {v.modelName} ({v.registrationNo})
            </button>
          ))}
        </div>

        {/* History Timeline */}
        {records.length === 0 && !isLoading ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center max-w-md mx-auto my-12 border border-slate-200 dark:border-slate-800 shadow-xs">
            <History className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">No Service Records Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Completed bookings or manually added records will appear in this timeline.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
            >
              Add Older Service Record
            </button>
          </div>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
            {records.map((rec) => (
              <div key={rec.id} className="relative">
                {/* Node icon on line */}
                <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-950" />

                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 font-mono">
                        {rec.date} • {rec.km.toLocaleString()} KM
                      </span>
                      <h3 className="font-semibold text-base text-slate-900 dark:text-white mt-0.5">
                        {rec.centerName}
                      </h3>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-sm border border-emerald-200 dark:border-emerald-800 font-mono">
                        ₹{rec.totalCost.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 mb-2">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1">
                      Services & Parts Replaced
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {rec.servicesDone.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
                        >
                          ✓ {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {rec.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2">
                      Technician memo: &quot;{rec.notes}&quot;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ADD PAST SERVICE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl p-6 shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <h3 className="font-semibold text-base text-slate-900 dark:text-white mb-1">
              Add Past Service Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Record a prior maintenance invoice to improve health calculation accuracy.
            </p>

            <form onSubmit={handleSavePastService} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle</label>
                <select
                  value={addForm.vehicleId}
                  onChange={(e) => setAddForm({ ...addForm, vehicleId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brandName} {v.modelName} ({v.registrationNo})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Service Date</label>
                  <input
                    type="date"
                    value={addForm.date}
                    onChange={(e) => setAddForm({ ...addForm, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">KM at Service</label>
                  <input
                    type="number"
                    value={addForm.km}
                    onChange={(e) => setAddForm({ ...addForm, km: Number(e.target.value) })}
                    placeholder="e.g. 10000"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Service Center Name</label>
                <input
                  type="text"
                  value={addForm.centerName}
                  onChange={(e) => setAddForm({ ...addForm, centerName: e.target.value })}
                  placeholder="e.g. Authorized Hyundai Service, Shivaji Nagar"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Services Performed (comma separated)
                </label>
                <input
                  type="text"
                  value={addForm.servicesDone}
                  onChange={(e) => setAddForm({ ...addForm, servicesDone: e.target.value })}
                  placeholder="Engine Oil, Brake Inspection, Wash"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Total Bill / Cost (₹)</label>
                <input
                  type="number"
                  value={addForm.totalCost}
                  onChange={(e) => setAddForm({ ...addForm, totalCost: Number(e.target.value) })}
                  placeholder="e.g. 4200"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Technician Notes (Optional)</label>
                <textarea
                  value={addForm.notes}
                  onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })}
                  placeholder="Details of inspection..."
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition-colors"
                >
                  {isSaving ? 'Saving Record...' : 'Save to History'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Chatbot />
      <Footer />
    </div>
  );
}
