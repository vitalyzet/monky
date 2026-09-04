'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getListings, AdListing } from '@/lib/db';
import { PhoneListingCard } from '@/components/ListingGrid';
import { Listing } from '@/data/mockData';
import { Heart, Camera, Trash2, ArrowLeft, ExternalLink, ShoppingBag, Eye } from 'lucide-react';

export default function FavoritePage() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<AdListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const savedFavs = localStorage.getItem('monky_favorites');
        let parsedIds: string[] = [];
        if (savedFavs) {
          parsedIds = JSON.parse(savedFavs);
        }
        if (parsedIds.length > 0) {
          const favPromises = parsedIds.map(id => import('@/lib/db').then(m => m.getListingById(id)));
          const favResults = await Promise.all(favPromises);
          const validFavs = favResults.filter((fav): fav is AdListing => fav !== null);
          setFavoriteListings(validFavs);

          if (validFavs.length !== parsedIds.length) {
            const validIds = validFavs.map(f => f.id);
            setFavoriteIds(validIds);
            localStorage.setItem('monky_favorites', JSON.stringify(validIds));
          } else {
            setFavoriteIds(parsedIds);
          }
        } else {
          setFavoriteIds([]);
          setFavoriteListings([]);
        }
      } catch (err) {
        console.error('Eroare la încărcarea favoritelor:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, []);

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedIds = favoriteIds.filter((favId) => favId !== id);
    setFavoriteIds(updatedIds);
    setFavoriteListings((prev) => prev.filter((item) => item.id !== id));
    localStorage.setItem('monky_favorites', JSON.stringify(updatedIds));
  };

  const clearAllFavorites = () => {
    setFavoriteIds([]);
    setFavoriteListings([]);
    localStorage.removeItem('monky_favorites');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f6] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar favoriteCount={favoriteIds.length} />

      <main className="main-container flex-grow max-w-[1100px] mx-auto px-4 py-8 w-full">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Heart size={28} className="text-red-500 fill-red-500" />
              <span>Anunțuri Favorite</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {favoriteListings.length === 1
                ? 'Ai 1 anunț salvat în lista ta'
                : `Ai ${favoriteListings.length} anunțuri salvate în lista ta`}
            </p>
          </div>

          {favoriteListings.length > 0 && (
            <button
              onClick={clearAllFavorites}
              className="inline-flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 bg-white dark:bg-[#242424] px-4 py-2 rounded-xl border border-slate-200 dark:border-[#333333] shadow-sm transition-all"
            >
              <Trash2 size={14} />
              Şterge toate favoritele
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            Se încarcă anunțurile favorite...
          </div>
        ) : favoriteListings.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-[#242424] rounded-3xl p-12 md:p-16 text-center border border-slate-200 dark:border-[#333333] shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-950/40 rounded-full flex items-center justify-center text-red-500 mb-5 shadow-inner">
              <Heart size={38} className="fill-red-500/20 stroke-red-500" />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Nu ai niciun anunț salvat la favorite
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6 leading-relaxed">
              Apasă pe inimioara de pe cardul oricărui anunț pentru a-l salva și a urmări modificările de preț în orice moment.
            </p>

            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-blue-600/20 transition-all text-sm inline-flex items-center gap-2"
            >
              <ShoppingBag size={18} />
              <span>Explorează anunțuri</span>
            </Link>
          </div>
        ) : (
          /* Grid View of Favorite Items */
          <div className="subito-grid-view subito-grid-view--large">
            {favoriteListings.map((item) => (
              <PhoneListingCard
                key={item.id}
                item={item as Listing}
                isFav={true}
                onToggleFavorite={(id, e) => removeFavorite(id, e)}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
