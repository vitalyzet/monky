'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, Heart, Trash2, ArrowRight, ExternalLink, Sparkles, MapPin, Calendar, Clock } from 'lucide-react';
import { getListingById, AdListing, getListings } from '@/lib/db';
import { getListingUrl } from '@/lib/slugUtils';
import { formatRealListingDate } from '@/lib/timeUtils';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<AdListing[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const savedFavs = localStorage.getItem('monky_favorites');
      let parsedIds: string[] = [];
      if (savedFavs) {
        parsedIds = JSON.parse(savedFavs);
      }
      setFavoriteIds(parsedIds);

      if (parsedIds.length > 0) {
        // First try getting all cached listings
        const allListings = await getListings();
        const found = allListings.filter((l) => parsedIds.includes(l.id as string));

        // For any remaining IDs not in main feed, fetch individually
        const missingIds = parsedIds.filter((id) => !found.some((l) => l.id === id));
        if (missingIds.length > 0) {
          const fetched = await Promise.all(missingIds.map((id) => getListingById(id)));
          const validFetched = fetched.filter((f): f is AdListing => f !== null);
          setFavoriteListings([...found, ...validFetched]);
        } else {
          setFavoriteListings(found);
        }
      } else {
        setFavoriteListings([]);
      }
    } catch (err) {
      console.error('Error loading favorites in drawer:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listen for escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updated = favoriteIds.filter((favId) => favId !== id);
    setFavoriteIds(updated);
    setFavoriteListings((prev) => prev.filter((item) => item.id !== id));
    localStorage.setItem('monky_favorites', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const clearAll = () => {
    setFavoriteIds([]);
    setFavoriteListings([]);
    localStorage.setItem('monky_favorites', JSON.stringify([]));
    window.dispatchEvent(new Event('storage'));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Backdrop with smooth fade */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-white dark:bg-[#18191c] border-l border-slate-200 dark:border-[#282a30] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
          
          {/* Drawer Header matching user screenshot */}
          <div className="px-5 py-4 border-b border-slate-200/80 dark:border-[#282a30] flex items-center justify-between bg-white/80 dark:bg-[#18191c]/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
                <Heart size={18} className="fill-rose-500 text-rose-500" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Anunțuri salvate ({favoriteListings.length})
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#26282e] dark:hover:bg-[#30333a] text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Închide"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                <div className="w-8 h-8 border-3 border-[#03c1a2] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-400">Se încarcă favoritele...</p>
              </div>
            ) : favoriteListings.length === 0 ? (
              /* Empty State matching user screenshot */
              <div className="flex flex-col items-center justify-center h-full py-28 px-4 text-center">
                <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-[#202227] flex items-center justify-center mb-6 text-slate-300 dark:text-slate-600">
                  <Heart size={52} className="stroke-[1.3]" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
                  Nu ai anunțuri salvate
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-8 leading-relaxed">
                  Apasă pe inima de pe un anunț pentru a-l salva aici și a-l găsi cu ușurință mai târziu!
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/cautare');
                  }}
                  className="px-6 py-3 bg-[#03c1a2] hover:bg-[#02a88d] active:scale-95 text-white font-extrabold text-sm rounded-full shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Explorează anunțuri</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              /* List of Saved Items in compact professional horizontal cards */
              favoriteListings.map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-white dark:bg-[#202227] rounded-2xl border border-slate-200/90 dark:border-[#2a2c32] hover:border-[#03c1a2]/60 hover:shadow-md transition-all overflow-hidden p-3 flex flex-row items-center gap-3.5 cursor-pointer select-none"
                  onClick={() => {
                    onClose();
                    router.push(getListingUrl(item as any));
                  }}
                >
                  {/* Constrained Fixed Thumbnail */}
                  <div className="relative w-[86px] h-[86px] min-w-[86px] max-w-[86px] rounded-xl bg-slate-100 dark:bg-[#141518] overflow-hidden flex-shrink-0 border border-slate-200/60 dark:border-slate-800">
                    <img
                      src={item.image || '/42.svg'}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/42.svg';
                      }}
                    />
                    {item.isPromoted && (
                      <span className="absolute top-1 left-1 bg-amber-500 text-slate-950 font-black text-[8px] px-1.5 py-0.2 rounded uppercase shadow-xs">
                        PRO
                      </span>
                    )}
                  </div>

                  {/* Info Block */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                      {item.price && !isNaN(Number(item.price)) && Number(item.price) > 0
                        ? `${Number(item.price).toLocaleString('ro-RO')} ${String(item.currency) === 'RON' || String(item.currency) === 'Lei' ? 'Lei' : item.currency || '€'}`
                        : 'Preț la cerere'}
                    </div>

                    <h4
                      className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 leading-snug line-clamp-1 truncate group-hover:text-[#03c1a2] transition-colors mt-0.5"
                      title={item.title}
                    >
                      {item.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      <span className="truncate max-w-[130px]">{item.location || 'România'}</span>
                      <span>•</span>
                      <span className="flex-shrink-0">{formatRealListingDate(item as any)}</span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={(e) => removeFavorite(item.id as string, e)}
                    className="w-8 h-8 rounded-full border border-slate-200 dark:border-[#2f323a] bg-slate-50 dark:bg-[#18191c] text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-800 flex items-center justify-center transition-all flex-shrink-0 cursor-pointer"
                    title="Elimină din favorite"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer Actions */}
          {favoriteListings.length > 0 && (
            <div className="p-4 border-t border-slate-200/80 dark:border-[#282a30] bg-white dark:bg-[#18191c] space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push('/favorite');
                  }}
                  className="flex-1 py-3 bg-[#03c1a2] hover:bg-[#02a88d] active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Vezi pagina completă ({favoriteListings.length})</span>
                  <ExternalLink size={15} />
                </button>

                <button
                  type="button"
                  onClick={clearAll}
                  className="px-3 py-3 border border-slate-200 dark:border-[#2a2c32] hover:border-rose-300 dark:hover:border-rose-900 text-slate-500 hover:text-rose-500 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  title="Șterge toate favoritele"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
