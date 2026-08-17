'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Car, ChevronDown, MapPin, X, Search, Layers, RotateCcw } from 'lucide-react';
import { BRAND_MODELS_MAP } from '@/data/mockData';

interface SearchFilterBoxProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedBrand: string;
  setSelectedBrand: (brand: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  locationInput: string;
  setLocationInput: (loc: string) => void;
  selectedPrice: string;
  setSelectedPrice: (price: string) => void;
  totalListingsCount: number;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const SearchFilterBox: React.FC<SearchFilterBoxProps> = ({
  searchQuery,
  setSearchQuery,
  activeTab,
  setActiveTab,
  selectedType,
  setSelectedType,
  selectedBrand,
  setSelectedBrand,
  selectedModel,
  setSelectedModel,
  locationInput,
  setLocationInput,
  selectedPrice,
  setSelectedPrice,
  totalListingsCount,
  onResetFilters,
  hasActiveFilters,
}) => {
  const router = useRouter();
  const tabs = ['Motoare', 'Piață', 'Imobiliare', 'Lucru'];

  // Available models based on selected brand
  const availableModels = React.useMemo(() => {
    if (selectedBrand !== 'Orice' && BRAND_MODELS_MAP[selectedBrand]) {
      return BRAND_MODELS_MAP[selectedBrand];
    }
    // Default list of models across all brands
    return ['Panda', 'Golf', '500', 'Wrangler', 'RS3', '3 Series', 'A4', 'C-Class', 'Duster'];
  }, [selectedBrand]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBrand = e.target.value;
    setSelectedBrand(newBrand);
    // Reset model if new brand doesn't support the current selectedModel
    if (newBrand !== 'Orice' && BRAND_MODELS_MAP[newBrand]) {
      if (!BRAND_MODELS_MAP[newBrand].includes(selectedModel)) {
        setSelectedModel('Orice');
      }
    }
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedType && selectedType !== 'Orice') params.set('type', selectedType);
    if (selectedBrand && selectedBrand !== 'Orice') params.set('brand', selectedBrand);
    if (selectedModel && selectedModel !== 'Orice') params.set('model', selectedModel);
    if (locationInput.trim()) params.set('loc', locationInput.trim());
    if (selectedPrice && selectedPrice !== 'Orice' && selectedPrice !== 'Până') params.set('price', selectedPrice);

    router.push(`/cautare?${params.toString()}`);
  };

  return (
    <div className="search-card">
      {/* Top Tabs Header */}
      <div className="main-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter Inputs Grid */}
      <div className="filter-grid">
        {/* Field 1: Ce căutați? (Keyword Search) */}
        <div className="filter-group">
          <label className="filter-label">Ce căutați?</label>
          <div className="filter-input-wrapper">
            <Search className="input-icon-left text-slate-400" size={18} />
            <input
              type="text"
              className="filter-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ex: Golf 7, BMW, Costum moto..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setSearchQuery('')}
                title="Șterge textul căutat"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Field 2: Categoria */}
        <div className="filter-group">
          <label className="filter-label">Categoria</label>
          <div className="filter-input-wrapper">
            <Layers className="input-icon-left text-slate-400" size={18} />
            <select
              className="filter-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
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
            <ChevronDown className="input-icon-right" size={18} />
          </div>
        </div>

        {/* Field 3: Marca */}
        <div className="filter-group">
          <label className="filter-label">Marca</label>
          <div className="filter-input-wrapper">
            <select
              className="filter-select"
              style={{ paddingLeft: '20px' }}
              value={selectedBrand}
              onChange={handleBrandChange}
            >
              <option value="Orice">Orice marcă</option>
              <option value="BMW">BMW</option>
              <option value="Audi">Audi</option>
              <option value="Volkswagen">Volkswagen</option>
              <option value="Fiat">Fiat</option>
              <option value="Mercedes-Benz">Mercedes-Benz</option>
              <option value="Dacia">Dacia</option>
              <option value="Jeep">Jeep</option>
              <option value="Dainese">Dainese</option>
              <option value="Alpinestars">Alpinestars</option>
              <option value="M-Tech">M-Tech</option>
              <option value="Arlen Ness">Arlen Ness</option>
              <option value="Held">Held</option>
              <option value="Revit">Revit</option>
            </select>
            <ChevronDown className="input-icon-right" size={18} />
          </div>
        </div>

        {/* Field 4: Model */}
        <div className="filter-group">
          <label className="filter-label">Model</label>
          <div className="filter-input-wrapper">
            <select
              className="filter-select"
              style={{ paddingLeft: '20px' }}
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              <option value="Orice">Orice model</option>
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="input-icon-right" size={18} />
          </div>
        </div>

        {/* Field 5: Unde (Locație) */}
        <div className="filter-group">
          <label className="filter-label">Unde</label>
          <div className="filter-input-wrapper">
            <MapPin className="input-icon-left text-slate-400" size={18} />
            <input
              type="text"
              className="filter-input"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Slatina, București..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
            />
            {locationInput && (
              <button
                type="button"
                className="clear-btn"
                onClick={() => setLocationInput('')}
                title="Şterge locația"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Field 6: Preț (€) */}
        <div className="filter-group">
          <label className="filter-label">Preț maxim (€)</label>
          <div className="filter-input-wrapper">
            <select
              className="filter-select"
              style={{ paddingLeft: '20px' }}
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
            >
              <option value="Orice">Orice preț</option>
              <option value="100">Până la 100 €</option>
              <option value="250">Până la 250 €</option>
              <option value="500">Până la 500 €</option>
              <option value="1000">Până la 1.000 €</option>
              <option value="10000">Până la 10.000 €</option>
              <option value="20000">Până la 20.000 €</option>
              <option value="35000">Până la 35.000 €</option>
            </select>
            <ChevronDown className="input-icon-right" size={18} />
          </div>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <div className="filter-bottom-actions mt-4 flex items-center justify-between">
        {hasActiveFilters ? (
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
            onClick={onResetFilters}
          >
            <RotateCcw size={15} />
            <span>Șterge toate filtrele</span>
          </button>
        ) : (
          <button type="button" className="more-filters-link">
            Mai multe filtre
          </button>
        )}

        <button
          type="button"
          className="submit-search-btn cursor-pointer"
          onClick={handleSearchSubmit}
        >
          <Search size={18} />
          <span>Vedeți {totalListingsCount.toLocaleString('ro-RO')} anunțuri</span>
        </button>
      </div>
    </div>
  );
};

