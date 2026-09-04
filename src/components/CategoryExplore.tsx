'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { OFFICIAL_CATEGORIES, OfficialCategory } from '@/data/categories';

interface CategoryExploreProps {
  selectedCategory?: string | null;
  onSelectCategory?: (catId: string | null, mainTab?: string) => void;
  activeTab?: string;
}

export const CategoryExplore: React.FC<CategoryExploreProps> = () => {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  const checkScrollPosition = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 15);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 15);
    }
  };

  useEffect(() => {
    setIsMounted(true);
    checkScrollPosition();
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat: OfficialCategory) => {
    router.push(`/cautare?category=${encodeURIComponent(cat.id)}`);
  };

  return (
    <section className="my-5 sm:my-7 w-full overflow-hidden relative z-10 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Categorii populare
          </h2>
          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#1c1e22] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#282a30]">
            {OFFICIAL_CATEGORIES.length}
          </span>
        </div>

        {/* Desktop Carousel Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            type="button"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`w-7 h-7 rounded-full border border-slate-200 dark:border-[#282a30] bg-white dark:bg-[#1c1e22] flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs transition-all ${
              canScrollLeft ? 'hover:scale-105 active:scale-95 cursor-pointer opacity-100' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Derulează la stânga"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`w-7 h-7 rounded-full border border-slate-200 dark:border-[#282a30] bg-white dark:bg-[#1c1e22] flex items-center justify-center text-slate-700 dark:text-slate-300 shadow-2xs transition-all ${
              canScrollRight ? 'hover:scale-105 active:scale-95 cursor-pointer opacity-100' : 'opacity-30 cursor-not-allowed'
            }`}
            title="Derulează la dreapta"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Categories Single-row Smooth Carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollPosition}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="flex items-start gap-3 sm:gap-4 overflow-x-auto pt-1 pb-2 scroll-smooth no-scrollbar w-full px-1 outline-none"
      >
        {OFFICIAL_CATEGORIES.map((cat, index) => {
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryClick(cat)}
              className={`flex-shrink-0 w-[68px] sm:w-[84px] flex flex-col items-center cursor-pointer group/card select-none text-center focus:outline-none transition-all active:scale-95 ${
                isMounted ? 'animate-in fade-in duration-300' : 'opacity-0'
              }`}
            >
              {/* Category Squircle Icon Box */}
              <div className="w-[64px] h-[64px] sm:w-[80px] sm:h-[80px] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-[#282a30] bg-white dark:bg-[#1c1e22] shadow-2xs flex items-center justify-center p-1.5 transition-all duration-200 group-hover/card:border-[#03c1a2] group-hover/card:shadow-md group-hover/card:scale-105">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover rounded-xl transition-transform duration-300 group-hover/card:scale-110"
                />
              </div>

              {/* Title Label */}
              <span className="text-[10.5px] sm:text-[11.5px] font-bold text-slate-700 dark:text-slate-300 group-hover/card:text-[#03c1a2] leading-tight text-center mt-1.5 line-clamp-1 max-w-[68px] sm:max-w-[84px] transition-colors">
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
