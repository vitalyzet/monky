'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import { getListings, getListingsByUserId, getListingById, deleteListingFromDb, saveOrUpdateUserInDb, updateSellerAvatarInAllListings, AdListing } from '@/lib/db';
import { getListingUrl } from '@/lib/slugUtils';
import {
  User,
  TrendingUp,
  Package,
  ShoppingBag,
  Heart,
  MessageCircle,
  Zap,
  ChevronRight,
  PlusCircle,
  LogOut,
  ExternalLink,
  Trash2,
  Camera,
  Edit2,
  Users,
  UserX,
  UserCheck,
  Check,
  X,
  Sparkles,
  Lock,
  Key,
  Bell,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  ShieldCheck,
  CheckCircle2,
  Upload,
  ImageIcon,
  Clock,
  Tag,
} from 'lucide-react';
import { signOut, updateProfile, updatePassword, sendPasswordResetEmail, deleteUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { getFollowedUsers, getFollowers, toggleFollowUser, isUserFollowed, FollowItem } from '@/lib/follow';
import { formatPublicName } from '@/lib/stringUtils';
import { getChatConversations, ChatConversation } from '@/lib/chatService';

const AVATAR_OPTIONS = [
  '/images/avatar/an32.png',
  '/images/avatar/an53.png',
  '/images/avatar/an54.png',
  '/images/avatar/an55.png',
  '/images/avatar/an57.png',
  '/images/avatar/an61.png',
  '/images/avatar/an62.png',
  '/images/avatar/an70.png',
  '/images/avatar/an71.png',
  '/images/avatar/an71-1.png',
  '/images/avatar/an74.png',
  '/images/avatar/an75.png',
  '/images/avatar/an86.png',
  '/images/avatar/an87.png',
  '/images/avatar/an89.png',
  '/images/avatar/an91.png',
  '/images/avatar/an94.png',
  '/images/avatar/an95.png',
  '/images/avatar/an97.png',
];

export default function ContulMeuPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [userListings, setUserListings] = useState<AdListing[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteListings, setFavoriteListings] = useState<AdListing[]>([]);
  const [followedUsers, setFollowedUsers] = useState<string[]>([]);
  const [followSubTab, setFollowSubTab] = useState<'followers' | 'following'>('followers');
  const [followersList, setFollowersList] = useState<FollowItem[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [activeTab, setActiveTab] = useState<'profil' | 'anunturi' | 'comenzi' | 'favorite' | 'mesaje' | 'urmariti'>('anunturi');
  const [adStatusTab, setAdStatusTab] = useState<'active' | 'pending' | 'rejected' | 'deactivated' | 'expired' | 'sold'>('active');
  const [visibleAdsCount, setVisibleAdsCount] = useState(4);

  // Profile Settings Sub-Tabs
  const [profileSubTab, setProfileSubTab] = useState<'info' | 'avatar' | 'parola' | 'notificari' | 'stergere'>('info');

  // 1. Informații Profil State
  const [newName, setNewName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userCity, setUserCity] = useState('Timișoara');
  const [userBio, setUserBio] = useState('');
  const [isSavingInfo, setIsSavingInfo] = useState(false);
  const [infoSuccess, setInfoSuccess] = useState(false);

  // 2. Avatar State
  const [selectedAvatar, setSelectedAvatar] = useState<string>('/images/avatar/an32.png');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [customUploadedPhoto, setCustomUploadedPhoto] = useState<string | null>(null);
  const [avatarSuccessMsg, setAvatarSuccessMsg] = useState<string | null>(null);

  // 3. Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // 4. Notifications State
  const [notifications, setNotifications] = useState({
    messages: true,
    priceDrops: true,
    adUpdates: true,
    promotions: false,
  });
  const [notifSavedMsg, setNotifSavedMsg] = useState(false);

  // 5. Delete Account State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    if (currentUser) {
      const savedAvatar = typeof window !== 'undefined' ? localStorage.getItem('monky_user_avatar') : null;
      const savedCustom = typeof window !== 'undefined' ? localStorage.getItem('monky_user_custom_photo') : null;
      const savedPhone = typeof window !== 'undefined' ? localStorage.getItem('monky_user_phone') : null;
      const savedCity = typeof window !== 'undefined' ? localStorage.getItem('monky_user_city') : null;
      const savedBio = typeof window !== 'undefined' ? localStorage.getItem('monky_user_bio') : null;
      const savedNotifs = typeof window !== 'undefined' ? localStorage.getItem('monky_user_notifications') : null;

      const effectiveAvatar = currentUser.photoURL || savedAvatar || '/images/avatar/an32.png';
      setSelectedAvatar(effectiveAvatar);
      
      if (savedCustom) {
        setCustomUploadedPhoto(savedCustom);
      } else if (effectiveAvatar && effectiveAvatar.startsWith('data:')) {
        setCustomUploadedPhoto(effectiveAvatar);
      }

      setNewName(currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : ''));
      if (savedPhone) setUserPhone(savedPhone);
      if (savedCity) setUserCity(savedCity);
      if (savedBio) setUserBio(savedBio);
      if (savedNotifs) {
        try {
          setNotifications(JSON.parse(savedNotifs));
        } catch (e) {}
      }

      // Load followers and followed sellers
      setFollowedUsers(getFollowedUsers());
      loadFollowers();
    }
  }, [currentUser]);

  const loadFollowers = async () => {
    setIsLoadingFollowers(true);
    try {
      const uName = newName || currentUser?.displayName || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_name') : null) || (currentUser?.email ? currentUser.email.split('@')[0] : '');
      const list = await getFollowers(uName, currentUser?.uid);
      setFollowersList(list);
    } catch (e) {
      console.error('Error loading followers:', e);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Te rugăm să selectezi un fișier imagine valid (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Imaginea depășește limita de 8MB.');
      return;
    }

    setUploadError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (!result) return;

      // Optimize on canvas for speed and compact storage
      const img = new window.Image();
      img.src = result;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 400;
          let w = img.width;
          let h = img.height;

          if (w > h) {
            if (w > MAX_DIM) {
              h = Math.round((h * MAX_DIM) / w);
              w = MAX_DIM;
            }
          } else {
            if (h > MAX_DIM) {
              w = Math.round((w * MAX_DIM) / h);
              h = MAX_DIM;
            }
          }

          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const optimized = canvas.toDataURL('image/jpeg', 0.88);
            setCustomUploadedPhoto(optimized);
            if (typeof window !== 'undefined') {
              localStorage.setItem('monky_user_custom_photo', optimized);
            }
            handleSelectAvatar(optimized, true);
            setAvatarSuccessMsg('✓ Fotografia ta a fost încărcată și salvată cu succes pe profil!');
            setTimeout(() => setAvatarSuccessMsg(null), 5000);
          } else {
            setCustomUploadedPhoto(result);
            if (typeof window !== 'undefined') {
              localStorage.setItem('monky_user_custom_photo', result);
            }
            handleSelectAvatar(result, true);
            setAvatarSuccessMsg('✓ Fotografia ta a fost încărcată și salvată cu succes pe profil!');
            setTimeout(() => setAvatarSuccessMsg(null), 5000);
          }
        } catch (err) {
          console.error('Error optimizing image:', err);
          setCustomUploadedPhoto(result);
          if (typeof window !== 'undefined') {
            localStorage.setItem('monky_user_custom_photo', result);
          }
          handleSelectAvatar(result, true);
          setAvatarSuccessMsg('✓ Fotografia ta a fost încărcată și salvată cu succes pe profil!');
          setTimeout(() => setAvatarSuccessMsg(null), 5000);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfileInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !newName.trim()) return;
    setIsSavingInfo(true);
    setInfoSuccess(false);

    try {
      await updateProfile(auth.currentUser, { 
        displayName: newName.trim(),
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('monky_user_name', newName.trim());
        localStorage.setItem('monky_user_phone', userPhone);
        localStorage.setItem('monky_user_city', userCity);
        localStorage.setItem('monky_user_bio', userBio);

        // Update seller name across all local user listings
        try {
          const userAdsStr = localStorage.getItem('monky_user_listings');
          if (userAdsStr) {
            const ads = JSON.parse(userAdsStr);
            if (Array.isArray(ads)) {
              const updatedAds = ads.map((ad: any) => ({
                ...ad,
                seller: {
                  ...ad.seller,
                  name: newName.trim(),
                },
              }));
              localStorage.setItem('monky_user_listings', JSON.stringify(updatedAds));
            }
          }
        } catch (err) {
          console.error(err);
        }

        window.dispatchEvent(new Event('storage'));
      }
      await saveOrUpdateUserInDb({
        uid: auth.currentUser.uid,
        email: auth.currentUser.email || '',
        displayName: newName.trim(),
        photoURL: selectedAvatar,
        phone: userPhone,
        createdAt: auth.currentUser.metadata.creationTime || new Date().toISOString(),
      });
      setInfoSuccess(true);
      setTimeout(() => setInfoSuccess(false), 3500);
    } catch (err) {
      console.error('Error updating profile info:', err);
    } finally {
      setIsSavingInfo(false);
    }
  };

  const handleSelectAvatar = (avatarUrl: string, isFromCustomUpload = false) => {
    // 1. Instant local state update
    setSelectedAvatar(avatarUrl);
    if (!isFromCustomUpload) {
      setAvatarSuccessMsg('✓ Avatarul a fost selectat și salvat pe profil!');
      setTimeout(() => setAvatarSuccessMsg(null), 4000);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('monky_user_avatar', avatarUrl);

      // Update all existing user listings in localStorage with the new avatar
      try {
        const userAdsStr = localStorage.getItem('monky_user_listings');
        if (userAdsStr) {
          const ads = JSON.parse(userAdsStr);
          if (Array.isArray(ads)) {
            const updatedAds = ads.map((ad: any) => ({
              ...ad,
              seller: {
                ...ad.seller,
                avatar: avatarUrl,
                avatarUrl: avatarUrl,
              },
            }));
            localStorage.setItem('monky_user_listings', JSON.stringify(updatedAds));
          }
        }
      } catch (err) {
        console.error(err);
      }

      window.dispatchEvent(new Event('storage'));
    }

    setIsAvatarModalOpen(false);

    // 2. Async Firebase & Firestore sync
    if (auth.currentUser) {
      setIsSavingAvatar(true);
      const uid = auth.currentUser.uid;
      const dName = auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || '';
      
      updateProfile(auth.currentUser, { photoURL: avatarUrl })
        .then(async () => {
          if (auth.currentUser) {
            await saveOrUpdateUserInDb({
              uid: auth.currentUser.uid,
              email: auth.currentUser.email || '',
              displayName: dName,
              photoURL: avatarUrl,
              createdAt: auth.currentUser.metadata.creationTime || new Date().toISOString(),
            });
            await updateSellerAvatarInAllListings(uid, dName, avatarUrl);
          }
        })
        .catch((err) => console.error('Error syncing avatar to Firebase:', err))
        .finally(() => setIsSavingAvatar(false));
    }
  };

  const handleSendResetEmail = async () => {
    if (!currentUser?.email) return;
    setIsSendingResetEmail(true);
    setPasswordStatus(null);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      setPasswordStatus({
        type: 'success',
        message: `Am trimis un link de resetare a parolei la adresa ${currentUser.email}. Verifică căsuța de email.`,
      });
    } catch (err: any) {
      console.error('Error sending reset email:', err);
      setPasswordStatus({
        type: 'error',
        message: 'A apărut o eroare la trimiterea email-ului de resetare.',
      });
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  const handleUpdatePasswordDirectly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'Parola trebuie să aibă cel puțin 6 caractere.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'Parolele introduse nu coincid.' });
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus(null);
    try {
      await updatePassword(auth.currentUser, newPassword);
      setPasswordStatus({ type: 'success', message: 'Parola a fost schimbată cu succes!' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error updating password:', err);
      if (err.code === 'auth/requires-recent-login') {
        setPasswordStatus({
          type: 'error',
          message: 'Pentru securitate, te rugăm să te deconectezi și să te reautentifici înainte de a schimba parola.',
        });
      } else {
        setPasswordStatus({
          type: 'error',
          message: err.message || 'Eroare la actualizarea parolei.',
        });
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('monky_user_notifications', JSON.stringify(updated));
    }
    setNotifSavedMsg(true);
    setTimeout(() => setNotifSavedMsg(false), 2500);
  };

  const handleDeleteAccountConfirm = async () => {
    if (!auth.currentUser) return;
    if (deleteConfirmText.toLowerCase() !== 'sterge') {
      setDeleteError('Scrie "STERGE" pentru a confirma.');
      return;
    }

    setIsDeletingAccount(true);
    setDeleteError('');
    try {
      await deleteUser(auth.currentUser);
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
      router.push('/');
    } catch (err: any) {
      console.error('Error deleting user:', err);
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Pentru securitate, este necesară o reautentificare recentă înainte de ștergerea contului.');
      } else {
        setDeleteError(err.message || 'Eroare la ștergerea contului.');
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/autentificare');
    }
  }, [currentUser, loading, router]);

  useEffect(() => {
    const loadData = async () => {
      let localUserAds: AdListing[] = [];
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
        const saved = localStorage.getItem('monky_user_listings');
        if (saved) {
          localUserAds = (JSON.parse(saved) as AdListing[]).filter(
            (item) => !deletedIds.includes(item.id)
          );
        }
      } catch (e) {
        console.error('Error loading local user listings:', e);
      }

      try {
        let firestoreAds: AdListing[] = [];
        if (currentUser) {
          firestoreAds = await getListingsByUserId(currentUser.uid);
        }
        
        const combined = [...localUserAds];
        firestoreAds.forEach((ad) => {
          if (!deletedIds.includes(ad.id) && !combined.some((item) => item.id === ad.id)) {
            combined.push(ad);
          }
        });
        setUserListings(combined);

        // Favorites filtering
        const savedFavs = localStorage.getItem('monky_favorites');
        if (savedFavs) {
          const parsed: string[] = JSON.parse(savedFavs);
          
          if (parsed.length > 0) {
            // Fetch all favorites concurrently
            const favPromises = parsed.map(id => getListingById(id));
            const favResults = await Promise.all(favPromises);
            // Filter out nulls in case some favorites were deleted
            const validFavs = favResults.filter((fav): fav is AdListing => fav !== null);
            setFavoriteListings(validFavs);
            
            // Clean up deleted ones
            if (validFavs.length !== parsed.length) {
              const validIds = validFavs.map(f => f.id);
              setFavoriteIds(validIds);
              localStorage.setItem('monky_favorites', JSON.stringify(validIds));
            } else {
              setFavoriteIds(parsed);
            }
          } else {
            setFavoriteIds([]);
            setFavoriteListings([]);
          }
        }
        // Followed users loading
        setFollowedUsers(getFollowedUsers());
      } catch (err) {
        console.error('Error loading listings:', err);
        setUserListings(localUserAds);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error(err);
    }
  };


  const handleDeleteListing = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Sigur doriți să ștergeți acest anunț?')) {
      // 1. Remove from state immediately
      setUserListings((prev) => prev.filter((item) => item.id !== id));

      // 2. Add to deleted IDs in localStorage
      try {
        const savedDeleted = localStorage.getItem('monky_deleted_listings');
        const deletedIds: string[] = savedDeleted ? JSON.parse(savedDeleted) : [];
        if (!deletedIds.includes(id)) {
          localStorage.setItem('monky_deleted_listings', JSON.stringify([...deletedIds, id]));
        }
      } catch (e) {
        console.error(e);
      }

      // 3. Update monky_user_listings in localStorage
      try {
        const saved = localStorage.getItem('monky_user_listings');
        if (saved) {
          const parsed: AdListing[] = JSON.parse(saved);
          const updated = parsed.filter((item) => item.id !== id);
          localStorage.setItem('monky_user_listings', JSON.stringify(updated));
        }
      } catch (e) {
        console.error(e);
      }

      // 4. Delete from Firestore asynchronously
      try {
        await deleteListingFromDb(id);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const removeFavorite = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const updatedIds = favoriteIds.filter((favId) => favId !== id);
    setFavoriteIds(updatedIds);
    setFavoriteListings((prev) => prev.filter((item) => item.id !== id));
    localStorage.setItem('monky_favorites', JSON.stringify(updatedIds));
  };

  const activeListings = userListings.filter((l) => (l.status || 'active') === 'active');
  const pendingListings = userListings.filter((l) => l.status === 'pending');
  const rejectedListings = userListings.filter((l) => l.status === 'rejected');
  const deactivatedListings = userListings.filter((l) => l.status === 'deactivated');
  const expiredListings = userListings.filter((l) => l.status === 'expired');
  const soldListings = userListings.filter((l) => l.status === 'sold');

  const currentTabListings = 
    adStatusTab === 'active' ? activeListings :
    adStatusTab === 'pending' ? pendingListings :
    adStatusTab === 'rejected' ? rejectedListings :
    adStatusTab === 'deactivated' ? deactivatedListings :
    adStatusTab === 'expired' ? expiredListings :
    adStatusTab === 'sold' ? soldListings : [];

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f6] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar favoriteCount={favoriteIds.length} />

      <main className="main-container flex-grow max-w-[1000px] mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Contul meu
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              Gestionează informațiile contului tău
            </p>
          </div>

          {currentUser && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 bg-white dark:bg-[#242424] px-4 py-2 rounded-xl border border-slate-200 dark:border-[#333333] shadow-sm transition-all"
            >
              <LogOut size={14} />
              Deconectare
            </button>
          )}
        </div>

        {/* 1. Stripe Verification Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-600 to-teal-700 rounded-3xl p-6 md:p-7 text-white shadow-xl shadow-emerald-900/10 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0 text-white shadow-inner">
              <TrendingUp size={28} />
            </div>
            <div>
              <span className="inline-block text-[11px] font-bold tracking-widest uppercase text-emerald-100 mb-1 opacity-90">
                Verificare în curs
              </span>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight leading-snug">
                Finalizează verificarea și începe să vinzi
              </h2>
              <p className="text-emerald-100/90 text-xs md:text-sm mt-1 max-w-xl">
                Mai durează doar câteva minute. Apasă să continui verificarea Stripe.
              </p>
            </div>
          </div>

          <button className="bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-6 py-3 rounded-full transition-all shadow-md flex items-center gap-1.5 text-sm flex-shrink-0 self-stretch md:self-auto justify-center">
            <span>Continuă verificarea</span>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* 2. Stats Grid (2x2) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Anunțuri */}
          <div
            onClick={() => setActiveTab('anunturi')}
            className={`bg-white dark:bg-[#242424] rounded-2xl p-5 border border-slate-200 dark:border-[#333333] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'anunturi' ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#333333] flex items-center justify-center text-emerald-500 flex-shrink-0">
              <Package size={24} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                {userListings.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Anunțuri
              </span>
            </div>
          </div>

          {/* Card 2: Comenzi */}
          <div
            onClick={() => setActiveTab('comenzi')}
            className={`bg-white dark:bg-[#242424] rounded-2xl p-5 border border-slate-200 dark:border-[#333333] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'comenzi' ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#333333] flex items-center justify-center text-emerald-500 flex-shrink-0">
              <ShoppingBag size={24} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                0
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Comenzi
              </span>
            </div>
          </div>

          {/* Card 3: Favorite */}
          <div
            onClick={() => setActiveTab('favorite')}
            className={`bg-white dark:bg-[#242424] rounded-2xl p-5 border border-slate-200 dark:border-[#333333] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'favorite' ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#333333] flex items-center justify-center text-emerald-500 flex-shrink-0">
              <Heart size={24} className="text-emerald-500 fill-emerald-500/20" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                {favoriteIds.length}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Favorite
              </span>
            </div>
          </div>

          {/* Card 4: Mesaje */}
          <div
            onClick={() => setActiveTab('mesaje')}
            className={`bg-white dark:bg-[#242424] rounded-2xl p-5 border border-slate-200 dark:border-[#333333] shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-4 ${
              activeTab === 'mesaje' ? 'ring-2 ring-emerald-500/50 border-emerald-500' : ''
            }`}
          >
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#333333] flex items-center justify-center text-emerald-500 flex-shrink-0">
              <MessageCircle size={24} />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 dark:text-white block leading-tight">
                1
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mesaje
              </span>
            </div>
          </div>
        </div>

        {/* 3. Promotions Card */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md flex-shrink-0">
              <Zap size={22} className="fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                0 Promovări disponibile
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Nu ai promovări. Cumpără un pachet acum!
              </p>
            </div>
          </div>

          <button className="bg-white dark:bg-[#242424] border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-[#2d2d2d] text-emerald-600 dark:text-emerald-400 font-bold px-5 py-2.5 rounded-xl transition-all text-xs sm:text-sm flex-shrink-0 self-stretch sm:self-auto text-center">
            Cumpără promovări
          </button>
        </div>

        {/* 4. Tab Content Section */}
        <div className="bg-white dark:bg-[#242424] rounded-3xl p-6 border border-slate-200 dark:border-[#333333] shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-[#333333] pb-4 mb-6 gap-4">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('profil')}
                className={`flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors pb-1 border-b-2 ${
                  activeTab === 'profil'
                    ? 'text-blue-600 dark:text-sky-400 border-blue-600 dark:border-sky-400'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <User size={18} /> Profil
              </button>
              <button
                onClick={() => setActiveTab('anunturi')}
                className={`flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors pb-1 border-b-2 ${
                  activeTab === 'anunturi'
                    ? 'text-blue-600 dark:text-sky-400 border-blue-600 dark:border-sky-400'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Package size={18} /> Anunțurile mele
              </button>
              <button
                onClick={() => setActiveTab('favorite')}
                className={`flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors pb-1 border-b-2 ${
                  activeTab === 'favorite'
                    ? 'text-blue-600 dark:text-sky-400 border-blue-600 dark:border-sky-400'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Heart size={18} /> Favorite
              </button>
              <button
                onClick={() => {
                  setActiveTab('urmariti');
                  setFollowedUsers(getFollowedUsers());
                  loadFollowers();
                }}
                className={`flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors pb-1 border-b-2 ${
                  activeTab === 'urmariti'
                    ? 'text-blue-600 dark:text-sky-400 border-blue-600 dark:border-sky-400'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Users size={18} /> Urmăritori & Urmăriți
              </button>
              <button
                onClick={() => setActiveTab('mesaje')}
                className={`flex items-center gap-2 font-bold text-sm sm:text-base whitespace-nowrap transition-colors pb-1 border-b-2 ${
                  activeTab === 'mesaje'
                    ? 'text-blue-600 dark:text-sky-400 border-blue-600 dark:border-sky-400'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <MessageCircle size={18} /> Mesaje
              </button>
            </div>

            <Link
              href="/adauga-anunt"
              className="inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm transition-all flex-shrink-0"
            >
              <PlusCircle size={16} />
              <span>Adaugă Anunț Nou</span>
            </Link>
          </div>

          {activeTab === 'profil' && (
            <div className="space-y-6">
              {/* Profile Sub-Navigation Tabs with Pill Indicators (Matching Screenshot) */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-slate-100 dark:border-[#333333]">
                {[
                  { id: 'info', label: 'Informații Profil', icon: User },
                  { id: 'avatar', label: 'Avatar', icon: Camera },
                  { id: 'parola', label: 'Setează o parolă', icon: Key },
                  { id: 'notificari', label: 'Setări Notificări', icon: Bell },
                  { id: 'stergere', label: 'Ștergere cont', icon: Trash2 },
                ].map((tab) => {
                  const isActive = profileSubTab === tab.id;
                  const Icon = tab.icon;
                  const isDelete = tab.id === 'stergere';
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setProfileSubTab(tab.id as any)}
                      className={`flex flex-col items-center gap-1.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActive
                          ? isDelete
                            ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-extrabold shadow-xs'
                            : 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-xs'
                          : isDelete
                            ? 'text-red-500/70 hover:text-red-600 hover:bg-red-50/40 dark:hover:bg-red-950/20'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-[#202020]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span>{tab.label}</span>
                      </div>
                      {/* Pill Indicator matching Screenshot 1 */}
                      <span
                        className={`h-1.5 w-8 rounded-full transition-all duration-300 ${
                          isActive
                            ? isDelete
                              ? 'bg-red-500'
                              : 'bg-[#00c1a2]'
                            : 'bg-slate-200 dark:bg-[#333d4b]'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              {/* 1. Informații Profil Sub-tab */}
              {profileSubTab === 'info' && (
                <div className="space-y-6 pt-2">
                  {/* Top Profile Summary Card */}
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 bg-slate-50 dark:bg-[#1c1c1c] rounded-2xl border border-slate-200/80 dark:border-[#333]">
                    <div 
                      onClick={() => setProfileSubTab('avatar')}
                      className="relative group cursor-pointer flex-shrink-0"
                      title="Apasă pentru a schimba avatarul"
                    >
                      <img
                        src={selectedAvatar || currentUser?.photoURL || '/images/avatar/an32.png'}
                        alt="Profile"
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-emerald-500/30 shadow-md group-hover:scale-105 transition-all"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                        }}
                      />
                      <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md border-2 border-white dark:border-[#1c1c1c]">
                        <Camera size={12} />
                      </span>
                    </div>

                    <div className="flex-grow text-center sm:text-left space-y-2">
                      <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatPublicName(newName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Utilizator Monky')}
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <span className="px-3 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-800/40">
                          Cont Verificat
                        </span>
                        <span className="px-3 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-800/40">
                          Membru din {new Date().getFullYear()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Profile Edit Form */}
                  <form onSubmit={handleSaveProfileInfo} className="space-y-4 max-w-2xl">
                    {infoSuccess && (
                      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 size={18} />
                        <span>Informațiile de profil au fost salvate cu succes!</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Nume Utilizator / Nume Public *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ex: Alexandru Popescu"
                            className="w-full bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#3a3a3a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all pl-10"
                          />
                          <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Adresă Email (Conectat)
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            disabled
                            value={currentUser?.email || ''}
                            className="w-full bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-[#2a2a2a] rounded-xl px-4 py-2.5 text-sm text-slate-500 dark:text-slate-400 font-medium pl-10 cursor-not-allowed"
                          />
                          <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                          <span className="absolute right-3 top-2.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                            Verificat
                          </span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Număr de Telefon
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            placeholder="Ex: 0722 123 456"
                            className="w-full bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#3a3a3a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all pl-10"
                          />
                          <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        </div>
                      </div>

                      {/* Location / City */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                          Oraș / Județ
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={userCity}
                            onChange={(e) => setUserCity(e.target.value)}
                            placeholder="Ex: Timișoara, Timiș"
                            className="w-full bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#3a3a3a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all pl-10"
                          />
                          <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Despre Tine / Descriere Profil
                      </label>
                      <textarea
                        rows={3}
                        value={userBio}
                        onChange={(e) => setUserBio(e.target.value)}
                        placeholder="Adaugă câteva detalii despre tine sau despre produsele pe care le vinzi..."
                        className="w-full bg-slate-50 dark:bg-[#1f1f1f] border border-slate-200 dark:border-[#3a3a3a] rounded-xl p-3.5 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={isSavingInfo}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSavingInfo ? (
                          <span>Se salvează...</span>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>Salvează Modificările</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 2. Avatar Sub-tab */}
              {profileSubTab === 'avatar' && (
                <div className="space-y-6 pt-2">
                  {/* Success Alert Banner when avatar is uploaded or saved */}
                  {avatarSuccessMsg && (
                    <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                        <Check size={20} strokeWidth={3} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-sm">Foto încărcată și salvată!</h4>
                        <p className="text-xs text-emerald-100 font-medium">{avatarSuccessMsg}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAvatarSuccessMsg(null)}
                        className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  {/* Current Avatar & Actions Card */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50 dark:bg-[#1c1c1c] rounded-3xl border border-slate-200/80 dark:border-[#333]">
                    <div className="relative flex-shrink-0">
                      <img
                        src={selectedAvatar || '/images/avatar/an32.png'}
                        alt="Avatar activ"
                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl object-cover bg-slate-100 dark:bg-[#282828] border-4 border-emerald-500 shadow-xl"
                      />
                      <span className="absolute -top-2 -right-2 px-3 py-1 bg-emerald-500 text-white text-[11px] font-black rounded-full shadow-md uppercase tracking-wider">
                        Activ
                      </span>
                    </div>

                    <div className="text-center sm:text-left space-y-3 flex-grow">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                          Personalizează-ți Avatarul
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                          Poți încărca o fotografie proprie din galeria ta sau poți alege un personaj ilustrat din colecția Monky.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                        {/* Custom Photo Upload Button */}
                        <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
                          <Upload size={16} />
                          <span>{isSavingAvatar ? 'Se încarcă...' : 'Încarcă o Poză Proprie'}</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleCustomPhotoUpload}
                            className="hidden"
                            disabled={isSavingAvatar}
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsAvatarModalOpen(true)}
                          className="inline-flex items-center gap-2 bg-white dark:bg-[#282828] hover:bg-slate-100 dark:hover:bg-[#333] text-slate-800 dark:text-slate-200 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-[#3a3a3a] transition-all cursor-pointer"
                        >
                          <Sparkles size={16} className="text-amber-500" />
                          <span>Deschide Galeria</span>
                        </button>
                      </div>

                      {uploadError && (
                        <p className="text-xs font-semibold text-red-500 mt-1">
                          {uploadError}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Gallery Section */}
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-amber-500" />
                      Sau Alege din Avatarurile Monky ({AVATAR_OPTIONS.length + (customUploadedPhoto ? 1 : 0)})
                    </h4>

                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
                      {/* 1. Custom Uploaded Photo Card (Loaded in the grid!) */}
                      {customUploadedPhoto && (
                        <button
                          type="button"
                          onClick={() => handleSelectAvatar(customUploadedPhoto)}
                          disabled={isSavingAvatar}
                          className={`relative group rounded-2xl p-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                            selectedAvatar === customUploadedPhoto
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 ring-3 ring-emerald-500 shadow-md scale-105'
                              : 'bg-slate-50 dark:bg-[#1c1c1c] hover:bg-slate-100 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#333] hover:scale-105'
                          }`}
                          title="Fotografia ta proprie"
                        >
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-[#181818] border-2 border-emerald-500/40 flex items-center justify-center">
                            <img
                              src={customUploadedPhoto}
                              alt="Poza ta"
                              className="w-full h-full object-cover transition-transform group-hover:scale-110"
                            />
                          </div>
                          <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-1 block truncate max-w-full">
                            Poza Ta
                          </span>
                          {selectedAvatar === customUploadedPhoto && (
                            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                              <Check size={12} strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      )}

                      {/* Monky Avatars */}
                      {AVATAR_OPTIONS.map((avatarPath, index) => {
                        const isSelected = selectedAvatar === avatarPath;
                        return (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSelectAvatar(avatarPath)}
                            disabled={isSavingAvatar}
                            className={`relative group rounded-2xl p-2.5 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 ring-3 ring-emerald-500 shadow-md scale-105'
                                : 'bg-slate-50 dark:bg-[#1c1c1c] hover:bg-slate-100 dark:hover:bg-[#252525] border border-slate-200 dark:border-[#333] hover:scale-105'
                            }`}
                          >
                            <img
                              src={avatarPath}
                              alt={`Avatar ${index + 1}`}
                              className="w-14 h-14 rounded-xl object-contain transition-transform group-hover:scale-110"
                            />
                            {isSelected && (
                              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                                <Check size={12} strokeWidth={3} />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Setează o parolă Sub-tab */}
              {profileSubTab === 'parola' && (
                <div className="space-y-6 pt-2 max-w-xl">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lock size={20} className="text-emerald-500" />
                      Securitate & Parolă Cont
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Poți seta sau schimba parola contului tău oricând pentru a-ți menține datele în siguranță.
                    </p>
                  </div>

                  {passwordStatus && (
                    <div className={`p-4 rounded-xl text-sm font-semibold flex items-start gap-2.5 animate-in fade-in ${
                      passwordStatus.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                        : 'bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {passwordStatus.type === 'success' ? <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />}
                      <span>{passwordStatus.message}</span>
                    </div>
                  )}

                  {/* Form 1: Direct Password Change */}
                  <form onSubmit={handleUpdatePasswordDirectly} className="space-y-4 p-5 bg-slate-50 dark:bg-[#1c1c1c] rounded-2xl border border-slate-200/80 dark:border-[#333]">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Schimbă parola direct
                    </h4>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Parolă Nouă (Minim 6 caractere)
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#3a3a3a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all pl-10 pr-10"
                        />
                        <Key size={16} className="absolute left-3.5 top-3 text-slate-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Confirmă Parola Nouă
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-white dark:bg-[#252525] border border-slate-200 dark:border-[#3a3a3a] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all pl-10 pr-10"
                        />
                        <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUpdatingPassword || !newPassword}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isUpdatingPassword ? 'Se actualizează...' : 'Actualizează Parola'}
                    </button>
                  </form>

                  {/* Method 2: Send Reset Email */}
                  <div className="p-5 bg-slate-50 dark:bg-[#1c1c1c] rounded-2xl border border-slate-200/80 dark:border-[#333] space-y-3">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Sau primește un link de resetare pe email
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Îți vom trimite un email securizat la <strong>{currentUser?.email}</strong> cu un link pentru a-ți alege o parolă nouă.
                    </p>
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isSendingResetEmail}
                      className="inline-flex items-center gap-2 bg-white dark:bg-[#252525] hover:bg-slate-100 dark:hover:bg-[#303030] text-slate-800 dark:text-slate-200 font-bold px-4 py-2 rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-[#3a3a3a] transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Mail size={15} />
                      <span>{isSendingResetEmail ? 'Se trimite...' : 'Trimite Link pe Email'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Setări Notificări Sub-tab */}
              {profileSubTab === 'notificari' && (
                <div className="space-y-6 pt-2 max-w-2xl">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Bell size={20} className="text-emerald-500" />
                      Preferințe Notificări & Alerte
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Alege când și cum dorești să fii notificat de activitatea din contul tău Monky.
                    </p>
                  </div>

                  {notifSavedMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-in fade-in">
                      <CheckCircle2 size={16} />
                      <span>Preferințele de notificare au fost actualizate!</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {[
                      {
                        key: 'messages' as const,
                        title: 'Mesaje noi în Chat',
                        desc: 'Primește notificări pe email când un cumpărător sau vânzător îți trimite un mesaj.',
                      },
                      {
                        key: 'priceDrops' as const,
                        title: 'Alerte de Preț & Favorite',
                        desc: 'Te anunțăm dacă prețul unui anunț pe care l-ai salvat a scăzut.',
                      },
                      {
                        key: 'adUpdates' as const,
                        title: 'Starea Anunțurilor Tale',
                        desc: 'Notificări când anunțul tău a fost publicat, aprobat sau se apropie de expirare.',
                      },
                      {
                        key: 'promotions' as const,
                        title: 'Promoții & Noutăți Monky',
                        desc: 'Oferte promoționale speciale, reduceri la pachete de promovare și noutăți.',
                      },
                    ].map((item) => {
                      const isChecked = notifications[item.key];
                      return (
                        <div
                          key={item.key}
                          onClick={() => handleToggleNotification(item.key)}
                          className="p-5 bg-slate-50 dark:bg-[#1c1c1c] hover:bg-slate-100/80 dark:hover:bg-[#222] rounded-2xl border border-slate-200/80 dark:border-[#333] transition-all flex items-center justify-between gap-4 cursor-pointer group"
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>

                          {/* Toggle Switch Button (Matching Screenshot 2) */}
                          <div
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out flex items-center flex-shrink-0 cursor-pointer shadow-inner ${
                              isChecked ? 'bg-[#00c1a2]' : 'bg-[#cbd5e1] dark:bg-[#384252]'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                                isChecked ? 'translate-x-6' : 'translate-x-0'
                              }`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Ștergere cont Sub-tab */}
              {profileSubTab === 'stergere' && (
                <div className="space-y-6 pt-2 max-w-xl">
                  <div className="p-6 bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 rounded-3xl space-y-4">
                    <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle size={22} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight">
                          Zonă Periculoasă: Ștergere Cont
                        </h3>
                        <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">
                          Această acțiune este ireversibilă.
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      Dacă îți ștergi contul, toate datele tale vor fi eliminate permanent din platforma Monky:
                    </p>

                    <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 space-y-1.5 pl-4 list-disc">
                      <li>Toate anunțurile tale active și arhivate</li>
                      <li>Mesajele și istoricul conversațiilor din chat</li>
                      <li>Produsele salvate la favorite</li>
                      <li>Profilul de vânzător și recenziile primite</li>
                    </ul>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmText('');
                          setDeleteError('');
                          setShowDeleteModal(true);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-red-600/20 flex items-center gap-2 cursor-pointer"
                      >
                        <Trash2 size={16} />
                        <span>Șterge Contul Definitiv</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'anunturi' && (
            <div className="flex flex-col gap-6">
              {/* Ad Status Sub-tabs */}
              <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar border-b border-slate-100 dark:border-[#333333] pb-3">
                <button
                  onClick={() => setAdStatusTab('active')}
                  className={`font-bold text-sm whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    adStatusTab === 'active'
                      ? 'text-emerald-600 dark:text-emerald-500 border-emerald-600 dark:border-emerald-500'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Active ({activeListings.length})
                </button>
                <button
                  onClick={() => setAdStatusTab('pending')}
                  className={`font-bold text-sm whitespace-nowrap transition-colors pb-1 border-b-2 flex items-center gap-1.5 ${
                    adStatusTab === 'pending'
                      ? 'text-amber-600 dark:text-amber-400 border-amber-600 dark:border-amber-400'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <span>În așteptare ({pendingListings.length})</span>
                  {pendingListings.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  )}
                </button>
                <button
                  onClick={() => setAdStatusTab('rejected')}
                  className={`font-bold text-sm whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    adStatusTab === 'rejected'
                      ? 'text-red-600 dark:text-red-500 border-red-600 dark:border-red-500'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Respinse ({rejectedListings.length})
                </button>
                <button
                  onClick={() => setAdStatusTab('deactivated')}
                  className={`font-bold text-sm whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    adStatusTab === 'deactivated'
                      ? 'text-orange-600 dark:text-orange-500 border-orange-600 dark:border-orange-500'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Dezactivate ({deactivatedListings.length})
                </button>
                <button
                  onClick={() => setAdStatusTab('expired')}
                  className={`font-bold text-sm whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    adStatusTab === 'expired'
                      ? 'text-slate-700 dark:text-slate-300 border-slate-700 dark:border-slate-300'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Expirate ({expiredListings.length})
                </button>
                <button
                  onClick={() => setAdStatusTab('sold')}
                  className={`font-bold text-sm whitespace-nowrap transition-colors pb-1 border-b-2 ${
                    adStatusTab === 'sold'
                      ? 'text-blue-800 dark:text-blue-300 border-blue-800 dark:border-blue-300'
                      : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Vândute ({soldListings.length})
                </button>
              </div>

              {/* Informative notice for Pending tab */}
              {adStatusTab === 'pending' && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
                  <Clock size={20} className="text-amber-600 flex-shrink-0" />
                  <p>
                    <strong>Verificare moderare:</strong> Orice anunț publicat intră mai întâi în așteptare pentru verificare de către admin. Odată acceptat, va apărea automat în <strong>Active</strong> și va fi vizibil pe site.
                  </p>
                </div>
              )}

              {currentTabListings.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <Package size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    {adStatusTab === 'active' && 'Nu ai nicio postare activă în acest moment.'}
                    {adStatusTab === 'pending' && 'Nu ai niciun anunț în așteptare de aprobare.'}
                    {adStatusTab === 'rejected' && 'Nu ai niciun anunț respins.'}
                    {adStatusTab === 'deactivated' && 'Nu ai niciun anunț dezactivat.'}
                    {adStatusTab === 'expired' && 'Nu ai niciun anunț expirat.'}
                    {adStatusTab === 'sold' && 'Nu ai niciun anunț vândut.'}
                  </p>
                  {adStatusTab === 'active' && (
                    <Link
                      href="/adauga-anunt"
                      className="mt-4 text-xs font-bold text-emerald-600 dark:text-emerald-400 underline"
                    >
                      Publică primul tău anunț
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentTabListings.slice(0, visibleAdsCount).map((item) => (
                      <Link
                        key={item.id}
                        href={getListingUrl(item)}
                        className="flex items-center gap-4 p-3 rounded-2xl border border-slate-100 dark:border-[#333333] hover:border-slate-300 dark:hover:border-[#444444] bg-slate-50/50 dark:bg-[#1e1e1e] transition-all group"
                      >
                        <img
                          src={item.image || '/42.svg'}
                          alt={item.title}
                          className="w-20 h-20 rounded-xl object-cover bg-slate-200 dark:bg-[#181818]"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/42.svg';
                          }}
                        />
                        <div className="flex-grow min-w-0">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-xs text-blue-600 dark:text-sky-400 font-extrabold block mt-0.5">
                            {item.price && !isNaN(Number(item.price)) ? Number(item.price).toLocaleString('ro-RO') : '0'} €
                          </span>
                          <span className="text-xs text-slate-400 block truncate mt-1">
                            {item.location}
                          </span>

                          {/* Status Badge */}
                          {item.status === 'pending' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700/60 px-2 py-0.5 rounded-full mt-1.5">
                              <Clock size={11} /> În așteptare aprobare
                            </span>
                          ) : item.status === 'rejected' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-800 dark:text-red-300 bg-red-100 dark:bg-red-950/70 border border-red-300 px-2 py-0.5 rounded-full mt-1.5">
                              <X size={11} /> Respins de admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border border-emerald-300 px-2 py-0.5 rounded-full mt-1.5">
                              <Check size={11} /> Activ
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              router.push(`/adauga-anunt?edit=${item.id}`);
                            }}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors flex-shrink-0"
                            title="Editează anunțul"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteListing(item.id, e)}
                            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                            title="Șterge anunțul"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {currentTabListings.length > visibleAdsCount && (
                    <div className="mt-6 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleAdsCount((prev) => prev + 4)}
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-sky-500/10 dark:hover:bg-sky-500/20 dark:text-sky-400 font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
                      >
                        Vezi mai multe anunțuri
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'favorite' && (
            <div>
              {favoriteListings.length === 0 ? (
                <div className="py-12 text-center flex flex-col items-center">
                  <Heart size={48} className="text-slate-300 dark:text-slate-600 mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                    Nu ai niciun anunț salvat la favorite în acest moment.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 text-xs font-bold text-blue-600 dark:text-sky-400 underline"
                  >
                    Explorează anunțurile și salvează-ți preferatele
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {favoriteListings.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 p-3.5 rounded-2xl border border-slate-200 dark:border-[#333333] hover:border-slate-300 dark:hover:border-[#444444] bg-slate-50/50 dark:bg-[#1e1e1e] transition-all group"
                    >
                      <Link href={getListingUrl(item)} className="flex items-center gap-4 min-w-0 flex-grow">
                        <img
                          src={item.image || '/42.svg'}
                          alt={item.title}
                          className="w-20 h-20 rounded-xl object-cover bg-slate-200 dark:bg-[#181818] flex-shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/42.svg';
                          }}
                        />
                        <div className="min-w-0 flex-grow">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                            {item.title}
                          </h4>
                          <span className="text-xs text-blue-600 dark:text-sky-400 font-extrabold block mt-0.5">
                            {item.price && !isNaN(Number(item.price)) ? Number(item.price).toLocaleString('ro-RO') : '0'} €
                          </span>
                          <span className="text-xs text-slate-400 block truncate mt-1">
                            {item.location}
                          </span>
                        </div>
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => removeFavorite(item.id, e)}
                        className="w-9 h-9 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/60 flex items-center justify-center transition-all flex-shrink-0"
                        title="Elimină din favorite"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'urmariti' && (
            <div className="space-y-6">
              {/* Sub-tabs: Cine mă urmărește (Followers) vs Vânzători urmăriți (Following) */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-[#333] pb-4">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFollowSubTab('followers')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      followSubTab === 'followers'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-[#252525] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#303030]'
                    }`}
                  >
                    <Users size={16} />
                    <span>Cine mă urmărește</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      followSubTab === 'followers'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-[#383838] text-slate-700 dark:text-slate-300'
                    }`}>
                      {followersList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFollowSubTab('following')}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                      followSubTab === 'following'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-slate-100 dark:bg-[#252525] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#303030]'
                    }`}
                  >
                    <UserCheck size={16} />
                    <span>Vânzători urmăriți</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      followSubTab === 'following'
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-[#383838] text-slate-700 dark:text-slate-300'
                    }`}>
                      {followedUsers.length}
                    </span>
                  </button>
                </div>

                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                  {followSubTab === 'followers' ? 'Utilizatori care te urmăresc și primesc noutățile tale' : 'Vânzătorii pe care îi urmărești tu'}
                </span>
              </div>

              {/* View 1: Cine mă urmărește (Followers) */}
              {followSubTab === 'followers' && (
                <div>
                  {followersList.length === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-[#1f2838] text-blue-600 dark:text-sky-400 flex items-center justify-center mb-3">
                        <Users size={32} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        Nu ai niciun urmăritor încă
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mb-4">
                        Când alți utilizatori apasă butonul de urmărire pe anunțurile sau profilul tău, vor apărea aici.
                      </p>
                      <Link
                        href={`/utilizator/${encodeURIComponent(newName || currentUser?.displayName || 'me')}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <ExternalLink size={14} />
                        <span>Vezi profilul tău public</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {followersList.map((follower) => (
                        <div
                          key={follower.name}
                          className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 dark:border-[#333333] bg-white dark:bg-[#1e1e1e] shadow-sm hover:shadow-md transition-all"
                        >
                          <Link
                            href={`/utilizator/${encodeURIComponent(follower.name)}`}
                            className="flex items-center gap-3.5 min-w-0 flex-grow group"
                          >
                            <div className="relative flex-shrink-0">
                              <img
                                src={follower.avatar || '/images/avatar/an32.png'}
                                alt={follower.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 shadow-xs"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = '/images/avatar/an32.png';
                                }}
                              />
                              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1e1e1e]" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base truncate group-hover:text-blue-600 dark:group-hover:text-sky-400 transition-colors">
                                {formatPublicName(follower.name)}
                              </h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                                  Te urmărește
                                </span>
                                {follower.followedAt && (
                                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                    • {follower.followedAt}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Link
                              href={`/utilizator/${encodeURIComponent(follower.name)}`}
                              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-[#2e2e2e] hover:bg-slate-200 dark:hover:bg-[#3e3e3e] text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
                            >
                              Profil
                            </Link>

                            <button
                              type="button"
                              onClick={async () => {
                                await toggleFollowUser(follower.name, follower.avatar, follower.uid, currentUser);
                                setFollowedUsers(getFollowedUsers());
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isUserFollowed(follower.name)
                                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-sky-400 border border-blue-200 dark:border-blue-800'
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                              }`}
                            >
                              {isUserFollowed(follower.name) ? 'Urmărești' : '+ Urmărește și tu'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Vânzători urmăriți (Following) */}
              {followSubTab === 'following' && (
                <div>
                  {followedUsers.length === 0 ? (
                    <div className="py-14 text-center flex flex-col items-center">
                      <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-[#252525] text-slate-400 dark:text-slate-500 flex items-center justify-center mb-3">
                        <UserCheck size={32} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                        Nu urmărești niciun vânzător în acest moment
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mb-4">
                        Explorează anunțurile și apasă pe butonul de urmărire pentru a fi la curent cu noile produse adăugate de vânzătorii tăi preferați.
                      </p>
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        <ShoppingBag size={14} />
                        <span>Explorează anunțurile</span>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {followedUsers.map((name) => (
                        <div
                          key={name}
                          className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200 dark:border-[#333333] bg-white dark:bg-[#1e1e1e] shadow-sm hover:shadow transition-all"
                        >
                          <Link href={`/utilizator/${encodeURIComponent(name)}`} className="flex items-center gap-3.5 min-w-0 flex-grow group">
                            <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-black text-base flex-shrink-0 shadow-sm">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-base truncate group-hover:underline">
                                {formatPublicName(name)}
                              </h4>
                              <span className="text-xs text-slate-400 block truncate">Vânzător pe Monky</span>
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={async () => {
                              await toggleFollowUser(name, undefined, undefined, currentUser);
                              setFollowedUsers(getFollowedUsers());
                            }}
                            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-[#333] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 border border-slate-200/60 dark:border-[#444] cursor-pointer"
                            title="Nu mai urmări"
                          >
                            <UserX size={15} />
                            <span>Nu mai urmări</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mesaje' && (
            <div className="py-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-[#03c1a2]/15 to-emerald-500/10 rounded-2xl border border-[#03c1a2]/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#03c1a2] text-slate-950 flex items-center justify-center font-bold">
                    <MessageCircle size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Centrul tău de Mesaje & Oferte
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Discută în timp real cu vânzătorii și cumpărătorii și negociază prin oferte oficiale.
                    </p>
                  </div>
                </div>

                <Link
                  href="/mesaje"
                  className="bg-[#03c1a2] hover:bg-[#02ab8f] text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all whitespace-nowrap"
                >
                  <span>Deschide Chat-ul Complet</span>
                  <ChevronRight size={16} />
                </Link>
              </div>

              {/* Conversations List Preview */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-[#1a2332] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                {getChatConversations()
                  .filter((c) => {
                    const myUid = currentUser?.uid || 'current-user-id';
                    const currentUserName = currentUser?.displayName || (typeof window !== 'undefined' ? localStorage.getItem('monky_user_name') : null) || 'Eu';
                    const isByUid = c.buyerId === myUid || c.sellerId === myUid;
                    const isByName = c.sellerName && currentUserName && c.sellerName.toLowerCase().trim() === currentUserName.toLowerCase().trim() && c.sellerId.startsWith('seller-');
                    return isByUid || isByName;
                  })
                  .map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/mesaje?id=${conv.id}`}
                    className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-[#202b3c] transition-colors group block"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                        <img
                          src={conv.listingImage || '/42.svg'}
                          alt={conv.listingTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate max-w-xs group-hover:text-[#03c1a2] transition-colors">
                            {conv.listingTitle}
                          </h4>
                          {conv.currentOffer && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-md bg-[#03c1a2]/15 text-[#03c1a2] border border-[#03c1a2]/30">
                              <Tag size={10} />
                              <span>{conv.currentOffer.amount.toLocaleString('ro-RO')} {conv.currentOffer.currency}</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-sm mt-0.5">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold text-[#03c1a2] group-hover:underline">
                        Răspunde →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'comenzi' && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm">
              Nu ai nicio comandă în procesare.
            </div>
          )}
        </div>
      </main>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2332] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-[#2d3b4e] shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsAvatarModalOpen(false)}
              className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-[#253245] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Camera size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Alege un Avatar
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto mb-4">
                Alege personajul preferat din colecție sau încarcă o fotografie proprie
              </p>

              {/* Upload Own Photo Button in Modal */}
              <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer">
                <Upload size={15} />
                <span>{isSavingAvatar ? 'Se încarcă...' : 'Încarcă o Poză de pe Dispozitiv'}</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleCustomPhotoUpload}
                  className="hidden"
                  disabled={isSavingAvatar}
                />
              </label>

              {uploadError && (
                <p className="text-xs font-semibold text-red-500 mt-2">
                  {uploadError}
                </p>
              )}
            </div>

            {/* Avatar Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[340px] overflow-y-auto p-1 no-scrollbar">
              {/* Custom Uploaded Photo Option */}
              {customUploadedPhoto && (
                <button
                  type="button"
                  onClick={() => handleSelectAvatar(customUploadedPhoto)}
                  disabled={isSavingAvatar}
                  className={`relative group rounded-2xl p-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                    selectedAvatar === customUploadedPhoto
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 ring-3 ring-emerald-500 shadow-md scale-105'
                      : 'bg-slate-50 dark:bg-[#151c28] hover:bg-slate-100 dark:hover:bg-[#222e40] border border-slate-200/80 dark:border-[#2d3b4e] hover:scale-105'
                  }`}
                  title="Fotografia ta proprie"
                >
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 flex items-center justify-center border-2 border-emerald-500/40">
                    <img
                      src={customUploadedPhoto}
                      alt="Poza ta"
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-1 block truncate max-w-full">
                    Poza Ta
                  </span>
                  {selectedAvatar === customUploadedPhoto && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  )}
                </button>
              )}

              {AVATAR_OPTIONS.map((avatarPath, index) => {
                const isSelected = selectedAvatar === avatarPath;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSelectAvatar(avatarPath)}
                    disabled={isSavingAvatar}
                    className={`relative group rounded-2xl p-2 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 ring-3 ring-emerald-500 shadow-md scale-105'
                        : 'bg-slate-50 dark:bg-[#151c28] hover:bg-slate-100 dark:hover:bg-[#222e40] border border-slate-200/80 dark:border-[#2d3b4e] hover:scale-105'
                    }`}
                  >
                    <img
                      src={avatarPath}
                      alt={`Avatar ${index + 1}`}
                      className="w-14 h-14 rounded-xl object-contain transition-transform group-hover:scale-110"
                    />
                    {isSelected && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#263345] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#253245] text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-[#2d3b4e] transition-colors cursor-pointer"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a2332] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-red-200 dark:border-red-900/50 shadow-2xl relative animate-in zoom-in-95 duration-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
              <AlertTriangle size={26} />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Confirmi ștergerea contului?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Toate datele, anunțurile și conversațiile tale vor fi șterse permanent fără posibilitate de recuperare.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Tastează cuvântul <span className="text-red-600 font-mono">STERGE</span> pentru a confirma:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="STERGE"
                className="w-full bg-slate-50 dark:bg-[#151c28] border border-slate-200 dark:border-[#2d3b4e] rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-[#253245] text-slate-700 dark:text-slate-200 text-sm font-bold hover:bg-slate-200 dark:hover:bg-[#2d3b4e] transition-colors cursor-pointer"
              >
                Anulează
              </button>
              <button
                type="button"
                onClick={handleDeleteAccountConfirm}
                disabled={isDeletingAccount || deleteConfirmText.toLowerCase() !== 'sterge'}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-bold transition-colors cursor-pointer shadow-md shadow-red-600/20"
              >
                {isDeletingAccount ? 'Se șterge...' : 'Șterge Definitiv'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
