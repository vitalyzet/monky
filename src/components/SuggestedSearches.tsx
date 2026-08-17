'use client';

import React, { useRef } from 'react';
import { SUGGESTED_SEARCHES } from '@/data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SuggestedSearchesProps {
  onSelectSuggestedSearch?: (query: string) => void;
}

export const SuggestedSearches: React.FC<SuggestedSearchesProps> = ({
  onSelectSuggestedSearch,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleClick = (query: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelectSuggestedSearch) {
      onSelectSuggestedSearch(query);
      const element = document.getElementById('listings-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <section className="suggested-section">
      <div className="suggested-header-row">
        <h2 className="section-title mb-0">Căutări sugerate</h2>
        <div className="suggested-nav-btns">
          <button
            className="nav-arrow-btn"
            onClick={() => scroll('left')}
            title="Derulează la stânga"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            className="nav-arrow-btn"
            onClick={() => scroll('right')}
            title="Derulează la dreapta"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="suggested-carousel" ref={scrollRef}>
        {SUGGESTED_SEARCHES.map((item) => (
          <div
            key={item.id}
            className="suggested-card cursor-pointer transition-transform hover:scale-[1.02]"
            onClick={(e) => handleClick(item.title, e)}
          >
            <div className="suggested-content">
              <h3 className="suggested-card-title">{item.title}</h3>
              <div className="suggested-tags">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="tag-pill cursor-pointer hover:bg-slate-200"
                    onClick={(e) => handleClick(tag, e)}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <img src={item.image} alt={item.title} className="suggested-card-img" />
          </div>
        ))}
      </div>
    </section>
  );
};

