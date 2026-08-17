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
        <h2 className="text-[#0a192f] font-bold text-sm tracking-widest uppercase mb-6">Tendinte</h2>
        <div className="flex flex-wrap gap-3">
          {TENDINTE_ITEMS.map((item, idx) => (
            <a 
              key={idx} 
              href="#"
              className="bg-white border border-[#0a192f]/20 hover:bg-[#0a192f]/5 text-[#0a192f] text-sm py-2 px-4 rounded-full transition-colors whitespace-nowrap shadow-sm"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
