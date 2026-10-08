'use client';

import React from 'react';
import {
  ArrowRight,
  Award,
  Bell,
  Calendar,
  Car,
  CheckCircle,
  ChevronRight,
  Clock,
  Gauge,
  HelpCircle,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000]">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="pt-16 pb-20 md:pt-24 md:pb-28 border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0071E3]/10 border border-[#0071E3]/20">
                  <Sparkles className="w-3 h-3 text-[#0071E3]" />
                  <span className="text-[12px] font-semibold text-[#0071E3] dark:text-[#2997FF]">
                    Intelligent Vehicle Maintenance
                  </span>
                </div>

                <h1 className="text-[40px] sm:text-[52px] lg:text-[56px] font-semibold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7] leading-[1.08]">
                  Never miss a scheduled service.
                </h1>

                <p className="text-[17px] text-[#86868b] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  AutoPing tracks your vehicle odometer, calculates impending maintenance intervals, explains why service is needed, and secures guaranteed slots at verified workshops.
                </p>

                <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                  <a
                    href="/dashboard"
                    className="w-full sm:w-auto px-7 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[15px] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#0071E3]/25 apple-btn"
                  >
                    Open Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="/services/book"
                    className="w-full sm:w-auto px-6 py-3 rounded-full bg-white dark:bg-[#1C1C1E] hover:bg-[#F5F5F7] dark:hover:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7] font-semibold text-[15px] border border-black/[0.08] dark:border-white/[0.12] transition-all duration-200 flex items-center justify-center gap-2 shadow-sm apple-btn"
                  >
                    <Wrench className="w-4 h-4 text-[#86868b]" />
                    Book Service
                  </a>
                </div>

                {/* Trust badges */}
                <div className="pt-6 border-t border-black/[0.06] dark:border-white/[0.06] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-[13px] text-[#86868b]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34C759]" />
                    <span>Authorized OEM &amp; Multi-brand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34C759]" />
                    <span>Real-time slot locking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34C759]" />
                    <span>Transparent cost estimates</span>
                  </div>
                </div>
              </div>

              {/* Right Mock Card */}
              <div className="lg:col-span-5">
                <div className="bg-white dark:bg-[#161617] p-6 rounded-3xl border border-black/[0.07] dark:border-white/[0.1] shadow-xl">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.08] pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-[#0071E3]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">Hyundai Creta</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#F5F5F7] dark:bg-[#1C1C1E] text-[#86868b]">
                            2024
                          </span>
                        </div>
                        <p className="text-[12px] text-[#86868b] font-mono">MH 12 AB 1234 · 18,500 km</p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full bg-[#FF9500]/10 text-[#FF9500] border border-[#FF9500]/20 text-[11px] font-semibold">
                      Due in 12 Days
                    </span>
                  </div>

                  {/* Health Score & Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
                      <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                        Vehicle Health
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-[20px] font-bold text-[#34C759]">92%</span>
                        <span className="text-[12px] text-[#86868b]">Good</span>
                      </div>
                      <div className="w-full bg-black/[0.06] dark:bg-white/[0.1] h-1 rounded-full mt-2 overflow-hidden">
                        <div className="bg-[#34C759] h-1 rounded-full w-[92%]" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F5F5F7] dark:bg-[#1C1C1E]">
                      <span className="text-[10px] font-semibold text-[#86868b] uppercase tracking-wider block mb-1">
                        Service Target
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-[20px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">1,500</span>
                        <span className="text-[12px] text-[#86868b]">km left</span>
                      </div>
                      <p className="text-[10px] text-[#86868b] mt-1.5">Milestone: 20,000 km</p>
                    </div>
                  </div>

                  {/* Maintenance Reminder */}
                  <div className="p-3.5 rounded-2xl bg-[#0071E3]/[0.06] dark:bg-[#2997FF]/[0.06] mb-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#0071E3]" />
                      <h4 className="text-[12px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7]">Upcoming Maintenance</h4>
                    </div>
                    <ul className="text-[12px] text-[#86868b] space-y-1 pl-4 list-disc">
                      <li>20,000 km interval approaching (current: 18,500 km)</li>
                      <li>Engine oil &amp; filter replacement</li>
                      <li>Brake calipers inspection</li>
                    </ul>
                    <div className="mt-2.5 pt-2 border-t border-[#0071E3]/10 flex items-center justify-between text-[12px]">
                      <span className="text-[#86868b]">Est. Cost:</span>
                      <span className="font-semibold text-[#0071E3] dark:text-[#2997FF]">₹3,500 – ₹4,800</span>
                    </div>
                  </div>

                  <a
                    href="/services/book"
                    className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-all duration-200 apple-btn shadow-lg shadow-[#0071E3]/25"
                  >
                    Book This Service
                    <ChevronRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3 CORE PILLARS SECTION */}
        <section className="py-16 bg-white dark:bg-[#111111] border-b border-black/[0.06] dark:border-white/[0.06]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-[12px] font-semibold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest">
                Comprehensive Vehicle Care
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mt-2">
                Why Motorists Rely on AutoPing
              </h2>
              <p className="text-[15px] text-[#86868b] mt-2">
                Built specifically for Indian road conditions, driving habits, and maintenance schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[#F5F5F7] dark:bg-[#161617] p-6 rounded-3xl">
                <div className="w-11 h-11 rounded-2xl bg-[#0071E3]/10 flex items-center justify-center mb-4">
                  <Bell className="w-5 h-5 text-[#0071E3]" />
                </div>
                <h3 className="font-semibold text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Predictive Reminders</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-3">
                  Never miss an oil change or major overhaul. We notify you prior to due dates based on exact odometer intervals.
                </p>
                <span className="text-[13px] font-medium text-[#0071E3] dark:text-[#2997FF]">Explains what &amp; why →</span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#161617] p-6 rounded-3xl">
                <div className="w-11 h-11 rounded-2xl bg-[#34C759]/10 flex items-center justify-center mb-4">
                  <Calendar className="w-5 h-5 text-[#34C759]" />
                </div>
                <h3 className="font-semibold text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Guaranteed Slot Booking</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-3">
                  Compare Authorized, Multi-brand, and Local garages. View capacity in real-time with zero double-booking risk.
                </p>
                <span className="text-[13px] font-medium text-[#34C759]">Real-time slots →</span>
              </div>

              <div className="bg-[#F5F5F7] dark:bg-[#161617] p-6 rounded-3xl">
                <div className="w-11 h-11 rounded-2xl bg-[#FF9500]/10 flex items-center justify-center mb-4">
                  <Gauge className="w-5 h-5 text-[#FF9500]" />
                </div>
                <h3 className="font-semibold text-[16px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">Component Health Tracking</h3>
                <p className="text-[14px] text-[#86868b] leading-relaxed mb-3">
                  Health diagnostics for engine oil, brake pads, tyres, battery, and AC cooling.
                </p>
                <span className="text-[13px] font-medium text-[#FF9500]">Detailed diagnostics →</span>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (4 STEPS) */}
        <section className="py-16 bg-[#F5F5F7] dark:bg-[#000]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-12">
              <span className="text-[12px] font-semibold text-[#0071E3] dark:text-[#2997FF] uppercase tracking-widest">
                Workflow
              </span>
              <h2 className="text-[28px] sm:text-[32px] font-semibold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight mt-2">How AutoPing Works</h2>
              <p className="text-[15px] text-[#86868b] mt-2">From vehicle registration to workshop check-in in 4 simple steps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: '01',
                  title: 'Add Your Vehicle',
                  desc: 'Pick your Car, Bike, or Scooter with exact brand, model, purchase year, and current KM reading.',
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
                  desc: 'Select Authorized OEM, Multi-Brand network, or Local neighborhood garage with distance and rating.',
                  color: '#FF9500',
                },
                {
                  step: '04',
                  title: 'Lock Your Slot',
                  desc: 'Pick date and time, confirm in 1-tap, and sync directly into Google Calendar or Apple iCal.',
                  color: '#FF3B30',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-[#161617] p-6 rounded-3xl border border-black/[0.04] dark:border-white/[0.06] shadow-sm">
                  <div className="text-[28px] font-bold mb-3 font-mono" style={{ color: item.color }}>{item.step}</div>
                  <h4 className="font-semibold text-[15px] text-[#1d1d1f] dark:text-[#f5f5f7] mb-2">{item.title}</h4>
                  <p className="text-[13px] text-[#86868b] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-14 pb-20 bg-[#F5F5F7] dark:bg-[#000]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-[#1d1d1f] dark:bg-[#161617] text-white p-10 sm:p-12">
              <div className="max-w-2xl">
                <h2 className="text-[26px] sm:text-[30px] font-semibold tracking-tight mb-3">
                  Take the Hassle Out of Vehicle Maintenance
                </h2>
                <p className="text-[#86868b] text-[15px] mb-8 leading-relaxed">
                  Join vehicle owners in Pune, Mumbai, Bengaluru, and Delhi who never miss a service milestone or warranty check.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/dashboard"
                    className="px-7 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[15px] transition-all duration-200 apple-btn shadow-lg shadow-[#0071E3]/30"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href="/admin/login"
                    className="px-6 py-3 rounded-full bg-white/[0.08] hover:bg-white/[0.12] text-white font-semibold text-[15px] border border-white/[0.12] transition-all duration-200 apple-btn flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#FF9500]" />
                    Admin Center
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
