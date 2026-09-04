export interface Listing {
  id: string;
  title: string;
  price: number;
  currency?: 'EUR' | 'RON';
  hasShipping: boolean;
  hasInspection?: boolean;
  isNegotiable?: boolean;
  isExchange?: boolean;
  location: string;
  photoCount: number;
  category: string;
  brand?: string;
  model?: string;
  phoneColor?: string;
  storageCapacity?: string;
  batteryHealth?: string;
  subType?: string;
  itemSize?: string;
  warranty?: string;
  image: string;
  gallery: string[];
  description: string;
  condition: string;
  createdAt: string;
  createdAtTime?: number;
  year?: string;
  mileage?: string;
  fuel?: string;
  transmission?: string;
  euroClass?: string;
  caroserie?: string;
  bodyType?: string;
  enginePower?: string;
  putere?: string;
  registrationStatus?: string;
  engineCapacity?: string;
  maxPower?: string;
  isPromoted?: boolean;
  seller: {
    name: string;
    rating: number;
    responseRate: string;
    verified: boolean;
    phone?: string;
    isDealer?: boolean;
    avatar?: string;
    avatarUrl?: string;
  };
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  image?: string;
}

export interface SuggestedSearch {
  id: string;
  title: string;
  tags: string[];
  image: string;
}

export const MOTO_BRANDS_MAP: Record<string, string[]> = {
  'Aprilia': ['RS 660', 'Tuono V4', 'RSV4', 'SX 125', 'SR GT', 'Tuareg 660'],
  'BMW': ['R 1250 GS', 'S 1000 RR', 'F 900 R', 'C 400 GT', 'G 310 R', 'R 1300 GS', 'M 1000 RR'],
  'Ducati': ['Panigale V4', 'Monster', 'Multistrada V4', 'Scrambler', 'Streetfighter V4', 'Diavel V4', 'Hypermotard 698'],
  'Harley-Davidson': ['Iron 883', 'Sportster S', 'Street Glide', 'Fat Boy', 'Pan America', 'Road Glide', 'Low Rider S'],
  'Honda': ['CBR600RR', 'CB650R', 'Africa Twin', 'SH150i', 'PCX125', 'Hornet', 'Transalp 750', 'CBR1000RR-R', 'X-ADV'],
  'KTM': ['390 Duke', '890 Duke', '1290 Super Adventure', 'RC 390', 'EXC 300', '990 Duke', '790 Duke'],
  'Kawasaki': ['Ninja 400', 'Z900', 'Ninja ZX-10R', 'Versys 650', 'Z650', 'Ninja ZX-6R', 'Z H2'],
  'Kymco': ['AK 550', 'Agility 125', 'Downtown 350', 'X-Town 300', 'CV3'],
  'MV Agusta': ['F3 800', 'Brutale 800', 'Dragster 800', 'Turismo Veloce', 'Superveloce 800'],
  'Moto Guzzi': ['V7', 'V85 TT', 'V9 Bobber', 'V100 Mandello'],
  'Peugeot': ['Metropolis 400', 'Tweet 125', 'Django 125', 'Pulsion 125'],
  'Piaggio': ['Beverly 400', 'Liberty 125', 'Medley 150', 'MP3 500', 'Zip 50'],
  'Suzuki': ['GSX-R1000', 'V-Strom 650', 'GSX-S750', 'Hayabusa', 'Burgman 400', 'GSX-8S', 'V-Strom 800DE'],
  'Triumph': ['Street Triple 765', 'Tiger 900', 'Speed Triple 1200', 'Bonneville T120', 'Trident 660', 'Scrambler 900'],
  'Yamaha': ['MT-07', 'MT-09', 'YZF-R1', 'TMAX 560', 'Ténéré 700', 'YZF-R6', 'MT-10', 'Tracer 9', 'XMAX 300'],
  'Vespa': ['GTS 300', 'Primavera 125', 'Sprint 50', 'Elettrica', 'GTV 300'],
  'CF Moto': ['450SR', '800MT', '650NK', '700CL-X', '300NK', '450NK', '700MT'],
  'Beta': ['RR 300', 'RR 200', 'Xtrainer 300', 'RR 4T 350', 'Evo 300'],
  'Benelli': ['TRK 502', 'Leoncino 500', 'BN 125', 'Imperiale 400', 'TRK 702'],
  'Can-Am': ['Spyder F3', 'Ryker 900', 'Maverick X3', 'Outlander 1000'],
  'Husqvarna': ['701 Supermoto', 'Svartpilen 401', 'Vitpilen 401', 'TE 300', 'Norden 901', 'FE 350'],
  'Royal Enfield': ['Himalayan 450', 'Continental GT 650', 'Interceptor 650', 'Meteor 350', 'Super Meteor 650', 'Hunter 350'],
  'Sym': ['Maxsym TL 508', 'Symphony 125', 'Jet X 125', 'Cruisym 300'],
  'AJP': ['PR7 650', 'PR4 240', 'SPR 250'],
  'Adiva': ['AD3 300', 'AD1 200'],
  'Aeon': ['3D 350', 'Urban 350'],
  'Alrendo': ['TS Bravo'],
  'Gas Gas': ['EC 300', 'SM 700', 'MC 250F', 'ES 700'],
  'Indian': ['Scout Bobber', 'FTR 1200', 'Chieftain', 'Challenger', 'Chief Dark Horse'],
  'Buell': ['XB12R', '1125R', 'Super SB2'],
  'Cagiva': ['Mito 125', 'Raptor 650', 'Elephant 900'],
  'Daelim': ['S3 125', 'Daystar 125'],
  'Derbi': ['Senda 50', 'GPR 125', 'Rambla 250'],
  'Fantic': ['Caballero 500', 'XEF 250', 'XE 125'],
  'Gilera': ['Runner 180', 'Nexus 500', 'GP 800'],
  'Hyosung': ['GT650R', 'Aquila 250', 'GD250N'],
  'Italjet': ['Dragster 125', 'Dragster 200'],
  'Keeway': ['RKF 125', 'Superlight 125', 'V302C'],
  'Laverda': ['Jota 1000', 'SFC 750'],
  'Malaguti': ['Drakon 125', 'Madison 300', 'XSM 50'],
  'Mash': ['Seventy 125', 'Five Hundred 400', 'X-Ride 650'],
  'Mondial': ['HPS 125', 'Piega 125'],
  'Moto Morini': ['X-Cape 650', 'Seiemmezzo 650', 'Corsaro 1200'],
  'Norton': ['Commando 961', 'V4SV'],
  'Niu': ['MQi GT', 'NQi GTS', 'RQi Sport'],
  'QJ Motor': ['SRK 400', 'SRT 800', 'SRV 300'],
  'Rieju': ['MR Pro 300', 'Marathon 125', 'Century 125'],
  'Sherco': ['SE 300 Factory', 'SM 500', 'SE-F 250'],
  'Super Soco': ['TC Max', 'CPx', 'TS Street Hunter'],
  'TM Racing': ['EN 300', 'SMR 450', 'MX 250'],
  'Voge': ['500DSX', '300AC', '900DSX', '525R'],
  'Zero Motorcycles': ['Zero SR/F', 'Zero FXS', 'Zero DSR/X'],
  'Zontes': ['350T', '310M', '125 U1'],
  'Alte mărci': ['Alt model / Custom'],
};

export const CAR_BRANDS_MAP: Record<string, string[]> = {
  'Abarth': ['500', '595', '695', '124 Spider', 'Pulse', 'Fastback', '500e'],
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Giulietta', 'Mito', '159', '147', '156', 'Brera', 'Spider', '4C', 'Milano'],
  'Audi': [
    'A1', 'A1 Sportback', 'A1 citycarver', 'A1 allstreet',
    'A2',
    'A3', 'A3 Sportback', 'A3 Sedan', 'A3 Cabriolet',
    'S3', 'S3 Sportback', 'S3 Sedan',
    'RS3', 'RS3 Sportback', 'RS3 Sedan',
    'A4', 'A4 Avant', 'A4 Allroad', 'A4 Sedan',
    'S4', 'S4 Avant', 'S4 Sedan',
    'RS4', 'RS4 Avant',
    'A5', 'A5 Sportback', 'A5 Coupé', 'A5 Cabriolet',
    'S5', 'S5 Sportback', 'S5 Coupé', 'S5 Cabriolet',
    'RS5', 'RS5 Sportback', 'RS5 Coupé',
    'A6', 'A6 Avant', 'A6 Allroad', 'A6 Sedan',
    'S6', 'S6 Avant', 'S6 Sedan',
    'RS6', 'RS6 Avant', 'RS6 Performance',
    'A7', 'A7 Sportback', 'S7', 'S7 Sportback', 'RS7', 'RS7 Sportback',
    'A8', 'A8 L', 'S8',
    'Q2', 'SQ2',
    'Q3', 'Q3 Sportback', 'RS Q3', 'RS Q3 Sportback',
    'Q4 e-tron', 'Q4 Sportback e-tron',
    'Q5', 'Q5 Sportback', 'SQ5', 'SQ5 Sportback',
    'Q7', 'SQ7',
    'Q8', 'SQ8', 'RS Q8', 'Q8 e-tron', 'Q8 Sportback e-tron',
    'TT', 'TT Coupé', 'TT Roadster', 'TTS', 'TT RS',
    'R8', 'R8 Coupé', 'R8 Spyder',
    'e-tron', 'e-tron GT', 'RS e-tron GT'
  ],
  'BMW': [
    '1 Series', '116i', '118i', '120d', 'M135i',
    '2 Series', '2 Series Gran Coupé', '2 Series Active Tourer', 'M2', 'M240i',
    '3 Series', '3 Series Touring', '320i', '320d', '330i', '330e', 'M3', 'M3 Touring',
    '4 Series', '4 Series Coupé', '4 Series Gran Coupé', '4 Series Cabriolet', 'M4',
    '5 Series', '5 Series Touring', '520d', '530d', '530e', 'M5',
    '6 Series', '6 Series GT', 'M6',
    '7 Series', '730d', '740i', 'i7',
    '8 Series', '8 Series Coupé', '8 Series Gran Coupé', 'M8',
    'X1', 'iX1', 'X2', 'iX2', 'X3', 'iX3', 'X3 M', 'X4', 'X4 M', 'X5', 'X5 M', 'X6', 'X6 M', 'X7', 'XM', 'Z4',
    'i3', 'i4', 'i7', 'iX'
  ],
  'Citroën': ['C1', 'C2', 'C3', 'C3 Aircross', 'C4', 'C4 X', 'C4 Cactus', 'C4 Picasso', 'Grand C4 Picasso', 'C5', 'C5 X', 'C5 Aircross', 'Berlingo', 'Ami', 'DS3', 'DS4', 'DS5', 'Jumpy', 'Jumper', 'SpaceTourer'],
  'Cupra': ['Formentor', 'Leon', 'Leon Sportstourer', 'Ateca', 'Born', 'Tavascan', 'Terramar'],
  'Dacia': ['Duster', 'Logan', 'Logan MCV', 'Sandero', 'Sandero Stepway', 'Jogger', 'Spring', 'Lodgy', 'Dokker', 'Solenza', 'SuperNova'],
  'DS Automobiles': ['DS 3', 'DS 3 Crossback', 'DS 4', 'DS 4 Crossback', 'DS 7', 'DS 7 Crossback', 'DS 9'],
  'Ferrari': ['488 GTB', '488 Spider', 'F8 Tributo', 'F8 Spider', 'Roma', 'Roma Spider', 'SF90 Stradale', 'SF90 Spider', 'Portofino', 'Portofino M', '296 GTB', '296 GTS', 'Purosangue', '812 Superfast', '812 GTS', '458 Italia', '458 Spider', 'California', 'California T', 'GTC4Lusso'],
  'Fiat': ['500', '500e', '500L', '500X', 'Panda', 'Panda Cross', 'Tipo', 'Tipo Station Wagon', 'Tipo Hatchback', 'Punto', 'Grande Punto', 'Punto Evo', 'Bravo', 'Doblo', 'Ducato', 'Fiorino', 'Qubo', 'Freemont', 'Sedici', 'Barchetta', 'Coupe', '600', '600e'],
  'Ford': ['Fiesta', 'Focus', 'Focus Turnier', 'Focus ST', 'Focus RS', 'Mondeo', 'Mondeo Turnier', 'Kuga', 'Puma', 'Puma ST', 'EcoSport', 'Mustang', 'Mustang Convertible', 'Mustang Mach-E', 'Ranger', 'Ranger Raptor', 'Transit', 'Transit Custom', 'Tourneo', 'Tourneo Custom', 'Edge', 'Explorer', 'Bronco', 'Galaxy', 'S-Max', 'Ka', 'Ka+'],
  'Honda': ['Civic', 'Civic Type R', 'CR-V', 'HR-V', 'Jazz', 'ZR-V', 'e:Ny1', 'Honda e', 'Accord', 'S2000', 'Prelude', 'NSX'],
  'Hyundai': ['i10', 'i20', 'i20 N', 'i30', 'i30 Fastback', 'i30 N', 'i30 Wagon', 'Tucson', 'Kona', 'Kona Electric', 'Kona N', 'Ioniq', 'Ioniq 5', 'Ioniq 5 N', 'Ioniq 6', 'Santa Fe', 'Bayon', 'Elantra', 'ix35', 'Veloster', 'Staria'],
  'Jaguar': ['F-Pace', 'E-Pace', 'XE', 'XF', 'XF Sportbrake', 'I-Pace', 'F-Type', 'F-Type Convertible', 'XJ', 'XK'],
  'Jeep': ['Wrangler', 'Wrangler Unlimited', 'Renegade', 'Compass', 'Avenger', 'Cherokee', 'Grand Cherokee', 'Gladiator', 'Patriot', 'Compass 4xe', 'Renegade 4xe'],
  'Kia': ['Picanto', 'Rio', 'Ceed', 'Ceed SW', 'ProCeed', 'XCeed', 'Sportage', 'Niro', 'Niro EV', 'Stonic', 'EV6', 'EV6 GT', 'EV9', 'Sorento', 'Stinger', 'Optima', 'Optima SW', 'Soul', 'e-Soul'],
  'Lancia': ['Ypsilon', 'Delta', 'Fulvia', 'Thesis', 'Musa', 'Phedra', 'KAPPA', 'Voyager', 'Flavia'],
  'Land Rover': ['Defender', 'Discovery', 'Discovery Sport', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar', 'Freelander'],
  'Lexus': ['NX', 'RX', 'UX', 'LBX', 'IS', 'ES', 'GS', 'LS', 'RC', 'RC F', 'LC', 'LC Convertible', 'RZ', 'CT 200h'],
  'Maserati': ['Ghibli', 'Levante', 'Grecale', 'GranTurismo', 'GranCabrio', 'MC20', 'MC20 Cielo', 'Quattroporte'],
  'Mazda': ['Mazda2', 'Mazda2 Hybrid', 'Mazda3', 'Mazda3 Sedan', 'Mazda6', 'Mazda6 Wagon', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'CX-80', 'MX-5', 'MX-5 RF', 'MX-30', 'RX-8', 'RX-7'],
  'Mercedes-Benz': [
    'A-Class', 'A-Class Sedan',
    'B-Class',
    'C-Class', 'C-Class Estate', 'C-Class Coupé', 'C-Class Cabriolet',
    'E-Class', 'E-Class Estate', 'E-Class Coupé', 'E-Class Cabriolet', 'E-Class All-Terrain',
    'S-Class', 'S-Class Coupé', 'Maybach S-Class',
    'CLA', 'CLA Shooting Brake',
    'CLS', 'CLS Shooting Brake',
    'GLA', 'GLB', 'GLC', 'GLC Coupé', 'GLE', 'GLE Coupé', 'GLS', 'G-Class',
    'SL', 'SLC', 'SLK', 'AMG GT', 'AMG GT 4-Door',
    'EQA', 'EQB', 'EQC', 'EQE', 'EQE SUV', 'EQS', 'EQS SUV',
    'V-Class', 'Vito', 'Sprinter', 'Citan'
  ],
  'Mini': ['Cooper', 'Cooper S', 'John Cooper Works', 'Countryman', 'Clubman', 'Paceman', 'Aceman', 'Cabrio', 'One'],
  'Mitsubishi': ['ASX', 'Eclipse Cross', 'Outlander', 'Space Star', 'L200', 'Lancer', 'Lancer Evolution', 'Pajero'],
  'Nissan': ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Ariya', 'Leaf', 'GT-R', '370Z', '350Z', 'Navara', 'Note', 'Pulsar', 'Patrol', 'NV200'],
  'Opel': ['Corsa', 'Corsa-e', 'Astra', 'Astra Sports Tourer', 'Mokka', 'Mokka-e', 'Grandland', 'Crossland', 'Insignia', 'Insignia Sports Tourer', 'Zafira', 'Zafira Life', 'Combo', 'Adam', 'Meriva', 'Vectra', 'Vivaro', 'Movano'],
  'Peugeot': ['108', '208', 'e-208', '308', '308 SW', 'e-308', '408', '508', '508 SW', '2008', 'e-2008', '3008', 'e-3008', '5008', 'e-5008', 'RCZ', 'Partner', 'Rifter', 'Expert', 'Traveler', 'Boxer', '206', '206 CC', '207', '207 CC', '207 SW', '307', '307 CC', '307 SW'],
  'Porsche': ['911', '911 Carrera', '911 Targa', '911 Turbo', '911 GT3', '718 Boxster', '718 Cayman', 'Macan', 'Macan Electric', 'Cayenne', 'Cayenne Coupé', 'Panamera', 'Panamera Sport Turismo', 'Taycan', 'Taycan Cross Turismo'],
  'Renault': ['Clio', 'Captur', 'Megane', 'Megane Grandtour', 'Megane E-Tech', 'Scenic', 'Grand Scenic', 'Austral', 'Espace', 'Rafale', 'Arkana', 'Zoe', 'Twingo', 'Kadjar', 'Talisman', 'Talisman S.W.', 'Kangoo', 'Master', 'Trafic', 'Laguna', 'Laguna Coupé'],
  'SEAT': ['Ibiza', 'Leon', 'Leon Sportstourer', 'Ateca', 'Arona', 'Tarraco', 'Alhambra', 'Mii', 'Toledo', 'Exeo'],
  'Skoda': ['Fabia', 'Fabia Combi', 'Kamiq', 'Scala', 'Octavia', 'Octavia Combi', 'Octavia RS', 'Superb', 'Superb Combi', 'Karoq', 'Kodiaq', 'Enyaq', 'Enyaq Coupé', 'Citigo', 'Yeti', 'Rapid', 'Roomster'],
  'Smart': ['Fortwo', 'Forfour', '#1', '#3', 'Roadster'],
  'Subaru': ['Outback', 'Forester', 'XV', 'Solterra', 'Impreza', 'WRX STI', 'BRZ', 'Levorg'],
  'Suzuki': ['Swift', 'Swift Sport', 'Vitara', 'Grand Vitara', 'S-Cross', 'Jimny', 'Ignis', 'Swace', 'Across', 'Splash', 'Alto', 'Baleno'],
  'Tesla': ['Model 3', 'Model 3 Performance', 'Model Y', 'Model Y Long Range', 'Model S', 'Model S Plaid', 'Model X', 'Cybertruck', 'Roadster'],
  'Toyota': ['Yaris', 'Yaris Cross', 'GR Yaris', 'Corolla', 'Corolla Touring Sports', 'Corolla Cross', 'C-HR', 'RAV4', 'Aygo', 'Aygo X', 'Camry', 'Prius', 'Supra', 'GR86', 'Land Cruiser', 'Hilux', 'Proace', 'Proace City', 'Auris', 'Auris Touring Sports', 'Avensis'],
  'Volkswagen': [
    'Polo', 'Polo GTI',
    'Golf', 'Golf Variant', 'Golf Alltrack', 'Golf GTI', 'Golf R',
    'Passat', 'Passat Variant', 'Passat Alltrack',
    'Arteon', 'Arteon Shooting Brake',
    'Jetta', 'Scirocco', 'Beetle',
    'Tiguan', 'Tiguan Allspace', 'Touareg',
    'T-Roc', 'T-Roc Cabriolet', 'T-Cross', 'Taigo',
    'ID.3', 'ID.4', 'ID.5', 'ID.7', 'ID. Buzz',
    'Caddy', 'Transporter', 'Multivan', 'Caravelle', 'California', 'Amarok', 'Up!'
  ],
  'Volvo': ['XC40', 'EX30', 'XC60', 'XC90', 'EX90', 'V40', 'V40 Cross Country', 'V60', 'V60 Cross Country', 'V90', 'V90 Cross Country', 'S60', 'S90', 'C40 Recharge', 'C30', 'C70'],
  'Alte mărci': ['Alt model / Custom'],
};

export const TOP_CAR_BRANDS_ORDER = [
  'Audi',
  'BMW',
  'Dacia',
  'Fiat',
  'Ford',
  'Mercedes-Benz',
  'Volkswagen',
  'Alfa Romeo',
  'Renault',
  'Peugeot',
  'Toyota',
  'Jeep',
  'Porsche',
];

export const TOP_MOTO_BRANDS_ORDER = [
  'Aprilia',
  'BMW',
  'Ducati',
  'Harley-Davidson',
  'Honda',
  'KTM',
  'Kawasaki',
  'Kymco',
  'MV Agusta',
  'Moto Guzzi',
  'Peugeot',
  'Piaggio',
  'Suzuki',
  'Triumph',
  'Yamaha',
  'Vespa',
];

export function getSortedBrands(
  brandMap: Record<string, string[]>,
  topBrandsOrder: string[]
): string[] {
  const allKeys = Object.keys(brandMap);
  const topFound = topBrandsOrder.filter((b) => allKeys.includes(b));
  const remaining = allKeys
    .filter((b) => !topBrandsOrder.includes(b) && b !== 'Alte mărci')
    .sort((a, b) => a.localeCompare(b));

  const result = [...topFound, ...remaining];
  if (allKeys.includes('Alte mărci')) {
    result.push('Alte mărci');
  }
  return result;
}

export const BRAND_MODELS_MAP: Record<string, string[]> = {
  ...CAR_BRANDS_MAP,
  ...MOTO_BRANDS_MAP,
  'M-Tech': ['Costum'],
  'Arlen Ness': ['Costum'],
  'Alpinestars': ['Pantaloni'],
  'Dainese': ['Vintage', 'Gore-Tex'],
  'Held': ['Geacă'],
  'Revit': ['Pantaloni'],
};

export const CATEGORIES: Category[] = [
  { id: 'car', name: 'Mașină', iconName: 'Car', image: '/coches.png' },
  { id: 'moto', name: 'Motociclete și scutere', iconName: 'Bike', image: '/motos.png' },
  { id: 'auto-acc', name: 'Piese & Accesorii auto', iconName: 'Disc', image: '/motor_y_accesorios.png' },
  { id: 'camper', name: 'Rulote și autorulote', iconName: 'Truck', image: '/images/caravanas.png' },
  { id: 'commercial', name: 'Vehicule comerciale', iconName: 'Bus', image: '/images/comerciales.png' },
  { id: 'nautical', name: 'Nautic & Ambarcațiuni', iconName: 'Anchor', image: '/images/barcos.png' },
];

export const SUGGESTED_SEARCHES: SuggestedSearch[] = [
  {
    id: 's1',
    title: 'KM 0',
    tags: ['euro 6', 'da 4 posti'],
    image: '/images/fiat_panda.png',
  },
  {
    id: 's2',
    title: 'Auto certificate',
    tags: ['fino a 70.000 km', 'dal 2021'],
    image: '/images/fiat_panda.png',
  },
  {
    id: 's3',
    title: 'Per i neopatentati',
    tags: ['fino a 10.000 €', 'dal 2015'],
    image: '/images/fiat_panda.png',
  },
  {
    id: 's4',
    title: 'SUV e fuoristrada',
    tags: ['fino a 100.000 km', 'fino a 30.000 €'],
    image: '/images/fiat_panda.png',
  },
  {
    id: 's5',
    title: 'Sportive',
    tags: ['da 150 cv', 'cambio manuale'],
    image: '/images/fiat_panda.png',
  },
];

export const MOCK_LISTINGS: Listing[] = [];


