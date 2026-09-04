'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ListingGrid } from '@/components/ListingGrid';
import { Listing, MOCK_LISTINGS } from '@/data/mockData';
import {
  Star,
  MessageCircle,
  Calendar,
  MessageSquare,
  X,
  UserCheck,
  BadgeCheck,
  Users,
  MapPin,
  ChevronDown,
  ArrowRight,
  Package,
  Heart,
  BarChart2,
  ShoppingBag,
  Truck,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Share2,
  Mail,
  Phone,
  Check,
  PenLine
} from 'lucide-react';
import { getListings, getAllUsersFromDb } from '@/lib/db';
import { isUserFollowed, toggleFollowUser } from '@/lib/follow';
import { useAuth } from '@/lib/AuthContext';
import { getDistinctSellerAvatar } from '@/lib/avatarUtils';
import { formatPublicName } from '@/lib/stringUtils';

const DUMMY_REVIEWS = [
  {
    rating: '5,0',
    stars: 5,
    text: 'Persoană excelentă! Simpatică, amabilă și educată. Recomand cu încredere!',
    reviewer: 'Elena D.',
    action: 'a vândut lui',
    item: 'Vespa PK 50S 1983, 4 marce',
    date: '13/08/2026',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Tranzacție rapidă și comunicare impecabilă.',
    reviewer: 'Radu M.',
    action: 'a cumpărat de la',
    item: 'Bicicletă damă Bottecchia 26"',
    date: '08/06/2026',
    hasQuote: false
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Produs excelent, livrare rapidă prin curier!',
    reviewer: 'Pietro V.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Manetă frână Epoca',
    date: '15/12/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Totul a decurs perfect, vânzător de încredere.',
    reviewer: 'Fabio S.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Stop spate clasic',
    date: '15/12/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Vânzător extrem de amabil și cordial. Mulțumesc mult!',
    reviewer: 'Ruggero B.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Capac roată Vespa PK',
    date: '06/11/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Articol exact ca în fotografii și descriere.',
    reviewer: 'Dilan B.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Far original SIEM',
    date: '31/10/2025',
    hasQuote: false
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Articol conform descrierii, expediere ultra-rapidă.',
    reviewer: 'Henry K.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Șa originală Piaggio Ciao',
    date: '04/06/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Foarte mulțumită de achiziție, totul conform.',
    reviewer: 'Lucia P.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Mulineta Abu Cardinal',
    date: '04/04/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'A decurs totul perfect, recomand 100%.',
    reviewer: 'Paul C.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Autocolante moto vintage',
    date: '02/04/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Totul perfect, comunicare excelentă.',
    reviewer: 'Mihai T.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Cadran bord Piaggio',
    date: '02/04/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Vânzător de nota 10, serios și prompt.',
    reviewer: 'Cristian N.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Mulineta Abu Garcia Suveran',
    date: '28/03/2025',
    hasQuote: true
  },
  {
    rating: '5,0',
    stars: 5,
    text: 'Vânzător excelent, precis și onest, super recomandat!',
    reviewer: 'Diego R.',
    action: 'a cumpărat cu Livrare Tevinde.ro de la',
    item: 'Șa piele naturală Lepper Holland',
    date: '28/03/2025',
    hasQuote: true
  }
];

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const userName = decodeURIComponent(params.id);
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const [profileInfo, setProfileInfo] = useState<{
    name: string;
    avatar: string;
    location: string;
  }>({
    name: userName,
    avatar: '',
    location: 'Timișoara, România',
  });
  const [activeTab, setActiveTab] = useState<'anunturi' | 'recenzii' | 'info' | 'urmaritori'>('anunturi');
  const [showReviewsBadgeModal, setShowReviewsBadgeModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [memberSince, setMemberSince] = useState<string>('2026');
  const [reviewsList, setReviewsList] = useState<Array<{
    rating: string;
    stars: number;
    text: string;
    reviewer: string;
    action: string;
    item: string;
    date: string;
    hasQuote: boolean;
  }>>([]);

  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [newReviewerName, setNewReviewerName] = useState<string>('');
  const [newActionType, setNewActionType] = useState<string>('a cumpărat de la');
  const [newItemName, setNewItemName] = useState<string>('');
  const [newReviewText, setNewReviewText] = useState<string>('');
  const [newHasShipping, setNewHasShipping] = useState<boolean>(true);
  const [reviewSubmitting, setReviewSubmitting] = useState<boolean>(false);
  const [reviewToast, setReviewToast] = useState<string | null>(null);

  // Load reviews from localStorage (real user reviews)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`monky_reviews_${userName}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReviewsList(parsed);
          return;
        }
      }
      setReviewsList([]);
    } catch (e) {
      console.error(e);
      setReviewsList([]);
    }
  }, [userName]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;

    setReviewSubmitting(true);
    setTimeout(() => {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

      const actionText = newHasShipping
        ? `a cumpărat cu Livrare Tevinde.ro de la`
        : newActionType;

      const newEntry = {
        rating: `${newRating},0`,
        stars: newRating,
        text: newReviewText.trim(),
        reviewer: newReviewerName.trim() || 'Cumpărător Verificat',
        action: actionText,
        item: newItemName.trim() || userListings[0]?.title || 'Articol verificat',
        date: formattedDate,
        hasQuote: true,
      };

      const updated = [newEntry, ...reviewsList];
      setReviewsList(updated);
      try {
        localStorage.setItem(`monky_reviews_${userName}`, JSON.stringify(updated));
      } catch (err) {
        console.error(err);
      }

      setReviewSubmitting(false);
      setShowAddReviewModal(false);
      setNewReviewText('');
      setNewItemName('');
      setNewReviewerName('');
      setNewRating(5);
      setReviewToast('Recenzia ta a fost publicată cu succes!');
      setTimeout(() => setReviewToast(null), 3500);
    }, 400);
  };

  useEffect(() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'recenzii' || tabParam === 'anunturi' || tabParam === 'info' || tabParam === 'urmaritori') {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    setIsFollowing(isUserFollowed(userName));
  }, [userName]);

  const handleToggleFollow = async () => {
    const newState = await toggleFollowUser(userName, profileInfo.avatar, undefined, currentUser);
    setIsFollowing(newState);
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  useEffect(() => {
    async function loadListings() {
      let userAds: Listing[] = [];
      let deletedIds: string[] = [];

      try {
        const savedDeleted = localStorage.getItem('monky_deleted_listings');
        if (savedDeleted) {
          deletedIds = JSON.parse(savedDeleted);
        }
      } catch (e) {
        console.error(e);
      }

      try {
        const savedUserAds = localStorage.getItem('monky_user_listings');
        if (savedUserAds) {
          userAds = (JSON.parse(savedUserAds) as Listing[]).filter(
            (item) => !deletedIds.includes(item.id!)
          );
        }
      } catch (e) {
        console.error('Eroare la citirea user listings:', e);
      }

      try {
        const firestoreAds = await getListings(true);
        const combined: any[] = [...userAds];
        firestoreAds.forEach((ad) => {
          if (!deletedIds.includes(ad.id!) && !combined.some((item) => item.id === ad.id)) {
            combined.push(ad);
          }
        });

        const targetName = userName.toLowerCase().trim();
        const targetPublic = formatPublicName(userName).toLowerCase().trim();
        const curDisplayName = currentUser?.displayName?.toLowerCase().trim();
        const curEmailName = currentUser?.email ? currentUser.email.split('@')[0].toLowerCase().trim() : '';
        const isOwnProfile = Boolean(
          currentUser &&
          (curDisplayName === targetName ||
            curEmailName === targetName ||
            (curDisplayName && formatPublicName(curDisplayName).toLowerCase() === targetPublic) ||
            currentUser.uid === userName)
        );

        const realFiltered = combined.filter((l) => {
          const seller = (l.seller?.name || '').toLowerCase().trim();
          const sellerPublic = formatPublicName(l.seller?.name || '').toLowerCase().trim();
          const userId = (l as any).userId;

          let isMatch = false;
          if (seller === targetName || userId === userName || sellerPublic === targetPublic || sellerPublic === targetName || seller === targetPublic) isMatch = true;

          if (isOwnProfile) {
            if (userId === currentUser?.uid) isMatch = true;
            if (curDisplayName && (seller === curDisplayName || sellerPublic === formatPublicName(curDisplayName).toLowerCase())) isMatch = true;
            if (curEmailName && (seller === curEmailName || sellerPublic === formatPublicName(curEmailName).toLowerCase())) isMatch = true;
          }

          if (!isMatch) return false;

          // If viewing another user's profile, only show approved active ads
          if (!isOwnProfile && (l.status === 'pending' || l.status === 'rejected')) {
            return false;
          }

          return true;
        });

        setUserListings(realFiltered as any[]);
      } catch (e) {
        console.error('Error loading user listings:', e);
        setUserListings(userAds as any[]);
      }
    }

    loadListings();
  }, [userName, currentUser]);

  // Calculate dynamic average rating
  const avgRatingScore = reviewsList.length > 0
    ? (reviewsList.reduce((acc, r) => acc + (r.stars || 5), 0) / reviewsList.length).toFixed(1)
    : '5.0';
  const avgStarsInt = Math.round(parseFloat(avgRatingScore));

  // Calculate rating distribution for progress bars
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviewsList.filter((r) => Math.round(r.stars || 5) === stars).length;
    const percentage = reviewsList.length > 0 ? Math.round((count / reviewsList.length) * 100) : 0;
    return { stars, count, percentage };
  });

  useEffect(() => {
    async function resolveProfile() {
      let resolvedName = userName;
      let resolvedAvatar = '';
      let resolvedLocation = 'Timișoara, România';

      const localSavedAvatar = typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null;
      const targetName = userName.toLowerCase().trim();
      const curDisplayName = currentUser?.displayName?.toLowerCase().trim();
      const curEmailName = currentUser?.email ? currentUser.email.split('@')[0].toLowerCase().trim() : '';
      const isOwnProfile = Boolean(
        currentUser &&
        (curDisplayName === targetName ||
          curEmailName === targetName ||
          currentUser.uid === userName)
      );

      // 1. If currently logged in user is viewing own profile
      if (isOwnProfile) {
        resolvedName = currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : userName);
        resolvedAvatar = currentUser?.photoURL || localSavedAvatar || '';
      }

      // 2. Fetch from Firestore users
      if (!resolvedAvatar) {
        try {
          const dbUsers = await getAllUsersFromDb();
          const found = dbUsers.find((u) => {
            const uName = (u.displayName || '').toLowerCase().trim();
            const uEmail = (u.email || '').toLowerCase().trim();
            return uName === targetName || uEmail.startsWith(targetName) || u.uid === userName;
          });
          if (found) {
            if (found.displayName) resolvedName = found.displayName;
            if (found.photoURL) resolvedAvatar = found.photoURL;
            if ((found as any).createdAt) {
              try {
                const d = new Date((found as any).createdAt);
                if (!isNaN(d.getTime())) {
                  const roMonths = ['ianuarie', 'februarie', 'martie', 'aprilie', 'mai', 'iunie', 'iulie', 'august', 'septembrie', 'octombrie', 'noiembrie', 'decembrie'];
                  setMemberSince(`${roMonths[d.getMonth()]} ${d.getFullYear()}`);
                }
              } catch (e) {}
            }
          }
        } catch (e) {
          console.error(e);
        }
      }

      // 3. Fallback to listing seller avatar
      if (!resolvedAvatar && userListings.length > 0) {
        const withAvatar = userListings.find((l) => l.seller?.avatar || l.seller?.avatarUrl);
        if (withAvatar) {
          resolvedAvatar = withAvatar.seller?.avatar || withAvatar.seller?.avatarUrl || '';
          if (withAvatar.seller?.name) resolvedName = withAvatar.seller.name;
        }
        if (userListings[0]?.location) resolvedLocation = userListings[0].location;
      }

      // 4. If user has a saved avatar in browser AND is own profile
      if (!resolvedAvatar && isOwnProfile && localSavedAvatar) {
        resolvedAvatar = localSavedAvatar;
      }

      // 5. Default fallback avatar: distinct per user so each profile has their own unique mascot
      if (!resolvedAvatar) {
        resolvedAvatar = getDistinctSellerAvatar(resolvedName, userName);
      }

      setProfileInfo({
        name: formatPublicName(resolvedName),
        avatar: resolvedAvatar,
        location: resolvedLocation,
      });
    }

    resolveProfile();
  }, [userName, currentUser, userListings]);

  const sellerLocation = profileInfo.location || userListings[0]?.location || 'Timișoara, România';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] dark:bg-[#12161f] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar favoriteCount={0} />

      <main className="max-w-[960px] w-full mx-auto flex-grow py-8 sm:py-10 px-6 sm:px-10 lg:px-12">
        
        {/* Top Profile Header Card - Wallapop Modern Style */}
        <div className="bg-white dark:bg-[#1a2332] rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-[#2d3b4e] p-6 sm:p-8 shadow-xs mb-8 transition-all">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            {/* Left Side: Avatar, Name, Verified Badge, Rating Stars */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* User Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-[3.5px] border-[#bbf0dc] dark:border-[#1a4a40] shadow-md bg-slate-100 dark:bg-[#181818]">
                  <img
                    src={profileInfo.avatar || '/images/avatar/an32.png'}
                    alt={profileInfo.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                    }}
                  />
                </div>
                {/* Small online indicator */}
                <span className="absolute bottom-0 right-0 w-5 h-5 bg-[#00c1a2] border-2 border-white dark:border-[#1a2332] rounded-full shadow-xs" title="Online" />
              </div>

              {/* User Info Details */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {formatPublicName(profileInfo.name || userName)}
                </h1>

                {/* Verified Badge */}
                <div className="flex items-center gap-1.5 mt-1 text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                  <span>Profil verificat</span>
                  <BadgeCheck size={18} className="text-white dark:text-[#12161f] fill-slate-900 dark:fill-white" />
                </div>

                {/* Rating Stars Row */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  {reviewsList.length > 0 ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={15}
                            className={
                              star <= avgStarsInt
                                ? 'fill-slate-900 text-slate-900 dark:fill-amber-400 dark:text-amber-400'
                                : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 ml-1">
                        {avgRatingScore} <span className="font-normal text-slate-400 dark:text-slate-400">({reviewsList.length})</span>
                      </span>
                    </>
                  ) : (
                    <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
                      Nicio recenzie încă (0)
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Right Side: Stats & Location */}
            <div className="flex flex-col md:items-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-[#2a3647]">
                {/* Line 1: Sales & Purchases */}
                <div className="flex flex-wrap items-center md:justify-end gap-4 text-sm text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="var(--chds-color-magenta-low, #fca1cd)" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                      <g clipPath="url(#a)">
                        <path fillRule="evenodd" d="M16.5 22.5H15V18a2.25 2.25 0 0 0-2.25-2.25h-1.5A2.25 2.25 0 0 0 9 18v4.5H7.5v-9.75a2.25 2.25 0 0 0-2.25-2.25h-1.5a2.25 2.25 0 0 0-2.25 2.25v9.75H.75a.75.75 0 0 0 0 1.5h22.5a.75.75 0 0 0 0-1.5h-.75V2.25A2.25 2.25 0 0 0 20.25 0h-1.5a2.25 2.25 0 0 0-2.25 2.25z" clipRule="evenodd"></path>
                      </g>
                      <defs>
                        <clipPath id="a">
                          <path d="M0 0h24v24H0z"></path>
                        </clipPath>
                      </defs>
                    </svg>
                    <span>
                      <strong className="font-bold">{userListings.length}</strong> {userListings.length === 1 ? 'Anunț' : 'Anunțuri'}
                    </span>
                  </div>
                  <div>
                    <span>
                      <strong className="font-bold">{reviewsList.length}</strong> {reviewsList.length === 1 ? 'Recenzie' : 'Recenzii'}
                    </span>
                  </div>
                </div>

                {/* Line 2: Shipments / Livrări */}
                <div className="flex items-center md:justify-end gap-2 text-sm text-slate-800 dark:text-slate-200">
                  <Package size={18} className="text-slate-700 dark:text-slate-300 stroke-[1.5]" />
                  <span>
                    <strong className="font-bold">{userListings.filter(l => l.hasShipping).length}</strong> Cu Livrare
                  </span>
                </div>

                {/* Line 3: Location */}
                <div className="flex items-center md:justify-end gap-2 text-sm text-slate-800 dark:text-slate-200 mt-1">
                  <MapPin size={18} className="text-slate-700 dark:text-slate-300 stroke-[1.5]" />
                  <span>{sellerLocation}</span>
                  <button
                    type="button"
                    onClick={() => setShowLocationModal(true)}
                    className="text-teal-600 dark:text-teal-400 font-medium hover:underline hover:underline-offset-2 ml-1 cursor-pointer"
                  >
                    Vezi locația
                  </button>
                </div>
            </div>

          </div>
        </div>

        {/* Navigation Tabs Bar with Favorite / Follow Toggle */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#2d3b4e] mb-6 overflow-x-auto select-none">
          
          {/* Tabs on Left */}
          <div className="flex items-center gap-8 sm:gap-12">
            
            {/* Tab 1: De vânzare / En venta */}
            <button
              onClick={() => setActiveTab('anunturi')}
              className={`flex flex-col items-center pb-3 transition-all relative outline-none ${
                activeTab === 'anunturi'
                  ? 'text-slate-900 dark:text-white font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <span className="text-base sm:text-lg leading-tight font-black">
                {userListings.length}
              </span>
              <span className="text-xs sm:text-sm mt-0.5 whitespace-nowrap">
                În vânzare
              </span>
              {activeTab === 'anunturi' && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#00c1a2] rounded-full" />
              )}
            </button>

            {/* Tab 2: Recenzii / Valoraciones */}
            <button
              onClick={() => setActiveTab('recenzii')}
              className={`flex flex-col items-center pb-3 transition-all relative outline-none ${
                activeTab === 'recenzii'
                  ? 'text-slate-900 dark:text-white font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <span className="text-base sm:text-lg leading-tight font-black">
                {reviewsList.length}
              </span>
              <span className="text-xs sm:text-sm mt-0.5 whitespace-nowrap">
                Recenzii
              </span>
              {activeTab === 'recenzii' && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#00c1a2] rounded-full" />
              )}
            </button>

            {/* Tab 3: Urmăritori / Seguidores */}
            <button
              onClick={() => setActiveTab('urmaritori')}
              className={`flex flex-col items-center pb-3 transition-all relative outline-none ${
                activeTab === 'urmaritori'
                  ? 'text-slate-900 dark:text-white font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <span className="text-base sm:text-lg leading-tight font-black">
                {isFollowing ? 1 : 0}
              </span>
              <span className="text-xs sm:text-sm mt-0.5 whitespace-nowrap">
                Urmăritori
              </span>
              {activeTab === 'urmaritori' && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#00c1a2] rounded-full" />
              )}
            </button>

            {/* Tab 4: Informații / Info */}
            <button
              onClick={() => setActiveTab('info')}
              className={`flex flex-col items-center pb-3 transition-all relative outline-none ${
                activeTab === 'info'
                  ? 'text-slate-900 dark:text-white font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-semibold'
              }`}
            >
              <span className="text-base sm:text-lg leading-tight font-black">
                +
              </span>
              <span className="text-xs sm:text-sm mt-0.5 whitespace-nowrap">
                Info
              </span>
              {activeTab === 'info' && (
                <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#00c1a2] rounded-full" />
              )}
            </button>

          </div>

          {/* Right Action: Usuario favorito / Share */}
          <div className="flex items-center gap-3 pb-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#253245] transition-colors"
              title="Distribuie profilul"
            >
              <Share2 size={18} />
            </button>

            <button
              type="button"
              onClick={handleToggleFollow}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 shadow-xs cursor-pointer ${
                isFollowing
                  ? 'bg-slate-100 dark:bg-[#1f2b3d] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
                  : 'bg-[#00c1a2] hover:bg-[#00a88d] text-white shadow-sm hover:scale-105 active:scale-95'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={16} className="text-teal-600 dark:text-teal-400" />
                  <span>Urmărești</span>
                </>
              ) : (
                <>
                  <Users size={16} />
                  <span>Urmărește</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Tab 1 Content: În vânzare (Listings) */}
        {activeTab === 'anunturi' && (
          <div className="space-y-6">
            {userListings.length > 0 ? (
              <div>
                <ListingGrid
                  listings={userListings}
                  favorites={[]}
                  onToggleFavorite={() => {}}
                  title="Anunțurile utilizatorului"
                  maxColumns={4}
                />
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200/80 dark:border-[#2d3b4e] py-16 px-6 text-center shadow-xs">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Niciun anunț activ
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Acest utilizator nu are niciun anunț publicat în acest moment.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2 Content: Recenzii (Valoraciones) */}
        {activeTab === 'recenzii' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Sidebar (Left) */}
            <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-6">
              
              {/* Rating Breakdown Card */}
              <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200/80 dark:border-[#2d3b4e] p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="fill-slate-900 text-slate-900 dark:fill-white dark:text-white" size={24} />
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{avgRatingScore}</span>
                  <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">({reviewsList.length})</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {ratingDistribution.map((row) => (
                    <div key={row.stars} className="flex items-center gap-3 text-sm">
                      <span className="w-2 font-bold text-slate-600 dark:text-slate-300">{row.stars}</span>
                      <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-slate-800 dark:bg-slate-300 rounded-full" 
                          style={{ width: `${row.percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right font-medium text-slate-500 dark:text-slate-400 text-xs">
                        {row.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filters Card */}
              <div className="bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200/80 dark:border-[#2d3b4e] p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Filtre</h3>
                
                {/* Tranzacții Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Tranzacții:</h4>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-[6px] border-slate-800 dark:border-white flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Toate</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Vânzător</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Cumpărător</span>
                    </label>
                  </div>
                </div>

                {/* Forma de livrare Filter */}
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Forma de livrare:</h4>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-[6px] border-slate-800 dark:border-white flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Toate</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Livrare</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-400 dark:border-slate-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">În persoană</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Reviews Content (Right) */}
            <div className="md:col-span-7 lg:col-span-8 bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200/80 dark:border-[#2d3b4e] p-6 shadow-sm">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100 dark:border-[#2d3b4e]">
                <button className="flex items-center gap-2 border border-slate-300 dark:border-slate-600 rounded-full px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors w-max">
                  Sortează: Cele mai recente
                  <ChevronDown size={16} />
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(true)}
                  className="flex items-center gap-2 bg-[#00c1a2] hover:bg-[#00a88d] text-white font-bold px-4 py-2 rounded-full text-sm shadow-sm transition-all hover:scale-105 cursor-pointer w-max"
                >
                  <PenLine size={15} />
                  <span>Scrie o recenzie</span>
                </button>
              </div>

              {reviewsList.length === 0 ? (
                <div className="text-center py-14 px-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                    <Star size={28} />
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                    Nicio recenzie încă
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                    {userName} nu are încă evaluări de la cumpărători.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAddReviewModal(true)}
                    className="bg-[#00c1a2] hover:bg-[#00a88d] text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                  >
                    <PenLine size={16} />
                    <span>Fii primul care lasă o recenzie</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {reviewsList.map((review, idx) => {
                    const avatarList = [
                      '/images/avatar/an33.png',
                      '/images/avatar/an34.png',
                      '/images/avatar/an35.png',
                      '/images/avatar/an36.png',
                      '/images/avatar/an37.png',
                      '/images/avatar/an38.png',
                      '/images/avatar/an39.png',
                      '/images/avatar/an40.png',
                      '/images/avatar/an41.png',
                      '/images/avatar/an42.png',
                    ];
                    const reviewerAvatar = avatarList[idx % avatarList.length];

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-[#2a3647] pb-8 last:border-0 last:pb-0">
                        
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden shadow-xs border-2 border-[#bbf0dc] dark:border-[#1a4a40] bg-slate-100 dark:bg-[#181818]">
                            <img
                              src={reviewerAvatar}
                              alt={review.reviewer}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                              }}
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                            <div>
                              <h4 className="font-bold text-slate-900 dark:text-white text-base">{review.reviewer}</h4>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                {idx % 3 === 0 ? 'Membru Tevinde.ro din 2025' : `Membru Tevinde.ro din 2024`}
                              </p>
                            </div>
                            <div className="flex flex-col sm:items-end">
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    size={15}
                                    className={
                                      star <= (review.stars || 5)
                                        ? 'fill-[#12161f] text-[#12161f] dark:fill-white dark:text-white'
                                        : 'fill-slate-200 text-slate-200 dark:fill-slate-700 dark:text-slate-700'
                                    }
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{review.date}</span>
                            </div>
                          </div>

                          {/* Review Text */}
                          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed mb-4">
                            "{review.text}"
                          </p>

                          {/* Item Reference */}
                          <div className="flex items-center justify-between bg-slate-50 dark:bg-[#151c28] rounded-xl p-3 border border-slate-100 dark:border-[#2a3647] group cursor-pointer hover:bg-slate-100/80 dark:hover:bg-[#1c2636] transition-colors">
                            <div className="min-w-0">
                              <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-0.5">
                                {review.action.includes('Livrare') ? 'Vândut prin livrare:' : 'Tranzacție în persoană:'}
                              </p>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">
                                {review.item}
                              </p>
                            </div>
                            <ArrowRight size={16} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors mr-1" />
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3 Content: Info */}
        {activeTab === 'info' && (
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-[#2d3b4e] p-6 sm:p-8 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Column 1: Informații verificate & Membru din (md:col-span-4) */}
              <div className="md:col-span-4 flex flex-col justify-between space-y-6">
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                    Informații verificate
                  </h3>
                  <div className="space-y-3 text-sm">
                    {/* Email */}
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Mail size={16} className="text-slate-500 dark:text-slate-400" />
                      <span>Email</span>
                      <BadgeCheck size={16} className="text-teal-500 dark:text-teal-400 ml-0.5" />
                    </div>

                    {/* Facebook */}
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <svg className="w-4 h-4 fill-current text-slate-400 dark:text-slate-500" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      <span>Facebook</span>
                    </div>

                    {/* Număr de telefon */}
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                      <Phone size={16} className="text-slate-500 dark:text-slate-400" />
                      <span>Număr de telefon</span>
                      <BadgeCheck size={16} className="text-teal-500 dark:text-teal-400 ml-0.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-1">
                    Membru din
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {memberSince}
                  </p>
                </div>
              </div>

              {/* Column 2: Timp de răspuns (md:col-span-3) */}
              <div className="md:col-span-3">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                  Timp de răspuns
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Răspunde de obicei rapid (în câteva ore)
                </p>
              </div>

              {/* Column 3: Locație cu Hartă (md:col-span-5) */}
              <div className="md:col-span-5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3">
                  Locație
                </h3>

                {/* Map Box */}
                <div
                  className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden border border-slate-200 dark:border-[#2d3b4e] bg-[#f4efe6] shadow-xs group cursor-pointer"
                  onClick={() => setShowLocationModal(true)}
                  title="Haz clic para ver ubicación en pantalla completa o Google Maps"
                >
                  {/* Stylized Pastel Vector Map */}
                  <svg className="w-full h-full object-cover select-none" viewBox="0 0 500 220" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Land */}
                    <rect width="100%" height="100%" fill="#f4efe6" />

                    {/* Park Green Areas */}
                    <path d="M 320 0 L 500 0 L 500 120 L 450 120 L 400 70 L 320 50 Z" fill="#d5e8ca" />
                    <path d="M 430 140 L 500 130 L 500 220 L 390 220 Z" fill="#dcedcf" />
                    <path d="M 0 170 L 120 180 L 140 220 L 0 220 Z" fill="#e2eed6" />
                    <path d="M 280 50 L 360 50 L 370 120 L 290 140 Z" fill="#e9f3e0" opacity="0.8" />

                    {/* City Blocks / Buildings Light Shading */}
                    <rect x="290" y="20" width="40" height="35" rx="3" fill="#e7e0d3" />
                    <rect x="340" y="20" width="30" height="25" rx="3" fill="#e7e0d3" />
                    <rect x="420" y="20" width="50" height="40" rx="4" fill="#dfd6c7" />
                    <rect x="420" y="70" width="40" height="30" rx="3" fill="#e7e0d3" />
                    <rect x="430" y="160" width="50" height="40" rx="4" fill="#e7e0d3" />
                    <rect x="360" y="150" width="40" height="35" rx="3" fill="#dfd6c7" />
                    <rect x="20" y="20" width="60" height="60" rx="4" fill="#e7e0d3" />

                    {/* Secondary Roads (White with Border) */}
                    <path d="M 200 0 L 280 220" stroke="#d5ccc0" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.4" />
                    <path d="M 200 0 L 280 220" stroke="#ffffff" strokeWidth="12" fill="none" strokeLinecap="round" />
                    
                    <path d="M 270 120 L 500 90" stroke="#d5ccc0" strokeWidth="12" fill="none" opacity="0.4" />
                    <path d="M 270 120 L 500 90" stroke="#ffffff" strokeWidth="8" fill="none" />

                    <path d="M 0 60 L 230 110" stroke="#d5ccc0" strokeWidth="14" fill="none" opacity="0.4" />
                    <path d="M 0 60 L 230 110" stroke="#ffffff" strokeWidth="10" fill="none" />

                    <path d="M 230 110 L 400 220" stroke="#d5ccc0" strokeWidth="18" fill="none" opacity="0.4" />
                    <path d="M 230 110 L 400 220" stroke="#ffffff" strokeWidth="14" fill="none" />

                    {/* Main Highway Curve (Yellow/Orange with Borders) */}
                    <path d="M 170 0 C 160 80, 160 140, 180 180 C 190 200, 210 220, 230 220" stroke="#ffeb99" strokeWidth="22" fill="none" strokeLinecap="round" />
                    <path d="M 170 0 C 160 80, 160 140, 180 180 C 190 200, 210 220, 230 220" stroke="#f6c257" strokeWidth="18" fill="none" strokeLinecap="round" />
                    <path d="M 170 0 C 160 80, 160 140, 180 180 C 190 200, 210 220, 230 220" stroke="#fff4b8" strokeWidth="14" fill="none" strokeLinecap="round" />

                    <path d="M 180 180 C 170 195, 150 210, 120 220" stroke="#f6c257" strokeWidth="12" fill="none" strokeLinecap="round" />
                    <path d="M 180 180 C 170 195, 150 210, 120 220" stroke="#fff4b8" strokeWidth="8" fill="none" strokeLinecap="round" />

                    {/* Highway Green Road Label */}
                    <g transform="translate(170, 205)">
                      <rect x="-18" y="-7" width="36" height="14" rx="2" fill="#38a169" />
                      <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A-3050</text>
                    </g>
                  </svg>

                  {/* Center Wallapop Signature Pin with Face */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none group-hover:scale-110 transition-transform duration-200">
                    <div className="w-14 h-14 rounded-full bg-[#00c1a2] flex items-center justify-center shadow-lg border-[3px] border-white relative">
                      {/* Face circle */}
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                        <div className="flex items-center gap-1.5 text-[#1b3a4b] font-mono text-xs font-black select-none">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1b3a4b]"></span>
                          <span className="text-[10px] leading-none mb-0.5">‿</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1b3a4b]"></span>
                        </div>
                      </div>
                      {/* Pin notch */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#00c1a2]" />
                    </div>
                    {/* Shadow */}
                    <div className="w-6 h-2 bg-slate-900/25 rounded-full blur-[1px] mt-2" />
                  </div>

                  {/* Bottom Right Info Icon */}
                  <div className="absolute bottom-2.5 right-2.5 w-5 h-5 rounded-full bg-black/85 text-white flex items-center justify-center text-[11px] font-serif font-bold shadow-md" title="Información del mapa">
                    i
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab 4 Content: Urmăritori (Followers) */}
        {activeTab === 'urmaritori' && (
          <div className="bg-white dark:bg-[#1a2332] rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-[#2d3b4e] p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 dark:border-[#2a3647]">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Urmăritorii lui {userName}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  {isFollowing ? 1 : 0} {isFollowing ? 'utilizator urmărește acest profil' : 'utilizatori urmăresc acest profil'}
                </p>
              </div>

              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 text-sm font-bold bg-teal-50 dark:bg-teal-950/40 px-3.5 py-1.5 rounded-full border border-teal-200 dark:border-teal-800/60">
                <Users size={16} />
                <span>{isFollowing ? 1 : 0} {isFollowing ? 'Urmăritor' : 'Urmăritori'}</span>
              </div>
            </div>

            {isFollowing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-800/60 shadow-xs flex flex-col justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#00c1a2] bg-slate-100 dark:bg-slate-800 flex-shrink-0 shadow-md">
                      <img
                        src={currentUser?.photoURL || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null) || '/images/avatar/an32.png'}
                        alt="Tu"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">
                          Tu ({currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Utilizator')})
                        </h4>
                        <span className="text-[10px] font-bold bg-[#00c1a2] text-white px-2 py-0.5 rounded-full">Tu</span>
                      </div>
                      <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold block truncate mt-0.5">Urmărești acest profil</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-14 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Users size={28} />
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                  Niciun urmăritor încă
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto mb-5">
                  Fii primul care îl urmărește pe {userName} pentru a primi notificări când publică anunțuri noi.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    const newFollowState = await toggleFollowUser(userName, profileInfo.avatar, undefined, currentUser);
                    setIsFollowing(newFollowState);
                  }}
                  className="bg-[#00c1a2] hover:bg-[#00a88d] text-white font-bold px-6 py-2.5 rounded-full text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
                >
                  <Users size={16} />
                  <span>Urmărește profilul</span>
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Location Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2332] rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl border border-slate-200 dark:border-[#2d3b4e]">
            <button
              onClick={() => setShowLocationModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-[#263345]"
            >
              <X size={20} />
            </button>
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-4 border border-teal-200 dark:border-teal-800/60">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Locație Vânzător
              </h3>
              <p className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-6">
                {sellerLocation}
              </p>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(sellerLocation)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-[#00c1a2] hover:bg-[#00a88d] text-white font-bold text-sm shadow-md transition-all"
              >
                <span>Deschide în Google Maps</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Badge Modal */}
      {showReviewsBadgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2332] rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl border border-slate-200 dark:border-[#2d3b4e]">
            <button
              onClick={() => setShowReviewsBadgeModal(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-[#263345]"
            >
              <X size={20} />
            </button>
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-rose-500 to-amber-400 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/20 text-white">
                <Sparkles size={48} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
                Scrie multe recenzii
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 leading-relaxed">
                Acest utilizator oferă frecvent feedback util și contribuie activ la comunitatea de încredere Tevinde.ro.
              </p>
              <div className="w-full bg-slate-50 dark:bg-[#161f2c] text-slate-700 dark:text-slate-300 rounded-2xl p-4 flex items-center gap-3 text-sm text-left border border-slate-100 dark:border-[#263345]">
                <MessageSquare size={20} className="text-teal-500 flex-shrink-0" />
                <span className="font-semibold">Peste 12 recenzii detaliate publicate</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Review Modal */}
      {showAddReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#151c27] rounded-[2rem] w-full max-w-[520px] overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 transform transition-all animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 flex items-start justify-between relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 via-[#00c1a2] to-emerald-400"></div>
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Scrie o recenzie
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Împărtășește experiența ta cu <strong className="text-slate-800 dark:text-slate-200">{userName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReviewModal(false)}
                className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-[#202b3d]"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddReview} className="px-8 pb-8 space-y-6">
              {/* Star Rating Selector */}
              <div className="bg-slate-50 dark:bg-[#1a2332] rounded-3xl p-6 border border-slate-100 dark:border-[#2d3b4e] flex flex-col items-center justify-center text-center">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                  Aprecierea ta <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-125 transition-transform duration-200 outline-none cursor-pointer focus:outline-none"
                    >
                      <Star
                        size={36}
                        className={`transition-all duration-300 drop-shadow-sm ${
                          (hoverRating || newRating) >= star
                            ? 'fill-amber-400 text-amber-400 scale-110'
                            : 'fill-slate-200 text-slate-200 dark:fill-slate-700/50 dark:text-slate-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="h-6 flex items-center justify-center">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#151c27] px-4 py-1 rounded-full shadow-sm border border-slate-100 dark:border-[#2d3b4e] transition-all">
                    {newRating === 5 && '🌟 Excelent!'}
                    {newRating === 4 && '👍 Foarte bun'}
                    {newRating === 3 && '👌 Destul de bun'}
                    {newRating === 2 && '😐 Acceptabil'}
                    {newRating === 1 && '👎 Nesatisfăcător'}
                    {!newRating && 'Selectează o notă'}
                  </span>
                </div>
              </div>

              {/* Transaction Type & Item */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Tipul tranzacției
                  </label>
                  <div className="relative">
                    <select
                      value={newActionType}
                      onChange={(e) => setNewActionType(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-[#2d3b4e] text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all appearance-none cursor-pointer"
                    >
                      <option value="a cumpărat de la">Am cumpărat produsul</option>
                      <option value="a vândut lui">Am vândut produsul</option>
                      <option value="a comunicat cu">Am comunicat / colaborat</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                    Articol / Produs
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Telefon, Mașină..."
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-[#2d3b4e] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
                  />
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                  Recenzia ta detaliată <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Descrie experiența ta (comunicare, seriozitate, starea produsului)..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a2332] border border-slate-200 dark:border-[#2d3b4e] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
                />
              </div>

              {/* Livrare Monky Checkbox */}
              <label className="flex items-center gap-3 cursor-pointer select-none group w-max">
                <div className="relative flex items-center justify-center w-5 h-5">
                  <input
                    type="checkbox"
                    checked={newHasShipping}
                    onChange={(e) => setNewHasShipping(e.target.checked)}
                    className="peer appearance-none w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 checked:bg-teal-500 checked:border-teal-500 transition-colors cursor-pointer"
                  />
                  <Check size={14} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  Tranzacție efectuată prin <strong className="text-teal-600 dark:text-teal-400">Livrare Tevinde.ro</strong>
                </span>
              </label>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="px-6 py-3 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#202b3d] transition-colors"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  disabled={reviewSubmitting || !newReviewText.trim()}
                  className="relative overflow-hidden group flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-slate-900 dark:bg-teal-500 hover:bg-slate-800 dark:hover:bg-teal-400 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-white text-sm font-bold shadow-lg shadow-slate-900/20 dark:shadow-teal-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  {reviewSubmitting ? (
                    <span>Se publică...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      <span>Publică Recenzia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Success Toast */}
      {reviewToast && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#00c1a2] text-white text-xs sm:text-sm font-bold px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 size={18} />
          <span>{reviewToast}</span>
        </div>
      )}

      {/* Copy Link Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>Link-ul profilului a fost copiat în clipboard!</span>
        </div>
      )}

      <Footer />
    </div>
  );
}
