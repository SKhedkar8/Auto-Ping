'use client';

import React, { useEffect, useState } from 'react';
import {
  Car,
  Compass,
  ExternalLink,
  Filter,
  MapPin,
  Navigation,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Chatbot from '@/components/Chatbot';
import ServiceCentersMap from '@/components/ServiceCentersMap';
import { ServiceCenter } from '@/lib/types';

export default function ServiceMapPage() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCenterId, setSelectedCenterId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/centers')
      .then((r) => r.json())
      .then((res) => {
        if (res.data) setCenters(res.data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F5F7] dark:bg-[#000000] text-slate-900 dark:text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2">
              <Compass className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Interactive Geospatial Locator
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Nearest Service Centers Map
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Locate authorized manufacturer bays, multi-brand specialists, and certified local garages with live distance tracking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/services/book"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              Book Service Now
            </a>
          </div>
        </div>

        {/* MAP COMPONENT */}
        <div className="mb-12">
          <ServiceCentersMap
            centers={centers}
            selectedCenterId={selectedCenterId}
            onSelectCenter={(c) => setSelectedCenterId(c.id)}
            heightClass="h-[620px]"
          />
        </div>

        {/* WORKSHOPS DIRECTORY CARDS */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-950 dark:text-white">
                All Verified Service Facilities ({centers.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browse detailed telemetry, supported brands, and customer ratings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {centers.map((c) => {
              const isSelected = selectedCenterId === c.id;
              const isAuth = c.type === 'AUTHORIZED';
              const isMulti = c.type === 'MULTI_BRAND';

              const badgeColor = isAuth
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                : isMulti
                ? 'bg-yellow-50 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800';

              const dotColor = isAuth ? 'bg-emerald-500' : isMulti ? 'bg-yellow-400' : 'bg-blue-500';

              return (
                <div
                  key={c.id}
                  onClick={() => setSelectedCenterId(c.id)}
                  className={`p-6 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                      : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                        <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                        {isAuth ? 'Authorized OEM' : isMulti ? 'Multi-Brand' : 'Local Workshop'}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                        <Star className="w-3.5 h-3.5 fill-current" /> {c.rating} ({c.reviewCount})
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-slate-950 dark:text-white mb-1.5">
                      {c.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{c.address}, {c.city}</span>
                    </p>

                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs mb-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Brands Covered</span>
                      <div className="flex flex-wrap gap-1">
                        {c.brandsSupported.length > 0 ? (
                          c.brandsSupported.map((b, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                              {b}
                            </span>
                          ))
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">All Vehicle Brands</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <a
                      href={`tel:${c.phone}`}
                      className="text-xs font-mono text-slate-600 dark:text-slate-300 hover:underline flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="w-3 h-3 text-slate-400" />
                      {c.phone}
                    </a>

                    <a
                      href={`/services/book?centerId=${c.id}`}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Book Slot &rarr;
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Chatbot />
      <Footer />
    </div>
  );
}
