"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { CITIES, CityMeta } from "@/lib/data/cities";

interface CitySelectorProps {
  selectedCity: string;
  selectedDivision?: string;
  onCityChange: (city: string, division?: string) => void;
}

export default function CitySelector({
  selectedCity,
  selectedDivision,
  onCityChange,
}: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"city" | "division">("city");
  const [pendingCity, setPendingCity] = useState<CityMeta | null>(null);
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  // Hide the entire city selector when the notification menu is open
  const [notifOpen, setNotifOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const activeMeta = CITIES.find((c) => c.name === selectedCity);

  // Position the panel below the trigger
  const calcPos = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const panelW = 540;
    // clamp so it doesn't go off-screen right
    const left = Math.min(rect.left, window.innerWidth - panelW - 12);
    setDropdownPos({ top: rect.bottom + 8, left: Math.max(8, left) });
  };

  const open = () => {
    calcPos();
    setIsOpen(true);
    setStep("city");
    setPendingCity(null);
  };

  const close = () => {
    setIsOpen(false);
    setStep("city");
    setPendingCity(null);
    setHoveredCity(null);
  };

  // Recalculate on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const update = () => calcPos();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        close();
      }
    };
    // slight delay so the open-click doesnt immediately close
    const t = setTimeout(() => document.addEventListener("mousedown", handler), 50);
    return () => { clearTimeout(t); document.removeEventListener("mousedown", handler); };
  }, [isOpen]);

  // Esc key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Hide when notification dropdown opens (prevents floating city pill over notification card)
  useEffect(() => {
    const handleNotif = (e: Event) => {
      const detail = (e as CustomEvent<{ open: boolean }>).detail;
      setNotifOpen(detail?.open ?? false);
      // Also close our own dropdown if it was open
      if (detail?.open) close();
    };
    window.addEventListener('autoping_notif_state', handleNotif);
    return () => window.removeEventListener('autoping_notif_state', handleNotif);
  }, []);

  const handleCityClick = (city: CityMeta) => {
    setPendingCity(city);
    setStep("division");
  };

  const handleDivisionClick = (division: string) => {
    if (pendingCity) onCityChange(pendingCity.name, division);
    close();
  };

  const handleCityOnly = (city: CityMeta) => {
    onCityChange(city.name, undefined);
    close();
  };

  return (
    <div className="autoping-city-selector relative inline-flex transition-all duration-150">
      {/* ── Trigger Button ── */}
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => isOpen ? close() : open()}
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold
          bg-white dark:bg-slate-900
          border border-slate-200 dark:border-slate-700
          hover:border-blue-500 dark:hover:border-blue-500
          shadow-sm transition-all duration-150 cursor-pointer"
      >
        <MapPin
          className="w-3.5 h-3.5 shrink-0"
          style={{ color: activeMeta?.accentColor ?? "#3b82f6" }}
        />
        <span className="text-slate-800 dark:text-slate-200 font-bold">
          {activeMeta?.displayName ?? selectedCity}
        </span>
        {selectedDivision && (
          <>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[110px]">
              {selectedDivision}
            </span>
          </>
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Fixed dropdown panel (avoids clipping from parent overflow) ── */}
      {isOpen && (
        <div
          ref={panelRef}
          className="fixed z-[9999] bg-white dark:bg-[#111827]
            border border-slate-200 dark:border-slate-700
            rounded-2xl shadow-2xl overflow-hidden"
          style={{
            top: dropdownPos.top,
            left: dropdownPos.left,
            width: 540,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.06)",
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              {step === "division" && pendingCity && (
                <button
                  onClick={() => { setStep("city"); setPendingCity(null); }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 dark:text-slate-400"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {step === "city" ? "Select Your City" : `Areas in ${pendingCity?.displayName}`}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {step === "city"
                    ? "Choose a city · then pick your area"
                    : `Showing all sub-divisions of ${pendingCity?.displayName}`}
                </p>
              </div>
            </div>
            {/* Prominent close button */}
            <button
              onClick={close}
              className="w-8 h-8 flex items-center justify-center rounded-xl
                bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700
                text-slate-500 dark:text-slate-400 transition-all duration-150 cursor-pointer"
              aria-label="Close city selector"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── City Grid: 4 × 2 ── */}
          {step === "city" && (
            <>
              <div className="p-4 grid grid-cols-4 gap-3">
                {CITIES.map((city) => {
                  const isActive = city.name === selectedCity;
                  const isHov = hoveredCity === city.id;
                  return (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCityClick(city)}
                      onMouseEnter={() => setHoveredCity(city.id)}
                      onMouseLeave={() => setHoveredCity(null)}
                      className="relative flex flex-col items-center gap-2 p-3 rounded-xl border
                        text-center transition-all duration-150 cursor-pointer"
                      style={
                        isActive
                          ? {
                              border: `2px solid ${city.accentColor}`,
                              background: `${city.accentColor}16`,
                              boxShadow: `0 0 0 1px ${city.accentColor}30, 0 4px 14px ${city.accentColor}28`,
                            }
                          : isHov
                          ? {
                              border: `1px solid ${city.accentColor}55`,
                              background: `${city.accentColor}0e`,
                            }
                          : {
                              border: "1px solid",
                              borderColor: "rgba(148,163,184,0.18)",
                              background: "rgba(15,23,42,0.04)",
                            }
                      }
                    >
                      {/* Active dot */}
                      {isActive && (
                        <span
                          className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                          style={{ background: city.accentColor }}
                        />
                      )}

                      {/* Landmark SVG */}
                      <div style={{ width: "100%", height: 50 }}>
                        <svg
                          viewBox={city.viewBox}
                          width="100%"
                          height="100%"
                          style={{
                            color: isActive || isHov ? city.accentColor : "#64748b",
                            transition: "color 0.15s ease",
                          }}
                          aria-label={city.landmarkName}
                          dangerouslySetInnerHTML={{ __html: city.landmarkSvg }}
                        />
                      </div>

                      {/* City name */}
                      <span
                        className="text-[12px] font-bold leading-tight block"
                        style={{ color: isActive || isHov ? city.accentColor : undefined }}
                      >
                        {city.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block -mt-1">
                        {city.stateCode}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Landmark hint footer */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50/60 dark:bg-slate-800/40">
                <span className="text-base leading-none">🏛</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 transition-all">
                  {hoveredCity
                    ? CITIES.find((c) => c.id === hoveredCity)?.landmarkName
                    : activeMeta
                    ? `Currently: ${activeMeta.landmarkName}`
                    : "Hover a city to preview its landmark"}
                </span>
              </div>
            </>
          )}

          {/* ── Division list ── */}
          {step === "division" && pendingCity && (
            <div className="overflow-y-auto" style={{ maxHeight: 300 }}>
              <div className="p-3">
                <button
                  type="button"
                  onClick={() => handleCityOnly(pendingCity)}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold mb-2
                    text-slate-700 dark:text-slate-200 flex items-center gap-2.5
                    hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: pendingCity.accentColor }} />
                  All of {pendingCity.displayName}
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 mb-2" />
                <div className="grid grid-cols-2 gap-1">
                  {pendingCity.divisions.map((div) => {
                    const isActiveDiv = div.name === selectedDivision && pendingCity.name === selectedCity;
                    return (
                      <button
                        key={div.name}
                        type="button"
                        onClick={() => handleDivisionClick(div.name)}
                        className="text-left px-3 py-2 rounded-xl text-xs font-medium
                          transition-all cursor-pointer flex items-center gap-2"
                        style={
                          isActiveDiv
                            ? { color: pendingCity.accentColor, background: `${pendingCity.accentColor}14`, fontWeight: 700 }
                            : {}
                        }
                        onMouseEnter={(e) => {
                          if (!isActiveDiv) {
                            (e.currentTarget as HTMLElement).style.background = "rgba(148,163,184,0.08)";
                            (e.currentTarget as HTMLElement).style.color = "var(--tw-color-slate-900, #0f172a)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActiveDiv) {
                            (e.currentTarget as HTMLElement).style.background = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "";
                          }
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{
                            background: isActiveDiv ? pendingCity.accentColor : "transparent",
                            border: isActiveDiv ? "none" : `1px solid rgba(148,163,184,0.4)`,
                          }}
                        />
                        <span className="text-slate-600 dark:text-slate-300">{div.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
