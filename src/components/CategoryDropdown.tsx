'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Car,
  Bike,
  Disc,
  Shield,
  Truck,
  Bus,
  Anchor,
  Layers,
  ChevronDown,
  Laptop,
  Smartphone,
  Tv,
  Home,
  Building,
  Bed,
  TreePine,
  Warehouse,
  Building2,
  Palmtree,
  Store,
  Briefcase,
  Megaphone,
  Wrench,
  Search,
  LayoutGrid,
  Shirt,
  Dumbbell,
  Gamepad2,
  Armchair,
  Refrigerator,
  BookOpen,
  Baby,
  Award,
  Tractor,
  Settings,
  MoreHorizontal,
} from 'lucide-react';
import { OFFICIAL_CATEGORIES, findCategoryByIdOrName } from '@/data/categories';

export interface CategoryOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export function getOfficialCategoryIcon(iconName: string, size = 18): React.ReactNode {
  switch (iconName) {
    case 'Car': return <Car size={size} className="text-[#03c1a2]" />;
    case 'Bike': return <Bike size={size} className="text-[#03c1a2]" />;
    case 'Disc': return <Disc size={size} className="text-[#03c1a2]" />;
    case 'Shirt': return <Shirt size={size} className="text-[#03c1a2]" />;
    case 'Home': return <Home size={size} className="text-[#03c1a2]" />;
    case 'Tv': return <Tv size={size} className="text-[#03c1a2]" />;
    case 'Smartphone': return <Smartphone size={size} className="text-[#03c1a2]" />;
    case 'Laptop': return <Laptop size={size} className="text-[#03c1a2]" />;
    case 'Dumbbell': return <Dumbbell size={size} className="text-[#03c1a2]" />;
    case 'Gamepad2': return <Gamepad2 size={size} className="text-[#03c1a2]" />;
    case 'Armchair': return <Armchair size={size} className="text-[#03c1a2]" />;
    case 'Refrigerator': return <Refrigerator size={size} className="text-[#03c1a2]" />;
    case 'BookOpen': return <BookOpen size={size} className="text-[#03c1a2]" />;
    case 'Baby': return <Baby size={size} className="text-[#03c1a2]" />;
    case 'Award': return <Award size={size} className="text-[#03c1a2]" />;
    case 'Wrench': return <Wrench size={size} className="text-[#03c1a2]" />;
    case 'Tractor': return <Tractor size={size} className="text-[#03c1a2]" />;
    case 'Briefcase': return <Briefcase size={size} className="text-[#03c1a2]" />;
    case 'Settings': return <Settings size={size} className="text-[#03c1a2]" />;
    case 'MoreHorizontal': return <MoreHorizontal size={size} className="text-[#03c1a2]" />;
    default: return <LayoutGrid size={size} className="text-[#03c1a2]" />;
  }
}

export function getCategoryOptions(): CategoryOption[] {
  return [
    {
      id: 'Orice',
      name: 'Toate categoriile...',
      icon: <LayoutGrid size={18} className="text-[#03c1a2]" />,
    },
    ...OFFICIAL_CATEGORIES.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: getOfficialCategoryIcon(cat.iconName),
    })),
  ];
}

export function getSubcategoryOptions(catIdOrName: string): CategoryOption[] {
  const cat = findCategoryByIdOrName(catIdOrName);
  if (!cat) return getCategoryOptions();

  return [
    {
      id: 'Orice',
      name: `Toate din ${cat.name}`,
      icon: <LayoutGrid size={18} className="text-[#03c1a2]" />,
    },
    ...cat.subcategories.filter((s) => !s.startsWith('Toate')).map((sub) => ({
      id: sub,
      name: sub,
      icon: getOfficialCategoryIcon(cat.iconName),
    })),
  ];
}

export const MOTOARE_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'Orice',
    name: 'Alege categoria...',
    icon: <LayoutGrid size={18} className="text-indigo-600 dark:text-indigo-400 font-bold" />,
  },
  {
    id: 'Mașină',
    name: 'Mașină',
    icon: <Car size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Motociclete și scutere',
    name: 'Motocicletă',
    icon: <Bike size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Accesorii auto',
    name: 'Accesorii auto',
    icon: <Disc size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Accesorii pentru motociclete',
    name: 'Accesorii motocicletă',
    icon: <Shield size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Rulote și rulote',
    name: 'Rulote și autorulote',
    icon: <Truck size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Vehicule comerciale',
    name: 'Vehicule comerciale',
    icon: <Bus size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Nautic',
    name: 'Nautic',
    icon: <Anchor size={20} className="text-slate-400 dark:text-slate-400" />,
  },
];

export const PIATA_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'Orice',
    name: 'Alege categoria...',
    icon: <LayoutGrid size={18} className="text-indigo-600 dark:text-indigo-400 font-bold" />,
  },
  {
    id: 'Tehnologie și electronică',
    name: 'Tehnologie și electronică',
    icon: <Laptop size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Telefonie',
    name: 'Telefonie',
    icon: <Smartphone size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Încărcătoare & Cabluri',
    name: 'Încărcătoare & Cabluri',
    icon: <Smartphone size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Electrocasnice',
    name: 'Electrocasnice',
    icon: <Tv size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Audio/Video',
    name: 'Audio / Video',
    icon: <Tv size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Informatică',
    name: 'Informatică',
    icon: <Laptop size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Console și jocuri video',
    name: 'Console & Jocuri video',
    icon: <Tv size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Biciclete',
    name: 'Biciclete',
    icon: <Bike size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Mobilă și articole de uz casnic',
    name: 'Mobilă și uz casnic',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Grădină și bricolaj',
    name: 'Grădină și bricolaj',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Obiecte de colecție',
    name: 'Obiecte de colecție',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Sport',
    name: 'Sport',
    icon: <Bike size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Animale',
    name: 'Animale',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Îmbrăcăminte și accesorii',
    name: 'Îmbrăcăminte și accesorii',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Totul pentru copii',
    name: 'Totul pentru copii',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Fotografie',
    name: 'Fotografie',
    icon: <Laptop size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Instrumente muzicale',
    name: 'Instrumente muzicale',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Cărți și reviste',
    name: 'Cărți și reviste',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Accesorii pentru animale de companie',
    name: 'Accesorii animale',
    icon: <Layers size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Muzică și film',
    name: 'Muzică și film',
    icon: <Disc size={20} className="text-slate-400 dark:text-slate-400" />,
  },
];

export const IMOBILIARE_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'Orice',
    name: 'Todo tipo de bienes raíces',
    icon: <Home size={20} className="text-purple-500 font-bold" />,
  },
  {
    id: 'Apartamente',
    name: 'Apartamentos',
    icon: <Building size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Habitaciones/Camas',
    name: 'Habitaciones/Camas',
    icon: <Bed size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Casas unifamiliares y adosadas',
    name: 'Casas unifamiliares y adosadas',
    icon: <Home size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Terreno y edificios rústicos',
    name: 'Terreno y edificios rústicos',
    icon: <TreePine size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Garajes y cajas',
    name: 'Garajes y cajas',
    icon: <Warehouse size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Áticos, buhardillas y más',
    name: 'Áticos, buhardillas y más',
    icon: <Building2 size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Casas de vacaciones',
    name: 'Casas de vacaciones',
    icon: <Palmtree size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Oficinas y locales comerciales',
    name: 'Oficinas y locales comerciales',
    icon: <Store size={20} className="text-slate-400 dark:text-slate-400" />,
  },
];

export const LUCRU_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    id: 'Orice',
    name: 'Todo el trabajo',
    icon: <Briefcase size={20} className="text-teal-500 font-bold" />,
  },
  {
    id: 'Oferte de muncă',
    name: 'Ofertas de empleo',
    icon: <Megaphone size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Servicii',
    name: 'Servicios',
    icon: <Wrench size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Candidați & CV-uri',
    name: 'Buscadores de empleo',
    icon: <Search size={20} className="text-slate-400 dark:text-slate-400" />,
  },
  {
    id: 'Echipamente de lucru',
    name: 'Equipos de trabajo',
    icon: <Truck size={20} className="text-slate-400 dark:text-slate-400" />,
  },
];

export const CATEGORY_OPTIONS_LIST: CategoryOption[] = [
  ...MOTOARE_CATEGORY_OPTIONS,
  ...PIATA_CATEGORY_OPTIONS.filter((opt) => opt.id !== 'Orice'),
  ...IMOBILIARE_CATEGORY_OPTIONS.filter((opt) => opt.id !== 'Orice'),
  ...LUCRU_CATEGORY_OPTIONS.filter((opt) => opt.id !== 'Orice'),
];

interface CategoryDropdownProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  optionsList?: CategoryOption[];
}

export const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  label = 'Categoria',
  placeholder = 'Selectează categoria',
  className = '',
  optionsList = MOTOARE_CATEGORY_OPTIONS,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption =
    optionsList.find((opt) => opt.id === value) ||
    optionsList[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`filter-group relative ${isOpen ? 'z-50' : 'z-20'} ${className}`} ref={dropdownRef}>
      {label && <label className="filter-label">{label}</label>}

      {/* Main Selected Pill Button matching user screenshot */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-[46px] px-3.5 rounded-2xl border border-slate-200/90 dark:border-[#383838] bg-white dark:bg-[#252525] flex items-center justify-between gap-3 text-slate-800 dark:text-slate-100 hover:border-[#03c1a2] dark:hover:border-[#03c1a2] focus:outline-none focus:ring-2 focus:ring-[#03c1a2]/25 transition-all text-left shadow-xs cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 text-slate-400 dark:text-slate-300">
            {selectedOption.icon}
          </span>
          <span className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">
            {selectedOption.name}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Floating Dropdown Overlay matching user screenshot */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-[105%] z-[999] bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#383838] rounded-3xl shadow-2xl max-h-[275px] overflow-y-auto p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
          {optionsList.map((option) => {
            const isSelected = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm transition-colors text-left ${
                  isSelected
                    ? 'bg-[#03c1a2]/10 dark:bg-[#03c1a2]/20 font-bold text-[#03c1a2] dark:text-[#03c1a2]'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#2d2d2d]'
                }`}
              >
                <span className={`flex-shrink-0 ${isSelected ? 'text-[#03c1a2]' : 'text-slate-400 dark:text-slate-300'}`}>
                  {option.icon}
                </span>
                <span className="truncate">{option.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
