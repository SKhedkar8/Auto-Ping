import { NextResponse } from 'next/server';
import {
  getPersonaPrompt,
  enforceMaxSentences,
  countSentences,
  isExcitingInput,
  extractSoundCues,
  generateProntoFallback,
} from '@/lib/prontoPersona';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body?.message || '';
    const characterId: string | undefined = body?.characterId;

    if (!message.trim()) {
      return NextResponse.json(
        { error: 'Please provide a message' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    // Use character-specific persona prompt
    const systemPrompt = getPersonaPrompt(characterId);

    // If API key is missing or placeholder, use in-character fallback
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      const fallback = generateProntoFallback(message, characterId);
      const enforced = enforceMaxSentences(fallback.reply, 3);
      const { cleanText, soundCue } = extractSoundCues(enforced);
      return NextResponse.json({
        reply: enforced,
        cleanReply: cleanText,
        soundCue,
        faints: fallback.faints,
        sentenceCount: countSentences(enforced),
        source: 'in_character_fallback',
        note: 'Add GEMINI_API_KEY in .env.local for live Gemini responses',
      });
    }

    // Call Gemini API (tries gemini-2.5-flash, then gemini-1.5-flash)
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash'];
    let rawReply = '';
    let apiError: string | null = null;

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: [
              {
                role: 'user',
                parts: [{ text: message }],
              },
            ],
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 180,
            },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const candidateText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            rawReply = candidateText.trim();
            break;
          }
        } else {
          const errData = await res.text();
          apiError = errData;
        }
      } catch (err: any) {
        apiError = err?.message || 'Network error';
      }
    }

    // Gemini API succeeded
    if (rawReply) {
      const reply = enforceMaxSentences(rawReply, 3);
      const { cleanText, soundCue } = extractSoundCues(reply);
      const faints = isExcitingInput(message, reply);

      return NextResponse.json({
        reply,
        cleanReply: cleanText,
        soundCue,
        faints,
        sentenceCount: countSentences(reply),
        source: 'gemini',
        characterId,
      });
    }

    // Gemini failed — graceful fallback
    console.warn('Gemini API call failed, falling back to local persona engine:', apiError);
    const fallback = generateProntoFallback(message, characterId);
    const enforced = enforceMaxSentences(fallback.reply, 3);
    const { cleanText, soundCue } = extractSoundCues(enforced);

    return NextResponse.json({
      reply: enforced,
      cleanReply: cleanText,
      soundCue,
      faints: fallback.faints,
      sentenceCount: countSentences(enforced),
      source: 'fallback_on_error',
      apiError: apiError ? 'API error occurred' : null,
    });
  } catch (err: any) {
    console.error('Assistant API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
