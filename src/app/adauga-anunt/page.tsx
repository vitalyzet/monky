"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import '@/app/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { BRAND_MODELS_MAP, MOTO_BRANDS_MAP } from '@/data/mockData';
import { useAuth } from '@/lib/AuthContext';
import { saveListing, getListingById, updateListingInDb } from '@/lib/db';
import { getListingUrl } from '@/lib/slugUtils';
import { CategoryDropdown, CategoryOption } from '@/components/CategoryDropdown';
import { CategoryPickerModal } from '@/components/CategoryPickerModal';
import { DynamicCategorySpecs } from '@/components/DynamicCategorySpecs';
import { OFFICIAL_CATEGORIES, APP_CATEGORIES, PIATA_SUBCATEGORIES, MOTOARE_SUBCATEGORIES } from '@/data/categories';
import {
  Loader2,
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
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Eye,
  Camera,
  Layers,
  HelpCircle,
  Heart,
  Menu,
  Car,
  Building,
  Bike,
  Disc,
  Shield,
  Bus,
  Anchor,
  Smartphone,
  Laptop,
  Tv,
  Trophy,
  ChevronDown,
  Video,
  MessageSquare,
  AlertCircle,
  Wand2,
  Building2,
  Key,
  Store,
  Warehouse,
  GraduationCap,
  Shirt,
  Baby,
  Music,
  MoreHorizontal,
  Briefcase,
  Home,
  Wrench,
} from 'lucide-react';

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
  'Bihor': ['Oradea', 'Salonta', 'Marghita'],
  'Arad': ['Arad', 'Ineu', 'Lipova'],
  'Bacău': ['Bacău', 'Onești', 'Moinești'],
  'Dolj': ['Craiova', 'Băilești', 'Calafat'],
  'Galați': ['Galați', 'Tecuci'],
  'Mureș': ['Târgu Mureș', 'Reghin', 'Sighișoara'],
  'Suceava': ['Suceava', 'Fălticeni', 'Rădăuți'],
};

const DEFAULT_DEMO_PHOTOS = [
  'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
];

function getConditionOptions(mainCategory: string, subCategory: string = '') {
  const isAuto =
    mainCategory === 'coches' ||
    mainCategory === 'Autoturisme' ||
    mainCategory === 'motos' ||
    mainCategory === 'Motociclete' ||
    mainCategory === 'Motoare' ||
    subCategory.includes('Autoturisme') ||
    subCategory.includes('Mașini') ||
    subCategory.includes('Furgonete') ||
    subCategory.includes('clasice') ||
    subCategory.includes('Moto');

  const isParts =
    mainCategory === 'motor-y-accesorios' ||
    mainCategory.includes('Piese') ||
    subCategory.includes('Piese') ||
    subCategory.includes('Accesorii');

  const isRealEstate =
    mainCategory === 'inmobiliaria' ||
    mainCategory === 'Imobiliare' ||
    subCategory.includes('Apartament') ||
    subCategory.includes('Case') ||
    subCategory.includes('Teren') ||
    subCategory.includes('Spații');

  if (isAuto) {
    return [
      { id: 'Nou (0 km / Garanție)', label: 'Nou (0 km / Garanție)', badgeColor: 'bg-emerald-500', desc: 'Vehicul nou, 0 km, direct din reprezentanță.' },
      { id: 'Rulat - Stare excelentă (Fără accident)', label: 'Rulat - Fără accident (Excelent)', badgeColor: 'bg-[#03c1a2]', desc: 'Întreținut impecabil, istoric curat, carte service.' },
      { id: 'În stare bună de funcționare', label: 'În stare bună de funcționare', badgeColor: 'bg-blue-500', desc: 'Uzură normală de utilizare, funcționează perfect.' },
      { id: 'Necesită reparații / Investiții', label: 'Necesită reparații / Investiții', badgeColor: 'bg-amber-500', desc: 'Funcțional, necesită mici intervenții tehnice sau optice.' },
      { id: 'Avariat / Pentru piese sau dezmembrări', label: 'Avariat / Pentru piese', badgeColor: 'bg-red-500', desc: 'Accidentat sau destinat dezmembrărilor.' },
    ];
  }

  if (isParts) {
    return [
      { id: 'Piesă nouă (în ambalaj original)', label: 'Nouă (în ambalaj original)', badgeColor: 'bg-emerald-500', desc: 'Piesă nouă, sigilată în ambalajul producătorului.' },
      { id: 'Second-hand (perfect funcțională)', label: 'Second-hand (perfect funcțională)', badgeColor: 'bg-[#03c1a2]', desc: 'Piesă testată și verificată, în stare foarte bună.' },
      { id: 'Recondiționată (cu garanție)', label: 'Recondiționată profesional', badgeColor: 'bg-blue-500', desc: 'Restaurată conform specificațiilor OEM.' },
      { id: 'Din dezmembrări auto', label: 'Din dezmembrări auto', badgeColor: 'bg-amber-500', desc: 'Piesă originală demontată de pe vehicul donator.' },
      { id: 'Pentru reparație / defectă', label: 'Pentru reparație / defectă', badgeColor: 'bg-red-500', desc: 'Necesită reparație sau utilă pentru componente.' },
    ];
  }

  if (isRealEstate) {
    return [
      { id: 'Construcție nouă (La cheie)', label: 'Construcție nouă (La cheie)', badgeColor: 'bg-emerald-500', desc: 'Imobil finalizat recent, finisaje noi, gata de mutare.' },
      { id: 'Renovat recent (Finisaje moderne)', label: 'Renovat recent (Finisaje moderne)', badgeColor: 'bg-[#03c1a2]', desc: 'Instalații și finisaje schimbate recent.' },
      { id: 'Stare bună (Curat / Locuibil)', label: 'Stare bună (Locuibil)', badgeColor: 'bg-blue-500', desc: 'Întreținut corespunzător, poate fi locuit imediat.' },
      { id: 'Necesită renovare completă', label: 'Necesită renovare completă', badgeColor: 'bg-amber-500', desc: 'Necesită investiții complete de amenajare.' },
      { id: 'În stadiu de construcție / La roșu / Gri', label: 'În construcție (Gri / Roșu)', badgeColor: 'bg-purple-500', desc: 'Stadiu de șantier sau fără finisaje interioare.' },
    ];
  }

  return [
    { id: 'Nou (sigilat / nefolosit)', label: 'Nou (sigilat / nefolosit)', badgeColor: 'bg-emerald-500', desc: 'Produs nou în cutia originală, fără urme.' },
    { id: 'Ca nou (fără urme de uzură)', label: 'Ca nou (fără urme)', badgeColor: 'bg-[#03c1a2]', desc: 'Impecabil estetic și funcțional.' },
    { id: 'În stare bună (urme minime)', label: 'În stare bună', badgeColor: 'bg-blue-500', desc: 'Urme normale de utilizare atentă.' },
    { id: 'Acceptabil (urme vizibile)', label: 'Acceptabil', badgeColor: 'bg-amber-500', desc: 'Prezintă urme vizibile de uzură, perfect funcțional.' },
    { id: 'Pentru piese / defect', label: 'Pentru piese / defect', badgeColor: 'bg-red-500', desc: 'Necesită reparație sau utilizare pentru componente.' },
  ];
}

// Categories are loaded dynamically from APP_CATEGORIES

function BriefcaseIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}

const STEPS = [
  { id: 1, name: 'Ce vinzi?', short: 'Titlu' },
  { id: 2, name: 'Alege categoria', short: 'Categorie' },
  { id: 3, name: 'Fotografii (Max. 8)', short: 'Foto' },
  { id: 4, name: 'Stare & Specificații', short: 'Specificații' },
  { id: 5, name: 'Unde se află', short: 'Locație' },
  { id: 6, name: 'Preț & Descriere', short: 'Preț & Descriere' },
  { id: 7, name: 'Previzualizare', short: 'Publicare' },
];



function getSubcategoryVisual(name: string) {
  return getSubcategoryIcon(name);
}

function getSubcategoryIcon(name: string) {
  // Motoare & Vehicule
  if (name.includes('Autoturisme') || name.includes('Mașini') || name.includes('0 km')) return <Car size={18} />;
  if (name.includes('Motociclete') || name.includes('Scutere') || name.includes('ATV')) return <Bike size={18} />;
  if (name.includes('Autoutilitare') || name.includes('Furgonete') || name.includes('Dube') || name.includes('Camioane')) return <Truck size={18} />;
  if (name.includes('Piese') || name.includes('Accesorii') || name.includes('Jante') || name.includes('Anvelope')) return <Disc size={18} />;

  // Piață (cele 12 oficiale)
  if (name.includes('Telefoane')) return <Smartphone size={16} />;
  if (name.includes('Calculatoare')) return <Laptop size={16} />;
  if (name.includes('Electronice')) return <Tv size={16} />;
  if (name.includes('Modă')) return <Shirt size={16} />;
  if (name.includes('Casă')) return <Home size={16} />;
  if (name.includes('Sport')) return <Trophy size={16} />;
  if (name.includes('Biciclete')) return <Bike size={16} />;
  if (name.includes('Copii')) return <Baby size={16} />;
  if (name.includes('Animale')) return <Heart size={16} />;
  if (name.includes('Artă')) return <Sparkles size={16} />;
  if (name.includes('Muzică')) return <Music size={16} />;
  if (name.includes('Altele')) return <Layers size={16} />;

  // Imobiliare
  if (name.includes('Apartamente de vânzare')) return <Building2 size={16} />;
  if (name.includes('Apartamente de închiriat')) return <Building size={16} />;
  if (name.includes('Case de vânzare')) return <Home size={16} />;
  if (name.includes('Case de închiriat')) return <Key size={16} />;
  if (name.includes('Terenuri')) return <MapPin size={16} />;
  if (name.includes('Spații')) return <Store size={16} />;
  if (name.includes('Garaje')) return <Warehouse size={16} />;

  // Lucru
  if (name.includes('Locuri')) return <Briefcase size={16} />;
  if (name.includes('Servicii')) return <Wrench size={16} />;
  if (name.includes('Cursuri')) return <GraduationCap size={16} />;

  return <Tag size={16} />;
}

export default function AdaugaAnuntPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams ? searchParams.get('edit') : null;

  // Wizard Step State (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Titlu
  const [title, setTitle] = useState('');

  // Step 2: Categorie & Subcategorie
  const [mainCategory, setMainCategory] = useState('coches');
  const [subCategory, setSubCategory] = useState('Autoturisme rulate (second-hand)');
  const [hasSelectedCategory, setHasSelectedCategory] = useState<boolean>(false);
  const [piataGroupFilter, setPiataGroupFilter] = useState('Toate');
  const [category, setCategory] = useState('coches');

  // Step 3: Fotografii
  const [photos, setPhotos] = useState<string[]>([]);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [allowComments, setAllowComments] = useState(true);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  // Step 4: Stare & Specificații
  const [condition, setCondition] = useState('Rulat - Stare excelentă (Fără accident)');
  const [customSpecs, setCustomSpecs] = useState<Record<string, string>>({});

  const handleSpecChange = (key: string, value: string) => {
    setCustomSpecs((prev) => ({ ...prev, [key]: value }));
    // Sync with existing vehicle fields
    if (key === 'brand') setBrand(value);
    if (key === 'model') setModel(value);
    if (key === 'year') setYear(value);
    if (key === 'mileage') setMileage(value);
    if (key === 'fuel') setFuel(value);
    if (key === 'transmission') setTransmission(value);
    if (key === 'caroserie') setCaroserie(value);
    if (key === 'enginePower') setEnginePower(value);
    if (key === 'engineCapacity') setEngineCapacity(value);
    if (key === 'euroClass') setEuroClass(value);
    if (key === 'registrationStatus') setRegistrationStatus(value);
    if (key === 'vinNumber') setVinNumber(value);

    // Sync with moto fields
    if (key === 'motoBrand') setBrand(value);
    if (key === 'motoModel') setModel(value);
    if (key === 'motoYear') setYear(value);
    if (key === 'motoMileage') setMileage(value);

    // Sync with real estate fields
    if (key === 'propertySurface') setSurface(value);
    if (key === 'propertyRooms') setRooms(value);
    if (key === 'propertyPartitioning') setPartitioning(value);
    if (key === 'propertyFloor') setFloor(value);

    // Sync with tech fields
    if (key === 'phoneBrand' || key === 'pcBrand') setPhoneBrand(value);
    if (key === 'phoneModel' || key === 'pcModel') setPhoneModel(value);
    if (key === 'phoneStorage' || key === 'pcStorage') setPhoneStorage(value);
    if (key === 'phoneBattery') setBatteryHealth(value);
  };
  
  // Specificații Auto
  const [brand, setBrand] = useState('Volkswagen');
  const [model, setModel] = useState('Golf');
  const [year, setYear] = useState('2020');
  const [mileage, setMileage] = useState('145.000 km');
  const [fuel, setFuel] = useState('Diesel');
  const [transmission, setTransmission] = useState('Manuală');
  const [caroserie, setCaroserie] = useState('Hatchback');
  const [enginePower, setEnginePower] = useState('150 CP');
  const [engineCapacity, setEngineCapacity] = useState('1968');
  const [euroClass, setEuroClass] = useState('Euro 6');
  const [registrationStatus, setRegistrationStatus] = useState('Înmatriculat RO');
  const [vinNumber, setVinNumber] = useState('');

  // Specificații Imobiliare
  const [surface, setSurface] = useState('65 mp');
  const [rooms, setRooms] = useState('2 camere');
  const [partitioning, setPartitioning] = useState('Decomandat');
  const [floor, setFloor] = useState('Etaj 2');

  // Specificații Tech / Altele
  const [phoneBrand, setPhoneBrand] = useState('Apple');
  const [phoneModel, setPhoneModel] = useState('iPhone 15');
  const [phoneStorage, setPhoneStorage] = useState('128 GB');
  const [batteryHealth, setBatteryHealth] = useState('95');
  const [itemSize, setItemSize] = useState('');

  // Step 5: Descriere
  const [description, setDescription] = useState('');

  // Step 6: Preț & Opțiuni Vânzare
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'EUR' | 'RON'>('EUR');
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [isExchange, setIsExchange] = useState(false);
  const [hasShipping, setHasShipping] = useState(true);

  // Step 7: Locație & Contact
  const [county, setCounty] = useState('București');
  const [city, setCity] = useState('Sector 1');
  const defaultName = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Utilizator Tevinde');
  const [sellerName, setSellerName] = useState(defaultName);
  const [sellerPhone, setSellerPhone] = useState('0740 123 456');
  const [hidePhone, setHidePhone] = useState(false);
  const [isDealer, setIsDealer] = useState(false);

  // Edit Mode & Messages
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdListingId, setCreatedListingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishStatus, setPublishStatus] = useState<'idle' | 'loading' | 'published'>('idle');

  // Automatic redirect to published ad
  useEffect(() => {
    if (createdListingId) {
      const targetUrl = getListingUrl({ id: createdListingId, title: title.trim() });
      const timer = setTimeout(() => {
        router.push(targetUrl);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [createdListingId, title, router]);

  // Sync edit mode on load
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      setEditingAdId(editId);
      const loadAdForEdit = async () => {
        let ad = await getListingById(editId);
        if (!ad) {
          try {
            const saved = localStorage.getItem('monky_user_listings');
            if (saved) {
              const list = JSON.parse(saved);
              ad = list.find((item: any) => item.id === editId) || null;
            }
          } catch (e) {
            console.error(e);
          }
        }

        if (ad) {
          if (ad.title) setTitle(ad.title);
          if (ad.category) { setCategory(ad.category); setMainCategory(ad.category); setHasSelectedCategory(true); }
          if (ad.brand) setBrand(ad.brand);
          if (ad.model) setModel(ad.model);
          if (ad.price) setPrice(String(ad.price));
          if (ad.currency) setCurrency(ad.currency);
          setIsNegotiable(!!ad.isNegotiable);
          setIsExchange(!!ad.isExchange);
          if (ad.condition) setCondition(ad.condition);
          if (ad.description) setDescription(ad.description);
          if (ad.gallery && ad.gallery.length > 0) {
            setPhotos(ad.gallery);
          } else if (ad.image) {
            setPhotos([ad.image]);
          }
          if (ad.year) setYear(ad.year);
          if (ad.mileage) setMileage(ad.mileage);
          if (ad.fuel) setFuel(ad.fuel);
          if (ad.transmission) setTransmission(ad.transmission);
          if (ad.euroClass) setEuroClass(ad.euroClass);
          if (ad.caroserie) setCaroserie(ad.caroserie);
          if (ad.enginePower) setEnginePower(ad.enginePower);
          if (ad.seller?.name) setSellerName(ad.seller.name);
          if (ad.seller?.phone) setSellerPhone(ad.seller.phone);
        }
      };
      loadAdForEdit();
    }
  }, [editId]);

  // Sync category mapping with the 18 app categories
  useEffect(() => {
    setCategory(mainCategory);
  }, [mainCategory, subCategory]);

  const brandOptions = Object.keys(BRAND_MODELS_MAP);
  const modelOptions = BRAND_MODELS_MAP[brand] || ['Orice'];
  const cityOptions = ROMANIAN_COUNTIES[county] || [county];

  // Validate step before advancing
  const canAdvanceStep = (step: number): boolean => {
    if (step === 1) {
      return title.trim().length >= 8;
    }
    if (step === 2) {
      return mainCategory.length > 0 && subCategory.length > 0;
    }
    if (step === 3) {
      return true; // Photos optional or has default
    }
    if (step === 4) {
      return true;
    }
    if (step === 5) {
      return county.trim().length > 0 && city.trim().length > 0 && sellerName.trim().length > 0;
    }
    if (step === 6) {
      return !isNaN(Number(price)) && Number(price) >= 0 && price.trim().length > 0 && description.trim().length >= 15;
    }
    return true;
  };

  const handleNext = () => {
    if (!canAdvanceStep(currentStep)) {
      if (currentStep === 1) alert('Titlul anunțului trebuie să aibă cel puțin 8 caractere.');
      else if (currentStep === 5) alert('Vă rugăm să specificați județul, orașul și numele de contact.');
      else if (currentStep === 6) {
        if (isNaN(Number(price)) || price.trim().length === 0) alert('Vă rugăm să introduceți un preț valid.');
        else if (description.trim().length < 15) alert('Descrierea trebuie să aibă cel puțin 15 caractere.');
      }
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 7));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Auto generator for description
  const generateAutoDescription = () => {
    if (['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory)) {
      setDescription(
        `Vând ${brand} ${model}, an fabricație ${year}. Kilometraj: ${mileage}. Motorizare: ${fuel}, cutie de viteze ${transmission}. Caroserie ${caroserie}, ${enginePower}. Normă de poluare ${euroClass}. Stare: ${condition}. Înmatriculare: ${registrationStatus}. Preț: ${price || '0'} ${currency}. Pentru detalii suplimentare și vizionare, vă rog să mă contactați telefonic.`
      );
    } else if (['inmobiliaria', 'real-estate'].includes(mainCategory)) {
      setDescription(
        `Se oferă spre ${subCategory.toLowerCase()} proprietate cu suprafața de ${surface}, ${rooms}, compartimentare ${partitioning}, situată la ${floor}. Poziționare excelentă în ${city}, ${county}, zonă liniștită aproape de mijloace de transport. Preț: ${price || '0'} ${currency}.`
      );
    } else {
      setDescription(
        `Vând ${title.trim() || 'produsul'}. Stare produs: ${condition}. Funcționează impecabil, fără defecte ascunse. Se acceptă orice verificare. Preț: ${price || '0'} ${currency}. Predare personală în ${city}, ${county} sau livrare cu verificare colet prin curier.`
      );
    }
  };

  // Client-side canvas compression to ensure Firestore document size limit (<1MB) is respected
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;
          const maxDim = 1200;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL("image/jpeg", 0.72));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.onerror = () => resolve(e.target?.result as string);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Image Upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setIsUploadingPhotos(true);
    const newPhotos = [...photos];

    for (const file of files) {
      if (newPhotos.length < 8) {
        try {
          const compressed = await compressImage(file);
          newPhotos.push(compressed);
        } catch (err) {
          console.error("Eroare la optimizarea fotografiei:", err);
        }
      }
    }
    setPhotos([...newPhotos]);
    setIsUploadingPhotos(false);
  };

  const addDemoPhotos = () => {
    setPhotos(DEFAULT_DEMO_PHOTOS);
  };

  const removePhoto = (idxToRemove: number) => {
    const updated = photos.filter((_, idx) => idx !== idxToRemove);
    setPhotos(updated);
    if (activePhotoIdx >= updated.length) {
      setActivePhotoIdx(Math.max(0, updated.length - 1));
    }
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    if (!title.trim() || title.trim().length < 8) {
      alert('Vă rugăm să introduceți un titlu de minim 8 caractere.');
      setCurrentStep(1);
      return;
    }
    if (!county.trim() || !city.trim() || !sellerName.trim()) {
      alert('Vă rugăm să specificați județul, orașul și numele de contact.');
      setCurrentStep(5);
      return;
    }
    if (!price || isNaN(Number(price))) {
      alert('Vă rugăm să introduceți un preț valid.');
      setCurrentStep(6);
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      alert('Descrierea trebuie să aibă minim 15 caractere.');
      setCurrentStep(6);
      return;
    }

    setPublishStatus('loading');
    setIsSubmitting(true);

    let newId = `user-ad-${Date.now()}`;
    const selectedCover = photos[activePhotoIdx] || photos[0] || DEFAULT_DEMO_PHOTOS[0];
    const otherPhotos = photos.filter((_, idx) => idx !== activePhotoIdx);
    const orderedGallery = photos.length > 0 ? [selectedCover, ...otherPhotos] : DEFAULT_DEMO_PHOTOS;
    const locationText = `${city}, ${county}`;

    const newListing: any = {
      id: newId,
      status: 'active',
      userId: currentUser?.uid || undefined,
      title: title.trim(),
      price: Number(price),
      currency,
      hasShipping,
      location: locationText,
      photoCount: photos.length || 1,
      category,
      brand: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? brand : (customSpecs.brand || customSpecs.phoneBrand || phoneBrand),
      model: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? model : (customSpecs.model || customSpecs.phoneModel || phoneModel),
      image: selectedCover,
      gallery: orderedGallery,
      description: description.trim(),
      condition,
      createdAt: 'Acum câteva minute',
      createdAtTime: Date.now(),
      year: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? year : (customSpecs.year || undefined),
      mileage: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? mileage : (customSpecs.mileage || undefined),
      fuel: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? fuel : (customSpecs.fuel || undefined),
      transmission: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? transmission : (customSpecs.transmission || undefined),
      euroClass: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? euroClass : (customSpecs.euroClass || undefined),
      caroserie: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? caroserie : (customSpecs.caroserie || undefined),
      enginePower: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? enginePower : (customSpecs.enginePower || undefined),
      registrationStatus: ['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) ? registrationStatus : (customSpecs.registrationStatus || undefined),
      isNegotiable,
      isExchange,
      customSpecs,
      seller: {
        name: sellerName.trim(),
        rating: 5.0,
        responseRate: '100%',
        verified: true,
        phone: hidePhone ? 'Telefon ascuns' : sellerPhone.trim(),
        isDealer,
        avatar: currentUser?.photoURL || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null) || '/images/avatar/an32.png',
        avatarUrl: currentUser?.photoURL || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null) || '/images/avatar/an32.png',
      },
    };

    if (isEditMode && editingAdId) {
      newListing.id = editingAdId;
      try {
        const { id, ...listingData } = newListing;
        await updateListingInDb(editingAdId, listingData);
      } catch (err) {
        console.error('Firestore update error:', err);
      }

      try {
        const existing = localStorage.getItem('monky_user_listings');
        const parsed = existing ? JSON.parse(existing) : [];
        const updatedList = parsed.map((item: any) => (item.id === editingAdId ? { ...item, ...newListing } : item));
        localStorage.setItem('monky_user_listings', JSON.stringify(updatedList));
      } catch (err) {
        console.error(err);
      }

      setPublishStatus('published');
      setCreatedListingId(editingAdId);
      setIsSubmitting(false);
      return;
    }

    let firestoreId = null;
    try {
      const { id, ...listingData } = newListing;
      firestoreId = await saveListing(listingData);
    } catch (err: any) {
      console.error('Eroare Firestore:', err);
      setIsSubmitting(false);
      setPublishStatus('idle');
      alert('Eroare la publicare în Firestore: ' + (err?.message || 'Verificați conexiunea sau fotografiile încărcate.'));
      return;
    }

    if (firestoreId) {
      newListing.id = firestoreId;
      newId = firestoreId;
    }

    try {
      const existing = localStorage.getItem('monky_user_listings');
      const parsed = existing ? JSON.parse(existing) : [];
      localStorage.setItem('monky_user_listings', JSON.stringify([newListing, ...parsed]));
    } catch (err) {
      console.error('Eroare localStorage:', err);
    }

    sessionStorage.setItem('monky_active_tab', mainCategory);
    
    // Status turns to published and reveals the confirmation modal
    setPublishStatus('published');
    setCreatedListingId(newId);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#121212] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Navbar favoriteCount={0} />

      <main className="flex-grow max-w-6xl mx-auto px-6 sm:px-10 lg:px-14 xl:px-20 py-8 sm:py-10 w-full">
        {/* Top Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200/80 dark:border-[#282828] pb-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1">
              <Link href="/" className="hover:text-[#03c1a2] transition-colors">Tevinde.ro</Link>
              <span>&gt;</span>
              <span className="text-[#03c1a2]">Publicare Anunț</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {isEditMode ? 'Editează anunțul' : 'Publică un anunț nou'}
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#1e1e1e] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#333] shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#03c1a2] animate-pulse" />
            <span>Pasul <strong>{currentStep}</strong> din <strong>7</strong></span>
          </div>
        </div>

        {/* Horizontal 7-Step Progress Wizard Bar matching Tevinde */}
        <div className="mb-8 bg-white dark:bg-[#1e1e1e] p-3 sm:p-4 rounded-2xl border border-slate-200/80 dark:border-[#2a2a2a] shadow-xs">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            {STEPS.map((s) => {
              const isPassed = currentStep > s.id;
              const isCurrent = currentStep === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    if (s.id < currentStep || canAdvanceStep(currentStep)) {
                      setCurrentStep(s.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isCurrent
                      ? 'bg-[#03c1a2] text-white shadow-md shadow-[#03c1a2]/20'
                      : isPassed
                      ? 'text-[#03c1a2] bg-[#03c1a2]/10 hover:bg-[#03c1a2]/20'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isCurrent ? 'bg-white text-[#03c1a2]' : isPassed ? 'bg-[#03c1a2] text-white' : 'bg-slate-200 dark:bg-[#333] text-slate-600 dark:text-slate-400'
                  }`}>
                    {isPassed ? '✓' : s.id}
                  </span>
                  <span>{s.short}</span>
                </button>
              );
            })}
          </div>

          {/* Continuous Progress Line */}
          <div className="w-full bg-slate-100 dark:bg-[#2a2a2a] h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-[#03c1a2] h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Main 2-Column Layout (Left Form Wizard + Right Live Preview) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12">
          {/* Left Wizard Body (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-[#2a2a2a] shadow-sm min-h-[460px] flex flex-col justify-between">
              <div>
                {/* PASUL 1: CE VINZI? */}
                {currentStep === 1 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 1/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Ce vinzi?</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Scrie un titlu clar și descriptiv. Cumpărătorii caută după cuvinte cheie specifice.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                        Titlu anunț *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="ex: iPhone 14 Pro 256GB Space Black, ca nou"
                        className="w-full h-14 px-4 text-base sm:text-lg rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50/50 dark:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-[#03c1a2] focus:border-transparent transition-all"
                      />
                      <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
                        <span>Minim 8 caractere</span>
                        <span className={title.trim().length >= 8 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                          {title.trim().length} / 8 caractere
                        </span>
                      </div>
                    </div>

                    {/* Quick Suggestions Chips */}
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Exemple rapide de titluri:</span>
                      <div className="flex flex-wrap gap-2">
                        {['Volkswagen Golf 7 2.0 TDI 2018', 'iPhone 15 Pro Max 256GB Impecabil', 'Apartament 2 camere Decomandat Central', 'Bicicletă MTB aluminiu 29 inch'].map((ex) => (
                          <button
                            key={ex}
                            type="button"
                            onClick={() => setTitle(ex)}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-[#2a2a2a] text-slate-600 dark:text-slate-300 hover:bg-[#03c1a2]/10 hover:text-[#03c1a2] transition-colors"
                          >
                            + {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* PASUL 2: ALEGE CATEGORIA */}
                {currentStep === 2 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 2/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Alege categoria</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Selectează categoria principală și subcategoria potrivită pentru anunțul tău.
                      </p>
                    </div>

                    {!hasSelectedCategory ? (
                      /* Vizualizare inițială: Toate categoriile */
                      <div className="space-y-4 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
                          {OFFICIAL_CATEGORIES.map((cat) => {
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setMainCategory(cat.id);
                                  setCategory(cat.id);
                                  setSubCategory(cat.subcategories[0] || 'Toate');
                                  setHasSelectedCategory(true);
                                  if (['coches', 'motos'].includes(cat.id)) {
                                    setCondition('Rulat - Stare excelentă (Fără accident)');
                                  } else if (cat.id === 'inmobiliaria') {
                                    setCondition('Stare bună (Locuibil)');
                                  } else if (cat.id === 'motor-y-accesorios') {
                                    setCondition('Second-hand (perfect funcțională)');
                                  } else {
                                    setCondition('În stare bună (urme minime)');
                                  }
                                }}
                                className="group relative p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all text-center border-2 border-slate-200/80 dark:border-[#333] bg-white dark:bg-[#252525] text-slate-700 dark:text-slate-200 hover:border-[#03c1a2] hover:bg-slate-50/80 dark:hover:bg-[#2b2b2b] hover:shadow-lg hover:shadow-[#03c1a2]/10 hover:scale-[1.02] cursor-pointer"
                              >
                                {/* Imagine Oficială 3D a Categoriei */}
                                <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center relative">
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-sm"
                                  />
                                </div>

                                <div className="flex flex-col items-center">
                                  <span className="font-extrabold text-xs sm:text-sm line-clamp-2 leading-tight group-hover:text-[#03c1a2] transition-colors">
                                    {cat.name}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium mt-1">
                                    {cat.subcategories.length} subcategorii
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      /* Vizualizare după selecție: Celelalte categorii dispar, apar doar subcategoriile */
                      (() => {
                        const activeCat = OFFICIAL_CATEGORIES.find(
                          (c) => c.id === mainCategory || c.name === mainCategory
                        ) || OFFICIAL_CATEGORIES[0];

                        return (
                          <div className="space-y-6 animate-in fade-in duration-200">
                            {/* Cardul categoriei alese + buton Schimbă categoria */}
                            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#03c1a2]/10 via-[#03c1a2]/5 to-transparent border-2 border-[#03c1a2] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                              <div className="flex items-center gap-3.5">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white dark:bg-[#1f1f1f] p-1.5 border border-slate-200/80 dark:border-[#383838] shadow-xs flex items-center justify-center flex-shrink-0">
                                  <img
                                    src={activeCat.image}
                                    alt={activeCat.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div>
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#03c1a2] block">
                                    Categorie selectată
                                  </span>
                                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                    {activeCat.name}
                                  </h3>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {activeCat.subcategories.length} subcategorii disponibile
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setHasSelectedCategory(false)}
                                className="self-start sm:self-center px-4 py-2.5 rounded-xl border border-slate-300 dark:border-[#404040] bg-white dark:bg-[#252525] text-slate-700 dark:text-slate-200 hover:border-[#03c1a2] hover:text-[#03c1a2] text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
                              >
                                <ArrowLeft size={14} />
                                <span>Schimbă categoria</span>
                              </button>
                            </div>

                            {/* Subcategoriile categoriei alese */}
                            <div className="space-y-3.5 pt-2">
                              <div className="flex items-center justify-between">
                                <label className="block text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                                  Alege subcategoria pentru <span className="text-[#03c1a2]">{activeCat.name}</span>:
                                </label>
                                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                                  Pas obligatoriu
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                                {activeCat.subcategories.map((sub) => {
                                  const isSubSelected = subCategory === sub;
                                  return (
                                    <button
                                      key={sub}
                                      type="button"
                                      onClick={() => setSubCategory(sub)}
                                      className={`group p-4 sm:p-4.5 rounded-2xl text-left transition-all border-2 flex items-center justify-between gap-3.5 cursor-pointer ${
                                        isSubSelected
                                          ? 'bg-[#03c1a2] text-white border-[#03c1a2] shadow-lg shadow-[#03c1a2]/25 scale-[1.01]'
                                          : 'bg-white dark:bg-[#242424] border-slate-200/90 dark:border-[#333] text-slate-800 dark:text-slate-100 hover:border-[#03c1a2] hover:bg-slate-50/70 dark:hover:bg-[#2c2c2c] hover:shadow-xs'
                                      }`}
                                    >
                                      <div className="flex items-center gap-3.5 min-w-0">
                                        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                                          isSubSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 dark:bg-[#333] text-[#03c1a2] group-hover:bg-[#03c1a2]/15'
                                        }`}>
                                          {getSubcategoryVisual(sub)}
                                        </span>
                                        <span className={`text-sm sm:text-[15px] font-bold leading-snug break-words ${
                                          isSubSelected ? 'text-white' : 'text-slate-800 dark:text-slate-100'
                                        }`}>
                                          {sub}
                                        </span>
                                      </div>

                                      <div className="flex-shrink-0 ml-2">
                                        {isSubSelected ? (
                                          <div className="w-6 h-6 rounded-full bg-white text-[#03c1a2] flex items-center justify-center shadow-xs">
                                            <Check size={14} className="stroke-[3]" />
                                          </div>
                                        ) : (
                                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-[#444] group-hover:border-[#03c1a2] transition-colors" />
                                        )}
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                )}
                
                {/* PASUL 3: FOTOGRAFII (MAX. 8) */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 3/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Fotografii (Max. 8)</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Adaugă fotografiile tale. Prima va fi coperta principală a anunțului.
                      </p>
                    </div>

                    {/* 8 Photo Slots Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[0, 1, 2, 3, 4, 5, 6, 7].map((slotIdx) => {
                        const photoUrl = photos[slotIdx];
                        const isMain = slotIdx === 0;

                        return (
                          <div
                            key={slotIdx}
                            className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center overflow-hidden transition-all group ${
                              photoUrl
                                ? 'border-[#03c1a2] bg-slate-900'
                                : 'border-dashed border-slate-300 dark:border-[#444] bg-slate-50/50 dark:bg-[#252525] hover:border-[#03c1a2]'
                            }`}
                          >
                            {photoUrl ? (
                              <>
                                <img src={photoUrl} alt={`Foto ${slotIdx + 1}`} className="w-full h-full object-cover" />
                                {isMain && (
                                  <span className="absolute bottom-2 left-2 bg-[#03c1a2] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                                    1 • Principală
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() => removePhoto(slotIdx)}
                                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors"
                                >
                                  <X size={14} />
                                </button>
                              </>
                            ) : (
                              <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-2 text-center">
                                <Camera size={22} className="text-slate-400 group-hover:text-[#03c1a2] transition-colors mb-1" />
                                <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                                  {isMain ? '1 • Principală' : `Foto ${slotIdx + 1}`}
                                </span>
                                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Quick Photo Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex items-center gap-2">
                        <label className="px-4 py-2.5 rounded-xl text-sm font-bold bg-[#03c1a2] hover:bg-[#02a88d] text-white cursor-pointer shadow-sm flex items-center gap-2 transition-colors">
                          <Upload size={16} />
                          <span>Alege din Galerie</span>
                          <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                        </label>

                        <button
                          type="button"
                          onClick={addDemoPhotos}
                          className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-[#2a2a2a] text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                        >
                          <Sparkles size={15} className="text-amber-500" />
                          <span>⚡ Demo Poze</span>
                        </button>
                      </div>

                      {photos.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setPhotos([])}
                          className="text-xs text-red-500 hover:underline font-semibold"
                        >
                          Șterge toate fotografiile
                        </button>
                      )}
                    </div>

                    {/* Extra Tevinde Features: Video & Comentarii */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#252525] border border-slate-200/80 dark:border-[#333] space-y-3 mt-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Video size={18} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Video pentru Vitrina</span>
                            <span className="text-[11px] font-semibold text-slate-400">Opțional</span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Un clip scurt (max 60s) apare în feedul Vitrina și pe pagina anunțului pentru mai multă vizibilitate.
                          </p>
                          <input
                            type="text"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="Link video sau încărcare clip..."
                            className="w-full mt-2 h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a]"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={allowComments}
                          onChange={(e) => setAllowComments(e.target.checked)}
                          className="w-4 h-4 rounded text-[#03c1a2] focus:ring-[#03c1a2]"
                        />
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Permite comentarii la acest anunț
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* PASUL 4: STARE & SPECIFICAȚII */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 4/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Stare & Specificații</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Selectează starea și completează specificațiile tehnice dedicate categoriei alese.
                      </p>
                    </div>

                    {(() => {
                      const currentConditions = getConditionOptions(mainCategory, subCategory);
                      const isAutoMode = ['coches', 'Autoturisme', 'motos', 'Motociclete', 'Motoare'].includes(mainCategory) || subCategory.includes('Autoturisme') || subCategory.includes('Mașini');
                      const isRealEstateMode = ['inmobiliaria', 'Imobiliare'].includes(mainCategory);
                      const isPartsMode = ['motor-y-accesorios'].includes(mainCategory) || subCategory.includes('Piese');

                      const conditionLabel = isAutoMode ? 'Starea vehiculului *' : isRealEstateMode ? 'Starea proprietății *' : isPartsMode ? 'Starea piesei *' : 'Starea produsului *';

                      return (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="block text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200">
                              {conditionLabel}
                            </label>
                            <span className="text-xs text-[#03c1a2] font-semibold">
                              {isAutoMode ? '🚗 Evaluare Tehnică Auto' : isRealEstateMode ? '🏠 Evaluare Imobiliară' : 'Calitate garantată'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {currentConditions.map((c) => {
                              const isSelected = condition === c.id || condition === c.label;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setCondition(c.id)}
                                  className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between text-left transition-all border-2 cursor-pointer ${
                                    isSelected
                                      ? 'border-[#03c1a2] bg-[#03c1a2]/10 text-slate-900 dark:text-white shadow-sm scale-[1.01]'
                                      : 'border-slate-200/90 dark:border-[#333] bg-white dark:bg-[#252525] text-slate-700 dark:text-slate-300 hover:border-[#03c1a2]/60 hover:bg-slate-50 dark:hover:bg-[#2a2a2a]'
                                  }`}
                                >
                                  <div className="space-y-1 min-w-0 pr-2">
                                    <div className="flex items-center gap-2.5">
                                      <span className={`w-3 h-3 rounded-full flex-shrink-0 ${c.badgeColor}`} />
                                      <span className="font-bold text-sm sm:text-[15px]">{c.label}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 pl-5.5 leading-relaxed">
                                      {c.desc}
                                    </p>
                                  </div>

                                  <div className="flex-shrink-0 ml-2">
                                    {isSelected ? (
                                      <div className="w-6 h-6 rounded-full bg-[#03c1a2] text-white flex items-center justify-center shadow-xs">
                                        <Check size={14} className="stroke-[3]" />
                                      </div>
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 dark:border-[#444]" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Formular Unic Dedicat de Specificații pentru fiecare Subcategorie */}
                    <DynamicCategorySpecs
                      mainCategory={mainCategory}
                      subCategory={subCategory}
                      specs={customSpecs}
                      onChangeSpec={handleSpecChange}
                    />
                  </div>
                )}

                {/* PASUL 5: UNDE SE AFLĂ PRODUSUL */}
                {currentStep === 5 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 5/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Unde se află produsul?</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Configurează locația și datele de contact pentru cumpărători.
                      </p>
                    </div>

                    {/* Județ & Oraș */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Județ *</label>
                        <select
                          value={county}
                          onChange={(e) => {
                            setCounty(e.target.value);
                            setCity(ROMANIAN_COUNTIES[e.target.value]?.[0] || e.target.value);
                          }}
                          className="w-full h-12 px-3 rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50/50 dark:bg-[#252525] text-sm font-semibold"
                        >
                          {Object.keys(ROMANIAN_COUNTIES).map((jud) => (
                            <option key={jud} value={jud}>{jud}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Oraș / Sector *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ex: Slatina, Sector 1"
                          className="w-full h-12 px-4 rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50/50 dark:bg-[#252525] text-sm font-semibold"
                        >
                        </input>
                      </div>
                    </div>

                    {/* Date Contact */}
                    <div className="p-5 rounded-3xl bg-slate-50 dark:bg-[#252525] border border-slate-200/80 dark:border-[#333] space-y-4">
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block border-b border-slate-200 dark:border-[#333] pb-2">
                        Informații Vânzător
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Numele tău</label>
                          <input
                            type="text"
                            value={sellerName}
                            onChange={(e) => setSellerName(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Telefon de contact</label>
                          <input
                            type="text"
                            value={sellerPhone}
                            onChange={(e) => setSellerPhone(e.target.value)}
                            className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] text-sm"
                          />
                        </div>
                      </div>

                      <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={hidePhone}
                          onChange={(e) => setHidePhone(e.target.checked)}
                          className="w-4 h-4 rounded text-[#03c1a2] focus:ring-[#03c1a2]"
                        />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                          Ascunde numărul de telefon în anunț (cumpărătorii te vor contacta doar prin mesageria Tevinde)
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* PASUL 6: PREȚ & DESCRIERE */}
                {currentStep === 6 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 6/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Preț & Descriere</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Stabilește prețul de vânzare și adaugă o descriere detaliată a produsului.
                      </p>
                    </div>

                    {/* Preț & Monedă Box */}
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#252525] border border-slate-200/80 dark:border-[#333] space-y-4">
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
                        Preț cerut *
                      </label>
                      <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                          <input
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            placeholder="0"
                            className="w-full h-16 px-5 text-2xl sm:text-3xl font-black rounded-2xl border border-slate-200 dark:border-[#3a3a3a] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#03c1a2]"
                          />
                        </div>
                        <div className="flex rounded-2xl border border-slate-200 dark:border-[#3a3a3a] overflow-hidden bg-white dark:bg-[#1a1a1a] h-16 p-1.5 gap-1">
                          {(['EUR', 'RON'] as const).map((curr) => (
                            <button
                              key={curr}
                              type="button"
                              onClick={() => setCurrency(curr)}
                              className={`px-4 rounded-xl font-bold text-sm transition-all ${
                                currency === curr ? 'bg-[#03c1a2] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                              }`}
                            >
                              {curr === 'EUR' ? 'EUR (€)' : 'RON'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Opțiuni Negociere & Schimb */}
                      <div className="pt-3 border-t border-slate-200 dark:border-[#333] space-y-3">
                        <label className="flex items-center justify-between cursor-pointer select-none">
                          <div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">Acceptă negociere</span>
                            <span className="text-xs text-slate-500">Cumpărătorii pot trimite oferte sub prețul listat.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isNegotiable}
                            onChange={(e) => setIsNegotiable(e.target.checked)}
                            className="w-5 h-5 rounded text-[#03c1a2] focus:ring-[#03c1a2]"
                          />
                        </label>

                        <label className="flex items-center justify-between cursor-pointer select-none">
                          <div>
                            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 block">Acceptă schimburi</span>
                            <span className="text-xs text-slate-500">Ești deschis la propuneri de schimb.</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={isExchange}
                            onChange={(e) => setIsExchange(e.target.checked)}
                            className="w-5 h-5 rounded text-[#03c1a2] focus:ring-[#03c1a2]"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Livrare Tevinde Box */}
                    <div className="p-5 rounded-3xl bg-gradient-to-r from-[#03c1a2]/10 to-teal-500/10 border border-[#03c1a2]/30 flex items-start gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#03c1a2] text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Truck size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Activează Livrare Tevinde</span>
                          <input
                            type="checkbox"
                            checked={hasShipping}
                            onChange={(e) => setHasShipping(e.target.checked)}
                            className="w-5 h-5 rounded text-[#03c1a2] focus:ring-[#03c1a2]"
                          />
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                          Vinde în siguranță cu ridicare și livrare la ușă. Protecție de plată garantată prin Tevinde Pay.
                        </p>
                      </div>
                    </div>

                    {/* Secțiune Descriere Anunț */}
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#252525] border border-slate-200/80 dark:border-[#333] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-[#333] pb-3">
                        <div>
                          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                            Descrierea anunțului *
                          </label>
                          <span className="text-xs text-slate-400">Detalii, dotări, accesorii, garanție, motiv de vânzare...</span>
                        </div>

                        <button
                          type="button"
                          onClick={generateAutoDescription}
                          className="self-start sm:self-center px-3.5 py-2 rounded-xl text-xs font-bold bg-[#03c1a2]/15 text-[#03c1a2] hover:bg-[#03c1a2]/25 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Wand2 size={14} />
                          <span>Auto-completare cu IA</span>
                        </button>
                      </div>

                      <div className="space-y-2 pt-1">
                        <textarea
                          rows={6}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Oferă o descriere completă a produsului tău: stare de funcționare, istoric, factură/garanție, mici defecte estetice..."
                          className="w-full p-4 text-sm sm:text-base rounded-2xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#1a1a1a] focus:outline-none focus:ring-2 focus:ring-[#03c1a2] transition-all resize-none text-slate-900 dark:text-white"
                        />
                        <div className="flex justify-between items-center text-xs text-slate-400">
                          <span>Minim 15 caractere</span>
                          <span className={description.trim().length >= 15 ? 'text-emerald-500 font-bold' : 'text-slate-400'}>
                            {description.trim().length} / 15 caractere
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* PASUL 7: PREVIZUALIZARE & FINALIZARE */}
                {currentStep === 7 && (
                  <div className="space-y-6 animate-in fade-in duration-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#03c1a2] mb-1">
                        <span>Pasul 7/7</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Verifică și publică anunțul</h2>
                      <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        Aruncă o ultimă privire peste detaliile anunțului tău înainte de a-l face vizibil cumpărătorilor.
                      </p>
                    </div>

                    {/* Recapitulare Anunț Card */}
                    <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#252525] border border-slate-200/80 dark:border-[#333] space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Rezumat Anunț</span>
                        <span className="text-xs font-bold text-[#03c1a2] bg-[#03c1a2]/10 px-2.5 py-1 rounded-full">Gata de publicare</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#333]">
                          <span className="text-slate-400 block mb-1">Preț</span>
                          <span className="font-extrabold text-base text-[#03c1a2]">{price ? `${price} ${currency}` : 'Negociabil'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#333]">
                          <span className="text-slate-400 block mb-1">Categorie</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{mainCategory}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#333]">
                          <span className="text-slate-400 block mb-1">Locație</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{city}, {county}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#333]">
                          <span className="text-slate-400 block mb-1">Livrare</span>
                          <span className="font-bold text-slate-800 dark:text-slate-200">{hasShipping ? 'Tevinde Delivery ✓' : 'Predare personală'}</span>
                        </div>
                      </div>

                      {/* Snippet Descriere */}
                      <div className="p-4 rounded-xl bg-white dark:bg-[#1a1a1a] border border-slate-200/60 dark:border-[#333] space-y-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Descriere:</span>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 italic">
                          "{description || 'Fără descriere'}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Wizard Navigation Buttons */}
              <div className="pt-8 border-t border-slate-100 dark:border-[#282828] flex items-center justify-between gap-4 mt-8">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="px-5 py-3 rounded-2xl border border-slate-200 dark:border-[#383838] hover:bg-slate-50 dark:hover:bg-[#282828] text-slate-700 dark:text-slate-200 font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={16} />
                    <span>Înapoi</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-7 py-3.5 rounded-2xl bg-[#03c1a2] hover:bg-[#02a88d] text-white font-bold text-sm shadow-md shadow-[#03c1a2]/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Continuă</span>
                    <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={publishStatus !== 'idle'}
                    onClick={handleFinalSubmit}
                    className={`px-9 py-4 rounded-2xl sm:rounded-full font-bold text-base shadow-lg shadow-[#03c1a2]/30 flex items-center gap-3 transition-all cursor-pointer select-none ${
                      publishStatus === 'published'
                        ? 'bg-[#03c1a2] text-white scale-[1.02]'
                        : publishStatus === 'loading'
                        ? 'bg-[#03c1a2] text-white opacity-90 cursor-wait'
                        : 'bg-[#03c1a2] hover:bg-[#02a88d] text-white active:scale-95'
                    }`}
                  >
                    {publishStatus === 'loading' ? (
                      <>
                        <Loader2 size={22} className="animate-spin" />
                        <span>Publicare...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-white stroke-[3]" />
                        </div>
                        <span>Publică anunțul</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Live Card Preview (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="sticky top-24 bg-white dark:bg-[#1e1e1e] rounded-3xl p-5 border border-slate-200/80 dark:border-[#2a2a2a] shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#2a2a2a] pb-3 mb-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Eye size={16} className="text-[#03c1a2]" />
                  <span>Previzualizare Anunț</span>
                </div>
                <span className="text-[11px] font-semibold text-[#03c1a2] bg-[#03c1a2]/10 px-2 py-0.5 rounded-full">
                  Live
                </span>
              </div>

              {/* Tevinde Card Preview matching homepage */}
              <div className="bg-slate-50 dark:bg-[#181818] rounded-2xl overflow-hidden border border-slate-200/90 dark:border-[#333] shadow-xs">
                {/* Photo container */}
                <div className="relative aspect-[4/3] w-full bg-slate-200 dark:bg-[#252525] overflow-hidden">
                  <img
                    src={photos[activePhotoIdx] || photos[0] || DEFAULT_DEMO_PHOTOS[0]}
                    alt={title || 'Previzualizare'}
                    className="w-full h-full object-cover"
                  />

                  {/* Badges */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                      NOU
                    </span>
                    {hasShipping && (
                      <span className="bg-[#03c1a2] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
                        <Truck size={10} />
                        <span>Livrare</span>
                      </span>
                    )}
                  </div>

                  {photos.length > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {photos.length} poze
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xl font-black text-slate-900 dark:text-white">
                      {price ? `${Number(price).toLocaleString('ro-RO')} ${currency === 'EUR' ? '€' : 'RON'}` : 'Preț la cerere'}
                    </span>
                    {isNegotiable && (
                      <span className="text-[11px] text-slate-400 font-semibold">
                        Negociabil
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                    {title.trim() || 'Titlul anunțului tău va apărea aici...'}
                  </h3>

                  {['coches', 'motos', 'motor', 'car', 'moto'].includes(mainCategory) && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
                      {mileage || '0 km'} • {transmission} • {fuel}
                    </p>
                  )}

                  <div className="pt-2 border-t border-slate-200/60 dark:border-[#2a2a2a] flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400" />
                      <span>{city}, {county}</span>
                    </div>
                    <span>Astăzi</span>
                  </div>
                </div>
              </div>

              {/* Safety banner */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-[#2a2a2a] flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={16} className="text-[#03c1a2] flex-shrink-0" />
                <span>Protecție garantată prin Tevinde Pay. Publicare gratuită.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
