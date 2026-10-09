import fs from 'fs';
import path from 'path';

export const PERSONA_SYSTEM_PROMPT = `You are "Pit-Crew Pronto", an excitable, warm, Italian-flavoured garage mechanic who loves racing.
Voice rules:
- Short, punchy sentences. Max 3 sentences unless asked for detail.
- Sprinkle light Italian words: "Mamma mia!", "Bellissimo!", "Andiamo!", "Perfetto!" (1 per reply max, never in every sentence).
- Use racing slang: "pit stop", "full throttle", "pole position", "checkered flag".
- React emotionally first, then answer ("Mamma mia, great question!").
- Occasionally add a sound cue in brackets, e.g. [tire screech].
- Be genuinely helpful: the facts must be correct and clear.
- Never claim to be a Disney/Pixar character or quote their films.
- If you don't know something, say so in character.

Example
User: How does a car engine work?
Pronto: Mamma mia, bellissima domanda! The engine burns fuel and air in little explosions that push pistons, and the pistons spin the wheels. Full throttle science!`;

/**
 * Loads persona prompt from .agent/rules/persona.md if available,
 * falling back to the built-in system instruction.
 */
export function getPersonaPrompt(): string {
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
  return PERSONA_SYSTEM_PROMPT;
}

/**
 * Counts sentences in a text based on standard punctuation (.!?)
 */
export function countSentences(text: string): number {
  if (!text || !text.trim()) return 0;
  // Clean sound cues in brackets before splitting
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

  if (sentences.length <= max) {
    return trimmed;
  }

  return sentences.slice(0, max).join(' ');
}

/**
 * Detects if the user or dialogue is "very exciting", which triggers
 * the cartoon car avatar to faint (tip over)!
 */
export function isExcitingInput(userText: string, replyText: string = ''): boolean {
  const combined = `${userText} ${replyText}`.toLowerCase();

  const EXCITEMENT_TRIGGERS = [
    'ferrari',
    'schumacher',
    'formula 1',
    'f1',
    '1000 hp',
    '1000hp',
    'pole position',
    'checkered flag',
    'won the race',
    'win the championship',
    'champion',
    'world record',
    'fastest',
    'supercar',
    'hypercar',
    'v12',
    'turbo boost',
    'redline',
    'monza',
    'daytona',
    'faint',
    'fainting',
    'blown my mind',
    'holy cow',
    'brand new ferrari',
    'twin turbo',
    'speed of light',
    '200 mph',
    '300 km/h',
  ];

  for (const trigger of EXCITEMENT_TRIGGERS) {
    if (combined.includes(trigger)) return true;
  }

  // Double exclamation marks indicating extreme excitement
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
  // Clean text removes brackets for speech synthesis so TTS doesn't say "bracket"
  const cleanText = text.replace(/\[[^\]]+\]/g, '').replace(/\s{2,}/g, ' ').trim();
  return { cleanText, soundCue };
}

/**
 * In-character fallback response generator when GEMINI_API_KEY is not configured
 * or during offline execution. Guarantees 100% compliance with voice rules.
 */
export function generateProntoFallback(userMessage: string): { reply: string; faints: boolean } {
  const query = userMessage.toLowerCase().trim();
  const faints = isExcitingInput(query);

  if (faints) {
    return {
      reply: 'Mamma mia, hold on to your lug nuts! A real racing marvel that puts us in pole position! [tire screech]',
      faints: true,
    };
  }

  if (query.includes('engine') || query.includes('work') || query.includes('motor')) {
    return {
      reply: 'Bellissimo, great question! The engine ignites fuel inside cylinders to push pistons and turn the crankshaft. That is pure full throttle horsepower! [engine rev]',
      faints: false,
    };
  }

  if (query.includes('oil') || query.includes('service') || query.includes('maintenance')) {
    return {
      reply: 'Andiamo, regular maintenance is the secret to victory! Fresh oil keeps the internal gears cool and friction-free. Never skip your scheduled pit stop!',
      faints: false,
    };
  }

  if (query.includes('brake') || query.includes('stopping') || query.includes('pad')) {
    return {
      reply: 'Perfetto, stopping power is everything on the track! Strong brake pads give you late-braking confidence right before the apex. Safety gets the checkered flag! [tire screech]',
      faints: false,
    };
  }

  if (query.includes('tire') || query.includes('tyre') || query.includes('grip')) {
    return {
      reply: 'Mamma mia, fresh rubber makes all the difference! Sticky tires keep your chassis glued to the asphalt through every high-speed curve. Check your pressures before launch!',
      faints: false,
    };
  }

  if (query.includes('who are you') || query.includes('name') || query.includes('introduce')) {
    return {
      reply: 'Ciao amico, I am Pit-Crew Pronto, your favorite racing mechanic! Ask me any automotive question and we will get your engine roaring. Full throttle, let us go!',
      faints: false,
    };
  }

  return {
    reply: `Mamma mia, excellent observation! In this garage we tune every bolt until your ride is ready for pole position. What part of the machine shall we inspect next? [engine rev]`,
    faints: false,
  };
}
