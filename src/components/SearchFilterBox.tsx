'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X, Loader2, History } from 'lucide-react';

interface SearchFilterBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  locationInput: string;
  setLocationInput: (loc: string) => void;
  // Optional compatibility props
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  selectedType?: string;
  setSelectedType?: (type: string) => void;
  selectedBrand?: string;
  setSelectedBrand?: (brand: string) => void;
  selectedModel?: string;
  setSelectedModel?: (model: string) => void;
  selectedPrice?: string;
  setSelectedPrice?: (price: string) => void;
  totalListingsCount?: number;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const SearchFilterBox: React.FC<SearchFilterBoxProps> = ({
  searchQuery,
  setSearchQuery,
  locationInput,
  setLocationInput,
}) => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage or initialize with sample searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem('tevinde_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed);
          return;
        }
      }
      setRecentSearches(['audi a5', 'audi a1']);
    } catch {
      setRecentSearches(['audi a5', 'audi a1']);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (query: string) => {
    if (!query.trim()) return;
    const clean = query.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('tevinde_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearRecent = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRecentSearches([]);
    try {
      localStorage.removeItem('tevinde_recent_searches');
    } catch (e) {
      console.error(e);
    }
    setIsDropdownOpen(false);
  };

  const handleSelectRecent = (term: string) => {
    setSearchQuery(term);
    setIsDropdownOpen(false);
    saveRecentSearch(term);
    setIsSearching(true);

    const params = new URLSearchParams();
    params.set('q', term);
    const loc = locationInput.trim();
    if (loc && loc !== 'Toată țara' && loc !== 'Toată România') {
      params.set('loc', loc);
    }
    router.push(`/cautare?${params.toString()}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    setIsSearching(true);

    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    const loc = locationInput.trim();
    if (loc && loc !== 'Toată țara' && loc !== 'Toată România') {
      params.set('loc', loc);
    }

    router.push(`/cautare?${params.toString()}`);
  };

  return (
    <div className="w-full my-4 sm:my-6">
      {/* Sleek, Minimalist, Professional Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="w-full bg-white dark:bg-[#1a232f] border border-slate-200 dark:border-[#2d3a4b] rounded-2xl sm:rounded-xl shadow-xs flex flex-col sm:flex-row items-stretch transition-all focus-within:border-[#03c1a2] dark:focus-within:border-[#03c1a2] focus-within:shadow-md relative"
      >
        {/* Field 1: Ce anume cauți? */}
        <div
          ref={searchContainerRef}
          className="flex-1 relative flex items-center px-3.5 sm:px-5 py-3 sm:py-3.5 gap-2.5 sm:gap-3 min-w-0"
        >
          <Search size={18} className="text-slate-500 dark:text-slate-400 flex-shrink-0 stroke-[2.2] sm:w-[20px] sm:h-[20px]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Ce anume cauți?"
            className="w-full bg-transparent text-[15px] sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none truncate"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors flex-shrink-0"
              title="Șterge"
            >
              <X size={16} />
            </button>
          )}

          {/* Floating Recent Searches Dropdown */}
          {isDropdownOpen && recentSearches.length > 0 && (
            <div className="absolute left-0 right-0 top-[110%] bg-white dark:bg-[#1e2735] border border-slate-200 dark:border-[#2d3a4b] rounded-2xl shadow-2xl z-50 p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-900 dark:text-white text-[13px] sm:text-sm">
                  Căutări recente
                </span>
                <button
                  type="button"
                  onClick={handleClearRecent}
                  className="text-[#03c1a2] hover:text-[#02a88d] text-[13px] sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Eliminar
                </button>
              </div>

              {/* Items */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSearches.map((item, idx) => (
                  <button
                    key={`${item}-${idx}`}
                    type="button"
                    onClick={() => handleSelectRecent(item)}
                    className="w-full py-2.5 sm:py-3 flex items-center gap-3 text-left text-[14px] sm:text-sm text-slate-700 dark:text-slate-200 hover:text-[#03c1a2] dark:hover:text-[#03c1a2] transition-colors cursor-pointer group"
                  >
                    <History size={16} className="text-slate-400 group-hover:text-[#03c1a2] flex-shrink-0" />
                    <span className="truncate">{item}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Vertical Divider (Desktop only) */}
        <div className="hidden sm:block w-[1px] bg-slate-200 dark:bg-[#2d3a4b] self-stretch my-2" />

        {/* Mobile Row for Location & Button */}
        <div className="flex flex-col xs:flex-row sm:contents border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80 min-w-0">
          {/* Field 2: Toată țara */}
          <div className="flex-1 min-w-0 sm:w-[260px] lg:w-[320px] flex items-center px-3.5 sm:px-5 py-2.5 sm:py-3.5 gap-2 sm:gap-3">
            <MapPin size={18} className="text-slate-500 dark:text-slate-400 flex-shrink-0 stroke-[2.2] sm:w-[20px] sm:h-[20px]" />
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Toată țara"
              className="w-full bg-transparent text-[15px] sm:text-base text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none truncate min-w-0"
            />
            {locationInput && locationInput !== 'Toată țara' && (
              <button
                type="button"
                onClick={() => setLocationInput('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors flex-shrink-0"
                title="Șterge locația"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Action Button: Căutare */}
          <button
            type="submit"
            disabled={isSearching}
            className="bg-[#002f34] hover:bg-[#002226] disabled:bg-[#002f34]/85 dark:bg-[#03c1a2] dark:hover:bg-[#02a88d] dark:disabled:bg-[#03c1a2]/80 text-white font-bold px-5 sm:px-9 py-3 sm:py-3.5 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-wait flex-shrink-0 text-[15px] sm:text-base select-none w-full xs:w-auto rounded-b-2xl xs:rounded-bl-none xs:rounded-br-2xl sm:rounded-none active:scale-[0.99] border-t xs:border-t-0 xs:border-l sm:border-l-0 border-slate-100 dark:border-slate-800/80"
          >
            <span className="inline">Căutare</span>
            {isSearching ? (
              <Loader2 size={18} className="animate-spin text-white" />
            ) : (
              <Search size={18} className="stroke-[2.2]" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
