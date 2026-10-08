'use client';

import React from 'react';

export default function ServiceBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* ── Dynamic Ambient Color Orbs ── */}
      <div className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[650px] max-h-[650px] rounded-full bg-gradient-to-br from-[#0071E3]/12 via-[#5856D6]/8 to-transparent blur-[110px] animate-service-glow" />
      <div className="absolute top-[35%] -right-[12%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full bg-gradient-to-bl from-[#34C759]/10 via-[#0071E3]/8 to-transparent blur-[120px] animate-service-glow" style={{ animationDelay: '3s' }} />
      <div className="absolute -bottom-[15%] left-[20%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-gradient-to-tr from-[#FF9500]/8 via-[#FF2D55]/6 to-transparent blur-[100px] animate-service-glow" style={{ animationDelay: '5s' }} />

      {/* ── Mechanical Gears — Servicing Motif 1 (Top Right) ── */}
      <div className="absolute top-16 right-[-60px] md:right-8 opacity-[0.045] dark:opacity-[0.08] text-[#0071E3] dark:text-[#2997FF]">
        {/* Large Gear */}
        <svg
          className="w-56 h-56 md:w-80 md:h-80 animate-gear-slow"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30zm0 10a5 5 0 1 1 0 10 5 5 0 0 1 0-10z" />
          <path d="M93 45.5l-6.8-.7c-.5-2.4-1.3-4.6-2.4-6.7l4.5-5.1c1.2-1.4 1-3.5-.3-4.7l-5.7-5.7c-1.2-1.2-3.3-1.4-4.7-.3l-5.1 4.5c-2.1-1.1-4.3-1.9-6.7-2.4l-.7-6.8C65.6 15 64 14 62.3 14h-8.1c-1.8 0-3.3 1.2-3.5 3l-.7 6.8c-2.4.5-4.6 1.3-6.7 2.4l-5.1-4.5c-1.4-1.2-3.5-1-4.7.3l-5.7 5.7c-1.2 1.2-1.4 3.3-.3 4.7l4.5 5.1c-1.1 2.1-1.9 4.3-2.4 6.7l-6.8.7C15 47.4 14 49 14 50.8v8.1c0 1.8 1.2 3.3 3 3.5l6.8.7c.5 2.4 1.3 4.6 2.4 6.7l-4.5 5.1c-1.2 1.4-1 3.5.3 4.7l5.7 5.7c1.2 1.2 3.3 1.4 4.7.3l5.1-4.5c2.1 1.1 4.3 1.9 6.7 2.4l.7 6.8c.2 1.8 1.7 3 3.5 3h8.1c1.8 0 3.3-1.2 3.5-3l.7-6.8c2.4-.5 4.6-1.3 6.7-2.4l5.1 4.5c1.4 1.2 3.5 1 4.7-.3l5.7-5.7c1.2-1.2 1.4-3.3.3-4.7l-4.5-5.1c1.1-2.1 1.9-4.3 2.4-6.7l6.8-.7c1.8-.2 3-1.7 3-3.5v-8.1c0-1.8-1.2-3.3-3-3.5zM50 68c-9.9 0-18-8.1-18-18s8.1-18 18-18 18 8.1 18 18-8.1 18-18 18z" />
        </svg>

        {/* Interlocking Small Gear */}
        <svg
          className="w-32 h-32 md:w-44 md:h-44 -mt-16 -ml-12 animate-gear-reverse text-[#34C759]"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 36a14 14 0 1 0 0 28 14 14 0 0 0 0-28zm0 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12z" />
          <path d="M92 46l-6.2-.6c-.5-2.2-1.2-4.2-2.2-6.1l4.1-4.6c1.1-1.3.9-3.2-.3-4.3l-5.2-5.2c-1.1-1.1-3-.1.3-.3l-4.6 4.1c-1.9-1-3.9-1.7-6.1-2.2L70 21c-.2-1.6-1.5-2.7-3.2-2.7h-7.4c-1.6 0-3 1.1-3.2 2.7l-.6 6.2c-2.2.5-4.2 1.2-6.1 2.2l-4.6-4.1c-1.3-1.1-3.2-.9-4.3.3l-5.2 5.2c-1.1 1.1-1.3 3-.3 4.3l4.1 4.6c-1 1.9-1.7 3.9-2.2 6.1L21 46c-1.6.2-2.7 1.5-2.7 3.2v7.4c0 1.6 1.1 3 2.7 3.2l6.2.6c.5 2.2 1.2 4.2 2.2 6.1l-4.1 4.6c-1.1 1.3-.9 3.2.3 4.3l5.2 5.2c1.1 1.1 3 .1.3.3l4.6-4.1c1.9 1 3.9 1.7 6.1 2.2l.6 6.2c.2 1.6 1.5 2.7 3.2 2.7h7.4c1.6 0 3-1.1 3.2-2.7l.6-6.2c2.2-.5 4.2-1.2 6.1-2.2l4.6 4.1c1.3 1.1 3.2.9 4.3-.3l5.2-5.2c1.1-1.1 1.3-3 .3-4.3l-4.1-4.6c1-1.9 1.7-3.9 2.2-6.1l6.2-.6c1.6-.2 2.7-1.5 2.7-3.2v-7.4c0-1.7-1.1-3-2.7-3.2z" />
        </svg>
      </div>

      {/* ── Mechanical Servicing Motif 2 (Bottom Left) ── */}
      <div className="absolute bottom-12 left-4 md:left-12 opacity-[0.04] dark:opacity-[0.07] text-[#FF9500]">
        <svg
          className="w-48 h-48 md:w-64 md:h-64 animate-gear-slow"
          viewBox="0 0 100 100"
          fill="currentColor"
        >
          <path d="M50 35a15 15 0 1 0 0 30 15 15 0 0 0 0-30z" />
          <path d="M93 45.5l-6.8-.7c-.5-2.4-1.3-4.6-2.4-6.7l4.5-5.1c1.2-1.4 1-3.5-.3-4.7l-5.7-5.7c-1.2-1.2-3.3-1.4-4.7-.3l-5.1 4.5c-2.1-1.1-4.3-1.9-6.7-2.4l-.7-6.8C65.6 15 64 14 62.3 14h-8.1c-1.8 0-3.3 1.2-3.5 3l-.7 6.8c-2.4.5-4.6 1.3-6.7 2.4l-5.1-4.5c-1.4-1.2-3.5-1-4.7.3l-5.7 5.7c-1.2 1.2-1.4 3.3-.3 4.7l4.5 5.1c-1.1 2.1-1.9 4.3-2.4 6.7l-6.8.7C15 47.4 14 49 14 50.8v8.1c0 1.8 1.2 3.3 3 3.5l6.8.7c.5 2.4 1.3 4.6 2.4 6.7l-4.5 5.1c-1.2 1.4-1 3.5.3 4.7l5.7 5.7c1.2 1.2 3.3 1.4 4.7.3l5.1-4.5c2.1 1.1 4.3 1.9 6.7 2.4l.7 6.8c.2 1.8 1.7 3 3.5 3h8.1c1.8 0 3.3-1.2 3.5-3l.7-6.8c2.4-.5 4.6-1.3 6.7-2.4l5.1 4.5c1.4 1.2 3.5 1 4.7-.3l5.7-5.7c1.2-1.2 1.4-3.3.3-4.7l-4.5-5.1c1.1-2.1 1.9-4.3 2.4-6.7l6.8-.7c1.8-.2 3-1.7 3-3.5v-8.1c0-1.8-1.2-3.3-3-3.5z" />
        </svg>
      </div>

      {/* ── Floating Wrench & Diagnostics Spanner Icon (Mid Left) ── */}
      <div className="absolute top-[32%] left-[4%] opacity-[0.05] dark:opacity-[0.09] text-[#0071E3] animate-float-service hidden sm:block">
        <svg className="w-20 h-20 md:w-28 md:h-28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>

      {/* ── Floating Gauge / Speedometer & Battery Diagnostics (Mid Right) ── */}
      <div className="absolute top-[58%] right-[6%] opacity-[0.05] dark:opacity-[0.09] text-[#34C759] animate-float-service-alt hidden sm:block">
        <svg className="w-20 h-20 md:w-28 md:h-28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 14 4-4" />
          <path d="M3.34 19a10 10 0 1 1 17.32 0" />
        </svg>
      </div>
    </div>
  );
}
