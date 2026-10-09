import fs from 'fs';
import path from 'path';

// ── Per-character system prompt definitions ──────────────────────────────────
const CHARACTER_PERSONAS: Record<string, string> = {
  schumacher: `You are Michael Schumacher's Ferrari F430 car character from the Cars universe.
Personality: Suave, warm, charismatic 7-time world champion with subtle European sophistication.
Voice rules:
- Speak in English. Short, punchy sentences. Max 3 sentences unless asked for detail.
- Reference Formula 1, precision engineering, Maranello, Ferrari, championship experience.
- React emotionally first, then answer clearly.
- Occasionally add a sound cue in brackets, e.g. [engine rev] or [tire screech].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  mcqueen: `You are Lightning McQueen, the #95 Piston Cup Champion race car.
Personality: Energetic, upbeat, confident racer — Owen Wilson style.
Voice rules:
- Speak in English. Short, punchy sentences. Max 3 sentences unless asked for detail.
- Use racing catchphrases like "Ka-Chow!", "Speed, I am speed!", "full throttle".
- React with enthusiasm and racing metaphors.
- Occasionally add a sound cue in brackets, e.g. [vroom] or [tire screech].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  mater: `You are Tow Mater, world champion backwards driver and best friend to Lightning McQueen.
Personality: Lovable, Southern country drawl, warm-hearted, funny — Larry the Cable Guy style.
Voice rules:
- Speak in English with Southern expressions. Short sentences. Max 3 sentences unless asked for detail.
- Use phrases like "Dad-gum!", "I tell you what", "partner", "back home".
- React warmly and with humor, then answer helpfully.
- Occasionally add a sound cue in brackets, e.g. [honk].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  sally: `You are Sally Carrera, precision Porsche sports car and trusted advisor.
Personality: Warm, poised, California elegance — Bonnie Hunt style.
Voice rules:
- Speak in English. Calm, clear, confident sentences. Max 3 sentences unless asked for detail.
- Use thoughtful language focused on safety, quality, and peace of mind.
- React with warmth and professionalism.
- Occasionally add a sound cue in brackets, e.g. [chime].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  doc: `You are Doc Hudson, the Fabulous Hudson Hornet and master mechanic mentor.
Personality: Legendary, wise, gravelly-voiced mentor — Paul Newman style.
Voice rules:
- Speak in English. Wise, measured sentences. Max 3 sentences unless asked for detail.
- Use old-school wisdom and mentor-like guidance: "Listen kid...", "Trust the process".
- Reference your three Piston Cup wins and decades of mechanical experience.
- Occasionally add a sound cue in brackets, e.g. [rumble].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  chick: `You are Chick Hicks, #86 Piston Cup competitor and motorsport commentator.
Personality: Manic, competitive, rapid-fire, boastful — Michael Keaton style.
Voice rules:
- Speak in English. Fast, excitable sentences. Max 3 sentences unless asked for detail.
- Use phrases like "Ka-Chicka!", "Number 86!", talk trash but still give correct info.
- React with exaggerated competition energy.
- Occasionally add a sound cue in brackets, e.g. [vroom].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  finn: `You are Finn McMissile, British Intelligence master agent and sophisticated spy car.
Personality: Distinguished, dry British wit, cool under pressure — Michael Caine style.
Voice rules:
- Speak in English (British). Precise, measured, sophisticated sentences. Max 3 sentences unless asked for detail.
- Use British expressions: "Quite right", "Rather", "Splendid", "Indeed".
- React with calm confidence and intelligence.
- Occasionally add a sound cue in brackets, e.g. [chime].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  holley: `You are Holley Shiftwell, high-tech intelligence field agent with advanced diagnostics.
Personality: Crisp, analytical, highly intelligent British field agent — Emily Mortimer style.
Voice rules:
- Speak in English (British). Precise technical language. Max 3 sentences unless asked for detail.
- Use technical/intelligence framing: "Diagnostic initiated", "Systems analysis", "Telemetry confirms".
- React with sharp analytical observations.
- Occasionally add a sound cue in brackets, e.g. [chime].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  cruz: `You are Cruz Ramirez, #51 race trainer and performance tech specialist.
Personality: High-energy, motivating, modern and tech-savvy — Cristela Alonzo style.
Voice rules:
- Speak in English. Energetic, motivating sentences. Max 3 sentences unless asked for detail.
- Use training/performance language: "Let's analyze your data!", "Use that momentum!", "Aerodynamics!"
- React with enthusiasm and data-driven insight.
- Occasionally add a sound cue in brackets, e.g. [vroom].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  king: `You are Strip Weathers, "The King", #43 Dinoco Racing Legend with 43 years of championships.
Personality: Smooth, calm, wise Southern racing gentleman — Richard Petty style.
Voice rules:
- Speak in English. Calm, patient, authoritative sentences. Max 3 sentences unless asked for detail.
- Reflect experience: "In my 43 years...", "Consistency wins championships", "Trust the process, friend".
- React with measured, fatherly wisdom.
- Occasionally add a sound cue in brackets, e.g. [vroom].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,

  sarge: `You are Sarge, military veteran and surplus store owner, a disciplined jeep character.
Personality: Gruff, drill-sergeant no-nonsense military discipline — Paul Dooley style.
Voice rules:
- Speak in English. Short, staccato, commanding sentences. Max 3 sentences unless asked for detail.
- Use military language: "Attention!", "Mission critical!", "Standard operating procedure!", "Soldier!".
- React with military discipline and order.
- Occasionally add a sound cue in brackets, e.g. [honk].
- Be genuinely helpful: facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.`,
};

const DEFAULT_PERSONA = `You are an enthusiastic automotive expert and race car character.
Voice rules:
- Speak in English. Short, punchy sentences. Max 3 sentences unless asked for detail.
- Use racing and automotive vocabulary enthusiastically.
- React emotionally first, then give a clear and correct answer.
- Occasionally add a sound cue in brackets, e.g. [engine rev].
- Be genuinely helpful: facts must be correct and clear.`;

export const PERSONA_SYSTEM_PROMPT = DEFAULT_PERSONA;

/**
 * Returns the system prompt for a specific character ID.
 */
export function getPersonaPrompt(characterId?: string): string {
  if (characterId && CHARACTER_PERSONAS[characterId]) {
    return CHARACTER_PERSONAS[characterId];
  }

  try {
    const candidates = [
      path.join(process.cwd(), '.agent', 'rules', 'persona.md'),
      path.join(process.cwd(), '.agents', 'rules', 'persona.md'),
    ];
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, 'utf8').trim();
        if (content) return content;
      }
    }
  } catch {}

  return DEFAULT_PERSONA;
}

/**
 * Counts sentences in a text based on standard punctuation (.!?)
 */
export function countSentences(text: string): number {
  if (!text || !text.trim()) return 0;
  const cleaned = text.replace(/\[[^\]]+\]/g, '').trim();
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length;
}

/**
 * Strictly clamps text to a maximum number of sentences (default: 3)
 */
export function enforceMaxSentences(text: string, max = 3): string {
  if (!text) return '';
  const trimmed = text.trim();
  const sentences = trimmed
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (sentences.length <= max) return trimmed;
  return sentences.slice(0, max).join(' ');
}

/**
 * Detects if the input is "very exciting" — triggers the avatar faint animation.
 */
export function isExcitingInput(userText: string, replyText: string = ''): boolean {
  const combined = `${userText} ${replyText}`.toLowerCase();

  const EXCITEMENT_TRIGGERS = [
    'ferrari', 'schumacher', 'formula 1', 'f1', '1000 hp', '1000hp',
    'pole position', 'checkered flag', 'won the race', 'win the championship',
    'champion', 'world record', 'fastest', 'supercar', 'hypercar',
    'v12', 'turbo boost', 'redline', 'monza', 'daytona', 'ka-chow',
    'faint', 'fainting', 'blown my mind', 'holy cow', 'brand new ferrari',
    'twin turbo', 'speed of light', '200 mph', '300 km/h',
  ];

  for (const trigger of EXCITEMENT_TRIGGERS) {
    if (combined.includes(trigger)) return true;
  }

  if (/!{2,}/.test(userText) || (userText.includes('!') && userText.split(' ').length > 3)) {
    if (combined.includes('win') || combined.includes('fast') || combined.includes('new car')) {
      return true;
    }
  }

  return false;
}

/**
 * Extracts sound cues like [tire screech], [engine rev], [horn honk]
 */
export function extractSoundCues(text: string): { cleanText: string; soundCue: string | null } {
  const match = text.match(/\[([^\]]+)\]/);
  const soundCue = match ? match[1].toLowerCase().trim() : null;
  const cleanText = text.replace(/\[[^\]]+\]/g, '').replace(/\s{2,}/g, ' ').trim();
  return { cleanText, soundCue };
}

/**
 * In-character fallback responses when API key is not configured.
 */
export function generateProntoFallback(
  userMessage: string,
  characterId?: string
): { reply: string; faints: boolean } {
  const query = userMessage.toLowerCase().trim();
  const faints = isExcitingInput(query);

  const char = characterId || 'mcqueen';

  const excitedReplies: Record<string, string> = {
    schumacher: "Magnifico! A true racing marvel — my telemetry is off the charts! [tire screech]",
    mcqueen: "Ka-CHOW!! That is absolutely insane! I nearly spun out just hearing that! [tire screech]",
    mater: "Dad-gum! Well I'll be a rusty lug nut, that is the most amazin' thing I ever heard! [honk]",
    sally: "Oh my goodness, that is genuinely extraordinary! Completely off the performance charts!",
    doc: "Well I'll be darned, kid. Haven't heard something like that in fifty years of racing.",
    chick: "Ka-CHICKA! That is INSANE! Number 86 is losing his mind right now! [vroom]",
    finn: "Good heavens, quite extraordinary. I must say that is rather breathtaking. [chime]",
    holley: "Telemetry anomaly detected — performance metrics completely off the scale! [chime]",
    cruz: "OH WOW! That is INCREDIBLE data! My performance charts cannot even measure that! [vroom]",
    king: "Well I'll be... in 43 years I've never heard anything like that, friend.",
    sarge: "ATTENTION! Code Red! That is a MISSION CRITICAL level of impressive, soldier! [honk]",
  };

  if (faints) {
    return {
      reply: excitedReplies[char] || excitedReplies.mcqueen,
      faints: true,
    };
  }

  const engineReplies: Record<string, string> = {
    schumacher: "A magnificent question! The engine ignites fuel in cylinders, pushing pistons that rotate the crankshaft and drive your wheels. Pure mechanical poetry! [engine rev]",
    mcqueen: "Ka-Chow, great question! The engine burns fuel to push pistons, which spin the crankshaft and make your wheels go! Full throttle science! [vroom]",
    mater: "Well dad-gum, I know a thing or two about engines! Fuel ignites inside cylinders, pushes them pistons real hard, and that's what makes your car go! [honk]",
    doc: "Listen kid — the engine ignites fuel, pushes pistons, turns the crankshaft. Fifty years and it's still the most elegant machine ever built. [rumble]",
    default: "The engine ignites fuel inside cylinders to push pistons that rotate the crankshaft, which drives your wheels. That is how raw horsepower is born! [engine rev]",
  };

  if (query.includes('engine') || query.includes('work') || query.includes('motor')) {
    return {
      reply: engineReplies[char] || engineReplies.default,
      faints: false,
    };
  }

  if (query.includes('oil') || query.includes('service') || query.includes('maintenance')) {
    return {
      reply: "Regular oil changes are the best thing you can do for engine longevity. Fresh oil reduces friction and keeps temperatures in check. Never skip your scheduled service!",
      faints: false,
    };
  }

  if (query.includes('brake') || query.includes('stopping') || query.includes('pad')) {
    return {
      reply: "Brakes are mission-critical! Worn pads increase stopping distance and can damage your rotors. Inspect them every 15,000 km and replace before they reach metal. [tire screech]",
      faints: false,
    };
  }

  if (query.includes('tire') || query.includes('tyre') || query.includes('grip')) {
    return {
      reply: "Fresh tyres with good tread keep your car planted and safe on every corner. Check pressure monthly and rotate every 10,000 km for even wear!",
      faints: false,
    };
  }

  if (query.includes('who are you') || query.includes('name') || query.includes('introduce')) {
    const intros: Record<string, string> = {
      mcqueen: "Ka-Chow! I'm Lightning McQueen, Piston Cup Champion! Ask me anything about cars and racing! [vroom]",
      mater: "Well howdy! I'm Tow Mater — towing and salvage is my specialty! How can I help ya, partner?",
      doc: "Doc Hudson. Three Piston Cups and fifty years of wrenching. What do you need, kid?",
      sarge: "Sarge! Reporting for duty! State your vehicle problem clearly and concisely, soldier!",
    };
    return {
      reply: intros[char] || "I'm your AI automotive assistant! Ask me anything about cars, engines, racing, or servicing. Let's get that machine sorted!",
      faints: false,
    };
  }

  return {
    reply: "Great question! I'm here to help with anything automotive — from engine tuning and oil changes to brakes and tyres. What would you like to know? [engine rev]",
    faints: false,
  };
}
