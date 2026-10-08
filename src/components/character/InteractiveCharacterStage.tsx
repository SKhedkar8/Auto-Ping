'use client';

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Sparkles, MessageCircle, Heart, Zap } from 'lucide-react';
import { CharacterDef } from '@/lib/characterData';
import { playCarSound } from '@/lib/characterVoice';

interface InteractiveCharacterStageProps {
  character: CharacterDef;
  dialogue: string;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  sceneState: 'entrance' | 'idle' | 'driving' | 'happy' | 'thinking';
  sceneName?: string;
}

export default function InteractiveCharacterStage({
  character,
  dialogue,
  isSpeaking,
  voiceEnabled,
  onToggleVoice,
  sceneState,
  sceneName = 'Radiator Springs Garage',
}: InteractiveCharacterStageProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [pokeCount, setPokeCount] = useState(0);
  const [eyeDirection, setEyeDirection] = useState<'center' | 'left' | 'right'>('center');
  const [mouthPhase, setMouthPhase] = useState(0);

  // Natural blinking timer
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 180);
    }, 3800 + Math.random() * 2000);
    return () => clearInterval(blinkInterval);
  }, []);

  // Occasional eye glance
  useEffect(() => {
    const lookInterval = setInterval(() => {
      const dirs: ('center' | 'left' | 'right')[] = ['center', 'left', 'right', 'center'];
      const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
      setEyeDirection(nextDir);
      setTimeout(() => setEyeDirection('center'), 1400);
    }, 4500);
    return () => clearInterval(lookInterval);
  }, []);

  // Animated mouth/grille movement when speaking
  useEffect(() => {
    if (!isSpeaking) {
      setMouthPhase(0);
      return;
    }
    const mouthInterval = setInterval(() => {
      setMouthPhase((prev) => (prev + 1) % 4);
    }, 110);
    return () => clearInterval(mouthInterval);
  }, [isSpeaking]);

  // Handle user poke / tap (Talking Tom interaction!)
  const handlePoke = () => {
    setIsPoked(true);
    setPokeCount((prev) => prev + 1);
    playCarSound('honk');
    setTimeout(() => {
      setIsPoked(false);
    }, 800);
  };

  return (
    <div className="relative w-full flex flex-col items-center select-none overflow-hidden py-2">
      {/* ── Environment Backdrop ── */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden opacity-30 dark:opacity-20">
        <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-black/20 to-transparent" />
        {/* Asphalt road line */}
        <div className="absolute bottom-6 inset-x-0 h-1.5 bg-dashed border-b-2 border-dashed border-amber-400/60" />
      </div>

      {/* ── Scene Location Pill ── */}
      <div className="z-10 mb-2 flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-300">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Scene: {sceneName}</span>
      </div>

      {/* ── Character Speech Bubble ── */}
      <div className="z-20 w-full max-w-lg px-4 mb-3">
        <div className="relative p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border-2 border-black/10 dark:border-white/15 shadow-xl transition-all duration-300">
          {/* Arrow pointing down to character */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1c1c1e] border-r-2 border-b-2 border-black/10 dark:border-white/15 rotate-45" />

          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ${
                character.id === 'mcqueen'
                  ? 'bg-red-600'
                  : character.id === 'mater'
                  ? 'bg-amber-700'
                  : character.id === 'sally'
                  ? 'bg-blue-600'
                  : 'bg-emerald-600'
              }`}
            >
              {character.name.charAt(0)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[12px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                  {character.name}
                </span>

                {/* Voice toggle badge */}
                <button
                  type="button"
                  onClick={onToggleVoice}
                  title={voiceEnabled ? 'Mute Character Voice' : 'Enable Character Voice'}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    voiceEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>Voice ON</span>
                      {isSpeaking && (
                        <span className="flex items-center gap-0.5 ml-1">
                          <span className="w-1 h-2 bg-emerald-500 animate-pulse" />
                          <span className="w-1 h-3 bg-emerald-500 animate-pulse delay-75" />
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3 h-3" />
                      <span>Voice OFF</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-[13px] sm:text-[14px] leading-relaxed text-slate-800 dark:text-slate-200 font-medium tracking-tight">
                {dialogue || character.intro}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── TALKING TOM STYLE ANIMATED CHARACTER STAGE ── */}
      <div
        className={`relative z-20 cursor-pointer transition-transform duration-300 ${
          sceneState === 'driving'
            ? 'animate-bounce translate-x-24 opacity-80 scale-95'
            : isPoked
            ? 'scale-110 -rotate-3'
            : 'hover:scale-[1.03]'
        }`}
        onClick={handlePoke}
        title="Tap or click to interact with the character!"
      >
        {/* Floating Poke Hearts / Sparkles on Tap */}
        {isPoked && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-rose-500 font-bold text-sm pointer-events-none animate-bounce z-40 bg-white/90 dark:bg-black/80 px-3 py-1 rounded-full shadow-lg border border-rose-300">
            <Heart className="w-4 h-4 fill-rose-500 animate-ping" />
            <span>Honk! Beep Beep! 🚗</span>
          </div>
        )}

        {/* Character Card Base Frame */}
        <div
          className={`relative w-48 sm:w-56 h-48 sm:h-56 rounded-3xl overflow-hidden bg-white dark:bg-[#161617] border-4 shadow-2xl transition-all duration-300 ${
            isSpeaking ? 'ring-4 ring-offset-2 ring-emerald-500/50' : ''
          }`}
          style={{ borderColor: character.color }}
        >
          {/* Real Character Image from Master Artwork */}
          <img
            src={character.image}
            alt={character.name}
            className={`w-full h-full object-cover transition-transform duration-200 ${
              isSpeaking ? 'scale-[1.03]' : ''
            }`}
          />

          {/* Windshield Animated Eyes Overlay */}
          <div className="absolute top-[28%] left-[26%] w-[48%] h-[26%] pointer-events-none flex items-center justify-center gap-2">
            {/* Left Eye */}
            <div
              className={`relative w-5 h-6 rounded-full bg-white border border-black/30 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-100 ${
                isBlinking ? 'h-0.5 bg-black' : ''
              }`}
            >
              {!isBlinking && (
                <div
                  className={`w-3 h-3.5 rounded-full bg-slate-900 transition-all duration-200 flex items-center justify-center ${
                    eyeDirection === 'left'
                      ? '-translate-x-1'
                      : eyeDirection === 'right'
                      ? 'translate-x-1'
                      : ''
                  }`}
                  style={{
                    backgroundColor: character.id === 'sally' ? '#2563EB' : character.id === 'mater' ? '#059669' : '#0284C7',
                  }}
                >
                  {/* Pupil light catch */}
                  <div className="w-1 h-1 rounded-full bg-white -translate-x-0.5 -translate-y-0.5" />
                </div>
              )}
            </div>

            {/* Right Eye */}
            <div
              className={`relative w-5 h-6 rounded-full bg-white border border-black/30 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-100 ${
                isBlinking ? 'h-0.5 bg-black' : ''
              }`}
            >
              {!isBlinking && (
                <div
                  className={`w-3 h-3.5 rounded-full bg-slate-900 transition-all duration-200 flex items-center justify-center ${
                    eyeDirection === 'left'
                      ? '-translate-x-1'
                      : eyeDirection === 'right'
                      ? 'translate-x-1'
                      : ''
                  }`}
                  style={{
                    backgroundColor: character.id === 'sally' ? '#2563EB' : character.id === 'mater' ? '#059669' : '#0284C7',
                  }}
                >
                  {/* Pupil light catch */}
                  <div className="w-1 h-1 rounded-full bg-white -translate-x-0.5 -translate-y-0.5" />
                </div>
              )}
            </div>
          </div>

          {/* Grille Animated Mouth Overlay when Speaking */}
          {isSpeaking && (
            <div className="absolute bottom-[24%] left-[34%] w-[32%] h-4 pointer-events-none flex items-center justify-center">
              <div
                className="w-full bg-slate-900 rounded-full border border-white/40 transition-all duration-100 flex items-center justify-center"
                style={{
                  height: mouthPhase === 1 ? '12px' : mouthPhase === 2 ? '15px' : mouthPhase === 3 ? '10px' : '6px',
                }}
              >
                {/* Teeth flash */}
                <div className="w-[60%] h-1 bg-white rounded-xs opacity-90" />
              </div>
            </div>
          )}

          {/* Headlights Glow / Beam */}
          <div className="absolute bottom-3 inset-x-2 flex justify-between px-3 pointer-events-none opacity-80">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_12px_#FBBF24]" />
            <span className="w-3.5 h-3.5 rounded-full bg-amber-300 shadow-[0_0_12px_#FBBF24]" />
          </div>

          {/* Tap-me Hint Badge */}
          <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-full opacity-80">
            Tap Me 🚗
          </div>
        </div>

        {/* Chassis Shadow beneath car */}
        <div className="w-40 sm:w-48 h-4 mx-auto rounded-full bg-black/30 dark:bg-black/60 blur-xs mt-1" />
      </div>
    </div>
  );
}
