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
      scrollContainerRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (cat: OfficialCategory) => {
    // When clicking a category on homepage, navigate directly to search with this category
    router.push(`/cautare?category=${encodeURIComponent(cat.id)}`);
  };

  return (
    <section className="my-7 w-full overflow-hidden relative z-10 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-[#d5f2ec] to-[#e4f7f2] dark:from-[#1b1c20] dark:to-[#121316] border border-[#bce8df] dark:border-white/10 shadow-xs p-4 sm:p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between px-0.5">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl sm:text-2xl font-black text-[#142825] dark:text-white tracking-tight">
            Explorează după categorie
          </h2>
          <span className="text-xs font-extrabold px-3 py-0.5 rounded-full bg-white/85 dark:bg-white/10 text-[#039e84] dark:text-white border border-[#bce8df] dark:border-white/15 shadow-xs">
            {OFFICIAL_CATEGORIES.length} categorii
          </span>
        </div>
      </div>

      {/* Categories Carousel */}
      <div className="relative w-full">
        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2.5 sm:-translate-x-3.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#22242a] border border-[#bce8df] dark:border-white/15 shadow-md flex items-center justify-center text-[#142825] dark:text-white hover:scale-110 active:scale-95 transition-all z-20 outline-none select-none hover:text-[#03c1a2] dark:hover:text-[#03c1a2]"
            title="Derulează la stânga"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2.5 sm:translate-x-3.5 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-[#22242a] border border-[#bce8df] dark:border-white/15 shadow-md flex items-center justify-center text-[#142825] dark:text-white hover:scale-110 active:scale-95 transition-all z-20 outline-none select-none hover:text-[#03c1a2] dark:hover:text-[#03c1a2]"
            title="Derulează la dreapta"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Single 2-row horizontal scroll carousel for all screen sizes */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScrollPosition}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          className="grid grid-rows-2 grid-flow-col auto-cols-max gap-x-2 xs:gap-x-2.5 sm:gap-x-3.5 gap-y-3 sm:gap-y-4 overflow-x-auto pt-1 pb-2 scroll-smooth no-scrollbar w-full px-0.5 outline-none"
        >
          {OFFICIAL_CATEGORIES.map((cat, index) => {
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                style={{
                  animationDelay: `${index * 16}ms`,
                }}
                className={`flex-shrink-0 w-[76px] xs:w-[88px] sm:w-[106px] flex flex-col items-center cursor-pointer group/card select-none snap-start text-center focus:outline-none transition-transform duration-300 ease-out hover:-translate-y-2 ${
                  isMounted ? 'animate-card-enter' : 'opacity-0'
                }`}
              >
                <div className="w-[72px] h-[60px] xs:w-[84px] xs:h-[70px] sm:w-[104px] sm:h-[82px] rounded-xl sm:rounded-2xl overflow-hidden border border-white/90 dark:border-white/10 bg-white dark:bg-[#202227] shadow-xs flex items-center justify-center relative transition-all duration-300 ease-out group-hover/card:border-[#03c1a2] group-hover/card:shadow-[0_12px_26px_-4px_rgba(3,193,162,0.4)] group-hover/card:scale-105 active:scale-95">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover/card:scale-115 group-hover/card:-translate-y-1 group-hover/card:rotate-[-2deg] group-hover/card:brightness-105"
                  />
                  <div className="card-sheen-sweep" />
                </div>
                <span className="text-[10px] xs:text-[11px] sm:text-[12px] font-bold text-[#1a332f] dark:text-white group-hover/card:text-[#039e84] dark:group-hover/card:text-[#03c1a2] group-hover/card:-translate-y-0.5 leading-snug text-center mt-1.5 sm:mt-2 line-clamp-2 px-0.5 max-w-[80px] xs:max-w-[90px] sm:max-w-[100px] transition-all duration-200">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
