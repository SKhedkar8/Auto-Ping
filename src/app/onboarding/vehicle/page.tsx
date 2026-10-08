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
              Add Your Vehicle
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
                        if (model.imageUrl) {
                          setCustomImageUrl(model.imageUrl);
                        }
                      }}
                      className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/50 border-blue-600 dark:bg-blue-950/30 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {model.imageUrl && (
                          <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
                            <img
                              src={model.imageUrl}
                              alt={model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-xs text-slate-900 dark:text-white">{model.name}</h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                            Class: {model.vehicleClass} • Interval: {model.serviceKmInterval.toLocaleString()} km
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

                {/* Vehicle Photo Upload (Optional) */}
                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Vehicle Photo (Upload your bike/car photo or use default)
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700">
                    <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-700 shrink-0 border border-slate-200 dark:border-slate-600 relative">
                      <img
                        src={
                          customImageUrl ||
                          selectedModel?.imageUrl ||
                          (vehicleType === 'CAR' ? '/default-car.png' : '/default-bike.png')
                        }
                        alt="Vehicle Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
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
                          className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          {customImageUrl ? 'Replace Photo' : 'Upload Image'}
                        </button>
                        {customImageUrl && (
                          <button
                            type="button"
                            onClick={() => setCustomImageUrl('')}
                            className="text-xs text-rose-500 hover:underline"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {customImageUrl
                          ? 'Custom photo uploaded'
                          : 'Standard image for this model will be used if none uploaded.'}
                      </p>
                    </div>
                  </div>
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
                <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                  <img
                    src={
                      customImageUrl ||
                      selectedModel?.imageUrl ||
                      (vehicleType === 'CAR' ? '/default-car.png' : '/default-bike.png')
                    }
                    alt={`${selectedBrand?.name} ${selectedModel?.name}`}
                    className="w-full h-full object-cover opacity-90"
                  />
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

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Edit Details
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleSaveVehicle}
                  className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving Vehicle...' : 'Save & Calculate Health Score'}
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
