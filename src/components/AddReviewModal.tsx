'use client';

import React, { useState } from 'react';
import {
  Award,
  Car,
  CheckCircle2,
  MapPin,
  Sparkles,
  Star,
  ThumbsUp,
  Wrench,
  X,
} from 'lucide-react';
import { ServiceCenter, ServiceReview } from '@/lib/types';
import { addServiceReview } from '@/lib/data/reviews';

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceCenters: ServiceCenter[];
  defaultCenterId?: string;
  onReviewAdded?: (newReview: ServiceReview) => void;
}

const COMMON_SERVICES = [
  'Periodic General Service',
  'Engine Oil & Filter Change',
  'Brake Inspection & Fluid Flush',
  'Laser Wheel Alignment & Balancing',
  'AC Anti-Bacterial Sanitization',
  'Clutch & Transmission Service',
  'Battery & Electrical Health Check',
  'Washing & Ceramic Detailing',
];

const POPULAR_TAGS = [
  'Genuine OEM Parts',
  'Prompt Delivery',
  'Clean Workshop Bay',
  'Transparent Billing',
  'Expert Technician',
  'Honest Advisory',
  'Priority Slot Respected',
  'Free Wash Included',
];

export default function AddReviewModal({
  isOpen,
  onClose,
  serviceCenters,
  defaultCenterId,
  onReviewAdded,
}: AddReviewModalProps) {
  const [selectedCenterId, setSelectedCenterId] = useState(defaultCenterId || (serviceCenters[0]?.id || ''));
  const [userName, setUserName] = useState('');
  const [userCity, setUserCity] = useState('Pune');
  const [vehicleModel, setVehicleModel] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [serviceType, setServiceType] = useState(COMMON_SERVICES[0]);
  const [reviewText, setReviewText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>(['Genuine OEM Parts', 'Prompt Delivery']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const currentCenter = serviceCenters.find((c) => c.id === selectedCenterId) || serviceCenters[0];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 4) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !vehicleModel.trim() || !reviewText.trim()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const created = addServiceReview({
        centerId: currentCenter?.id,
        centerName: currentCenter?.name,
        userName: userName.trim(),
        userCity: userCity.trim() || 'Pune',
        vehicleModel: vehicleModel.trim(),
        rating,
        serviceType,
        reviewText: reviewText.trim(),
        tags: selectedTags,
      });

      setIsSubmitting(false);
      setIsSuccess(true);

      if (onReviewAdded) {
        onReviewAdded(created);
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    }, 400);
  };

  const getRatingLabel = (val: number) => {
    switch (val) {
      case 5:
        return 'Outstanding Experience (5/5)';
      case 4:
        return 'Very Good Service (4/5)';
      case 3:
        return 'Average / Satisfactory (3/5)';
      case 2:
        return 'Needs Improvement (2/5)';
      case 1:
      default:
        return 'Unsatisfactory (1/5)';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#161617] rounded-3xl border border-black/[0.08] dark:border-white/[0.12] shadow-2xl overflow-hidden apple-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-black/[0.06] dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#0071E3]/10 text-[#0071E3] dark:text-[#2997FF] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Share Workshop Experience
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Help fellow vehicle owners with verified feedback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Experience Published!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Thank you! Your verified workshop experience has been added to AutoPing's live network.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Service Center Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Service Facility
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-blue-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCenterId}
                  onChange={(e) => setSelectedCenterId(e.target.value)}
                  className="w-full h-10 pl-9 pr-8 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {serviceCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Rating Stars */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Rating
              </label>
              <div className="flex items-center gap-1.5 mb-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = (hoverRating ?? rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-sm'
                            : 'text-slate-300 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                {getRatingLabel(hoverRating ?? rating)}
              </span>
            </div>

            {/* Name & City */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Shekhawat"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your City
                </label>
                <input
                  type="text"
                  placeholder="e.g. Pune, Mumbai"
                  value={userCity}
                  onChange={(e) => setUserCity(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Vehicle & Service Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Vehicle Serviced *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hyundai Creta 2024"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full h-10 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Completed
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full h-10 px-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  {COMMON_SERVICES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Review Experience Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Your Experience Review *
              </label>
              <textarea
                required
                rows={3}
                placeholder="How was the slot scheduling, parts transparency, billing, and vehicle delivery?"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-white/10 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Highlight Tags */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Key Highlights (Select up to 4)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_TAGS.map((tag) => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        selected
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-blue-400'
                      }`}
                    >
                      {selected ? '✓ ' : '+ '}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-full bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#0071E3]/25 transition-all apple-btn cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Submitting Experience...
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    Publish Verified Experience
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
