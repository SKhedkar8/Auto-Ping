'use client';

import React, { useState } from 'react';
import { X, Image as ImageIcon, Car, Save, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { FuelType, Vehicle, VehicleType } from '@/lib/types';

interface EditVehicleModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (updatedVehicle: Vehicle) => void;
}

const PRESET_IMAGES = [
  { label: 'Default Car', url: '/default-car.png' },
  { label: 'Default Bike', url: '/default-bike.png' },
  { label: 'Modern SUV', url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80' },
  { label: 'Sports Sedan', url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Luxury EV', url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=800&auto=format&fit=crop&q=80' },
  { label: 'Cruiser Bike', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80' },
];

export default function EditVehicleModal({
  vehicle,
  isOpen,
  onClose,
  onUpdated,
}: EditVehicleModalProps) {
  const [brandName, setBrandName] = useState(vehicle.brandName);
  const [modelName, setModelName] = useState(vehicle.modelName);
  const [registrationNo, setRegistrationNo] = useState(vehicle.registrationNo);
  const [purchaseYear, setPurchaseYear] = useState(vehicle.purchaseYear);
  const [currentKm, setCurrentKm] = useState(vehicle.currentKm);
  const [fuelType, setFuelType] = useState<FuelType>(vehicle.fuelType);
  const [type, setType] = useState<VehicleType>(vehicle.type);
  const [vehicleClass, setVehicleClass] = useState(vehicle.vehicleClass);
  const [imageUrl, setImageUrl] = useState(vehicle.imageUrl || '/default-car.png');
  const [lastServiceDate, setLastServiceDate] = useState(vehicle.lastServiceDate || '');
  const [lastServiceKm, setLastServiceKm] = useState(vehicle.lastServiceKm || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewError, setPreviewError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<Vehicle> = {
        brandName: brandName.trim(),
        modelName: modelName.trim(),
        registrationNo: registrationNo.trim().toUpperCase(),
        purchaseYear: Number(purchaseYear),
        currentKm: Number(currentKm),
        fuelType,
        type,
        vehicleClass: vehicleClass as any,
        imageUrl: imageUrl.trim() || undefined,
        lastServiceDate: lastServiceDate ? lastServiceDate : undefined,
        lastServiceKm: lastServiceKm ? Number(lastServiceKm) : undefined,
      };

      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update vehicle');
      }

      onUpdated(data.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong while saving changes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-7 shadow-2xl border border-black/[0.08] dark:border-white/[0.1] my-8 transition-all apple-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 dark:bg-[#0071E3]/20 flex items-center justify-center text-[#0071E3] dark:text-[#2997FF]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[19px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                Edit Vehicle Details
              </h2>
              <p className="text-[12px] text-[#86868b]">
                Update specifications, registration number, photo, or odometer.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] bg-black/[0.04] dark:bg-white/[0.06] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* IMAGE SECTION */}
          <div className="p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
            <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#86868b] mb-3">
              Vehicle Image / Photo
            </label>

            <div className="flex flex-col sm:flex-row gap-4 items-center mb-3">
              <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-black/5 dark:bg-white/5 border border-black/[0.08] dark:border-white/[0.1] shrink-0 flex items-center justify-center shadow-inner">
                {imageUrl && !previewError ? (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPreviewError(true)}
                    onLoad={() => setPreviewError(false)}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#86868b] text-[11px] p-2 text-center">
                    <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                    <span>No image preview</span>
                  </div>
                )}
              </div>

              <div className="flex-1 w-full space-y-2">
                <input
                  type="text"
                  placeholder="https://example.com/vehicle-image.jpg or /default-car.png"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setPreviewError(false);
                  }}
                  className="w-full px-3.5 py-2 rounded-xl text-[13px] bg-white dark:bg-[#161617] border border-black/[0.1] dark:border-white/[0.15] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
                />
                <p className="text-[11px] text-[#86868b]">
                  Paste any direct image URL, or choose a one-click preset below:
                </p>
              </div>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-black/[0.04] dark:border-white/[0.06]">
              {PRESET_IMAGES.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setImageUrl(preset.url);
                    setPreviewError(false);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    imageUrl === preset.url
                      ? 'bg-[#0071E3] text-white shadow-xs'
                      : 'bg-white dark:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] border border-black/[0.06] dark:border-white/[0.08]'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* BASIC INFO GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Brand / Make
              </label>
              <input
                type="text"
                required
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Hyundai, Honda, BMW"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#161617] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Model Name
              </label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. Creta, City, 3 Series"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#161617] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Registration Number (Plate)
              </label>
              <input
                type="text"
                required
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                placeholder="e.g. MH12AB1234"
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] font-mono uppercase bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#161617] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Purchase Year
              </label>
              <input
                type="number"
                required
                min={1990}
                max={new Date().getFullYear() + 1}
                value={purchaseYear}
                onChange={(e) => setPurchaseYear(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:bg-white dark:focus:bg-[#161617] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              />
            </div>
          </div>

          {/* VEHICLE TYPE & FUEL */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Vehicle Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VehicleType)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              >
                <option value="CAR">Car</option>
                <option value="BIKE">Motorcycle</option>
                <option value="SCOOTER">Scooter</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Class / Body
              </label>
              <select
                value={vehicleClass}
                onChange={(e) => setVehicleClass(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              >
                <option value="hatchback">Hatchback</option>
                <option value="sedan">Sedan</option>
                <option value="suv">SUV</option>
                <option value="premium">Premium / Luxury</option>
                <option value="bike">Bike</option>
                <option value="scooter">Scooter</option>
              </select>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Fuel Type
              </label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as FuelType)}
                className="w-full px-3.5 py-2.5 rounded-xl text-[13px] bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3] transition-all"
              >
                <option value="PETROL">Petrol</option>
                <option value="DIESEL">Diesel</option>
                <option value="ELECTRIC">Electric</option>
                <option value="HYBRID">Hybrid</option>
                <option value="CNG">CNG</option>
              </select>
            </div>
          </div>

          {/* ODOMETER & SERVICE HISTORY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.04] dark:border-white/[0.06]">
            <div>
              <label className="block text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Current Odometer (KM)
              </label>
              <input
                type="number"
                required
                min={0}
                value={currentKm}
                onChange={(e) => setCurrentKm(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-[13px] font-mono bg-white dark:bg-[#161617] border border-black/[0.1] dark:border-white/[0.15] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Last Service Date
              </label>
              <input
                type="date"
                value={lastServiceDate}
                onChange={(e) => setLastServiceDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-[13px] bg-white dark:bg-[#161617] border border-black/[0.1] dark:border-white/[0.15] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] mb-1.5">
                Last Service KM
              </label>
              <input
                type="number"
                min={0}
                placeholder="e.g. 10000"
                value={lastServiceKm}
                onChange={(e) => setLastServiceKm(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-[13px] font-mono bg-white dark:bg-[#161617] border border-black/[0.1] dark:border-white/[0.15] text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3]"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-full text-[13px] font-medium bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.08] dark:hover:bg-white/[0.12] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[13px] font-semibold bg-[#0071E3] hover:bg-[#0077ED] text-white disabled:opacity-50 transition-all shadow-md shadow-[#0071E3]/20"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes…
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
