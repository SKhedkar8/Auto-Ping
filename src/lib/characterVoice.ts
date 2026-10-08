'use client';

/**
 * Character Voice & Sound FX Engine using Web Speech API & Web Audio API.
 * Provides custom pitch, speed, and speech synthesis per character,
 * as well as car engine hum, rev, and horn sound effects synthesized natively.
 */

export interface CharacterVoiceProfile {
  name: string;
  pitch: number;
  rate: number;
  lang?: string;
  preferredVoiceGender?: 'male' | 'female';
}

export const CHARACTER_VOICE_PROFILES: Record<string, CharacterVoiceProfile> = {
  mater: {
    name: 'Tow Buddy',
    pitch: 0.85,
    rate: 0.95,
    lang: 'en-US',
    preferredVoiceGender: 'male',
  },
  mcqueen: {
    name: 'Flash Velocity',
    pitch: 1.15,
    rate: 1.08,
    lang: 'en-US',
    preferredVoiceGender: 'male',
  },
  sally: {
    name: 'Cruiser Blue',
    pitch: 1.05,
    rate: 1.0,
    lang: 'en-US',
    preferredVoiceGender: 'female',
  },
  sparky: {
    name: 'Volt Cyber',
    pitch: 1.25,
    rate: 1.12,
    lang: 'en-US',
  },
};

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

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

  const profile = CHARACTER_VOICE_PROFILES[characterId] || CHARACTER_VOICE_PROFILES.mater;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.pitch = profile.pitch;
  utterance.rate = profile.rate;
  utterance.lang = profile.lang || 'en-US';

  // Attempt to select an appropriate voice
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    if (profile.preferredVoiceGender === 'female') {
      const femaleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('zira') ||
            v.name.toLowerCase().includes('samantha') ||
            v.name.toLowerCase().includes('victoria'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      const maleVoice = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          (v.name.toLowerCase().includes('male') ||
            v.name.toLowerCase().includes('david') ||
            v.name.toLowerCase().includes('george'))
      );
      if (maleVoice) utterance.voice = maleVoice;
    }
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

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Synthesizes subtle car sound FX (honk, rev, tire skid) using Web Audio API
 */
export function playCarSound(type: 'honk' | 'rev' | 'vroom' | 'skid') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    if (type === 'honk') {
      // Friendly double honk: Beep-beep!
      [0, 0.14].forEach((delay) => {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.frequency.setValueAtTime(420, now + delay);
        osc2.frequency.setValueAtTime(540, now + delay);
        osc1.type = 'sawtooth';
        osc2.type = 'sawtooth';

        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.linearRampToValueAtTime(0.001, now + delay + 0.1);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now + delay);
        osc2.start(now + delay);
        osc1.stop(now + delay + 0.1);
        osc2.stop(now + delay + 0.1);
      });
    } else if (type === 'vroom' || type === 'rev') {
      // Engine acceleration roar
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(260, now + 0.4);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.8);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.85);
    } else if (type === 'skid') {
      // Playful tire screech
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1800, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.25);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch {}
}
