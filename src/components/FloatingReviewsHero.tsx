'use client';

import React, { useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronRight,
  Compass,
  Heart,
  MessageSquarePlus,
  Play,
  Pause,
  ShieldCheck,
  Sparkles,
  Star,
  ThumbsUp,
  Wrench,
} from 'lucide-react';
import { ServiceCenter, ServiceReview } from '@/lib/types';
import { getAllReviews } from '@/lib/data/reviews';
import AddReviewModal from './AddReviewModal';

interface FloatingReviewsHeroProps {
  serviceCenters?: ServiceCenter[];
}

export default function FloatingReviewsHero({ serviceCenters = [] }: FloatingReviewsHeroProps) {
  const [reviews, setReviews] = useState<ServiceReview[]>(() => getAllReviews());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'AUTHORIZED' | 'MULTI' | 'TWO_WHEELER'>('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const [likedReviewIds, setLikedReviewIds] = useState<Record<string, number>>({});

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedReviewIds((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const filteredReviews = reviews.filter((r) => {
    if (activeCategory === 'ALL') return true;
    if (activeCategory === 'AUTHORIZED') {
      return r.centerName?.toLowerCase().includes('authorized') || r.centerName?.toLowerCase().includes('hyundai') || r.centerName?.toLowerCase().includes('tata') || r.centerName?.toLowerCase().includes('enfield');
    }
    if (activeCategory === 'MULTI') {
      return r.centerName?.toLowerCase().includes('multi') || r.centerName?.toLowerCase().includes('castrol') || r.centerName?.toLowerCase().includes('bosch') || r.centerName?.toLowerCase().includes('gomechanic');
    }
    if (activeCategory === 'TWO_WHEELER') {
      return r.vehicleModel?.toLowerCase().includes('enfield') || r.vehicleModel?.toLowerCase().includes('jupiter') || r.vehicleModel?.toLowerCase().includes('bike') || r.vehicleModel?.toLowerCase().includes('scooter');
    }
    return true;
  });

  // Divide into 3 columns for balanced floating lanes
  const lane1 = filteredReviews.filter((_, i) => i % 3 === 0);
  const lane2 = filteredReviews.filter((_, i) => i % 3 === 1);
  const lane3 = filteredReviews.filter((_, i) => i % 3 === 2);

  const handleNewReview = (newReview: ServiceReview) => {
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-white via-slate-50 to-[#F5F5F7] dark:from-[#080808] dark:via-[#0c0d12] dark:to-[#000000] border-b border-black/[0.06] dark:border-white/[0.06]">
      {/* ─── AMBIENT GLOW BACKDROPS ─── */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none animate-ambient-glow" />
      <div className="absolute -bottom-20 right-10 w-[450px] h-[350px] bg-gradient-to-tl from-purple-500/10 via-blue-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ─── SECTION HEADER ─── */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/80 dark:border-blue-800/80 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-spin-slow" />
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Live Motorist Wall of Experiences
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-950 dark:text-white leading-tight">
            Loved by Drivers Across India
          </h2>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mt-3 max-w-2xl mx-auto leading-relaxed">
            Real experiences from verified car &amp; bike owners who schedule periodic maintenance, brake overhauls, and diagnostics through AutoPing.
          </p>

          {/* Interactive Category Selector & Controls */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {[
              { key: 'ALL', label: 'All Reviews' },
              { key: 'AUTHORIZED', label: 'Authorized OEM' },
              { key: 'MULTI', label: 'Multi-Brand Specialists' },
              { key: 'TWO_WHEELER', label: 'Two-Wheelers' },
            ].map(({ key, label }) => {
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20'
                      : 'bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/10'
                  }`}
                >
                  {label}
                </button>
              );
            })}

            {/* Pause / Play animation toggle button */}
            <button
              onClick={() => setIsPaused((p) => !p)}
              className="px-3 py-1.5 rounded-full bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isPaused ? 'Resume floating animation' : 'Pause floating animation'}
            >
              {isPaused ? <Play className="w-3 h-3 text-blue-500" /> : <Pause className="w-3 h-3" />}
              <span>{isPaused ? 'Resume Float' : 'Pause Float'}</span>
            </button>

            {/* Share Experience button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span>Share Your Experience</span>
            </button>
          </div>
        </div>

        {/* ─── LIVE TRUST METRICS COUNTERS STRIP ─── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
          {[
            { metric: '4.9 / 5.0', label: 'Average Workshop Rating', sub: 'Verified by 4,800+ drivers' },
            { metric: '99.4%', label: 'On-time Slot Turnaround', sub: 'Zero bay wait guarantee' },
            { metric: '100%', label: 'Genuine Parts Verified', sub: 'OEM & Castrol holograms' },
            { metric: '₹2,800+', label: 'Average Savings / Year', sub: 'Transparent upfront estimates' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-black/[0.05] dark:border-white/[0.08] shadow-xs text-center"
            >
              <div className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white font-mono">
                {stat.metric}
              </div>
              <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                {stat.label}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {stat.sub}
              </div>
            </div>
          ))}
        </div>

        {/* ─── FLOATING GLASSMORPHIC REVIEW BUBBLES STREAM (3 Lanes Moving Bottom to Top) ─── */}
        <div className="relative h-[620px] rounded-3xl overflow-hidden border border-black/[0.06] dark:border-white/[0.08] bg-slate-950/5 dark:bg-black/40 backdrop-blur-sm p-4 sm:p-6 select-none">
          {/* Subtle Top & Bottom Fade Masks */}
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-[#F5F5F7] dark:from-[#000000] to-transparent z-20 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#F5F5F7] dark:from-[#000000] to-transparent z-20 pointer-events-none" />

          {/* Floating Lanes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full relative z-10">
            {/* Lane 1 */}
            <div className="flex flex-col gap-6 relative">
              {[...lane1, ...lane1].map((r, i) => (
                <div
                  key={`lane1-${r.id}-${i}`}
                  style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                    animationDelay: `${i * 3.8}s`,
                  }}
                  className="animate-float-bubble-1 pause-on-hover"
                >
                  <ReviewBubbleCard review={r} onLike={(e) => handleLike(r.id, e)} extraLikes={likedReviewIds[r.id] || 0} />
                </div>
              ))}
            </div>

            {/* Lane 2 (Offset Speed & Timing) */}
            <div className="hidden md:flex flex-col gap-6 relative">
              {[...lane2, ...lane2].map((r, i) => (
                <div
                  key={`lane2-${r.id}-${i}`}
                  style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                    animationDelay: `${i * 4.4}s`,
                  }}
                  className="animate-float-bubble-2 pause-on-hover"
                >
                  <ReviewBubbleCard review={r} onLike={(e) => handleLike(r.id, e)} extraLikes={likedReviewIds[r.id] || 0} />
                </div>
              ))}
            </div>

            {/* Lane 3 (Offset Speed & Timing) */}
            <div className="hidden md:flex flex-col gap-6 relative">
              {[...lane3, ...lane3].map((r, i) => (
                <div
                  key={`lane3-${r.id}-${i}`}
                  style={{
                    animationPlayState: isPaused ? 'paused' : 'running',
                    animationDelay: `${i * 5.1}s`,
                  }}
                  className="animate-float-bubble-3 pause-on-hover"
                >
                  <ReviewBubbleCard review={r} onLike={(e) => handleLike(r.id, e)} extraLikes={likedReviewIds[r.id] || 0} />
                </div>
              ))}
            </div>
          </div>

          {/* Floating Interaction Hint */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/80 text-white text-[11px] font-medium backdrop-blur-md border border-white/10 shadow-lg pointer-events-none flex items-center gap-1.5 opacity-80">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Hover over any bubble to pause &amp; read full review</span>
          </div>
        </div>

        {/* ─── BOTTOM CTA: EXPLORE SERVICE MAP ─── */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-blue-600/10 dark:bg-blue-950/40 border border-blue-500/20 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-950 dark:text-white">
                Find highly-rated verified service centers near you
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Browse workshops in Pune, Mumbai, Bengaluru, Delhi on our live Google Maps locator.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-semibold border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
            >
              Write Review
            </button>
            <a
              href="/map"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <span>Open Service Map</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Experience Composer Modal */}
      <AddReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        serviceCenters={serviceCenters}
        onReviewAdded={handleNewReview}
      />
    </section>
  );
}

// Subcomponent: Individual Glassmorphic Bubble Card
function ReviewBubbleCard({
  review,
  onLike,
  extraLikes,
}: {
  review: ServiceReview;
  onLike: (e: React.MouseEvent) => void;
  extraLikes: number;
}) {
  const initials = review.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const totalHelpful = (review.helpfulCount || 12) + extraLikes;

  return (
    <div className="glass-bubble-card p-5 rounded-3xl max-w-sm w-full cursor-pointer relative overflow-hidden group">
      {/* Soft gradient edge glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

      {/* Header: User avatar, name, verified tick */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                {review.userName}
              </h4>
              {review.verifiedBooking && (
                <span title="Verified AutoPing Booking" className="inline-flex">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {review.userCity} • {review.date}
            </p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex items-center gap-0.5 text-amber-400 shrink-0 text-xs font-bold">
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>{review.rating}.0</span>
        </div>
      </div>

      {/* Vehicle & Workshop context */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/50">
          🚗 {review.vehicleModel}
        </span>
        {review.centerName && (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-white/5 line-clamp-1">
            📍 {review.centerName.split(' ')[0]} {review.centerName.split(' ')[1] || ''}
          </span>
        )}
      </div>

      {/* Review quote */}
      <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed italic mb-3">
        &ldquo;{review.reviewText}&rdquo;
      </p>

      {/* Tags and Helpful footer */}
      <div className="flex items-center justify-between pt-2 border-t border-black/[0.05] dark:border-white/[0.08] text-[11px]">
        <div className="flex flex-wrap gap-1">
          {review.tags && review.tags.length > 0 ? (
            review.tags.slice(0, 2).map((t, idx) => (
              <span
                key={idx}
                className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold"
              >
                #{t}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400">Verified Bay Service</span>
          )}
        </div>

        <button
          type="button"
          onClick={onLike}
          className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors"
        >
          <ThumbsUp className="w-3 h-3" />
          <span>Helpful ({totalHelpful})</span>
        </button>
      </div>
    </div>
  );
}
