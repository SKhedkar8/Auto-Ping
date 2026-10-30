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
  ArrowRight,
} from 'lucide-react';
import CartoonCarAvatar from './CartoonCarAvatar';
import { playCarSound, CHARACTER_VOICE_PROFILES } from '@/lib/characterVoice';
import { CHARACTERS, CharacterDef } from '@/lib/characterData';

const CHARACTER_CATEGORIES: Record<string, 'CHAMPIONS' | 'SCUDERIA' | 'MECHANICS' | 'TECH'> = {
  mcqueen: 'CHAMPIONS',
  king: 'CHAMPIONS',
  chick: 'CHAMPIONS',
  schumacher: 'SCUDERIA',
  sally: 'SCUDERIA',
  doc: 'MECHANICS',
  mater: 'MECHANICS',
  sarge: 'MECHANICS',
  cruz: 'TECH',
  holley: 'TECH',
  finn: 'TECH',
};

const CHARACTER_TAGS: Record<string, { tag: string; badge: string }> = {
  schumacher: { tag: 'Scuderia Ferrari F430', badge: 'Rosso Corsa' },
  mcqueen: { tag: '#95 Rust-eze Champion', badge: 'Piston Cup' },
  mater: { tag: 'Tow Mater Recovery', badge: 'Radiator Springs' },
  sally: { tag: 'Porsche 911 Carrera', badge: 'Precision GT' },
  cruz: { tag: '#51 Rust-eze Racing Tech', badge: 'Aero Dynamics' },
  holley: { tag: 'C.H.R.O.M.E Diagnostics', badge: 'Secret Intel' },
  finn: { tag: 'British Intelligence Master', badge: 'MI-6 Class' },
  doc: { tag: '#51 Fabulous Hudson Hornet', badge: 'Grand Master' },
  king: { tag: '#43 Dinoco Racing Legend', badge: 'Hall of Fame' },
  chick: { tag: '#86 Piston Cup Champion', badge: 'HTB Racing' },
  sarge: { tag: '1942 Willys MB Surplus', badge: 'Tactical Prep' },
};

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
  const [voiceCategory, setVoiceCategory] = useState<'ALL' | 'CHAMPIONS' | 'SCUDERIA' | 'MECHANICS' | 'TECH'>('ALL');
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
    const filteredChars = CHARACTERS.filter((c) => {
      if (voiceCategory === 'ALL') return true;
      return CHARACTER_CATEGORIES[c.id] === voiceCategory;
    });

    const handleAudioPreview = (e: React.MouseEvent, char: CharacterDef) => {
      e.stopPropagation();
      if (char.id === 'schumacher') {
        playCarSound('ferrari_rev');
      } else {
        const profile = CHARACTER_VOICE_PROFILES[char.id];
        const sound = profile?.signatureSound || 'rev';
        playCarSound(sound as any);
      }
    };

    return (
      <div className="w-full max-w-5xl mx-auto px-2 py-3">
        {/* ── Header ── */}
        <div className="text-center mb-6 relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r from-red-500/10 via-rose-500/10 to-amber-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-red-600 animate-pulse" />
            Gemini-Powered Voice AI
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Choose Your{' '}
            <span className="bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent">
              Voice Co-Pilot
            </span>
          </h2>

          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1.5 max-w-lg mx-auto">
            Conversational AI with genuine Pixar character voices and engine signatures. Speak naturally using your microphone!
          </p>

          {/* ── Category Filter Pills ── */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {[
              { id: 'ALL', label: 'All Voices', count: 10, icon: '🏁' },
              { id: 'CHAMPIONS', label: 'Cup Champions', count: 3, icon: '🏆' },
              { id: 'SCUDERIA', label: 'Scuderia & GT', count: 2, icon: '🏎️' },
              { id: 'MECHANICS', label: 'Master Mechanics', count: 3, icon: '🔧' },
              { id: 'TECH', label: 'Tech & Intel', count: 3, icon: '⚡' },
            ].map((cat) => {
              const isActive = voiceCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setVoiceCategory(cat.id as any)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-900/20 dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600 dark:bg-white/10 dark:hover:bg-white/15 dark:text-slate-300'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                        : 'bg-slate-200/70 text-slate-600 dark:bg-white/10 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Voice Character Cards Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-4">
          {filteredChars.map((char) => {
            const tagInfo = CHARACTER_TAGS[char.id];
            return (
              <div
                key={char.id}
                onClick={() => handleSelectCharacter(char)}
                className="group relative cursor-pointer flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-[#18181b] border border-slate-200/80 dark:border-white/10 hover:border-transparent text-left"
                style={{
                  boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.02)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 20px 35px -10px ${char.color}40, 0 0 0 1.5px ${char.color}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    '0 4px 20px -2px rgba(0,0,0,0.05), 0 2px 6px -1px rgba(0,0,0,0.02)';
                }}
              >
                {/* Image Stage */}
                <div
                  className="relative w-full aspect-[4/3] overflow-hidden"
                  style={{
                    background: `radial-gradient(circle at 50% 25%, ${char.color}22 0%, #F8FAFC 85%)`,
                  }}
                >
                  {/* Top color accent line */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1 z-10"
                    style={{ background: `linear-gradient(90deg, ${char.color}, ${char.color}60)` }}
                  />

                  {/* Top floating badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex items-center justify-between pointer-events-none">
                    <span
                      className="pointer-events-auto px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-xs flex items-center gap-1"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.94)',
                        color: char.color,
                        border: `1px solid ${char.color}35`,
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: char.color }} />
                      {tagInfo?.badge || 'Voice AI'}
                    </span>

                    {/* Sound preview button */}
                    <button
                      type="button"
                      onClick={(e) => handleAudioPreview(e, char)}
                      title="Preview Character Sound"
                      className="pointer-events-auto p-1.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-red-600 shadow-sm transition-all duration-200 active:scale-90 hover:scale-110"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Artwork image */}
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />

                  {/* Frosted quote strip */}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/50 to-transparent flex items-end">
                    <p className="text-white text-[9.5px] font-medium italic leading-snug line-clamp-2 drop-shadow-xs">
                      {char.quote}
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-3 flex flex-col justify-between flex-1 gap-2 bg-white dark:bg-[#18181b]">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: char.color }} />
                      <h4 className="font-extrabold text-[12.5px] text-slate-900 dark:text-white leading-tight line-clamp-1 group-hover:text-red-600 transition-colors">
                        {char.name}
                      </h4>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-tight line-clamp-1">
                      {char.title}
                    </p>
                  </div>

                  {/* Premium CTA Button */}
                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl text-[11px] font-bold text-white transition-all duration-200 flex items-center justify-center gap-1.5 active:scale-95 shadow-sm group-hover:shadow-md group-hover:brightness-105"
                    style={{
                      background: `linear-gradient(135deg, ${char.color}, ${char.color}d0)`,
                      boxShadow: `0 3px 10px -2px ${char.color}50`,
                    }}
                  >
                    <Mic className="w-3 h-3" />
                    <span>Talk Voice AI</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Footer hint ── */}
        <p className="text-center text-[11px] text-slate-400 mt-6 flex items-center justify-center gap-1.5">
          <span>🎙️</span>
          <span>Web Speech API & Gemini Neural Voice • Works with speech or text input</span>
        </p>
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
