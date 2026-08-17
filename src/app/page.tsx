'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { SearchFilterBox } from '@/components/SearchFilterBox';
import { CategoryExplore } from '@/components/CategoryExplore';
import { ListingGrid, ActiveFilterChip } from '@/components/ListingGrid';
import { SuggestedSearches } from '@/components/SuggestedSearches';
import { Footer } from '@/components/Footer';
import { MOCK_LISTINGS, Listing, CATEGORIES } from '@/data/mockData';

const TYPE_TO_CAT_MAP: Record<string, string> = {
  'Mașină': 'car',
  'Motociclete și scutere': 'moto',
  'Accesorii auto': 'auto-acc',
  'Accesorii pentru motociclete': 'moto-acc',
  'Rulote și rulote': 'camper',
  'Vehicule comerciale': 'commercial',
  'Nautic': 'nautical',
};

const CAT_TO_TYPE_MAP: Record<string, string> = {
  'car': 'Mașină',
  'moto': 'Motociclete și scutere',
  'auto-acc': 'Accesorii auto',
  'moto-acc': 'Accesorii pentru motociclete',
  'camper': 'Rulote și rulote',
  'commercial': 'Vehicule comerciale',
  'nautical': 'Nautic',
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
  const [userListings, setUserListings] = useState<Listing[]>([]);

  // Load favorites & user-published listings from localStorage on mount
  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('monky_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
      const savedUserAds = localStorage.getItem('monky_user_listings');
      if (savedUserAds) {
        setUserListings(JSON.parse(savedUserAds));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const allListings = useMemo(() => {
    return [...userListings, ...MOCK_LISTINGS];
  }, [userListings]);

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

  // Sync category exploration selection with selectedType dropdown
  const handleSelectCategory = (catId: string | null) => {
    setSelectedCategory(catId);
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
    return MOCK_LISTINGS.filter((item) => {
      // Keyword search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchBrand = item.brand?.toLowerCase().includes(q);
        const matchModel = item.model?.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchSeller = item.seller?.name.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (
          !matchTitle &&
          !matchDesc &&
          !matchBrand &&
          !matchModel &&
          !matchLoc &&
          !matchSeller &&
          !matchCat
        ) {
          return false;
        }
      }

      // Type / Category dropdown
      if (selectedType !== 'Orice') {
        const targetCategory = TYPE_TO_CAT_MAP[selectedType];
        if (targetCategory && item.category !== targetCategory) {
          return false;
        }
      }

      // Category card filter
      if (selectedCategory && item.category !== selectedCategory) {
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
        const loc = locationInput.toLowerCase().trim();
        if (!item.location.toLowerCase().includes(loc)) {
          return false;
        }
      }

      return true;
    });
  }, [
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

  const displayCount = hasActiveFilters
    ? filteredListings.length
    : filteredListings.length * 3500 + 420;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar favoriteCount={favorites.length} onResetSearch={handleResetFilters} />

      <main className="main-container flex-grow">
        {/* Upper Search Card */}
        <SearchFilterBox
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
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
        />

        {/* Recommended Items Grid */}
        <ListingGrid
          listings={filteredListings}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          activeFilterChips={activeFilterChips}
          onResetFilters={handleResetFilters}
        />

        {/* Suggested Searches Carousel */}
        <SuggestedSearches onSelectSuggestedSearch={handleSelectSuggestedSearch} />
      </main>

      <Footer />
    </div>
  );
}

