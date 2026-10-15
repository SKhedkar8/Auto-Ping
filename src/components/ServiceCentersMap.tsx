'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Crosshair,
  ExternalLink,
  Layers,
  Locate,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Minus,
  Search,
  Sparkles,
  Star,
  Wrench,
  X,
  ListFilter,
  CheckCircle2,
  ChevronDown,
  Globe2,
} from 'lucide-react';
import { ServiceCenter } from '@/lib/types';

export type CenterWithDistance = ServiceCenter & { calculatedDistance?: number };

interface ServiceCentersMapProps {
  centers: ServiceCenter[];
  onSelectCenter?: (center: ServiceCenter) => void;
  selectedCenterId?: string | null;
  heightClass?: string;
}

// Major hub coordinates for quick centering
const CITY_COORDINATES: Record<string, { lat: number; lng: number; defaultZoom: number; label: string }> = {
  'All Cities': { lat: 21.7679, lng: 78.8718, defaultZoom: 5, label: 'All India (National Range)' },
  Pune: { lat: 18.5204, lng: 73.8567, defaultZoom: 12, label: 'Pune Metro' },
  Mumbai: { lat: 19.0760, lng: 72.8777, defaultZoom: 11, label: 'Mumbai MMR' },
  Bengaluru: { lat: 12.9716, lng: 77.5946, defaultZoom: 11, label: 'Bengaluru Urban' },
  Delhi: { lat: 28.6139, lng: 77.2090, defaultZoom: 11, label: 'Delhi NCR' },
};

// Range options in kilometers
const RANGE_OPTIONS: { label: string; value: number | 'ALL'; zoom: number; description: string }[] = [
  { label: '5 km', value: 5, zoom: 15, description: 'Hyperlocal / Neighborhood' },
  { label: '15 km', value: 15, zoom: 13, description: 'City Center' },
  { label: '35 km', value: 35, zoom: 11, description: 'Metropolitan Area' },
  { label: '100 km', value: 100, zoom: 9, description: 'Regional Corridor' },
  { label: '300 km', value: 300, zoom: 7, description: 'State-wide Highway' },
  { label: 'All Range', value: 'ALL', zoom: 5, description: 'Nationwide (All India)' },
];

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function ServiceCentersMap({
  centers,
  onSelectCenter,
  selectedCenterId: externalSelectedId,
  heightClass = 'h-[640px]',
}: ServiceCentersMapProps) {
  const [selectedCenter, setSelectedCenter] = useState<CenterWithDistance | null>(null);
  const [userPos, setUserPos] = useState({ lat: 18.5204, lng: 73.8567, label: 'Pune, Maharashtra' });
  const [isUsingLiveGps, setIsUsingLiveGps] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'AUTHORIZED' | 'MULTI_BRAND' | 'LOCAL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedRange, setSelectedRange] = useState<number | 'ALL'>('ALL');
  const [mapType, setMapType] = useState<'m' | 'k' | 'h' | 'p'>('m'); // m = roadmap, k = satellite, h = hybrid, p = terrain
  const [viewMode, setViewMode] = useState<'google' | 'radar'>('google');
  const [zoomLevel, setZoomLevel] = useState<number>(5);
  const [isLocating, setIsLocating] = useState(false);
  const [showFacilityDrawer, setShowFacilityDrawer] = useState(true);

  // Sync external selected center
  useEffect(() => {
    if (externalSelectedId) {
      const found = centers.find((c) => c.id === externalSelectedId);
      if (found) {
        const dist = getDistanceFromLatLonInKm(userPos.lat, userPos.lng, found.lat, found.lng);
        setSelectedCenter({ ...found, calculatedDistance: dist });
        setZoomLevel(15);
      }
    }
  }, [externalSelectedId, centers, userPos]);

  // Adjust zoom when range changes
  const handleRangeChange = (rangeValue: number | 'ALL') => {
    setSelectedRange(rangeValue);
    const rangePreset = RANGE_OPTIONS.find((r) => r.value === rangeValue);
    if (rangePreset) {
      if (rangeValue === 'ALL') {
        const cityPreset = CITY_COORDINATES[selectedCity];
        setZoomLevel(cityPreset ? cityPreset.defaultZoom : 5);
      } else {
        setZoomLevel(rangePreset.zoom);
      }
    }
  };

  // Adjust coordinates & zoom when city changes
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setSelectedCenter(null);
    if (city !== 'All Cities' && CITY_COORDINATES[city]) {
      setUserPos({
        lat: CITY_COORDINATES[city].lat,
        lng: CITY_COORDINATES[city].lng,
        label: CITY_COORDINATES[city].label,
      });
      setIsUsingLiveGps(false);
      if (selectedRange === 'ALL') {
        setZoomLevel(CITY_COORDINATES[city].defaultZoom);
      }
    } else if (city === 'All Cities') {
      if (selectedRange === 'ALL') {
        setZoomLevel(5);
      }
    }
  };

  // Calculate distances from current reference position
  const centersWithDistance = useMemo(() => {
    return centers.map((c) => {
      const dist = getDistanceFromLatLonInKm(userPos.lat, userPos.lng, c.lat, c.lng);
      return { ...c, calculatedDistance: dist };
    });
  }, [centers, userPos]);

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set(centers.map((c) => c.city));
    return ['All Cities', ...Array.from(set)];
  }, [centers]);

  // Filter centers based on Type, City, Search, and Selected Range
  const filteredCenters = useMemo(() => {
    return centersWithDistance
      .filter((c) => {
        // Type filter
        if (filterType !== 'ALL' && c.type !== filterType) return false;
        // City filter
        if (selectedCity !== 'All Cities' && c.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
        // Range distance filter (if not ALL)
        if (selectedRange !== 'ALL' && (c.calculatedDistance ?? Infinity) > selectedRange) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchAddr = c.address.toLowerCase().includes(q);
          const matchCity = c.city.toLowerCase().includes(q);
          const matchBrand = c.brandsSupported.some((b) => b.toLowerCase().includes(q));
          if (!matchName && !matchAddr && !matchCity && !matchBrand) return false;
        }
        return true;
      })
      .sort((a, b) => (a.calculatedDistance || 0) - (b.calculatedDistance || 0));
  }, [centersWithDistance, filterType, selectedCity, selectedRange, searchQuery]);

  // Live Geolocation handler
  const handleLocateMe = () => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setIsUsingLiveGps(true);
          setUserPos({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: 'Your Current Live GPS',
          });
          setSelectedCity('All Cities');
          setZoomLevel(13);
        },
        () => {
          setIsLocating(false);
          // Fallback to Pune center
          setUserPos({ lat: 18.5204, lng: 73.8567, label: 'Shivaji Nagar, Pune' });
          setZoomLevel(12);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  const handleSelectCenter = (center: CenterWithDistance) => {
    setSelectedCenter(center);
    setZoomLevel(16);
    if (onSelectCenter) {
      onSelectCenter(center);
    }
  };

  // Google Maps Embed URL Generator
  const googleMapsEmbedUrl = useMemo(() => {
    let query = '';

    if (selectedCenter) {
      // Focus on the specific chosen center
      query = `${selectedCenter.lat},${selectedCenter.lng}+(${encodeURIComponent(selectedCenter.name)})`;
    } else if (searchQuery.trim()) {
      // Search term
      query = `${encodeURIComponent(searchQuery)} Service Center ${
        selectedCity !== 'All Cities' ? encodeURIComponent(selectedCity) : 'India'
      }`;
    } else if (selectedCity !== 'All Cities') {
      // Focus on selected city
      query = `Automobile Service Centers in ${encodeURIComponent(selectedCity)}`;
    } else if (isUsingLiveGps) {
      // Focus on user's current GPS location
      query = `Car Service Centers near ${userPos.lat},${userPos.lng}`;
    } else {
      // Nationwide view
      query = `Automobile Service Centers India`;
    }

    return `https://maps.google.com/maps?q=${query}&t=${mapType}&z=${zoomLevel}&ie=UTF8&iwloc=&output=embed`;
  }, [selectedCenter, searchQuery, selectedCity, isUsingLiveGps, userPos, mapType, zoomLevel]);

  // Direct Google Maps full-page navigation link
  const openExternalGoogleMapsUrl = useMemo(() => {
    if (selectedCenter) {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${selectedCenter.name} ${selectedCenter.address} ${selectedCenter.city}`
      )}`;
    }
    if (selectedCity !== 'All Cities') {
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `Car Service Centers in ${selectedCity}`
      )}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `Service Centers near ${userPos.lat},${userPos.lng}`
    )}`;
  }, [selectedCenter, selectedCity, userPos]);

  const getMarkerBadge = (type: string) => {
    switch (type) {
      case 'AUTHORIZED':
        return {
          label: 'Authorized OEM',
          color: '#10B981',
          bgClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        };
      case 'MULTI_BRAND':
        return {
          label: 'Multi-Brand Pro',
          color: '#EAB308',
          bgClass: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
        };
      case 'LOCAL':
      default:
        return {
          label: 'Local Garage',
          color: '#3B82F6',
          bgClass: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
        };
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 1, 19));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 1, 4));

  // Dynamic bounds for fallback Radar HUD mode (so it never clips, regardless of city or range)
  const radarBounds = useMemo(() => {
    const lats = [userPos.lat, ...filteredCenters.map((c) => c.lat)];
    const lngs = [userPos.lng, ...filteredCenters.map((c) => c.lng)];
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = Math.max((maxLat - minLat) * 0.15, 0.05);
    const padLng = Math.max((maxLng - minLng) * 0.15, 0.05);
    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
    };
  }, [filteredCenters, userPos]);

  const projectRadarCoords = (lat: number, lng: number) => {
    const latSpan = radarBounds.maxLat - radarBounds.minLat || 0.1;
    const lngSpan = radarBounds.maxLng - radarBounds.minLng || 0.1;
    const x = Math.max(5, Math.min(95, ((lng - radarBounds.minLng) / lngSpan) * 100));
    const y = Math.max(5, Math.min(95, ((radarBounds.maxLat - lat) / latSpan) * 100));
    return { x, y };
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 font-sans bg-[#0f172a] text-slate-100">
      {/* ─── TOP FILTER & CONTROL BAR ─── */}
      <div className="p-4 sm:p-5 bg-slate-900/95 backdrop-blur-xl border-b border-white/10 flex flex-col gap-3.5 z-30 relative">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Title & Active Region */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Compass className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Live Google Service Map
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold">
                  <Globe2 className="w-3 h-3" />
                  Larger Range Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {selectedCity === 'All Cities' ? 'All India National Network' : `${selectedCity} Service Corridor`} •{' '}
                <span className="text-emerald-400 font-medium">
                  {filteredCenters.length} centers in active range
                </span>
              </p>
            </div>
          </div>

          {/* Map Layer Mode Switcher & Locate Me */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle: Google Maps vs Radar HUD */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-2xl border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode('google')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'google'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe2 className="w-3.5 h-3.5" />
                Google Map
              </button>
              <button
                type="button"
                onClick={() => setViewMode('radar')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'radar'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                Radar HUD
              </button>
            </div>

            {/* GPS Geolocation */}
            <button
              type="button"
              onClick={handleLocateMe}
              className={`h-9 px-3.5 rounded-2xl flex items-center gap-2 text-xs font-semibold transition-all cursor-pointer border ${
                isUsingLiveGps
                  ? 'bg-emerald-600 text-white border-emerald-400/40 shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800/80 hover:bg-slate-700/80 text-white border-white/10'
              }`}
              title="Use your real device location for exact driving distance"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin text-amber-400' : ''}`} />
              <span className="hidden sm:inline">
                {isLocating ? 'Locating...' : isUsingLiveGps ? 'GPS Active' : 'My Location'}
              </span>
            </button>
          </div>
        </div>

        {/* ─── RANGE FILTER SELECTOR (CORE FEATURE: LARGER RANGE SUPPORT) ─── */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <span className="text-slate-300 font-semibold">Coverage Range:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {RANGE_OPTIONS.map((opt) => {
                const isActive = selectedRange === opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() => handleRangeChange(opt.value)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30 ring-2 ring-blue-500/20'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-white/10'
                    }`}
                    title={opt.description}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Google Maps Layer Type Selector (Roadmap / Satellite / Hybrid) */}
          {viewMode === 'google' && (
            <div className="flex items-center gap-1.5 bg-slate-800/60 p-1 rounded-xl border border-white/10 text-xs">
              <span className="text-[11px] text-slate-400 px-1 font-medium">Map Layer:</span>
              <button
                type="button"
                onClick={() => setMapType('m')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  mapType === 'm' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Roads
              </button>
              <button
                type="button"
                onClick={() => setMapType('k')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  mapType === 'k' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Satellite
              </button>
              <button
                type="button"
                onClick={() => setMapType('h')}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  mapType === 'h' ? 'bg-white/20 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Hybrid
              </button>
            </div>
          )}
        </div>

        {/* ─── FILTERS: CITY, FACILITY TYPE, SEARCH ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by center name, brand, or area..."
              className="w-full h-9 pl-9 pr-8 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* City Selector */}
          <div className="sm:col-span-3">
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full h-9 pl-8 pr-7 bg-slate-800/80 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer appearance-none"
              >
                {cities.map((city) => (
                  <option key={city} value={city} className="bg-slate-900 text-white">
                    {city === 'All Cities' ? '📍 All Cities (India)' : city}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Workshop Type Filter Pills */}
          <div className="sm:col-span-4 flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { key: 'ALL', label: 'All' },
              { key: 'AUTHORIZED', label: 'Authorized' },
              { key: 'MULTI_BRAND', label: 'Multi-Brand' },
              { key: 'LOCAL', label: 'Local' },
            ].map(({ key, label }) => {
              const active = filterType === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilterType(key as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    active
                      ? 'bg-white/20 text-white border-white/40 shadow-sm'
                      : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400 border-white/5'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── MAIN MAP DISPLAY CANVAS ─── */}
      <div className={`relative w-full ${heightClass} overflow-hidden bg-slate-950`}>
        {viewMode === 'google' ? (
          /* ─── REAL GOOGLE MAP EMBED (Full Interactive Range) ─── */
          <div className="w-full h-full relative">
            <iframe
              key={`${selectedCenter?.id || 'none'}-${selectedCity}-${selectedRange}-${zoomLevel}-${mapType}-${searchQuery}`}
              title="Google Map Service Locator"
              src={googleMapsEmbedUrl}
              className="w-full h-full border-0 filter contrast-[1.05]"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* Quick Map Controls Overlays */}
            <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
              {/* Zoom In / Out Buttons */}
              <div className="flex flex-col rounded-2xl overflow-hidden shadow-xl border border-white/10 backdrop-blur-xl bg-slate-900/90">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 transition-all border-b border-white/10 cursor-pointer"
                  title="Zoom In (Tighter Range)"
                >
                  <Plus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                  title="Zoom Out (Larger Range)"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>

              {/* External Google Maps Button */}
              <a
                href={openExternalGoogleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-xl transition-all cursor-pointer border border-blue-400/30"
                title="Open in full Google Maps App / Website"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* ─── FALLBACK AUTOPING RADAR HUD (With Dynamic National Bounds) ─── */
          <div className="relative w-full h-full select-none overflow-hidden bg-[#0d1424]">
            {/* Dark Grid Background */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />

            {/* Radar Sweep Circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] rounded-full border border-blue-500/20 animate-pulse" />
              <div className="w-[300px] h-[300px] rounded-full border border-blue-500/10 absolute" />
              <div className="w-[700px] h-[700px] rounded-full border border-blue-500/10 absolute" />
            </div>

            {/* User GPS Pin on Radar */}
            {(() => {
              const uPos = projectRadarCoords(userPos.lat, userPos.lng);
              return (
                <div
                  className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                  style={{ left: `${uPos.x}%`, top: `${uPos.y}%` }}
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-10 h-10 rounded-full bg-blue-500/20 animate-ping absolute" />
                    <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-xl z-10" />
                  </div>
                  <div className="absolute left-1/2 -translate-x-1/2 top-5 px-2 py-0.5 rounded-md bg-blue-600 text-[10px] text-white font-bold whitespace-nowrap shadow-lg">
                    {userPos.label}
                  </div>
                </div>
              );
            })()}

            {/* Workshop Pins on Radar */}
            {filteredCenters.map((c) => {
              const pos = projectRadarCoords(c.lat, c.lng);
              const isSelected = selectedCenter?.id === c.id;
              const badge = getMarkerBadge(c.type);

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCenter(c)}
                  className="absolute z-30 -translate-x-1/2 -translate-y-full cursor-pointer transition-transform hover:scale-125"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className={`flex flex-col items-center ${isSelected ? 'scale-125' : ''}`}>
                    <svg width="28" height="36" viewBox="0 0 32 42" fill="none" className="drop-shadow-lg">
                      <path
                        d="M16 0C7.163 0 0 7.163 0 16C0 26 16 42 16 42C16 42 32 26 32 16C32 7.163 24.837 0 16 0Z"
                        fill={badge.color}
                      />
                      <circle cx="16" cy="16" r="8" fill="white" />
                      <circle cx="16" cy="16" r="5" fill={badge.color} />
                    </svg>
                    <span className="mt-0.5 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-bold text-white border border-white/20 whitespace-nowrap shadow-md">
                      {c.name.split(' ')[0]} ({c.calculatedDistance} km)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FLOATING FACILITIES IN RANGE QUICK-LIST DRAWER (Left side) ─── */}
        <div
          className={`absolute top-4 left-4 z-40 max-w-[340px] w-full transition-all duration-300 ${
            showFacilityDrawer ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-4 border border-white/10 shadow-2xl max-h-[calc(100vh-320px)] sm:max-h-[480px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">
                  Centers in Range ({filteredCenters.length})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFacilityDrawer(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Collapse drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto space-y-2 pt-2 pr-1 custom-scrollbar">
              {filteredCenters.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400">No centers found within this range or filter.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRange('ALL');
                      setFilterType('ALL');
                      setSearchQuery('');
                      setSelectedCity('All Cities');
                    }}
                    className="mt-3 text-xs text-blue-400 hover:underline font-semibold"
                  >
                    Reset range to Nationwide
                  </button>
                </div>
              ) : (
                filteredCenters.map((c) => {
                  const isSelected = selectedCenter?.id === c.id;
                  const badge = getMarkerBadge(c.type);

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCenter(c)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500/50'
                          : 'bg-slate-800/60 hover:bg-slate-800 border-white/5'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.bgClass}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: badge.color }} />
                          {badge.label}
                        </span>
                        <span className="text-xs font-bold text-blue-400 shrink-0">
                          {c.calculatedDistance} km
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{c.name}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {c.address}, {c.city}
                      </p>
                      <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-white/5 text-[11px] text-slate-400">
                        <span className="text-amber-400 font-bold flex items-center gap-0.5">
                          ★ {c.rating}
                        </span>
                        <span>({c.reviewCount} reviews)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Toggle drawer button when closed */}
        {!showFacilityDrawer && (
          <button
            type="button"
            onClick={() => setShowFacilityDrawer(true)}
            className="absolute top-4 left-4 z-30 px-3.5 py-2 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white text-xs font-semibold flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ListFilter className="w-3.5 h-3.5 text-blue-400" />
            Show Centers ({filteredCenters.length})
          </button>
        )}

        {/* ─── DETAILED SELECTED CENTER POPUP MODAL (Bottom Center/Right) ─── */}
        {selectedCenter && (
          <div className="absolute right-4 bottom-4 z-40 max-w-sm w-full animate-in slide-in-from-bottom-4 duration-300">
            <div className="bg-slate-900/95 backdrop-blur-2xl rounded-3xl p-5 border border-white/15 shadow-2xl">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      getMarkerBadge(selectedCenter.type).bgClass
                    }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: getMarkerBadge(selectedCenter.type).color }}
                    />
                    {getMarkerBadge(selectedCenter.type).label}
                  </span>
                  <h3 className="font-bold text-base text-white mt-1.5 leading-snug">
                    {selectedCenter.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCenter(null)}
                  className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rating & Distance */}
              <div className="flex items-center gap-2 text-xs mb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  ★ {selectedCenter.rating}
                </span>
                <span className="text-white/40">({selectedCenter.reviewCount} reviews)</span>
                <span className="text-white/20">•</span>
                <span className="font-semibold text-blue-400">
                  {selectedCenter.calculatedDistance ?? selectedCenter.distanceKm ?? 2.5} KM away
                </span>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                {selectedCenter.address}, {selectedCenter.city}
              </p>

              {/* Brands supported */}
              {selectedCenter.brandsSupported && selectedCenter.brandsSupported.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {selectedCenter.brandsSupported.slice(0, 4).map((b) => (
                    <span
                      key={b}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300 border border-white/5 font-medium"
                    >
                      {b}
                    </span>
                  ))}
                  {selectedCenter.brandsSupported.length > 4 && (
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">
                      +{selectedCenter.brandsSupported.length - 4} more
                    </span>
                  )}
                </div>
              )}

              {/* Action Buttons: Directions, Call, Book */}
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    `${selectedCenter.name} ${selectedCenter.address} ${selectedCenter.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 rounded-2xl bg-[#4285F4] hover:bg-[#3275e4] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Directions
                </a>
                <a
                  href={`tel:${selectedCenter.phone}`}
                  className="py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
                <a
                  href={`/services/book?centerId=${selectedCenter.id}`}
                  className="py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-lg cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  Book Slot
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── FOOTER BAR (LEGEND & EXTERNAL NAVIGATION) ─── */}
      <div className="px-5 py-3 bg-slate-900 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex flex-wrap items-center gap-4">
          <span className="font-semibold text-slate-300">Legend:</span>
          {[
            { color: '#10B981', label: 'Authorized OEM Bay' },
            { color: '#EAB308', label: 'Multi-Brand Specialist' },
            { color: '#3B82F6', label: 'Certified Local Garage' },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-400">
            Powered by Google Maps Geospatial Routing
          </span>
          <a
            href={openExternalGoogleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors font-medium"
          >
            Open in Google Maps <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
