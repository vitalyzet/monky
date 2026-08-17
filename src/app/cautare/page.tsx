'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import '@/app/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MOCK_LISTINGS, Listing, CATEGORIES } from '@/data/mockData';
import {
  Search,
  MapPin,
  X,
  Layers,
  Camera,
  Heart,
  Phone,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Filter,
  RotateCcw,
  Truck,
} from 'lucide-react';

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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

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

  const [favorites, setFavorites] = useState<string[]>([]);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [revealedPhones, setRevealedPhones] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedType(searchParams.get('type') || 'Orice');
    setSelectedBrand(searchParams.get('brand') || 'Orice');
    setSelectedModel(searchParams.get('model') || 'Orice');
    setLocationInput(searchParams.get('loc') || 'Toată România');
    setSelectedPrice(searchParams.get('price') || 'Orice');
  }, [searchParams]);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('monky_favorites');
      if (savedFavs) setFavorites(JSON.parse(savedFavs));
      const savedUserAds = localStorage.getItem('monky_user_listings');
      if (savedUserAds) setUserListings(JSON.parse(savedUserAds));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const allListings = useMemo(() => {
    return [...userListings, ...MOCK_LISTINGS];
  }, [userListings]);

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

  const togglePhoneReveal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setRevealedPhones((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter listings
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
    selectedBrand,
    selectedModel,
    selectedPrice,
    locationInput,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('Orice');
    setSelectedBrand('Orice');
    setSelectedModel('Orice');
    setLocationInput('Toată România');
    setSelectedPrice('Orice');
    router.push('/cautare');
  };

  const updateSearchUrl = (
    newQuery: string,
    newType: string,
    newLoc: string
  ) => {
    const params = new URLSearchParams();
    if (newQuery.trim()) params.set('q', newQuery.trim());
    if (newType && newType !== 'Orice') params.set('type', newType);
    if (selectedBrand && selectedBrand !== 'Orice') params.set('brand', selectedBrand);
    if (selectedModel && selectedModel !== 'Orice') params.set('model', selectedModel);
    if (newLoc.trim() && newLoc !== 'Toată România') params.set('loc', newLoc.trim());
    if (selectedPrice && selectedPrice !== 'Orice') params.set('price', selectedPrice);

    router.push(`/cautare?${params.toString()}`);
  };

  const activeCategoryLabel = selectedType !== 'Orice' ? selectedType : 'Toate categoriile';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar favoriteCount={favorites.length} onResetSearch={handleResetFilters} />

      <main className="main-container flex-grow py-6">
        {/* Breadcrumb matching Screenshot 2 */}
        <div className="sbt-breadcrumb">
          <Link href="/" className="sbt-breadcrumb-item">
            Monky
          </Link>
          <ChevronRight size={12} className="sbt-breadcrumb-separator" />
          <span className="font-semibold text-slate-800">{activeCategoryLabel}</span>
        </div>

        {/* Horizontal Top Search Bar matching Screenshot 2 */}
        <div className="sbt-search-bar-card">
          <div className="sbt-search-bar-grid">
            {/* Field 1: Ce căutați? */}
            <div className="sbt-search-bar-group">
              <label className="sbt-search-bar-label">Ce căutați?</label>
              <div className="sbt-search-bar-input-wrapper">
                <Search className="input-icon-left text-slate-400" size={18} />
                <input
                  type="text"
                  className="sbt-search-bar-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateSearchUrl(searchQuery, selectedType, locationInput);
                    }
                  }}
                  placeholder="Vespa, iPhone, Apartament cu două ca..."
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => {
                      setSearchQuery('');
                      updateSearchUrl('', selectedType, locationInput);
                    }}
                    title="Şterge textul"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Field 2: În ce categorie? */}
            <div className="sbt-search-bar-group">
              <label className="sbt-search-bar-label">În ce categorie?</label>
              <div className="sbt-search-bar-input-wrapper">
                <Layers className="input-icon-left text-slate-400" size={18} />
                <select
                  className="sbt-search-bar-select"
                  value={selectedType}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setSelectedType(newType);
                    updateSearchUrl(searchQuery, newType, locationInput);
                  }}
                >
                  <option value="Orice">Toate categoriile</option>
                  <option value="Mașină">Mașină</option>
                  <option value="Motociclete și scutere">Motociclete și scutere</option>
                  <option value="Accesorii auto">Accesorii auto</option>
                  <option value="Accesorii pentru motociclete">Accesorii pentru motociclete</option>
                  <option value="Rulote și rulote">Rulote și rulote</option>
                  <option value="Vehicule comerciale">Vehicule comerciale</option>
                  <option value="Nautic">Nautic</option>
                </select>
              </div>
            </div>

            {/* Field 3: Unde? */}
            <div className="sbt-search-bar-group">
              <label className="sbt-search-bar-label">Unde?</label>
              <div className="sbt-search-bar-input-wrapper">
                <MapPin className="input-icon-left text-slate-400" size={18} />
                <input
                  type="text"
                  className="sbt-search-bar-input"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateSearchUrl(searchQuery, selectedType, locationInput);
                    }
                  }}
                  placeholder="Toată România / Oraș..."
                />
                {locationInput && locationInput !== 'Toată România' && (
                  <button
                    type="button"
                    className="clear-btn"
                    onClick={() => {
                      setLocationInput('Toată România');
                      updateSearchUrl(searchQuery, selectedType, 'Toată România');
                    }}
                    title="Şterge locația"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Header Control Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Anunțuri {activeCategoryLabel !== 'Toate categoriile' ? `– ${activeCategoryLabel}` : ''}
            </h1>
            <p className="text-sm text-slate-500">
              {filteredListings.length === 1
                ? '1 rezultat găsit'
                : `${filteredListings.length} rezultate găsite`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm"
            >
              <RotateCcw size={13} />
              Resetare filtre
            </button>

            {/* View Mode Selector (List vs Grid) */}
            <div className="bg-white border border-slate-200 rounded-full p-1 flex items-center shadow-sm">
              <button
                type="button"
                className={`p-1.5 rounded-full transition-colors ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                onClick={() => setViewMode('list')}
                title="Vizualizare listă"
              >
                <ListIcon size={16} />
              </button>
              <button
                type="button"
                className={`p-1.5 rounded-full transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                onClick={() => setViewMode('grid')}
                title="Vizualizare grilă"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <Filter size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Niciun rezultat găsit
            </h3>
            <p className="text-slate-500 max-w-md mb-6">
              Nu am găsit niciun anunț care să corespundă criteriilor tale de căutare. Încearcă să cauți cu alți termeni.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full text-sm shadow transition-all"
            >
              <RotateCcw size={16} />
              Resetează toate filtrele
            </button>
          </div>
        ) : viewMode === 'list' ? (
          /* List View Cards (Matching Screenshot 3) */
          <div className="sbt-list-view-container">
            {filteredListings.map((item) => {
              const isFav = favorites.includes(item.id);
              const isPhoneRevealed = revealedPhones[item.id];

              return (
                <Link
                  key={item.id}
                  href={`/anunt/${item.id}`}
                  className="sbt-list-item-card block text-inherit no-underline"
                >
                  {/* Left Media Container */}
                  <div className="sbt-list-item-media">
                    <img src={item.image} alt={item.title} className="sbt-list-item-image" />

                    {/* Photo Count Badge */}
                    <div className="sbt-count-badge">
                      <Camera size={12} />
                      <span>{item.photoCount}</span>
                    </div>

                    {/* Favorite Heart Circle */}
                    <button
                      type="button"
                      className={`sbt-fav-button ${isFav ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); toggleFavorite(item.id, e); }}
                      title={isFav ? 'Elimină din favorite' : 'Adaugă la favorite'}
                    >
                      <Heart
                        size={16}
                        fill={isFav ? '#f9423a' : 'none'}
                        color={isFav ? '#f9423a' : '#717e8f'}
                      />
                    </button>

                    {/* Promoted Blue Badge matching Screenshot 3 */}
                    {item.isPromoted && (
                      <span className="sbt-promo-badge">Fereastra de afișare</span>
                    )}
                  </div>

                  {/* Right Details Area */}
                  <div className="sbt-list-item-details">
                    <div>
                      {/* Title */}
                      <h2 className="sbt-list-item-title">{item.title}</h2>

                      {/* Price */}
                      <div className="sbt-list-item-price">
                        {item.price.toLocaleString('ro-RO')} €
                      </div>

                      {/* Location */}
                      <div className="sbt-list-item-location">{item.location}</div>

                      {/* Specification Pills Row matching Screenshot 3 */}
                      <div className="sbt-spec-pills-row">
                        <span className="sbt-spec-pill">
                          {item.condition || 'Folosit'}
                        </span>
                        {item.year && <span className="sbt-spec-pill">{item.year}</span>}
                        {item.mileage && <span className="sbt-spec-pill">{item.mileage}</span>}
                        {item.fuel && <span className="sbt-spec-pill">{item.fuel}</span>}
                        {item.transmission && (
                          <span className="sbt-spec-pill">{item.transmission}</span>
                        )}
                        {item.euroClass && (
                          <span className="sbt-spec-pill">{item.euroClass}</span>
                        )}
                      </div>
                    </div>

                    {/* Seller & Action Footer Row matching Screenshot 3 */}
                    <div className="sbt-list-item-footer">
                      <div className="sbt-seller-info">
                        <span className="sbt-seller-type">
                          {item.seller.isDealer ? 'Revânzător' : 'Persoană fizică'}
                        </span>
                        <span>{item.seller.name}</span>
                      </div>

                      <button
                        type="button"
                        className="sbt-phone-action-btn"
                        onClick={(e) => { e.preventDefault(); togglePhoneReveal(item.id, e); }}
                      >
                        <Phone size={14} className="text-slate-600" />
                        <span>
                          {isPhoneRevealed
                            ? item.seller.phone || '0722 000 111'
                            : 'Afișați numărul'}
                        </span>
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Grid View Cards */
          <div className="subito-grid-view subito-grid-view--large">
            {filteredListings.map((item) => {
              const isFav = favorites.includes(item.id);
              return (
                <Link
                  key={item.id}
                  href={`/anunt/${item.id}`}
                  className="sbt-card"
                >
                  <div
                    className={`sbt-picture-container ${
                      item.category === 'auto-acc' ? 'sbt-picture-container--vertical' : ''
                    }`}
                  >
                    <img src={item.image} alt={item.title} className="sbt-image" />
                    {item.isPromoted ? (
                      <span className="sbt-promo-badge-red">Fereastra de afișare</span>
                    ) : (
                      <div className="sbt-count-badge">
                        <Camera size={13} />
                        <span>{item.photoCount}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className={`sbt-fav-button ${isFav ? 'active' : ''}`}
                      onClick={(e) => { e.preventDefault(); toggleFavorite(item.id, e); }}
                    >
                      <Heart
                        size={18}
                        fill={isFav ? '#f9423a' : 'none'}
                        color={isFav ? '#f9423a' : '#717e8f'}
                      />
                    </button>
                  </div>
                  <div className="sbt-details">
                    <h3 className="sbt-subject" title={item.title}>
                      {item.title}
                    </h3>
                    <div className="sbt-price-row">
                      <span className="sbt-price">
                        {item.price.toLocaleString('ro-RO')} €
                      </span>
                      {item.hasShipping && (
                        <span title="Livrare disponibilă" className="sbt-shipping-truck flex items-center">
                          <Truck size={17} />
                        </span>
                      )}
                    </div>
                    <div className="sbt-location-container">
                      <span className="sbt-town">{item.location}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
