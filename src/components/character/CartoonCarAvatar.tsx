'use client';

import React, { useEffect, useState } from 'react';

interface CartoonCarAvatarProps {
  isSpeaking: boolean;
  isFainted: boolean;
  onRecover?: () => void;
  visemePhase?: number; // 0=rest smile, 1=open, 2=wide smile, 3=round
}

export default function CartoonCarAvatar({
  isSpeaking,
  isFainted,
  onRecover,
  visemePhase = 0,
}: CartoonCarAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [eyeDirection, setEyeDirection] = useState<'center' | 'left' | 'right'>('center');

  // Eye blinking cycle
  useEffect(() => {
    if (isFainted) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
        if (Math.random() < 0.3) {
          setTimeout(() => {
            setIsBlinking(true);
            setTimeout(() => setIsBlinking(false), 120);
          }, 100);
        }
      }, 150);
    }, 3200 + Math.random() * 2000);

    return () => clearInterval(interval);
  }, [isFainted]);

  // Subtle eye movement
  useEffect(() => {
    if (isFainted) return;
    const interval = setInterval(() => {
      const dirs: ('center' | 'left' | 'right')[] = ['center', 'left', 'right', 'center'];
      setEyeDirection(dirs[Math.floor(Math.random() * dirs.length)]);
    }, 3500);

    return () => clearInterval(interval);
  }, [isFainted]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* ── Dizzy Orbiting Stars when Fainted ── */}
      {isFainted && (
        <div className="absolute -top-6 z-40 flex items-center gap-3 animate-bounce">
          <span className="text-2xl animate-spin">💫</span>
          <span className="text-xl animate-pulse">⭐</span>
          <span className="text-2xl animate-spin delay-150">💫</span>
        </div>
      )}

      {/* ── Cartoon Car Main Body Container ── */}
      <div
        className={`relative transition-all duration-700 ease-out ${
          isFainted
            ? 'rotate-[85deg] translate-y-12 translate-x-6 scale-95 origin-bottom-right'
            : isSpeaking
            ? 'animate-car-speaking'
            : 'animate-car-idle hover:scale-[1.02]'
        }`}
      >
        {/* SVG Cartoon Car Face */}
        <svg
          viewBox="0 0 340 250"
          className="w-72 sm:w-88 h-56 sm:h-64 drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Ground drop shadow */}
          <ellipse
            cx="170"
            cy="238"
            rx={isFainted ? '80' : '135'}
            ry="10"
            fill="black"
            fillOpacity="0.28"
            className="transition-all duration-500"
          />

          {/* ── Left & Right Tires (Black rubber with silver rim) ── */}
          <rect x="24" y="160" width="42" height="74" rx="14" fill="#1C1917" />
          <rect x="30" y="172" width="30" height="50" rx="8" fill="#44403C" />
          <circle cx="45" cy="197" r="8" fill="#D6D3D1" />

          <rect x="274" y="160" width="42" height="74" rx="14" fill="#1C1917" />
          <rect x="280" y="172" width="30" height="50" rx="8" fill="#44403C" />
          <circle cx="295" cy="197" r="8" fill="#D6D3D1" />

          {/* ── Side Mirrors ── */}
          <ellipse cx="38" cy="100" rx="16" ry="11" fill="#DC2626" />
          <ellipse cx="36" cy="100" rx="12" ry="8" fill="#B91C1C" />
          <ellipse cx="302" cy="100" rx="16" ry="11" fill="#DC2626" />
          <ellipse cx="304" cy="100" rx="12" ry="8" fill="#B91C1C" />

          {/* ── Car Body Shell (Sleek red Italian racing coupe) ── */}
          <defs>
            <linearGradient id="bodyPaint" x1="170" y1="20" x2="170" y2="225" gradientUnits="userSpaceOnUse">
              <stop stopColor="#EF4444" />
              <stop offset="0.45" stopColor="#DC2626" />
              <stop offset="1" stopColor="#991B1B" />
            </linearGradient>
            <linearGradient id="windshieldGlass" x1="170" y1="45" x2="170" y2="135" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E0F2FE" />
              <stop offset="0.6" stopColor="#BAE6FD" />
              <stop offset="1" stopColor="#7DD3FC" />
            </linearGradient>
            <linearGradient id="chromeTrim" x1="50" y1="0" x2="290" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#E2E8F0" />
              <stop offset="0.5" stopColor="#FFFFFF" />
              <stop offset="1" stopColor="#CBD5E1" />
            </linearGradient>
          </defs>

          {/* Roof & Main Cabin Arch */}
          <path
            d="M 68 125 C 72 55, 110 22, 170 22 C 230 22, 268 55, 272 125 Z"
            fill="url(#bodyPaint)"
          />

          {/* Windshield Pillar Frame */}
          <path
            d="M 75 122 C 78 62, 115 32, 170 32 C 225 32, 262 62, 265 122 Z"
            fill="#1E293B"
          />

          {/* Windshield Glass Area (Where expressive cartoon eyes live!) */}
          <path
            d="M 80 120 C 84 68, 118 40, 170 40 C 222 40, 256 68, 260 120 Z"
            fill="url(#windshieldGlass)"
            stroke="#38BDF8"
            strokeWidth="2"
          />

          {/* Windshield Gloss Highlight Slant */}
          <path
            d="M 94 116 L 126 50 C 138 46, 148 46, 154 50 L 122 116 Z"
            fill="white"
            fillOpacity="0.32"
          />

          {/* Hood & Fenders */}
          <path
            d="M 45 130 C 45 120, 65 124, 90 126 C 130 128, 210 128, 250 126 C 275 124, 295 120, 295 130 C 298 175, 285 220, 255 224 C 215 228, 125 228, 85 224 C 55 220, 42 175, 45 130 Z"
            fill="url(#bodyPaint)"
            stroke="#B91C1C"
            strokeWidth="2"
          />

          {/* Racing Center Stripes (Italian flag accents) */}
          <path d="M 164 128 L 164 226" stroke="#FFFFFF" strokeWidth="6" opacity="0.9" />
          <path d="M 172 128 L 172 226" stroke="#16A34A" strokeWidth="4" opacity="0.9" />
          <path d="M 158 128 L 158 226" stroke="#DC2626" strokeWidth="4" opacity="0.9" />

          {/* Pit-Crew Pronto Shield Badge on Hood */}
          <circle cx="170" cy="148" r="11" fill="#FEF08A" stroke="#CA8A04" strokeWidth="1.5" />
          <path d="M 166 148 L 174 148 M 170 144 L 170 152" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />

          {/* Headlights (Friendly cartoon eyes-like beams) */}
          <ellipse
            cx="76"
            cy="154"
            rx="16"
            ry="11"
            fill="#FEF08A"
            stroke="#E2E8F0"
            strokeWidth="2"
            className={isSpeaking ? 'filter drop-shadow-[0_0_8px_#FDE047]' : ''}
          />
          <circle cx="76" cy="154" r="5" fill="#FACC15" />

          <ellipse
            cx="264"
            cy="154"
            rx="16"
            ry="11"
            fill="#FEF08A"
            stroke="#E2E8F0"
            strokeWidth="2"
            className={isSpeaking ? 'filter drop-shadow-[0_0_8px_#FDE047]' : ''}
          />
          <circle cx="264" cy="154" r="5" fill="#FACC15" />

          {/* Lower Front Bumper Chrome Lip */}
          <path
            d="M 90 216 C 130 222, 210 222, 250 216"
            stroke="url(#chromeTrim)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* ══════════════════════════════════════════════
              EXPRESSIVE CARTOON EYES ON WINDSHIELD
              Normal / Speaking / Fainting States
              ══════════════════════════════════════════════ */}
          {isFainted ? (
            /* Fainted Comical Dizzy "X X" Eyes */
            <g>
              {/* Left X eye */}
              <line x1="112" y1="72" x2="136" y2="94" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              <line x1="136" y1="72" x2="112" y2="94" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              {/* Right X eye */}
              <line x1="204" y1="72" x2="228" y2="94" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
              <line x1="228" y1="72" x2="204" y2="94" stroke="#0F172A" strokeWidth="5" strokeLinecap="round" />
            </g>
          ) : isBlinking ? (
            /* Blinking Eyelid Lines */
            <g>
              <path d="M 108 85 Q 125 92 142 85" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" fill="none" />
              <path d="M 198 85 Q 215 92 232 85" stroke="#0F172A" strokeWidth="4" strokeLinecap="round" fill="none" />
            </g>
          ) : (
            /* Alive Animated Cartoon Eyes */
            <g>
              {/* Left Eye White */}
              <ellipse cx="125" cy="83" rx="19" ry="24" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              {/* Left Iris & Pupil */}
              <g
                transform={`translate(${
                  eyeDirection === 'left' ? -4 : eyeDirection === 'right' ? 4 : 0
                }, ${isSpeaking ? -1 : 0})`}
              >
                <circle cx="126" cy="84" r="11" fill="#0284C7" />
                <circle cx="126" cy="84" r="7" fill="#0F172A" />
                {/* Dual corneal catchlights */}
                <circle cx="123" cy="80" r="3.5" fill="#FFFFFF" />
                <circle cx="129" cy="87" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Left Eyelid Hood (Charismatic Italian slant) */}
              <path
                d="M 106 72 Q 125 64 144 76"
                stroke="#DC2626"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />

              {/* Right Eye White */}
              <ellipse cx="215" cy="83" rx="19" ry="24" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2.5" />
              {/* Right Iris & Pupil */}
              <g
                transform={`translate(${
                  eyeDirection === 'left' ? -4 : eyeDirection === 'right' ? 4 : 0
                }, ${isSpeaking ? -1 : 0})`}
              >
                <circle cx="214" cy="84" r="11" fill="#0284C7" />
                <circle cx="214" cy="84" r="7" fill="#0F172A" />
                {/* Dual corneal catchlights */}
                <circle cx="211" cy="80" r="3.5" fill="#FFFFFF" />
                <circle cx="217" cy="87" r="1.5" fill="#FFFFFF" />
              </g>

              {/* Right Eyelid Hood (Charismatic Italian slant) */}
              <path
                d="M 196 76 Q 215 64 234 72"
                stroke="#DC2626"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* ══════════════════════════════════════════════
              EXPRESSIVE ANIMATED CARTOON MOUTH (GRILLE)
              Normal Smile / Talking Visemes / Fainting O-Drop
              ══════════════════════════════════════════════ */}
          {isFainted ? (
            /* Fainted Dropped Jaw / Open Shock Mouth */
            <g>
              <ellipse cx="170" cy="188" rx="26" ry="16" fill="#1C1917" stroke="#FFFFFF" strokeWidth="2.5" />
              <path d="M 152 182 Q 170 185 188 182" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
              <ellipse cx="170" cy="194" rx="12" ry="6" fill="#F43F5E" />
            </g>
          ) : isSpeaking ? (
            /* Dynamic Articulating Mouth synced with Speech */
            <g>
              {visemePhase === 1 ? (
                /* Open 'A' / 'O' Vowel */
                <g>
                  <path
                    d="M 136 178 Q 170 174 204 178 Q 200 202 170 204 Q 140 202 136 178 Z"
                    fill="#1C1917"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  {/* Pearly white top teeth */}
                  <path d="M 144 180 Q 170 182 196 180" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                  {/* Tongue */}
                  <ellipse cx="170" cy="198" rx="14" ry="5" fill="#F43F5E" />
                </g>
              ) : visemePhase === 2 ? (
                /* Wide Smiling Speech 'E' / 'S' */
                <g>
                  <path
                    d="M 130 178 Q 170 174 210 178 Q 206 195 170 196 Q 134 195 130 178 Z"
                    fill="#1C1917"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                  />
                  {/* Upper & lower teeth */}
                  <path d="M 136 180 Q 170 182 204 180" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 142 192 Q 170 191 198 192" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
                </g>
              ) : visemePhase === 3 ? (
                /* Rounded 'O' / 'U' */
                <g>
                  <ellipse cx="170" cy="186" rx="16" ry="14" fill="#1C1917" stroke="#FFFFFF" strokeWidth="2.5" />
                  <ellipse cx="170" cy="191" rx="8" ry="4" fill="#F43F5E" />
                </g>
              ) : (
                /* Closed / Consonant 'M' */
                <g>
                  <path
                    d="M 138 182 Q 170 178 202 182 Q 198 188 170 189 Q 142 188 138 182 Z"
                    fill="#1C1917"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                  />
                  <path d="M 144 183 Q 170 184 196 183" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                </g>
              )}
            </g>
          ) : (
            /* Warm, Friendly Resting Cartoon Smile */
            <g>
              <path
                d="M 134 180 Q 170 196 206 180"
                stroke="#1C1917"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Subtle smile dimples at corners */}
              <circle cx="132" cy="179" r="2.5" fill="#991B1B" />
              <circle cx="208" cy="179" r="2.5" fill="#991B1B" />
            </g>
          )}
        </svg>

        {/* Fainting "Recovery" Button overlay when fainted */}
        {isFainted && onRecover && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-50">
            <button
              type="button"
              onClick={onRecover}
              className="px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-xl flex items-center gap-1.5 transition-all animate-bounce"
            >
              <span>Wake Up Pronto! 🏁</span>
            </button>
          </div>
        )}
      </div>

      {/* Avatar Subtitle / Nameplate */}
      <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 dark:bg-white/10 backdrop-blur-md border border-black/10 dark:border-white/10">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
          Pit-Crew Pronto
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          {isFainted ? '💫 Fainted in excitement!' : isSpeaking ? '🗣️ Speaking...' : 'Ready for pit stop'}
        </span>
      </div>
    </div>
  );
}
