'use client';

import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  Compass,
  Gauge,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
  Zap,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import FloatingReviewsHero from '@/components/FloatingReviewsHero';
import { ServiceCenter } from '@/lib/types';

export default function HomePage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);

  useEffect(() => {
    fetch('/api/centers')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setCenters(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-pulse-subtle" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/20 shadow-xs hover:border-[#0071E3]/40 transition-colors">
                  <Sparkles className="w-3.5 h-3.5 text-[#0071E3] animate-spin-slow" />
                  <span className="text-[12px] font-semibold text-[#0071E3] dark:text-[#2997FF]">
                    Next-Gen Intelligent Vehicle Telemetry
                  </span>
                </div>

                <h1 className="text-[40px] sm:text-[52px] lg:text-[58px] font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.06]">
                  Never miss a scheduled service.
                </h1>

                <p className="text-[17px] text-[#86868b] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  AutoPing tracks your odometer, predicts impending maintenance intervals, explains why service is needed, and secures guaranteed slots at verified workshops across India.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <a
                    href="/dashboard"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0071E3]/30 apple-btn hover:shadow-xl hover:shadow-[#0071E3]/40"
                  >
                    Open Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="/map"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-[15px] border border-black/[0.08] dark:border-white/[0.12] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm apple-btn"
                  >
                    <MapPin className="w-4 h-4 text-blue-500" />
                    Locate Service Centers
                  </a>
                </div>

                {/* Trust badges */}
                <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[13px] text-[#86868b]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34C759]" />
                    <span>Authorized OEM &amp; Multi-Brand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34C759]" />
                    <span>Guaranteed Slot Locking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34C759]" />
                    <span>Zero Double-Booking Risk</span>
                  </div>
                </div>
              </div>

              {/* Right Mock Card */}
              <div className="lg:col-span-5">
                <div className="bg-white/80 dark:bg-[#161617]/90 backdrop-blur-2xl p-6 rounded-3xl border border-black/[0.07] dark:border-white/[0.1] shadow-2xl hover:border-blue-500/30 transition-all duration-300">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#0071E3] to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7]">Hyundai Creta SX</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868b]">
                            2024
                          </span>
                        </div>
                        <p className="text-[12px] text-[#86868b] font-mono">MH 12 AB 1234 · 18,500 km</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/25 text-[11px] font-bold">
                      Due in 12 Days
                    </span>
                  </div>

                  {/* Health Score & Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.03] dark:border-white/[0.05]">
                      <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block mb-1">
                        Vehicle Health
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[22px] font-black text-[#34C759]">92%</span>
                        <span className="text-[12px] font-semibold text-[#86868b]">Optimal</span>
                      </div>
                      <div className="w-full bg-black/[0.06] dark:bg-white/[0.1] h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#34C759] h-full rounded-full w-[92%]" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E] border border-black/[0.03] dark:border-white/[0.05]">
                      <span className="text-[10px] font-bold text-[#86868b] uppercase tracking-wider block mb-1">
                        Service Target
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[22px] font-black text-[#1d1d1f] dark:text-[#f5f5f7]">1,500</span>
                        <span className="text-[12px] font-semibold text-[#86868b]">km left</span>
                      </div>
                      <p className="text-[10px] text-[#86868b] mt-1.5 font-medium">Milestone: 20,000 km</p>
                    </div>
                  </div>

                  {/* Maintenance Reminder */}
                  <div className="p-3.5 rounded-2xl bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.08] border border-[#0071E3]/15 mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#2997FF]" />
                      <h4 className="text-[12px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">Upcoming Periodic Service</h4>
                    </div>
                    <ul className="text-[12px] text-[#86868b] space-y-1 pl-4 list-disc">
                      <li>20,000 km threshold approaching</li>
                      <li>Synthetic engine oil &amp; filter renewal</li>
                      <li>Brake calipers &amp; fluid inspection</li>
                    </ul>
                    <div className="mt-2.5 pt-2 border-t border-[#0071E3]/15 flex items-center justify-between text-[12px]">
                      <span className="text-[#86868b]">Est. Cost:</span>
                      <span className="font-bold text-[#0071E3] dark:text-[#2997FF]">₹3,500 – ₹4,800</span>
                    </div>
                  </div>

                  <a
                    href="/services/book"
                    className="w-full py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 apple-btn shadow-lg shadow-[#0071E3]/25"
                  >
                    Book Guaranteed Slot
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── LIVE FLOATING GLASSMORPHIC REVIEWS BUBBLES SECTION ─── */}
        <FloatingReviewsHero serviceCenters={centers} />

        {/* 3 CORE PILLARS SECTION */}
        <section className="py-20 bg-white dark:bg-[#111111] border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-[12px] font-bold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest">
                Comprehensive Vehicle Care
              </span>
              <h2 className="text-[28px] sm:text-[36px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mt-2">
                Why Motorists Rely on AutoPing
              </h2>
              <p className="text-[15px] text-[#86868b] mt-2">
                Engineered specifically for Indian road conditions, varied driving climates, and transparent maintenance schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-[#F5F5F7] dark:bg-[#161617] p-7 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] hover:border-blue-500/30 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center mb-5">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Predictive Telemetry Reminders</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-4">
                  Never miss an oil change, timing belt renewal, or brake fluid flush. AutoPing notifies you with clear explanations prior to critical wear thresholds.
                </p>
                <span className="text-[13px] font-semibold text-[#0071E3] dark:text-[#2997FF] flex items-center gap-1">
                  Explains what &amp; why &rarr;
                </span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#161617] p-7 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center mb-5">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Guaranteed Real-Time Slot Locking</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-4">
                  Compare Authorized OEM, Multi-brand specialists, and certified local garages. View live capacity with zero double-booking or bay delay.
                </p>
                <span className="text-[13px] font-semibold text-[#34C759] flex items-center gap-1">
                  Real-time slots &rarr;
                </span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#161617] p-7 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] hover:border-amber-500/30 transition-all hover:-translate-y-1">
                <div className="w-12 h-12 rounded-2xl bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center mb-5">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-[17px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Component Wear Tracking</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-4">
                  Granular health diagnostics for engine oil, brake pads, tyres, battery cold cranking, and AC condenser cooling efficiency.
                </p>
                <span className="text-[13px] font-semibold text-[#FF9500] flex items-center gap-1">
                  Detailed diagnostics &rarr;
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (4 STEPS) */}
        <section className="py-20 bg-[#F5F5F7] dark:bg-[#000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-[12px] font-bold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest">
                Seamless Workflow
              </span>
              <h2 className="text-[28px] sm:text-[34px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mt-2">
                How AutoPing Works
              </h2>
              <p className="text-[15px] text-[#86868b] mt-2">
                From vehicle registration to workshop check-in in 4 effortless steps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  step: '01',
                  title: 'Add Your Vehicle',
                  desc: 'Pick your Car, Bike, or Scooter with brand, model, purchase year, and current KM reading.',
                  color: '#0071E3',
                },
                {
                  step: '02',
                  title: 'Get Smart Reminders',
                  desc: 'AutoPing calculates your next service milestone and delivers cost estimates before maintenance is overdue.',
                  color: '#34C759',
                },
                {
                  step: '03',
                  title: 'Choose Service Center',
                  desc: 'Select Authorized OEM, Multi-Brand network, or Local neighborhood garage with distance and customer ratings.',
                  color: '#FF9500',
                },
                {
                  step: '04',
                  title: 'Lock Your Slot',
                  desc: 'Pick your preferred date and time, confirm in 1-tap, and sync directly into Google Calendar or Apple iCal.',
                  color: '#FF3B30',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#161617] p-7 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] shadow-xs hover:shadow-md transition-all hover:-translate-y-1"
                >
                  <div className="text-[32px] font-black mb-3 font-mono" style={{ color: item.color }}>
                    {item.step}
                  </div>
                  <h4 className="font-bold text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">{item.title}</h4>
                  <p className="text-[13px] text-[#86868b] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-14 pb-20 bg-[#F5F5F7] dark:bg-[#000]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-gradient-to-tr from-[#1d1d1f] via-[#242426] to-[#1d1d1f] dark:from-[#161617] dark:via-[#1c1c1f] dark:to-[#121214] text-white p-10 sm:p-14 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="max-w-2xl relative z-10">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold mb-4 text-blue-300">
                  <Zap className="w-3.5 h-3.5 text-blue-400" />
                  Instant Booking Ready
                </div>
                <h2 className="text-[28px] sm:text-[34px] font-bold tracking-tight mb-3">
                  Take the Hassle Out of Vehicle Maintenance
                </h2>
                <p className="text-[#86868b] text-[15px] mb-8 leading-relaxed">
                  Join vehicle owners in Pune, Mumbai, Bengaluru, and Delhi who never miss a service milestone or warranty deadline.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/dashboard"
                    className="px-8 py-3.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[15px] transition-all duration-200 apple-btn shadow-lg shadow-[#0071E3]/35"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href="/map"
                    className="px-6 py-3.5 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-[15px] border border-white/[0.12] transition-all duration-200 apple-btn flex items-center gap-2"
                  >
                    <Compass className="w-4 h-4 text-[#FF9500]" />
                    Explore Workshops Map
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
