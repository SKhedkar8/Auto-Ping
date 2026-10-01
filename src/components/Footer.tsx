import React from 'react';
import { Car, Heart, Shield, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white/70 backdrop-blur-md pt-12 pb-16 md:pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white shadow-xs">
                <Car className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-lg text-slate-900">
                Auto<span className="text-[#0B5CFF]">Ping</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Never Miss a Service. The intelligent maintenance and slot booking platform for personal vehicles across India.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live Slots Available
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Customer App</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="/dashboard" className="hover:text-blue-600 transition-colors">Dashboard Overview</a></li>
              <li><a href="/vehicles" className="hover:text-blue-600 transition-colors">Vehicle Health Check</a></li>
              <li><a href="/services/book" className="hover:text-blue-600 transition-colors">Book Service Slot</a></li>
              <li><a href="/bookings" className="hover:text-blue-600 transition-colors">My Appointments</a></li>
              <li><a href="/history" className="hover:text-blue-600 transition-colors">Maintenance History</a></li>
            </ul>
          </div>

          {/* Admin & Portals */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Platform & Admin</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="/admin" className="hover:text-blue-600 transition-colors">Admin Command Center</a></li>
              <li><a href="/admin/bookings" className="hover:text-blue-600 transition-colors">Bookings Management</a></li>
              <li><a href="/admin/service-centers" className="hover:text-blue-600 transition-colors">Service Centers</a></li>
              <li><a href="/admin/reports" className="hover:text-blue-600 transition-colors">Reports & Analytics</a></li>
              <li><a href="/admin/login" className="hover:text-blue-600 transition-colors flex items-center gap-1"><Shield className="w-3 h-3 text-amber-500" /> Admin Login</a></li>
            </ul>
          </div>

          {/* Help & Support */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Cities Active</h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">Pune</span>
              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">Mumbai</span>
              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">Bengaluru</span>
              <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">New Delhi</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-4 leading-normal">
              24/7 Roadside Assistance & Authorized Network partner garages.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-200/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} Auto Ping Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              Engineered with <Heart className="w-3 h-3 text-rose-500 fill-rose-500" /> for Indian motorists
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
