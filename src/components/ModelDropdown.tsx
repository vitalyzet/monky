'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

interface ModelDropdownProps {
  value: string;
  onChange: (model: string) => void;
  options: string[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export const ModelDropdown: React.FC<ModelDropdownProps> = ({
  value,
  onChange,
  options,
  label = 'Model',
  placeholder = 'Orice',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchFilter.toLowerCase())
  );

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

      {/* Main Selected Pill Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[46px] px-4 rounded-2xl border border-slate-200/90 dark:border-[#383838] bg-white dark:bg-[#252525] flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 transition-all text-left shadow-xs cursor-pointer"
      >
        <span className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
          {value || placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Overlay */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[105%] z-[999] bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#383838] rounded-3xl shadow-2xl overflow-hidden p-2 animate-in fade-in slide-in-from-top-2 duration-150 min-w-[180px]">
          {options.length > 8 && (
            <div className="relative mb-2 px-1">
              <Search
                size={15}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Caută model..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-[#1f1f1f] border border-transparent focus:border-blue-500/40 text-slate-800 dark:text-slate-100 focus:outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          <div className="max-h-[240px] overflow-y-auto space-y-0.5 custom-scrollbar pr-0.5">
            <button
              type="button"
              onClick={() => {
                onChange('Orice');
                setIsOpen(false);
                setSearchFilter('');
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-colors text-left ${
                value === 'Orice' || !value
                  ? 'bg-slate-100 dark:bg-[#333333] font-bold text-slate-900 dark:text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]'
              }`}
            >
              <span>Orice</span>
              {(value === 'Orice' || !value) && (
                <Check size={16} className="text-blue-600 dark:text-blue-400" />
              )}
            </button>

            {filteredOptions.map((modelName) => {
              const isSelected = value === modelName;
              return (
                <button
                  key={modelName}
                  type="button"
                  onClick={() => {
                    onChange(modelName);
                    setIsOpen(false);
                    setSearchFilter('');
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-sm transition-colors text-left ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-[#333333] font-bold text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]'
                  }`}
                >
                  <span className="truncate">{modelName}</span>
                  {isSelected && (
                    <Check size={16} className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
