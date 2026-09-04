'use client';

import React from 'react';
import { CAR_BRANDS_MAP, MOTO_BRANDS_MAP } from '@/data/mockData';

interface DynamicCategorySpecsProps {
  mainCategory: string;
  subCategory: string;
  specs: Record<string, string>;
  onChangeSpec: (key: string, value: string) => void;
}

export function DynamicCategorySpecs({
  mainCategory,
  subCategory,
  specs,
  onChangeSpec,
}: DynamicCategorySpecsProps) {
  const getVal = (key: string, defaultVal = '') => specs[key] || defaultVal;

  const renderInput = (label: string, key: string, placeholder: string, type = 'text') => (
    <div>
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={getVal(key)}
        onChange={(e) => onChangeSpec(key, e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#03c1a2] focus:border-transparent transition-all"
      />
    </div>
  );

  const renderSelect = (label: string, key: string, options: string[], defaultVal = options[0], includeOther = true) => {
    const finalOptions = [...options];
    if (includeOther && !finalOptions.some((o) => ['altul', 'altele', 'alte mărci', 'alt model'].includes(o.toLowerCase()))) {
      finalOptions.push('Altul');
    }

    const currentVal = getVal(key, defaultVal);
    const isOtherSelected = ['altul', 'altele', 'alte mărci', 'alt model'].includes(currentVal.toLowerCase());

    return (
      <div className="space-y-1.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            {label}
          </label>
          <select
            value={currentVal}
            onChange={(e) => onChangeSpec(key, e.target.value)}
            className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-[#383838] bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#03c1a2] focus:border-transparent transition-all"
          >
            {finalOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* Input dedicat când utilizatorul selectează Altul */}
        {isOtherSelected && (
          <div className="animate-in fade-in duration-150">
            <input
              type="text"
              value={getVal(key + '_custom')}
              onChange={(e) => onChangeSpec(key + '_custom', e.target.value)}
              placeholder={`Specifică ${label.toLowerCase()} (Altul)...`}
              className="w-full h-10 px-3.5 text-xs rounded-xl border border-[#03c1a2]/40 bg-[#03c1a2]/5 dark:bg-[#03c1a2]/10 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#03c1a2] transition-all"
            />
          </div>
        )}
      </div>
    );
  };

  // 1. AUTO / VEHICULE
  const isAutoCategory =
    mainCategory === 'coches' ||
    mainCategory === 'Autoturisme' ||
    mainCategory === 'Motoare' ||
    mainCategory === 'auto' ||
    subCategory.includes('Autoturisme') ||
    subCategory.includes('Mașini') ||
    subCategory.includes('Furgonete') ||
    subCategory.includes('clasice') ||
    subCategory.includes('Coches');

  if (isAutoCategory) {
    const brands = [...Object.keys(CAR_BRANDS_MAP).sort(), 'Altul'];
    const currentBrand = getVal('brand', 'Volkswagen');
    const availableModels = [...(CAR_BRANDS_MAP[currentBrand] || []), 'Alt Model', 'Altul'];

    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🚗 Specificații Tehnice Auto ({subCategory})
          </span>
          <span className="text-[11px] font-bold text-[#03c1a2] bg-[#03c1a2]/10 px-2.5 py-1 rounded-full">
            Dedicat Vehicule
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Marcă', 'brand', brands, 'Volkswagen')}
          {renderSelect('Model', 'model', availableModels, availableModels[0])}
          {renderInput('An fabricație', 'year', 'Ex: 2020')}
          {renderInput('Kilometraj (km)', 'mileage', 'Ex: 145.000 km')}
          {renderSelect('Combustibil', 'fuel', ['Diesel', 'Benzină', 'Hibrid', 'Electric', 'GPL', 'Plug-in Hibrid'], 'Diesel')}
          {renderSelect('Cutie de viteze', 'transmission', ['Manuală', 'Automată'], 'Manuală')}
          {renderSelect('Caroserie', 'caroserie', ['Sedan / Berlină', 'SUV / Off-road', 'Break / Combi', 'Hatchback', 'Monovolum', 'Coupé', 'Cabrio'], 'Hatchback')}
          {renderInput('Putere motor (CP)', 'enginePower', 'Ex: 150 CP')}
          {renderInput('Capacitate cilindrică (cm³)', 'engineCapacity', 'Ex: 1968 cm³')}
          {renderSelect('Normă de poluare', 'euroClass', ['Euro 6', 'Euro 5', 'Euro 4', 'Euro 3', 'Non-euro'], 'Euro 6')}
          {renderSelect('Stare înmatriculare', 'registrationStatus', ['Înmatriculat RO', 'Neînmatriculat', 'Numere roșii', 'Înmatriculat străinătate'], 'Înmatriculat RO')}
          {renderInput('Serie șasiu (VIN)', 'vinNumber', 'Ex: WAUZZZ8V... (Opțional)')}
        </div>
      </div>
    );
  }

  // 2. MOTO / SCUTERE / ATV
  if (mainCategory === 'motos' || mainCategory === 'Motociclete' || subCategory.includes('Moto') || subCategory.includes('Scuter') || subCategory.includes('ATV')) {
    const motoBrands = Object.keys(MOTO_BRANDS_MAP).sort();
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🏍️ Specificații Motocicletă / Scuter / ATV
          </span>
          <span className="text-[11px] font-bold text-[#03c1a2] bg-[#03c1a2]/10 px-2.5 py-1 rounded-full">
            Dedicat Moto
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Marcă', 'motoBrand', motoBrands, 'Yamaha')}
          {renderInput('Model', 'motoModel', 'Ex: MT-07, R 1250 GS')}
          {renderInput('An fabricație', 'motoYear', 'Ex: 2021')}
          {renderInput('Kilometraj (km)', 'motoMileage', 'Ex: 18.500 km')}
          {renderInput('Capacitate cilindrică (cm³)', 'motoDisplacement', 'Ex: 689 cm³')}
          {renderSelect('Tip vehicul', 'motoType', ['Naked', 'Sport / Supersport', 'Touring / Adventure', 'Enduro / Cross', 'Chopper / Cruiser', 'Scuter / Maxi-scuter', 'ATV / Quad'], 'Naked')}
        </div>
      </div>
    );
  }

  // 3. PIESE AUTO & ACCESORII
  if (mainCategory === 'motor-y-accesorios' || mainCategory.includes('Piese') || subCategory.includes('Piese') || subCategory.includes('Accesorii auto')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            💿 Specificații Piese & Accesorii Auto-Moto
          </span>
          <span className="text-[11px] font-bold text-[#03c1a2] bg-[#03c1a2]/10 px-2.5 py-1 rounded-full">
            Piese Auto
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip componentă', 'partCategory', ['Piese Motor & Cutie', 'Sistem de frânare', 'Suspensie & Direcție', 'Elemente Caroserie & Faruri', 'Anvelope, Jante & Roți', 'Audio, GPS & Navigație', 'Uleiuri & Consumabile', 'Scule & Diagnoză'], 'Piese Motor & Cutie')}
          {renderSelect('Stare piesă', 'partCondition', ['Nouă (în ambalaj)', 'Second-hand (perfectă stare)', 'Din dezmembrări', 'Recondiționată'], 'Second-hand (perfectă stare)')}
          {renderInput('Compatibilitate marcă / model', 'partCompatibility', 'Ex: Compatibil Audi A4 B8, VW Passat B7')}
          {renderInput('Cod piesă OEM', 'partOemCode', 'Ex: 03L130277B (Opțional)')}
        </div>
      </div>
    );
  }

  // 4. AMBARCAȚIUNI ȘI NAUTIC
  if (mainCategory === 'Motoare' && subCategory.includes('Ambarcațiuni')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            ⚓ Specificații Ambarcațiune & Nautic
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip ambarcațiune', 'boatType', ['Barcă cu motor', 'Barcă pneumatică / gonflabilă', 'Skijet', 'Velier', 'Șalupă', 'Iacht'], 'Barcă cu motor')}
          {renderInput('Lungime (metri)', 'boatLength', 'Ex: 5.5 m')}
          {renderInput('An fabricație', 'boatYear', 'Ex: 2019')}
          {renderInput('Motorizare & Putere', 'boatEngine', 'Ex: Yamaha 100 CP 4-timpi')}
        </div>
      </div>
    );
  }

  // 5. IMOBILIARE
  if (mainCategory === 'inmobiliaria' || mainCategory === 'Imobiliare' || subCategory.includes('Apartament') || subCategory.includes('Case') || subCategory.includes('Teren') || subCategory.includes('Spații') || subCategory.includes('Garaj')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🏠 Specificații Proprietate Imobiliară
          </span>
          <span className="text-[11px] font-bold text-[#03c1a2] bg-[#03c1a2]/10 px-2.5 py-1 rounded-full">
            Dedicat Imobiliare
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Tip tranzacție', 'propertyOperation', ['Vânzare', 'Închiriere'], 'Vânzare')}
          {renderInput('Suprafață utilă (m²)', 'propertySurface', 'Ex: 75 m²')}
          {renderSelect('Număr camere', 'propertyRooms', ['Garsonieră', '2 camere', '3 camere', '4 camere', '5+ camere'], '2 camere')}
          {renderSelect('Număr băi', 'propertyBathrooms', ['1 baie', '2 băi', '3+ băi'], '1 baie')}
          {renderSelect('Compartimentare', 'propertyPartitioning', ['Decomandat', 'Semidecomandat', 'Nedecomandat', 'Circular', 'Open space'], 'Decomandat')}
          {renderSelect('Etaj / Nivel', 'propertyFloor', ['Demisol / Parter', 'Etaj 1', 'Etaj 2', 'Etaj 3', 'Etaj 4', 'Etaj 5+', 'Ultimul etaj / Mansardă', 'Casă individuală'], 'Etaj 2')}
          {renderInput('An construcție', 'propertyYear', 'Ex: 2021')}
          {renderSelect('Dotări & Încălzire', 'propertyHeating', ['Centrală termică proprie', 'Încălzire în pardoseală', 'Termoficare oraș', 'Aer condiționat'], 'Centrală termică proprie')}
        </div>
      </div>
    );
  }

  // 6. TELEFONIE (Telefoane & Accesorii)
  if (mainCategory === 'moviles-y-telefonia' || mainCategory === 'Telefoane & Tablete' || subCategory.includes('Telefon') || subCategory.includes('iPhone') || subCategory.includes('Samsung') || subCategory.includes('Tablete')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            📱 Specificații Telefon Mobil & Gadget
          </span>
          <span className="text-[11px] font-bold text-[#03c1a2] bg-[#03c1a2]/10 px-2.5 py-1 rounded-full">
            Dedicat Telefonie
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Brand / Producător', 'phoneBrand', ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Google', 'OnePlus', 'Motorola', 'Altul'], 'Apple')}
          {renderInput('Model exact', 'phoneModel', 'Ex: iPhone 15 Pro Max')}
          {renderSelect('Capacitate stocare', 'phoneStorage', ['64 GB', '128 GB', '256 GB', '512 GB', '1 TB'], '256 GB')}
          {renderInput('Culoare', 'phoneColor', 'Ex: Natural Titanium, Negru')}
          {renderInput('Sănătate baterie (%)', 'phoneBattery', 'Ex: 95%')}
          {renderSelect('Stare rețea', 'phoneNetwork', ['Liber de rețea (Neverlocked)', 'Codat în rețea', 'Dual SIM / eSIM'], 'Liber de rețea (Neverlocked)')}
        </div>
      </div>
    );
  }

  // 7. INFORMATICĂ (Calculatoare, Laptopuri)
  if (mainCategory === 'informatica' || mainCategory === 'Informatică' || subCategory.includes('Laptop') || subCategory.includes('PC') || subCategory.includes('Calculat') || subCategory.includes('Informat')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            💻 Specificații Calculator / Laptop / IT
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Tip echipament', 'pcType', ['Laptop / Notebook', 'PC Desktop Gaming', 'Workstation / Birou', 'All-in-One', 'Componente PC (Placă video, etc.)'], 'Laptop / Notebook')}
          {renderSelect('Brand', 'pcBrand', ['Apple', 'Lenovo', 'Asus', 'Dell', 'HP', 'Acer', 'MSI', 'Custom Build'], 'Apple')}
          {renderInput('Model', 'pcModel', 'Ex: MacBook Pro 14 M3, Legion 5')}
          {renderInput('Procesor (CPU)', 'pcCpu', 'Ex: Apple M3 Pro, Intel i7-13700H, Ryzen 7')}
          {renderSelect('Memorie RAM', 'pcRam', ['8 GB', '16 GB', '32 GB', '64 GB'], '16 GB')}
          {renderSelect('Capacitate stocare SSD', 'pcStorage', ['256 GB', '512 GB', '1 TB', '2 TB'], '512 GB')}
        </div>
      </div>
    );
  }

  // 8. BICICLETE
  if (subCategory === 'Biciclete' || subCategory.includes('Biciclete')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🚲 Specificații Bicicletă
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Tip bicicletă', 'bikeType', ['Mountain Bike (MTB)', 'Șosea / Cursieră', 'Gravel / Ciclocros', 'Electrică (E-Bike)', 'Oraș / Trekking', 'Pliabilă', 'BMX', 'Copii'], 'Mountain Bike (MTB)')}
          {renderInput('Marcă', 'bikeBrand', 'Ex: Trek, Specialized, Scott, Cube')}
          {renderSelect('Mărime cadru', 'bikeFrameSize', ['XS', 'S', 'M', 'L', 'XL'], 'M')}
          {renderSelect('Diametru roți', 'bikeWheelSize', ['29"', '27.5"', '26"', '28" / 700c', '24"', '20"'], '29"')}
          {renderSelect('Material cadru', 'bikeFrameMaterial', ['Aluminiu', 'Carbon', 'Oțel / Cromoly'], 'Aluminiu')}
          {renderSelect('Sistem de frânare', 'bikeBrakes', ['Discuri hidraulice', 'Discuri mecanice', 'Frână V-Brake'], 'Discuri hidraulice')}
        </div>
      </div>
    );
  }

  // 9. ELECTROCASNICE
  if (subCategory === 'Electrocasnice') {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🧊 Specificații Electrocasnice
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip aparat', 'applianceType', ['Frigider / Congelator', 'Mașină de spălat rufe', 'Uscător de rufe', 'Cuptor / Plită', 'Mașină de spălat vase', 'Espressor cafea', 'Aspirator / Robot', 'Climatizare'], 'Frigider / Congelator')}
          {renderInput('Marcă / Producător', 'applianceBrand', 'Ex: Bosch, Samsung, LG, Whirlpool, Miele')}
          {renderSelect('Clasă energetică', 'applianceEnergy', ['A', 'B', 'C', 'D', 'E', 'F', 'A+++'], 'A')}
          {renderSelect('Tip montaj', 'applianceMount', ['Independent (Free-standing)', 'Încorporabil în mobilier'], 'Independent (Free-standing)')}
        </div>
      </div>
    );
  }

  // 10. AUDIO/VIDEO
  if (subCategory === 'Audio/Video') {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🎧 Specificații Audio, Video & TV
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip produs', 'avType', ['Televizor / Smart TV', 'Căști audio (Wireless / Cu fir)', 'Boxă portabilă / Soundbar', 'Sistem audio / Receiver Hi-Fi', 'Videoproiector'], 'Televizor / Smart TV')}
          {renderInput('Marcă', 'avBrand', 'Ex: Sony, Samsung, LG, JBL, Bose')}
          {renderInput('Diagonala / Rezoluție / Putere', 'avSpec', 'Ex: 55" 4K OLED, 100W, Noise Cancelling')}
        </div>
      </div>
    );
  }

  // 11. CONSOLE ȘI JOCURI VIDEO
  if (subCategory === 'Console și jocuri video') {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🎮 Specificații Console & Gaming
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Platformă', 'gamingPlatform', ['PlayStation 5', 'PlayStation 4', 'Xbox Series X/S', 'Nintendo Switch', 'PC Gaming / Steam Deck'], 'PlayStation 5')}
          {renderSelect('Tip articol', 'gamingItemType', ['Consolă completă', 'Joc fizic pe disc/card', 'Controller / Manetă', 'Căști / VR / Volan gaming'], 'Consolă completă')}
          {renderInput('Capacitate stocare', 'gamingStorage', 'Ex: 1 TB, 825 GB')}
        </div>
      </div>
    );
  }

  // 12. ÎMBRĂCĂMINTE ȘI ACCESORII (MODĂ)
  if (subCategory === 'Îmbrăcăminte și accesorii' || subCategory.includes('Modă')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            👗 Specificații Articol de Modă
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {renderSelect('Destinat pentru', 'fashionGender', ['Femei', 'Bărbați', 'Copii / Fete', 'Copii / Băieți', 'Unisex'], 'Femei')}
          {renderSelect('Tip articol', 'fashionType', ['Geci & Paltoane', 'Hanorace & Bluze', 'Rochii & Fuste', 'Pantaloni & Blugi', 'Tricouri & Cămăși', 'Încălțăminte', 'Genți & Rucsacuri', 'Ceasuri & Bijuterii'], 'Geci & Paltoane')}
          {renderInput('Mărime', 'fashionSize', 'Ex: M, L, XL sau 38, 42')}
          {renderInput('Marcă / Brand', 'fashionBrand', 'Ex: Zara, Nike, Adidas, Tommy Hilfiger')}
          {renderInput('Culoare', 'fashionColor', 'Ex: Negru, Bej, Albastru')}
        </div>
      </div>
    );
  }

  // 13. MOBILĂ ȘI ARTICOLE DE UZ CASNIC
  if (subCategory.includes('Mobilă')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🛋️ Specificații Mobilier & Casă
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip mobilier', 'furnitureType', ['Canapea / Colțar', 'Masă & Scaune', 'Dulap / Dressing', 'Pat / Saltea', 'Mobilier bucătărie', 'Mobilier birou', 'Comodă / Corp TV'], 'Canapea / Colțar')}
          {renderSelect('Material principal', 'furnitureMaterial', ['Lemn masiv', 'MDF / PAL melaminat', 'Metal', 'Piele naturală', 'Tapițerie textilă'], 'Lemn masiv')}
          {renderInput('Dimensiuni (L x l x h)', 'furnitureDimensions', 'Ex: 240 x 160 x 85 cm')}
        </div>
      </div>
    );
  }

  // 14. GRĂDINĂ ȘI BRICOLAJ
  if (subCategory.includes('Grădină') || subCategory.includes('bricolaj')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🔨 Specificații Unelte & Bricolaj
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip unealtă', 'toolType', ['Bormașină / Autofiletantă', 'Polizor flex unghiular', 'Fierăstrău circular / Pendular', 'Motocoasă / Trimmer', 'Generator curent', 'Unelte grădină', 'Materiale construcții'], 'Bormașină / Autofiletantă')}
          {renderInput('Marcă', 'toolBrand', 'Ex: Bosch, Makita, DeWalt, Milwaukee, Parkside')}
          {renderSelect('Alimentare', 'toolPower', ['Acumulator Li-Ion', 'Rețea 220V', 'Benzină', 'Manual'], 'Acumulator Li-Ion')}
        </div>
      </div>
    );
  }

  // 15. SPORT
  if (subCategory === 'Sport' || subCategory.includes('Sport')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🏆 Specificații Echipament Sportiv
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Disciplină sportivă', 'sportDiscipline', ['Fitness & Forță', 'Fotbal', 'Tenis & Padel', 'Drumeții & Camping', 'Alergare', 'Pescuit', 'Schi & Sporturi de iarnă'], 'Fitness & Forță')}
          {renderInput('Marcă / Producător', 'sportBrand', 'Ex: Nike, Adidas, Decathlon, Puma, Under Armour')}
        </div>
      </div>
    );
  }

  // 16. TOTUL PENTRU COPII
  if (subCategory.includes('copii') || subCategory.includes('Jucării')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            👶 Specificații Articol Copii & Bebeluși
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip articol', 'kidsItemType', ['Cărucioare & Landouri', 'Scaune auto / Isofix', 'Pătuțuri & Mobilier cameră', 'Jucării & Jocuri', 'Hăinuțe bebeluși'], 'Cărucioare & Landouri')}
          {renderSelect('Vârstă recomandată', 'kidsAgeGroup', ['0-6 luni', '6-12 luni', '1-3 ani', '3-6 ani', '6+ ani'], '0-6 luni')}
          {renderInput('Marcă', 'kidsBrand', 'Ex: Chicco, Cybex, Maxi-Cosi, Kinderkraft, Lego')}
        </div>
      </div>
    );
  }

  // 17. FOTOGRAFIE
  if (subCategory === 'Fotografie') {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            📷 Specificații Cameră Foto & Video
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip aparat', 'photoType', ['Aparat foto Mirrorless', 'Aparat foto DSLR', 'Cameră de acțiune / GoPro', 'Obiectiv foto', 'Dronă', 'Trepied & Iluminat'], 'Aparat foto Mirrorless')}
          {renderInput('Marcă & Model', 'photoBrand', 'Ex: Sony A7 IV, Canon EOS R6, DJI Mini 4 Pro')}
        </div>
      </div>
    );
  }

  // 18. INSTRUMENTE MUZICALE
  if (subCategory.includes('Instrumente')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🎸 Specificații Instrument Muzical
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip instrument', 'musicType', ['Chitară electrică', 'Chitară acustică / clasică', 'Pian digital / Clape', 'Tobe & Percuție', 'Echipamente DJ & Studio'], 'Chitară electrică')}
          {renderInput('Marcă & Model', 'musicBrand', 'Ex: Fender Stratocaster, Gibson, Yamaha')}
        </div>
      </div>
    );
  }

  // 19. CĂRȚI, REVISTE, MUZICĂ ȘI FILM
  if (subCategory.includes('Cărți') || subCategory.includes('Muzică și film')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            📚 Specificații Media, Carte & Muzică
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Format', 'mediaFormat', ['Carte tipărită', 'Disc vinil (LP)', 'CD audio', 'Caseta audio', 'DVD / Blu-ray'], 'Carte tipărită')}
          {renderInput('Titlu / Autor / Artist', 'mediaAuthor', 'Ex: Stephen King, Pink Floyd')}
        </div>
      </div>
    );
  }

  // 20. OBIECTE DE COLECȚIE
  if (subCategory.includes('colecție') || subCategory.includes('Artă')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            ✨ Specificații Obiect de Colecție & Artă
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip colecție', 'collectibleType', ['Machete auto / avioane', 'Monede & Bancnote vechi', 'Ceasuri vintage de colecție', 'Tablouri & Picturi', 'Antichități & Porțelan'], 'Machete auto / avioane')}
          {renderInput('Perioadă / An fabricație', 'collectibleEra', 'Ex: Anul 1975, Perioada interbelică')}
        </div>
      </div>
    );
  }

  // 21. ANIMALE & ACCESORII ANIMALE
  if (subCategory.includes('Animale')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🐾 Specificații Animale & Accesorii
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Categorie', 'petCategory', ['Câini', 'Pisici', 'Păsări', 'Pești & Acvarii', 'Accesorii & Hrană (Culcușuri, zgărzi)'], 'Câini')}
          {renderInput('Rasă / Vârstă', 'petBreed', 'Ex: Golden Retriever, 3 luni (cu carnet sănătate)')}
        </div>
      </div>
    );
  }

  // 22. LUCRU / LOCURI DE MUNCĂ
  if (mainCategory === 'Lucru' && subCategory.includes('Locuri')) {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            💼 Specificații Ofertă de Muncă
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Domeniu activitate', 'jobDomain', ['Vânzări & Relații clienți', 'Șoferi & Curierat / Transport', 'Meseriași & Construcții', 'IT, Software & Birou', 'HoReCa & Bucătărie', 'Producție & Depozit'], 'Vânzări & Relații clienți')}
          {renderSelect('Tip normă', 'jobSchedule', ['Normă întreagă (Full-time)', 'Jumătate de normă (Part-time)', 'Proiect / Freelance', 'Sezonier'], 'Normă întreagă (Full-time)')}
          {renderSelect('Nivel experiență', 'jobExperience', ['Fără experiență (Entry level)', 'Intermediar (1-3 ani)', 'Senior (3+ ani)'], 'Fără experiență (Entry level)')}
          {renderSelect('Mod de lucru', 'jobMode', ['La sediu / Locație fizică', 'Hibrid', 'Remote (De acasă)'], 'La sediu / Locație fizică')}
        </div>
      </div>
    );
  }

  // 23. SERVICII & MEȘTERI / CURSURI
  if (mainCategory === 'Lucru') {
    return (
      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#333] pb-3">
          <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            🔧 Specificații Servicii & Meșteșugari
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {renderSelect('Tip serviciu', 'serviceType', ['Reparații & Instalații sanitare/electrice', 'Construcții & Amenajări interioare', 'Transport marfă & Mutări', 'Foto & Video evenimente', 'Cursuri & Meditații', 'Curățenie & Întreținere'], 'Reparații & Instalații sanitare/electrice')}
          {renderInput('Disponibilitate & Deplasare', 'serviceAvailability', 'Ex: Deplasare la domiciliu în tot județul, intervenții rapide')}
        </div>
      </div>
    );
  }

  // GENERAL FALLBACK
  return (
    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#222222] border border-slate-200/80 dark:border-[#333] space-y-3">
      <span className="font-bold text-sm text-slate-900 dark:text-white block border-b border-slate-200 dark:border-[#333] pb-2">
        Specificații Generale ({subCategory})
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {renderInput('Marcă / Producător', 'generalBrand', 'Ex: Marcă sau Producător')}
        {renderInput('Model / Dimensiuni / Culoare', 'generalDetails', 'Ex: Detalii suplimentare')}
      </div>
    </div>
  );
}
