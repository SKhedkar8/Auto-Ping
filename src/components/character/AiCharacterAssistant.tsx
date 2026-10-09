'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Send,
  MapPin,
  Calendar,
  CheckCircle2,
  Star,
  Shield,
  Car,
  Wrench,
  Download
} from 'lucide-react';
import { CHARACTERS, CharacterDef } from '@/lib/characterData';
import { playCarSound, speakDialogue, stopSpeaking } from '@/lib/characterVoice';
import { playCelebrationFanfare } from '@/lib/celebrationAudio';
import InteractiveCharacterStage from './InteractiveCharacterStage';
import { getClientSession } from '@/lib/auth';
import { ServiceCenter, Vehicle } from '@/lib/types';
import { validateServiceInput } from '@/lib/serviceGuardrail';

interface AiCharacterAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

type SceneStep =
  | 'SELECT_CHARACTER'
  | 'ENTRANCE'
  | 'SERVICE_SELECT'
  | 'LOCATION_SELECT'
  | 'WORKSHOP_SELECT'
  | 'SLOT_SELECT'
  | 'CONFIRMATION'
  | 'SUCCESS';

const SERVICE_OPTIONS = [
  { id: 'general', label: 'General Service', icon: '🔧', price: '₹3,500' },
  { id: 'oil', label: 'Oil Change', icon: '🛢️', price: '₹1,800' },
  { id: 'tyres', label: 'Tyre Service', icon: '🛞', price: '₹1,200' },
  { id: 'battery', label: 'Battery Check', icon: '🔋', price: '₹800' },
  { id: 'brakes', label: 'Brake Service', icon: '🛑', price: '₹2,200' },
  { id: 'ac', label: 'AC Service', icon: '❄️', price: '₹2,400' },
  { id: 'engine', label: 'Engine Service', icon: '⚙️', price: '₹4,500' },
  { id: 'other', label: 'Inspection / Other', icon: '🔍', price: '₹999' },
];

const CITIES = ['Pune', 'Mumbai', 'Bangalore', 'Delhi NCR', 'Hyderabad'];

export default function AiCharacterAssistant({ isOpen, onClose }: AiCharacterAssistantProps) {
  // Character & Speech state
  const [selectedChar, setSelectedChar] = useState<CharacterDef>(CHARACTERS[0]);
  const [step, setStep] = useState<SceneStep>('SELECT_CHARACTER');
  const [dialogue, setDialogue] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [sceneState, setSceneState] = useState<'entrance' | 'idle' | 'driving' | 'happy' | 'thinking'>('idle');

  // User input & Session memory
  const [customInput, setCustomInput] = useState('');
  const [selectedService, setSelectedService] = useState('oil');
  const [selectedCity, setSelectedCity] = useState('Pune');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<ServiceCenter | null>(null);
  const [selectedDate, setSelectedDate] = useState('Tomorrow');
  const [selectedTime, setSelectedTime] = useState('10:30 AM');
  const [bookingCode, setBookingCode] = useState('');

  // Loaded database items
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [workshops, setWorkshops] = useState<ServiceCenter[]>([]);

  // Load user vehicles and service centers on mount
  useEffect(() => {
    const session = getClientSession();
    fetch(`/api/vehicles?userId=${session?.id || 'user-customer-1'}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setUserVehicles(data.data);
          setSelectedVehicle(data.data[0]);
        }
      })
      .catch(() => {});

    fetch('/api/centers')
      .then((res) => res.json())
      .then((data) => {
        if (data.data && data.data.length > 0) {
          setWorkshops(data.data);
          setSelectedWorkshop(data.data[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Voice helper
  const say = (text: string, characterDef: CharacterDef = selectedChar) => {
    setDialogue(text);
    if (!voiceEnabled) return;
    speakDialogue(text, characterDef.id, {
      enabled: voiceEnabled,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
    });
  };

  // Stop speaking when closed
  useEffect(() => {
    if (!isOpen) {
      stopSpeaking();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // ── Step 0: Choose Character ──
  const handleSelectCharacter = (char: CharacterDef) => {
    setSelectedChar(char);
    if (char.id === 'schumacher') {
      playCarSound('ferrari_rev');
    } else {
      playCarSound('rev');
    }
    setStep('ENTRANCE');
    setSceneState('driving');

    setTimeout(() => {
      setSceneState('idle');
      playCarSound('skid');
      say(char.intro, char);
    }, 1200);
  };

  // ── Step 1 -> 2: Proceed to Service Selection ──
  const handleStartServiceFlow = () => {
    playCarSound('vroom');
    setSceneState('driving');
    setStep('SERVICE_SELECT');

    setTimeout(() => {
      setSceneState('idle');
      say("So, what does your car need today? Tap an option below or type your symptoms!");
    }, 600);
  };

  // ── Step 2: Handle Service Selection (Quick chips or Natural language) ──
  const handlePickService = (serviceId: string) => {
    setSelectedService(serviceId);
    const reaction = (selectedChar.reactions as any)[serviceId] || selectedChar.reactions.general;
    setSceneState('happy');
    say(reaction);

    setTimeout(() => {
      setSceneState('driving');
      playCarSound('vroom');
      setTimeout(() => {
        setStep('LOCATION_SELECT');
        setSceneState('idle');
        say(`Alright! Where are we getting this beauty serviced?`);
      }, 700);
    }, 2800);
  };

  const handleCustomInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput.trim()) return;

    // Validate with strict automotive service guardrail to prevent token wastage
    const validation = validateServiceInput(customInput);
    if (!validation.allowed) {
      playCarSound('honk');
      say(
        `⛔ That is not allowed! ${validation.reason || 'Please provide vehicle service-related details only to avoid wasting tokens.'} Or simply tap one of the available service buttons above!`
      );
      return;
    }

    const lower = customInput.toLowerCase();
    let detected = 'general';
    if (lower.includes('oil')) detected = 'oil';
    else if (lower.includes('brake') || lower.includes('stopping')) detected = 'brakes';
    else if (lower.includes('tyre') || lower.includes('tire') || lower.includes('wheel')) detected = 'tyres';
    else if (lower.includes('battery') || lower.includes('start') || lower.includes('charge')) detected = 'battery';
    else if (lower.includes('ac') || lower.includes('cool') || lower.includes('chilled')) detected = 'ac';
    else if (lower.includes('engine') || lower.includes('noise') || lower.includes('smoke')) detected = 'engine';

    setSelectedService(detected);
    const reaction = (selectedChar.reactions as any)[detected] || selectedChar.reactions.general;
    setCustomInput('');
    setSceneState('happy');
    say(`"${customInput}" — Got it! ${reaction}`);

    setTimeout(() => {
      setSceneState('driving');
      playCarSound('vroom');
      setTimeout(() => {
        setStep('LOCATION_SELECT');
        setSceneState('idle');
        say(`Alright! Where are we getting this beauty serviced?`);
      }, 700);
    }, 3200);
  };

  // ── Step 3: Location / Vehicle Selection ──
  const handleConfirmLocation = () => {
    setSceneState('driving');
    playCarSound('vroom');
    setStep('WORKSHOP_SELECT');

    setTimeout(() => {
      setSceneState('idle');
      say(`Alright, I found some top-rated certified workshops near ${selectedCity}! Which one looks best to you?`);
    }, 700);
  };

  // ── Step 4: Workshop Selection ──
  const handlePickWorkshop = (workshop: ServiceCenter) => {
    setSelectedWorkshop(workshop);
    playCarSound('honk');
    setSceneState('happy');
    say(`${workshop.name}! ⭐ ${workshop.rating} rating! Excellent choice, partner!`);

    setTimeout(() => {
      setSceneState('driving');
      playCarSound('vroom');
      setTimeout(() => {
        setStep('SLOT_SELECT');
        setSceneState('idle');
        say("When are we rolling into the bay? Pick a convenient day and time slot!");
      }, 700);
    }, 2400);
  };

  // ── Step 5: Slot Selection ──
  const handleConfirmSlot = () => {
    setSceneState('driving');
    playCarSound('vroom');
    setStep('CONFIRMATION');

    setTimeout(() => {
      setSceneState('idle');
      say("Looks like we've got a winner! Ready to lock in the appointment?");
    }, 700);
  };

  // ── Step 6: Booking Confirmation & Celebration ──
  const handleFinalBooking = async () => {
    const code = `AP-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingCode(code);
    setStep('SUCCESS');
    setSceneState('happy');

    // Trigger celebration fanfare and multi-stage confetti
    try {
      playCelebrationFanfare();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } catch {}

    say(`Yee-haw! Your service slot is locked in! Booking reference ${code}. We're all set, champion!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#121214] rounded-3xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col max-h-[92vh] overflow-hidden my-auto apple-scale-in">
        {/* ── Top Bar ── */}
        <div className="px-5 py-3.5 bg-[#F5F5F7] dark:bg-[#1A1A1C] border-b border-black/[0.08] dark:border-white/[0.08] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🤖</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                  AI Character Assistant
                </h3>
                {step !== 'SELECT_CHARACTER' && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] uppercase">
                    {selectedChar.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#86868b]">
                Interactive Talking Automotive Service Advisor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {step !== 'SELECT_CHARACTER' && (
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  setStep('SELECT_CHARACTER');
                }}
                className="px-2.5 py-1.5 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-[11px] font-medium text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                title="Switch Character"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Switch Character</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (!next) stopSpeaking();
              }}
              className={`p-2 rounded-full transition-colors ${
                voiceEnabled
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-black/5 dark:bg-white/10 text-slate-400'
              }`}
              title={voiceEnabled ? 'Mute Voice' : 'Unmute Voice'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main Stage Area ── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gradient-to-b from-[#F9F9FB] to-white dark:from-[#0E0E10] dark:to-[#161618]">
          {/* ══════════════════════════════════════════════
              SCENE 0: CHARACTER SELECTION SCREEN
              ══════════════════════════════════════════════ */}
          {step === 'SELECT_CHARACTER' && (
            <div className="py-2">
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] mb-2 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Choose Your Guide
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1d1d1f] dark:text-[#f5f5f7]">
                  Choose your AI Assistant
                </h2>
                <p className="text-[13px] text-[#86868b] max-w-md mx-auto mt-1">
                  Select your favorite automotive character. Each has a unique personality, dialogue voice, and service expertise!
                </p>
              </div>

              {/* 10 Character Cards Grid from user's master artwork */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {CHARACTERS.map((char) => (
                  <div
                    key={char.id}
                    onClick={() => handleSelectCharacter(char)}
                    className="group relative cursor-pointer rounded-2xl bg-white dark:bg-[#1C1C1E] border-2 border-black/10 dark:border-white/10 hover:border-[#0071E3] hover:shadow-xl transition-all duration-200 overflow-hidden flex flex-col p-2.5 text-center"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2.5 bg-slate-100 dark:bg-slate-800 border border-black/5 dark:border-white/5">
                      <img
                        src={char.image}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h4 className="font-bold text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] truncate">
                      {char.name}
                    </h4>
                    <p className="text-[10px] text-[#86868b] truncate mt-0.5 mb-2">
                      {char.title}
                    </p>
                    <button
                      type="button"
                      className="mt-auto w-full py-1.5 rounded-lg text-[11px] font-semibold bg-[#0071E3] text-white group-hover:bg-[#0077ED] transition-colors shadow-xs"
                    >
                      Choose 🚗
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 1: ENTRANCE & GREETING
              ══════════════════════════════════════════════ */}
          {step === 'ENTRANCE' && (
            <div className="flex flex-col items-center justify-center py-4">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState={sceneState}
                sceneName="Garage Entrance"
              />

              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleStartServiceFlow}
                  className="px-8 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[14px] font-semibold transition-all shadow-lg shadow-[#0071E3]/25 flex items-center gap-2 apple-btn"
                >
                  <span>Let's Service My Car!</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 2: SERVICE SELECTION
              ══════════════════════════════════════════════ */}
          {step === 'SERVICE_SELECT' && (
            <div className="flex flex-col items-center py-2">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState={sceneState}
                sceneName="Diagnostic Center"
              />

              {/* Service chips */}
              <div className="w-full max-w-xl mt-4">
                <p className="text-center text-[12px] font-semibold uppercase tracking-wider text-[#86868b] mb-3">
                  Select Required Service
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                  {SERVICE_OPTIONS.map((srv) => (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handlePickService(srv.id)}
                      className={`p-3 rounded-xl border text-left transition-all apple-btn flex flex-col justify-between ${
                        selectedService === srv.id
                          ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-md shadow-[#0071E3]/20'
                          : 'bg-white dark:bg-[#1c1c1e] text-[#1d1d1f] dark:text-[#f5f5f7] border-black/10 dark:border-white/10 hover:border-[#0071E3]/40'
                      }`}
                    >
                      <span className="text-xl mb-1.5">{srv.icon}</span>
                      <span className="font-semibold text-[12px] line-clamp-1">{srv.label}</span>
                      <span className={`text-[10px] mt-1 ${selectedService === srv.id ? 'text-white/80' : 'text-[#86868b]'}`}>
                        ~{srv.price}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Natural text input */}
                <form onSubmit={handleCustomInputSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Or type your own requirement... (e.g. brakes making noise)"
                    className="w-full px-4 py-3 pr-12 rounded-full bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#0071E3] shadow-sm"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 p-2 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 3: LOCATION & VEHICLE SELECTION
              ══════════════════════════════════════════════ */}
          {step === 'LOCATION_SELECT' && (
            <div className="flex flex-col items-center py-2">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState={sceneState}
                sceneName="Scenic Highway Map"
              />

              <div className="w-full max-w-lg mt-4 space-y-4">
                {/* Vehicle picker */}
                {userVehicles.length > 0 && (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 shadow-sm">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                      Selected Vehicle
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0071E3]/10 text-[#0071E3] flex items-center justify-center shrink-0">
                        <Car className="w-5 h-5" />
                      </div>
                      <select
                        value={selectedVehicle?.id}
                        onChange={(e) => {
                          const v = userVehicles.find((item) => item.id === e.target.value);
                          if (v) setSelectedVehicle(v);
                        }}
                        className="flex-1 px-3 py-2 rounded-xl text-[13px] font-semibold bg-[#F5F5F7] dark:bg-[#2C2C2E] border border-black/10 dark:border-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] focus:outline-none"
                      >
                        {userVehicles.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.brandName} {v.modelName} ({v.registrationNo})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* City selection pills */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 shadow-sm">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2.5">
                    Select Your City
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CITIES.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => setSelectedCity(city)}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
                          selectedCity === city
                            ? 'bg-[#0071E3] text-white shadow-xs'
                            : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7] hover:bg-black/5 dark:hover:bg-white/10'
                        }`}
                      >
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {city}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('SERVICE_SELECT')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmLocation}
                    className="px-6 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold transition-all shadow-md shadow-[#0071E3]/20 flex items-center gap-1.5 apple-btn"
                  >
                    <span>Find Certified Centers</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 4: WORKSHOP DISCOVERY & COMPARISON
              ══════════════════════════════════════════════ */}
          {step === 'WORKSHOP_SELECT' && (
            <div className="flex flex-col items-center py-2">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState={sceneState}
                sceneName="Workshop District"
              />

              <div className="w-full max-w-xl mt-4 space-y-3">
                <p className="text-center text-[12px] font-semibold uppercase tracking-wider text-[#86868b] mb-2">
                  Nearby Certified Workshops in {selectedCity}
                </p>

                {workshops.slice(0, 3).map((shop) => (
                  <div
                    key={shop.id}
                    onClick={() => handlePickWorkshop(shop)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 apple-btn flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      selectedWorkshop?.id === shop.id
                        ? 'bg-white dark:bg-[#1c1c1e] border-2 border-[#0071E3] shadow-md shadow-[#0071E3]/15'
                        : 'bg-white dark:bg-[#1c1c1e] border-black/10 dark:border-white/10 hover:border-[#0071E3]/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-[14px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                          {shop.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#86868b]">
                          {shop.type}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#86868b] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#0071E3]" />
                        {shop.address}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-[#86868b]">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-500" />
                          {shop.rating}
                        </span>
                        <span>•</span>
                        <span>{shop.distanceKm || '2.8'} km away</span>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">Immediate slots</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`px-4 py-2 rounded-full text-[12px] font-semibold shrink-0 transition-colors ${
                        selectedWorkshop?.id === shop.id
                          ? 'bg-[#0071E3] text-white shadow-xs'
                          : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7]'
                      }`}
                    >
                      {selectedWorkshop?.id === shop.id ? '✓ Selected' : 'Choose Workshop'}
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setStep('LOCATION_SELECT')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white pt-2"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Location
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 5: DATE & SLOT SELECTION
              ══════════════════════════════════════════════ */}
          {step === 'SLOT_SELECT' && (
            <div className="flex flex-col items-center py-2">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState={sceneState}
                sceneName="Booking Bay"
              />

              <div className="w-full max-w-lg mt-4 space-y-4">
                {/* Date pills */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 shadow-sm">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2.5">
                    Appointment Date
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Today', 'Tomorrow', 'This Saturday'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setSelectedDate(d)}
                        className={`py-2 rounded-xl text-[12px] font-semibold transition-all ${
                          selectedDate === d
                            ? 'bg-[#0071E3] text-white shadow-xs'
                            : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7]'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time slot pills */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 shadow-sm">
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#86868b] mb-2.5">
                    Service Slot Time
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['09:00 AM', '11:30 AM', '02:30 PM', '04:30 PM'].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-xl text-[12px] font-semibold transition-all ${
                          selectedTime === t
                            ? 'bg-[#0071E3] text-white shadow-xs'
                            : 'bg-[#F5F5F7] dark:bg-[#2C2C2E] text-[#1d1d1f] dark:text-[#f5f5f7]'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('WORKSHOP_SELECT')}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#86868b] hover:text-[#1d1d1f] dark:hover:text-white"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmSlot}
                    className="px-6 py-2.5 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold transition-all shadow-md shadow-[#0071E3]/20 flex items-center gap-1.5 apple-btn"
                  >
                    <span>Review Summary</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 6: CONFIRMATION SUMMARY
              ══════════════════════════════════════════════ */}
          {step === 'CONFIRMATION' && (
            <div className="flex flex-col items-center py-2">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState={sceneState}
                sceneName="Final Review"
              />

              <div className="w-full max-w-lg mt-4 bg-white dark:bg-[#1c1c1e] p-5 rounded-3xl border border-black/10 dark:border-white/10 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-[12px] font-bold uppercase text-[#86868b]">Vehicle</span>
                  <span className="font-semibold text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {selectedVehicle?.brandName} {selectedVehicle?.modelName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-[12px] font-bold uppercase text-[#86868b]">Service</span>
                  <span className="font-semibold text-[13px] text-[#0071E3] dark:text-[#2997FF] uppercase">
                    {SERVICE_OPTIONS.find((s) => s.id === selectedService)?.label || 'General Checkup'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <span className="text-[12px] font-bold uppercase text-[#86868b]">Workshop</span>
                  <span className="font-semibold text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {selectedWorkshop?.name || 'AutoPing Certified Garage'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2">
                  <span className="text-[12px] font-bold uppercase text-[#86868b]">Schedule</span>
                  <span className="font-semibold text-[13px] text-[#1d1d1f] dark:text-[#f5f5f7]">
                    {selectedDate} at {selectedTime}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFinalBooking}
                  className="w-full mt-4 py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold text-[14px] transition-all shadow-xl shadow-[#0071E3]/25 flex items-center justify-center gap-2 apple-btn"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Lock In Appointment With {selectedChar.name}!</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              SCENE 7: CELEBRATION & SUCCESS
              ══════════════════════════════════════════════ */}
          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center text-center py-4">
              <InteractiveCharacterStage
                character={selectedChar}
                dialogue={dialogue}
                isSpeaking={isSpeaking}
                voiceEnabled={voiceEnabled}
                onToggleVoice={() => setVoiceEnabled(!voiceEnabled)}
                sceneState="happy"
                sceneName="Victory Celebration!"
              />

              <div className="mt-4 p-5 rounded-2xl bg-white dark:bg-[#1c1c1e] border border-black/10 dark:border-white/10 shadow-lg max-w-md w-full">
                <span className="text-3xl mb-2 inline-block">🏆</span>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#86868b]">
                  Booking Reference
                </p>
                <p className="font-mono text-2xl font-bold text-[#0071E3] dark:text-[#2997FF] my-1">
                  {bookingCode}
                </p>
                <p className="text-[12px] text-[#86868b]">
                  {selectedWorkshop?.name} • {selectedDate} at {selectedTime}
                </p>

                <div className="flex gap-2.5 mt-5">
                  <a
                    href="/bookings"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-full bg-[#0071E3] text-white text-[12px] font-semibold text-center hover:bg-[#0077ED] transition-colors"
                  >
                    View My Bookings
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setStep('SELECT_CHARACTER');
                    }}
                    className="px-4 py-2.5 rounded-full bg-black/5 dark:bg-white/10 text-[#1d1d1f] dark:text-[#f5f5f7] text-[12px] font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
