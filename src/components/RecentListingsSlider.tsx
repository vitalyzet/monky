'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart, Sparkles, Clock, Calendar } from 'lucide-react';
import { Listing } from '@/data/mockData';
import { getListingUrl } from '@/lib/slugUtils';
import { formatRealListingDate } from '@/lib/timeUtils';
function formatMileage(mileage?: any): string | null {
  if (!mileage) return null;
  const num = typeof mileage === 'number' ? mileage : parseInt(String(mileage).replace(/\D/g, ''), 10);
  if (isNaN(num)) return String(mileage);
  return `${num.toLocaleString('ro-RO')} km`;
}

interface RecentListingsSliderProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing?: (listing: Listing) => void;
}

export const RecentListingsSlider: React.FC<RecentListingsSliderProps> = ({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Take the latest 16 listings sorted by creation time
  const recentListings = React.useMemo(() => {
    return [...listings]
      .sort((a, b) => {
        const timeA = (a as any).createdAtTime || (a as any).timestamp?.seconds * 1000 || 0;
        const timeB = (b as any).createdAtTime || (b as any).timestamp?.seconds * 1000 || 0;
        return timeB - timeA;
      })
      .slice(0, 16);
  }, [listings]);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollPosition();
    const handleResize = () => checkScrollPosition();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [recentListings]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -360 : 360;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 350);
    }
  };

  if (recentListings.length === 0) return null;

  return (
    <section className="my-6 w-full relative z-10">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Anunțuri noi
          </h2>
          <span className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full bg-[#03c1a2]/15 text-[#03c1a2] border border-[#03c1a2]/30 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#03c1a2] animate-pulse" />
            <span>Recente</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View All Link */}
          <Link
            href="/cautare"
            className="text-xs sm:text-sm font-bold text-[#03c1a2] hover:text-[#02a88d] hover:underline mr-1 sm:mr-2"
          >
            Vezi toate →
          </Link>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`w-8 h-8 rounded-full border border-slate-200 dark:border-[#2f3d4d] bg-white dark:bg-[#1e2732] flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs transition-all ${
              canScrollLeft
                ? 'hover:scale-105 active:scale-95 hover:border-[#03c1a2] hover:text-[#03c1a2] cursor-pointer opacity-100'
                : 'opacity-35 cursor-not-allowed'
            }`}
            title="Derulează la stânga"
          >
            <ChevronLeft size={17} />
          </button>

          <button
            type="button"
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`w-8 h-8 rounded-full border border-slate-200 dark:border-[#2f3d4d] bg-white dark:bg-[#1e2732] flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs transition-all ${
              canScrollRight
                ? 'hover:scale-105 active:scale-95 hover:border-[#03c1a2] hover:text-[#03c1a2] cursor-pointer opacity-100'
                : 'opacity-35 cursor-not-allowed'
            }`}
            title="Derulează la dreapta"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      {/* Horizontal Slider Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {recentListings.map((item) => {
          const isFav = favorites.includes(item.id);
          const resolvedYear = item.year || (() => {
            const match = (item.title || '').match(/\b(19\d\d|20[0-2]\d)\b/);
            return match ? match[0] : null;
          })();

          return (
            <Link
              key={item.id}
              href={getListingUrl(item)}
              onClick={() => {
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('lastViewedAdId', item.id);
                }
                if (onSelectListing) onSelectListing(item);
              }}
              className="w-[210px] xs:w-[230px] sm:w-[250px] flex-shrink-0 bg-white dark:bg-[#1e2732] rounded-2xl border border-slate-200/90 dark:border-[#2f3d4d] shadow-2xs hover:shadow-md hover:border-[#03c1a2]/60 dark:hover:border-[#03c1a2]/50 transition-all duration-200 group cursor-pointer overflow-hidden flex flex-col justify-between block text-inherit no-underline"
            >
              {/* Photo Media */}
              <div>
                <div className="relative aspect-[4/3] w-full bg-slate-100 dark:bg-[#141c24] overflow-hidden">
                  <img
                    src={item.image || '/42.svg'}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/42.svg';
                    }}
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none" />

                  {/* Top Left Badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 pointer-events-none">
                    {item.isPromoted ? (
                      <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs flex items-center gap-1">
                        <Sparkles size={9} />
                        <span>Promovat</span>
                      </span>
                    ) : (
                      <span className="bg-[#03c1a2] text-white font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                        NOU
                      </span>
                    )}
                  </div>

                  {/* Top Right Heart Button */}
                  <button
                    type="button"
                    className="absolute top-2 right-2 w-7.5 h-7.5 rounded-full bg-black/45 hover:bg-black/65 backdrop-blur-md text-white flex items-center justify-center shadow-md z-10 transition-all active:scale-90 hover:scale-105 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(item.id, e);
                    }}
                    title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
                  >
                    <Heart
                      size={14}
                      className={isFav ? 'fill-red-500 text-red-500' : 'text-white'}
                    />
                  </button>

                  {/* Bottom Year Pill */}
                  {resolvedYear && (
                    <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none border border-white/10">
                      <Calendar size={11} className="text-[#03c1a2]" />
                      <span>{resolvedYear}</span>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="p-3">
                  {/* Price */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {item.price && !isNaN(Number(item.price)) && Number(item.price) > 0
                        ? `${Number(item.price).toLocaleString('ro-RO')} ${String(item.currency) === 'RON' || String(item.currency) === 'Lei' ? 'Lei' : item.currency || '€'}`
                        : 'Preț la cerere'}
                    </span>
                    {item.isNegotiable && (
                      <span className="text-[11px] text-slate-400 font-medium">
                        neg.
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#03c1a2] transition-colors mt-1 line-clamp-1 truncate"
                    title={item.title}
                  >
                    {item.title}
                  </h3>

                  {/* Quick Specs (if car) */}
                  {(item.mileage || item.fuel) && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {item.mileage && (
                        <span className="truncate">{formatMileage(item.mileage)}</span>
                      )}
                      {item.mileage && item.fuel && <span>•</span>}
                      {item.fuel && <span>{item.fuel}</span>}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Row */}
              <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10.5px] text-slate-400">
                <span className="truncate max-w-[120px]">
                  {item.location || 'România'}
                </span>
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Clock size={10} />
                  <span>{formatRealListingDate(item)}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
