'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, Bot, ShieldCheck } from 'lucide-react';
import PitCrewVoiceAssistant from '@/components/character/PitCrewVoiceAssistant';

export default function AssistantPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-black text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Navigation / Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pit-Crew Pronto Voice AI</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Gemini API Powered</span>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Meet Pit-Crew Pronto 🏎️
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Your excitable, Italian-flavored garage mechanic! Speak into your microphone, listen to voice replies, and watch his cartoon car avatar react and faint!
          </p>
        </div>

        {/* Main Voice Assistant Component */}
        <PitCrewVoiceAssistant />
      </div>
    </div>
  );
}
