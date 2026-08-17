'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@/app/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BRAND_MODELS_MAP } from '@/data/mockData';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  PlusCircle,
  Truck,
  MapPin,
  Tag,
  FileText,
  User,
  Phone,
  Euro,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Eye,
  Camera,
  Layers,
  HelpCircle,
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  { value: 'auto-acc', label: 'Accesorii auto' },
  { value: 'car', label: 'Mașină' },
  { value: 'moto', label: 'Motociclete și scutere' },
  { value: 'commercial', label: 'Autoutilitare și Camioane' },
  { value: 'camper', label: 'Rulote și Campere' },
  { value: 'nautical', label: 'Ambarcațiuni și Bărci' },
  { value: 'real-estate', label: 'Imobiliare' },
  { value: 'electronics', label: 'Electronice' },
  { value: 'other', label: 'Alte categorii' },
];

const ROMANIAN_COUNTIES: Record<string, string[]> = {
  'București': ['Sector 1', 'Sector 2', 'Sector 3', 'Sector 4', 'Sector 5', 'Sector 6'],
  'Cluj': ['Cluj-Napoca', 'Turda', 'Dej', 'Gherla'],
  'Timiș': ['Timișoara', 'Lugoj', 'Jimbolia'],
  'Olt': ['Slatina', 'Caracal', 'Corabia', 'Balș'],
  'Prahova': ['Ploiești', 'Câmpina', 'Sinaia', 'Bușteni'],
  'Argeș': ['Pitești', 'Câmpulung', 'Curtea de Argeș'],
  'Brașov': ['Brașov', 'Făgăraș', 'Râșnov', 'Zărnești'],
  'Constanța': ['Constanța', 'Mangalia', 'Medgidia', 'Năvodari'],
  'Iași': ['Iași', 'Pașcani', 'Hârlău'],
  'Sibiu': ['Sibiu', 'Mediaș', 'Agnita'],
};

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
];

export default function AdaugaAnuntPage() {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('auto-acc');
  const [brand, setBrand] = useState('Orice');
  const [model, setModel] = useState('Orice');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'RON'>('EUR');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [isExchange, setIsExchange] = useState(false);
  const [condition, setCondition] = useState('Folosit');
  const [hasShipping, setHasShipping] = useState(true);
  const [hasInspection, setHasInspection] = useState(true);
  const [description, setDescription] = useState('');

  // Location
  const [county, setCounty] = useState('Olt');
  const [city, setCity] = useState('Slatina');

  // Contact
  const [sellerName, setSellerName] = useState('Alex Popescu');
  const [sellerPhone, setSellerPhone] = useState('0722 123 456');
  const [hidePhone, setHidePhone] = useState(false);
  const [isDealer, setIsDealer] = useState(false);

  // Photos
  const [photos, setPhotos] = useState<string[]>(DEFAULT_PHOTOS);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // Vehicle specs
  const [year, setYear] = useState('2021');
  const [mileage, setMileage] = useState('45.000 km');
  const [fuel, setFuel] = useState('Benzină');
  const [transmission, setTransmission] = useState('Manuală');
  const [euroClass, setEuroClass] = useState('Euro 6');

  // Promotion package
  const [promoPackage, setPromoPackage] = useState<'free' | 'promo' | 'premium'>('promo');

  // Form State
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);

  const brandOptions = Object.keys(BRAND_MODELS_MAP);
  const modelOptions = BRAND_MODELS_MAP[brand] || ['Orice'];
  const cityOptions = ROMANIAN_COUNTIES[county] || [county];

  // Handle custom photo file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotos((prev) => [...prev, uploadEvent.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (activePhotoIdx >= indexToRemove && activePhotoIdx > 0) {
      setActivePhotoIdx(activePhotoIdx - 1);
    }
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Titlul anunțului este obligatoriu.';
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      errs.price = 'Introduceți un preț valid mai mare ca 0.';
    }
    if (!description.trim() || description.length < 15) {
      errs.description = 'Descrierea trebuie să aibă cel puțin 15 caractere.';
    }
    if (!city.trim()) errs.city = 'Orașul este obligatoriu.';
    if (!sellerName.trim()) errs.sellerName = 'Numele vânzătorului este obligatoriu.';
    if (!sellerPhone.trim()) errs.sellerPhone = 'Numărul de telefon este obligatoriu.';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newId = `user-ad-${Date.now()}`;
    const mainPhoto = photos[activePhotoIdx] || DEFAULT_PHOTOS[0];

    const locationText = `${city} ( ${county === 'București' ? 'București' : county} )`;

    const newListing = {
      id: newId,
      title: title.trim(),
      price: Number(price),
      hasShipping,
      location: locationText,
      photoCount: photos.length || 1,
      category,
      brand: brand !== 'Orice' ? brand : undefined,
      model: model !== 'Orice' ? model : undefined,
      image: mainPhoto,
      gallery: photos.length > 0 ? photos : [mainPhoto],
      description: description.trim(),
      condition,
      createdAt: 'Acum câteva minute',
      year: category === 'car' || category === 'moto' ? year : undefined,
      mileage: category === 'car' || category === 'moto' ? mileage : undefined,
      fuel: category === 'car' || category === 'moto' ? fuel : undefined,
      transmission: category === 'car' || category === 'moto' ? transmission : undefined,
      euroClass: category === 'car' || category === 'moto' ? euroClass : undefined,
      isPromoted: promoPackage === 'promo' || promoPackage === 'premium',
      seller: {
        name: sellerName.trim(),
        rating: 5.0,
        responseRate: '100%',
        verified: true,
        phone: hidePhone ? 'Telefon ascuns' : sellerPhone.trim(),
        isDealer,
      },
    };

    // Save to localStorage
    try {
      const existing = localStorage.getItem('monky_user_listings');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('monky_user_listings', JSON.stringify([newListing, ...parsed]));
    } catch (err) {
      console.error('Eroare la salvarea anunțului:', err);
    }

    setCreatedListingId(newId);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar favoriteCount={0} />

      <main className="main-container flex-grow py-8 max-w-6xl mx-auto w-full">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={18} />
            Înapoi la prima pagină
          </Link>
          <span className="text-xs font-semibold text-slate-400">
            Monky &gt; Publicare Anunț Nou
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Form (Left 8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
              <div className="mb-8 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
                    <PlusCircle size={24} />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                      Publică un anunț nou
                    </h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                      Vinde rapid pe Monky. Anunțul tău va fi văzut de cumpărători din toată țara.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* 1. Categorii & Titlu */}
                <div>
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Tag size={18} className="text-blue-600" />
                    1. Categorie și Titlu Anunț
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Titlul anunțului *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Bare transversale Thule WingBar EVO Dacia Duster 2021"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                          errors.title ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                        }`}
                      />
                      {errors.title && (
                        <p className="text-xs font-medium text-red-500 mt-1">{errors.title}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Categorie *
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                        >
                          {CATEGORY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {(category === 'car' || category === 'moto' || category === 'auto-acc') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                            Marcă
                          </label>
                          <select
                            value={brand}
                            onChange={(e) => {
                              setBrand(e.target.value);
                              setModel('Orice');
                            }}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Orice">Alege marca</option>
                            {brandOptions.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {brand !== 'Orice' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                          Model
                        </label>
                        <select
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Orice">Alege modelul</option>
                          {modelOptions.map((m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Specificații Tehnice (pentru Auto / Moto) */}
                {(category === 'car' || category === 'moto') && (
                  <div className="border-t border-slate-100 pt-6">
                    <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Sparkles size={18} className="text-blue-600" />
                      2. Specificații Vehicul
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          An fabricație
                        </label>
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="2021"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Rulaj (km)
                        </label>
                        <input
                          type="text"
                          value={mileage}
                          onChange={(e) => setMileage(e.target.value)}
                          placeholder="45.000 km"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Combustibil
                        </label>
                        <select
                          value={fuel}
                          onChange={(e) => setFuel(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                        >
                          <option value="Benzină">Benzină</option>
                          <option value="Diesel">Diesel</option>
                          <option value="Hibrid">Hibrid</option>
                          <option value="Electric">Electric</option>
                          <option value="GPL">GPL</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Cutie viteze
                        </label>
                        <select
                          value={transmission}
                          onChange={(e) => setTransmission(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                        >
                          <option value="Manuală">Manuală</option>
                          <option value="Automată">Automată</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Normă poluare
                        </label>
                        <select
                          value={euroClass}
                          onChange={(e) => setEuroClass(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                        >
                          <option value="Euro 6">Euro 6</option>
                          <option value="Euro 5">Euro 5</option>
                          <option value="Euro 4">Euro 4</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Fotografii (Interactive Dropzone & Preset Selectors) */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <ImageIcon size={18} className="text-blue-600" />
                      3. Adaugă Fotografii ({photos.length})
                    </h2>
                    <span className="text-xs font-semibold text-slate-400">
                      Prima foto este cea principală
                    </span>
                  </div>

                  {/* Photo Dropzone / Upload Button */}
                  <div className="mb-4">
                    <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                        <Upload size={22} />
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        Încarcă poze din calculator sau telefon
                      </span>
                      <span className="text-xs text-slate-400 mt-1">
                        Format JPG, PNG (Max 10MB per foto)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Thumbnails grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {photos.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative aspect-square rounded-2xl overflow-hidden border-2 cursor-pointer transition-all ${
                          activePhotoIdx === idx
                            ? 'border-blue-600 ring-2 ring-blue-400 shadow-md'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        {activePhotoIdx === idx && (
                          <span className="absolute bottom-1.5 left-1.5 bg-blue-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow">
                            Principală
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removePhoto(idx);
                          }}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-slate-900/70 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                          title="Șterge foto"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Preț, Monedă & Opțiuni Opțiuni Livrare */}
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Euro size={18} className="text-blue-600" />
                    4. Preț și Condiții de Vânzare
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Preț *
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            placeholder="180"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className={`w-full pl-4 pr-10 py-3 rounded-xl border text-base font-extrabold text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                              errors.price ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                            }`}
                          />
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setCurrency('EUR')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              currency === 'EUR'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            EUR €
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrency('RON')}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                              currency === 'RON'
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            RON Lei
                          </button>
                        </div>
                      </div>
                      {errors.price && (
                        <p className="text-xs font-medium text-red-500 mt-1">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Stare produs
                      </label>
                      <div className="flex gap-2 pt-0.5">
                        {['Folosit', 'Nou'].map((cond) => (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => setCondition(cond)}
                            className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold border transition-all ${
                              condition === cond
                                ? 'bg-blue-50 text-blue-600 border-blue-300 shadow-sm'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                            }`}
                          >
                            {cond}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Negotiable & Exchange Checkboxes */}
                  <div className="flex flex-wrap gap-4 mt-4">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isNegotiable}
                        onChange={(e) => setIsNegotiable(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      Preț negociabil
                    </label>

                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isExchange}
                        onChange={(e) => setIsExchange(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      Accept schimburi
                    </label>
                  </div>

                  {/* Shipping Box */}
                  <div className="mt-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-500 flex items-center justify-center">
                          <Truck size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            Livrare prin curier 🚚
                          </h4>
                          <p className="text-xs text-slate-500">
                            Afișează camionul roșu pe anunț pentru a atrage mai mulți cumpărători.
                          </p>
                        </div>
                      </div>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={hasShipping}
                          onChange={(e) => setHasShipping(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    {hasShipping && (
                      <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-xs text-slate-600">
                        <ShieldCheck size={16} className="text-emerald-600" />
                        <span>Include opțiunea <strong>"Livrare cu verificare colet"</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Descriere */}
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-blue-600" />
                    5. Descrierea Produsului
                  </h2>

                  <div>
                    <textarea
                      rows={5}
                      placeholder="Descrie starea produsului, accesoriile incluse, specificațiile tehnice, motivele vânzării sau detalii despre ridicare..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 ${
                        errors.description ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                      }`}
                    />
                    {errors.description && (
                      <p className="text-xs font-medium text-red-500 mt-1">
                        {errors.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* 6. Locație & Date Contact */}
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    6. Locație și Date de Contact
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Județ *
                      </label>
                      <select
                        value={county}
                        onChange={(e) => {
                          setCounty(e.target.value);
                          setCity(ROMANIAN_COUNTIES[e.target.value]?.[0] || e.target.value);
                        }}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                      >
                        {Object.keys(ROMANIAN_COUNTIES).map((j) => (
                          <option key={j} value={j}>
                            {j}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Oraș / Localitate *
                      </label>
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-800 bg-white"
                      >
                        {cityOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Nume Vânzător *
                      </label>
                      <input
                        type="text"
                        placeholder="Alex Popescu"
                        value={sellerName}
                        onChange={(e) => setSellerName(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                          errors.sellerName ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                        Număr de Telefon *
                      </label>
                      <input
                        type="text"
                        placeholder="0722 123 456"
                        value={sellerPhone}
                        onChange={(e) => setSellerPhone(e.target.value)}
                        className={`w-full px-4 py-3 rounded-xl border text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 ${
                          errors.sellerPhone ? 'border-red-500 bg-red-50/50' : 'border-slate-200'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-600">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hidePhone}
                        onChange={(e) => setHidePhone(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      Ascunde numărul de telefon în anunț (Afișați numărul la clic)
                    </label>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDealer}
                        onChange={(e) => setIsDealer(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-slate-300"
                      />
                      Sunt revânzător / firmă (Dealer)
                    </label>
                  </div>
                </div>

                {/* 7. Pachete de Promovare Adovo */}
                <div className="border-t border-slate-100 pt-6">
                  <h2 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    7. Alege un Pachet de Promovare
                  </h2>
                  <p className="text-xs text-slate-500 mb-4">
                    Anunțurile promovate primesc de până la 5x mai multe vizualizări și apeluri.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div
                      onClick={() => setPromoPackage('free')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                        promoPackage === 'free'
                          ? 'border-blue-600 bg-blue-50/40 ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-400 block mb-1">Standard</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">Gratuit</h4>
                      <p className="text-xs text-slate-500 mt-1">Valabilitate 30 de zile în listă</p>
                    </div>

                    <div
                      onClick={() => setPromoPackage('promo')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        promoPackage === 'promo'
                          ? 'border-red-500 bg-red-50/40 ring-1 ring-red-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="absolute -top-2.5 right-3 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                        Popular
                      </span>
                      <span className="text-xs font-bold text-red-600 block mb-1">Fereastra de afișare</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">Recomandat</h4>
                      <p className="text-xs text-slate-500 mt-1">Insignă roșie pe foto + top căutări</p>
                    </div>

                    <div
                      onClick={() => setPromoPackage('premium')}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all relative ${
                        promoPackage === 'premium'
                          ? 'border-amber-500 bg-amber-50/40 ring-1 ring-amber-500'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xs font-bold text-amber-600 block mb-1">Pachet Top</span>
                      <h4 className="font-extrabold text-slate-900 text-sm">Premium ⚡</h4>
                      <p className="text-xs text-slate-500 mt-1">Prima poziție în categorie</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-slate-100 pt-8 flex items-center justify-end gap-4">
                  <Link
                    href="/"
                    className="px-6 py-3.5 rounded-full text-sm font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Anulează
                  </Link>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-full shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5"
                  >
                    <Upload size={20} />
                    Publică Anunțul Acum
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Live Card Preview Panel (4 Columns) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Eye size={18} className="text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Previzualizare Anunț
                </h3>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Așa va arăta cardul anunțului tău pe Monky:
              </p>

              {/* Sample Rendered Card */}
              <div className="sbt-card border border-slate-200 rounded-3xl p-2 bg-slate-50/50 shadow-sm">
                <div
                  className={`sbt-picture-container ${
                    category === 'auto-acc' ? 'sbt-picture-container--vertical' : ''
                  }`}
                >
                  <img
                    src={photos[activePhotoIdx] || DEFAULT_PHOTOS[0]}
                    alt={title || 'Titlu anunț'}
                    className="sbt-image"
                  />

                  {promoPackage === 'promo' || promoPackage === 'premium' ? (
                    <span className="sbt-promo-badge-red">Fereastra de afișare</span>
                  ) : (
                    <div className="sbt-count-badge">
                      <Camera size={13} />
                      <span>{photos.length || 1}</span>
                    </div>
                  )}

                  <div className="sbt-fav-button">
                    <Check size={16} className="text-slate-400" />
                  </div>
                </div>

                <div className="sbt-details">
                  <h3 className="sbt-subject font-medium text-slate-800">
                    {title.trim() || 'Titlul anunțului tău va apărea aici...'}
                  </h3>

                  <div className="sbt-price-row">
                    <span className="sbt-price text-slate-900 font-extrabold text-lg">
                      {price ? `${Number(price).toLocaleString('ro-RO')} ${currency === 'EUR' ? '€' : 'Lei'}` : '0 €'}
                    </span>
                    {hasShipping && (
                      <span title="Livrare disponibilă" className="sbt-shipping-truck flex items-center">
                        <Truck size={17} />
                      </span>
                    )}
                  </div>

                  <div className="sbt-location-container text-xs text-slate-500">
                    <span className="sbt-town">{city} ( {county} )</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span>Verificat de echipa Monky. Publicare gratuită.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {createdListingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-2xl font-extrabold text-slate-900 mb-2">
              Anunțul a fost publicat cu succes!
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              Felicitări! Anunțul tău este acum live pe Monky și poate fi vizualizat de toți cumpărătorii.
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href={`/anunt/${createdListingId}`}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md text-sm transition-all"
              >
                Vezi anunțul tău
              </Link>
              <Link
                href="/"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-sm transition-all"
              >
                Înapoi la prima pagină
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
