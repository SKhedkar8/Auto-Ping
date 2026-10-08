'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Gauge,
  HelpCircle,
  Search,
  Sparkles,
  Upload,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getClientSession } from '@/lib/auth';
import { Brand, VehicleModel, VehicleType } from '@/lib/types';

export default function AddVehiclePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicleType, setVehicleType] = useState<VehicleType>('CAR');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<VehicleModel | null>(null);
  const [brandSearch, setBrandSearch] = useState('');

  const [purchaseYear, setPurchaseYear] = useState<number>(2024);
  const [currentKm, setCurrentKm] = useState<number>(18500);
  const [registrationNo, setRegistrationNo] = useState('MH12AB1234');
  const [fuelType, setFuelType] = useState<'PETROL' | 'DIESEL' | 'CNG' | 'EV'>('PETROL');
  const [lastServiceDate, setLastServiceDate] = useState('2026-08-15');
  const [lastServiceKm, setLastServiceKm] = useState<number>(10500);
  const [customImageUrl, setCustomImageUrl] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch brands
  useEffect(() => {
    fetch(`/api/catalog/brands?type=${vehicleType}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.data) setBrands(res.data);
      })
      .catch(() => {});
  }, [vehicleType]);

  // Fetch models when brand changes
  useEffect(() => {
    if (selectedBrand) {
      fetch(`/api/catalog/models?brandId=${selectedBrand.id}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.data) setModels(res.data);
        })
        .catch(() => {});
    }
  }, [selectedBrand]);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const years = Array.from({ length: 27 }, (_, i) => 2026 - i);

  const handleSaveVehicle = async () => {
    if (!selectedBrand || !selectedModel) {
      setError('Please choose a brand and model.');
      return;
    }

    if (!currentKm || currentKm <= 0) {
      setError('Please enter a valid current odometer reading (KM).');
      return;
    }

    if (lastServiceKm && lastServiceKm > currentKm) {
      setError('Last service KM cannot be greater than the current KM.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const user = getClientSession();
    try {
      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'user-customer-1',
          brandName: selectedBrand.name,
          modelName: selectedModel.name,
          modelId: selectedModel.id,
          type: vehicleType,
          vehicleClass: selectedModel.vehicleClass,
          registrationNo: registrationNo.toUpperCase().trim() || 'MH12AB0000',
          purchaseYear: Number(purchaseYear),
          currentKm: Number(currentKm),
          fuelType,
          lastServiceDate: lastServiceDate || undefined,
          lastServiceKm: lastServiceKm ? Number(lastServiceKm) : undefined,
          imageUrl: customImageUrl || selectedModel.imageUrl || undefined,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.data) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Failed to save vehicle');
      }
    } catch {
      setIsSubmitting(false);
      setError('Network error while saving vehicle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8 text-center">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              Vehicle Setup Wizard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Add Your Vehicle
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Step {step} of 6 — Tailoring maintenance algorithms to your exact model
            </p>

            {/* Stepper bar */}
            <div className="w-full bg-slate-200 h-2 rounded-full mt-5 overflow-hidden flex">
              <div
                className="gradient-primary h-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold">
                ✕
              </button>
            </div>
          )}

          {/* STEP 1: VEHICLE TYPE */}
          {step === 1 && (
            <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 mb-2">Select Vehicle Type</h3>
              <p className="text-xs text-slate-500 mb-6">Choose the category of vehicle you want to register.</p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { type: 'CAR' as VehicleType, icon: Car, label: 'Four Wheeler / Car', desc: 'Hatchbacks, Sedans, SUVs & Luxury' },
                  { type: 'BIKE' as VehicleType, icon: Bike, label: 'Motorcycle / Bike', desc: 'Cruisers, Commuters, Sports Bikes' },
                  { type: 'SCOOTER' as VehicleType, icon: Bike, label: 'Scooter / Scooty', desc: 'Automatic gearless city commuters' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = vehicleType === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setVehicleType(item.type)}
                      className={`p-5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#0B5CFF] shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                          isSelected ? 'gradient-primary text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{item.label}</h4>
                      <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 hover:opacity-95"
                >
                  Next: Select Brand
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BRAND */}
          {step === 2 && (
            <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Select Brand</h3>
                  <p className="text-xs text-slate-500">Pick the manufacturer of your vehicle.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brand (e.g. Hyundai)"
                    className="w-full bg-white/90 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 max-h-80 overflow-y-auto pr-1">
                {filteredBrands.map((brand) => {
                  const isSelected = selectedBrand?.id === brand.id;
                  return (
                    <button
                      key={brand.id}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(brand);
                        setSelectedModel(null);
                      }}
                      className={`p-4 rounded-2xl border text-center transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#0B5CFF] ring-2 ring-blue-500/30 shadow-md scale-[1.02]'
                          : 'bg-white border-slate-200/90 hover:border-blue-400 hover:shadow-md hover:bg-slate-50/50 shadow-xs'
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/90 mx-auto flex items-center justify-center mb-2 shadow-xs overflow-hidden p-2">
                        {(brand as any).logoUrl ? (
                          <img
                            src={(brand as any).logoUrl}
                            alt={brand.name}
                            className="w-full h-full object-contain filter drop-shadow-xs"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.src.endsWith('.png')) {
                                img.src = img.src.replace('.png', '.svg');
                              } else {
                                img.style.display = 'none';
                                (img.parentElement as HTMLElement).innerHTML = `<div class="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">${brand.name.substring(0,2).toUpperCase()}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                            {brand.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-xs text-slate-900 block truncate">
                        {brand.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!selectedBrand}
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2 hover:opacity-95"
                >
                  Next: Select Model
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MODEL */}
          {step === 3 && (
            <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Select Model ({selectedBrand?.name})
              </h3>
              <p className="text-xs text-slate-500 mb-6">Choose your exact model variant.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {models.map((model) => {
                  const isSelected = selectedModel?.id === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        if (model.imageUrl) {
                          setCustomImageUrl(model.imageUrl);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#0B5CFF] ring-2 ring-blue-500/20 shadow-md'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {model.imageUrl && (
                          <div className="w-14 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                            <img
                              src={model.imageUrl}
                              alt={model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-950">{model.name}</h4>
                          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                            Class: {model.vehicleClass} • Interval: {model.serviceKmInterval.toLocaleString()} km
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!selectedModel}
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2 hover:opacity-95"
                >
                  Next: Year & Mileage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: YEAR & CURRENT KM */}
          {step === 4 && (
            <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Purchase Year & Current KM</h3>
              <p className="text-xs text-slate-500 mb-6">
                Accurate odometer reading ensures exact wear calculation.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Purchase Year</label>
                  <select
                    value={purchaseYear}
                    onChange={(e) => setPurchaseYear(Number(e.target.value))}
                    className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Current KM Reading (Odometer) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="number"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(Number(e.target.value))}
                      placeholder="e.g. 18500"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl pl-10 pr-12 py-2.5 text-xs text-slate-900 font-bold focus:outline-hidden focus:border-blue-500"
                      required
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">KM</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!currentKm || currentKm <= 0}
                  onClick={() => setStep(5)}
                  className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2 hover:opacity-95"
                >
                  Next: Vehicle Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REGISTRATION & SERVICE HISTORY */}
          {step === 5 && (
            <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Vehicle Details & Service History</h3>
              <p className="text-xs text-slate-500 mb-6">
                Provide registration plate number and last recorded service details.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value.toUpperCase())}
                      placeholder="e.g. MH12AB1234"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="EV">Electric (EV)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Last Service Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={lastServiceDate}
                      onChange={(e) => setLastServiceDate(e.target.value)}
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Last Service KM (Optional)
                    </label>
                    <input
                      type="number"
                      value={lastServiceKm}
                      onChange={(e) => setLastServiceKm(Number(e.target.value))}
                      placeholder="e.g. 10500"
                      className="w-full bg-white/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Vehicle Photo Upload (Optional) */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Vehicle Photo (Upload your bike/car photo or use default)
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600 relative">
                      <img
                        src={
                          customImageUrl ||
                          selectedModel?.imageUrl ||
                          (vehicleType === 'CAR'
                            ? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'
                            : 'https://images.unsplash.com/photo-1558981033-40a1ea4dbab5?w=600&auto=format&fit=crop&q=80')
                        }
                        alt="Vehicle Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setCustomImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        accept="image/*"
                        className="hidden"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {customImageUrl ? 'Replace Photo' : 'Upload Bike / Car Image'}
                        </button>
                        {customImageUrl && (
                          <button
                            type="button"
                            onClick={() => setCustomImageUrl('')}
                            className="text-[11px] text-rose-500 hover:underline font-semibold"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {customImageUrl
                          ? '✓ Custom photo uploaded and ready'
                          : 'A high-resolution image of this model is automatically assigned.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-2 hover:opacity-95"
                >
                  Review & Save
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SAVE */}
          {step === 6 && (
            <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
              <h3 className="text-base font-bold text-slate-900 mb-1">Review & Save Vehicle</h3>
              <p className="text-xs text-slate-500 mb-6">
                Verify the details before Auto Ping generates your health score and reminders.
              </p>

              <div className="rounded-2xl bg-white/80 border border-slate-200 overflow-hidden mb-6 shadow-sm">
                {/* Vehicle Banner */}
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src={
                      customImageUrl ||
                      selectedModel?.imageUrl ||
                      (vehicleType === 'CAR'
                        ? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80'
                        : 'https://images.unsplash.com/photo-1558981033-40a1ea4dbab5?w=600&auto=format&fit=crop&q=80')
                    }
                    alt={`${selectedBrand?.name} ${selectedModel?.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                      {vehicleType}
                    </span>
                    <h4 className="font-extrabold text-lg text-white drop-shadow">
                      {selectedBrand?.name} {selectedModel?.name}
                    </h4>
                    <p className="text-xs text-white/80">
                      {registrationNo} • {fuelType} • Year {purchaseYear}
                    </p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4 text-xs bg-white/95">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Current Odometer</span>
                    <span className="font-bold text-slate-900 text-sm">{currentKm.toLocaleString()} KM</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Last Service Log</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {lastServiceDate ? `${lastServiceDate} (${lastServiceKm?.toLocaleString()} KM)` : 'None recorded'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>
                <button 
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveVehicle}
                  className="px-7 py-3 rounded-xl gradient-primary text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:opacity-95"
                >
                  {isSubmitting ? 'Calculating Diagnostics...' : 'Save & Calculate Health Score'}
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
