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
  Plus,
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

  const [savedCount, setSavedCount] = useState(0);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
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

  const handleSaveVehicle = async (andAddAnother: boolean = false) => {
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
          imageUrl: customImageUrl || undefined,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.data) {
        if (andAddAnother) {
          const addedName = `${selectedBrand.name} ${selectedModel.name}`;
          setSavedCount((prev) => prev + 1);
          setSuccessBanner(`🎉 ${addedName} (${registrationNo.toUpperCase().trim() || 'NEW-REG'}) added to your Garage! Add your next vehicle below, or proceed to your Garage.`);
          // Reset form fields for the next vehicle
          setSelectedBrand(null);
          setSelectedModel(null);
          setModels([]);
          setBrandSearch('');
          setCustomImageUrl('');
          setRegistrationNo('');
          setCurrentKm(15000);
          setLastServiceKm(10000);
          setLastServiceDate('');
          setStep(1);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // Direct navigation to Garage
          window.location.href = '/vehicles';
        }
      } else {
        setError(data.error || 'Failed to save vehicle');
      }
    } catch {
      setIsSubmitting(false);
      setError('Network error while saving vehicle');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Header */}
          <div className="mb-8 text-center">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Vehicle Setup Wizard
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Add Vehicle to Garage
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Step {step} of 6 — Tailoring maintenance algorithms to your exact model
            </p>

            {/* Stepper bar */}
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full mt-5 overflow-hidden flex max-w-md mx-auto">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* Success Banner when multiple vehicles added */}
          {successBanner && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  {successBanner}
                </span>
              </div>
              <a
                href="/vehicles"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                Go to Garage ({savedCount}) →
              </a>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2">
                ✕
              </button>
            </div>
          )}

          {/* STEP 1: VEHICLE TYPE */}
          {step === 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Select Vehicle Type</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Choose the category of vehicle you want to register.</p>

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
                      className={`p-5 rounded-xl text-left border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-950/30 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                          isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className="font-semibold text-sm text-slate-900 dark:text-white">{item.label}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Next: Select Brand
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: BRAND */}
          {step === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Select Brand</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pick the manufacturer of your vehicle.</p>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={brandSearch}
                    onChange={(e) => setBrandSearch(e.target.value)}
                    placeholder="Search brand (e.g. Hyundai)"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto pr-1">
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
                      className={`p-3.5 rounded-xl border text-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-950/30 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 mx-auto flex items-center justify-center mb-2 overflow-hidden p-1.5">
                        {(brand as any).logoUrl ? (
                          <img
                            src={(brand as any).logoUrl}
                            alt={brand.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const img = e.currentTarget as HTMLImageElement;
                              if (img.src.endsWith('.png')) {
                                img.src = img.src.replace('.png', '.svg');
                              } else {
                                img.style.display = 'none';
                                (img.parentElement as HTMLElement).innerHTML = `<div class="w-full h-full rounded bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">${brand.name.substring(0,2).toUpperCase()}</div>`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                            {brand.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-xs text-slate-900 dark:text-white block truncate">
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
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!selectedBrand}
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs disabled:opacity-40 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Next: Select Model
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: MODEL */}
          {step === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                Select Model ({selectedBrand?.name})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Choose your exact model variant.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto">
                {models.map((model) => {
                  const isSelected = selectedModel?.id === model.id;
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(model);
                        // Do NOT auto-assign image; user will upload their own
                      }}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-950/30 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Compact model icon — no car image shown */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {model.vehicleClass === 'bike' || model.vehicleClass === 'scooter' ? '🛵' : '🚗'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{model.name}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            {model.vehicleClass} · {model.serviceKmInterval.toLocaleString()} km interval
                          </span>
                        </div>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!selectedModel}
                  onClick={() => setStep(4)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs disabled:opacity-40 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Next: Year & Mileage
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: YEAR & CURRENT KM */}
          {step === 4 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Purchase Year & Current KM</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Accurate odometer reading ensures exact wear calculation.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Purchase Year</label>
                  <select
                    value={purchaseYear}
                    onChange={(e) => setPurchaseYear(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Current KM Reading (Odometer) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="number"
                      value={currentKm}
                      onChange={(e) => setCurrentKm(Number(e.target.value))}
                      placeholder="e.g. 18500"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-12 py-2 text-xs text-slate-900 dark:text-white font-semibold focus:outline-hidden focus:border-blue-500"
                      required
                    />
                    <span className="absolute right-3 top-2 text-xs font-medium text-slate-400">KM</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  disabled={!currentKm || currentKm <= 0}
                  onClick={() => setStep(5)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs disabled:opacity-40 flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Next: Vehicle Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: REGISTRATION & SERVICE HISTORY */}
          {step === 5 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Vehicle Details & Service History</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Provide registration plate number and last recorded service details.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Registration Number
                    </label>
                    <input
                      type="text"
                      value={registrationNo}
                      onChange={(e) => setRegistrationNo(e.target.value.toUpperCase())}
                      placeholder="e.g. MH12AB1234"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-slate-900 dark:text-white uppercase focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">Fuel Type</label>
                    <select
                      value={fuelType}
                      onChange={(e) => setFuelType(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-hidden focus:border-blue-500"
                    >
                      <option value="PETROL">Petrol</option>
                      <option value="DIESEL">Diesel</option>
                      <option value="CNG">CNG</option>
                      <option value="EV">Electric (EV)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Last Service Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={lastServiceDate}
                      onChange={(e) => setLastServiceDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                      Last Service KM (Optional)
                    </label>
                    <input
                      type="number"
                      value={lastServiceKm}
                      onChange={(e) => setLastServiceKm(Number(e.target.value))}
                      placeholder="e.g. 10500"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Custom Vehicle Photo Upload */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Vehicle Photo <span className="font-normal text-slate-400">(Optional)</span>
                  </label>

                  {customImageUrl ? (
                    /* Preview with remove option */
                    <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                      <img
                        src={customImageUrl}
                        alt="Vehicle preview"
                        className="w-full h-44 object-cover"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = vehicleType === 'CAR' ? '/default-car.png' : '/default-bike.png'; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                        <span className="text-xs font-semibold text-white drop-shadow">Custom photo uploaded ✓</span>
                        <button
                          type="button"
                          onClick={() => { setCustomImageUrl(''); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                          className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Upload zone */
                    <label
                      htmlFor="vehicle-photo-upload"
                      className="flex flex-col items-center justify-center gap-3 w-full h-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-blue-400 transition-colors shadow-sm">
                        <Upload className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          Click to upload your vehicle photo
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP · Max 5 MB</p>
                      </div>
                    </label>
                  )}

                  <input
                    ref={fileInputRef}
                    id="vehicle-photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        setError('Image file is too large. Please upload an image under 5 MB.');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        const dataUrl = ev.target?.result as string;
                        if (dataUrl) setCustomImageUrl(dataUrl);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />

                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                    Upload a photo of your actual vehicle. If skipped, a default icon will be shown.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  Review & Save
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SAVE */}
          {step === 6 && (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">Review & Save Vehicle</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
                Verify details before AutoPing configures maintenance alerts and health scoring.
              </p>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 bg-slate-50/50 dark:bg-slate-800/40">
                {/* Vehicle Banner */}
                <div className="relative h-40 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                  {customImageUrl ? (
                    <img
                      src={customImageUrl}
                      alt={`${selectedBrand?.name} ${selectedModel?.name}`}
                      className="w-full h-full object-cover opacity-90"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = vehicleType === 'CAR' ? '/default-car.png' : '/default-bike.png'; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-500 dark:text-slate-400">
                      <Camera className="w-10 h-10 opacity-40" />
                      <span className="text-xs font-medium opacity-60">No photo uploaded</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 text-white">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white uppercase tracking-wider mb-1 inline-block">
                      {vehicleType}
                    </span>
                    <h4 className="font-bold text-base text-white">
                      {selectedBrand?.name} {selectedModel?.name}
                    </h4>
                    <p className="text-xs text-slate-300 font-mono">
                      {registrationNo} • {fuelType} • Year {purchaseYear}
                    </p>
                  </div>
                </div>

                <div className="p-4 grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Current Odometer</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">{currentKm.toLocaleString()} KM</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Last Service Record</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      {lastServiceDate ? `${lastServiceDate} (${lastServiceKm?.toLocaleString()} KM)` : 'None recorded'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSaveVehicle(true)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Save &amp; Add Another</span>
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSaveVehicle(false)}
                    className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      'Saving to Garage...'
                    ) : (
                      <>
                        <span>Save to Garage</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
