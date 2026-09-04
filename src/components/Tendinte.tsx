import React from 'react';

const TENDINTE_ITEMS = [
  "Telefoane", "Haine", "Iphone", "Adidasi", "Bmw", "Mașini", "Iphone 17", 
  "Telefon", "Scuter", "Mobila", "Trotinetă electrică", "Autoturisme", 
  "Laptop", "Telefoane samsung", "Atv", "Rochii", "Audi", "Bara fata", 
  "Auto", "Bicicleta"
];

export const Tendinte: React.FC = () => {
  return (
    <div className="pb-8">
      <div className="max-w-[1200px] mx-auto">
        <h2 className="text-[#0a192f] dark:text-slate-200 font-bold text-sm tracking-widest uppercase mb-6">Tendințe</h2>
        <div className="flex flex-wrap gap-3">
          {TENDINTE_ITEMS.map((item, idx) => (
            <a 
              key={idx} 
              href="#"
              className="bg-white dark:bg-[#262626] border border-[#0a192f]/20 dark:border-[#383838] hover:bg-[#0a192f]/5 dark:hover:bg-[#333333] text-[#0a192f] dark:text-slate-200 text-sm py-2 px-4 rounded-full transition-colors whitespace-nowrap shadow-sm"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
