export interface OfficialCategory {
  id: string;
  name: string;
  spanishName: string;
  image: string;
  iconName: string;
  subcategories: string[];
}

export const OFFICIAL_CATEGORIES: OfficialCategory[] = [
  {
    id: 'coches',
    name: 'Autoturisme',
    spanishName: 'Coches',
    image: '/coches.png',
    iconName: 'Car',
    subcategories: [
      'Toate autoturismele',
      'Autoturisme rulate (second-hand)',
      'Mașini noi / 0 km',
      'Mașini fără permis',
      'Mașini clasice & epocă',
      'Furgonete & Dube',
    ],
  },
  {
    id: 'motos',
    name: 'Motociclete',
    spanishName: 'Motos',
    image: '/motos.png',
    iconName: 'Bike',
    subcategories: [
      'Toate motocicletele',
      'Scutere & Maxiscutere',
      'Sport & Viteză',
      'Chopper & Cruiser',
      'Enduro & Cross',
      'Touring & Aventura',
      'ATV, Quad & Buggy',
    ],
  },
  {
    id: 'motor-y-accesorios',
    name: 'Piese & Accesorii auto',
    spanishName: 'Motor y accesorios',
    image: '/motor_y_accesorios.png',
    iconName: 'Disc',
    subcategories: [
      'Toate piesele auto',
      'Piese motor & cutie viteze',
      'Caroserie & Oglinzi',
      'Jante, Roți & Anvelope',
      'Faruri & Iluminare',
      'Audio, Navigație & Electronice',
      'Piese motociclete',
      'Echipamente & Căști moto',
      'Rulote & Autorulote',
      'Ambarcațiuni & Nautic',
    ],
  },
  {
    id: 'moda-y-accesorios',
    name: 'Modă & Accesorii',
    spanishName: 'Moda y accesorios',
    image: '/moda_y_accesorios.png',
    iconName: 'Shirt',
    subcategories: [
      'Toate articolele de modă',
      'Îmbrăcăminte damă',
      'Îmbrăcăminte bărbați',
      'Încălțăminte damă',
      'Încălțăminte bărbați',
      'Genți, Rucsacuri & Portofele',
      'Ceasuri & Bijuterii',
      'Ochelari & Accesorii',
    ],
  },
  {
    id: 'inmobiliaria',
    name: 'Imobiliare',
    spanishName: 'Inmobiliaria',
    image: '/inmobiliaria.png',
    iconName: 'Home',
    subcategories: [
      'Toate proprietățile',
      'Apartamente de vânzare',
      'Apartamente de închiriat',
      'Case & Vile de vânzare',
      'Case & Vile de închiriat',
      'Terenuri',
      'Spații comerciale & Birouri',
      'Garaje & Parcări',
      'Case de vacanță & Camere',
    ],
  },
  {
    id: 'tecnologia-y-electronica',
    name: 'Tehnologie & Electronică',
    spanishName: 'Tecnología y electrónica',
    image: '/tecnologia_y_electronica.png',
    iconName: 'Tv',
    subcategories: [
      'Toate electronicele',
      'Televizoare & Smart TV',
      'Sisteme audio & Boxe',
      'Camere foto & Video',
      'Căști & Audio portabil',
      'Drone & Gadgeturi smart',
      'Proiectoare & Accesorii TV',
    ],
  },
  {
    id: 'moviles-y-telefonia',
    name: 'Telefoane & Tablete',
    spanishName: 'Móviles y Telefonía',
    image: '/tecnologia_y_electronica.png',
    iconName: 'Smartphone',
    subcategories: [
      'Toate telefoanele',
      'iPhone / Apple',
      'Samsung',
      'Xiaomi, Huawei & altele',
      'Tablete & iPad',
      'Smartwatch & Brățări fitness',
      'Huse, Folii & Cabluri',
      'Baterii externe & Încărcătoare',
    ],
  },
  {
    id: 'informatica',
    name: 'Informatică',
    spanishName: 'Informática',
    image: '/images/piata_informatica.png',
    iconName: 'Laptop',
    subcategories: [
      'Toată informatica',
      'Laptopuri & Notebook-uri',
      'PC Desktop & Calculatoare Gaming',
      'Componente PC (Plăci video, Procesoare, RAM)',
      'Monitoare',
      'Tastaturi, Mouse & Periferice',
      'Imprimante & Consumabile',
      'Rețelistică & Routere',
    ],
  },
  {
    id: 'deporte-y-ocio',
    name: 'Sport & Timp liber',
    spanishName: 'Deporte y ocio',
    image: '/deporte_y_ocio.png',
    iconName: 'Dumbbell',
    subcategories: [
      'Toate pentru sport',
      'Fitness, Culturism & Aerobic',
      'Fotbal & Sporturi de echipă',
      'Tenis & Sporturi cu racheta',
      'Camping & Drumeții',
      'Pescuit & Vânătoare',
      'Sporturi de iarnă (Schi & Snowboard)',
      'Sporturi nautice',
    ],
  },
  {
    id: 'bicicletas',
    name: 'Biciclete',
    spanishName: 'Bicicletas',
    image: '/bicicletas.png',
    iconName: 'Bike',
    subcategories: [
      'Toate bicicletele',
      'Biciclete Mountain Bike (MTB)',
      'Biciclete de oraș & Pliabile',
      'Cursiere & Șosea',
      'Biciclete electrice (E-bike)',
      'Biciclete copii',
      'Piese & Componente bicicletă',
      'Accesorii & Căști ciclism',
    ],
  },
  {
    id: 'consolas-y-videojuegos',
    name: 'Console & Jocuri video',
    spanishName: 'Consolas y Videojuegos',
    image: '/images/piata_console.png',
    iconName: 'Gamepad2',
    subcategories: [
      'Toate jocurile & consolele',
      'PlayStation 5 & PS4',
      'Xbox Series & Xbox One',
      'Nintendo Switch',
      'Jocuri video console',
      'Jocuri PC',
      'Accesorii gaming & Volane',
    ],
  },
  {
    id: 'hogar-y-jardin',
    name: 'Casă & Grădină',
    spanishName: 'Hogar y jardín',
    image: '/hogar_y_jardin.png',
    iconName: 'Armchair',
    subcategories: [
      'Totul pentru casă & grădină',
      'Mobilă living & sufragerie',
      'Mobilă dormitor & saltele',
      'Mobilă bucătărie',
      'Decorațiuni & Covoare',
      'Grădină, Plante & Ghivece',
      'Mobilier de grădină',
      'Iluminat & Corpuri electrice',
    ],
  },
  {
    id: 'electrodomesticos',
    name: 'Electrocasnice',
    spanishName: 'Electrodomésticos',
    image: '/electrodomesticos.png',
    iconName: 'Refrigerator',
    subcategories: [
      'Toate electrocasnicele',
      'Frigidere & Congelatoare',
      'Mașini de spălat rufe',
      'Mașini de spălat vase',
      'Aragazuri, Plite & Cuptoare',
      'Aparate de cafea & Espresoare',
      'Aspiratoare & Fiare de călcat',
      'Mici electrocasnice bucătărie',
    ],
  },
  {
    id: 'cine-libros-y-musica',
    name: 'Cărți, Filme & Muzică',
    spanishName: 'Cine, libros y música',
    image: '/cine_libros_y_musica.png',
    iconName: 'BookOpen',
    subcategories: [
      'Toată cultura & divertismentul',
      'Cărți beletristică & romane',
      'Cărți pentru copii & manuale',
      'Discuri vinil & CD-uri audio',
      'Filme DVD & Blu-Ray',
      'Instrumente muzicale (Chitare, Clape, etc.)',
      'Echipamente audio de studio',
    ],
  },
  {
    id: 'ninos-y-bebes',
    name: 'Copii & Bebeluși',
    spanishName: 'Niños y bebés',
    image: '/ninos_y_bebes.png',
    iconName: 'Baby',
    subcategories: [
      'Totul pentru copii & bebeluși',
      'Cărucioare & Scaune auto',
      'Hăinuțe bebeluși & copii',
      'Încălțăminte copii',
      'Jucării & Jocuri educative',
      'Pătuțuri & Mobilă copii',
      'Igienă, Alimentație & Siguranță',
    ],
  },
  {
    id: 'coleccionismo',
    name: 'Colecționism & Artă',
    spanishName: 'Coleccionismo',
    image: '/coleccionismo.png',
    iconName: 'Award',
    subcategories: [
      'Toate colecțiile & antichitățile',
      'Monede & Bancnote vechi (Numismatică)',
      'Timbre poștale (Filatelie)',
      'Antichități, Artă & Tablouri',
      'Machete auto, trenulețe & avioane',
      'Cărți poștale & Documente vechi',
      'Obiecte vintage & militare',
    ],
  },
  {
    id: 'construccion-y-reformas',
    name: 'Construcții & Bricolaj',
    spanishName: 'Construcción y reformas',
    image: '/construccion_y_reformas.png',
    iconName: 'Wrench',
    subcategories: [
      'Toate uneltele & materialele',
      'Scule electrice & Bormașini',
      'Unelte de mână & Truse',
      'Materiale de construcții',
      'Obiecte sanitare & Instalații',
      'Gresie, Faianță & Parchet',
      'Vopsele, Lacuri & Izolații',
      'Feronerie & Uși',
    ],
  },
  {
    id: 'industria-y-agricultura',
    name: 'Industrie & Agricultură',
    spanishName: 'Industria y agricultura',
    image: '/industria_y_agricultura.png',
    iconName: 'Tractor',
    subcategories: [
      'Toate utilajele & echipamentele',
      'Tractoare & Utilaje agricole',
      'Piese de schimb agricole',
      'Utilaje industriale & Construcții',
      'Generatoare & Compresoare',
      'Echipamente Horeca & Magazine',
    ],
  },
  {
    id: 'empleo',
    name: 'Locuri de muncă',
    spanishName: 'Empleo',
    image: '/empleo.png',
    iconName: 'Briefcase',
    subcategories: [
      'Toate ofertele de muncă',
      'Șoferi, Transport & Curierat',
      'Muncitori în construcții & Meșteri',
      'IT, Telecom & Programare',
      'Vânzări, Relații clienți & Comerț',
      'Horeca (Bucătari, Ospătari, Barmani)',
      'Contabilitate, Finanțe & Birou',
      'Cereri de muncă (CV-uri)',
    ],
  },
  {
    id: 'servicios',
    name: 'Servicii & Meseriași',
    spanishName: 'Servicios',
    image: '/servicios.png',
    iconName: 'Settings',
    subcategories: [
      'Toate serviciile',
      'Reparații & Meșteri la domiciliu',
      'Servicii auto & Tractări',
      'Transport marfă & Mutări',
      'Cursuri, Meditații & Traduceri',
      'Înfrumusețare & Saloane',
      'Organizare evenimente, Foto & Video',
      'Curățenie & Întreținere',
    ],
  },
  {
    id: 'animale',
    name: 'Animale de companie',
    spanishName: 'Animales y mascotas',
    image: '/images/piata_animale.png',
    iconName: 'Heart',
    subcategories: [
      'Toate animalele',
      'Câini',
      'Pisici',
      'Păsări & Animale mici',
      'Accesorii & Hrană pentru animale',
      'Servicii veterinare & Dresaj',
    ],
  },
];

export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  coches: [
    'car',
    'cars',
    'coches',
    'coche',
    'auto',
    'autoturisme',
    'autoturism',
    'masina',
    'masini',
    'mașină',
    'mașini',
    'vehicule',
    'vehicul',
    'vehiculo',
    'vehiculos',
    'automobil',
    'automobile',
    'autoturisme rulate (second-hand)',
    'coches de segunda mano',
    'autoturisme rulate',
  ],
  motos: [
    'moto',
    'motos',
    'motociclete',
    'motocicletă',
    'motocicleta',
    'motociclete și scutere',
    'motos, scooters y quads',
    'scuter',
    'scutere',
    'atv',
    'quad',
    'buggy',
  ],
  'motor-y-accesorios': [
    'motor-y-accesorios',
    'motor_y_accesorios',
    'motor',
    'auto-acc',
    'moto-acc',
    'piese',
    'piese auto',
    'piese auto & accesorii',
    'accesorii auto',
    'accesorii motocicletă',
    'recambios',
    'accesorios',
    'camper',
    'commercial',
    'nautical',
    'rulote',
    'rulote și autorulote',
    'vehicule comerciale',
    'nautic',
  ],
  'moda-y-accesorios': [
    'moda-y-accesorios',
    'moda_y_accesorios',
    'moda',
    'haine',
    'imbracaminte',
    'îmbrăcăminte',
    'îmbrăcăminte și accesorii',
    'incaltaminte',
    'încălțăminte',
    'ropa',
    'accesorios',
    'genti',
    'ceasuri',
  ],
  inmobiliaria: [
    'inmobiliaria',
    'imobiliare',
    'real-estate',
    'apartamente',
    'case',
    'vile',
    'terenuri',
    'garaje',
    'chirie',
    'proprietati',
    'case și apartamente',
    'toate proprietățile',
  ],
  'tecnologia-y-electronica': [
    'tecnologia-y-electronica',
    'tecnologia_y_electronica',
    'tehnologie',
    'electronica',
    'electronică',
    'tehnologie și electronică',
    'tv',
    'audio',
    'foto',
    'fotografie',
  ],
  'moviles-y-telefonia': [
    'moviles-y-telefonia',
    'telefonia',
    'telefonie',
    'telefoane',
    'telefonos',
    'moviles',
    'smartphone',
    'iphone',
    'incarcatoare-cabluri',
    'huse-folii',
    'baterii-externe',
    'accesorii-telefoane',
  ],
  informatica: [
    'informatica',
    'informatică',
    'calculatoare',
    'laptop',
    'pc',
    'computadoras',
    'gaming',
    'monitoare',
  ],
  'deporte-y-ocio': [
    'deporte-y-ocio',
    'deporte_y_ocio',
    'sport',
    'sport și timp liber',
    'deportes',
    'fitness',
    'camping',
  ],
  bicicletas: [
    'bicicletas',
    'biciclete',
    'bici',
    'bicicleta',
    'bicicletă',
    'mtb',
    'ciclism',
  ],
  'consolas-y-videojuegos': [
    'consolas-y-videojuegos',
    'console',
    'jocuri',
    'console și jocuri video',
    'gaming',
    'videojuegos',
    'consolas',
    'ps5',
    'xbox',
    'nintendo',
  ],
  'hogar-y-jardin': [
    'hogar-y-jardin',
    'hogar_y_jardin',
    'mobila',
    'mobilă',
    'mobilă și uz casnic',
    'mobilă și articole de uz casnic',
    'gradina',
    'grădină',
    'casa',
    'hogar',
    'muebles',
  ],
  electrodomesticos: [
    'electrodomesticos',
    'electrocasnice',
    'electro',
  ],
  'cine-libros-y-musica': [
    'cine-libros-y-musica',
    'cine_libros_y_musica',
    'carti',
    'cărți',
    'cărți și reviste',
    'cărți, filme și reviste',
    'filme',
    'muzica',
    'muzică',
    'instrumente muzicale',
    'vinil',
    'libros',
  ],
  'ninos-y-bebes': [
    'ninos-y-bebes',
    'ninos_y_bebes',
    'copii',
    'totul pentru copii',
    'bebelusi',
    'bebeluși',
    'bebes',
  ],
  coleccionismo: [
    'coleccionismo',
    'colectie',
    'colecție',
    'obiecte de colecție',
    'antichitati',
    'antichități',
    'arta',
    'artă',
    'vintage',
  ],
  'construccion-y-reformas': [
    'construccion-y-reformas',
    'construccion_y_reformas',
    'bricolaj',
    'grădină și bricolaj',
    'constructii',
    'construcții',
    'scule',
    'reformas',
  ],
  'industria-y-agricultura': [
    'industria-y-agricultura',
    'industria_y_agricultura',
    'utilaje',
    'echipamente & utilaje',
    'agricultura',
    'agricultură',
    'tractoare',
    'industria',
  ],
  empleo: [
    'empleo',
    'locuri de munca',
    'locuri de muncă',
    'jobs',
    'munca',
    'muncă',
    'job',
    'lucru',
  ],
  servicios: [
    'servicios',
    'servicii',
    'servicii & meseriași',
    'meseriasi',
    'meseriași',
  ],
  animale: [
    'animale',
    'animale de companie',
    'gatos',
    'pisici',
    'pisica',
    'caini',
    'caine',
    'perros',
    'mascotas',
    'pets',
    'accesorii_animale',
    'otros',
    'altele',
  ],
  otros: [
    'otros',
    'altele',
    'animale',
    'accesorii_animale',
    'other',
  ],
};

// Quick lookup helpers
export const OFFICIAL_CATEGORIES_MAP: Record<string, OfficialCategory> = OFFICIAL_CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {} as Record<string, OfficialCategory>);

export function findCategoryByIdOrName(idOrName: string | null | undefined): OfficialCategory | undefined {
  if (!idOrName) return undefined;
  const clean = idOrName.trim().toLowerCase();

  // Direct match on id, name or spanishName
  const direct = OFFICIAL_CATEGORIES.find(
    (c) =>
      c.id.toLowerCase() === clean ||
      c.name.toLowerCase() === clean ||
      c.spanishName.toLowerCase() === clean
  );
  if (direct) return direct;

  // Synonyms match
  for (const [catId, syns] of Object.entries(CATEGORY_SYNONYMS)) {
    if (syns.includes(clean) || syns.some((s) => clean === s || clean.includes(s) || s.includes(clean))) {
      return OFFICIAL_CATEGORIES.find((c) => c.id === catId);
    }
  }

  return undefined;
}

// Backward compatibility interfaces
export interface TevindeCategory {
  id: string;
  name: string;
  iconName: string;
  image: string;
  subcategories: string[];
}

export const APP_CATEGORIES: TevindeCategory[] = [
  {
    id: 'Motoare',
    name: 'Motoare',
    iconName: 'Car',
    image: '/images/autos.png',
    subcategories: [
      'Autoturisme',
      'Motociclete',
      'Piese & Accesorii auto',
      'Ambarcațiuni & Nautic',
      'Rulote & Caravane',
      'Furgonete & Dube',
      'Mașini fără permis',
      'Mașini clasice & epocă',
    ],
  },
  {
    id: 'Piață',
    name: 'Piață',
    iconName: 'Tag',
    image: '/images/piata_animale.png',
    subcategories: [
      'Telefoane & Tablete',
      'Electronice & Electrocasnice',
      'Calculatoare & Laptopuri',
      'Modă & Accesorii',
      'Sport & Timp liber',
      'Casă & Grădină',
      'Animale de companie',
      'Mama și Copilul',
      'Jocuri & Console',
      'Cărți, Muzică & Filme',
    ],
  },
  {
    id: 'Imobiliare',
    name: 'Imobiliare',
    iconName: 'Building',
    image: '/images/imobiliare_apartamente.png',
    subcategories: [
      'Apartamente de vânzare',
      'Apartamente de închiriat',
      'Case & Vile de vânzare',
      'Case & Vile de închiriat',
      'Terenuri',
      'Spații comerciale & Birouri',
      'Garaje & Parcări',
      'Camere de închiriat',
    ],
  },
  {
    id: 'Lucru',
    name: 'Lucru',
    iconName: 'Briefcase',
    image: '/images/lucru_oferte.png',
    subcategories: [
      'Locuri de muncă',
      'Servicii & Meșteșugari',
      'Echipamente & Utilaje profesionale',
      'Cursuri & Meditații',
    ],
  },
];

export const TEVINDE_SUBCATEGORIES_MAP: Record<string, string[]> = {
  Motoare: [
    'Autoturisme',
    'Motociclete',
    'Piese & Accesorii auto',
    'Ambarcațiuni & Nautic',
    'Rulote & Caravane',
    'Furgonete & Dube',
    'Mașini fără permis',
    'Mașini clasice & epocă',
  ],
  Piață: [
    'Telefoane & Tablete',
    'Electronice & Electrocasnice',
    'Calculatoare & Laptopuri',
    'Modă & Accesorii',
    'Sport & Timp liber',
    'Casă & Grădină',
    'Animale de companie',
    'Mama și Copilul',
    'Jocuri & Console',
    'Cărți, Muzică & Filme',
  ],
  Imobiliare: [
    'Apartamente de vânzare',
    'Apartamente de închiriat',
    'Case & Vile de vânzare',
    'Case & Vile de închiriat',
    'Terenuri',
    'Spații comerciale & Birouri',
    'Garaje & Parcări',
    'Camere de închiriat',
  ],
  Lucru: [
    'Locuri de muncă',
    'Servicii & Meșteșugari',
    'Echipamente & Utilaje profesionale',
    'Cursuri & Meditații',
  ],
};

export const MOTOARE_SUBCATEGORIES = OFFICIAL_CATEGORIES[0].subcategories.map((sub, idx) => ({
  id: `c_${idx}`,
  name: sub,
  image: OFFICIAL_CATEGORIES[0].image,
  spanishName: sub,
}));

export const PIATA_SUBCATEGORIES = OFFICIAL_CATEGORIES[1].subcategories.map((sub, idx) => ({
  id: `p_${idx}`,
  name: sub,
  image: OFFICIAL_CATEGORIES[1].image,
}));

// Comprehensive Category matching function
export function isCategoryMatch(
  itemCategory: string | undefined,
  targetCategory: string | null,
  targetSubcategory?: string | null,
  itemSubcategory?: string | null,
  itemTitle?: string,
  itemDesc?: string
): boolean {
  // 1. Category check
  let categoryMatches = true;
  if (targetCategory && targetCategory !== 'all' && targetCategory !== 'Todos' && targetCategory !== 'Orice') {
    if (!itemCategory) {
      categoryMatches = false;
    } else {
      const cleanItem = itemCategory.trim().toLowerCase();
      const cleanTarget = targetCategory.trim().toLowerCase();
      const targetCat = findCategoryByIdOrName(targetCategory);
      const itemCatObj = findCategoryByIdOrName(itemCategory);

      if (cleanItem === cleanTarget) {
        categoryMatches = true;
      } else if (targetCat && itemCatObj) {
        categoryMatches = targetCat.id === itemCatObj.id;
      } else if (targetCat) {
        const syns = CATEGORY_SYNONYMS[targetCat.id] || [];
        categoryMatches =
          syns.some((s) => cleanItem === s || cleanItem.includes(s) || s.includes(cleanItem)) ||
          cleanItem.includes(targetCat.name.toLowerCase()) ||
          cleanItem.includes(targetCat.spanishName.toLowerCase()) ||
          cleanItem.includes(targetCat.id.toLowerCase());
      } else {
        categoryMatches = cleanItem.includes(cleanTarget) || cleanTarget.includes(cleanItem);
      }
    }
  }

  if (!categoryMatches) return false;

  // 2. Subcategory check (if a specific subcategory is selected)
  if (targetSubcategory && targetSubcategory !== 'Orice' && !targetSubcategory.startsWith('Toate')) {
    const cleanTargetSub = targetSubcategory.trim().toLowerCase();
    const cleanItemSub = (itemSubcategory || '').trim().toLowerCase();
    const cleanItemCat = (itemCategory || '').trim().toLowerCase();
    const cleanTitle = (itemTitle || '').toLowerCase();
    const cleanDesc = (itemDesc || '').toLowerCase();

    // Direct match with item's subcategory
    if (cleanItemSub) {
      if (
        cleanItemSub === cleanTargetSub ||
        cleanItemSub.includes(cleanTargetSub) ||
        cleanTargetSub.includes(cleanItemSub)
      ) {
        return true;
      }
    }

    // Direct match with item's category field if item was saved with subcategory as category
    if (
      cleanItemCat === cleanTargetSub ||
      cleanItemCat.includes(cleanTargetSub) ||
      cleanTargetSub.includes(cleanItemCat)
    ) {
      return true;
    }

    // Van / Dube keyword matching
    if (cleanTargetSub.includes('furgonete') || cleanTargetSub.includes('dube') || cleanTargetSub.includes('furgoneta')) {
      return (
        cleanTitle.includes('duba') ||
        cleanTitle.includes('dubi') ||
        cleanTitle.includes('furgonet') ||
        cleanTitle.includes('furgon') ||
        cleanTitle.includes('van') ||
        cleanTitle.includes('transporter') ||
        cleanTitle.includes('crafter') ||
        cleanTitle.includes('sprinter') ||
        cleanTitle.includes('ducato') ||
        cleanTitle.includes('boxer') ||
        cleanTitle.includes('master') ||
        cleanTitle.includes('transit') ||
        cleanTitle.includes('caddy') ||
        cleanTitle.includes('partner') ||
        cleanTitle.includes('berlingo') ||
        cleanTitle.includes('kangoo') ||
        cleanTitle.includes('vito')
      );
    }

    // Camper / Rulote
    if (cleanTargetSub.includes('rulote') || cleanTargetSub.includes('autorulote')) {
      return cleanTitle.includes('rulot') || cleanTitle.includes('camper') || cleanTitle.includes('autorulot');
    }

    // Camioane / Trucks
    if (cleanTargetSub.includes('camioane') || cleanTargetSub.includes('tir')) {
      return cleanTitle.includes('camion') || cleanTitle.includes('tir') || cleanTitle.includes('man') || cleanTitle.includes('scania') || cleanTitle.includes('actros') || cleanTitle.includes('iveco');
    }

    // Utilaje
    if (cleanTargetSub.includes('utilaje') || cleanTargetSub.includes('agricole')) {
      return cleanTitle.includes('tractor') || cleanTitle.includes('utilaj') || cleanTitle.includes('excavator') || cleanTitle.includes('buldo') || cleanTitle.includes('plug');
    }

    // Piese auto
    if (cleanTargetSub.includes('piese') || cleanTargetSub.includes('dezmembr')) {
      return cleanTitle.includes('piese') || cleanTitle.includes('dezmembr') || cleanTitle.includes('turbina') || cleanTitle.includes('injectoare') || cleanTitle.includes('cutie');
    }

    // Autoturisme rulate (second-hand) / Autoturisme noi
    if (cleanTargetSub.includes('autoturisme') || cleanTargetSub.includes('rulate') || cleanTargetSub.includes('second-hand')) {
      // It's a standard car if it's not a van, motorcycle or truck
      const isSpecial =
        cleanTitle.includes('duba') ||
        cleanTitle.includes('furgoneta') ||
        cleanTitle.includes('sprinter') ||
        cleanTitle.includes('transporter') ||
        cleanTitle.includes('crafter') ||
        cleanTitle.includes('camion') ||
        cleanTitle.includes('tractor');
      return !isSpecial;
    }

    // Default keyword matching for other subcategories
    const subWords = cleanTargetSub.split(/[\s,&/]+/).filter((w) => w.length > 2);
    if (subWords.length > 0 && subWords.some((w) => cleanTitle.includes(w) || cleanDesc.includes(w))) {
      return true;
    }

    return false;
  }

  return true;
}

