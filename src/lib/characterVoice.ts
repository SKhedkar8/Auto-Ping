'use client';

/**
 * Cars Movie Character Voice & Sound FX Engine.
 * Emulates the original Pixar movie "Cars" voices using Web Speech API,
 * dynamic accent and pitch profiling, and Web Audio API synthesizer for engine roars,
 * tire skids, horn honks, and character audio signatures.
 */

export interface CharacterVoiceProfile {
  name: string;
  actorStyle: string;
  pitch: number;
  rate: number;
  lang: string;
  preferredVoiceGender: 'male' | 'female';
  voiceKeywords: string[];
  signatureSound: 'rev' | 'honk' | 'vroom' | 'skid' | 'chime' | 'rumble';
  catchphrase: string;
}

export const CHARACTER_VOICE_PROFILES: Record<string, CharacterVoiceProfile> = {
  schumacher: {
    name: 'Michael Schumacher',
    actorStyle: 'Michael Schumacher - Suave, warm, charismatic Ferrari champion with subtle European charm',
    pitch: 0.98,
    rate: 0.95,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'guy', 'david', 'mark', 'german', 'italian', 'daniel'],
    signatureSound: 'rev',
    catchphrase: 'Lightning McQueen told me this was the best place in the world to get tires.',
  },
  mcqueen: {
    name: 'Lightning McQueen',
    actorStyle: 'Owen Wilson - Energetic, upbeat, confident racer tenor',
    pitch: 1.14,
    rate: 1.08,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'guy', 'david', 'mark', 'google us english', 'us'],
    signatureSound: 'vroom',
    catchphrase: 'Ka-Chow! Speed, I am speed!',
  },
  mater: {
    name: 'Tow Mater',
    actorStyle: 'Larry the Cable Guy - Southern country twang, drawl, deep friendly chuckle',
    pitch: 0.74,
    rate: 0.88,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'guy', 'richard', 'david', 'southern'],
    signatureSound: 'honk',
    catchphrase: "Dad-gum! Larry Tow Mater, at your service, partner!",
  },
  sally: {
    name: 'Sally Carrera',
    actorStyle: 'Bonnie Hunt - Warm, poised, California Porsche elegance',
    pitch: 1.05,
    rate: 0.98,
    lang: 'en-US',
    preferredVoiceGender: 'female',
    voiceKeywords: ['natural', 'jenny', 'zira', 'samantha', 'aria', 'female'],
    signatureSound: 'chime',
    catchphrase: 'Precision performance with complete peace of mind.',
  },
  doc: {
    name: 'Doc Hudson',
    actorStyle: 'Paul Newman - Legendary Fabulous Hudson Hornet, deep gravelly mentor baritone',
    pitch: 0.68,
    rate: 0.85,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'christopher', 'george', 'david', 'mark', 'deep'],
    signatureSound: 'rumble',
    catchphrase: "Turn right to go left, kid. Take care of that machine.",
  },
  chick: {
    name: 'Chick Hicks',
    actorStyle: 'Michael Keaton - Rapid-fire, manic, competitive, excitable',
    pitch: 1.25,
    rate: 1.22,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'guy', 'david', 'fast'],
    signatureSound: 'vroom',
    catchphrase: "Ka-Chicka! Ka-Chicka! Number 86 is taking the championship!",
  },
  finn: {
    name: 'Finn McMissile',
    actorStyle: 'Michael Caine - Distinguished British Secret Intelligence agent',
    pitch: 0.94,
    rate: 0.96,
    lang: 'en-GB',
    preferredVoiceGender: 'male',
    voiceKeywords: ['oliver', 'george', 'daniel', 'google uk english male', 'en-gb', 'british'],
    signatureSound: 'chime',
    catchphrase: 'A gentleman never compromises on standard vehicle maintenance.',
  },
  holley: {
    name: 'Holley Shiftwell',
    actorStyle: 'Emily Mortimer - Crisp, highly-intelligent British Intelligence agent',
    pitch: 1.10,
    rate: 1.02,
    lang: 'en-GB',
    preferredVoiceGender: 'female',
    voiceKeywords: ['hazel', 'kate', 'susan', 'serena', 'google uk english female', 'en-gb', 'british'],
    signatureSound: 'chime',
    catchphrase: 'Diagnostic telemetry scan initialized. All systems checked.',
  },
  cruz: {
    name: 'Cruz Ramirez',
    actorStyle: 'Cristela Alonzo - High-energy, motivating, modern race trainer',
    pitch: 1.16,
    rate: 1.10,
    lang: 'en-US',
    preferredVoiceGender: 'female',
    voiceKeywords: ['natural', 'jenny', 'zira', 'aria', 'female'],
    signatureSound: 'vroom',
    catchphrase: 'Use that motivation! Aerodynamic telemetry locked in!',
  },
  king: {
    name: 'The King (Strip Weathers)',
    actorStyle: 'Richard Petty - Legendary NASCAR champion, smooth calm Southern gentleman',
    pitch: 0.82,
    rate: 0.92,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'guy', 'david', 'mark'],
    signatureSound: 'vroom',
    catchphrase: 'Forty-three years of winning championships starts with routine pit-stop service.',
  },
  sarge: {
    name: 'Sarge',
    actorStyle: 'Paul Dooley - Gruff WW2 military drill sergeant, disciplined staccato',
    pitch: 0.80,
    rate: 1.05,
    lang: 'en-US',
    preferredVoiceGender: 'male',
    voiceKeywords: ['natural', 'david', 'mark', 'guy'],
    signatureSound: 'honk',
    catchphrase: 'Attention soldier! Vehicle readiness inspection underway!',
  },
};

let cachedVoices: SpeechSynthesisVoice[] = [];

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  cachedVoices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Finds the closest matching system voice based on accent, language, gender, and character style.
 */
function findBestVoice(profile: CharacterVoiceProfile): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // 1. First priority: match language code and keywords
  const langMatch = voices.filter((v) =>
    profile.lang === 'en-GB' ? v.lang.startsWith('en-GB') : v.lang.startsWith('en')
  );

  const candidatePool = langMatch.length > 0 ? langMatch : voices;

  // Search by preferred keywords
  for (const keyword of profile.voiceKeywords) {
    const matched = candidatePool.find((v) =>
      v.name.toLowerCase().includes(keyword.toLowerCase())
    );
    if (matched) return matched;
  }

  // Search by gender fallback
  if (profile.preferredVoiceGender === 'female') {
    const female = candidatePool.find((v) =>
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('zira') ||
      v.name.toLowerCase().includes('samantha') ||
      v.name.toLowerCase().includes('jenny')
    );
    if (female) return female;
  } else {
    const male = candidatePool.find((v) =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('george') ||
      v.name.toLowerCase().includes('guy')
    );
    if (male) return male;
  }

  return candidatePool[0] || voices[0] || null;
}

/**
 * Speaks text using the character's movie voice profile
 */
export function speakDialogue(
  text: string,
  characterId: string,
  options: {
    enabled: boolean;
    onStart?: () => void;
    onEnd?: () => void;
    onBoundary?: () => void;
  }
) {
  if (!options.enabled) return;
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  stopSpeaking();

  const profile = CHARACTER_VOICE_PROFILES[characterId] || CHARACTER_VOICE_PROFILES.mcqueen;
  const utterance = new SpeechSynthesisUtterance(text);

  utterance.pitch = profile.pitch;
  utterance.rate = profile.rate;
  utterance.lang = profile.lang || 'en-US';

  const selectedVoice = findBestVoice(profile);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    options.onEnd?.();
  };

  utterance.onerror = () => {
    options.onEnd?.();
  };

  utterance.onboundary = () => {
    options.onBoundary?.();
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Synthesizes authentic Cars movie sound FX using Web Audio API
 */
export function playCarSound(
  type: 'honk' | 'rev' | 'vroom' | 'skid' | 'chime' | 'rumble' | 'ferrari_rev' | 'italian_fanfare'
) {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'ferrari_rev') {
      // Exotic high-revving Ferrari flat-plane V8 scream (8,500 RPM Maranello harmonic howl)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc3.type = 'triangle';

      // Ramp from 120Hz idle up to 580Hz scream (with harmonic 1160Hz) then settle
      osc1.frequency.setValueAtTime(110, now);
      osc1.frequency.exponentialRampToValueAtTime(540, now + 0.32);
      osc1.frequency.exponentialRampToValueAtTime(680, now + 0.5);
      osc1.frequency.exponentialRampToValueAtTime(160, now + 1.1);

      osc2.frequency.setValueAtTime(220, now);
      osc2.frequency.exponentialRampToValueAtTime(1080, now + 0.32);
      osc2.frequency.exponentialRampToValueAtTime(1360, now + 0.5);
      osc2.frequency.exponentialRampToValueAtTime(320, now + 1.1);

      osc3.frequency.setValueAtTime(55, now);
      osc3.frequency.exponentialRampToValueAtTime(270, now + 0.32);
      osc3.frequency.exponentialRampToValueAtTime(80, now + 1.1);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.45);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.15);

      osc1.connect(gain);
      osc2.connect(gain);
      osc3.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc3.start(now);
      osc1.stop(now + 1.15);
      osc2.stop(now + 1.15);
      osc3.stop(now + 1.15);
    } else if (type === 'italian_fanfare') {
      // Italian melody chime celebrating Casa Della Tires
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.08, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } else if (type === 'honk') {
      // Classic friendly double honk: Beep-Beep!
      [0, 0.14].forEach((delay) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(420, now + delay);
        osc2.frequency.setValueAtTime(540, now + delay);
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        gain.gain.setValueAtTime(0.09, now + delay);
        gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.11);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + delay);
        osc2.start(now + delay);
        osc1.stop(now + delay + 0.11);
        osc2.stop(now + delay + 0.11);
      });
    } else if (type === 'vroom' || type === 'rev') {
      // High-performance V8 engine revving roar
      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      subOsc.type = 'triangle';

      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.8);

      subOsc.frequency.setValueAtTime(40, now);
      subOsc.frequency.exponentialRampToValueAtTime(160, now + 0.35);
      subOsc.frequency.exponentialRampToValueAtTime(65, now + 0.8);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      subOsc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.85);
      subOsc.stop(now + 0.85);
    } else if (type === 'skid') {
      // High-friction tire screech braking into center
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2100, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'chime') {
      // Ka-Chow lightning chime / high-tech beep
      [0, 0.08, 0.16].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880 * (1 + idx * 0.25), now + delay);

        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.3);
      });
    } else if (type === 'rumble') {
      // Vintage Doc Hudson inline-6 low purr
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(55, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.4);
      osc.frequency.linearRampToValueAtTime(50, now + 0.9);

      gain.gain.setValueAtTime(0.10, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.9);
    }
  } catch {}
}
