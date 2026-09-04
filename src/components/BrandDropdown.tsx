'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, Car } from 'lucide-react';
import { getBrandLogo } from '@/data/brandLogos';

interface BrandDropdownProps {
  value: string;
  onChange: (brand: string) => void;
  options: string[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export const BrandDropdown: React.FC<BrandDropdownProps> = ({
  value,
  onChange,
  options,
  label = 'Marca',
  placeholder = 'Orice',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const currentLogo = getBrandLogo(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`filter-group relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={dropdownRef}>
      {label && <label className="filter-label">{label}</label>}

      {/* Main Selected Pill Button matching user screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[46px] px-3.5 rounded-2xl border border-slate-200/90 dark:border-[#383838] bg-white dark:bg-[#252525] flex items-center justify-between gap-2.5 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-left shadow-xs cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {currentLogo ? (
            <div className="w-7 h-7 rounded-lg bg-white dark:bg-[#202020] border border-slate-200 dark:border-[#444444] flex items-center justify-center p-1 flex-shrink-0 shadow-xs">
              <img
                src={currentLogo}
                alt={value}
                className="w-full h-full object-contain dark:invert"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : value && value !== 'Orice' ? (
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#444444] flex items-center justify-center flex-shrink-0 font-bold text-xs text-slate-600 dark:text-slate-300">
              {value.slice(0, 2).toUpperCase()}
            </div>
          ) : null}

          <span className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
            {value || placeholder}
          </span>
        </div>

        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[105%] z-[999] bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#383838] rounded-3xl shadow-2xl overflow-hidden p-2 animate-in fade-in slide-in-from-top-2 duration-150 min-w-[220px]">
          {/* Quick Search Input with car icon inside input matching user screenshot */}
          <div className="relative mb-2 px-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Caută marca..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl bg-slate-100 dark:bg-[#1c1c1c] border border-slate-200/60 dark:border-[#333333] focus:border-blue-500/40 text-slate-800 dark:text-slate-100 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Brands List Scrollable Container */}
          <div className="max-h-[260px] overflow-y-auto space-y-1 custom-scrollbar pr-0.5">
            {/* Orice option */}
            <button
              type="button"
              onClick={() => {
                onChange('Orice');
                setIsOpen(false);
                setSearchFilter('');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-sm transition-colors text-left ${
                value === 'Orice' || !value
                  ? 'bg-slate-100 dark:bg-[#333333] font-bold text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] flex items-center justify-center text-slate-400 flex-shrink-0">
                  <Car size={16} />
                </div>
                <span>Orice marcă</span>
              </div>
              {(value === 'Orice' || !value) && (
                <Check size={16} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>

            {/* Filtered Brand Options matching user screenshot */}
            {filteredOptions.map((brandName) => {
              const isSelected = value === brandName;
              const logoUrl = getBrandLogo(brandName);

              return (
                <button
                  key={brandName}
                  type="button"
                  onClick={() => {
                    onChange(brandName);
                    setIsOpen(false);
                    setSearchFilter('');
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-sm transition-colors text-left group ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-[#333333] font-bold text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Brand Logo Badge matching user screenshot */}
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-[#383838] flex items-center justify-center p-1.5 flex-shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={brandName}
                          className="w-full h-full object-contain dark:invert opacity-85 group-hover:opacity-100 transition-opacity"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="font-extrabold text-xs text-slate-500 dark:text-slate-400">
                          {brandName.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <span className="truncate font-semibold">{brandName}</span>
                  </div>

                  {isSelected && (
                    <Check size={16} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <div className="py-4 text-center text-xs text-slate-400">
                Nicio marcă găsită
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
