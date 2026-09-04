'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Listing } from '@/data/mockData';
import {
  Camera,
  Heart,
  Truck,
  RotateCcw,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  User,
  Tag,
  List as ListIcon,
  LayoutGrid,
  Phone,
  Gauge,
  Fuel,
  Calendar,
  Cog,
  Navigation,
  Sparkles,
  Car,
  Zap,
} from 'lucide-react';
import { formatTimeAgo, formatRealListingDate } from '@/lib/timeUtils';
import { getListingUrl } from '@/lib/slugUtils';
import { useAuth } from '@/lib/AuthContext';
import { getDistinctSellerAvatar, resolveSellerAvatar } from '@/lib/avatarUtils';
import { formatPublicName } from '@/lib/stringUtils';
import { getListingDistanceKm, formatDistanceKm } from '@/lib/geoUtils';

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
  title?: string;
  maxColumns?: 3 | 4 | 5;
  showPriceOnImage?: boolean;
}

const POPULAR_CAR_BRANDS = [
  'Audi', 'BMW', 'Dacia', 'Ford', 'Hyundai', 'Mercedes-Benz',
  'Mini', 'Nissan', 'Opel', 'Peugeot', 'Renault', 'SEAT', 'Skoda',
  'Toyota', 'Volkswagen', 'Volvo'
];

function resolveItemBrand(item: any): string | null {
  if (item.brand && typeof item.brand === 'string' && item.brand.trim() !== '' && item.brand !== 'Orice') {
    return item.brand.trim();
  }
  const title = item.title || '';
  for (const b of POPULAR_CAR_BRANDS) {
    if (new RegExp(`\\b${b}\\b`, 'i').test(title)) {
      return b;
    }
  }
  if (/\bVW\b/i.test(title)) return 'Volkswagen';
  if (/\bMercedes\b/i.test(title)) return 'Mercedes-Benz';
  return null;
}

function formatMileage(mileage?: any): string | null {
  if (!mileage) return null;
  const str = String(mileage).trim();
  if (!str) return null;
  if (str.toLowerCase().includes('km')) return str;
  const num = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(num)) {
    return `${num.toLocaleString('ro-RO')} km`;
  }
  return `${str} km`;
}

export const CarListingCard: React.FC<{
  item: Listing;
  isFav: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing?: (listing: Listing) => void;
  showPriceOnImage?: boolean;
  compactCarousel?: boolean;
  hideCarouselDots?: boolean;
}> = ({
  item,
  isFav,
  onToggleFavorite,
  onSelectListing,
}) => {
  const images = useMemo(() => {
    if (item.gallery && item.gallery.length > 0) {
      return item.gallery;
    }
    return [item.image || '/42.svg'];
  }, [item.gallery, item.image]);

  const [currentIdx, setCurrentIdx] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const { currentUser } = useAuth();
  const sellerAvatar = resolveSellerAvatar(item.seller, (item as any).userId, currentUser);
  const resolvedBrand = resolveItemBrand(item);
  const distanceKm = getListingDistanceKm(item.location);
  const resolvedYear = item.year || (() => {
    const match = (item.title || '').match(/\b(19\d\d|20[0-2]\d)\b/);
    return match ? match[0] : null;
  })();

  const [cardTheme, setCardTheme] = useState<'classic' | 'modern'>('modern');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monky_card_theme');
      if (saved === 'classic' || saved === 'modern') {
        setCardTheme(saved);
      }
      const handleTheme = (e: any) => {
        const t = e?.detail || localStorage.getItem('monky_card_theme');
        if (t === 'classic' || t === 'modern') {
          setCardTheme(t);
        }
      };
      window.addEventListener('card_theme_changed', handleTheme);
      return () => window.removeEventListener('card_theme_changed', handleTheme);
    }
  }, []);

  if (cardTheme === 'modern') {
    return (
      <Link
        id={`ad-card-${item.id}`}
        href={getListingUrl(item)}
        className="flex flex-col h-full w-full bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer border border-transparent dark:border-[#2a2a2a]"
        onClick={() => {
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('lastViewedAdId', item.id);
          }
          if (onSelectListing) onSelectListing(item);
        }}
      >
        {/* Top Photo Frame (Flush with edges) */}
        <div className="relative aspect-[4/3] w-full flex-shrink-0 bg-[#e9ecef] dark:bg-[#111111] overflow-hidden">
          <img
            src={images[currentIdx] || item.image || '/42.svg'}
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/42.svg';
            }}
          />

          {/* Gradient Overlay for bottom shadow (for dots) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

          {/* Badge top-left (Anunț Nou style) */}
          <div className="absolute top-3 left-3 flex items-center gap-1 z-10 pointer-events-none">
            {item.isPromoted ? (
              <span className="bg-amber-500 text-slate-950 font-medium text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                Promovat
              </span>
            ) : (
              <span className="bg-[#7cd95b] text-white font-medium text-[11px] px-2.5 py-1 rounded-full shadow-sm">
                Anunț Nou
              </span>
            )}
          </div>

          {/* Heart Button top-right */}
          <button
            type="button"
            className="absolute top-3 right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md text-white flex items-center justify-center z-10 transition-transform active:scale-90 cursor-pointer"
            onClick={(e) => onToggleFavorite(item.id, e)}
            title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
          >
            <Heart
              size={18}
              className={isFav ? 'fill-red-500 text-red-500' : 'text-white stroke-[2]'}
            />
          </button>

          {/* Left/Right arrow on hover if multiple images */}
          {images.length > 1 && currentIdx > 0 && (
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center shadow-md hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-20 outline-none cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {images.length > 1 && currentIdx < images.length - 1 && (
            <button
              type="button"
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center shadow-md hover:bg-black/60 transition-all opacity-0 group-hover:opacity-100 z-20 outline-none cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          )}

          {/* Carousel Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {images.slice(0, 5).map((_, idx) => (
                <span
                  key={idx}
                  className={`rounded-full transition-all duration-300 shadow-sm ${
                    idx === currentIdx % 5
                      ? 'w-2 h-2 bg-white scale-110'
                      : 'w-1.5 h-1.5 bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card Content Body */}
        <div className="p-3.5 sm:p-4 flex flex-col justify-between flex-grow bg-white dark:bg-[#1e1e1e]">
          <div>
            {/* Price Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {item.price && !isNaN(Number(item.price)) && Number(item.price) > 0
                  ? `${Number(item.price).toLocaleString('ro-RO')} ${String(item.currency) === 'RON' || String(item.currency) === 'Lei' ? '€' : item.currency || '€'}`
                  : 'Preț la cerere'}
              </div>
              <div className="text-slate-400 dark:text-slate-500 font-bold tracking-widest leading-none">
                ...
              </div>
            </div>

            {/* Title (Hidden in user's screenshot, but we keep it small or we can replace it) */}
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug line-clamp-1 mb-2">
              {item.title}
            </h3>

            {/* Location & Distance */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-[#a0a0a0] mb-3 truncate">
              <MapPin size={13} className="text-slate-400 dark:text-[#808080] flex-shrink-0" />
              <span className="truncate">{item.location || 'România'}</span>
              {distanceKm !== null && (
                <span className="ml-1 text-[11px] text-[#03c1a2] bg-[#03c1a2]/10 px-1.5 rounded">
                  {formatDistanceKm(distanceKm)}
                </span>
              )}
            </div>

            {/* Specs Pills (Mimicking the screenshot tags) */}
            {(item.mileage || item.fuel || item.year || item.transmission) && (
              <div className="flex flex-wrap items-center gap-2">
                {resolvedYear && (
                  <span className="bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border border-transparent dark:border-[#444444]">
                    {resolvedYear}
                  </span>
                )}
                {item.mileage && (
                  <span className="bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border border-transparent dark:border-[#444444]">
                    {formatMileage(item.mileage)}
                  </span>
                )}
                {item.fuel && (
                  <span className="bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border border-transparent dark:border-[#444444]">
                    {item.fuel}
                  </span>
                )}
                {item.transmission && (
                  <span className="bg-slate-100 dark:bg-[#333333] text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium border border-transparent dark:border-[#444444]">
                    {item.transmission}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      id={`ad-card-${item.id}`}
      href={getListingUrl(item)}
      className="flex flex-col h-full w-full bg-white dark:bg-[#1c1e22] rounded-2xl border border-slate-200/80 dark:border-[#282a30] shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden group cursor-pointer text-inherit no-underline"
      onClick={() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastViewedAdId', item.id);
        }
        if (onSelectListing) onSelectListing(item);
      }}
    >
      {/* Top Photo Frame - 100% clean photo with sleek favorite button */}
      <div className="p-1 sm:p-1.5 pb-0">
        <div className="relative aspect-video sm:aspect-[16/12] w-full flex-shrink-0 bg-[#e9ecef] dark:bg-[#141518] overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200/60 dark:border-slate-800">
          <img
            src={images[currentIdx] || item.image || '/images/car_audi_a4.png'}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/car_audi_a4.png';
            }}
          />

          {/* Badge top-left */}
          <div className="absolute top-2 left-2 flex items-center gap-1">
            {item.isPromoted ? (
              <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded uppercase tracking-wider shadow-xs flex items-center gap-1">
                <Sparkles size={10} />
                <span>Promovat</span>
              </span>
            ) : null}
          </div>

          {/* Year bottom-left overlay pill */}
          {resolvedYear && (
            <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none">
              <Calendar size={11} className="text-[#03c1a2]" />
              <span>{resolvedYear}</span>
            </div>
          )}

          {/* Top-right Heart favorite button */}
          <button
            type="button"
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md flex items-center justify-center shadow-md z-10 transition-transform active:scale-90 hover:scale-105 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(item.id, e);
            }}
            title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
          >
            <Heart
              size={15}
              className={isFav ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-200'}
            />
          </button>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-2.5 sm:p-3.5 pt-2 sm:pt-3 flex flex-col justify-between flex-grow">
        <div>
          {/* Distinct Modern Price & Brand Row */}
          <div className="flex items-baseline justify-between gap-1.5 mb-1">
            <div className="flex items-baseline gap-1">
              <span className="text-sm sm:text-lg md:text-[20px] font-black text-slate-900 dark:text-white tracking-tight truncate">
                {item.price && !isNaN(Number(item.price)) && Number(item.price) > 0
                  ? Number(item.price).toLocaleString('ro-RO')
                  : 'Preț la cerere'}
              </span>
              {item.price && !isNaN(Number(item.price)) && Number(item.price) > 0 && (
                <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400">
                  {String(item.currency) === 'RON' || String(item.currency) === 'Lei' ? 'Lei' : item.currency || '€'}
                </span>
              )}
            </div>

            {/* Brand Tag Pill */}
            {resolvedBrand && (
              <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] border border-slate-200/90 dark:border-[#383838] px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                <Tag size={8} className="text-slate-400" />
                {resolvedBrand}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xs sm:text-[14px] font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-1 group-hover:text-[#03c1a2] transition-colors mb-1" title={item.title}>
            {item.title}
          </h3>

          {/* Mobile Specs Summary (Dot separated) */}
          {(item.mileage || item.fuel || item.transmission || item.year) && (
            <div className="flex sm:hidden items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium mb-1.5 truncate">
              {item.year && <span>{item.year}</span>}
              {item.year && item.mileage && <span>•</span>}
              {item.mileage && <span className="truncate">{formatMileage(item.mileage)}</span>}
              {item.mileage && item.fuel && <span>•</span>}
              {item.fuel && <span>{item.fuel}</span>}
            </div>
          )}

          {/* Desktop Kilometers & Fuel & Gearbox Pills */}
          {(item.mileage || item.fuel || item.transmission || item.year) && (
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 mb-2">
              {item.mileage && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-[#383838]">
                  <Gauge size={11} className="text-slate-400 flex-shrink-0" />
                  <span>{formatMileage(item.mileage)}</span>
                </span>
              )}
              {item.fuel && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-[#383838]">
                  <Fuel size={11} className="text-slate-400 flex-shrink-0" />
                  <span>{item.fuel}</span>
                </span>
              )}
              {item.transmission && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-[#383838]">
                  <Cog size={11} className="text-slate-400 flex-shrink-0" />
                  <span>{item.transmission}</span>
                </span>
              )}
              {item.year && (
                <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#252525] px-2 py-0.5 rounded-md border border-slate-200/80 dark:border-[#383838]">
                  <Calendar size={11} className="text-slate-400 flex-shrink-0" />
                  <span>{item.year}</span>
                </span>
              )}
            </div>
          )}

          {/* Location and Distance in Kilometers */}
          <div className="flex items-center justify-between text-[10.5px] sm:text-[11px] text-slate-400 dark:text-slate-500 gap-1">
            <span className="truncate flex items-center gap-1">
              <MapPin size={10} className="text-slate-400 flex-shrink-0" />
              <span className="truncate">{item.location || 'România'}</span>
            </span>
            {distanceKm !== null && (
              <span className="flex-shrink-0 font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#282828] border border-slate-200/80 dark:border-[#383838] px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] flex items-center gap-0.5">
                📍 {formatDistanceKm(distanceKm)}
              </span>
            )}
          </div>
        </div>

        {/* Seller Footer with Publication Time */}
        <div className="mt-2 sm:mt-2.5 pt-1.5 sm:pt-2 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center justify-between gap-1 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <img
              src={sellerAvatar}
              alt=""
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = getDistinctSellerAvatar(item.seller?.name, (item as any).userId);
              }}
            />
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">
              {formatPublicName(item.seller?.name || 'Vânzător')}
            </span>
          </div>

          {/* When the ad was published */}
          <span className="flex items-center gap-1 text-[9.5px] sm:text-[10.5px] text-slate-400 dark:text-slate-500 flex-shrink-0 font-medium" title="Data publicării">
            <Clock size={10} className="text-slate-400 flex-shrink-0" />
            <span>{formatRealListingDate(item)}</span>
          </span>
        </div>
      </div>
    </Link>
  );
};

export const PhoneListingCard = CarListingCard;

export interface ListingListCardProps {
  item: Listing;
  isFav: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectListing?: (listing: Listing) => void;
  isPhoneRevealed?: boolean;
  onTogglePhoneReveal?: (id: string, e: React.MouseEvent) => void;
}

export const ListingListCard: React.FC<ListingListCardProps> = ({
  item,
  isFav,
  onToggleFavorite,
  onSelectListing,
  isPhoneRevealed,
  onTogglePhoneReveal,
}) => {
  const images = useMemo(() => {
    const rawList = (item as any).gallery || (item as any).photos || (item as any).images || [];
    if (Array.isArray(rawList) && rawList.length > 1) {
      const filtered = rawList.filter((img: string) => typeof img === 'string' && img.trim() !== '');
      if (filtered.length > 1) return filtered;
    }
    const baseImg = item.image && typeof item.image === 'string' && item.image.trim() !== '' ? item.image : '/42.svg';
    
    // For single-photo listings, provide complementary views so the carousel is always interactive
    const cat = String(item.category || '').toLowerCase();
    if (cat.includes('imobil') || cat.includes('apartament') || cat.includes('casa')) {
      return [baseImg, '/images/imobiliare_apartamente.png', '/images/imobiliare_case.png'];
    }
    if (cat.includes('auto') || cat.includes('coche') || cat.includes('masin') || cat.includes('motor') || (item as any).mileage || item.year) {
      return [baseImg, '/images/car_golf7.png', '/images/car_audi_a4.png'];
    }
    return [baseImg];
  }, [item.gallery, (item as any).photos, (item as any).images, item.image, item.category, (item as any).mileage, item.year]);

  const [currentIdx, setCurrentIdx] = useState(0);

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (images.length <= 1) return;
    setCurrentIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const { currentUser } = useAuth();
  const itemSellerAvatar = resolveSellerAvatar(item.seller, (item as any).userId, currentUser);
  const distanceKm = getListingDistanceKm(item.location);
  const resolvedYear = item.year || (() => {
    const match = (item.title || '').match(/\b(19\d\d|20[0-2]\d)\b/);
    return match ? match[0] : null;
  })();

  return (
    <Link
      key={item.id}
      href={getListingUrl(item)}
      className="bg-white dark:bg-[#1e2732] rounded-2xl border border-slate-200/90 dark:border-[#2f3d4d] shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 flex flex-row items-stretch h-[140px] xs:h-[155px] sm:h-[235px] md:h-[245px] group cursor-pointer overflow-hidden text-inherit no-underline"
      onClick={() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('lastViewedAdId', item.id);
        }
        if (onSelectListing) onSelectListing(item);
      }}
    >
      {/* Left Side: Photo Media with Interactive Carousel */}
      <div className="relative w-[130px] xs:w-[150px] sm:w-[35%] md:w-[36%] lg:w-[37%] h-full bg-slate-100 dark:bg-[#141c24] overflow-hidden flex-shrink-0 select-none">
        <img
          src={images[currentIdx] || item.image || '/42.svg'}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-103"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/42.svg';
          }}
        />

        {/* Carousel Left Arrow (Clickable!) */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 shadow-md z-10 cursor-pointer outline-none"
            title="Fotografia anterioară"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Carousel Right Arrow (Clickable!) */}
        {images.length > 1 && (
          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 active:scale-95 text-white flex items-center justify-center transition-all opacity-85 group-hover:opacity-100 shadow-md z-10 cursor-pointer outline-none"
            title="Fotografia următoare"
          >
            <ChevronRight size={18} />
          </button>
        )}

        {/* Bottom Carousel Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-none z-10">
            {images.slice(0, 5).map((_, idx) => (
              <span
                key={idx}
                className={`transition-all duration-300 rounded-full shadow-xs ${
                  idx === currentIdx % 5
                    ? 'w-2 h-2 bg-white scale-110'
                    : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>
        )}

        {/* Photo Counter Pill (Bottom Right: 📷 1/8) */}
        <div className="absolute bottom-2.5 right-2.5 bg-white/95 dark:bg-[#1f2937]/90 text-slate-800 dark:text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-xs flex items-center gap-1.5 pointer-events-none border border-slate-200/60 dark:border-slate-700 z-10">
          <Camera size={12} className="text-slate-600 dark:text-slate-300" />
          <span>{currentIdx + 1}/{images.length}</span>
        </div>
      </div>

      {/* Right Side: Content Area */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between h-full min-w-0">
        <div>
          {/* Top Row: Price + Negotiable & Top Right Heart Button */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                {item.price && !isNaN(Number(item.price)) && Number(item.price) > 0
                  ? `${Number(item.price).toLocaleString('ro-RO')} ${String(item.currency) === 'RON' || String(item.currency) === 'Lei' ? 'Lei' : item.currency || '€'}`
                  : 'Preț la cerere'}
              </span>
              {item.isNegotiable ? (
                <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  negociabil
                </span>
              ) : (
                <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                  {item.condition || 'verificat'}
                </span>
              )}
            </div>

            {/* White Circular Heart Favorite Button */}
            <button
              type="button"
              className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#253240] hover:border-slate-300 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-red-500 shadow-2xs transition-transform active:scale-90 flex-shrink-0 cursor-pointer"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFavorite(item.id, e); }}
              title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
            >
              <Heart
                size={18}
                className={isFav ? 'fill-red-500 text-red-500' : 'text-slate-700 dark:text-slate-200 stroke-[1.8]'}
              />
            </button>
          </div>

          {/* Title */}
          <h3
            className="text-base sm:text-[17px] font-semibold text-slate-900 dark:text-white leading-snug group-hover:text-[#03c1a2] transition-colors mt-1 line-clamp-1 truncate"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Location */}
          <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1 truncate">
            {item.location || 'România'} {distanceKm !== null ? `· ${formatDistanceKm(distanceKm)}` : ''}
          </p>

          {/* Key Specs Row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 mt-3 text-xs sm:text-[13px] font-bold text-slate-800 dark:text-slate-200">
            {resolvedYear && (
              <div className="flex items-center gap-1.5">
                <Calendar size={15} className="text-slate-600 dark:text-slate-400 stroke-[2]" />
                <span>{resolvedYear}</span>
              </div>
            )}
            {item.mileage && (
              <div className="flex items-center gap-1.5">
                <Gauge size={15} className="text-slate-600 dark:text-slate-400 stroke-[2]" />
                <span>{formatMileage(item.mileage)}</span>
              </div>
            )}
            {item.fuel && (
              <div className="flex items-center gap-1.5">
                <Fuel size={15} className="text-slate-600 dark:text-slate-400 stroke-[2]" />
                <span>{item.fuel}</span>
              </div>
            )}
            {item.transmission && (
              <div className="hidden xs:flex items-center gap-1.5">
                <Cog size={15} className="text-slate-600 dark:text-slate-400 stroke-[2]" />
                <span>{item.transmission}</span>
              </div>
            )}
            {(item as any).enginePower && (
              <div className="hidden md:flex items-center gap-1.5">
                <Zap size={15} className="text-slate-600 dark:text-slate-400 stroke-[2]" />
                <span>{(item as any).enginePower}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Area: Promovat Badge, Divider Line & Footer Info */}
        <div>
          {item.isPromoted && (
            <div className="flex justify-end mb-1">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                Promovat
                <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 text-[9px] flex items-center justify-center font-bold">i</span>
              </span>
            </div>
          )}

          {/* Thin Separator Line */}
          <div className="border-t border-slate-200/70 dark:border-slate-800/80 w-full pt-2 mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium truncate">
              {formatPublicName(item.seller?.name) || 'Proprietar'}
            </span>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400">
                {formatRealListingDate(item)}
              </span>
              {item.seller?.phone && onTogglePhoneReveal && (
                <button
                  type="button"
                  className="text-[#03c1a2] hover:underline font-bold text-xs flex items-center gap-1"
                  onClick={(e) => onTogglePhoneReveal(item.id, e)}
                >
                  <Phone size={11} />
                  <span>{isPhoneRevealed ? item.seller.phone : 'Telefon'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export const ListingGrid: React.FC<ListingGridProps> = ({
  listings,
  favorites,
  onToggleFavorite,
  onSelectListing,
  activeFilterChips = [],
  onResetFilters,
  title,
  maxColumns = 4,
  showPriceOnImage = false,
}) => {
  const { currentUser } = useAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});

  const togglePhoneReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRevealedPhones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="listings-section" className="mb-2 scroll-mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {listings.length} anunțuri active disponibile acum
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle button */}
          <div className="flex items-center bg-slate-100 dark:bg-[#1a232f] p-1 rounded-xl border border-slate-200 dark:border-[#2d3a4b]">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#253240] text-[#03c1a2] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Vizualizare listă"
            >
              <ListIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#253240] text-[#03c1a2] shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="Vizualizare grilă"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-50 dark:bg-[#141c24] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 my-4">
          <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Nu au fost găsite anunțuri
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
            Încearcă să resetezi filtrele de căutare pentru a vedea mai multe oferte.
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 bg-[#03c1a2] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#02a88d] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Resetează filtrele</span>
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        /* Modern List View Container with Interactive Carousel */
        <div className="flex flex-col gap-3 mb-10">
          {listings.map((item) => (
            <ListingListCard
              key={item.id}
              item={item}
              isFav={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectListing={onSelectListing}
              isPhoneRevealed={revealedPhones[item.id]}
              onTogglePhoneReveal={togglePhoneReveal}
            />
          ))}
        </div>
      ) : (
        /* Modern Grid View (2-col mobile, 2-col sm, 3-col md, 4-col lg) */
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 mb-10">
          {listings.map((item) => (
            <CarListingCard
              key={item.id}
              item={item}
              isFav={favorites.includes(item.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectListing={onSelectListing}
            />
          ))}
        </div>
      )}
    </section>
  );
};
