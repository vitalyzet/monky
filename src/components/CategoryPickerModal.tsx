'use client';

import React, { useState } from 'react';
import { Menu, X, ChevronRight, Check, Car, Tag, Building, Briefcase } from 'lucide-react';
import { APP_CATEGORIES, TEVINDE_SUBCATEGORIES_MAP } from '@/data/categories';

export interface CategoryNode {
  id: string;
  name: string;
  subcategories?: CategoryNode[];
}

export const HIERARCHICAL_CATEGORIES: CategoryNode[] = APP_CATEGORIES.map((cat) => ({
  id: cat.id,
  name: cat.name,
  subcategories: cat.subcategories.map((sub, idx) => ({
    id: `${cat.id}__${idx}`,
    name: sub,
    subcategories: [
      { id: `${cat.id}__${idx}__toate`, name: `Toate din ${sub}` },
      { id: `${cat.id}__${idx}__recomandate`, name: `Oferte recomandate` },
    ],
  })),
}));

interface CategoryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (catId: string, displayName: string) => void;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectCategory,
}) => {
  const [level1, setLevel1] = useState<CategoryNode | null>(null);
  const [level2, setLevel2] = useState<CategoryNode | null>(null);
  const [level3, setLevel3] = useState<CategoryNode | null>(null);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const selected = level3 || level2 || level1;
    if (selected) {
      const mainCatId = level1?.id || selected.id;
      onSelectCategory(mainCatId, selected.name);
      onClose();
    }
  };

  const getCatIcon = (name: string) => {
    switch (name) {
      case 'Motoare': return <Car size={18} className="text-[#03c1a2]" />;
      case 'Piață': return <Tag size={18} className="text-[#03c1a2]" />;
      case 'Imobiliare': return <Building size={18} className="text-[#03c1a2]" />;
      case 'Lucru': return <Briefcase size={18} className="text-[#03c1a2]" />;
      default: return <Menu size={18} className="text-[#03c1a2]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#242424] rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 dark:border-[#383838] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 dark:border-[#333333]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#03c1a2]/15 text-[#03c1a2] flex items-center justify-center flex-shrink-0">
              <Menu size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Alege Categoria
              </h2>
              <span className="text-xs text-slate-400">Categorii oficiale Tevinde.ro</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#333] dark:hover:bg-[#444] text-slate-500 dark:text-slate-300 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* 3 Columns Header Row */}
        <div className="grid grid-cols-3 border-b border-slate-100 dark:border-[#333333] bg-slate-50/70 dark:bg-[#1e1e1e] text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
          <div className="px-5 py-3 border-r border-slate-100 dark:border-[#333333]">
            CATEGORIE PRINCIPALĂ
          </div>
          <div className="px-5 py-3 border-r border-slate-100 dark:border-[#333333]">
            SUBCATEGORIE
          </div>
          <div className="px-5 py-3">
            OPȚIUNI
          </div>
        </div>

        {/* 3 Columns Content Body */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-[#333333] flex-1 overflow-hidden min-h-[360px] text-sm">
          {/* Column 1: CATEGORIE PRINCIPALĂ */}
          <div className="overflow-y-auto p-2 space-y-1">
            {HIERARCHICAL_CATEGORIES.map((cat) => {
              const isSelected = level1?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    setLevel1(cat);
                    setLevel2(null);
                    setLevel3(null);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-colors ${
                    isSelected
                      ? 'bg-[#03c1a2]/15 font-bold text-[#03c1a2]'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {getCatIcon(cat.name)}
                    <span className="font-bold">{cat.name}</span>
                  </div>
                  <ChevronRight size={16} className={`flex-shrink-0 ${isSelected ? 'text-[#03c1a2]' : 'text-slate-300 dark:text-slate-600'}`} />
                </button>
              );
            })}
          </div>

          {/* Column 2: SUBCATEGORIE */}
          <div className="overflow-y-auto p-2 space-y-1 flex flex-col">
            {level1 && level1.subcategories && level1.subcategories.length > 0 ? (
              level1.subcategories.map((sub) => {
                const isSelected = level2?.id === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setLevel2(sub);
                      setLevel3(null);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-colors ${
                      isSelected
                        ? 'bg-[#03c1a2]/15 font-bold text-[#03c1a2]'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <span className="truncate pr-2">{sub.name}</span>
                    <ChevronRight size={16} className={`flex-shrink-0 ${isSelected ? 'text-[#03c1a2]' : 'text-slate-300 dark:text-slate-600'}`} />
                  </button>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                Selectează o categorie din stânga
              </div>
            )}
          </div>

          {/* Column 3: OPȚIUNI */}
          <div className="overflow-y-auto p-2 space-y-1 flex flex-col">
            {level2 && level2.subcategories && level2.subcategories.length > 0 ? (
              level2.subcategories.map((spec) => {
                const isSelected = level3?.id === spec.id;
                return (
                  <button
                    key={spec.id}
                    type="button"
                    onClick={() => setLevel3(spec)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-colors ${
                      isSelected
                        ? 'bg-[#03c1a2]/15 text-[#03c1a2] font-bold border border-[#03c1a2]/30'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2a2a2a]'
                    }`}
                  >
                    <span className="truncate pr-2">{spec.name}</span>
                    {isSelected && <Check size={16} className="text-[#03c1a2] flex-shrink-0 stroke-[2.5]" />}
                  </button>
                );
              })
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
                Selectează o subcategorie
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[#333333] bg-slate-50/50 dark:bg-[#1f1f1f] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#303030] transition-colors"
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!level1}
            className="px-6 py-2.5 rounded-xl bg-[#03c1a2] hover:bg-[#02a88d] disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-[#03c1a2]/20 active:scale-[0.98]"
          >
            Confirmă Selecția
          </button>
        </div>
      </div>
    </div>
  );
};
