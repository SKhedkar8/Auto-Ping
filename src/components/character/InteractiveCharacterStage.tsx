'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles, Heart, Zap, Flame, Radio } from 'lucide-react';
import { CharacterDef } from '@/lib/characterData';
import { playCarSound, speakDialogue } from '@/lib/characterVoice';

interface InteractiveCharacterStageProps {
  character: CharacterDef;
  dialogue: string;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  sceneState: 'entrance' | 'idle' | 'driving' | 'happy' | 'thinking';
  sceneName?: string;
  onTriggerEntrance?: () => void;
}

interface FeatureCoords {
  eyes: { top: string; left: string; width: string; height: string };
  mouth: { top: string; left: string; width: string; height: string };
  eyeColor: string;
}

// Calibrated windshield eyes and bumper mouth coordinates for Pixar Cars
const CHARACTER_FEATURE_MAP: Record<string, FeatureCoords> = {
  schumacher: {
    // Michael Schumacher Ferrari F430
    eyes: { top: '23%', left: '32%', width: '45%', height: '23%' },
    mouth: { top: '63%', left: '41%', width: '36%', height: '20%' },
    eyeColor: '#22D3EE', // Light sky cyan eyes
  },
  mcqueen: {
    // Lightning McQueen #95
    eyes: { top: '13%', left: '26%', width: '50%', height: '23%' },
    mouth: { top: '51%', left: '30%', width: '54%', height: '24%' },
    eyeColor: '#0284C7', // Racing Blue
  },
  mater: {
    eyes: { top: '20%', left: '27%', width: '48%', height: '22%' },
    mouth: { top: '56%', left: '31%', width: '50%', height: '26%' },
    eyeColor: '#16A34A',
  },
  sally: {
    eyes: { top: '18%', left: '31%', width: '47%', height: '21%' },
    mouth: { top: '58%', left: '37%', width: '44%', height: '21%' },
    eyeColor: '#38BDF8',
  },
  cruz: {
    eyes: { top: '16%', left: '29%', width: '49%', height: '22%' },
    mouth: { top: '55%', left: '34%', width: '47%', height: '22%' },
    eyeColor: '#D97706',
  },
  holley: {
    eyes: { top: '16%', left: '31%', width: '47%', height: '22%' },
    mouth: { top: '58%', left: '37%', width: '43%', height: '21%' },
    eyeColor: '#8B5CF6',
  },
  finn: {
    eyes: { top: '18%', left: '31%', width: '47%', height: '22%' },
    mouth: { top: '57%', left: '35%', width: '47%', height: '22%' },
    eyeColor: '#0D9488',
  },
  doc: {
    eyes: { top: '16%', left: '27%', width: '51%', height: '22%' },
    mouth: { top: '57%', left: '31%', width: '53%', height: '22%' },
    eyeColor: '#2563EB',
  },
  king: {
    eyes: { top: '21%', left: '29%', width: '49%', height: '22%' },
    mouth: { top: '59%', left: '33%', width: '49%', height: '21%' },
    eyeColor: '#0284C7',
  },
  chick: {
    eyes: { top: '18%', left: '27%', width: '51%', height: '22%' },
    mouth: { top: '55%', left: '29%', width: '53%', height: '23%' },
    eyeColor: '#15803D',
  },
  sarge: {
    eyes: { top: '19%', left: '29%', width: '49%', height: '22%' },
    mouth: { top: '59%', left: '31%', width: '51%', height: '23%' },
    eyeColor: '#65A30D',
  },
};

const CHARACTER_CATCHPHRASES: Record<string, string> = {
  schumacher: 'Lightning McQueen told me this was the best place in the world to get tires.',
  mcqueen: 'Ka-Chow! Speed, I am speed!',
  mater: 'Dad-gum! Larry Tow Mater, partner!',
  sally: 'Precision performance, scenic comfort.',
  cruz: 'Use that motivation! Peak telemetry locked in!',
  holley: 'Diagnostic telemetry scan initialized.',
  finn: 'A gentleman never compromises on standard maintenance.',
  doc: 'Turn right to go left, kid. Respect the craft.',
  king: 'Pit-stop consistency wins championships.',
  chick: 'Ka-Chicka! Ka-Chicka! Number 86!',
  sarge: 'Attention soldier! Vehicle maintenance readiness!',
};

export default function InteractiveCharacterStage({
  character,
  dialogue,
  isSpeaking,
  voiceEnabled,
  onToggleVoice,
  sceneState,
  sceneName = 'Radiator Springs — Casa Della Tires',
}: InteractiveCharacterStageProps) {
  // Animation physics states
  const [isDrivingIn, setIsDrivingIn] = useState(true);
  const [showTireSmoke, setShowTireSmoke] = useState(false);
  const [showExhaustPop, setShowExhaustPop] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPoked, setIsPoked] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<'center' | 'left' | 'right' | 'up'>('center');
  const [visemePhase, setVisemePhase] = useState(0); // 0=rest smile, 1=open-A, 2=smile-E, 3=round-O, 4=closed-M
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const prevCharId = useRef(character.id);

  const featureCoords =
    CHARACTER_FEATURE_MAP[character.id] || CHARACTER_FEATURE_MAP.schumacher;

  // ── Drive-In Arrival Sequence with Braking Dive & Suspension Settle ──
  const runEntranceAnimation = () => {
    setIsDrivingIn(true);
    setShowTireSmoke(true);

    // Initial throttle approach sound
    if (character.id === 'schumacher') {
      playCarSound('ferrari_rev');
    } else {
      playCarSound('vroom');
    }

    // High friction brake skid into center stage
    setTimeout(() => {
      playCarSound('skid');
    }, 600);

    // Settle into idle stance with gentle spring rebound
    setTimeout(() => {
      setIsDrivingIn(false);
      setShowTireSmoke(false);
    }, 1200);
  };

  useEffect(() => {
    runEntranceAnimation();
  }, []);

  useEffect(() => {
    if (prevCharId.current !== character.id) {
      prevCharId.current = character.id;
      runEntranceAnimation();
    }
  }, [character.id]);

  // ── Pixar Eye Blinking (with natural double-blink probability) ──
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        // 35% chance of an authentic conversational double-blink
        if (Math.random() < 0.35) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 130);
          }, 110);
        }
      }, 150);
    }, 3200 + Math.random() * 2400);

    return () => clearInterval(blinkInterval);
  }, []);

  // ── Eye Saccades (Looking at audience, glancing around thoughtfully) ──
  useEffect(() => {
    if (sceneState === 'thinking') {
      setEyeDirection('up');
      return;
    }

    const glanceInterval = setInterval(() => {
      const dirs: ('center' | 'left' | 'right' | 'center')[] = [
        'center',
        'left',
        'right',
        'center',
      ];
      const nextDir = dirs[Math.floor(Math.random() * dirs.length)];
      setEyeDirection(nextDir);
      setTimeout(() => setEyeDirection('center'), 1600);
    }, 4000);

    return () => clearInterval(glanceInterval);
  }, [sceneState]);

  // ── Organic Pixar Viseme Mouth Articulation synced to Speech ──
  useEffect(() => {
    if (!isSpeaking) {
      setVisemePhase(0);
      return;
    }

    // Realistic speech viseme rhythm: transitions through phoneme mouth shapes
    const visemeSequence = [1, 2, 1, 3, 2, 4, 1, 2];
    let idx = 0;

    const interval = setInterval(() => {
      idx = (idx + 1) % visemeSequence.length;
      setVisemePhase(visemeSequence[idx]);
    }, 115);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // ── Interactive Poke / Tap ──
  const handlePoke = () => {
    setIsPoked(true);
    setActiveAction('honk');
    playCarSound('honk');
    setTimeout(() => {
      setIsPoked(false);
      setActiveAction(null);
    }, 650);
  };

  // ── Throttle Rev Action ──
  const handleRevEngine = () => {
    setActiveAction('rev');
    setShowExhaustPop(true);

    if (character.id === 'schumacher') {
      playCarSound('ferrari_rev');
    } else {
      playCarSound('rev');
    }

    setTimeout(() => {
      setShowExhaustPop(false);
    }, 550);

    setTimeout(() => {
      setActiveAction(null);
    }, 1000);
  };

  // ── Dialogue Actions ──
  const handleSayCatchphrase = () => {
    const phrase = CHARACTER_CATCHPHRASES[character.id] || character.quote;
    playCarSound('chime');
    speakDialogue(phrase, character.id, {
      enabled: voiceEnabled,
    });
  };

  const handleSayItalianLine = () => {
    const italianPhrase =
      'Spero che il tuo amico si riprenda presto. Mi dicono che siete fantastici!';
    playCarSound('italian_fanfare');
    speakDialogue(italianPhrase, 'schumacher', {
      enabled: voiceEnabled,
    });
  };

  const eyeColor = featureCoords.eyeColor;

  return (
    <div className="relative w-full flex flex-col items-center select-none overflow-hidden py-2">
      {/* ── Environment Stage Backdrop (Radiator Springs / Casa Della Tires Track) ── */}
      <div className="absolute inset-0 pointer-events-none rounded-3xl overflow-hidden opacity-40 dark:opacity-25">
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-950/40 via-slate-900/10 to-transparent" />
        {/* Asphalt Road line with tire skid marks */}
        <div className="absolute bottom-8 inset-x-0 h-2 border-b-2 border-dashed border-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.35)]" />
      </div>

      {/* ── Scene Header & Status Indicator ── */}
      <div className="z-10 mb-2 flex items-center justify-between w-full max-w-lg px-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10 text-[11px] font-medium text-slate-700 dark:text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Scene: {sceneName}</span>
        </div>

        {/* Zoom In Replay trigger */}
        <button
          type="button"
          onClick={runEntranceAnimation}
          className="text-[11px] font-semibold text-[#0071E3] dark:text-[#2997FF] hover:underline flex items-center gap-1.5 transition-all"
          title="Watch the car drive in from the side with braking suspension squash"
        >
          <span>🏎️ Zoom In</span>
        </button>
      </div>

      {/* ── Character Speech Bubble ── */}
      <div className="z-20 w-full max-w-lg px-2 sm:px-4 mb-3">
        <div className="relative p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border-2 border-black/10 dark:border-white/15 shadow-xl transition-all duration-300">
          {/* Arrow pointing down to car windshield */}
          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-[#1c1c1e] border-r-2 border-b-2 border-black/10 dark:border-white/15 rotate-45" />

          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md ring-2 ring-white/20"
              style={{ backgroundColor: character.color }}
            >
              {character.name.charAt(0)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {character.name}
                  </span>
                  <span className="text-[10px] text-[#86868b] truncate max-w-[130px]">
                    {character.title}
                  </span>
                </div>

                {/* Voice toggle button */}
                <button
                  type="button"
                  onClick={onToggleVoice}
                  title={voiceEnabled ? 'Mute Character Voice' : 'Enable Character Voice'}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition-all ${
                    voiceEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {voiceEnabled ? (
                    <>
                      <Volume2 className="w-3 h-3 text-emerald-500" />
                      <span>Original Voice ON</span>
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

      {/* ── TALKING CARS ANIMATED CHARACTER STAGE ── */}
      <div className="relative z-20 flex flex-col items-center">
        {/* Tire Skid Smoke particles during drive-in entrance */}
        {showTireSmoke && (
          <div className="absolute -bottom-2 -left-8 z-30 pointer-events-none flex gap-2">
            <span className="w-10 h-10 rounded-full bg-slate-300/70 dark:bg-slate-600/70 blur-xs animate-tire-smoke" />
            <span className="w-12 h-12 rounded-full bg-slate-200/60 dark:bg-slate-500/60 blur-sm animate-tire-smoke delay-100" />
          </div>
        )}

        {/* Dual Exhaust Flame Pop when Revving */}
        {showExhaustPop && (
          <div className="absolute bottom-6 -right-6 z-30 pointer-events-none flex items-center gap-1 animate-exhaust-pop">
            <span className="w-4 h-4 rounded-full bg-amber-400 blur-xs" />
            <span className="w-6 h-6 rounded-full bg-orange-500 blur-sm" />
            <span className="w-3 h-3 rounded-full bg-red-600" />
          </div>
        )}

        {/* ── Interactive Chassis Container with Organic Movie Physics ── */}
        <div
          className={`relative cursor-pointer select-none transition-transform duration-200 ${
            isDrivingIn
              ? 'animate-car-drive-in'
              : activeAction === 'rev'
              ? 'animate-car-rev'
              : isPoked || activeAction === 'honk'
              ? 'animate-car-honk'
              : sceneState === 'happy'
              ? 'animate-car-victory'
              : isSpeaking
              ? 'animate-car-speaking'
              : 'animate-car-idle hover:scale-[1.02]'
          }`}
          onClick={handlePoke}
          title="Tap on the character to honk and interact!"
        >
          {/* Floating Interaction Bubble on Tap */}
          {isPoked && (
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-rose-500 font-bold text-xs pointer-events-none z-50 bg-white dark:bg-black/90 px-3 py-1.5 rounded-full shadow-xl border border-rose-200 dark:border-rose-900 animate-bounce">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              <span>Honk! Beep-Beep! 🚗💨</span>
            </div>
          )}

          {/* Real Character Card Frame with Movie Aesthetic */}
          <div
            className={`relative w-64 sm:w-80 h-52 sm:h-64 rounded-3xl overflow-hidden bg-white dark:bg-[#161617] border-4 shadow-2xl transition-all duration-300 ${
              isSpeaking
                ? 'ring-4 ring-offset-2 ring-emerald-500/60 shadow-emerald-500/20'
                : ''
            }`}
            style={{ borderColor: character.color }}
          >
            {/* Real Character Image */}
            <img
              src={character.image}
              alt={character.name}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isSpeaking ? 'scale-[1.02]' : ''
              }`}
            />

            {/* ══════════════════════════════════════════════
                1. INTEGRATED WINDSHIELD ANIMATED EYES
                Eyes situated right on the car windshield
                ══════════════════════════════════════════════ */}
            <div
              className="absolute pointer-events-none flex items-center justify-center gap-2 z-30"
              style={{
                top: featureCoords.eyes.top,
                left: featureCoords.eyes.left,
                width: featureCoords.eyes.width,
                height: featureCoords.eyes.height,
              }}
            >
              {/* Left Eye on Windshield */}
              <div
                className={`relative w-7 sm:w-8 h-8 sm:h-9 rounded-full bg-white border border-black/40 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-100 ${
                  isBlinking
                    ? 'h-0.5 bg-black border-none'
                    : sceneState === 'happy'
                    ? 'h-5 rounded-t-full'
                    : ''
                }`}
              >
                {!isBlinking && (
                  <>
                    {/* Upper Eyelid Hood (matching car paint color & confident slant) */}
                    <div
                      className="absolute top-0 inset-x-0 h-2 sm:h-2.5 z-10 transition-all"
                      style={{
                        backgroundColor: character.color,
                        opacity: 0.9,
                        clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)',
                      }}
                    />

                    {/* Iris & Pupil */}
                    <div
                      className={`relative w-4 sm:w-4.5 h-5 sm:h-5.5 rounded-full transition-transform duration-200 flex items-center justify-center ${
                        eyeDirection === 'left'
                          ? '-translate-x-1.5'
                          : eyeDirection === 'right'
                          ? 'translate-x-1.5'
                          : eyeDirection === 'up'
                          ? '-translate-y-1'
                          : ''
                      }`}
                      style={{ backgroundColor: eyeColor }}
                    >
                      {/* Deep pupil center */}
                      <div className="w-2.5 h-3 rounded-full bg-black flex items-start justify-start p-0.5">
                        {/* Pixar key corneal catchlight glint */}
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Eye on Windshield */}
              <div
                className={`relative w-7 sm:w-8 h-8 sm:h-9 rounded-full bg-white border border-black/40 shadow-inner flex items-center justify-center overflow-hidden transition-all duration-100 ${
                  isBlinking
                    ? 'h-0.5 bg-black border-none'
                    : sceneState === 'happy'
                    ? 'h-5 rounded-t-full'
                    : ''
                }`}
              >
                {!isBlinking && (
                  <>
                    {/* Upper Eyelid Hood (matching car paint color & confident slant) */}
                    <div
                      className="absolute top-0 inset-x-0 h-2 sm:h-2.5 z-10 transition-all"
                      style={{
                        backgroundColor: character.color,
                        opacity: 0.9,
                        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 70%)',
                      }}
                    />

                    {/* Iris & Pupil */}
                    <div
                      className={`relative w-4 sm:w-4.5 h-5 sm:h-5.5 rounded-full transition-transform duration-200 flex items-center justify-center ${
                        eyeDirection === 'left'
                          ? '-translate-x-1.5'
                          : eyeDirection === 'right'
                          ? 'translate-x-1.5'
                          : eyeDirection === 'up'
                          ? '-translate-y-1'
                          : ''
                      }`}
                      style={{ backgroundColor: eyeColor }}
                    >
                      {/* Deep pupil center */}
                      <div className="w-2.5 h-3 rounded-full bg-black flex items-start justify-start p-0.5">
                        {/* Pixar key corneal catchlight glint */}
                        <div className="w-1.5 h-1.5 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════
                2. INTEGRATED BUMPER/GRILLE PIXAR MOUTH
                Morphs dynamically through visemes while speaking
                and returns to a suave resting smile when idle
                ══════════════════════════════════════════════ */}
            <div
              className="absolute pointer-events-none flex items-center justify-center z-30"
              style={{
                top: featureCoords.mouth.top,
                left: featureCoords.mouth.left,
                width: featureCoords.mouth.width,
                height: featureCoords.mouth.height,
              }}
            >
              {isSpeaking ? (
                /* Dynamic Talking Viseme Mouth */
                <div
                  className="w-full transition-all duration-100 flex flex-col items-center justify-center overflow-hidden rounded-full border-2 border-white/60 shadow-lg"
                  style={{
                    backgroundColor: '#160909',
                    height:
                      visemePhase === 1
                        ? '18px' // Open 'Ah'
                        : visemePhase === 2
                        ? '15px' // Smile 'Ee'
                        : visemePhase === 3
                        ? '20px' // Round 'Oo'
                        : '8px', // Closed 'M'
                    width:
                      visemePhase === 3
                        ? '65%' // Narrow rounded
                        : visemePhase === 2
                        ? '95%' // Wide stretched smile
                        : '88%',
                  }}
                >
                  {/* Pearly White Upper Teeth Line */}
                  <div className="w-[85%] h-1.5 bg-white rounded-t-xs shadow-xs opacity-95" />

                  {/* Tongue flash visible on open vowels */}
                  {(visemePhase === 1 || visemePhase === 3) && (
                    <div className="w-4 h-2 bg-rose-500 rounded-t-full mt-0.5 shadow-inner" />
                  )}

                  {/* Lower teeth line for smiling speech */}
                  {visemePhase === 2 && (
                    <div className="w-[60%] h-0.5 bg-white/80 rounded-b-xs mt-0.5" />
                  )}
                </div>
              ) : (
                /* Suave Resting Ferrari Smile (Schumacher charm) */
                <div className="w-full flex items-center justify-center">
                  <div
                    className="h-1.5 rounded-full border-b-2 border-black/40 shadow-xs transition-all duration-300"
                    style={{
                      width: '75%',
                      backgroundColor: 'rgba(0,0,0,0.4)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Headlights Glow / Beam flares up when speaking */}
            <div className="absolute bottom-3 inset-x-3 flex justify-between px-2 pointer-events-none">
              <span
                className={`w-3.5 h-3.5 rounded-full bg-amber-300 transition-all duration-300 ${
                  isSpeaking
                    ? 'shadow-[0_0_18px_#FBBF24] scale-110'
                    : 'shadow-[0_0_8px_#FBBF24]'
                }`}
              />
              <span
                className={`w-3.5 h-3.5 rounded-full bg-amber-300 transition-all duration-300 ${
                  isSpeaking
                    ? 'shadow-[0_0_18px_#FBBF24] scale-110'
                    : 'shadow-[0_0_8px_#FBBF24]'
                }`}
              />
            </div>

            {/* Interactive Tap Hint Badge */}
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-full opacity-80">
              Tap Me 🚗
            </div>
          </div>

          {/* Dynamic Chassis Ground Shadow (scales with suspension travel) */}
          <div
            className={`h-4 mx-auto rounded-full bg-black/40 dark:bg-black/70 blur-xs mt-1 transition-all duration-200 ${
              isPoked
                ? 'w-44 scale-90 opacity-60'
                : isSpeaking
                ? 'w-56 sm:w-72 scale-100 opacity-80'
                : 'w-52 sm:w-68 scale-98 opacity-70'
            }`}
          />
        </div>

        {/* ── INTERACTIVE ACTION BAR (Drive In, Rev, Honk, Movie Scene Lines) ── */}
        <div className="mt-3 flex items-center flex-wrap justify-center gap-1.5">
          <button
            type="button"
            onClick={runEntranceAnimation}
            className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 apple-btn"
            title="Drive in from side of screen with braking dive"
          >
            <span>🏎️ Drive In</span>
          </button>

          <button
            type="button"
            onClick={handleRevEngine}
            className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 apple-btn"
            title="Rev engine with high-performance V8 roar"
          >
            <Flame className="w-3 h-3 text-orange-500" />
            <span>Rev V8</span>
          </button>

          <button
            type="button"
            onClick={handlePoke}
            className="px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-1 apple-btn"
            title="Friendly car honk"
          >
            <span>🎺 Honk</span>
          </button>

          {/* Movie Scene Line 1 (Best Tire Shop) */}
          <button
            type="button"
            onClick={handleSayCatchphrase}
            className="px-2.5 py-1 rounded-full bg-[#0071E3]/10 dark:bg-[#0071E3]/20 hover:bg-[#0071E3]/20 text-[11px] font-semibold text-[#0071E3] dark:text-[#2997FF] transition-all flex items-center gap-1 apple-btn"
            title="Speak character catchphrase"
          >
            <Zap className="w-3 h-3" />
            <span>
              {character.id === 'schumacher' ? '🇮🇹 Best Tire Shop' : 'Movie Catchphrase'}
            </span>
          </button>

          {/* Authentic Italian Dialogue Button for Michael Schumacher Ferrari */}
          {character.id === 'schumacher' && (
            <button
              type="button"
              onClick={handleSayItalianLine}
              className="px-2.5 py-1 rounded-full bg-red-600/10 dark:bg-red-600/20 hover:bg-red-600/20 text-[11px] font-semibold text-red-600 dark:text-red-400 transition-all flex items-center gap-1 apple-btn border border-red-500/20"
              title="Speak Italian line from Casa Della Tires movie scene"
            >
              <span>🏎️ Spero che... (Italian)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
