'use client';

import React from 'react';
import Link from 'next/link';
import { PlusCircle, Heart, User, Search, Car } from 'lucide-react';

interface NavbarProps {
  favoriteCount: number;
  onResetSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ favoriteCount, onResetSearch }) => {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div
          className="logo-brand cursor-pointer flex items-center gap-2 select-none"
          onClick={() => {
            if (onResetSearch) onResetSearch();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          title="Monky Home"
        >
          <Car className="w-8 h-8 text-blue-600" size={28} />
          <span>Monky</span>
        </div>

        <div className="nav-actions">
          <button
            className="nav-btn-text"
            onClick={() => {
              const el = document.getElementById('listings-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Search size={18} />
            <span className="hidden sm:inline">Căutare</span>
          </button>

          <button className="nav-btn-text">
            <Heart size={18} />
            <span>Salvate</span>
            {favoriteCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-600 font-bold rounded-full">
                {favoriteCount}
              </span>
            )}
          </button>

          <button className="nav-btn-text">
            <User size={18} />
            <span>Contul meu</span>
          </button>

          <Link href="/adauga-anunt" className="nav-btn-primary flex items-center">
            <PlusCircle size={18} className="inline mr-1.5" />
            Adaugă Anunț
          </Link>
        </div>
      </div>
    </header>
  );
};

