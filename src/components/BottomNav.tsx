'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Plus, Heart, User, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { getTotalUnreadChatCount } from '@/lib/chatService';

export const BottomNav: React.FC = () => {
  const pathname = usePathname();
  const { currentUser } = useAuth();
  const [favCount, setFavCount] = useState<number>(0);
  const [unreadChatCount, setUnreadChatCount] = useState<number>(0);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  // Sync favorites count
  useEffect(() => {
    const updateFavs = () => {
      try {
        const saved = localStorage.getItem('monky_favorites');
        if (saved) {
          const parsed = JSON.parse(saved);
          setFavCount(parsed.length);
        } else {
          setFavCount(0);
        }
      } catch {
        setFavCount(0);
      }
    };

    updateFavs();
    window.addEventListener('storage', updateFavs);
    return () => window.removeEventListener('storage', updateFavs);
  }, []);

  // Sync user avatar
  useEffect(() => {
    const syncAvatar = () => {
      if (typeof window !== 'undefined') {
        const localAvatar = localStorage.getItem('monky_user_avatar');
        setUserAvatar(localAvatar || currentUser?.photoURL || null);
      } else {
        setUserAvatar(currentUser?.photoURL || null);
      }
    };

    syncAvatar();
    window.addEventListener('storage', syncAvatar);
    window.addEventListener('monky_avatar_updated', syncAvatar);
    return () => {
      window.removeEventListener('storage', syncAvatar);
      window.removeEventListener('monky_avatar_updated', syncAvatar);
    };
  }, [currentUser]);

  // Sync unread chat count
  useEffect(() => {
    const syncChat = () => {
      setUnreadChatCount(getTotalUnreadChatCount());
    };
    syncChat();
    window.addEventListener('storage', syncChat);
    window.addEventListener('monky_chat_updated', syncChat);
    return () => {
      window.removeEventListener('storage', syncChat);
      window.removeEventListener('monky_chat_updated', syncChat);
    };
  }, []);

  // If viewing a listing detail page (/anunt/[id]), hide bottom nav in favor of the sticky contact bar
  if (pathname && pathname.startsWith('/anunt/')) {
    return null;
  }

  const isHomeActive = pathname === '/';
  const isSearchActive = pathname === '/cautare';
  const isAddActive = pathname === '/adauga-anunt';
  const isAccountActive = pathname === '/contul-meu' || pathname === '/inregistrare' || pathname === '/anunturile-mele';

  const handleOpenFavorites = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('monky_open_favorites'));
    }
  };

  return (
    <nav
      aria-label="Navigare mobilă"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden bg-white/95 dark:bg-[#15161a]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-[#26282e] shadow-[0_-4px_24px_rgba(0,0,0,0.18)] select-none"
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
      }}
    >
      <div className="grid grid-cols-5 items-center h-14 max-w-md mx-auto px-1">
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isHomeActive
              ? 'text-[#03c1a2]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Home size={21} className={isHomeActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Acasă</span>
        </Link>

        {/* 2. Căutare */}
        <Link
          href="/cautare"
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isSearchActive
              ? 'text-[#03c1a2]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Search size={21} className={isSearchActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Căutare</span>
        </Link>

        {/* 3. Adaugă Anunț (Prominent elevated center button) */}
        <div className="flex items-center justify-center">
          <Link
            href="/adauga-anunt"
            aria-label="Publică un anunț nou"
            className="flex items-center justify-center w-11 h-11 -mt-3.5 rounded-full bg-gradient-to-tr from-[#03c1a2] to-[#38d39f] text-slate-950 shadow-lg shadow-[#03c1a2]/35 border-2 border-white dark:border-[#15161a] transition-all active:scale-90"
          >
            <Plus size={24} className="stroke-[2.8]" />
          </Link>
        </div>

        {/* 4. Mesaje / Chat */}
        <Link
          href="/mesaje"
          className={`flex flex-col items-center justify-center py-1 relative transition-all active:scale-90 ${
            pathname === '/mesaje'
              ? 'text-[#03c1a2]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <MessageCircle size={21} className={pathname === '/mesaje' ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
            {unreadChatCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#03c1a2] text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {unreadChatCount > 9 ? '9+' : unreadChatCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-0.5 tracking-tight">Mesaje</span>
        </Link>

        {/* 5. Contul Meu */}
        <Link
          href="/contul-meu"
          className={`flex flex-col items-center justify-center py-1 transition-all active:scale-90 ${
            isAccountActive
              ? 'text-[#03c1a2]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          {userAvatar ? (
            <div className={`w-[22px] h-[22px] rounded-full overflow-hidden border ${isAccountActive ? 'border-[#03c1a2]' : 'border-slate-300 dark:border-slate-600'}`}>
              <img
                src={userAvatar}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                }}
              />
            </div>
          ) : (
            <User size={21} className={isAccountActive ? 'stroke-[2.4]' : 'stroke-[1.8]'} />
          )}
          <span className="text-[10px] font-bold mt-0.5 tracking-tight truncate max-w-[54px]">
            {currentUser ? 'Cont' : 'Autentificare'}
          </span>
        </Link>
      </div>
    </nav>
  );
};
