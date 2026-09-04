'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Listing } from '@/data/mockData';
import { CarListingCard } from './ListingGrid';
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
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {recentListings.map((item) => {
          const isFav = favorites.includes(item.id);
          return (
            <div
              key={item.id}
              className="w-[180px] xs:w-[200px] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-12px)] lg:w-[calc(25%-12px)] xl:w-[calc(20%-12px)] flex-shrink-0 snap-start"
            >
              <CarListingCard
                item={item as any}
                isFav={isFav}
                onToggleFavorite={onToggleFavorite}
                onSelectListing={onSelectListing}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
};
