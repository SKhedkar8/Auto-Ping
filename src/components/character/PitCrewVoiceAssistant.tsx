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
  Zap,
  Flame,
  Info,
} from 'lucide-react';
import CartoonCarAvatar from './CartoonCarAvatar';
import { playCarSound } from '@/lib/characterVoice';

interface ChatMessage {
  id: string;
  sender: 'user' | 'pronto';
  text: string;
  soundCue?: string | null;
  faints?: boolean;
}

export default function PitCrewVoiceAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'pronto',
      text: 'Mamma mia, welcome to the pit lane! I am Pit-Crew Pronto, your racing mechanic. Hit the mic and ask me anything about your machine! [engine rev]',
      soundCue: 'engine rev',
    },
  ]);
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
  const audioContextRef = useRef<AudioContext | null>(null);

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

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscriptPreview(currentTranscript);

          // If final result
          if (event.results[0].isFinal) {
            handleSendMessage(currentTranscript);
            setIsListening(false);
            setTranscriptPreview('');
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
          setTranscriptPreview('');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, transcriptPreview]);

  // Speaking mouth articulation synced with speech
  useEffect(() => {
    if (!isSpeaking) {
      setVisemePhase(0);
      return;
    }

    const phases = [1, 2, 1, 3, 2, 4];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % phases.length;
      setVisemePhase(phases[idx]);
    }, 110);

    return () => clearInterval(interval);
  }, [isSpeaking]);

  // Text-to-Speech (TTS) with Italian-accented English voice, pitch 1.2, rate 1.1
  const speakReply = (textToSpeak: string, soundCue?: string | null) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    // Play optional audio sound cue
    if (soundCue) {
      if (soundCue.includes('screech') || soundCue.includes('skid')) {
        playCarSound('skid');
      } else if (soundCue.includes('rev') || soundCue.includes('engine')) {
        playCarSound('ferrari_rev');
      } else if (soundCue.includes('honk')) {
        playCarSound('honk');
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Exact user requirements: pitch 1.2, rate 1.1
    utterance.pitch = 1.2;
    utterance.rate = 1.1;

    // Pick Italian-accented English voice or Italian voice
    const voices = window.speechSynthesis.getVoices();
    const italianVoice = voices.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return (
        name.includes('italian') ||
        name.includes('luca') ||
        name.includes('alice') ||
        name.includes('cosimo') ||
        name.includes('elsa') ||
        lang.startsWith('it')
      );
    });

    const fallbackEnVoice = voices.find((v) => v.lang.startsWith('en'));

    if (italianVoice) {
      utterance.voice = italianVoice;
    } else if (fallbackEnVoice) {
      utterance.voice = fallbackEnVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Toggle microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert(
        'Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or type in the text box.'
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    } else {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Send message to Gemini backend API
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    setInputText('');
    setTranscriptPreview('');

    // Add user message to thread
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      setIsLoading(false);

      if (data.reply) {
        const botMsg: ChatMessage = {
          id: `pronto-${Date.now()}`,
          sender: 'pronto',
          text: data.reply,
          soundCue: data.soundCue,
          faints: data.faints,
        };

        setMessages((prev) => [...prev, botMsg]);

        // If excitement detected: Trigger fainting tip-over animation!
        if (data.faints) {
          playCarSound('skid');
          setIsFainted(true);

          // Auto recover after comedic 3.6 seconds
          setTimeout(() => {
            setIsFainted(false);
            playCarSound('ferrari_rev');
          }, 3600);
        }

        // Speak aloud using Web Speech TTS with Italian tuning
        speakReply(data.cleanReply || data.reply, data.soundCue);
      }
    } catch (err) {
      setIsLoading(false);
      console.error(err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'pronto',
        text: 'Mamma mia, lost connection to the telemetry pit! Check your internet and let us try another lap.',
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  // Manual Trigger for Excitement Fainting Test
  const triggerExcitementTest = () => {
    handleSendMessage('I just bought a 1000 HP twin-turbo Ferrari and took pole position at Monza!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-5xl mx-auto p-2 sm:p-4">
      {/* ── Left Column: Animated Cartoon Car Avatar Stage ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl min-h-[380px]">
        {/* Stage Header */}
        <div className="w-full flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-bold">
            <span>🏁 Garage Pit Box</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (!next) window.speechSynthesis.cancel();
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
        </div>

        {/* ── Cartoon Car Avatar (Eyes, Mouth, and Fainting Tip-Over) ── */}
        <CartoonCarAvatar
          isSpeaking={isSpeaking}
          isFainted={isFainted}
          onRecover={() => {
            setIsFainted(false);
            playCarSound('ferrari_rev');
          }}
          visemePhase={visemePhase}
        />

        {/* Quick Action Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={triggerExcitementTest}
            className="px-3 py-1.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all apple-btn"
            title="Tell Pronto something exciting to watch him faint!"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Say Exciting News (Faint!) 🏎️</span>
          </button>

          <button
            type="button"
            onClick={() => playCarSound('ferrari_rev')}
            className="px-3 py-1.5 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 transition-all apple-btn"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Rev V8</span>
          </button>
        </div>
      </div>

      {/* ── Right Column: Interactive Voice & Chat Console ── */}
      <div className="flex-1 flex flex-col h-[520px] rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
        {/* Console Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Pit-Crew Pronto Voice AI
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                Gemini Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Italian racing mechanic • Max 3 sentences • Voice enabled
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              window.speechSynthesis.cancel();
              setIsSpeaking(false);
              setMessages([
                {
                  id: 'welcome-reset',
                  sender: 'pronto',
                  text: 'Andiamo! Resetting the telemetry. What can I tune up for you, amico? [engine rev]',
                  soundCue: 'engine rev',
                },
              ]);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-xs shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-xs shadow-sm'
                }`}
              >
                {m.sender === 'pronto' && (
                  <div className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-0.5 flex items-center gap-1">
                    <span>🔧 Pronto</span>
                    {m.soundCue && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                        [{m.soundCue}]
                      </span>
                    )}
                  </div>
                )}
                <p className="whitespace-pre-line">{m.text}</p>
              </div>
            </div>
          ))}

          {/* Live Speech Recognition Transcript Preview */}
          {isListening && transcriptPreview && (
            <div className="flex flex-col items-end">
              <div className="max-w-[85%] rounded-2xl px-4 py-2 text-xs bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-300 dark:border-blue-800 italic">
                Listening: &quot;{transcriptPreview}&quot;...
              </div>
            </div>
          )}

          {/* Thinking / Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-xs text-slate-500">Pronto is calculating telemetry...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Ask:</span>
          {[
            'How does a car engine work?',
            'What is a pit stop?',
            'How do turbochargers work?',
            'Why do tires lose grip?',
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

        {/* Bottom Input Area with Large Voice Mic Button */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          {/* Main Interactive Mic Button (Web Speech API) */}
          <button
            type="button"
            onClick={toggleListening}
            className={`relative p-3.5 rounded-full transition-all duration-300 shadow-md ${
              isListening
                ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-500/40'
                : 'bg-red-600 hover:bg-red-700 text-white hover:scale-105'
            }`}
            title={isListening ? 'Click to stop listening' : 'Click to speak via microphone'}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            {isListening && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {/* Text Input Fallback */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder={isListening ? 'Listening to your voice...' : 'Speak into mic or type question...'}
              className="w-full px-4 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 pr-10"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
