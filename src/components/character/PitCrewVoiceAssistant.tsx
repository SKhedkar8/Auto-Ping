'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  RotateCcw,
  Sparkles,
  Flame,
  ChevronLeft,
} from 'lucide-react';
import CartoonCarAvatar from './CartoonCarAvatar';
import { playCarSound, CHARACTER_VOICE_PROFILES } from '@/lib/characterVoice';
import { CHARACTERS, CharacterDef } from '@/lib/characterData';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  soundCue?: string | null;
  faints?: boolean;
}

function buildWelcome(char: CharacterDef): ChatMessage {
  return {
    id: 'welcome',
    sender: 'bot',
    text: char.intro,
    soundCue: null,
  };
}

export default function PitCrewVoiceAssistant() {
  const [selectedChar, setSelectedChar] = useState<CharacterDef | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFainted, setIsFainted] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [visemePhase, setVisemePhase] = useState(0);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech-to-Text (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setTranscriptPreview(current);
          if (event.results[0].isFinal) {
            handleSendMessage(current);
            setIsListening(false);
            setTranscriptPreview('');
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
          setTranscriptPreview('');
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
      }
    }

    return () => {
      try { recognitionRef.current?.abort(); } catch {}
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, transcriptPreview]);

  // Mouth articulation
  useEffect(() => {
    if (!isSpeaking) { setVisemePhase(0); return; }
    const phases = [1, 2, 1, 3, 2, 4];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setVisemePhase(phases[idx]);
    }, 110);
    return () => clearInterval(interval);
  }, [isSpeaking]);

  // TTS — English voice using character voice profile
  const speakReply = (text: string, charId: string, soundCue?: string | null) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    // Play audio sound cue
    if (soundCue) {
      if (soundCue.includes('screech') || soundCue.includes('skid')) playCarSound('skid');
      else if (soundCue.includes('rev') || soundCue.includes('engine')) playCarSound('ferrari_rev');
      else if (soundCue.includes('honk')) playCarSound('honk');
      else if (soundCue.includes('vroom')) playCarSound('vroom');
    }

    const profile = CHARACTER_VOICE_PROFILES[charId];
    const utterance = new SpeechSynthesisUtterance(text);

    utterance.pitch = profile?.pitch ?? 1.0;
    utterance.rate = profile?.rate ?? 1.0;

    // Pick the best English voice — NO Italian, always English
    const voices = window.speechSynthesis.getVoices();
    const lang = profile?.lang ?? 'en-US';
    const gender = profile?.preferredVoiceGender ?? 'male';
    const keywords = profile?.voiceKeywords ?? [];

    // Filter to English-only voices
    const englishVoices = voices.filter((v) =>
      lang === 'en-GB' ? v.lang.startsWith('en-GB') : v.lang.startsWith('en')
    );
    const pool = englishVoices.length > 0 ? englishVoices : voices;

    let chosenVoice: SpeechSynthesisVoice | undefined;

    // Try keyword match first
    for (const kw of keywords) {
      const match = pool.find((v) => v.name.toLowerCase().includes(kw.toLowerCase()));
      if (match) { chosenVoice = match; break; }
    }

    // Gender fallback
    if (!chosenVoice) {
      if (gender === 'female') {
        chosenVoice = pool.find((v) =>
          ['zira', 'samantha', 'jenny', 'female', 'aria', 'hazel', 'kate'].some((k) =>
            v.name.toLowerCase().includes(k)
          )
        );
      } else {
        chosenVoice = pool.find((v) =>
          ['david', 'george', 'mark', 'guy', 'male', 'oliver'].some((k) =>
            v.name.toLowerCase().includes(k)
          )
        );
      }
    }

    // Last resort: first English voice
    if (!chosenVoice && pool.length > 0) chosenVoice = pool[0];

    if (chosenVoice) utterance.voice = chosenVoice;
    utterance.lang = lang;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition not supported. Use Chrome/Edge or type your question.');
      return;
    }
    if (isListening) {
      try { recognitionRef.current.stop(); } catch {}
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try { recognitionRef.current.start(); } catch (err) { console.error(err); }
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    if (!selectedChar) return;
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setTranscriptPreview('');

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, characterId: selectedChar.id }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.reply) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          soundCue: data.soundCue,
          faints: data.faints,
        };
        setMessages((prev) => [...prev, botMsg]);

        if (data.faints) {
          const sigSound = CHARACTER_VOICE_PROFILES[selectedChar.id]?.signatureSound ?? 'skid';
          playCarSound(sigSound);
          setIsFainted(true);
          setTimeout(() => {
            setIsFainted(false);
            playCarSound('ferrari_rev');
          }, 3600);
        }

        speakReply(data.cleanReply || data.reply, selectedChar.id, data.soundCue);
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'bot',
          text: 'Whoops — lost the telemetry signal! Check your connection and try again.',
        },
      ]);
    }
  };

  const handleSelectCharacter = (char: CharacterDef) => {
    setSelectedChar(char);
    setMessages([buildWelcome(char)]);
    setIsFainted(false);
    window.speechSynthesis?.cancel();

    // Play character signature sound
    const profile = CHARACTER_VOICE_PROFILES[char.id];
    if (profile?.signatureSound) {
      setTimeout(() => playCarSound(profile.signatureSound), 200);
    }

    // Speak the intro line
    setTimeout(() => {
      speakReply(char.intro, char.id, null);
    }, 500);
  };

  const handleBack = () => {
    window.speechSynthesis?.cancel();
    setSelectedChar(null);
    setMessages([]);
    setIsFainted(false);
  };

  // ── CHARACTER PICKER (shown when no character selected) ──
  if (!selectedChar) {
    return (
      <div className="w-full max-w-4xl mx-auto px-2 py-4">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Voice AI Assistant
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] dark:text-[#f5f5f7] tracking-tight">
            Choose Your AI Character
          </h2>
          <p className="text-[13px] text-[#86868b] mt-1 max-w-sm mx-auto">
            Each character speaks in their own voice and personality. Talk to them using your mic or keyboard!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {CHARACTERS.map((char) => (
            <button
              key={char.id}
              type="button"
              onClick={() => handleSelectCharacter(char)}
              className="group relative flex flex-col items-center text-center p-3 rounded-2xl bg-white dark:bg-[#1C1C1E] border-2 border-black/8 dark:border-white/8 hover:border-red-500 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-200 cursor-pointer"
            >
              {/* Character image */}
              <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 bg-slate-100 dark:bg-slate-800">
                <img
                  src={char.image}
                  alt={char.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <h4 className="font-bold text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] leading-tight line-clamp-2">
                {char.name}
              </h4>
              <p className="text-[10px] text-[#86868b] mt-0.5 line-clamp-1">{char.title}</p>
              <div
                className="mt-2 w-full py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors"
                style={{ backgroundColor: char.color }}
              >
                Chat 🎙️
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ── CHAT VIEW (character selected) ──
  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full max-w-5xl mx-auto">

      {/* ── Left: Avatar Stage ── */}
      <div className="flex-shrink-0 lg:w-72 flex flex-col items-center justify-start p-5 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl">

        {/* Back + Voice toggle row */}
        <div className="w-full flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-medium transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Characters
          </button>
          <button
            type="button"
            onClick={() => {
              const next = !voiceEnabled;
              setVoiceEnabled(next);
              if (!next) window.speechSynthesis?.cancel();
            }}
            className={`p-2 rounded-full transition-colors ${
              voiceEnabled
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
            }`}
            title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Character info */}
        <div className="flex items-center gap-2 mb-3 w-full">
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 flex-shrink-0" style={{ borderColor: selectedChar.color }}>
            <img src={selectedChar.image} alt={selectedChar.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-[12px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate">{selectedChar.name}</div>
            <div className="text-[10px] text-[#86868b] truncate">{selectedChar.title}</div>
          </div>
        </div>

        {/* Animated cartoon car avatar */}
        <CartoonCarAvatar
          isSpeaking={isSpeaking}
          isFainted={isFainted}
          onRecover={() => {
            setIsFainted(false);
            playCarSound('ferrari_rev');
          }}
          visemePhase={visemePhase}
          color={selectedChar.color}
        />

        {/* Quick action buttons */}
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={() =>
              handleSendMessage('I just bought a brand new Ferrari 1000 HP twin turbo and won pole position at Monza!')
            }
            className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Say something exciting — watch them faint!"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Exciting News!
          </button>

          <button
            type="button"
            onClick={() => playCarSound('ferrari_rev')}
            className="px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Flame className="w-3.5 h-3.5" />
            Rev V8
          </button>
        </div>
      </div>

      {/* ── Right: Chat Console ── */}
      <div className="flex-1 flex flex-col h-[540px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">

        {/* Console header */}
        <div
          className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between"
          style={{ background: `${selectedChar.color}18` }}
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {selectedChar.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                Gemini AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {selectedChar.title} • Ask anything about cars!
            </p>
          </div>

          {/* Reset conversation */}
          <button
            type="button"
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsSpeaking(false);
              setMessages([buildWelcome(selectedChar)]);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="text-[10px] font-bold mb-0.5 flex items-center gap-1" style={{ color: selectedChar.color }}>
                  <span>{selectedChar.name.split(' ')[0]}</span>
                  {m.soundCue && (
                    <span className="text-[9px] px-1.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 font-normal">
                      [{m.soundCue}]
                    </span>
                  )}
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}

          {/* Live STT preview */}
          {isListening && transcriptPreview && (
            <div className="flex flex-col items-end">
              <div className="max-w-[85%] rounded-2xl px-4 py-2 text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 italic">
                Listening: &quot;{transcriptPreview}&quot;...
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
              <div className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: selectedChar.color }} />
              <span className="text-xs text-slate-500">{selectedChar.name.split(' ')[0]} is thinking...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick suggestion chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Ask:</span>
          {[
            'How does a car engine work?',
            'What is a pit stop?',
            'How do turbochargers work?',
            'Why do brakes squeak?',
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          {/* Mic button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`relative p-3.5 rounded-full transition-all duration-300 shadow-md text-white ${
              isListening
                ? 'animate-pulse ring-4 ring-offset-1'
                : 'hover:scale-105'
            }`}
            style={{
              backgroundColor: selectedChar.color,
              ['--tw-ring-color' as string]: selectedChar.color,
            }}
            title={isListening ? 'Stop listening' : 'Speak via microphone'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'Listening to your voice...' : `Ask ${selectedChar.name.split(' ')[0]} anything...`}
              className="w-full px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 pr-10"
              style={{ '--tw-ring-color': selectedChar.color } as any}
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white hover:opacity-90 disabled:opacity-40 transition-all"
              style={{ backgroundColor: selectedChar.color }}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
