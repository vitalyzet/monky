'use client';

import React from 'react';
import { ArrowRight, ArrowUp, Facebook, Instagram } from 'lucide-react';
import { Tendinte } from './Tendinte';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#f0f2f5] text-[#0a192f] pt-16 pb-8 px-6 mt-16 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* CONTACT */}
          <div>
            <h3 className="font-bold mb-6 text-sm tracking-widest uppercase text-[#0a192f]">Contact</h3>
            <div className="space-y-4 text-[15px]">
              <div>
                <span className="block mb-1 text-[#0a192f]/80">E-mail:</span>
                <a href="mailto:contact@pinpin.ro" className="font-semibold text-[#0a192f] underline decoration-[#0a192f]/40 hover:decoration-[#0a192f] underline-offset-4">contact@pinpin.ro</a>
              </div>
              <div>
                <span className="block mb-1 text-[#0a192f]/80">Instagram:</span>
                <a href="#" className="font-semibold text-[#0a192f] underline decoration-[#0a192f]/40 hover:decoration-[#0a192f] underline-offset-4">@pinpin.ro</a>
              </div>
              <div>
                <span className="block mb-1 text-[#0a192f]/80">Facebook:</span>
                <a href="#" className="font-semibold text-[#0a192f] underline decoration-[#0a192f]/40 hover:decoration-[#0a192f] underline-offset-4">@pinpin.ro</a>
              </div>
              <div>
                <span className="block mb-1 text-[#0a192f]/80">Telefon:</span>
                <a href="tel:+40743565030" className="font-semibold text-[#0a192f] underline decoration-[#0a192f]/40 hover:decoration-[#0a192f] underline-offset-4">+40 743 565 030</a>
              </div>
            </div>
          </div>

          {/* AJUTOR */}
          <div>
            <h3 className="font-bold mb-6 text-sm tracking-widest uppercase text-[#0a192f]">Ajutor</h3>
            <div className="space-y-4 text-[15px] flex flex-col">
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Politica de confidențialitate</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Politica de retur</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Termeni și condiții</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">A.N.P.C.</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">A.N.P.C. - SAL</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">A.N.P.C. Reclamații</a>
            </div>
          </div>

          {/* UTILE */}
          <div>
            <h3 className="font-bold mb-6 text-sm tracking-widest uppercase text-[#0a192f]">Utile</h3>
            <div className="space-y-4 text-[15px] flex flex-col">
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Contact</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Întrebări frecvente</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Livrare</a>
              <a href="#" className="text-[#0a192f] hover:font-semibold transition-all">Retur</a>
            </div>
          </div>

          {/* REDUCERI PERIODICE */}
          <div>
            <h3 className="font-bold mb-6 text-sm tracking-widest uppercase text-[#0a192f]">Reduceri periodice</h3>
            <div className="relative mb-4">
              <input 
                type="email" 
                placeholder="Introdu adresa ta de e-mail" 
                className="w-full bg-white border border-[#0a192f]/20 placeholder-[#0a192f]/50 text-sm py-3 px-4 rounded focus:outline-none focus:ring-1 focus:ring-[#0a192f]/40 transition-all text-[#0a192f]"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0a192f] hover:scale-110 transition-transform">
                <ArrowRight size={18} />
              </button>
            </div>
            <p className="text-sm leading-relaxed mb-8 text-[#0a192f]/90">
              Abonează-te pentru a beneficia de promoții exclusive și multe altele!
            </p>
            
            <h3 className="font-bold mb-4 text-sm tracking-widest uppercase text-[#0a192f]">Urmărește-ne</h3>
            <div className="flex gap-4 text-[#0a192f]">
              <a href="#" className="hover:scale-110 transition-transform"><Facebook size={22} strokeWidth={1.5} /></a>
              <a href="#" className="hover:scale-110 transition-transform"><Instagram size={22} strokeWidth={1.5} /></a>
              <a href="#" className="hover:scale-110 transition-transform">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 2v14.5A4.5 4.5 0 1 1 10.5 12"/>
                  <path d="M15 6.5A5.5 5.5 0 0 0 20.5 12"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        <Tendinte />

        {/* BOTTOM SECTION */}
        <div className="pt-6 border-t border-[#0a192f]/10 flex flex-col md:flex-row justify-between items-center gap-6 relative">
          <div className="text-sm text-[#0a192f]/80">
            © 2026, PinPin. Toate drepturile rezervate.
          </div>
          
          <div className="flex flex-wrap gap-2 md:mr-14 justify-center">
            <span className="bg-white px-2 py-1.5 text-[10px] font-bold rounded shadow-sm text-blue-600 tracking-wider border border-[#0a192f]/5">AMEX</span>
            <span className="bg-white px-2 py-1.5 text-[10px] font-bold rounded shadow-sm text-black tracking-wider border border-[#0a192f]/5">Apple Pay</span>
            <span className="bg-white px-2 py-1.5 text-[10px] font-bold rounded shadow-sm text-orange-500 tracking-wider border border-[#0a192f]/5">Discover</span>
            <span className="bg-white px-2 py-1.5 text-[10px] font-bold rounded shadow-sm text-gray-700 tracking-wider border border-[#0a192f]/5">G Pay</span>
            <span className="bg-white px-2 py-1.5 text-[10px] font-bold rounded shadow-sm text-red-600 tracking-wider border border-[#0a192f]/5">Mastercard</span>
            <span className="bg-white px-2 py-1.5 text-[10px] font-bold rounded shadow-sm text-blue-800 tracking-wider border border-[#0a192f]/5">VISA</span>
          </div>

          <button 
            onClick={scrollToTop}
            className="md:absolute right-0 top-1/2 md:-translate-y-1/2 bg-[#0a192f] text-white p-3.5 rounded-full shadow-md hover:shadow-lg transition-all hover:-translate-y-[calc(50%+2px)]"
            aria-label="Volver arriba"
          >
            <ArrowUp size={20} strokeWidth={2} />
          </button>
        </div>
      </div>
    </footer>
  );
};
