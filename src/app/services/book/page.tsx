'use client';

import React, { Suspense, useEffect, useState } from 'react';
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
  Shield,
  Sparkles,
  Star,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { Booking, CenterType, ServiceCenter, ServiceType, Slot, Vehicle } from '@/lib/types';

/* ─────────────────────────── helpers ─────────────────────────── */
const STEPS = [
  { num: 1, label: 'Services', icon: Wrench },
  { num: 2, label: 'Workshop', icon: MapPin },
  { num: 3, label: 'Schedule', icon: CalendarIcon },
  { num: 4, label: 'Confirm', icon: Shield },
];

/* ─────────────────────────── inner page ─────────────────────────── */
function BookServicePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedVehicleId = searchParams.get('vehicleId');

  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Step 1
  const [catalogServices, setCatalogServices] = useState<ServiceType[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [specialNotes, setSpecialNotes] = useState('');

  // Step 2
  const [centerTab, setCenterTab] = useState<CenterType>('AUTHORIZED');
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);
  const [centerDetailsModal, setCenterDetailsModal] = useState<ServiceCenter | null>(null);

  // Step 3
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Step 4 / 5
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<Booking | null>(null);
  const [bookingError, setBookingError] = useState('');

  // Estimates
  const [costMin, setCostMin] = useState(3500);
  const [costMax, setCostMax] = useState(4800);

  const quickChips = [
    '🔧 Engine noise', '🛞 Tyre check', '❄️ AC not cooling',
    '🔋 Battery issue', '🚨 Warning light', '💧 Oil leak',
  ];

  /* ── data loading ── */
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
          setSelectedServiceIds(['srv-general', 'srv-oil']);
        }
      });
  }, [preSelectedVehicleId]);

  useEffect(() => {
    if (!selectedVehicle) return;
    const brandParam = centerTab === 'AUTHORIZED' ? `&brand=${selectedVehicle.brandName}` : '';
    fetch(`/api/centers?tab=${centerTab}${brandParam}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.data) {
          setCenters(r.data);
          if (r.data.length > 0 && !selectedCenter) setSelectedCenter(r.data[0]);
        }
      });
  }, [centerTab, selectedVehicle]);

  useEffect(() => {
    if (!selectedVehicle || selectedServiceIds.length === 0) return;
    const basePrices = catalogServices
      .filter((s) => selectedServiceIds.includes(s.id))
      .map((s) => s.basePrice);
    if (basePrices.length === 0) return;
    fetch('/api/estimate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceBasePrices: basePrices,
        vehicleClass: selectedVehicle.vehicleClass,
        centerType: selectedCenter?.type || centerTab,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.data) { setCostMin(res.data.minCost); setCostMax(res.data.maxCost); }
      })
      .catch(() => {});
  }, [selectedServiceIds, selectedVehicle, selectedCenter, centerTab, catalogServices]);

  useEffect(() => {
    if (!selectedCenter || !selectedDate) return;
    setLoadingSlots(true);
    fetch(`/api/centers/${selectedCenter.id}/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.data) {
          setSlots(r.data);
          const available = r.data.find((s: Slot) => !s.isBlocked && s.booked < s.capacity);
          setSelectedSlot(available || null);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [selectedCenter, selectedDate]);

  useEffect(() => {
    if (!selectedDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setSelectedDate(tomorrow.toISOString().split('T')[0]);
    }
  }, []);

  /* ── actions ── */
  const toggleService = (id: string) =>
    setSelectedServiceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleChipClick = (chip: string) =>
    setSpecialNotes((prev) => (prev ? `${prev}, ${chip}` : chip));

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isPast: boolean }[] = [];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      const isPast = d.getTime() < today.getTime();
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: i, isPast });
    }
    return { days, offset: firstDayIndex };
  };

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
        setStep(5);
        try { confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } }); } catch {}
      } else {
        setBookingError(data.error || 'Failed to confirm booking. Slot may have been taken.');
      }
    } catch {
      setIsSubmitting(false);
      setBookingError('Network error while booking. Please try again.');
    }
  };

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
  const selectedServices = catalogServices.filter((s) => selectedServiceIds.includes(s.id));

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000]">
      <Navbar />

      <main className="flex-1 pt-8 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">

        {/* ── Wizard header ── */}
        {step < 5 && (
          <div className="mb-10 text-center apple-fade-in">
            <p className="text-[13px] font-medium text-[#0071E3] dark:text-[#2997FF] mb-2 tracking-wide uppercase">
              Service Booking
            </p>
            <h1 className="text-[28px] sm:text-[34px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight mb-1">
              Book Vehicle Service
            </h1>
            <p className="text-[15px] text-[#86868b] max-w-md mx-auto">
              {selectedVehicle
                ? `${selectedVehicle.brandName} ${selectedVehicle.modelName} · ${selectedVehicle.registrationNo}`
                : 'Select vehicle, services, workshop, and time.'}
            </p>

            {/* Apple-style step indicator */}
            <div className="flex items-center justify-center gap-0 mt-8 max-w-xs mx-auto">
              {STEPS.map((s, idx) => {
                const isCurrent = step === s.num;
                const isDone = step > s.num;
                return (
                  <React.Fragment key={s.num}>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/30'
                            : isDone
                            ? 'bg-[#34C759] text-white'
                            : 'bg-black/[0.06] dark:bg-white/[0.1] text-[#86868b]'
                        }`}
                      >
                        {isDone ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : s.num}
                      </div>
                      <span className={`text-[11px] font-medium hidden sm:block transition-colors duration-200 ${
                        isCurrent ? 'text-[#0071E3] dark:text-[#2997FF]' : isDone ? 'text-[#34C759]' : 'text-[#86868b]'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={`flex-1 h-px mx-2 mb-5 transition-all duration-300 ${isDone ? 'bg-[#34C759]' : 'bg-black/[0.1] dark:bg-white/[0.1]'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Error banner ── */}
        {bookingError && (
          <div className="mb-6 px-4 py-3.5 rounded-2xl bg-[#FF3B30]/[0.08] border border-[#FF3B30]/20 text-[13px] text-[#FF3B30] font-medium flex items-center justify-between apple-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
            <button onClick={() => setBookingError('')} className="opacity-60 hover:opacity-100 transition-opacity font-bold ml-3">✕</button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 1 — SERVICES (Apple Store Configurator)
            ══════════════════════════════════════════════ */}
        {step === 1 && (
          <div className="apple-fade-in">
            {/* Vehicle selector pill */}
            {vehicles.length > 1 && (
              <div className="mb-6 px-4 py-3 rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#0071E3]/10 flex items-center justify-center">
                    <Car className="w-4 h-4 text-[#0071E3]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Your Vehicle</p>
                    <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {selectedVehicle?.brandName} {selectedVehicle?.modelName}
                      <span className="ml-2 font-normal text-[#86868b] text-[12px]">{selectedVehicle?.registrationNo}</span>
                    </p>
                  </div>
                </div>
                <select
                  value={selectedVehicle?.id}
                  onChange={(e) => {
                    const found = vehicles.find((v) => v.id === e.target.value);
                    if (found) setSelectedVehicle(found);
                  }}
                  className="text-[13px] font-medium bg-black/[0.04] dark:bg-white/[0.06] border border-black/[0.08] dark:border-white/[0.1] rounded-xl px-3 py-1.5 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.brandName} {v.modelName} ({v.registrationNo})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Section header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Choose Services</h2>
                <p className="text-[13px] text-[#86868b] mt-0.5">Select all services you need for this appointment.</p>
              </div>
              {selectedServiceIds.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] text-[13px] font-semibold">
                  {selectedServiceIds.length} selected
                </span>
              )}
            </div>

            {/* Services grid — Apple product option cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
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
                    className={`group relative p-5 rounded-2xl text-left flex items-start justify-between gap-4 transition-all duration-200 cursor-pointer apple-btn ${
                      isSelected
                        ? 'bg-white dark:bg-[#161617] border-2 border-[#0071E3] shadow-md shadow-[#0071E3]/10'
                        : 'bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] hover:border-[#0071E3]/40 hover:shadow-sm shadow-sm'
                    }`}
                  >
                    {isRecommended && (
                      <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-full bg-[#FF9500] text-white text-[10px] font-semibold">
                        Recommended
                      </div>
                    )}

                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-[22px] shrink-0 transition-all ${
                        isSelected ? 'bg-[#0071E3]/10' : 'bg-[#F5F5F7] dark:bg-[#1C1C1E]'
                      }`}>
                        {service.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                          {service.name}
                        </h4>
                        <p className="text-[12px] text-[#86868b] mt-1 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                        <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mt-2">
                          ₹{service.basePrice.toLocaleString()}
                          <span className="text-[11px] font-normal text-[#86868b] ml-1">est. base</span>
                        </p>
                      </div>
                    </div>

                    {/* Apple-style check circle */}
                    <div className={`w-5 h-5 rounded-full shrink-0 mt-0.5 border-2 flex items-center justify-center transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#0071E3] border-[#0071E3]'
                        : 'border-[#86868b]/40 dark:border-white/20 bg-transparent'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Symptoms notes card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] mb-6 shadow-sm">
              <h3 className="text-[14px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">
                Describe Any Symptoms
                <span className="text-[#86868b] font-normal ml-1 text-[13px]">(optional)</span>
              </h3>
              <p className="text-[12px] text-[#86868b] mb-3">Quick-tap common symptoms or type your own:</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleChipClick(chip)}
                    className="px-3 py-1.5 rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1d1d1f] dark:text-[#f5f5f7] border border-black/[0.06] dark:border-white/[0.1] text-[12px] font-medium hover:bg-[#0071E3]/10 hover:border-[#0071E3]/30 hover:text-[#0071E3] transition-all duration-150 apple-btn"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              <textarea
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                placeholder="e.g. Unusual squeak when braking at high speeds..."
                maxLength={500}
                rows={3}
                className="w-full bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.1] rounded-xl p-3 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/30 resize-none"
              />
              <p className="text-right text-[11px] text-[#86868b] mt-1.5">{specialNotes.length} / 500</p>
            </div>

            {/* Floating summary tray — Apple Store configurator style */}
            <div className="sticky bottom-20 md:bottom-6 z-30">
              <div className="px-5 py-4 rounded-2xl bg-white/90 dark:bg-[#1c1c1e]/90 backdrop-blur-xl border border-black/[0.08] dark:border-white/[0.12] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">Estimated Total</p>
                  <p className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                    ₹{costMin.toLocaleString()} – ₹{costMax.toLocaleString()}
                  </p>
                  {selectedServiceIds.length > 0 && (
                    <p className="text-[12px] text-[#86868b] mt-0.5">
                      {selectedServiceIds.length} service{selectedServiceIds.length > 1 ? 's' : ''} · pay at workshop
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={selectedServiceIds.length === 0}
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] active:bg-[#0062C4] text-white font-semibold text-[15px] disabled:opacity-40 flex items-center justify-center gap-2 transition-all duration-200 apple-btn shadow-lg shadow-[#0071E3]/25"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 2 — WORKSHOP (Genius Bar / Store Locator)
            ══════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="apple-fade-in">
            <div className="mb-6">
              <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Choose a Workshop</h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">Compare certified workshops by rating, proximity, and type.</p>
            </div>

            {/* Apple segmented control — 3 tabs */}
            <div className="flex gap-0.5 p-1 rounded-xl bg-black/[0.06] dark:bg-white/[0.08] mb-6 w-fit">
              {[
                { key: 'AUTHORIZED' as CenterType, label: `${selectedVehicle?.brandName || 'Brand'} Authorized` },
                { key: 'MULTI_BRAND' as CenterType, label: 'Multi-Brand' },
                { key: 'LOCAL' as CenterType, label: 'Local Garages' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCenterTab(tab.key)}
                  className={`px-4 py-2 rounded-[10px] text-[13px] font-medium transition-all duration-200 whitespace-nowrap apple-btn ${
                    centerTab === tab.key
                      ? 'bg-white dark:bg-[#3A3A3C] shadow-sm text-[#1d1d1f] dark:text-[#f5f5f7]'
                      : 'text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {centers.length === 0 ? (
              <div className="text-center py-16 rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1]">
                <MapPin className="w-10 h-10 text-[#86868b] mx-auto mb-3" />
                <h4 className="font-semibold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-1">No Centers Available</h4>
                <p className="text-[13px] text-[#86868b] mb-5">Try Multi-Brand for more options.</p>
                <button
                  onClick={() => setCenterTab('MULTI_BRAND')}
                  className="px-5 py-2.5 rounded-full bg-[#0071E3] text-white text-[13px] font-semibold apple-btn"
                >
                  Show Multi-Brand
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {centers.map((center) => {
                  const isSelected = selectedCenter?.id === center.id;
                  return (
                    <div
                      key={center.id}
                      className={`p-5 rounded-2xl transition-all duration-200 shadow-sm ${
                        isSelected
                          ? 'bg-white dark:bg-[#161617] border-2 border-[#0071E3] shadow-md shadow-[#0071E3]/10'
                          : 'bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] hover:border-[#0071E3]/40'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <h4 className="font-semibold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7]">{center.name}</h4>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868b]">
                              {center.type}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#86868b] flex items-center gap-1.5 mb-2.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {center.address}
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1 text-[12px] font-semibold text-[#FF9500]">
                              <Star className="w-3 h-3 fill-[#FF9500] text-[#FF9500]" />
                              {center.rating}
                              <span className="text-[#86868b] font-normal">({center.reviewCount})</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[#86868b]/40" />
                            <span className="text-[12px] text-[#86868b]">{center.distanceKm || 3.2} km</span>
                            <span className="w-1 h-1 rounded-full bg-[#86868b]/40" />
                            <span className="text-[12px] font-medium text-[#34C759]">Slots available</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-2">
                          <button
                            type="button"
                            onClick={() => setCenterDetailsModal(center)}
                            className="px-3.5 py-2 rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#1d1d1f] dark:text-[#f5f5f7] text-[12px] font-medium hover:bg-black/[0.08] dark:hover:bg-white/[0.1] transition-colors apple-btn"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedCenter(center)}
                            className={`px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 apple-btn ${
                              isSelected
                                ? 'bg-[#0071E3] text-white shadow-md shadow-[#0071E3]/25'
                                : 'bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] hover:bg-[#0071E3]/20'
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

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px] font-medium hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-all apple-btn"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={!selectedCenter}
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold disabled:opacity-40 transition-all apple-btn shadow-lg shadow-[#0071E3]/20"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 3 — SCHEDULE (iOS Calendar / Genius Bar slots)
            ══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="apple-fade-in">
            <div className="mb-6">
              <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Pick Date & Time</h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">Choose your preferred appointment date and drop-off window.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Calendar */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h4>
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => { const m = new Date(currentMonth); m.setMonth(m.getMonth() - 1); setCurrentMonth(m); }}
                      className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors apple-btn"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => { const m = new Date(currentMonth); m.setMonth(m.getMonth() + 1); setCurrentMonth(m); }}
                      className="p-1.5 rounded-full hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] transition-colors apple-btn"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#86868b] mb-2 gap-0">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <span key={d}>{d}</span>)}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: offset }).map((_, i) => <div key={`e${i}`} />)}
                  {days.map((item) => {
                    const isSel = selectedDate === item.dateStr;
                    const isToday = item.dateStr === new Date().toISOString().split('T')[0];
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        disabled={item.isPast}
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`h-9 w-full rounded-full text-[13px] font-medium flex items-center justify-center transition-all duration-150 apple-btn ${
                          item.isPast
                            ? 'text-[#86868b]/40 cursor-not-allowed'
                            : isSel
                            ? 'bg-[#0071E3] text-white font-semibold shadow-md shadow-[#0071E3]/25'
                            : isToday
                            ? 'border-2 border-[#0071E3] text-[#0071E3] dark:text-[#2997FF]'
                            : 'text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.05] dark:hover:bg-white/[0.08]'
                        }`}
                      >
                        {item.dayNum}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div className="p-5 rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {selectedDate ? `Slots for ${selectedDate}` : 'Select a date'}
                  </h4>
                  {loadingSlots && (
                    <span className="text-[12px] text-[#0071E3] dark:text-[#2997FF] font-medium">Loading…</span>
                  )}
                </div>

                {slots.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center py-8 text-center">
                    <div>
                      <Clock className="w-8 h-8 text-[#86868b] mx-auto mb-2" />
                      <p className="text-[13px] text-[#86868b]">
                        {loadingSlots ? 'Loading time slots…' : 'Pick a date to see available slots.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5 flex-1">
                    {slots.map((slot) => {
                      const isSel = selectedSlot?.id === slot.id;
                      const isFull = slot.isBlocked || slot.booked >= slot.capacity;
                      const onlyOne = slot.capacity - slot.booked === 1;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-3.5 rounded-2xl border text-left transition-all duration-150 apple-btn ${
                            isFull
                              ? 'bg-[#F5F5F7] dark:bg-[#1C1C1E] border-black/[0.05] dark:border-white/[0.06] text-[#86868b]/60 cursor-not-allowed'
                              : isSel
                              ? 'bg-[#0071E3] border-[#0071E3] shadow-md shadow-[#0071E3]/20'
                              : 'bg-[#F5F5F7] dark:bg-[#1C1C1E] border-black/[0.06] dark:border-white/[0.08] hover:border-[#0071E3]/40'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold text-[13px] ${isSel ? 'text-white' : 'text-[#1d1d1f] dark:text-[#f5f5f7]'}`}>
                              {slot.startTime}
                            </span>
                            <Clock className={`w-3.5 h-3.5 ${isSel ? 'text-white/70' : 'text-[#86868b]'}`} />
                          </div>
                          {isFull ? (
                            <span className="text-[11px] font-medium text-[#FF3B30]">Full</span>
                          ) : onlyOne ? (
                            <span className={`text-[11px] font-medium ${isSel ? 'text-white/80' : 'text-[#FF9500]'}`}>1 slot left</span>
                          ) : (
                            <span className={`text-[11px] font-medium ${isSel ? 'text-white/80' : 'text-[#34C759]'}`}>Available</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 rounded-xl bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.06]">
                  <Info className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF] shrink-0 mt-0.5" />
                  <p className="text-[11px] text-[#0071E3] dark:text-[#2997FF]">Slots are real-time locked to prevent double-booking.</p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button type="button" onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px] font-medium hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-all apple-btn">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button type="button" disabled={!selectedSlot} onClick={() => setStep(4)} className="flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold disabled:opacity-40 transition-all apple-btn shadow-lg shadow-[#0071E3]/20">
                Review <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 4 — CONFIRM (Apple order receipt)
            ══════════════════════════════════════════════ */}
        {step === 4 && (
          <div className="apple-fade-in max-w-xl mx-auto">
            <div className="mb-6">
              <h2 className="text-[20px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">Review & Confirm</h2>
              <p className="text-[13px] text-[#86868b] mt-0.5">Check everything before locking your appointment.</p>
            </div>

            {/* Receipt card */}
            <div className="rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] overflow-hidden shadow-md mb-6">
              {/* Vehicle + center header */}
              <div className="px-5 py-4 border-b border-black/[0.06] dark:border-white/[0.08]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center">
                    <Car className="w-5 h-5 text-[#0071E3]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {selectedVehicle?.brandName} {selectedVehicle?.modelName}
                    </h4>
                    <p className="text-[12px] text-[#86868b]">
                      {selectedVehicle?.registrationNo} · {selectedVehicle?.currentKm.toLocaleString()} km
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[#86868b]">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">{selectedCenter?.name}</span>
                  · {selectedCenter?.address}
                </div>
              </div>

              {/* Schedule + cost */}
              <div className="grid grid-cols-3 divide-x divide-black/[0.06] dark:divide-white/[0.08]">
                {[
                  { label: 'Date', value: selectedDate, sub: selectedSlot?.startTime },
                  { label: 'Estimate', value: `₹${costMin.toLocaleString()} – ₹${costMax.toLocaleString()}`, sub: 'Pay at workshop' },
                  { label: 'Center', value: selectedCenter?.type || '', sub: `⭐ ${selectedCenter?.rating}` },
                ].map((item) => (
                  <div key={item.label} className="px-4 py-4">
                    <p className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-[13px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{item.value}</p>
                    {item.sub && <p className="text-[11px] text-[#86868b] mt-0.5">{item.sub}</p>}
                  </div>
                ))}
              </div>

              {/* Services list */}
              <div className="px-5 py-4 border-t border-black/[0.06] dark:border-white/[0.08]">
                <p className="text-[12px] font-semibold text-[#86868b] uppercase tracking-wider mb-3">Selected Services</p>
                <ul className="space-y-2">
                  {selectedServices.map((s) => (
                    <li key={s.id} className="flex items-center justify-between text-[13px]">
                      <span className="flex items-center gap-2 text-[#1d1d1f] dark:text-[#f5f5f7]">
                        <Check className="w-3.5 h-3.5 text-[#34C759] shrink-0 stroke-[2.5]" />
                        {s.name}
                      </span>
                      <span className="text-[#86868b] font-medium">~₹{s.basePrice.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {specialNotes && (
                <div className="px-5 py-3.5 border-t border-black/[0.06] dark:border-white/[0.08] bg-[#F5F5F7] dark:bg-[#0A0A0A]">
                  <p className="text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    <span className="font-semibold">Notes:</span>{' '}
                    <span className="text-[#86868b] italic">"{specialNotes}"</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <button type="button" onClick={() => setStep(3)} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-[#1d1d1f] dark:text-[#f5f5f7] text-[13px] font-medium hover:bg-black/[0.09] dark:hover:bg-white/[0.12] transition-all apple-btn">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmBooking}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-semibold disabled:opacity-50 transition-all apple-btn shadow-xl shadow-[#0071E3]/25"
              >
                {isSubmitting ? 'Locking Slot…' : 'Confirm Booking'}
                <Check className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            STEP 5 — SUCCESS (Apple confirmation receipt)
            ══════════════════════════════════════════════ */}
        {step === 5 && bookingResult && (
          <div className="apple-scale-in max-w-md mx-auto text-center pt-4">
            {/* Checkmark */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#34C759]/15 flex items-center justify-center mx-auto mb-5">
              <div className="w-14 h-14 rounded-full bg-[#34C759] flex items-center justify-center shadow-xl shadow-[#34C759]/30">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
            </div>

            <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">
              Booking Confirmed
            </h2>
            <p className="text-[14px] text-[#86868b] max-w-xs mx-auto mb-8 leading-relaxed">
              Your appointment for{' '}
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{bookingResult.vehicleName}</span>
              {' '}is scheduled for{' '}
              <span className="font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">{bookingResult.serviceDate} at {bookingResult.serviceTime}</span>.
            </p>

            {/* Booking code card */}
            <div className="mx-auto w-fit mb-8 px-8 py-5 rounded-2xl bg-white dark:bg-[#161617] border border-black/[0.07] dark:border-white/[0.1] shadow-lg">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#86868b] mb-1">Booking Reference</p>
              <p className="font-mono text-[22px] font-bold text-[#0071E3] dark:text-[#2997FF] tracking-wider">
                {bookingResult.bookingCode}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleDownloadIcs}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.08] dark:border-white/[0.12] text-[13px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/[0.06] dark:hover:bg-white/[0.1] transition-all apple-btn"
              >
                <Download className="w-4 h-4 text-[#0071E3]" />
                Add to Calendar
              </button>
              <a
                href="/bookings"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold transition-all apple-btn shadow-lg shadow-[#0071E3]/25"
              >
                View Bookings
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </main>

      {/* ── Center Details Modal ── */}
      {centerDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={() => setCenterDetailsModal(null)}>
          <div
            className="w-full sm:max-w-lg bg-white dark:bg-[#1c1c1e] sm:rounded-3xl rounded-t-3xl p-6 shadow-2xl apple-scale-in border border-black/[0.06] dark:border-white/[0.1]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7]">{centerDetailsModal.name}</h3>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF]">
                  {centerDetailsModal.type}
                </span>
              </div>
              <button
                onClick={() => setCenterDetailsModal(null)}
                className="p-2 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-[#f5f5f7] apple-btn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[13px]">
              <div className="flex items-start gap-2.5 text-[#86868b]">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-[#0071E3]" />
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">{centerDetailsModal.address}, {centerDetailsModal.city}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#86868b]">
                <Phone className="w-4 h-4 shrink-0 text-[#34C759]" />
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">{centerDetailsModal.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#86868b]">
                <Clock className="w-4 h-4 shrink-0 text-[#FF9500]" />
                <span className="text-[#1d1d1f] dark:text-[#f5f5f7]">{centerDetailsModal.openingHours}</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-2 mt-1">Services Offered</p>
                <div className="flex flex-wrap gap-1.5">
                  {centerDetailsModal.servicesOffered.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-full bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[11px] font-medium text-[#1d1d1f] dark:text-[#f5f5f7]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {centerDetailsModal.websiteUrl && (
                <a href={centerDetailsModal.websiteUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[#0071E3] dark:text-[#2997FF] font-medium hover:opacity-80 transition-opacity">
                  <Globe className="w-3.5 h-3.5" /> Visit Website
                </a>
              )}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => { setSelectedCenter(centerDetailsModal); setCenterDetailsModal(null); }}
                className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-semibold transition-all apple-btn shadow-lg shadow-[#0071E3]/25"
              >
                Select This Workshop
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

/* ── need X icon locally ── */
function X({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function BookServicePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#F5F5F7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d1d1f' }}>
        Loading…
      </div>
    }>
      <BookServicePageInner />
    </Suspense>
  );
}
