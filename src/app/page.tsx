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
    <div className="min-h-screen flex flex-col gradient-mesh">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Copy */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#0B5CFF]" />
                  <span className="text-xs font-semibold text-[#0B5CFF]">
                    Next-Gen Intelligent Vehicle Maintenance
                  </span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                  Never Miss a <span className="gradient-text">Service.</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                  Auto Ping tracks your vehicle’s mileage, diagnoses impending component wear, explains <em>why</em> service is needed, and lets you book guaranteed slots at certified service centers in under 2 minutes.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5">
                  <a
                    href="/dashboard"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-2xl gradient-primary text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    Open Customer App
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <a
                    href="/services/book"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/90 hover:bg-white text-slate-700 font-semibold text-sm border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Wrench className="w-4 h-4 text-slate-500" />
                    Book Service Now
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Authorized OEM & Multi-brand</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Real-time slot locking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>Accurate cost estimates</span>
                  </div>
                </div>
              </div>

              {/* Right Live Interactive Mock Card */}
              <div className="lg:col-span-5 relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-2xl -z-10" />

                <div className="glass-card p-6 border border-white/80 shadow-2xl relative overflow-hidden">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        <Car className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-base text-slate-900">Hyundai Creta</h3>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold">
                            2024
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">MH 12 AB 1234 • 18,500 km</p>
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      Due in 12 Days
                    </span>
                  </div>

                  {/* Health Score Ring & Metrics */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Vehicle Health
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-emerald-600">92%</span>
                        <span className="text-xs font-semibold text-emerald-700">Excellent</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-emerald-500 h-1.5 rounded-full w-[92%]" />
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/70 border border-slate-100">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Service Target
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">1,500</span>
                        <span className="text-xs text-slate-500 font-semibold">km left</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1.5">Next milestone: 20,000 km</p>
                    </div>
                  </div>

                  {/* Smart Reminder Breakdown */}
                  <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100/90 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-slate-900">Smart Service Reminder</h4>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 pl-4 list-disc">
                      <li>20,000 km interval approaching (you are at 18,500 km)</li>
                      <li>Engine oil & filter replacement</li>
                      <li>Brake inspection due soon</li>
                    </ul>
                    <div className="mt-3 pt-2.5 border-t border-blue-200/50 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Est. Service Cost:</span>
                      <span className="text-sm font-extrabold text-blue-700">₹3,500 – ₹4,800</span>
                    </div>
                  </div>

                  <a
                    href="/services/book"
                    className="w-full py-3 rounded-xl gradient-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 hover:opacity-95"
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
        <section className="py-16 bg-white/60 border-y border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                Comprehensive Vehicle Care
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
                Why Motorists Rely on Auto Ping
              </h2>
              <p className="text-sm text-slate-600 mt-3">
                Built specifically for Indian road conditions, driving habits, and maintenance schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="glass-card glass-card-hover p-6 border border-white">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5 font-bold">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">Smart Predictive Reminders</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Never miss an oil change or major overhaul. We notify you 30 days and 7 days prior based on exact odometer intervals, explaining component conditions in simple language.
                </p>
                <div className="inline-flex items-center text-xs font-bold text-blue-600">
                  Explains what & why →
                </div>
              </div>

              {/* Feature 2 */}
              <div className="glass-card glass-card-hover p-6 border border-white">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-5 font-bold">
                  <Calendar className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">Guaranteed Slot Booking</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Compare Authorized, Multi-brand, and trusted Local garages. View capacity in real-time with zero double-booking risk and instant SMS/Calendar confirmation.
                </p>
                <div className="inline-flex items-center text-xs font-bold text-cyan-600">
                  Transaction-safe slots →
                </div>
              </div>

              {/* Feature 3 */}
              <div className="glass-card glass-card-hover p-6 border border-white">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 font-bold">
                  <Gauge className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-lg text-slate-900 mb-2">Real-Time Vehicle Health</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Weighted 0–100 health diagnostic for engine oil, brake pads, tyres, battery, and AC cooling. Catch minor issues before they turn into ₹15,000+ repair bills.
                </p>
                <div className="inline-flex items-center text-xs font-bold text-emerald-600">
                  Interactive timeline →
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (4 STEPS) */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest">
                Seamless Experience
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 mt-2">How Auto Ping Works</h2>
              <p className="text-sm text-slate-600 mt-2">From vehicle registration to garage drive-out in 4 effortless steps.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Add Your Vehicle',
                  desc: 'Pick your Car, Bike, or Scooter with exact brand, model, purchase year, and current KM reading.',
                },
                {
                  step: '02',
                  title: 'Get Smart Reminders',
                  desc: 'Auto Ping calculates your next service milestone and delivers cost estimates before maintenance is overdue.',
                },
                {
                  step: '03',
                  title: 'Choose Service Center',
                  desc: 'Select Authorized OEM, Multi-Brand network, or Local neighborhood garage with distance and rating.',
                },
                {
                  step: '04',
                  title: 'Lock Your Slot',
                  desc: 'Pick date and time, confirm in 1-tap, and sync directly into Google Calendar or Apple iCal.',
                },
              ].map((item, idx) => (
                <div key={idx} className="glass-card p-6 border border-white relative">
                  <div className="text-4xl font-black text-blue-600/20 mb-3">{item.step}</div>
                  <h4 className="font-extrabold text-base text-slate-900 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl gradient-primary text-white p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-4">
                  Take the Hassle Out of Vehicle Maintenance
                </h2>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Join vehicle owners in Pune, Mumbai, Bengaluru, and Delhi who never miss an oil change or warranty milestone.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl bg-white text-blue-600 font-extrabold text-xs shadow-md hover:bg-slate-50 transition-colors"
                  >
                    Go to Customer Dashboard
                  </a>
                  <a
                    href="/admin/login"
                    className="px-6 py-3 rounded-xl bg-slate-900/60 text-white font-semibold text-xs hover:bg-slate-900 transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Admin Command Center
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
