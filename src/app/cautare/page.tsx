'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { getListings, AdListing } from '@/lib/db';
import {
  isCategoryMatch,
  findCategoryByIdOrName,
  OFFICIAL_CATEGORIES,
} from '@/data/categories';
import {
  CategoryDropdown,
  getCategoryOptions,
  getSubcategoryOptions,
} from '@/components/CategoryDropdown';
import {
  Search,
  MapPin,
  X,
  Heart,
  Phone,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  ChevronLeft,
  Filter,
  RotateCcw,
  Truck,
  Loader2,
  Clock,
  Navigation,
  ArrowUpDown,
  Tag,
  Car,
  Gauge,
  Fuel,
  Calendar,
  Sparkles,
  Camera,
  Zap,
  Cog,
} from 'lucide-react';
import { formatTimeAgo, formatRealListingDate } from '@/lib/timeUtils';
import { getListingUrl } from '@/lib/slugUtils';
import { CarListingCard, ListingListCard } from '@/components/ListingGrid';
import { useAuth } from '@/lib/AuthContext';
import { getDistinctSellerAvatar, resolveSellerAvatar } from '@/lib/avatarUtils';
import { formatPublicName } from '@/lib/stringUtils';
import {
  getListingDistanceKm,
  formatDistanceKm,
  Coordinates,
} from '@/lib/geoUtils';

const POPULAR_CAR_BRANDS = [
  'Audi',
  'BMW',
  'Dacia',
  'Ford',
  'Hyundai',
  'Mercedes-Benz',
  'Mini',
  'Nissan',
  'Opel',
  'Peugeot',
  'Renault',
  'SEAT',
  'Skoda',
  'Toyota',
  'Volkswagen',
  'Volvo',
];

// Helper to infer brand from item if missing
function resolveItemBrand(item: AdListing): string | null {
  if (item.brand && item.brand.trim() && item.brand !== 'Orice') {
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser } = useAuth();

  const categoryParam = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';
  const initialType = searchParams.get('type') || 'Orice';
  const initialBrand = searchParams.get('brand') || 'Orice';
  const initialModel = searchParams.get('model') || 'Orice';
  const initialLoc = searchParams.get('loc') || 'Toată România';
  const initialPrice = searchParams.get('price') || 'Orice';

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedModel, setSelectedModel] = useState(initialModel);
  const [locationInput, setLocationInput] = useState(initialLoc);
  const [selectedPrice, setSelectedPrice] = useState(initialPrice);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [sortBy, setSortBy] = useState<'distance' | 'newest' | 'price_asc' | 'price_desc'>('distance');

  const [favorites, setFavorites] = useState<string[]>([]);
  const [realListings, setRealListings] = useState<AdListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});
  const [visibleCount, setVisibleCount] = useState(12);

  // Active Category from URL
  const activeCategory = useMemo(() => {
    return findCategoryByIdOrName(categoryParam);
  }, [categoryParam]);

  const isCarCategory = useMemo(() => {
    if (activeCategory && activeCategory.id === 'coches') return true;
    if (categoryParam.toLowerCase() === 'coches' || categoryParam.toLowerCase() === 'autoturisme') return true;
    return false;
  }, [activeCategory, categoryParam]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedType(searchParams.get('type') || 'Orice');
    setSelectedBrand(searchParams.get('brand') || 'Orice');
    setSelectedModel(searchParams.get('model') || 'Orice');
    setLocationInput(searchParams.get('loc') || 'Toată România');
    setSelectedPrice(searchParams.get('price') || 'Orice');
    setVisibleCount(12);
  }, [searchParams]);

  // Request user GPS coordinates on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        () => {
          // GPS denied or timed out, fallback to Bucharest reference coords
        },
        { timeout: 6000 }
      );
    }
  }, []);

  const handleUseGps = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setIsLocating(false);
          setSortBy('distance');
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    }
  };

  // Load favorites & live listings from Firestore
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('monky_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
    } catch (e) {
      console.error(e);
    }

    let isMounted = true;
    const loadAds = async () => {
      let deletedIds: string[] = [];
      try {
        const savedDeleted = localStorage.getItem('monky_deleted_listings');
        if (savedDeleted) deletedIds = JSON.parse(savedDeleted);
      } catch (e) {
        console.error(e);
      }

      let localAds: AdListing[] = [];
      try {
        const saved = localStorage.getItem('monky_user_listings');
        if (saved) {
          localAds = (JSON.parse(saved) as AdListing[]).filter((x) => !deletedIds.includes(x.id));
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const firestoreAds = await getListings(true);
        const firestoreIds = new Set(firestoreAds.map((a) => a.id));

        // Purge ghost deleted ads from localAds
        const validLocalAds = localAds.filter((ad) => {
          if (deletedIds.includes(ad.id)) return false;
          if (!firestoreIds.has(ad.id) && !ad.id.startsWith('local-')) return false;
          return true;
        });

        if (validLocalAds.length !== localAds.length) {
          localStorage.setItem('monky_user_listings', JSON.stringify(validLocalAds));
        }

        const combined = [...firestoreAds];
        validLocalAds.forEach((ad) => {
          if (!deletedIds.includes(ad.id) && !combined.some((item) => item.id === ad.id)) {
            combined.unshift(ad);
          }
        });

        if (isMounted) {
          setRealListings(combined);
          setLoading(false);
        }
      } catch (err) {
        console.error('Eroare la încărcarea anunțurilor:', err);
        if (isMounted) {
          setRealListings(localAds);
          setLoading(false);
        }
      }
    };

    loadAds();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((item) => item !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('monky_favorites', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Extract all car brands present in listings
  const availableCarBrands = useMemo(() => {
    const brandsSet = new Set<string>(POPULAR_CAR_BRANDS);
    realListings.forEach((item) => {
      if (isCategoryMatch(item.category, 'coches')) {
        const b = resolveItemBrand(item);
        if (b) brandsSet.add(b);
      }
    });
    return Array.from(brandsSet).sort();
  }, [realListings]);

  // Filter listings
  const filteredListings = useMemo(() => {
    let base = realListings.filter((item) => {
      // 1. Category and Subcategory matching
      const itemSub = (item as any).subcategory || (item as any).subCategory || (item as any).type || (item as any).subcategoria;
      const itemTitle = item.title || '';
      const itemDesc = item.description || '';

      if (activeCategory) {
        if (!isCategoryMatch(item.category, activeCategory.name, selectedType, itemSub, itemTitle, itemDesc)) {
          return false;
        }
      } else if (categoryParam && categoryParam !== 'all' && categoryParam !== 'Todos' && categoryParam !== 'Orice') {
        if (!isCategoryMatch(item.category, categoryParam, selectedType, itemSub, itemTitle, itemDesc)) {
          return false;
        }
      } else if (selectedType && selectedType !== 'Orice' && !selectedType.startsWith('Toate')) {
        if (!isCategoryMatch(item.category, null, selectedType, itemSub, itemTitle, itemDesc)) {
          return false;
        }
      }

      // 2. Brand filter (Car Brand matching)
      if (selectedBrand && selectedBrand !== 'Orice') {
        const itemBrand = resolveItemBrand(item);
        if (!itemBrand || itemBrand.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // 3. Model filter
      if (selectedModel !== 'Orice' && item.model !== selectedModel) {
        return false;
      }

      // 4. Price filter
      if (selectedPrice !== 'Până' && selectedPrice !== 'Orice') {
        const maxPrice = parseInt(selectedPrice, 10);
        if (!isNaN(maxPrice) && item.price > maxPrice) {
          return false;
        }
      }

      // 5. Location filter
      if (
        locationInput &&
        locationInput !== 'Toată România' &&
        locationInput !== 'Tutta Italia' &&
        locationInput !== 'Toată țara'
      ) {
        const loc = locationInput.toLowerCase().trim();
        if (!item.location?.toLowerCase().includes(loc)) {
          return false;
        }
      }

      return true;
    });

    // 6. Search keyword query filter
    if (searchQuery.trim()) {
      const queryNorm = searchQuery.toLowerCase().trim();
      const keywords = queryNorm.split(/\s+/).filter(Boolean);
      base = base.filter((item) => {
        const title = (item.title || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const brand = (item.brand || '').toLowerCase();
        const model = (item.model || '').toLowerCase();
        return keywords.every(
          (kw) =>
            title.includes(kw) ||
            desc.includes(kw) ||
            brand.includes(kw) ||
            model.includes(kw)
        );
      });
    }

    return base;
  }, [
    realListings,
    activeCategory,
    categoryParam,
    selectedType,
    selectedBrand,
    selectedModel,
    selectedPrice,
    locationInput,
    searchQuery,
  ]);

  // Enrich with Distance and Brand
  const listingsWithDistanceAndBrand = useMemo(() => {
    return filteredListings.map((item) => {
      const distanceKm = getListingDistanceKm(item.location, userCoords, locationInput);
      const brand = resolveItemBrand(item);
      return {
        ...item,
        distanceKm,
        resolvedBrand: brand,
      };
    });
  }, [filteredListings, userCoords, locationInput]);

  // Sorted listings (Closest distance, Newest, Price)
  const sortedListings = useMemo(() => {
    const list = [...listingsWithDistanceAndBrand];
    if (sortBy === 'distance') {
      list.sort((a, b) => {
        if (a.distanceKm === null && b.distanceKm === null) return 0;
        if (a.distanceKm === null) return 1;
        if (b.distanceKm === null) return -1;
        return a.distanceKm - b.distanceKm;
      });
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => (Number(a.price) || 0) - (Number(b.price) || 0));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => (Number(b.price) || 0) - (Number(a.price) || 0));
    }
    return list;
  }, [listingsWithDistanceAndBrand, sortBy]);

  const updateSearchUrl = (
    newQ: string,
    newType: string,
    newLoc: string,
    catOverride?: string,
    brandOverride?: string
  ) => {
    const params = new URLSearchParams();
    if (newQ.trim()) params.set('q', newQ.trim());

    const catToUse = catOverride !== undefined ? catOverride : (categoryParam || '');
    if (catToUse) params.set('category', catToUse);
    if (newType && newType !== 'Orice' && !newType.startsWith('Toate')) {
      params.set('type', newType);
    }
    const brandToUse = brandOverride !== undefined ? brandOverride : selectedBrand;
    if (brandToUse && brandToUse !== 'Orice') {
      params.set('brand', brandToUse);
    }
    if (selectedModel && selectedModel !== 'Orice') params.set('model', selectedModel);
    if (newLoc.trim() && newLoc !== 'Toată România' && newLoc !== 'Toată țara') {
      params.set('loc', newLoc.trim());
    }
    if (selectedPrice && selectedPrice !== 'Orice' && selectedPrice !== 'Până') {
      params.set('price', selectedPrice);
    }

    router.push(`/cautare?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('Orice');
    setSelectedBrand('Orice');
    setSelectedModel('Orice');
    setLocationInput('Toată România');
    setSelectedPrice('Orice');
    router.push('/cautare');
  };

  // Active filter chips
  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (activeCategory) {
      chips.push({
        key: 'cat',
        label: `Categorie: ${activeCategory.name}`,
        onRemove: () => updateSearchUrl(searchQuery, 'Orice', locationInput, '', selectedBrand),
      });
    }

    if (selectedBrand && selectedBrand !== 'Orice') {
      chips.push({
        key: 'brand',
        label: `Marcă: ${selectedBrand}`,
        onRemove: () => {
          setSelectedBrand('Orice');
          updateSearchUrl(searchQuery, selectedType, locationInput, undefined, 'Orice');
        },
      });
    }

    if (selectedType && selectedType !== 'Orice' && !selectedType.startsWith('Toate')) {
      chips.push({
        key: 'type',
        label: `Subcategorie: ${selectedType}`,
        onRemove: () => {
          setSelectedType('Orice');
          updateSearchUrl(searchQuery, 'Orice', locationInput);
        },
      });
    }

    if (searchQuery.trim()) {
      chips.push({
        key: 'query',
        label: `Căutare: "${searchQuery}"`,
        onRemove: () => {
          setSearchQuery('');
          updateSearchUrl('', selectedType, locationInput);
        },
      });
    }

    if (
      locationInput &&
      locationInput !== 'Toată România' &&
      locationInput !== 'Tutta Italia' &&
      locationInput !== 'Toată țara'
    ) {
      chips.push({
        key: 'location',
        label: `Locație: ${locationInput}`,
        onRemove: () => {
          setLocationInput('Toată România');
          updateSearchUrl(searchQuery, selectedType, 'Toată România');
        },
      });
    }

    return chips;
  }, [activeCategory, selectedBrand, selectedType, searchQuery, locationInput]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#131417]">
      <Navbar favoriteCount={favorites.length} />

      <main className="main-container flex-grow py-6">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 px-1">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Tevinde.ro
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {activeCategory ? activeCategory.name : 'Toate categoriile'}
            {selectedBrand && selectedBrand !== 'Orice' ? ` > ${selectedBrand}` : ''}
            {selectedType && selectedType !== 'Orice' && !selectedType.startsWith('Toate')
              ? ` > ${selectedType}`
              : ''}
          </span>
        </nav>

        {/* Search & Filter Header Bar */}
        <div className="bg-white dark:bg-[#1a222d] border border-slate-200/90 dark:border-[#2d3b49] rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs mb-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Field 1: Ce căutați? */}
            <div className="md:col-span-5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Ce căutați?
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateSearchUrl(searchQuery, selectedType, locationInput);
                    }
                  }}
                  placeholder="Ex: Audi A4, Volkswagen Golf, SEAT Ibiza..."
                  className="w-full h-[46px] pl-10 pr-9 rounded-2xl border border-slate-200/90 dark:border-[#383838] bg-white dark:bg-[#252525] text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/25 focus:border-[#03c1a2] transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      updateSearchUrl('', selectedType, locationInput);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Field 2: În ce categorie? / Subcategorie */}
            <div className="md:col-span-4">
              <CategoryDropdown
                value={activeCategory ? selectedType : categoryParam || 'Orice'}
                onChange={(newVal) => {
                  if (activeCategory) {
                    setSelectedType(newVal);
                    updateSearchUrl(searchQuery, newVal, locationInput, activeCategory.id);
                  } else {
                    if (newVal === 'Orice') {
                      setSelectedType('Orice');
                      updateSearchUrl(searchQuery, 'Orice', locationInput, '');
                    } else {
                      setSelectedType('Orice');
                      updateSearchUrl(searchQuery, 'Orice', locationInput, newVal);
                    }
                  }
                }}
                label={activeCategory ? `Subcategorie (${activeCategory.name})` : 'În ce categorie?'}
                optionsList={
                  activeCategory
                    ? getSubcategoryOptions(activeCategory.id)
                    : getCategoryOptions()
                }
              />
            </div>

            {/* Field 3: Unde? with GPS Distance button */}
            <div className="md:col-span-3">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Unde? (Distanță km)
                </label>
                <button
                  type="button"
                  onClick={handleUseGps}
                  className="text-[11px] font-bold text-[#03c1a2] hover:text-[#029b82] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Detectează automat poziția mea prin GPS"
                >
                  <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
                  <span>{isLocating ? 'Detectez...' : 'GPS-ul meu'}</span>
                </button>
              </div>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                <input
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateSearchUrl(searchQuery, selectedType, locationInput);
                    }
                  }}
                  placeholder="Toată România / Oraș..."
                  className="w-full h-[46px] pl-10 pr-9 rounded-2xl border border-slate-200/90 dark:border-[#383838] bg-white dark:bg-[#252525] text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/25 focus:border-[#03c1a2] transition-all"
                />
                {locationInput && locationInput !== 'Toată România' && (
                  <button
                    type="button"
                    onClick={() => {
                      setLocationInput('Toată România');
                      updateSearchUrl(searchQuery, selectedType, 'Toată România');
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>


        {/* Container for Results */}
        <section className="w-full bg-[#F2F3F6] dark:bg-[#1a222d] rounded-2xl sm:rounded-3xl p-2.5 sm:p-7 border border-slate-200/80 dark:border-[#2d3b49] shadow-xs my-4 sm:my-6">
          {/* Results Header Control Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Anunțuri – {activeCategory ? activeCategory.name : 'Toate categoriile'}
                {selectedBrand && selectedBrand !== 'Orice' && (
                  <span className="text-[#03c1a2] font-semibold text-base sm:text-lg ml-2">
                    {selectedBrand}
                  </span>
                )}
                {selectedType && selectedType !== 'Orice' && !selectedType.startsWith('Toate') && (
                  <span className="text-slate-500 font-normal text-sm sm:text-base ml-2">
                    ({selectedType})
                  </span>
                )}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {sortedListings.length === 1
                  ? '1 rezultat găsit'
                  : `${sortedListings.length} rezultate găsite`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Sort Dropdown: Closest Distance (km) / Newest / Price */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#252525] px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#383838]">
                <ArrowUpDown size={13} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sortare:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="distance" className="bg-white dark:bg-[#242424]">📍 Cea mai apropiată (km)</option>
                  <option value="newest" className="bg-white dark:bg-[#242424]">🕒 Cele mai noi</option>
                  <option value="price_asc" className="bg-white dark:bg-[#242424]">💰 Preț: Mic la Mare</option>
                  <option value="price_desc" className="bg-white dark:bg-[#242424]">💎 Preț: Mare la Mic</option>
                </select>
              </div>

              {activeFilterChips.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 bg-white dark:bg-[#242424] px-3 py-1.5 rounded-full border border-slate-200 dark:border-[#333333] shadow-sm cursor-pointer"
                >
                  <RotateCcw size={13} />
                  Resetare filtre
                </button>
              )}

              {/* View Mode Selector (List vs Grid) */}
              <div className="bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#333333] rounded-full p-1 flex items-center shadow-sm">
                <button
                  type="button"
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  onClick={() => setViewMode('list')}
                  title="Vizualizare listă"
                >
                  <ListIcon size={16} />
                </button>
                <button
                  type="button"
                  className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                  onClick={() => setViewMode('grid')}
                  title="Vizualizare grilă"
                >
                  <LayoutGrid size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterChips.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {activeFilterChips.map((chip) => (
                <span
                  key={chip.key}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-medium rounded-full"
                >
                  {chip.label}
                  <button
                    type="button"
                    onClick={chip.onRemove}
                    className="hover:bg-blue-200/60 dark:hover:bg-blue-800/60 p-0.5 rounded-full text-blue-600 dark:text-blue-400 transition-colors cursor-pointer"
                    title="Elimină filtru"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Results Listings */}
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <Loader2 className="animate-spin text-[#03c1a2] mr-2" size={24} />
              <p className="text-slate-500 font-semibold">Se încarcă anunțurile...</p>
            </div>
          ) : sortedListings.length === 0 ? (
            <div className="bg-slate-50/60 dark:bg-[#1a222d] rounded-2xl p-12 text-center border border-slate-100 dark:border-[#2d3b49] flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-100 dark:bg-[#2d3b49] rounded-full flex items-center justify-center mb-4 text-slate-400">
                <Filter size={32} />
              </div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                Niciun rezultat găsit
              </h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                Nu am găsit niciun anunț care să se potrivească filtrelor selectate. Încearcă să elimini din filtre sau să cauți alt termen.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm shadow transition-all cursor-pointer"
              >
                <RotateCcw size={16} />
                Resetează toate filtrele
              </button>
            </div>
          ) : viewMode === 'list' ? (
            /* COMPACT MODERN LIST VIEW WITH INTERACTIVE CAROUSEL */
            <div className="flex flex-col gap-3">
              {sortedListings.slice(0, visibleCount).map((item) => (
                <ListingListCard
                  key={item.id}
                  item={item as any}
                  isFav={favorites.includes(item.id || '')}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            /* GRID VIEW (Modern Card Layout that follows global theme) - 2 columns on mobile */
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-2 sm:gap-3">
              {sortedListings.slice(0, visibleCount).map((item) => (
                <CarListingCard
                  key={item.id || Math.random().toString()}
                  item={item as any}
                  isFav={favorites.includes(item.id || '')}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {sortedListings.length > visibleCount && (
            <div className="flex justify-center my-6">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="bg-[#38d39f] hover:bg-[#31c794] active:scale-95 text-[#18222d] text-sm font-extrabold px-7 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer select-none"
              >
                Încarcă mai multe
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">Se încarcă...</div>}>
      <SearchContent />
    </Suspense>
  );
}
