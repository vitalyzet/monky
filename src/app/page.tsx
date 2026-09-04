'use client';

import { isCategoryMatch, APP_CATEGORIES } from '@/data/categories';

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchFilterBox } from '@/components/SearchFilterBox';
import { CategoryExplore } from '@/components/CategoryExplore';
import { RecentListingsSlider } from '@/components/RecentListingsSlider';
import { ListingGrid, ActiveFilterChip } from '@/components/ListingGrid';
import { SuggestedSearches } from '@/components/SuggestedSearches';
import { Footer } from '@/components/Footer';
import { Listing, CATEGORIES } from '@/data/mockData';
import { getListings, AdListing } from '@/lib/db';
import { normalizeText } from '@/lib/stringUtils';
import { prewarmAllListings } from '@/lib/adCache';

const TYPE_TO_CAT_MAP: Record<string, string> = {
  'Tehnologie și electronică': 'tehnologie-electronica',
  'Încărcătoare & Cabluri': 'incarcatoare-cabluri',
  'Huse & Folii protecție': 'huse-folii',
  'Baterii externe': 'baterii-externe',
  'Accesorii telefoane': 'accesorii-telefoane',
  'Mașină': 'car',
  'Motociclete și scutere': 'moto',
  'Accesorii auto': 'auto-acc',
  'Accesorii pentru motociclete': 'moto-acc',
  'Rulote și rulote': 'camper',
  'Vehicule comerciale': 'commercial',
  'Nautic': 'nautical',
  'Biciclete': 'biciclete',
  'Mobilă și articole de uz casnic': 'mobila',
  'Grădină și bricolaj': 'bricolaj',
  'Obiecte de colecție': 'colectie',
  'Telefonie': 'telefonie',
  'Electrocasnice': 'electrocasnice',
  'Audio/Video': 'audiovideo',
  'Sport': 'sport',
  'Informatică': 'informatica',
  'Console și jocuri video': 'console',
  'Animale': 'animale',
  'Îmbrăcăminte și accesorii': 'haine',
  'Totul pentru copii': 'copii',
  'Fotografie': 'fotografie',
  'Instrumente muzicale': 'muzica',
  'Cărți și reviste': 'carti',
  'Accesorii pentru animale de companie': 'accesorii_animale',
  'Muzică și film': 'vinil',
  'Case și apartamente': 'real-estate',
  'Locuri de muncă': 'jobs'
};

const CAT_TO_TYPE_MAP: Record<string, string> = {
  'tehnologie-electronica': 'Tehnologie și electronică',
  'incarcatoare-cabluri': 'Încărcătoare & Cabluri',
  'huse-folii': 'Huse & Folii protecție',
  'baterii-externe': 'Baterii externe',
  'accesorii-telefoane': 'Accesorii telefoane',
  'car': 'Mașină',
  'moto': 'Motociclete și scutere',
  'auto-acc': 'Accesorii auto',
  'moto-acc': 'Accesorii pentru motociclete',
  'camper': 'Rulote și rulote',
  'commercial': 'Vehicule comerciale',
  'nautical': 'Nautic',
  'biciclete': 'Biciclete',
  'mobila': 'Mobilă și articole de uz casnic',
  'bricolaj': 'Grădină și bricolaj',
  'colectie': 'Obiecte de colecție',
  'telefonie': 'Telefonie',
  'electrocasnice': 'Electrocasnice',
  'audiovideo': 'Audio/Video',
  'sport': 'Sport',
  'informatica': 'Informatică',
  'console': 'Console și jocuri video',
  'animale': 'Animale',
  'haine': 'Îmbrăcăminte și accesorii',
  'copii': 'Totul pentru copii',
  'fotografie': 'Fotografie',
  'muzica': 'Instrumente muzicale',
  'carti': 'Cărți și reviste',
  'accesorii_animale': 'Accesorii pentru animale de companie',
  'vinil': 'Muzică și film',
  'real-estate': 'Case și apartamente',
  'jobs': 'Locuri de muncă'
};

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Motoare');
  const [selectedType, setSelectedType] = useState('Orice');
  const [selectedBrand, setSelectedBrand] = useState('Orice');
  const [selectedModel, setSelectedModel] = useState('Orice');
  const [locationInput, setLocationInput] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('Orice');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [favorites, setFavorites] = useState<string[]>([]);
  const [realListings, setRealListings] = useState<AdListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Load favorites, active tab & real listings from Firestore + localStorage + sessionStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('monky_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error(e);
    }

    try {
      const savedTab = localStorage.getItem('monky_active_tab');
      if (savedTab) {
        setActiveTab(savedTab);
      }
    } catch (e) {
      console.error(e);
    }

    const loadAds = async () => {
      let userAds: AdListing[] = [];
      let deletedIds: string[] = [];

      try {
        const savedDeleted = localStorage.getItem('monky_deleted_listings');
        if (savedDeleted) {
          deletedIds = JSON.parse(savedDeleted);
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const savedUserAds = localStorage.getItem('monky_user_listings');
        if (savedUserAds) {
          userAds = (JSON.parse(savedUserAds) as AdListing[]).filter(
            (item) => !deletedIds.includes(item.id)
          );
        }
      } catch (e) {
        console.error('Eroare la citirea user listings:', e);
      }

      try {
        const firestoreAds = await getListings(true);
        const firestoreIds = new Set(firestoreAds.map((ad) => ad.id));

        // Reconcile userAds: purge any ads that were deleted from Firestore
        const validUserAds = userAds.filter((ad) => {
          if (deletedIds.includes(ad.id)) return false;
          // If it had a database ID and is no longer in Firestore, it was deleted in admin/db!
          if (!firestoreIds.has(ad.id) && !ad.id.startsWith('local-')) {
            return false;
          }
          return true;
        });

        // Clean ghost ads from localStorage permanently
        if (validUserAds.length !== userAds.length) {
          localStorage.setItem('monky_user_listings', JSON.stringify(validUserAds));
        }

        const combined = [...firestoreAds];
        validUserAds.forEach((ad) => {
          if (!deletedIds.includes(ad.id) && !combined.some((item) => item.id === ad.id)) {
            combined.unshift(ad);
          }
        });
        prewarmAllListings(combined);
        setRealListings(combined);
      } catch (err) {
        console.error('Eroare la încărcarea anunțurilor:', err);
        setRealListings(userAds);
      } finally {
        setLoading(false);
      }
    };

    loadAds();

    const handleListingDeleted = (e: any) => {
      const deletedId = e?.detail?.id;
      if (deletedId) {
        setRealListings((prev) => prev.filter((item) => item.id !== deletedId));
      } else {
        loadAds();
      }
    };

    window.addEventListener('monky_listing_deleted', handleListingDeleted);
    window.addEventListener('storage', loadAds);

    return () => {
      window.removeEventListener('monky_listing_deleted', handleListingDeleted);
      window.removeEventListener('storage', loadAds);
    };
  }, []);

  // Restore scroll position to last viewed ad card when returning from details page
  useEffect(() => {
    if (!loading) {
      try {
        const lastId = sessionStorage.getItem('lastViewedAdId');
        if (lastId) {
          sessionStorage.removeItem('lastViewedAdId');
          setTimeout(() => {
            const el = document.getElementById(`ad-card-${lastId}`);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [loading]);

  const [visibleCount, setVisibleCount] = useState(24);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  // Scroll listener to toggle floating sticky search header when scrolling past main search box
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setShowStickyHeader(true);
      } else {
        setShowStickyHeader(false);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset visible count when active tab or filters change
  useEffect(() => {
    setVisibleCount(24);
  }, [activeTab, selectedType, selectedBrand, selectedModel, selectedCategory, searchQuery, locationInput, selectedPrice]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSelectedType('Orice');
    setSelectedBrand('Orice');
    setSelectedModel('Orice');
    setSelectedCategory(null);
    setVisibleCount(12);
    try {
      localStorage.setItem('monky_active_tab', newTab);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  // Sync category exploration selection with selectedType dropdown and activeTab
  const handleSelectCategory = (catId: string | null, mainTab?: string) => {
    setSelectedCategory(catId);
    if (mainTab && mainTab !== activeTab) {
      setActiveTab(mainTab);
    }
    if (catId && CAT_TO_TYPE_MAP[catId]) {
      setSelectedType(CAT_TO_TYPE_MAP[catId]);
    } else {
      setSelectedType('Orice');
    }
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    if (type !== 'Orice' && TYPE_TO_CAT_MAP[type]) {
      setSelectedCategory(TYPE_TO_CAT_MAP[type]);
    } else {
      setSelectedCategory(null);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('Orice');
    setSelectedBrand('Orice');
    setSelectedModel('Orice');
    setLocationInput('');
    setSelectedPrice('Orice');
    setSelectedCategory(null);
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    (selectedType !== 'Orice' && selectedType !== '') ||
    selectedBrand !== 'Orice' ||
    selectedModel !== 'Orice' ||
    (locationInput.trim() && locationInput !== 'Toată România' && locationInput !== 'Tutta Italia') ||
    (selectedPrice !== 'Orice' && selectedPrice !== 'Până') ||
    selectedCategory !== null
  );

  // Filter listings based on all active criteria
  const filteredListings = useMemo(() => {
    let base = realListings.filter((item) => {
      // ONLY SHOW CARS on the main page as requested: "en pagina principal que aparescan solo coches"
      const isCar = isCategoryMatch(item.category, 'coches');
      if (!isCar) return false;

      // Type / Category dropdown
      if (selectedType !== 'Orice') {
        const targetCategory = TYPE_TO_CAT_MAP[selectedType] || selectedType;
        if (!isCategoryMatch(item.category, targetCategory)) {
          return false;
        }
      }

      // Category card filter
      if (selectedCategory && !isCategoryMatch(item.category, selectedCategory)) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'Orice' && item.brand !== selectedBrand) {
        return false;
      }

      // Model filter
      if (selectedModel !== 'Orice' && item.model !== selectedModel) {
        return false;
      }

      // Price limit filter
      if (selectedPrice !== 'Până' && selectedPrice !== 'Orice') {
        const maxPrice = parseInt(selectedPrice, 10);
        if (!isNaN(maxPrice) && item.price > maxPrice) {
          return false;
        }
      }

      // Location filter search substring
      if (
        locationInput &&
        locationInput !== 'Toată România' &&
        locationInput !== 'Tutta Italia'
      ) {
        const locNorm = normalizeText(locationInput);
        if (!normalizeText(item.location).includes(locNorm)) {
          return false;
        }
      }

      return true;
    });

    // Smart Keyword Search (Diacritic-insensitive, Title/Brand/Model priority)
    if (searchQuery.trim()) {
      const queryNorm = normalizeText(searchQuery);
      const keywords = queryNorm.split(/\s+/).filter(Boolean);

      const titleMatches = base.filter((item) => {
        const titleNorm = normalizeText(item.title);
        const brandNorm = normalizeText(item.brand || '');
        const modelNorm = normalizeText(item.model || '');

        return keywords.every(
          (kw) => titleNorm.includes(kw) || brandNorm.includes(kw) || modelNorm.includes(kw)
        );
      });

      if (titleMatches.length > 0) {
        base = titleMatches;
      } else {
        base = base.filter((item) => {
          const descNorm = normalizeText(item.description);
          const titleNorm = normalizeText(item.title);
          return keywords.every((kw) => titleNorm.includes(kw) || descNorm.includes(kw));
        });
      }
    }

    return base.sort((a, b) => {
      // 1. Promoted always first
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;

      // 2. Then newest first
      const timeA = (a as any).createdAtTime || (a as any).timestamp?.seconds * 1000 || 0;
      const timeB = (b as any).createdAtTime || (b as any).timestamp?.seconds * 1000 || 0;
      return timeB - timeA;
    });
  }, [
    realListings,
    activeTab,
    searchQuery,
    selectedType,
    selectedCategory,
    selectedBrand,
    selectedModel,
    selectedPrice,
    locationInput,
  ]);

  // Construct active filter chips for UX
  const activeFilterChips = useMemo(() => {
    const chips: ActiveFilterChip[] = [];
    if (searchQuery.trim()) {
      chips.push({
        key: 'query',
        label: `Căutare: "${searchQuery}"`,
        onRemove: () => setSearchQuery(''),
      });
    }
    if (selectedType !== 'Orice') {
      chips.push({
        key: 'type',
        label: `Tip: ${selectedType}`,
        onRemove: () => handleTypeChange('Orice'),
      });
    }
    if (selectedBrand !== 'Orice') {
      chips.push({
        key: 'brand',
        label: `Marcă: ${selectedBrand}`,
        onRemove: () => setSelectedBrand('Orice'),
      });
    }
    if (selectedModel !== 'Orice') {
      chips.push({
        key: 'model',
        label: `Model: ${selectedModel}`,
        onRemove: () => setSelectedModel('Orice'),
      });
    }
    if (
      locationInput.trim() &&
      locationInput !== 'Toată România' &&
      locationInput !== 'Tutta Italia'
    ) {
      chips.push({
        key: 'location',
        label: `Locație: ${locationInput}`,
        onRemove: () => setLocationInput(''),
      });
    }
    if (selectedPrice !== 'Orice' && selectedPrice !== 'Până') {
      chips.push({
        key: 'price',
        label: `Preț max: ${selectedPrice} €`,
        onRemove: () => setSelectedPrice('Orice'),
      });
    }
    return chips;
  }, [searchQuery, selectedType, selectedBrand, selectedModel, locationInput, selectedPrice]);

  const handleSelectSuggestedSearch = (query: string) => {
    setSearchQuery(query);
  };

  const displayCount = filteredListings.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7f8] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar
        favoriteCount={favorites.length}
        onResetSearch={handleResetFilters}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={activeTab}
        selectedType={selectedType}
        setSelectedType={handleTypeChange}
        locationInput={locationInput}
        setLocationInput={setLocationInput}
        showCompactSearch={showStickyHeader}
      />

      <main className="main-container flex-grow">
        {/* Semantic H1 for Google SEO */}
        <h1 className="sr-only">Tevinde.ro - Anunțuri Gratuite Auto, Moto, Imobiliare și Tehnologie în România</h1>

        {/* Upper Search Bar */}
        <SearchFilterBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          selectedType={selectedType}
          setSelectedType={handleTypeChange}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          locationInput={locationInput}
          setLocationInput={setLocationInput}
          selectedPrice={selectedPrice}
          setSelectedPrice={setSelectedPrice}
          totalListingsCount={displayCount}
          onResetFilters={handleResetFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Explore Categories */}
        <CategoryExplore
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          activeTab={activeTab}
        />

        {/* Recent Listings Slider (Anunțuri noi) like in the app */}
        {!loading && realListings.length > 0 && (
          <RecentListingsSlider
            listings={realListings as any}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {/* Listings Section */}
        <section className="w-full my-6">
          {loading ? (
            <div className="flex justify-center items-center py-24">
              <p className="text-slate-500 font-semibold animate-pulse">Se încarcă anunțurile...</p>
            </div>
          ) : (
            <>
              <ListingGrid
                title="Autoturisme recomandate"
                listings={filteredListings.slice(0, visibleCount) as any}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                activeFilterChips={activeFilterChips}
                onResetFilters={handleResetFilters}
                showPriceOnImage={false}
                maxColumns={4}
              />

              {filteredListings.length > visibleCount && (
                <div className="flex justify-center my-6">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 24)}
                    className="bg-[#38d39f] hover:bg-[#31c794] active:scale-95 text-[#18222d] text-sm font-extrabold px-7 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer select-none"
                  >
                    Încarcă mai multe
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Suggested Searches Carousel */}
        <SuggestedSearches onSelectSuggestedSearch={handleSelectSuggestedSearch} />
      </main>

      <Footer />
    </div>
  );
}

