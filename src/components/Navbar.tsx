'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PlusCircle, Heart, User, Search, Car, LogOut, Sun, Moon, Package, X, Shield, ChevronDown, Check } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { MonkyLogo } from './MonkyLogo';
import { formatPublicName } from '@/lib/stringUtils';
import { FavoritesDrawer } from './FavoritesDrawer';

interface NavbarProps {
  favoriteCount: number;
  onResetSearch?: () => void;
  // Compact search bar props
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  activeTab?: string;
  selectedType?: string;
  setSelectedType?: (type: string) => void;
  locationInput?: string;
  setLocationInput?: (loc: string) => void;
  showCompactSearch?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  favoriteCount,
  onResetSearch,
  searchQuery = '',
  setSearchQuery,
  activeTab = 'Motoare',
  selectedType = 'Orice',
  setSelectedType,
  locationInput = 'Toată România',
  setLocationInput,
  showCompactSearch = false,
}) => {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [favCount, setFavCount] = React.useState<number>(favoriteCount || 0);
  const [lang, setLang] = React.useState<'RO' | 'EN' | 'ES'>('RO');
  const [langOpen, setLangOpen] = React.useState<boolean>(false);
  const [scrolled, setScrolled] = React.useState<boolean>(false);
  const [navUserAvatar, setNavUserAvatar] = React.useState<string | null>(null);
  const [navUserName, setNavUserName] = React.useState<string>('');
  const [isFavoritesOpen, setIsFavoritesOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const updateFavs = () => {
      try {
        const savedFavs = localStorage.getItem('monky_favorites');
        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          setFavCount(parsed.length);
        } else {
          setFavCount(0);
        }
      } catch (e) {}
    };

    const handleOpenFavorites = () => setIsFavoritesOpen(true);
    window.addEventListener('storage', updateFavs);
    window.addEventListener('monky_open_favorites', handleOpenFavorites);
    return () => {
      window.removeEventListener('storage', updateFavs);
      window.removeEventListener('monky_open_favorites', handleOpenFavorites);
    };
  }, []);

  React.useEffect(() => {
    const syncUserInfo = () => {
      if (typeof window !== 'undefined') {
        const localAvatar = localStorage.getItem('monky_user_avatar');
        const localName = localStorage.getItem('monky_user_name');
        setNavUserAvatar(localAvatar || currentUser?.photoURL || null);
        setNavUserName(localName || currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
      } else {
        setNavUserAvatar(currentUser?.photoURL || null);
        setNavUserName(currentUser?.displayName || currentUser?.email?.split('@')[0] || '');
      }
    };

    syncUserInfo();
    window.addEventListener('storage', syncUserInfo);
    window.addEventListener('monky_avatar_updated', syncUserInfo);
    return () => {
      window.removeEventListener('storage', syncUserInfo);
      window.removeEventListener('monky_avatar_updated', syncUserInfo);
    };
  }, [currentUser]);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSearchVisible = showCompactSearch || scrolled;

  React.useEffect(() => {
    if (favoriteCount !== undefined && favoriteCount > 0) {
      setFavCount(favoriteCount);
    } else {
      try {
        const savedFavs = localStorage.getItem('monky_favorites');
        if (savedFavs) {
          const parsed = JSON.parse(savedFavs);
          setFavCount(parsed.length);
        }
      } catch (e) {}
    }
  }, [favoriteCount]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (activeTab) params.set('tab', activeTab);
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    if (selectedType && selectedType !== 'Orice') params.set('type', selectedType);
    if (locationInput.trim() && locationInput !== 'Toată România') params.set('loc', locationInput.trim());

    router.push(`/cautare?${params.toString()}`);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <Link
          href="/"
          className="cursor-pointer select-none group flex-shrink-0"
          onClick={() => {
            if (onResetSearch) onResetSearch();
          }}
          title="Tevinde.ro Home"
        >
          <div className="block sm:hidden">
            <MonkyLogo height={36} />
          </div>
          <div className="hidden sm:block">
            <MonkyLogo height={44} />
          </div>
        </Link>

        {/* Inline Compact Search Input inside Navbar when scrolled */}
        {isSearchVisible && (
          <div className="flex-1 max-w-md mx-2 sm:mx-4 relative flex items-center animate-in fade-in duration-300">
            <Search className="absolute left-3 text-slate-400 flex-shrink-0" size={14} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearchSubmit();
              }}
              placeholder="Căutare..."
              className="w-full pl-[34px] pr-7 py-1.5 text-xs sm:text-sm bg-slate-100 dark:bg-[#161f28] border border-slate-200/90 dark:border-[#2d3b49] rounded-full text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-[#03c1a2] transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery?.('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {/* Nav Actions */}
        <div className="nav-actions flex items-center gap-1.5 sm:gap-3">
          {/* Language Selector Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-300/80 dark:border-slate-700/80 bg-slate-100/80 dark:bg-[#1e2732] hover:bg-slate-200 dark:hover:bg-[#283443] text-slate-800 dark:text-slate-100 text-xs font-bold transition-all shadow-2xs"
              title="Schimbă Limba / Change Language"
            >
              <span className="text-sm leading-none">{lang === 'RO' ? '🇷🇴' : lang === 'EN' ? '🇬🇧' : '🇪🇸'}</span>
              <span className="font-extrabold tracking-wide text-xs">{lang}</span>
              <ChevronDown size={13} className={`text-slate-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#1e2732] border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-1 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => { setLang('RO'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${lang === 'RO' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="flex items-center gap-2"><span>🇷🇴</span> Română</span>
                  {lang === 'RO' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setLang('EN'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${lang === 'EN' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="flex items-center gap-2"><span>🇬🇧</span> English</span>
                  {lang === 'EN' && <Check size={12} />}
                </button>
                <button
                  onClick={() => { setLang('ES'); setLangOpen(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs font-bold rounded-lg flex items-center justify-between transition-colors ${lang === 'ES' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <span className="flex items-center gap-2"><span>🇪🇸</span> Español</span>
                  {lang === 'ES' && <Check size={12} />}
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher Button */}
          {!isSearchVisible && (
            <button
              onClick={toggleTheme}
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#283443] transition-colors flex items-center gap-1.5"
              title={theme === 'dark' ? 'Comută pe modul Luminos' : 'Comută pe modul Întunecat'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={18} className="text-amber-400" />
                  <span className="hidden md:inline text-xs text-amber-300 font-medium">Luminos</span>
                </>
              ) : (
                <>
                  <Moon size={18} className="text-slate-600" />
                  <span className="hidden md:inline text-xs text-slate-600 font-medium">Întunecat</span>
                </>
              )}
            </button>
          )}

          {/* Search Button (Hidden when compact search is visible) */}
          {!isSearchVisible && (
            <button
              className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#283443] transition-colors flex items-center gap-1.5"
              onClick={() => {
                const el = document.getElementById('listings-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  router.push('/cautare');
                }
              }}
              title="Căutare"
            >
              <Search size={18} />
              <span className="hidden sm:inline text-xs font-semibold">Căutare</span>
            </button>
          )}

          {/* Desktop-only: Salvate Button (Handled by BottomNav on mobile) */}
          <button
            type="button"
            onClick={() => setIsFavoritesOpen(true)}
            className="cursor-pointer relative hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#283443] transition-colors text-xs font-bold"
            title="Vezi anunțurile salvate"
          >
            <Heart size={18} className={favCount > 0 ? "fill-rose-500 text-rose-500" : ""} />
            <span>Salvate</span>
            {favCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 font-black rounded-full">
                {favCount}
              </span>
            )}
          </button>

          {/* Desktop-only: User Account Menu (Handled by BottomNav on mobile) */}
          {currentUser ? (
            <div className="relative group hidden md:block">
              <Link href="/contul-meu" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#283443] transition-colors text-xs font-bold">
                {navUserAvatar ? (
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-[#bbf0dc] dark:border-emerald-500/40 bg-slate-100 dark:bg-[#1a1a1a] flex-shrink-0 flex items-center justify-center">
                    <img
                      src={navUserAvatar}
                      alt="User"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                      }}
                    />
                  </div>
                ) : (
                  <User size={18} />
                )}
                <span className="max-w-[110px] truncate font-semibold" title={currentUser.email || ''}>
                  {formatPublicName(navUserName || currentUser.displayName || currentUser.email?.split('@')[0])}
                </span>
              </Link>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#333333] rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 p-1">
                <Link
                  href="/contul-meu"
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] flex items-center gap-2 rounded-lg font-medium transition-colors"
                >
                  <User size={16} />
                  Contul meu
                </Link>
                <Link
                  href="/anunturile-mele"
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] flex items-center gap-2 rounded-lg font-medium transition-colors"
                >
                  <Package size={16} />
                  Anunțurile mele
                </Link>
                <Link
                  href="/admin"
                  className="w-full text-left px-4 py-2 text-sm text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 rounded-lg font-bold transition-colors"
                >
                  <Shield size={16} />
                  Panou Admin 🛡️
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 rounded-lg font-medium transition-colors"
                >
                  <LogOut size={16} />
                  Deconectare
                </button>
              </div>
            </div>
          ) : (
            <Link href="/contul-meu" className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#283443] transition-colors text-xs font-bold">
              <User size={18} />
              <span>Contul meu</span>
            </Link>
          )}

          {/* Desktop-only: Adaugă Anunț Button (Elevated center button in BottomNav on mobile) */}
          <Link
            href="/adauga-anunt"
            className="hidden md:inline-flex items-center gap-1.5 bg-[#03c1a2] hover:bg-[#02a88d] text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <PlusCircle size={17} />
            <span>Adaugă Anunț</span>
          </Link>
        </div>
      </div>

      {/* Slide-over Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
      />
    </header>
  );
};
