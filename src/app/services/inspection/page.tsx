'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import {
  Activity,
  AlertCircle,
  Award,
  BatteryCharging,
  Calendar,
  Camera,
  Car,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileCheck2,
  Gauge,
  HelpCircle,
  MapPin,
  Radio,
  Scan,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Thermometer,
  UserCheck,
  Volume2,
  Waves,
  Wrench,
  Zap
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import { getClientSession } from '@/lib/auth';
import { playCelebrationFanfare } from '@/lib/celebrationAudio';
import { ServiceCenter, Vehicle } from '@/lib/types';

// Modern Inspection Technologies
const MODERN_TECH = [
  {
    icon: Cpu,
    title: 'OBD-II High-Speed Telemetry Scanner',
    color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    description:
      'Direct CAN-bus connection reading 400+ ECU parameters in real-time. Detects pending DTC codes, injector balancing, transmission shifts, and catalytic performance.',
    badge: 'Real-Time ECU Telemetry',
  },
  {
    icon: Thermometer,
    title: 'FLIR Thermal Infrared Radiometer',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    description:
      'High-resolution thermal camera pinpointing brake disc thermal gradients, radiator flow blockages, battery cell hot spots, and AC evaporator temperature drops.',
    badge: 'Thermal Gradient Imaging',
  },
  {
    icon: Scan,
    title: 'Ultrasonic Paint & Micro-Structure Gauge',
    color: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    description:
      'Precision micrometer acoustic gauge measuring paint coating thickness down to 1μm. Instantly spots accidental body filler, rust spots, and re-welded chassis pillars.',
    badge: 'Sub-Micron Chassis Scan',
  },
  {
    icon: Activity,
    title: '3D Laser Tyre Tread & Camber Profiler',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    description:
      'Laser triangulation sensors capture tyre grooves and toe/camber angle alignment. Predicts hydroplaning risk and uneven suspension bushing wear.',
    badge: 'Laser Tread Topography',
  },
  {
    icon: Waves,
    title: 'Acoustic Harmonic Engine Stethoscope',
    color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    description:
      'Digital acoustic wave collector filtering engine block frequencies to isolate timing chain stretch, valve clearance ticking, and alternator bearing friction.',
    badge: 'Harmonic Acoustic Analysis',
  },
  {
    icon: BatteryCharging,
    title: 'High-Voltage EV Battery Cell Analyzer',
    color: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    description:
      'Specialized diagnostic module measuring State-of-Health (SoH), internal cell resistance, DC fast-charge degradation, and insulation safety impedance.',
    badge: 'EV BMS Health Diagnostics',
  },
];

// Transparent Price Packages
const INSPECTION_PACKAGES = [
  {
    id: 'pkg-essential',
    name: 'Essential OBD-II Scan',
    price: 799,
    duration: '30 mins',
    popular: false,
    summary: 'Fast electronic health check & warning light clearing.',
    features: [
      'Full CAN-Bus OBD-II Electronic Scan',
      'Engine, ABS & Airbag DTC Fault Clear',
      '12V Battery Health & Alternator Voltage Check',
      'Digital Summary Report via WhatsApp & Email',
    ],
  },
  {
    id: 'pkg-master',
    name: '120-Point Master Health Inspection',
    price: 1499,
    duration: '60 mins',
    popular: true,
    summary: 'Most requested comprehensive bumper-to-bumper scan before long trips.',
    features: [
      'Everything in Essential Scan',
      'FLIR Thermal Infrared Brake & Cooling Scan',
      'Acoustic Engine Harmonic Noise Diagnosis',
      'Laser Tyre Tread & Suspension Wear Check',
      'Brake Fluid Moisture & Coolant pH Testing',
      'Official AutoPing Health Score Certificate',
    ],
  },
  {
    id: 'pkg-pre-purchase',
    name: 'Pre-Purchase Buyer Certification',
    price: 2499,
    duration: '90 mins',
    popular: false,
    summary: 'Comprehensive second-hand car evaluation before you buy.',
    features: [
      'Everything in 120-Point Master Inspection',
      'Ultrasonic Paint Gauge (Accident & Putty Detection)',
      'Odometer Tampering & Chassis Weld Inspection',
      '15-Minute Dynamic Road-Test Telemetry Recording',
      'Estimated Market Value & Upcoming Repair Cost Sheet',
    ],
  },
  {
    id: 'pkg-ev',
    name: 'EV High-Voltage & Battery Health Scan',
    price: 1999,
    duration: '45 mins',
    popular: false,
    summary: 'Specialized diagnostic scan for Electric and Hybrid vehicles.',
    features: [
      'BMS State-of-Health (SoH) & Range Degradation',
      'High-Voltage Inverter & Charging Port Diagnostics',
      'Cell Voltage Balance & Thermal Runaway Check',
      'Regenerative Braking Calibration Analysis',
    ],
  },
];

// Available Time Slots
const TIME_SLOTS = [
  '09:00 AM - 10:00 AM',
  '10:30 AM - 11:30 AM',
  '12:00 PM - 01:00 PM',
  '02:30 PM - 03:30 PM',
  '04:00 PM - 05:00 PM',
  '05:30 PM - 06:30 PM',
];

export default function VehicleInspectionPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [selectedPackage, setSelectedPackage] = useState(INSPECTION_PACKAGES[1]);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [inspectionMode, setInspectionMode] = useState<'DOORSTEP' | 'WORKSHOP'>('DOORSTEP');
  const [doorstepAddress, setDoorstepAddress] = useState('Flat 402, Rohan Viti, Baner, Pune');
  const [selectedCenterId, setSelectedCenterId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);
  const [specialNotes, setSpecialNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  useEffect(() => {
    const session = getClientSession();
    fetch(`/api/vehicles?userId=${session?.id || 'user-customer-1'}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setVehicles(res.data);
          setSelectedVehicleId(res.data[0].id);
        }
      });

    fetch('/api/centers')
      .then((r) => r.json())
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCenters(res.data);
          setSelectedCenterId(res.data[0].id);
        }
      });
  }, []);

  const handleBookInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicleId) {
      alert('Please select or add a vehicle first.');
      return;
    }

    const session = getClientSession();
    const userId = session?.id || 'user-customer-1';
    const targetCenter = centers.find((c) => c.id === selectedCenterId) || centers[0];
    const centerId = targetCenter?.id || 'center-1';

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          vehicleId: selectedVehicleId,
          centerId,
          slotId: `inspect-slot-${Date.now()}`,
          serviceDate: selectedDate,
          serviceTime: selectedTime,
          services: [
            selectedPackage.name,
            `Inspection Mode: ${inspectionMode === 'DOORSTEP' ? `Doorstep (${doorstepAddress})` : 'Authorized Tech Bay'}`,
          ],
          notes: specialNotes || `Certified inspector assigned. Modern equipment: OBD-II, FLIR Thermal, Ultrasonic gauge.`,
          estimatedCostMin: selectedPackage.price,
          estimatedCostMax: selectedPackage.price,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (data.data) {
        setIsConfirmed(true);
        setConfirmedBookingId(data.data.id);
        playCelebrationFanfare();
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
        });
      } else {
        alert(data.error || 'Booking failed');
      }
    } catch {
      setIsSubmitting(false);
      alert('Network error while scheduling appointment');
    }
  };

  const selectedVehicleObj = vehicles.find((v) => v.id === selectedVehicleId);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-3">
            <Scan className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Next-Gen Vehicle Health Telemetry
          </div>
          <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight text-slate-950 dark:text-white">
            Vehicle Inspection &amp; Electronic Scanning
          </h1>
          <p className="text-base text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            Book an appointment with a certified inspection specialist. We deploy military-grade OBD-II CAN scanners,
            FLIR thermal imaging, ultrasonic frame gauges, and laser alignment profilers directly to your doorstep.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 mt-6 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Certified Master Inspectors
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Doorstep or Workshop Bay
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Tamper-Proof Digital Certificate
            </span>
          </div>
        </div>

        {/* SECTION 1: MODERN TECH USED */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Modern Technology Deployed
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Our technicians do not guess — our certified gear diagnoses microscopic internal anomalies before failures occur.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODERN_TECH.map((tech, idx) => {
              const Icon = tech.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/70 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${tech.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {tech.badge}
                      </span>
                    </div>

                    <h3 className="font-semibold text-base text-slate-950 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {tech.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tech.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" /> ISO 14229 Calibrated Hardware
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: SPECIALIST PROFILE CARD */}
        <div className="mb-16 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80"
                  alt="Inspector Rajesh Sharma"
                  className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </span>
              </div>

              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="font-bold text-lg text-white">Rajesh Sharma</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                    Master Diagnostic Tech
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-md">
                  ASE-Certified Master Technician with 14+ years in powertrain diagnostics. Conducted over 4,800
                  electronic scans with a 99.8% precision rating.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-[11px] text-slate-300 font-mono">
                  <span>⭐ 4.97 (620 reviews)</span>
                  <span>•</span>
                  <span>📍 Baner, Pune Tech Hub</span>
                </div>
              </div>
            </div>

            <div className="shrink-0 text-center sm:text-right">
              <div className="text-xs text-slate-300 mb-1">Your Mobile Lab Equipment</div>
              <div className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 justify-center sm:justify-end">
                <Radio className="w-4 h-4 animate-pulse" /> Fully Calibrated Mobile Van
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: PRICING RATE CARDS */}
        <div className="mb-16">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
              Transparent Inspection Rates
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Fixed rate pricing with zero hidden charges. Digital invoice and report certificate delivered instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {INSPECTION_PACKAGES.map((pkg) => {
              const isSelected = selectedPackage.id === pkg.id;

              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`p-6 rounded-3xl backdrop-blur-xl border transition-all cursor-pointer flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 scale-[1.02]'
                      : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/70 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
                >
                  {pkg.popular && (
                    <span
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider ${
                        isSelected
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'bg-blue-600 text-white shadow-sm'
                      }`}
                    >
                      Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-bold text-base ${isSelected ? 'text-white' : 'text-slate-950 dark:text-white'}`}>
                        {pkg.name}
                      </h3>
                    </div>

                    <div className="flex items-baseline gap-1 my-3">
                      <span className="text-3xl font-extrabold font-mono">₹{pkg.price.toLocaleString()}</span>
                      <span className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                        / {pkg.duration}
                      </span>
                    </div>

                    <p className={`text-xs mb-4 leading-relaxed ${isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                      {pkg.summary}
                    </p>

                    <div className="space-y-2 pt-3 border-t border-current/10">
                      {pkg.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isSelected ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                          <span className={isSelected ? 'text-blue-50' : 'text-slate-700 dark:text-slate-300'}>
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-4">
                    <button
                      type="button"
                      className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-white text-blue-600 hover:bg-blue-50'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isSelected ? '✓ Selected Tier' : 'Select Tier'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: INTERACTIVE APPOINTMENT SCHEDULER */}
        <div id="booking-section" className="scroll-mt-10">
          <div className="p-7 sm:p-10 rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-4xl mx-auto">
            {isConfirmed ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                  Inspection Appointment Confirmed!
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
                  Our certified diagnostic specialist will arrive with calibrated OBD-II &amp; thermal telemetry gear
                  for your {selectedVehicleObj?.brandName} {selectedVehicleObj?.modelName}.
                </p>

                <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 max-w-sm mx-auto text-left text-xs space-y-2 border border-slate-200/60 dark:border-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Booking ID:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{confirmedBookingId || 'AP-INSPECT-9182'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Package:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPackage.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date &amp; Time:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedDate} • {selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Tech:</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">Rajesh Sharma (Master)</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 font-bold text-sm">
                    <span>Total Fee:</span>
                    <span className="text-emerald-600 dark:text-emerald-400">₹{selectedPackage.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => router.push('/bookings')}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                  >
                    View in My Bookings
                  </button>
                  <button
                    onClick={() => setIsConfirmed(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  >
                    Schedule Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBookInspection} className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Schedule Your Inspection Appointment
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Selected Plan:{' '}
                    <span className="font-semibold text-blue-600 dark:text-blue-400">
                      {selectedPackage.name} (₹{selectedPackage.price})
                    </span>
                  </p>
                </div>

                {/* Step 1: Vehicle Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Vehicle to Inspect
                  </label>
                  {vehicles.length === 0 ? (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between border border-amber-200 dark:border-amber-800">
                      <span>No vehicles registered in your garage yet.</span>
                      <a href="/vehicles" className="font-bold underline">Add Vehicle First</a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {vehicles.map((v) => (
                        <div
                          key={v.id}
                          onClick={() => setSelectedVehicleId(v.id)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                            selectedVehicleId === v.id
                              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shrink-0">
                            <Car className="w-5 h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                              {v.brandName} {v.modelName}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                              {v.registrationNo} • {v.currentKm.toLocaleString()} KM
                            </div>
                          </div>
                          {selectedVehicleId === v.id && (
                            <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Step 2: Inspection Mode (Doorstep vs Workshop Bay) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Inspection Location Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setInspectionMode('DOORSTEP')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        inspectionMode === 'DOORSTEP'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Doorstep Inspection
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Specialist arrives at your home / office parking with mobile telemetry kit.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setInspectionMode('WORKSHOP')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        inspectionMode === 'WORKSHOP'
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="font-semibold text-xs text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                        <Wrench className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        Certified Workshop Bay
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Drive down to nearest partner diagnostic bay with hydraulic undercarriage ramp.
                      </p>
                    </button>
                  </div>

                  {inspectionMode === 'DOORSTEP' ? (
                    <div className="mt-3">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Doorstep Address / Landmark
                      </label>
                      <input
                        type="text"
                        value={doorstepAddress}
                        onChange={(e) => setDoorstepAddress(e.target.value)}
                        placeholder="House / Office address where vehicle is parked"
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                        required
                      />
                    </div>
                  ) : (
                    <div className="mt-3">
                      <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                        Select Diagnostic Center Bay
                      </label>
                      <select
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                      >
                        {centers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({c.city} - {c.address})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Step 3: Date & Time Schedule Calendar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Appointment Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Preferred Time Slot
                    </label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step 4: Special Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Specific Symptoms or Warning Lights (Optional)
                  </label>
                  <input
                    type="text"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Check Engine light glowing on cold starts, vibration above 80 km/h"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                {/* Step 5: Cost Summary & Submit */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Inspection Fee (All Inclusive)</span>
                    <span className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{selectedPackage.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-slate-400 ml-2">No advance deposit needed</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || vehicles.length === 0}
                    className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      'Booking Appointment...'
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4" />
                        Confirm Inspection Specialist
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
