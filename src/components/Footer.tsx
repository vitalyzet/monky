'use client';

import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Youtube, Linkedin, ArrowUp } from 'lucide-react';
import { MonkyLogo } from './MonkyLogo';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white dark:bg-[#181818] text-slate-900 dark:text-slate-200 pt-12 pb-10 px-6 mt-16 font-sans border-t border-slate-200/80 dark:border-[#2a2a2a] transition-colors relative">
      <div className="max-w-[1200px] mx-auto">
        {/* Top Logo */}
        <div className="mb-10 flex items-center justify-between">
          <Link href="/" className="inline-block">
            <MonkyLogo height={40} />
          </Link>

          {/* Scroll to top button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#252525] hover:bg-slate-200 dark:hover:bg-[#303030] text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all shadow-xs hover:scale-105"
            title="Înapoi sus"
          >
            <ArrowUp size={16} />
          </button>
        </div>

        {/* 6 Link Columns (Matching User Screenshot) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-8 mb-12">
          {/* Col 1: DESPRE TEVINDE */}
          <div>
            <h3 className="font-black mb-4 text-[12px] tracking-wider uppercase text-slate-900 dark:text-white">
              Despre Tevinde
            </h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Despre noi
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Prețuri
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Cariere
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Informații juridice
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: PENTRU EXPERȚI */}
          <div>
            <h3 className="font-black mb-4 text-[12px] tracking-wider uppercase text-slate-900 dark:text-white">
              Pentru Experți
            </h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Publicitate
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Ghid vânzare
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: INSTRUMENTE UTILE */}
          <div>
            <h3 className="font-black mb-4 text-[12px] tracking-wider uppercase text-slate-900 dark:text-white">
              Instrumente Utile
            </h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Index cartiere
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Articole utile
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: PLATFORME */}
          <div>
            <h3 className="font-black mb-4 text-[12px] tracking-wider uppercase text-slate-900 dark:text-white">
              Platforme
            </h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="/" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Tevinde.ro
                </Link>
              </li>
              <li>
                <Link href="/cautare?category=coches" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Autoturisme
                </Link>
              </li>
              <li>
                <Link href="/cautare?category=inmobiliaria" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Imobiliare
                </Link>
              </li>
              <li>
                <Link href="/cautare?category=servicios" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Servicii
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: HARTĂ SITE */}
          <div>
            <h3 className="font-black mb-4 text-[12px] tracking-wider uppercase text-slate-900 dark:text-white">
              Hartă Site
            </h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Hartă site
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Localități
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 6: CONTACT */}
          <div>
            <h3 className="font-black mb-4 text-[12px] tracking-wider uppercase text-slate-900 dark:text-white">
              Contact
            </h3>
            <ul className="space-y-2.5 text-[13.5px]">
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Asistență
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Ajutor
                </Link>
              </li>
              <li>
                <Link href="#" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  DSA
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Full-width Divider Line */}
        <div className="w-full border-t border-slate-200 dark:border-[#2a2a2a] my-8" />

        {/* Middle Bar: Social & Mobile Apps (Exact Design from Screenshot) */}
        <div className="py-2 mb-8 flex flex-wrap items-center justify-center lg:justify-between gap-6">
          {/* Left: URMĂREȘTE-NE PE */}
          <div className="flex items-center gap-3.5">
            <span className="text-[12px] sm:text-[13px] font-black tracking-wider uppercase text-slate-900 dark:text-white select-none">
              Urmărește-ne pe:
            </span>
            <div className="flex items-center gap-2.5 text-white">
              {/* Facebook */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-black dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
                title="Facebook"
              >
                <Facebook size={14} className="fill-current stroke-none text-white" />
              </a>
              {/* YouTube */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-black dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
                title="YouTube"
              >
                <Youtube size={14} className="fill-current stroke-none text-white" />
              </a>
              {/* Instagram */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-black dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
                title="Instagram"
              >
                <Instagram size={14} className="text-white" />
              </a>
              {/* TikTok */}
              <a
                href="#"
                className="w-7 h-7 rounded-full bg-black dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
                title="TikTok"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.27 6.27 0 0 0 1.89-4.49V8.78a8.28 8.28 0 0 0 4.84 1.55v-3.5a4.84 4.84 0 0 1-.96-.14Z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="#"
                className="w-7 h-7 rounded-md bg-black dark:bg-slate-800 flex items-center justify-center hover:opacity-80 transition-opacity"
                title="LinkedIn"
              >
                <Linkedin size={13} className="fill-current stroke-none text-white" />
              </a>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden lg:block h-6 w-[1px] bg-slate-300 dark:bg-slate-700 mx-2" />

          {/* Right: APLICAȚII MOBILE */}
          <div className="flex items-center gap-3.5">
            <span className="text-[12px] sm:text-[13px] font-black tracking-wider uppercase text-slate-900 dark:text-white select-none">
              Aplicații mobile:
            </span>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:opacity-85 transition-opacity inline-block">
                <img src="/app_store.svg" alt="Download on the App Store" className="h-[38px] w-auto" />
              </a>
              <a href="#" className="hover:opacity-85 transition-opacity inline-block">
                <img src="/google_play.svg" alt="Get it on Google Play" className="h-[38px] w-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Full-width Divider Line */}
        <div className="w-full border-t border-slate-200 dark:border-[#2a2a2a] my-6" />

        {/* Bottom Copyright & Legal Links (Matching Screenshot) */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs text-slate-500 dark:text-slate-400">
          <span>© 2026 Tevinde.ro</span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <Link href="#" className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide hover:underline">
            Condiții de utilizare
          </Link>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <Link href="#" className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide hover:underline">
            Politica de confidențialitate
          </Link>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
          <Link href="#" className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide hover:underline">
            Setări cookies
          </Link>
        </div>
      </div>
    </footer>
  );
};
