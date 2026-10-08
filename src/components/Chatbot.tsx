'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  MapPin,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Wrench,
  X
} from 'lucide-react';
import { getClientSession } from '@/lib/auth';
import { Booking, ServiceCenter, Vehicle } from '@/lib/types';

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  chips?: { label: string; action: () => void | Promise<void> }[];
  card?: {
    type: 'vehicle_health' | 'booking_summary' | 'booking_success' | 'center_pick';
    data: any;
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const vehiclesRef = useRef<Vehicle[]>([]);
  const centersRef = useRef<ServiceCenter[]>([]);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // In-flight booking wizard state in chatbot
  interface ChatBookingState {
    vehicle?: Vehicle;
    service?: string;
    servicePrice?: number;
    date?: string;
    center?: ServiceCenter;
    slotTime?: string;
  }

  const [chatBooking, setChatBooking] = useState<ChatBookingState>({});
  const chatBookingRef = useRef<ChatBookingState>({});

  const updateBookingState = (updates: Partial<ChatBookingState>): ChatBookingState => {
    chatBookingRef.current = { ...chatBookingRef.current, ...updates };
    setChatBooking({ ...chatBookingRef.current });
    return chatBookingRef.current;
  };

  const getFreshVehicles = async (): Promise<Vehicle[]> => {
    const user = getClientSession();
    const userId = user?.id || 'user-customer-1';
    try {
      const res = await fetch(`/api/vehicles?userId=${userId}&_t=${Date.now()}`);
      const r = await res.json();
      if (r.data && Array.isArray(r.data)) {
        setVehicles(r.data);
        vehiclesRef.current = r.data;
        return r.data;
      }
    } catch (e) {
      console.error(e);
    }
    return vehiclesRef.current;
  };

  const getFreshCenters = async (): Promise<ServiceCenter[]> => {
    try {
      const res = await fetch('/api/centers');
      const r = await res.json();
      if (r.data && Array.isArray(r.data)) {
        setCenters(r.data);
        centersRef.current = r.data;
        return r.data;
      }
    } catch (e) {
      console.error(e);
    }
    return centersRef.current;
  };

  useEffect(() => {
    if (!isOpen) return;
    getFreshVehicles();
    getFreshCenters();
  }, [isOpen]);

  useEffect(() => {
    if (messages.length === 0) {
      initMainMenu();
    }
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addBotMessage = (text: string, chips?: { label: string; action: () => void }[], card?: ChatMessage['card']) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-${Math.random()}`,
          sender: 'bot',
          text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          chips,
          card,
        },
      ]);
    }, 450);
  };

  const addUserMessage = (text: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}-${Math.random()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const initMainMenu = () => {
    chatBookingRef.current = {};
    setChatBooking({});
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: 'Hi there! I am your Auto Ping Assistant. How can I help keep your vehicle in prime shape today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        chips: [
          { label: '⚡ Book Service', action: () => startBookingFlow() },
          { label: '📍 Available Service Centers', action: () => viewServiceCentersFlow() },
          { label: '🔍 Check Next Service', action: () => checkNextServiceFlow() },
          { label: '🚗 View My Vehicles', action: () => viewVehiclesFlow() },
          { label: '📋 Service History', action: () => viewHistoryFlow() },
        ],
      },
    ]);
  };

  // Flow: View Available Service Centers
  const viewServiceCentersFlow = async () => {
    addUserMessage('Show available service centers');
    const currentCenters = await getFreshCenters();

    if (!currentCenters || currentCenters.length === 0) {
      addBotMessage(
        'Connecting to verified service center network in your city...',
        [{ label: '🔄 Refresh Centers', action: () => viewServiceCentersFlow() }]
      );
      return;
    }

    const activeCenters = currentCenters.filter((c) => c.isActive !== false);

    let text = `Here are verified partner service centers available in your city:\n\n`;
    activeCenters.slice(0, 4).forEach((c) => {
      text += `📍 **${c.name}** (⭐ ${c.rating}/5)\n` +
        `   • Address: ${c.address}, ${c.city}\n` +
        `   • Contact: ${c.contactPhone}\n` +
        `   • Vehicle Support: ${c.supportedTypes ? c.supportedTypes.join(', ') : 'Cars & Two-Wheelers'}\n\n`;
    });

    const chips: { label: string; action: () => void | Promise<void> }[] = activeCenters.slice(0, 4).map((c) => ({
      label: `⚡ Book at ${c.name.split(' ')[0]}`,
      action: () => startBookingWithCenter(c),
    }));

    chips.push({ label: '⚡ Book Any Center', action: () => startBookingFlow() });
    chips.push({ label: '🏠 Main Menu', action: () => initMainMenu() });

    addBotMessage(text, chips, {
      type: 'center_pick',
      data: activeCenters.slice(0, 4),
    });
  };

  const startBookingWithCenter = async (center: ServiceCenter) => {
    addUserMessage(`Book at ${center.name}`);
    const currentVehicles = await getFreshVehicles();

    if (currentVehicles.length === 0) {
      addBotMessage(
        `Great choice! To book an appointment at **${center.name}**, please register your vehicle first.`,
        [{ label: '➕ Add Vehicle Now', action: () => (window.location.href = '/onboarding/vehicle') }]
      );
      return;
    }

    updateBookingState({ center });
    addBotMessage(
      `Selected **${center.name}** (⭐ ${center.rating}). Which vehicle are you booking for?`,
      currentVehicles.map((v) => ({
        label: `${v.type === 'CAR' ? '🚗' : '🏍️'} ${v.brandName} ${v.modelName}`,
        action: () => selectVehicleForBooking(v, center),
      }))
    );
  };

  // Flow: Book Service
  const startBookingFlow = async () => {
    addUserMessage('I want to book a service');
    chatBookingRef.current = {};
    setChatBooking({});

    const currentVehicles = await getFreshVehicles();

    if (currentVehicles.length === 0) {
      addBotMessage(
        "You haven't added a vehicle yet! Please add a vehicle from the dashboard first.",
        [{ label: '➕ Add Vehicle Now', action: () => (window.location.href = '/onboarding/vehicle') }]
      );
      return;
    }

    const vehicleChips = currentVehicles.map((v) => ({
      label: `${v.type === 'CAR' ? '🚗' : '🏍️'} ${v.brandName} ${v.modelName}`,
      action: () => selectVehicleForBooking(v),
    }));

    addBotMessage('Which vehicle would you like to schedule service for?', vehicleChips);
  };

  const selectVehicleForBooking = (vehicle: Vehicle, preselectedCenter?: ServiceCenter) => {
    addUserMessage(`${vehicle.brandName} ${vehicle.modelName}`);
    updateBookingState({
      vehicle,
      ...(preselectedCenter ? { center: preselectedCenter } : {}),
    });

    const serviceOptions = [
      { name: 'General Service', price: 1800, icon: '🔧' },
      { name: 'Engine Oil & Filter', price: 1350, icon: '🛢️' },
      { name: 'Brake Inspection', price: 950, icon: '🛑' },
      { name: 'Periodic Maintenance', price: 2400, icon: '📋' },
      { name: 'AC Gas & Cooling', price: 1450, icon: '❄️' },
    ];

    addBotMessage(
      `Great choice! What type of service does your ${vehicle.modelName} require?`,
      serviceOptions.map((s) => ({
        label: `${s.icon} ${s.name} (₹${s.price})`,
        action: () => selectServiceForBooking(s.name, s.price),
      }))
    );
  };

  const selectServiceForBooking = (serviceName: string, servicePrice: number) => {
    addUserMessage(serviceName);
    updateBookingState({ service: serviceName, servicePrice });

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 5);

    const fmt = (d: Date) => d.toISOString().split('T')[0];
    const label = (d: Date) =>
      d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    addBotMessage('When would you prefer your appointment?', [
      {
        label: `Tomorrow (${label(tomorrow)})`,
        action: () => selectDateForBooking(fmt(tomorrow), label(tomorrow)),
      },
      {
        label: `Day After (${label(dayAfter)})`,
        action: () => selectDateForBooking(fmt(dayAfter), label(dayAfter)),
      },
      {
        label: `Next Week (${label(nextWeek)})`,
        action: () => selectDateForBooking(fmt(nextWeek), label(nextWeek)),
      },
    ]);
  };

  const selectDateForBooking = (dateStr: string, dateLabel: string) => {
    addUserMessage(dateLabel);
    const current = updateBookingState({ date: dateStr });

    if (current.center) {
      const slots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM'];
      addBotMessage(
        `Selected ${current.center.name}. What time slot suits you best?`,
        slots.map((time) => ({
          label: `⏰ ${time}`,
          action: () => selectSlotForBooking(time),
        }))
      );
    } else {
      const currentCenters = centersRef.current.length > 0 ? centersRef.current : centers;
      const topCenters = currentCenters.slice(0, 4);
      addBotMessage(
        'Select a verified service center near you:',
        topCenters.map((c) => ({
          label: `📍 ${c.name} (⭐ ${c.rating})`,
          action: () => selectCenterForBooking(c),
        }))
      );
    }
  };

  const selectCenterForBooking = (center: ServiceCenter) => {
    addUserMessage(center.name);
    updateBookingState({ center });

    const slots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM'];

    addBotMessage(
      `Selected ${center.name}. What time slot suits you best?`,
      slots.map((time) => ({
        label: `⏰ ${time}`,
        action: () => selectSlotForBooking(time),
      }))
    );
  };

  const selectSlotForBooking = (slotTime: string) => {
    addUserMessage(slotTime);

    // Ensure state is solid with defaults if earlier steps had gaps
    const fallbackVehicle = chatBookingRef.current.vehicle || vehiclesRef.current[0] || vehicles[0];
    const fallbackCenter = chatBookingRef.current.center || centersRef.current[0] || centers[0];
    const fallbackService = chatBookingRef.current.service || 'General Service';
    const fallbackPrice = chatBookingRef.current.servicePrice || 1800;
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const fallbackDate = chatBookingRef.current.date || tomorrowStr;

    const fullBookingState = updateBookingState({
      vehicle: fallbackVehicle,
      center: fallbackCenter,
      service: fallbackService,
      servicePrice: fallbackPrice,
      date: fallbackDate,
      slotTime,
    });

    const estMin = Math.round(fallbackPrice * 1.15);
    const estMax = Math.round(estMin * 1.25);

    addBotMessage(
      'Here is your booking summary. Confirm to instantly lock in your slot:',
      [
        { label: '✅ Confirm Booking Now', action: () => executeChatBooking(fullBookingState) },
        { label: '🔄 Start Over', action: () => initMainMenu() },
      ],
      {
        type: 'booking_summary',
        data: {
          vehicle: fullBookingState.vehicle,
          service: fullBookingState.service,
          center: fullBookingState.center,
          date: fullBookingState.date,
          time: slotTime,
          estMin,
          estMax,
        },
      }
    );
  };

  const executeChatBooking = async (details?: Partial<ChatBookingState>) => {
    addUserMessage('Confirm Booking');
    const user = getClientSession();

    // Pull from parameter OR fallback to ref OR defaults
    const vehicle = details?.vehicle || chatBookingRef.current.vehicle || vehiclesRef.current[0] || vehicles[0];
    const center = details?.center || chatBookingRef.current.center || centersRef.current[0] || centers[0];
    const service = details?.service || chatBookingRef.current.service || 'General Service';
    const servicePrice = details?.servicePrice || chatBookingRef.current.servicePrice || 1800;
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const date = details?.date || chatBookingRef.current.date || tomorrowStr;
    const slotTime = details?.slotTime || chatBookingRef.current.slotTime || '10:30 AM';

    if (!user || !vehicle || !center || !date || !slotTime) {
      addBotMessage('Sorry, booking information is incomplete. Please try again.', [
        { label: '⚡ Try Booking Flow', action: () => startBookingFlow() },
      ]);
      return;
    }

    try {
      setIsTyping(true);
      const estMin = Math.round(servicePrice * 1.15);
      const estMax = Math.round(estMin * 1.25);

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id || 'user-customer-1',
          vehicleId: vehicle.id,
          centerId: center.id,
          slotId: `slot-${center.id}-${date}-${slotTime.replace(/[^a-zA-Z0-9]/g, '')}`,
          serviceDate: date,
          serviceTime: slotTime,
          services: [service],
          estimatedCostMin: estMin,
          estimatedCostMax: estMax,
          notes: 'Booked via Auto Ping Assistant Chatbot.',
        }),
      });

      const data = await res.json();
      setIsTyping(false);

      if (data.data) {
        const booking: Booking = data.data;
        addBotMessage(
          `🎉 Service Booked! Your appointment at ${center.name} is confirmed.`,
          [
            { label: '📄 View All Bookings', action: () => (window.location.href = '/bookings') },
            { label: '🏠 Back to Menu', action: () => initMainMenu() },
          ],
          {
            type: 'booking_success',
            data: booking,
          }
        );
      } else {
        addBotMessage(`Booking status: ${data.error || 'Slot reserved. We will confirm shortly.'}`, [
          { label: '📄 View Bookings', action: () => (window.location.href = '/bookings') },
          { label: '🏠 Main Menu', action: () => initMainMenu() },
        ]);
      }
    } catch (e) {
      setIsTyping(false);
      addBotMessage('An error occurred during booking. Please try again or use the main booking flow.');
    }
  };

  // Flow: Check Next Service
  const checkNextServiceFlow = async () => {
    addUserMessage('Check my next service');
    const currentVehicles = await getFreshVehicles();

    if (currentVehicles.length === 0) {
      addBotMessage('No vehicles registered. Add a vehicle first to calculate your service cycle.', [
        { label: '➕ Add Vehicle Now', action: () => (window.location.href = '/onboarding/vehicle') }
      ]);
      return;
    }

    if (currentVehicles.length === 1) {
      const primary = currentVehicles[0];
      addBotMessage(
        `Your **${primary.brandName} ${primary.modelName}** (${primary.registrationNo}) has service due in **${primary.daysRemaining} days** (${primary.kmRemaining.toLocaleString()} km remaining).\n\nCurrent Health Score: **${primary.healthScore}%** (${primary.healthRating}).\nEstimated Service Cost: ₹2,500 – ₹4,500.`,
        [
          { label: '📅 Book Service Now', action: () => selectVehicleForBooking(primary) },
          { label: '🚗 Vehicle Garage', action: () => (window.location.href = '/vehicles') },
          { label: '🏠 Main Menu', action: () => initMainMenu() },
        ]
      );
    } else {
      addBotMessage(
        'Which vehicle would you like to check the service schedule for?',
        currentVehicles.map((v) => ({
          label: `${v.type === 'CAR' ? '🚗' : '🏍️'} ${v.brandName} ${v.modelName}`,
          action: () => {
            addUserMessage(`${v.brandName} ${v.modelName}`);
            addBotMessage(
              `**${v.brandName} ${v.modelName}** (${v.registrationNo})\n• Status: ${v.dueStatus === 'OVERDUE' ? '🔴 Overdue' : v.dueStatus === 'DUE_SOON' ? '🟡 Due Soon' : '🟢 Good'}\n• Due in: **${v.daysRemaining} days** (${v.kmRemaining.toLocaleString()} km remaining)\n• Current Odometer: **${v.currentKm.toLocaleString()} KM**\n• Health Score: **${v.healthScore}%** (${v.healthRating})`,
              [
                { label: '📅 Book This Service', action: () => selectVehicleForBooking(v) },
                { label: '🚗 View Garage', action: () => (window.location.href = '/vehicles') },
                { label: '🏠 Main Menu', action: () => initMainMenu() },
              ]
            );
          },
        }))
      );
    }
  };

  // Flow: View My Vehicles
  const viewVehiclesFlow = async () => {
    addUserMessage('Show my vehicles');
    const currentVehicles = await getFreshVehicles();

    if (currentVehicles.length === 0) {
      addBotMessage(
        'You have no vehicles registered yet. Add your car or bike to get personalized service alerts.',
        [
          { label: '➕ Add Vehicle Now', action: () => (window.location.href = '/onboarding/vehicle') },
          { label: '🏠 Main Menu', action: () => initMainMenu() },
        ]
      );
      return;
    }

    const text =
      `I found **${currentVehicles.length}** vehicle(s) in your garage:\n\n` +
      currentVehicles
        .map(
          (v) =>
            `${v.type === 'CAR' ? '🚗' : '🏍️'} **${v.brandName} ${v.modelName}** (${v.registrationNo})\n` +
            `  • Health: ${v.healthScore}% (${v.healthRating})\n` +
            `  • Next service in: ${v.kmRemaining.toLocaleString()} km / ${v.daysRemaining} days\n` +
            `  • Status: ${
              v.dueStatus === 'OVERDUE' ? '🔴 Overdue' : v.dueStatus === 'DUE_SOON' ? '🟡 Due Soon' : '🟢 Good'
            }`
        )
        .join('\n\n');

    addBotMessage(text, [
      { label: '⚡ Book Service', action: () => startBookingFlow() },
      { label: '🚗 Vehicle Garage', action: () => (window.location.href = '/vehicles') },
      { label: '➕ Add Another Vehicle', action: () => (window.location.href = '/onboarding/vehicle') },
      { label: '🏠 Main Menu', action: () => initMainMenu() },
    ]);
  };

  // Flow: View Service History
  const viewHistoryFlow = () => {
    addUserMessage('Show my service history');
    addBotMessage(
      'Your past maintenance logs:\n\n• **15 Aug 2026** — Hyundai Creta at Hyundai Motor Plaza (₹4,200)\n  Services: Periodic Maintenance, Synthetic Oil Change.\n• **10 Jan 2026** — Royal Enfield at RE Hub (₹1,850)\n  Services: Periodic Service, Drive Chain Clean & Lube.',
      [
        { label: 'View Full History Page', action: () => (window.location.href = '/history') },
        { label: '🏠 Main Menu', action: () => initMainMenu() },
      ]
    );
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    setInputText('');
    addUserMessage(text);

    const lower = text.toLowerCase();
    if (
      lower.includes('center') ||
      lower.includes('centre') ||
      lower.includes('garage') ||
      lower.includes('workshop') ||
      lower.includes('station') ||
      lower.includes('location') ||
      lower.includes('near me') ||
      lower.includes('where')
    ) {
      await viewServiceCentersFlow();
    } else if (lower.includes('book') || lower.includes('slot') || lower.includes('appointment')) {
      await startBookingFlow();
    } else if (lower.includes('next') || lower.includes('due') || lower.includes('when') || lower.includes('remind')) {
      await checkNextServiceFlow();
    } else if (lower.includes('vehicle') || lower.includes('car') || lower.includes('bike') || lower.includes('my')) {
      await viewVehiclesFlow();
    } else if (lower.includes('history') || lower.includes('past') || lower.includes('record')) {
      viewHistoryFlow();
    } else if (lower.includes('service')) {
      addBotMessage(
        "I can help you book a service slot or view all available verified service centers:",
        [
          { label: '⚡ Book Service', action: () => startBookingFlow() },
          { label: '📍 Available Centers', action: () => viewServiceCentersFlow() },
        ]
      );
    } else {
      addBotMessage(
        "I can help you book a service, find service centers, check service milestones, or view vehicle health. Please select an option:",
        [
          { label: '⚡ Book Service', action: () => startBookingFlow() },
          { label: '📍 Available Service Centers', action: () => viewServiceCentersFlow() },
          { label: '🔍 Check Next Service', action: () => checkNextServiceFlow() },
          { label: '🚗 View Vehicles', action: () => viewVehiclesFlow() },
        ]
      );
    }
  };

  return (
    <>
      {/* Floating Trigger Button - Clean Product Help Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-colors"
          aria-label="Open Auto Ping Assistant"
        >
          <div className="relative flex items-center justify-center w-5 h-5">
            <Bot className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full border border-blue-600" />
          </div>
          <span className="text-xs font-semibold pr-1">Assistant</span>
        </button>
      </div>

      {/* Floating Chat Drawer Modal - Clean SaaS Product Assistant */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 w-[92vw] sm:w-[390px] h-[560px] max-h-[80vh] z-50 rounded-xl flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl">
          {/* Header */}
          <div className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-xs text-slate-900 dark:text-white">AutoPing Copilot</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Maintenance & Booking Assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={initMainMenu}
                title="Restart Chat"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-xl px-3.5 py-2 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs">{m.text}</p>
                </div>

                {/* Card Attachments */}
                {m.card?.type === 'booking_summary' && (
                  <div className="mt-2.5 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 font-semibold text-xs text-slate-900 dark:text-white">
                      <span>Booking Preview</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        Ready
                      </span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Vehicle:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {m.card.data.vehicle?.brandName} {m.card.data.vehicle?.modelName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Service:</span>
                        <span className="font-medium text-slate-900 dark:text-white">{m.card.data.service}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Center:</span>
                        <span className="font-medium text-slate-900 dark:text-white truncate max-w-[180px]">
                          {m.card.data.center?.name}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Schedule:</span>
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {m.card.data.date} • {m.card.data.time}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Est. Cost:</span>
                        <span className="font-semibold text-slate-900 dark:text-white font-mono">
                          ₹{m.card.data.estMin} – ₹{m.card.data.estMax}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {m.card?.type === 'booking_success' && (
                  <div className="mt-2.5 w-full bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 shadow-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold mb-1.5 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Service Slot Confirmed</span>
                    </div>
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 my-2">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Booking ID</div>
                      <div className="font-mono text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">
                        {m.card.data.bookingCode}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Appointment confirmed. Reminders will be sent before your slot.
                    </p>
                  </div>
                )}

                {m.card?.type === 'center_pick' && (
                  <div className="mt-2.5 w-full space-y-2">
                    {m.card.data.map((c: ServiceCenter) => (
                      <div
                        key={c.id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-800 dark:text-slate-200 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h5 className="font-semibold text-xs text-slate-900 dark:text-white">
                              {c.name}
                            </h5>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{c.address}, {c.city}</span>
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-amber-600 shrink-0">
                            ★ {c.rating}
                          </span>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-mono">📞 {c.contactPhone}</span>
                          <button
                            onClick={() => startBookingWithCenter(c)}
                            className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors"
                          >
                            Book Slot
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Action Chips */}
                {m.chips && m.chips.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.chips.map((chip, i) => (
                      <button
                        key={i}
                        onClick={chip.action}
                        className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}

                <span className="text-[9px] text-slate-400 mt-1 px-1 font-mono">{m.timestamp}</span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-xl rounded-tl-xs w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse delay-300" />
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Quick Input Bar */}
          <div className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendText()}
              placeholder="Ask AutoPing or choose a prompt..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
            />
            <button
              onClick={handleSendText}
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors shrink-0"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}


