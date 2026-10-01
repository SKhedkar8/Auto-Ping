'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Calendar as CalendarIcon,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Flame,
  Globe,
  Info,
  MapPin,
  Phone,
  Sparkles,
  Star,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Booking, CenterType, ServiceCenter, ServiceType, Slot, Vehicle } from '@/lib/types';

export default function BookServicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedVehicleId = searchParams.get('vehicleId');

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Step 1: Services & Notes
  const [catalogServices, setCatalogServices] = useState<ServiceType[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');

  // Step 2: Center
  const [centerTab, setCenterTab] = useState<CenterType>('AUTHORIZED');
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [centerDetailsModal, setCenterDetailsModal] = useState<ServiceCenter | null>(null);

  // Step 3: Date & Slot
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4: Summary & Confirmation
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState('');

  // Cost estimates
  const [costMin, setCostMin] = useState(3500);
  const [costMax, setCostMax] = useState(4800);

  // Quick Chips for notes
  const quickChips = [
    '🔧 Check engine noise',
    '🛞 Check tyre condition',
    '❄️ AC not cooling',
    '🔋 Battery issue',
    '🚨 Warning light',
    '💧 Oil leak inspection',
  ];

  // Initial data loading
  useEffect(() => {
    const user = getClientSession();
    fetch(`/api/vehicles?userId=${user?.id || 'user-customer-1'}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.data && r.data.length > 0) {
          setVehicles(r.data);
          const matched = preSelectedVehicleId
            ? r.data.find((v: Vehicle) => v.id === preSelectedVehicleId)
            : r.data[0];
          setSelectedVehicle(matched || r.data[0]);
        }
      });

    fetch('/api/services')
      .then((r) => r.json())
      .then((r) => {
        if (r.data) {
          setCatalogServices(r.data);
          // Preselect general service & oil change by default
          setSelectedServiceIds(['srv-general', 'srv-oil']);
        }
      });
  }, [preSelectedVehicleId]);

  // Load service centers when center tab or vehicle changes
  useEffect(() => {
    if (!selectedVehicle) return;

    const brandParam = centerTab === 'AUTHORIZED' ? `&brand=${selectedVehicle.brandName}` : '';
    fetch(`/api/centers?tab=${centerTab}${brandParam}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.data) {
          setCenters(r.data);
          if (r.data.length > 0 && !selectedCenter) {
            setSelectedCenter(r.data[0]);
          }
        }
      });
  }, [centerTab, selectedVehicle]);

  // Dynamic cost recalculation
  useEffect(() => {
    if (!selectedVehicle || selectedServiceIds.length === 0) return;

    const selectedBasePrices = catalogServices
      .filter((s) => selectedServiceIds.includes(s.id))
      .map((s) => s.basePrice);

    if (selectedBasePrices.length === 0) return;

    fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceBasePrices: selectedBasePrices,
        vehicleClass: selectedVehicle.vehicleClass,
        centerType: selectedCenter?.type || centerTab,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          setCostMin(res.data.minCost);
          setCostMax(res.data.maxCost);
        }
      })
      .catch(() => {});
  }, [selectedServiceIds, selectedVehicle, selectedCenter, centerTab, catalogServices]);

  // Load slots when center and date change
  useEffect(() => {
    if (!selectedCenter || !selectedDate) return;

    setLoadingSlots(true);
    fetch(`/api/centers/${selectedCenter.id}/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.data) {
          setSlots(r.data);
          // Auto select first available slot
          const available = r.data.find((s: Slot) => !s.isBlocked && s.booked < s.capacity);
          if (available) setSelectedSlot(available);
          else setSelectedSlot(null);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedCenter, selectedDate]);

  // Toggle service selection
  const toggleService = (id: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleChipClick = (chipText: string) => {
    setSpecialNotes((prev) => (prev ? `${prev}, ${chipText}` : chipText));
  };

  // Calendar dates generation
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isPast: boolean }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const isPast = d.getTime() < today.getTime();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isPast });
    }
    return { days, offset: firstDayIndex };
  };

  // Default date selection if none selected
  useEffect(() => {
    if (!selectedDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }
  }, []);

  // Confirm booking
  const handleConfirmBooking = async () => {
    const user = getClientSession();
    if (!user || !selectedVehicle || !selectedCenter || !selectedSlot || !selectedDate) {
      setBookingError('Please complete all booking steps.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    const chosenServiceNames = catalogServices
      .filter((s) => selectedServiceIds.includes(s.id))
      .map((s) => s.name);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          vehicleId: selectedVehicle.id,
          centerId: selectedCenter.id,
          slotId: selectedSlot.id,
          serviceDate: selectedDate,
          serviceTime: selectedSlot.startTime,
          services: chosenServiceNames.length > 0 ? chosenServiceNames : ['General Service'],
          notes: specialNotes || undefined,
          estimatedCostMin: costMin,
          estimatedCostMax: costMax,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.data) {
        setBookingResult(data.data);
        setStep(5); // Success step

        // Fire celebration confetti
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      } else {
        setBookingError(data.error || 'Failed to confirm booking. Slot may have been taken.');
      }
    } catch {
      setIsSubmitting(false);
      setBookingError('Network error while booking. Please try again.');
    }
  };

  // Download iCal (.ics)
  const handleDownloadIcs = () => {
    if (!bookingResult) return;
    const dateFormatted = bookingResult.serviceDate.replace(/-/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Auto Ping//EN
BEGIN:VEVENT
SUMMARY:Vehicle Service: ${bookingResult.vehicleName}
DESCRIPTION:Service appointment at ${bookingResult.centerName}. Booking ID: ${bookingResult.bookingCode}
DTSTART:${dateFormatted}T103000
DTEND:${dateFormatted}T120000
LOCATION:${bookingResult.centerAddress}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `AutoPing-${bookingResult.bookingCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const { days, offset } = generateCalendarDays();

  return (
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Wizard Header */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Direct Slot Reservation
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Book Vehicle Service
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {selectedVehicle
              ? `Booking for ${selectedVehicle.brandName} ${selectedVehicle.modelName} (${selectedVehicle.registrationNo})`
              : 'Select vehicle, services, verified center, and exact time slot.'}
          </p>

          {/* Stepper Progress Bar */}
          {step < 5 && (
            <div className="max-w-xl mx-auto mt-6">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
                <span className={step >= 1 ? 'text-blue-600' : ''}>1. Services</span>
                <span className={step >= 2 ? 'text-blue-600' : ''}>2. Service Center</span>
                <span className={step >= 3 ? 'text-blue-600' : ''}>3. Date & Slot</span>
                <span className={step >= 4 ? 'text-blue-600' : ''}>4. Summary</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div
                  className="gradient-primary h-full transition-all duration-300"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {bookingError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{bookingError}</span>
            </div>
            <button onClick={() => setBookingError('')} className="text-rose-500 hover:text-rose-700 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* STEP 1: CHOOSE SERVICES & SPECIAL REQUIREMENTS */}
        {step === 1 && (
          <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
            {/* Vehicle Selector if multiple */}
            {vehicles.length > 1 && (
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Selected Vehicle</span>
                  <p className="text-xs font-bold text-slate-900">
                    {selectedVehicle?.brandName} {selectedVehicle?.modelName} ({selectedVehicle?.registrationNo})
                  </p>
                </div>
                <select
                  value={selectedVehicle?.id}
                  onChange={(e) => {
                    const found = vehicles.find((v) => v.id === e.target.value);
                    if (found) setSelectedVehicle(found);
                  }}
                  className="text-xs font-semibold bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus:outline-hidden"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brandName} {v.modelName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">1. Select Services Required</h3>
                <p className="text-xs text-slate-500">Pick any combination of maintenance packages.</p>
              </div>
              <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {selectedServiceIds.length} Selected
              </span>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              {catalogServices.map((service) => {
                const isSelected = selectedServiceIds.includes(service.id);
                const isRecommended =
                  service.id === 'srv-general' ||
                  service.id === 'srv-oil' ||
                  (selectedVehicle?.dueStatus === 'DUE_SOON' && service.id === 'srv-brakes');

                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => toggleService(service.id)}
                    className={`p-4 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-50/90 border-[#0B5CFF] shadow-sm ring-1 ring-blue-500/20'
                        : 'bg-white/80 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl mt-0.5">{service.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-slate-900">{service.name}</h4>
                          {isRecommended && (
                            <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Recommended
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                        <span className="inline-block mt-2 font-black text-xs text-slate-900">
                          Approx. ₹{service.basePrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-1 transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Special Requirements Textarea with Quick-Add Chips */}
            <div className="p-5 rounded-2xl bg-white/70 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Special Requirements or Observed Symptoms (Optional)
              </label>
              <p className="text-[11px] text-slate-400 mb-3">
                Tap quick symptoms or describe noises, leaks, or cooling issues for the technicians:
              </p>

              {/* Quick Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Please check unusual brake noise when braking at high speeds."
                maxLength={500}
                rows={3}
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-hidden focus:border-blue-500"
              />
              <span className="text-[10px] text-slate-400 text-right block mt-1">
                {specialNotes.length} / 500 characters
              </span>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Estimated Service Total: <strong className="text-blue-600 text-sm">₹{costMin} – ₹{costMax}</strong>
              </span>

              <button
                type="button"
                disabled={selectedServiceIds.length === 0}
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2 hover:opacity-95"
              >
                Next: Choose Service Center
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE SERVICE CENTER (3 TABS) */}
        {step === 2 && (
          <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">2. Choose Service Center</h3>
            <p className="text-xs text-slate-500 mb-6">
              Compare certified partner workshops based on ratings, proximity, and parts authenticity.
            </p>

            {/* 3 Tabs (Authorized, Multi-Brand, Local) */}
            <div className="flex border-b border-slate-200 mb-6">
              {[
                { key: 'AUTHORIZED' as CenterType, label: `Authorized (${selectedVehicle?.brandName})` },
                { key: 'MULTI_BRAND' as CenterType, label: 'Multi-Brand Certified' },
                { key: 'LOCAL' as CenterType, label: 'Local Verified Garages' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCenterTab(tab.key)}
                  className={`py-2.5 px-4 text-xs font-bold border-b-2 transition-all ${
                    centerTab === tab.key
                      ? 'border-[#0B5CFF] text-[#0B5CFF]'
                      : 'border-transparent text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Centers List */}
            {centers.length === 0 ? (
              <div className="text-center py-12 glass-card border border-slate-100">
                <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-700 text-xs">No Centers Available in this Category</h4>
                <p className="text-[11px] text-slate-400 mt-1 mb-4">
                  Try switching to the Multi-Brand tab for certified network workshops.
                </p>
                <button
                  onClick={() => setCenterTab('MULTI_BRAND')}
                  className="px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-bold"
                >
                  Switch to Multi-Brand
                </button>
              </div>
            ) : (
              <div className="space-y-3.5">
                {centers.map((center) => {
                  const isSelected = selectedCenter?.id === center.id;

                  return (
                    <div
                      key={center.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border-[#0B5CFF] shadow-sm ring-1 ring-blue-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900">{center.name}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                              {center.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {center.address}
                          </p>

                          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600">
                            <span className="flex items-center gap-1 font-extrabold text-amber-600">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              {center.rating} ({center.reviewCount})
                            </span>
                            <span>•</span>
                            <span className="font-medium text-slate-600">📍 {center.distanceKm || 3.2} km away</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-bold">🟢 Open Slots Available</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:self-center">
                          <button
                            type="button"
                            onClick={() => setCenterDetailsModal(center)}
                            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                          >
                            View Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCenter(center)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Services
              </button>
              <button
                type="button"
                disabled={!selectedCenter}
                onClick={() => setStep(3)}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2 hover:opacity-95"
              >
                Next: Pick Date & Time Slot
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DATE & TIME SLOT PICKER */}
        {step === 3 && (
          <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">3. Select Date & Slot</h3>
            <p className="text-xs text-slate-500 mb-6">
              Pick your preferred visit date and confirmed drop-off window.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              {/* Calendar Column */}
              <div className="md:col-span-6 bg-white/80 p-5 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-extrabold text-xs text-slate-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        const m = new Date(currentMonth);
                        m.setMonth(m.getMonth() - 1);
                        setCurrentMonth(m);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const m = new Date(currentMonth);
                        m.setMonth(m.getMonth() + 1);
                        setCurrentMonth(m);
                      }}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day names */}
                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mb-2">
                  <span>Su</span>
                  <span>Mo</span>
                  <span>Tu</span>
                  <span>We</span>
                  <span>Th</span>
                  <span>Fr</span>
                  <span>Sa</span>
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: offset }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {days.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        disabled={item.isPast}
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`h-9 rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                          item.isPast
                            ? 'text-slate-300 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#0B5CFF] text-white shadow-xs'
                            : 'hover:bg-blue-50 text-slate-700'
                        }`}
                      >
                        {item.dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots Column */}
              <div className="md:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-extrabold text-xs text-slate-900">
                      Available Time Slots for {selectedDate}
                    </h4>
                    {loadingSlots && <span className="text-[10px] text-blue-600">Checking...</span>}
                  </div>

                  {slots.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white/60 rounded-2xl border border-slate-100">
                      {loadingSlots ? 'Loading slots...' : 'Pick a date on the calendar to see slots.'}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {slots.map((slot) => {
                        const isSelected = selectedSlot?.id === slot.id;
                        const isFull = slot.isBlocked || slot.booked >= slot.capacity;
                        const onlyOneLeft = slot.capacity - slot.booked === 1;

                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={isFull}
                            onClick={() => setSelectedSlot(slot)}
                            className={`p-3.5 rounded-xl border text-left transition-all ${
                              isFull
                                ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                : isSelected
                                ? 'bg-blue-50/90 border-[#0B5CFF] ring-2 ring-blue-500/20 shadow-xs'
                                : 'bg-white/90 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-extrabold text-xs text-slate-900">{slot.startTime}</span>
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                            </div>

                            {isFull ? (
                              <span className="text-[10px] font-bold text-rose-500">Fully Booked</span>
                            ) : onlyOneLeft ? (
                              <span className="text-[10px] font-bold text-amber-600">Only 1 slot left!</span>
                            ) : (
                              <span className="text-[10px] font-medium text-emerald-600">Available</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="mt-6 p-3 rounded-xl bg-blue-50/80 border border-blue-100 text-xs text-slate-600 flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Slots feature real-time capacity locks to prevent duplicate appointments.</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Center
              </button>
              <button
                type="button"
                disabled={!selectedSlot}
                onClick={() => setStep(4)}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-40 flex items-center gap-2 hover:opacity-95"
              >
                Next: Review Summary
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SUMMARY & CONFIRMATION */}
        {step === 4 && (
          <div className="glass-card p-6 sm:p-8 border border-white shadow-xl animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">4. Review & Confirm Booking</h3>
            <p className="text-xs text-slate-500 mb-6">
              Check appointment information before confirming your reservation.
            </p>

            <div className="bg-white/80 rounded-2xl border border-slate-200 p-6 space-y-4 mb-6">
              {/* Vehicle & Center Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center text-white">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      {selectedVehicle?.brandName} {selectedVehicle?.modelName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Reg: {selectedVehicle?.registrationNo} • Current: {selectedVehicle?.currentKm.toLocaleString()} KM
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-xs font-bold text-slate-900 block">{selectedCenter?.name}</span>
                  <span className="text-[11px] text-slate-500 block">{selectedCenter?.address}</span>
                </div>
              </div>

              {/* Schedule and cost */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Schedule</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedDate}</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">{selectedSlot?.startTime}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Estimated Cost</span>
                  <span className="font-extrabold text-blue-700 text-sm">₹{costMin} – ₹{costMax}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pay after service completion</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-400 block text-[10px] font-semibold uppercase">Center Type</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedCenter?.type}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">⭐ {selectedCenter?.rating} Rating</p>
                </div>
              </div>

              {/* Services List */}
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-700 block mb-2">Booked Services:</span>
                <ul className="space-y-1">
                  {catalogServices
                    .filter((s) => selectedServiceIds.includes(s.id))
                    .map((s) => (
                      <li key={s.id} className="text-xs text-slate-600 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{s.name} (~₹{s.basePrice})</span>
                      </li>
                    ))}
                </ul>
              </div>

              {specialNotes && (
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <span className="font-bold text-slate-700">Special Notes: </span>
                  <span className="text-slate-600 italic">&quot;{specialNotes}&quot;</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Change Time
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="px-7 py-3 rounded-xl gradient-primary text-white font-extrabold text-xs shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:opacity-95"
              >
                {isSubmitting ? 'Locking Slot...' : 'Confirm Service Appointment'}
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: SUCCESS STATE WITH CELEBRATION */}
        {step === 5 && bookingResult && (
          <div className="glass-card p-8 sm:p-12 border border-white shadow-2xl text-center max-w-2xl mx-auto animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 font-bold shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 mb-1">Service Booked!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-6">
              Your {bookingResult.vehicleName} service is scheduled for{' '}
              <strong className="text-slate-900">{bookingResult.serviceDate} • {bookingResult.serviceTime}</strong>.
            </p>

            {/* Booking Code Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 inline-block mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                Official Booking Reference
              </span>
              <span className="font-mono text-xl font-black text-[#0B5CFF] tracking-wider">
                {bookingResult.bookingCode}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownloadIcs}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 shadow-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Add to Calendar (.ics)
              </button>

              <a
                href="/bookings"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl gradient-primary text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:opacity-95 flex items-center justify-center gap-2"
              >
                View My Bookings
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* CENTER DETAILS MODAL */}
      {centerDetailsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg glass-dropdown rounded-3xl p-6 shadow-2xl border border-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{centerDetailsModal.name}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                  {centerDetailsModal.type}
                </span>
              </div>
              <button
                onClick={() => setCenterDetailsModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <p><strong>Address:</strong> {centerDetailsModal.address}, {centerDetailsModal.city}</p>
              <p><strong>Phone:</strong> {centerDetailsModal.phone}</p>
              <p><strong>Hours:</strong> {centerDetailsModal.openingHours}</p>
              <p><strong>Supported Brands:</strong> {centerDetailsModal.brandsSupported.join(', ') || 'All multi-brand models'}</p>
              <div>
                <strong className="block mb-1">Services Offered:</strong>
                <div className="flex flex-wrap gap-1">
                  {centerDetailsModal.servicesOffered.map((s) => (
                    <span key={s} className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {centerDetailsModal.websiteUrl && (
                <div className="pt-2">
                  <a
                    href={centerDetailsModal.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5" /> Visit Center Website
                  </a>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedCenter(centerDetailsModal);
                  setCenterDetailsModal(null);
                }}
                className="px-4 py-2 rounded-xl gradient-primary text-white text-xs font-bold"
              >
                Select this Center
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
