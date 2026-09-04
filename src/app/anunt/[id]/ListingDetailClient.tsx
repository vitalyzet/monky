'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@/app/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ListingGrid } from '@/components/ListingGrid';
import { Listing } from '@/data/mockData';
import { AdListing, getListings, getAllUsersFromDb } from '@/lib/db';
import { formatTimeAgo, formatExactDate } from '@/lib/timeUtils';
import { getShortId, extractListingId } from '@/lib/slugUtils';
import { getDistinctSellerAvatar } from '@/lib/avatarUtils';
import { getCachedListing } from '@/lib/adCache';
import {
  ArrowLeft,
  Heart,
  MapPin,
  Truck,
  ShieldCheck,
  MessageCircle,
  Phone,
  Star,
  Share2,
  Flag,
  Calendar,
  Eye,
  User,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  UserPlus,
  UserCheck,
  Loader2,
  CheckCircle2,
  X,
  Clock,
} from 'lucide-react';
import { isUserFollowed, toggleFollowUser } from '@/lib/follow';
import { useAuth } from '@/lib/AuthContext';
import { formatPublicName } from '@/lib/stringUtils';

export default function ListingDetailClient({
  initialListing,
  targetId,
}: {
  initialListing: AdListing | null;
  targetId: string;
}) {
  const router = useRouter();
  const { currentUser, isAdmin } = useAuth();
  const [listing, setListing] = useState<AdListing | null>(() => {
    if (initialListing) return initialListing;
    return getCachedListing(targetId);
  });
  const [hasChecked, setHasChecked] = useState(false);
  const [recommendedListings, setRecommendedListings] = useState<AdListing[]>([]);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const initialCandidate = initialListing || (typeof window !== 'undefined' ? getCachedListing(targetId) : null);
  const [resolvedSellerAvatar, setResolvedSellerAvatar] = useState<string>(() => {
    return (
      (initialCandidate?.seller as any)?.avatar ||
      (initialCandidate?.seller as any)?.avatarUrl ||
      getDistinctSellerAvatar(initialCandidate?.seller?.name, initialCandidate?.userId)
    );
  });
  const [resolvedSellerName, setResolvedSellerName] = useState<string>(() => {
    return initialCandidate?.seller?.name || 'Vânzător';
  });

  useEffect(() => {
    const timer = setTimeout(() => setHasChecked(true), 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function syncAvatarAndName() {
      const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null;
      const localName = typeof window !== 'undefined' ? localStorage.getItem('monky_user_name') : null;
      const targetSellerName = (listing?.seller?.name || '').toLowerCase().trim();
      const curDisplayName = (currentUser?.displayName || '').toLowerCase().trim();
      const curEmailName = currentUser?.email ? currentUser.email.split('@')[0].toLowerCase().trim() : '';

      const isOwner = Boolean(
        currentUser &&
        (listing?.userId === currentUser.uid ||
          (targetSellerName && (curDisplayName === targetSellerName || curEmailName === targetSellerName)))
      );

      // 1. If viewing own listing or seller name matches, prioritize active user avatar & name
      if (isOwner) {
        const myAvatar = localAvatar || currentUser?.photoURL || (listing?.seller as any)?.avatar || (listing?.seller as any)?.avatarUrl;
        const myName = localName || currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : listing?.seller?.name);
        if (myAvatar) setResolvedSellerAvatar(myAvatar);
        if (myName) setResolvedSellerName(myName);
        return;
      }

      // 2. Fetch latest avatar & name from Firestore users collection
      try {
        const dbUsers = await getAllUsersFromDb();
        const found = dbUsers.find((u) => {
          const uName = (u.displayName || '').toLowerCase().trim();
          const uEmail = (u.email || '').toLowerCase().trim();
          return (
            (listing?.userId && u.uid === listing.userId) ||
            (targetSellerName && (uName === targetSellerName || uEmail.startsWith(targetSellerName)))
          );
        });

        if (found) {
          if (found.photoURL) setResolvedSellerAvatar(found.photoURL);
          if (found.displayName) setResolvedSellerName(found.displayName);
          return;
        }
      } catch (err) {
        console.error(err);
      }

      // 3. Fallback: only use localAvatar if owner, otherwise distinct seller avatar
      const finalAvatar = (listing?.seller as any)?.avatar || (listing?.seller as any)?.avatarUrl || (isOwner ? localAvatar : null) || getDistinctSellerAvatar(listing?.seller?.name, listing?.userId);
      const finalName = listing?.seller?.name || (isOwner ? localName : null) || 'Vânzător';
      setResolvedSellerAvatar(finalAvatar);
      setResolvedSellerName(finalName);
    }

    syncAvatarAndName();
    window.addEventListener('storage', syncAvatarAndName);
    window.addEventListener('monky_avatar_updated', syncAvatarAndName);
    return () => {
      window.removeEventListener('storage', syncAvatarAndName);
      window.removeEventListener('monky_avatar_updated', syncAvatarAndName);
    };
  }, [listing, currentUser]);

  useEffect(() => {
    const sellerName = listing?.seller?.name || 'Stefano F.';
    setIsFollowing(isUserFollowed(sellerName));
  }, [listing?.seller?.name]);

  const handleToggleFollow = async () => {
    const sellerName = resolvedSellerName || listing?.seller?.name || 'Vânzător';
    const newState = await toggleFollowUser(sellerName, resolvedSellerAvatar, listing?.userId, currentUser);
    setIsFollowing(newState);
  };
  const [messageText, setMessageText] = useState('Bună, mă interesează oferta dumneavoastră. Mai este valabilă?');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isMessageSent, setIsMessageSent] = useState(false);

  const handleSendMessage = () => {
    if (isSendingMessage || isMessageSent || !messageText.trim()) return;
    setIsSendingMessage(true);
    setTimeout(() => {
      setIsSendingMessage(false);
      setIsMessageSent(true);
    }, 1200);
  };

  const [timeAgo, setTimeAgo] = useState('');
  const [exactTime, setExactTime] = useState('');
  
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    try {
      const savedFavs = localStorage.getItem('monky_favorites');
      if (savedFavs) {
        setFavorites(JSON.parse(savedFavs));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    let updated: string[];
    if (favorites.includes(id)) {
      updated = favorites.filter((item) => item !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('monky_favorites', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  // Sync listing from initialListing or cache/db if missing
  useEffect(() => {
    if (initialListing) {
      setListing(initialListing);
    } else if (!listing && targetId) {
      const cached = getCachedListing(targetId);
      if (cached) {
        setListing(cached);
        return;
      }
      try {
        const saved = localStorage.getItem('monky_user_listings');
        if (saved) {
          const parsed: AdListing[] = JSON.parse(saved);
          const found = parsed.find((item) => item.id === targetId || targetId.endsWith(item.id));
          if (found) {
            setListing(found);
            return;
          }
        }
      } catch (e) {
        console.error(e);
      }

      // Fallback async fetch
      import('@/lib/db').then(({ getListingById }) => {
        getListingById(targetId).then((found) => {
          if (found) setListing(found);
        });
      });
    }
  }, [initialListing, targetId]);

  // Fetch recommendations
  useEffect(() => {
    if (listing?.category) {
      getListings().then((all) => {
        const recs = all
          .filter((ad) => ad.id !== listing.id && ad.category === listing.category)
          .slice(0, 4);
        setRecommendedListings(recs);
      });
    }
  }, [listing?.category, listing?.id]);

  useEffect(() => {
    if (!listing) return;
    
    const rawTime = listing.timestamp || listing.createdAt;
    
    const updateTime = () => {
      setTimeAgo(formatTimeAgo(rawTime));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 10000);
    
    let d: Date | null = null;
    
    if (typeof rawTime === 'object' && rawTime !== null) {
      if (typeof rawTime.toDate === 'function') d = rawTime.toDate();
      else if (typeof rawTime.seconds === 'number') d = new Date(rawTime.seconds * 1000);
    } else if (rawTime instanceof Date) {
      d = rawTime;
    } else if (typeof rawTime === 'number') {
      d = new Date(rawTime);
    } else if (typeof rawTime === 'string') {
      const p = Date.parse(rawTime);
      if (!isNaN(p)) d = new Date(p);
    }
    
    if (!d) d = new Date(); // Fallback for mock strings like 'Acum câteva minute'

    const formattedExact = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
    
    setExactTime(formattedExact);
    
    return () => clearInterval(interval);
  }, [listing]);

  if (!listing) {
    if (!hasChecked) {
      return (
        <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#121212] text-slate-900 dark:text-slate-100">
          <Navbar favoriteCount={favorites.length} />
          <main className="max-w-[1240px] w-full mx-auto px-4 py-16 flex flex-col items-center justify-center flex-grow">
            <Loader2 className="w-8 h-8 animate-spin text-[#03c1a2] mb-3" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Se încarcă detaliile anunțului...</p>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#181818] text-slate-900 dark:text-slate-100">
        <Navbar favoriteCount={0} />
        <main className="main-container flex-grow py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Anunțul nu a fost găsit</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-6">Ne pare rău, dar anunțul căutat nu mai este disponibil sau a fost șters.</p>
          <Link
            href="/"
            className="ad-btn-primary inline-flex max-w-xs mx-auto justify-center"
          >
            <ArrowLeft size={18} />
            Înapoi la pagina principală
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = listing.gallery && listing.gallery.length > 0 ? listing.gallery : [listing.image];

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => {
      const nextIdx = prev === 0 ? galleryImages.length - 1 : prev - 1;
      return nextIdx;
    });
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIdx((prev) => {
      const nextIdx = prev === galleryImages.length - 1 ? 0 : prev + 1;
      return nextIdx;
    });
  };

  const isCar = listing.category === 'Autoturisme' || listing.brand;

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f6] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar favoriteCount={isFavorite ? 1 : 0} />

      <main className="main-container flex-grow max-w-[1200px] mx-auto px-3 sm:px-4 py-3 sm:py-4 pb-28 sm:pb-8">
        {/* Navigation & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 py-3 mb-3 text-sm">
          {/* Left: Back Arrow + Breadcrumb */}
          <div className="flex items-center gap-2.5 overflow-hidden">
            <button
              type="button"
              onClick={() => {
                const returnUrl = typeof window !== 'undefined' ? sessionStorage.getItem('monky_last_search_url') : null;
                if (returnUrl) {
                  router.push(returnUrl);
                } else if (window.history.length > 1) {
                  router.back();
                } else {
                  router.push('/');
                }
              }}
              className="w-9 h-9 rounded-full bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#3a3a3a] shadow-sm flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#333333] hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer"
              title="Înapoi la lista de anunțuri"
            >
              <ChevronLeft size={20} />
            </button>

            <nav className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium truncate text-xs sm:text-sm">
              <Link href="/" className="text-blue-600 dark:text-sky-400 hover:underline transition-colors">
                Tevinde.ro
              </Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <Link
                href={`/cautare?category=${listing.category || ''}`}
                className="text-blue-600 dark:text-sky-400 hover:underline transition-colors"
              >
                {listing.category === 'auto-acc' ? 'Auto, moto și ambarcațiuni' : (listing.category || 'Anunțuri')}
              </Link>
              <span className="text-slate-300 dark:text-slate-600">/</span>
              <span className="text-slate-400 dark:text-slate-400 truncate max-w-[140px] sm:max-w-[350px]">
                {listing.title}
              </span>
            </nav>
          </div>

          {/* Right: Distribuie & Salvează buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link-ul a fost copiat în clipboard!');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#3a3a3a] hover:bg-slate-50 dark:hover:bg-[#333333] rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
            >
              <Share2 size={15} className="text-slate-500 dark:text-slate-400" />
              <span className="hidden xs:inline">Distribuie</span>
            </button>

            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-[#3a3a3a] hover:bg-slate-50 dark:hover:bg-[#333333] rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
            >
              <Heart
                size={15}
                fill={isFavorite ? '#ef4444' : 'none'}
                color={isFavorite ? '#ef4444' : '#64748b'}
              />
              <span>{isFavorite ? 'Salvat' : 'Salvează'}</span>
            </button>
          </div>
        </div>

        {/* Pending Moderation Banner */}
        {listing.status === 'pending' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-4 text-amber-900 dark:text-amber-200 shadow-sm">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 font-bold shadow-sm">
                <Clock size={20} />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm">Anunț în așteptare de aprobare (Status: În așteptare)</h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  Acest anunț a fost trimis către moderare. Va fi activ și vizibil pe site după aprobarea de către admin.
                </p>
              </div>
            </div>
            {isAdmin && (
              <Link
                href="/admin"
                className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-colors whitespace-nowrap shadow-xs"
              >
                Aprobă în Panou Admin
              </Link>
            )}
          </div>
        )}

        {/* 2-Column Detail Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          {/* Main Card (Left 2 Columns) */}
          <div className="lg:col-span-2 bg-white dark:bg-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-[#333333] shadow-md dark:shadow-2xl flex flex-col gap-5 sm:gap-6 transition-colors">
            
            {/* Title, Price & Header Info */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight sm:pr-4">
                  {listing.title}
                </h1>
                <div className="flex flex-col items-start sm:items-end flex-shrink-0">
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-600 dark:text-[#60a5fa] tracking-tight">
                    {listing?.price && !isNaN(Number(listing.price)) && Number(listing.price) > 0 ? (
                      <span>
                        {Number(listing.price).toLocaleString('ro-RO')}{' '}
                        {String(listing.currency) === 'RON' || String(listing.currency) === 'Lei' ? (
                          <span>
                            L<span className="font-normal text-[0.88em] opacity-80">ei</span>
                          </span>
                        ) : (
                          listing.currency || '€'
                        )}
                      </span>
                    ) : (
                      'Preț la cerere'
                    )}
                  </span>
                  {listing.isNegotiable && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">negociabil</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <MapPin size={16} className="text-blue-600 dark:text-sky-400" />
                  {listing.location}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={15} />
                  Valabil din {exactTime}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Eye size={15} />
                  245 vizualizări
                </span>
              </div>
            </div>

            {/* Gallery Main Image */}
            <div 
              className="relative aspect-[4/3] sm:aspect-[16/10] bg-slate-100 dark:bg-[#181818] rounded-2xl overflow-hidden border border-slate-200 dark:border-[#333333] group flex items-center justify-center cursor-pointer"
              onClick={() => setIsImageModalOpen(true)}
              title="Apasă pentru a mări imaginea"
            >
              <img
                src={galleryImages[activeImageIdx]}
                alt={listing.title}
                loading="eager"
                decoding="async"
                className="w-full h-full object-contain bg-black/5 dark:bg-black/40 group-hover:scale-[1.01] transition-transform duration-300"
              />

              {/* Photo counter overlay pill bottom left */}
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5 z-10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{activeImageIdx + 1} / {galleryImages.length}</span>
              </div>
              
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/90 text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-lg border border-slate-200 dark:border-white/20 opacity-80 group-hover:opacity-100 transition-all z-10"
                    title="Foto anterioară"
                  >
                    <ChevronLeft size={26} />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black/90 text-slate-800 dark:text-white rounded-full flex items-center justify-center shadow-lg border border-slate-200 dark:border-white/20 opacity-80 group-hover:opacity-100 transition-all z-10"
                    title="Foto următoare"
                  >
                    <ChevronRight size={26} />
                  </button>
                </>
              )}
            </div>

            {/* Gallery Thumbnails Carousel in 1 Single Line */}
            {galleryImages.length > 1 && (
              <div className="relative group/thumbs w-full">
                <div
                  id="thumbnails-carousel"
                  className="flex items-center gap-2.5 overflow-x-auto py-1 px-1 scroll-smooth scrollbar-none snap-x"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {galleryImages.map((img, idx) => (
                    <button
                      key={idx}
                      id={`thumb-${idx}`}
                      onClick={() => {
                        setActiveImageIdx(idx);
                        document.getElementById(`thumb-${idx}`)?.scrollIntoView({
                          behavior: 'smooth',
                          inline: 'center',
                          block: 'nearest',
                        });
                      }}
                      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all bg-slate-100 dark:bg-[#181818] cursor-pointer snap-center ${
                        activeImageIdx === idx
                          ? 'border-blue-600 dark:border-sky-500 ring-2 ring-blue-500/40 dark:ring-sky-500/40 opacity-100 scale-[1.03] shadow-md'
                          : 'border-slate-200 dark:border-[#383838] opacity-70 hover:opacity-100 hover:border-slate-400'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Left/Right scroll buttons on carousel */}
                {galleryImages.length > 4 && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('thumbnails-carousel');
                        if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                      }}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 dark:bg-[#252525]/95 text-slate-800 dark:text-white shadow-md border border-slate-200 dark:border-[#404040] flex items-center justify-center opacity-0 group-hover/thumbs:opacity-100 hover:scale-110 transition-all z-10 cursor-pointer"
                      title="Derulează stânga"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('thumbnails-carousel');
                        if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                      }}
                      className="absolute -right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/95 dark:bg-[#252525]/95 text-slate-800 dark:text-white shadow-md border border-slate-200 dark:border-[#404040] flex items-center justify-center opacity-0 group-hover/thumbs:opacity-100 hover:scale-110 transition-all z-10 cursor-pointer"
                      title="Derulează dreapta"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Specifications Grid / Details Table */}
            <div className="bg-slate-50 dark:bg-[#1c1c1c] rounded-2xl p-5 border border-slate-200 dark:border-[#333333] flex flex-col gap-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-[#333333] pb-3">
                Specificații și detalii
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Stare</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.condition}</span>
                </div>

                {listing.brand && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Marca</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.brand}</span>
                  </div>
                )}

                {listing.model && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Model</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.model}</span>
                  </div>
                )}

                {listing.phoneColor && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Culoare</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.phoneColor}</span>
                  </div>
                )}

                {listing.storageCapacity && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Capacitate Stocare</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.storageCapacity}</span>
                  </div>
                )}

                {listing.batteryHealth && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Sănătate Baterie</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.batteryHealth}</span>
                  </div>
                )}

                {listing.year && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">An fabricație</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.year}</span>
                  </div>
                )}

                {(listing.caroserie || listing.bodyType) && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">
                      {['moto', 'motociclete'].includes(listing.category || '') ? 'Tip Motocicletă' : 'Caroserie'}
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.caroserie || listing.bodyType}</span>
                  </div>
                )}

                {listing.mileage && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Rulaj</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.mileage}</span>
                  </div>
                )}

                {listing.registrationStatus && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Stare înmatriculare</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.registrationStatus}</span>
                  </div>
                )}

                {listing.engineCapacity && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Capacitate cilindrică</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {listing.engineCapacity.includes('cm³') || listing.engineCapacity.includes('cc') ? listing.engineCapacity : `${listing.engineCapacity} cm³`}
                    </span>
                  </div>
                )}

                {(listing.maxPower || listing.enginePower || listing.putere) && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Putere maximă</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {String(listing.maxPower || listing.enginePower || listing.putere).includes('CP') || String(listing.maxPower || listing.enginePower || listing.putere).includes('kW')
                        ? String(listing.maxPower || listing.enginePower || listing.putere)
                        : `${listing.maxPower || listing.enginePower || listing.putere} CP`}
                    </span>
                  </div>
                )}

                {listing.fuel && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Combustibil</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.fuel}</span>
                  </div>
                )}

                {listing.transmission && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Cutie viteze</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.transmission}</span>
                  </div>
                )}

                {listing.euroClass && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Normă poluare</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.euroClass}</span>
                  </div>
                )}

                {listing.subType && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Tip produs</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.subType}</span>
                  </div>
                )}

                {listing.itemSize && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Mărime</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.itemSize}</span>
                  </div>
                )}

                {listing.warranty && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Garanție</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.warranty}</span>
                  </div>
                )}

                <div>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Tip Anunț</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {listing.seller?.isDealer ? 'Firmă / Dealer' : 'Persoană fizică'}
                  </span>
                </div>

                {listing.isNegotiable !== undefined && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Preț negociabil</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.isNegotiable ? 'Da' : 'Nu'}</span>
                  </div>
                )}

                {listing.isExchange !== undefined && (
                  <div>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">Accept schimburi</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{listing.isExchange ? 'Da' : 'Nu'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-3 pt-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Descrierea anunțului</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {listing.description}
              </p>
            </div>

          </div>

          {/* Sidebar Cards (Right Column) */}
          <div className="flex flex-col gap-5 sticky top-24 h-fit">
            
            {/* Card 1: Clean Seller Profile Card */}
            <div className="bg-white dark:bg-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200/80 dark:border-[#333333] shadow-md dark:shadow-2xl flex flex-col gap-4 transition-all">
              {/* Top Row: Telefon validat & Heart button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                  <CheckCircle2 size={16} className="text-emerald-500 fill-emerald-100 dark:fill-emerald-950" />
                  <span>Telefon validat</span>
                </div>

                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-[#333333] text-slate-400 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center justify-center transition-all border border-slate-200/60 dark:border-[#444444] flex-shrink-0"
                  title={isFavorite ? 'Elimină din favorite' : 'Salvează la favorite'}
                >
                  <Heart
                    size={18}
                    fill={isFavorite ? '#ef4444' : 'none'}
                    color={isFavorite ? '#ef4444' : 'currentColor'}
                  />
                </button>
              </div>

              {/* Seller Avatar and Info */}
              <div className="flex flex-col items-center text-center pt-2">
                <Link
                  href={`/utilizator/${encodeURIComponent(resolvedSellerName)}`}
                  className="relative group block"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform border-[3px] border-white dark:border-[#333333] ring-2 ring-slate-100 dark:ring-slate-700 bg-slate-100 dark:bg-[#181818]">
                    <img
                      src={resolvedSellerAvatar}
                      alt={resolvedSellerName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                      }}
                    />
                  </div>
                  <span className="absolute bottom-1 right-1 w-4 h-4 bg-[#00c1a2] rounded-full border-2 border-white dark:border-[#262626] shadow-xs" title="Utilizator activ" />
                </Link>

                <Link
                  href={`/utilizator/${encodeURIComponent(resolvedSellerName)}`}
                  className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white hover:underline truncate max-w-full transition-colors mt-3"
                >
                  {formatPublicName(resolvedSellerName)}
                </Link>

                <Link
                  href={`/utilizator/${encodeURIComponent(resolvedSellerName)}`}
                  className="text-blue-600 dark:text-sky-400 hover:underline font-bold text-sm sm:text-base mt-1.5 transition-colors"
                >
                  Vezi toate anunțurile
                </Link>
              </div>

              {/* Action Buttons Row (Phone & Follow) */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowPhone(!showPhone)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 text-sm sm:text-base whitespace-nowrap"
                >
                  <Phone size={18} className="fill-white flex-shrink-0" />
                  <span className="whitespace-nowrap">{showPhone ? (listing.seller?.phone || '0742 891 304') : 'Arată telefon'}</span>
                </button>

                <button
                  onClick={handleToggleFollow}
                  className={`p-3 rounded-2xl font-bold transition-all flex-shrink-0 flex items-center justify-center ${
                    isFollowing
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-blue-800'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#333] dark:hover:bg-[#444] text-slate-800 dark:text-white border border-slate-200/60 dark:border-[#444]'
                  }`}
                  title={isFollowing ? 'Nu mai urmări' : 'Urmărește acest vânzător'}
                  aria-label={isFollowing ? 'Nu mai urmări' : 'Urmărește acest vânzător'}
                >
                  {isFollowing ? (
                    <UserCheck size={20} className="text-blue-600 dark:text-sky-400 flex-shrink-0" />
                  ) : (
                    <UserPlus size={20} className="flex-shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* Card 2: Contact Form Card */}
            <div className="bg-white dark:bg-[#262626] rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-[#333333] shadow-md dark:shadow-2xl flex flex-col gap-4 transition-colors">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-4">Contactează vânzătorul</h3>

              <div className="flex flex-col gap-2">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={isSendingMessage || isMessageSent}
                  rows={3}
                  maxLength={3000}
                  className={`w-full border border-slate-200 dark:border-[#444444] rounded-2xl p-3.5 sm:p-4 text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-[#383838] text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 resize-none transition-all placeholder-slate-400 ${
                    isMessageSent ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-[#2e2e2e]' : 'focus:bg-white dark:focus:bg-[#3d3d3d]'
                  }`}
                  placeholder="Scrie mesajul tău..."
                />
                
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>Caractere rămase: <strong>{3000 - messageText.length}</strong></span>
                  
                  <button className="inline-flex items-center gap-1 bg-slate-100 dark:bg-[#383838] hover:bg-slate-200 dark:hover:bg-[#444444] text-slate-700 dark:text-slate-200 font-medium px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#4a4a4a] transition-colors">
                    <span className="text-sm">📎</span> Adaugă fișier <span className="text-slate-400">?</span>
                  </button>
                </div>
              </div>

              {/* Mesaj button */}
              <button 
                onClick={handleSendMessage}
                disabled={isSendingMessage || isMessageSent || !messageText.trim()}
                className={`w-full font-extrabold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg mt-1 text-base ${
                  isMessageSent
                    ? 'bg-emerald-600 text-white cursor-default'
                    : isSendingMessage
                    ? 'bg-blue-600 text-white opacity-80 cursor-wait'
                    : !messageText.trim()
                    ? 'bg-slate-200 dark:bg-[#383838] text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-500/25'
                }`}
              >
                {isMessageSent ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Mesaj trimis cu succes!</span>
                  </>
                ) : isSendingMessage ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Se trimite...</span>
                  </>
                ) : (
                  <>
                    <MessageCircle size={20} className="fill-current" />
                    <span>Mesaj</span>
                  </>
                )}
              </button>

              <hr className="border-slate-200 dark:border-[#333333] my-1" />

              {/* Meta Stats */}
              <div className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between items-center">
                  <span>ID Anunț</span>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#333333] px-2 py-0.5 rounded-md font-semibold">
                    #{getShortId(listing.id).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Valabil din</span>
                  <div className="flex flex-col items-end gap-1">
                    <strong className="text-slate-900 dark:text-white leading-tight">
                      {formatExactDate(listing.timestamp || listing.createdAtTime || listing.createdAt)}
                    </strong>
                    <span className="text-xs text-slate-500 bg-slate-100 dark:bg-[#333] px-2 py-0.5 rounded-full">
                      {formatTimeAgo(listing.timestamp || listing.createdAtTime || listing.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Vizualizari</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">4</span>
                </div>
              </div>

              <button className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center justify-center gap-1.5 transition-colors mt-1">
                <Flag size={14} />
                Raportează anunțul
              </button>
            </div>

          </div>
        </div>

        {/* Recommended for you */}
        {recommendedListings.length > 0 && (
          <div className="mt-16 mb-8">
            <ListingGrid 
              listings={recommendedListings.slice(0, 4) as Listing[]} 
              title="Recomandat pentru tine"
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          </div>
        )}
      </main>

      {/* Mobile Sticky Contact Action Bar */}
      <div 
        className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 dark:bg-[#15161a]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-[#282a30] p-3 shadow-[0_-4px_24px_rgba(0,0,0,0.18)]"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)',
        }}
      >
        <div className="flex items-center gap-2 max-w-lg mx-auto">
          {/* Favorite Button */}
          <button
            type="button"
            onClick={() => setIsFavorite(!isFavorite)}
            className="w-11 h-11 rounded-2xl border border-slate-200 dark:border-[#383838] bg-slate-50 dark:bg-[#252525] flex items-center justify-center text-slate-700 dark:text-slate-200 active:scale-90 transition-transform flex-shrink-0"
            title={isFavorite ? 'Elimină din favorite' : 'Salvează la favorite'}
          >
            <Heart
              size={20}
              className={isFavorite ? 'fill-red-500 text-red-500' : 'text-slate-600 dark:text-slate-300'}
            />
          </button>

          {/* Call Seller Button */}
          <a
            href={listing.seller?.phone ? `tel:${listing.seller.phone.replace(/\s+/g, '')}` : 'tel:0742891304'}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold h-11 px-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-emerald-600/25 transition-all whitespace-nowrap"
          >
            <Phone size={16} className="fill-white flex-shrink-0" />
            <span>Sună</span>
          </a>

          {/* Send Message Button (Smooth scrolls to message box) */}
          <button
            type="button"
            onClick={() => {
              const el = document.querySelector('textarea');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                el.focus();
              }
            }}
            className="flex-1 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold h-11 px-3 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-600/25 transition-all whitespace-nowrap"
          >
            <MessageCircle size={16} className="flex-shrink-0" />
            <span>Mesaj</span>
          </button>
        </div>
      </div>

      <Footer />

      {/* Fullscreen Image Lightbox Modal matching user reference screenshot */}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col justify-between animate-in fade-in duration-200 select-none">
          {/* Top Bar: Counter left, Close button right */}
          <div className="w-full flex items-center justify-between px-6 py-4 z-20">
            <div className="text-white text-sm font-medium tracking-wide">
              {activeImageIdx + 1}/{galleryImages.length}
            </div>
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Închide"
            >
              <X size={20} />
            </button>
          </div>

          {/* Center Image Container */}
          <div className="relative flex-1 flex items-center justify-center px-4 overflow-hidden">
            <img
              src={galleryImages[activeImageIdx]}
              alt={listing.title}
              className="max-h-[80vh] max-w-full object-contain mx-auto my-auto rounded-lg shadow-2xl"
            />

            {/* Prev / Next Arrows */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all z-20 cursor-pointer"
                  title="Foto anterioară"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition-all z-20 cursor-pointer"
                  title="Foto următoare"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>

          {/* Bottom Fixed Dark Bar matching reference image */}
          <div className="w-full bg-[#18181c] border-t border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between z-20">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-[#bbf0dc]/60 bg-slate-800 flex-shrink-0 flex items-center justify-center shadow-sm">
                <img
                  src={resolvedSellerAvatar}
                  alt={resolvedSellerName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                  }}
                />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-white font-bold text-sm sm:text-base truncate max-w-md sm:max-w-xl">
                  {listing.title}
                </h4>
                <div className="text-xs text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-slate-300">{formatPublicName(resolvedSellerName)}</span>
                  <span>•</span>
                  <span className="text-[#00c9a7] font-black text-sm sm:text-base">
                    {listing.price && !isNaN(Number(listing.price)) && Number(listing.price) > 0
                      ? `${Number(listing.price).toLocaleString('ro-RO')} ${listing.currency || 'Lei'}`
                      : 'Preț la cerere'}
                  </span>
                </div>
              </div>
            </div>

            <Link
              href={`/mesaje?listing=${listing.id}`}
              className="bg-[#00c9a7] hover:bg-[#00b395] active:scale-95 text-slate-950 font-bold px-6 py-2.5 rounded-full flex items-center gap-2 text-sm transition-all shadow-md flex-shrink-0 ml-3"
            >
              <MessageCircle size={18} className="fill-slate-950 stroke-none" />
              <span>Chat</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
