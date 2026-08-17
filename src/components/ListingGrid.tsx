'use client';

import React from 'react';
import Link from 'next/link';
import { Listing } from '@/data/mockData';
import { Camera, Heart, Truck, RotateCcw, X, Filter } from 'lucide-react';

export interface ActiveFilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

interface ListingGridProps {
  listings: Listing[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing?: (listing: Listing) => void;
  activeFilterChips?: ActiveFilterChip[];
  onResetFilters?: () => void;
}

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  activeFilterChips = [],
  onResetFilters,
}) => {
  return (
    <section id="listings-section" className="my-6 scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="section-title mb-1">Recomandat pentru tine</h2>
          <p className="text-sm text-slate-500">
            {listings.length === 1
              ? '1 anunț găsit'
              : `${listings.length} anunțuri găsite`}
          </p>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Filter size={13} /> Filtre active:
            </span>
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs text-red-600 hover:text-red-700 font-semibold underline ml-1"
            >
              Resetează tot
            </button>
          </div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeFilterChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-medium rounded-full"
            >
              {chip.label}
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:bg-blue-200/60 p-0.5 rounded-full text-blue-600 transition-colors"
                title="Elimină filtru"
              >
                <X size={13} />
              </button>
            </span>
          ))}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
            <Filter size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">
            Niciun rezultat găsit
          </h3>
          <p className="text-slate-500 max-w-md mb-6">
            Nu am găsit niciun anunț care să se potrivească filtrelor selectate. Încearcă să elimini din filtre sau să cauți alt termen.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm shadow transition-all"
            >
              <RotateCcw size={16} />
              Resetează toate filtrele
            </button>
          )}
        </div>
      ) : (
        <div className="subito-grid-view subito-grid-view--large">
          {listings.map((item) => {
            const isFav = favorites.includes(item.id);
            return (
              <Link
                key={item.id}
                href={`/anunt/${item.id}`}
                className="sbt-card"
                onClick={() => onSelectListing && onSelectListing(item)}
              >
                {/* Subito Picture Container */}
                <div
                  className={`sbt-picture-container ${
                    item.category === 'auto-acc' ? 'sbt-picture-container--vertical' : ''
                  }`}
                >
                  <img src={item.image} alt={item.title} className="sbt-image" />

                  {/* Promoted Red Badge OR Photo Count Badge */}
                  {item.isPromoted ? (
                    <span className="sbt-promo-badge-red">Fereastra de afișare</span>
                  ) : (
                    <div className="sbt-count-badge">
                      <Camera size={13} />
                      <span>{item.photoCount}</span>
                    </div>
                  )}

                  {/* Favorite Heart Circle */}
                  <button
                    className={`sbt-fav-button ${isFav ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onToggleFavorite(item.id, e);
                    }}
                    title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
                  >
                    <Heart
                      size={18}
                      fill={isFav ? '#f9423a' : 'none'}
                      color={isFav ? '#f9423a' : '#717e8f'}
                    />
                  </button>
                </div>

                {/* Subito Details Area */}
                <div className="sbt-details">
                  {/* Subject Title */}
                  <h3 className="sbt-subject" title={item.title}>
                    {item.title}
                  </h3>

                  {/* Price Row */}
                  <div className="sbt-price-row">
                    <span className="sbt-price">{item.price.toLocaleString('ro-RO')} €</span>
                    {item.hasShipping && (
                      <span title="Livrare disponibilă" className="sbt-shipping-truck flex items-center">
                        <Truck size={17} />
                      </span>
                    )}
                  </div>

                  {/* Location & Date */}
                  <div className="sbt-location-container">
                    <span className="sbt-town">{item.location}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
};

