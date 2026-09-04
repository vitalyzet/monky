'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import {
  AdListing,
  UserProfile,
  InvoiceRecord,
  SeoSettings,
  getAllListingsForAdmin,
  updateListingStatusInDb,
  deleteListingFromDb,
  toggleListingPromotedInDb,
  getAllUsersFromDb,
  updateUserStatusInDb,
  updateUserRoleInDb,
} from '@/lib/db';
import { getListingUrl } from '@/lib/slugUtils';
import { formatTimeAgo } from '@/lib/timeUtils';
import {
  LogOut, ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  Package,
  Eye,
  Trash2,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  UserX,
  UserCheck,
  Shield,
  ExternalLink,
  RefreshCw,
  Zap,
  FileText,
  Globe,
  Settings,
  DollarSign,
  TrendingUp,
  Download,
  CreditCard,
  Sliders,
  CheckSquare,
  Sparkles,
  ArrowUpRight,
  Layers,
  FileCode,
  Tag,
  BookUser, PenTool, CircleUser, ConciergeBell, MessageCircle, BarChart2, Coins, Flower2,
  Star, ChevronLeft, ChevronRight, Menu,
  Palette, Truck, Navigation, Heart, Calendar,
} from 'lucide-react';

function parseDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value === 'object' && typeof value.toDate === 'function') {
    try {
      const d = value.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) return d;
    } catch (e) {}
  }
  if (typeof value === 'object' && typeof value.seconds === 'number') {
    const d = new Date(value.seconds * 1000);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === 'number') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

function parseAdCreationDate(ad: any): Date | null {
  if (!ad) return null;
  if (ad.expiresAt) {
    const exp = parseDate(ad.expiresAt);
    if (exp) return new Date(exp.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
  return (
    parseDate(ad.createdAtTime) ||
    parseDate(ad.createdAt) ||
    parseDate(ad.timestamp) ||
    parseDate(ad.date)
  );
}

function getExpirationCountdownInfo(ad: any) {
  try {
    let expDate: Date | null = parseDate(ad?.expiresAt);

    if (!expDate) {
      const createdDate = parseAdCreationDate(ad);
      if (createdDate) {
        expDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      }
    }

    if (!expDate || isNaN(expDate.getTime())) {
      expDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    const diffMs = expDate.getTime() - Date.now();
    let daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    if (isNaN(daysLeft)) daysLeft = 30;
    daysLeft = Math.max(0, daysLeft);

    const dateStr = expDate.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', year: 'numeric' });

    if (daysLeft === 0) {
      return { daysLeft, dateStr, text: 'Expirat azi', badgeClass: 'bg-red-100 text-red-700 border-red-200' };
    }
    if (daysLeft <= 3) {
      return { daysLeft, dateStr, text: `${daysLeft} ${daysLeft === 1 ? 'zi' : 'zile'}`, badgeClass: 'bg-red-50 text-red-600 border-red-200 font-bold' };
    }
    if (daysLeft <= 7) {
      return { daysLeft, dateStr, text: `${daysLeft} zile`, badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 font-bold' };
    }
    return { daysLeft, dateStr, text: `${daysLeft} zile`, badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' };
  } catch (e) {
    return { daysLeft: 30, dateStr: '30 zile', text: '30 zile', badgeClass: 'bg-slate-50 text-slate-700 border-slate-200' };
  }
}

const INITIAL_MOCK_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-101',
    invoiceNumber: 'INV-2026-0841',
    userEmail: 'alexandrzet29@gmail.com',
    userName: 'Alexandru Zet',
    listingTitle: 'iPhone 15 Pro Max 256GB Sigilat Titan',
    amount: 14.99,
    currency: 'EUR',
    serviceType: 'Promovare VIP 7 zile',
    status: 'Plătit',
    date: '23 Aug 2026',
  },
  {
    id: 'inv-102',
    invoiceNumber: 'INV-2026-0840',
    userEmail: 'marius.auto@gmail.com',
    userName: 'Marius Popa',
    listingTitle: 'BMW Seria 5 530d xDrive M-Sport 2021',
    amount: 29.99,
    currency: 'EUR',
    serviceType: 'Pachet Anunțuri Business',
    status: 'Plătit',
    date: '22 Aug 2026',
  },
  {
    id: 'inv-103',
    invoiceNumber: 'INV-2026-0839',
    userEmail: 'elena.imob@yahoo.com',
    userName: 'Elena Rădulescu',
    listingTitle: 'Apartament 2 Camere Ultracentral Pipera',
    amount: 9.99,
    currency: 'EUR',
    serviceType: 'Promovare Standard',
    status: 'În așteptare',
    date: '22 Aug 2026',
  },
  {
    id: 'inv-104',
    invoiceNumber: 'INV-2026-0838',
    userEmail: 'tech.store@company.ro',
    userName: 'TechStore SRL',
    listingTitle: 'Incarcator Original Apple 20W USB-C',
    amount: 4.99,
    currency: 'EUR',
    serviceType: 'Promovare Standard',
    status: 'Plătit',
    date: '21 Aug 2026',
  },
];

export default function AdminDashboardPage() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  // Top Module Navigation Tabs
  const [currentModule, setCurrentModule] = useState<string>('moderare');

  // Listings state
  const [listings, setListings] = useState<AdListing[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active' | 'rejected' | 'promoted'>('pending');

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Invoices state
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(INITIAL_MOCK_INVOICES);

  // SEO Settings state
  const [seo, setSeo] = useState<SeoSettings>({
    siteTitle: 'Tevinde.ro - Anunțuri Gratuite România | Cumpără și Vinde Simplu',
    metaDescription: 'Tevinde.ro este platforma modernă de anunțuri gratuite din România. Găsește telefoane, mașini, imobiliare, servicii și multe altele la cele mai bune prețuri.',
    keywords: 'anunturi gratuite, tevinde, tevinde.ro, telefoane, masini, imobiliare, locuri de munca, romania',
    ogImage: 'https://tevinde.ro/og-image.png',
    robotsTxt: 'User-agent: *\nAllow: /\nSitemap: https://tevinde.ro/sitemap.xml',
    enableSitemap: true,
    googleAnalyticsId: 'G-TEVINDE2026APP',
  });

  // System Settings state
  const [sysSettings, setSysSettings] = useState({
    autoReview24h: true,
    emailNotifications: true,
    maxFreePhotos: 10,
    maintenanceMode: false,
    requirePhoneVerification: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [inspectAd, setInspectAd] = useState<AdListing | null>(null);
  const [activeCardTheme, setActiveCardTheme] = useState<'modern' | 'classic'>('modern');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monky_card_theme');
      if (saved === 'classic' || saved === 'modern') {
        setActiveCardTheme(saved);
      }
    }
  }, []);

  const handleActivateGlobalTheme = (theme: 'modern' | 'classic') => {
    setActiveCardTheme(theme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('monky_card_theme', theme);
      window.dispatchEvent(new CustomEvent('card_theme_changed', { detail: theme }));
    }
    showNotification(`✨ Stilul "${theme === 'modern' ? 'Modern Minimalist (Wallapop)' : 'Clasic Monky'}" a fost ACTIVAT GLOBAL!`);
  };

  const loadAdminData = async () => {
    setLoadingData(true);
    try {
      const [allAds, allUsers] = await Promise.all([
        getAllListingsForAdmin(),
        getAllUsersFromDb(),
      ]);
      setListings(allAds);
      setUsers(allUsers);
    } catch (e) {
      console.error('Error loading admin data:', e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadAdminData();
    }
  }, [authLoading]);

  const showNotification = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(null), 3500);
  };

  // Moderation Actions
  const handleApproveAd = async (id: string, title: string) => {
    try {
      await updateListingStatusInDb(id, 'active');
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: 'active' } : item))
      );
      try {
        const existing = localStorage.getItem('monky_user_listings');
        if (existing) {
          const parsed = JSON.parse(existing);
          const updated = parsed.map((item: any) => item.id === id ? { ...item, status: 'active' } : item);
          localStorage.setItem('monky_user_listings', JSON.stringify(updated));
        }
      } catch (err) {
        console.error(err);
      }
      showNotification(`✅ Anunțul "${title}" a fost APROBAT și este acum live!`);
    } catch (e) {
      alert('Eroare la aprobarea anunțului.');
    }
  };

  const handleRejectAd = async (id: string, title: string) => {
    if (confirm(`Ești sigur că vrei să respingi anunțul "${title}"?`)) {
      try {
        await updateListingStatusInDb(id, 'rejected');
        setListings((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: 'rejected' } : item))
        );
        try {
          const existing = localStorage.getItem('monky_user_listings');
          if (existing) {
            const parsed = JSON.parse(existing);
            const updated = parsed.map((item: any) => item.id === id ? { ...item, status: 'rejected' } : item);
            localStorage.setItem('monky_user_listings', JSON.stringify(updated));
          }
        } catch (err) {
          console.error(err);
        }
        showNotification(`❌ Anunțul "${title}" a fost RESPINS.`);
      } catch (e) {
        alert('Eroare la respingerea anunțului.');
      }
    }
  };

  const handleTogglePromoted = async (id: string, title: string, currentVal: boolean) => {
    try {
      await toggleListingPromotedInDb(id, !currentVal);
      setListings((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isPromoted: !currentVal } : item))
      );
      showNotification(
        !currentVal
          ? `⚡ Anunțul "${title}" a fost marcat ca PROMOVAT VIP!`
          : `Anunțul "${title}" a revenit la promovare standard.`
      );
    } catch (e) {
      alert('Eroare la actualizarea promovării.');
    }
  };

  const handleDeleteAd = async (id: string, title: string) => {
    if (confirm(`Ștergi definitiv anunțul "${title}"? Acțiunea este ireversibilă.`)) {
      try {
        await deleteListingFromDb(id);
        setListings((prev) => prev.filter((item) => item.id !== id));

        try {
          const existing = localStorage.getItem('monky_user_listings');
          if (existing) {
            const parsed = JSON.parse(existing);
            localStorage.setItem(
              'monky_user_listings',
              JSON.stringify(parsed.filter((item: any) => item.id !== id))
            );
          }
          const delExisting = localStorage.getItem('monky_deleted_listings');
          const delArr: string[] = delExisting ? JSON.parse(delExisting) : [];
          if (!delArr.includes(id)) {
            delArr.push(id);
            localStorage.setItem('monky_deleted_listings', JSON.stringify(delArr));
          }
        } catch (err) {
          console.error(err);
        }

        showNotification(`🗑️ Anunțul "${title}" a fost șters definitiv.`);
      } catch (e) {
        alert('Eroare la ștergerea anunțului.');
      }
    }
  };

  // User Actions
  const handleToggleUserStatus = async (user: UserProfile) => {
    const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
    const actionLabel = newStatus === 'blocked' ? 'BLOCAT' : 'DEBLOCAT';
    if (confirm(`Sigur schimbi statusul utilizatorului ${user.email} la ${actionLabel}?`)) {
      try {
        await updateUserStatusInDb(user.uid, newStatus);
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? { ...u, status: newStatus } : u))
        );
        showNotification(`👤 Utilizatorul ${user.email} a fost ${actionLabel}.`);
      } catch (e) {
        alert('Eroare la actualizarea utilizatorului.');
      }
    }
  };

  const handleToggleUserRole = async (user: UserProfile) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (confirm(`Schimbi rolul utilizatorului ${user.email} la ${newRole.toUpperCase()}?`)) {
      try {
        await updateUserRoleInDb(user.uid, newRole);
        setUsers((prev) =>
          prev.map((u) => (u.uid === user.uid ? { ...u, role: newRole } : u))
        );
        showNotification(`👑 Rolul utilizatorului ${user.email} a fost actualizat la ${newRole.toUpperCase()}.`);
      } catch (e) {
        alert('Eroare la actualizarea rolului.');
      }
    }
  };

  const handleToggleAutoReactivate = (id: string, currentVal?: boolean) => {
    setListings((prev) =>
      prev.map((item) => (item.id === id ? { ...item, autoReactivate: !currentVal } : item))
    );
    showNotification(
      !currentVal
        ? `🔄 Auto-Reactivare ACTIVATĂ pentru acest anunț!`
        : `Auto-Reactivare dezactivată.`
    );
  };

  // Computed counts
  const pendingAds = listings.filter((item) => item.status === 'pending');
  const activeAds = listings.filter((item) => !item.status || item.status === 'active');
  const rejectedAds = listings.filter((item) => item.status === 'rejected');
  const promotedAds = listings.filter((item) => item.isPromoted);

  const filteredListings = listings.filter((item) => {
    if (statusFilter === 'pending' && item.status !== 'pending') return false;
    if (statusFilter === 'active' && item.status && item.status !== 'active') return false;
    if (statusFilter === 'rejected' && item.status !== 'rejected') return false;
    if (statusFilter === 'promoted' && !item.isPromoted) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        (item.id || '').toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        (item.seller?.name || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredUsers = users.filter((u) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      u.email.toLowerCase().includes(q) ||
      (u.displayName || '').toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });



  return (
    <div className="flex flex-col h-screen bg-[#f4f6f9] text-slate-800 font-sans overflow-hidden">
      
      {/* GLOBAL HEADER */}
      <header className="flex h-[76px] w-full flex-shrink-0 z-30 shadow-sm relative">
         {/* Left White Header (User Profile) */}
         <div className="w-[360px] bg-white flex items-center px-6 relative z-10">
            {/* Teeth Edge Effect */}
            <div 
              className="absolute right-[-10px] top-0 h-full w-[10px]"
              style={{
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='10' height='20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='0,0 10,10 0,20' fill='white'/%3E%3C/svg%3E\")",
                backgroundSize: "10px 20px",
                backgroundRepeat: "repeat-y"
              }}
            ></div>
            <div className="relative flex-shrink-0 mr-4 mt-1">
                <img src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName || 'Admin'}`} className="w-[48px] h-[48px] rounded-full bg-slate-200 border border-slate-100 object-cover" alt="User" />
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#0a7a5e] border-2 border-white rounded-full"></div>
             </div>
             <div className="flex flex-col flex-1 min-w-0 justify-center gap-1">
                <div className="flex items-center gap-2">
                   <h2 className="text-[18px] font-black text-[#1e293b] leading-none truncate">{currentUser?.displayName || 'Alexandru B.'}</h2>
                   <span className="text-[9px] font-black text-[#0a7a5e] bg-[#f0f9f6] border border-[#0a7a5e]/20 px-2 py-0.5 rounded-full uppercase tracking-widest whitespace-nowrap">Administrator Șef</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-slate-400 mt-1">
                   <div className="flex text-amber-400">
                      <Star size={11} className="fill-amber-400" />
                      <Star size={11} className="fill-amber-400" />
                      <Star size={11} className="fill-amber-400" />
                      <Star size={11} className="fill-amber-400" />
                      <Star size={11} className="fill-amber-400" />
                   </div>
                   <span>(5.0)</span>
                   <span className="mx-0.5">•</span>
                   <span className="truncate">În Tevinde.ro din 2024</span>
                </div>
             </div>
         </div>
         {/* Right Blue Header */}
         <div className="flex-1 bg-[#1e88e5] flex items-center px-6 justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                  setShowMobileMenu(!showMobileMenu);
                }} 
                className="p-2 text-white hover:bg-white/10 rounded-xl transition-all mr-1 flex items-center gap-2"
                title="Meniu"
              >
                <Menu size={22} />
              </button>
              <Link href="/" className="flex items-center gap-2 text-white mr-4 hover:opacity-90 transition-opacity">
                <Shield size={24} className="fill-white" />
                <span className="font-extrabold tracking-widest uppercase text-lg">TEVINDE</span>
              </Link>
              <button onClick={() => loadAdminData()} className="text-white hover:text-white/80 transition-colors" title="Reîmprospătează datele">
                <RefreshCw size={20} />
              </button>
            </div>
         </div>
      </header>

      {/* HORIZONTAL TABS BAR (PESTAÑAS SUPERIORES SIEMPRE VISIBLES) */}
      <div className="bg-white border-b border-slate-200 shadow-sm px-4 md:px-8 py-2.5 overflow-x-auto flex items-center gap-2 flex-shrink-0 z-20">
        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline-flex">
          Pestañas:
        </span>
        
        <button
          onClick={() => {
            setCurrentModule('moderare');
            setStatusFilter('pending');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'moderare'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BookUser size={15} />
          <span>Moderare</span>
          {pendingAds.length > 0 && (
            <span className="bg-[#b9323f] text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingAds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setCurrentModule('listings');
            setStatusFilter('active');
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'listings'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <PenTool size={15} />
          <span>Anunțuri Active</span>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
            {activeAds.length}
          </span>
        </button>

        {/* PESTAÑA: TEMĂ */}
        <button
          onClick={() => setCurrentModule('tema')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
            currentModule === 'tema'
              ? 'bg-[#1e88e5] text-white border-[#1e88e5] shadow-md shadow-blue-500/30'
              : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-extrabold'
          }`}
        >
          <Palette size={16} />
          <span>Temă</span>
          <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
            currentModule === 'tema' ? 'bg-white text-blue-700' : 'bg-blue-600 text-white'
          }`}>
            CARDURI
          </span>
        </button>

        <button
          onClick={() => setCurrentModule('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'users'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <CircleUser size={15} />
          <span>Utilizatori</span>
        </button>

        <button
          onClick={() => setCurrentModule('rapoarte')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'rapoarte'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ConciergeBell size={15} />
          <span>Rapoarte</span>
        </button>

        <button
          onClick={() => setCurrentModule('mesaje')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'mesaje'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <MessageCircle size={15} />
          <span>Mesaje</span>
        </button>

        <button
          onClick={() => setCurrentModule('analitice')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'analitice'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <BarChart2 size={15} />
          <span>Analitice</span>
        </button>

        <button
          onClick={() => setCurrentModule('tranzactii')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'tranzactii'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Coins size={15} />
          <span>Tranzacții</span>
        </button>

        <button
          onClick={() => setCurrentModule('seo')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            currentModule === 'seo'
              ? 'bg-[#0a7a5e] text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flower2 size={15} />
          <span>Setări SEO</span>
        </button>
      </div>

      {/* BELOW HEADER CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className={`${isSidebarCollapsed ? 'w-24 p-3' : 'w-[360px] p-6'} bg-transparent flex-shrink-0 flex flex-col hidden md:flex relative z-20 pt-6 transition-all duration-300 ease-in-out`}>
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-y-auto max-h-[calc(100vh-160px)] flex flex-col w-full">
            
            <div className={`pt-5 pb-3 ${isSidebarCollapsed ? 'px-2 justify-center' : 'px-6 justify-between'} flex items-center border-b border-slate-100/60`}>
              {!isSidebarCollapsed && (
                <h3 className="text-[12px] font-black text-slate-400/70 uppercase tracking-widest">Meniu Admin</h3>
              )}
              <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors mx-auto"
                title={isSidebarCollapsed ? "Extinde Meniul" : "Restrânge Meniul (Doar Iconițe)"}
              >
                <ChevronLeft size={18} className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>

            <div className="flex flex-col py-2">
              
              {/* Moderare */}
              <button 
                onClick={() => {
                  setCurrentModule('moderare');
                  setStatusFilter('pending');
                }}
                title="Moderare"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'moderare' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'moderare' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center relative ${currentModule === 'moderare' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <BookUser size={24} strokeWidth={currentModule === 'moderare' ? 2.5 : 1.5} />
                    {isSidebarCollapsed && pendingAds.length > 0 && (
                      <span className="absolute -top-1 -right-1.5 bg-[#b9323f] text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full animate-pulse shadow-sm">
                        {pendingAds.length}
                      </span>
                    )}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'moderare' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Moderare</span>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  pendingAds.length > 0 ? (
                    <span className="bg-[#b9323f] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm animate-pulse">{pendingAds.length}</span>
                  ) : (
                    <span className="bg-slate-100 text-slate-400 text-[11px] font-bold px-2 py-0.5 rounded-full">0</span>
                  )
                )}
              </button>

              {/* Anunțuri Active */}
              <button 
                onClick={() => {
                  setCurrentModule('listings');
                  setStatusFilter('active');
                }}
                title="Anunțuri Active"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'listings' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'listings' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'listings' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <PenTool size={22} strokeWidth={currentModule === 'listings' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'listings' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Anunțuri Active</span>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-full">{activeAds.length}</span>
                )}
              </button>

              {/* Temă */}
              <button 
                onClick={() => setCurrentModule('tema')}
                title="Temă"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'tema' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'tema' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'tema' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <Palette size={22} strokeWidth={currentModule === 'tema' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'tema' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Temă</span>
                  )}
                </div>
                {!isSidebarCollapsed && (
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200">NOU</span>
                )}
              </button>

              {/* Utilizatori */}
              <button 
                onClick={() => setCurrentModule('users')}
                title="Utilizatori"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'users' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'users' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'users' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <CircleUser size={24} strokeWidth={currentModule === 'users' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'users' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Utilizatori</span>
                  )}
                </div>
              </button>

              {/* Rapoarte */}
              <button 
                onClick={() => setCurrentModule('rapoarte')}
                title="Rapoarte"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'rapoarte' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'rapoarte' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'rapoarte' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <ConciergeBell size={24} strokeWidth={currentModule === 'rapoarte' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'rapoarte' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Rapoarte</span>
                  )}
                </div>
              </button>

              {/* Contact & Mesaje */}
              <button 
                onClick={() => setCurrentModule('mesaje')}
                title="Contact & Mesaje"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'mesaje' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'mesaje' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'mesaje' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <MessageCircle size={24} strokeWidth={currentModule === 'mesaje' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'mesaje' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Contact & Mesaje</span>
                  )}
                </div>
              </button>

              {/* Analitice */}
              <button 
                onClick={() => setCurrentModule('analitice')}
                title="Analitice"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'analitice' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'analitice' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'analitice' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <BarChart2 size={24} strokeWidth={currentModule === 'analitice' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'analitice' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Analitice</span>
                  )}
                </div>
              </button>

              {/* Tranzacții */}
              <button 
                onClick={() => setCurrentModule('tranzactii')}
                title="Tranzacții"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} transition-colors ${currentModule === 'tranzactii' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50 border-b border-slate-50'}`}
              >
                {currentModule === 'tranzactii' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'tranzactii' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <Coins size={24} strokeWidth={currentModule === 'tranzactii' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'tranzactii' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Tranzacții</span>
                  )}
                </div>
              </button>

              {/* Setări SEO */}
              <button 
                onClick={() => setCurrentModule('seo')}
                title="Setări SEO"
                className={`relative flex items-center ${isSidebarCollapsed ? 'justify-center px-0 py-4' : 'justify-between px-6 py-4'} mb-4 transition-colors ${currentModule === 'seo' ? 'bg-[#f0f9f6]' : 'hover:bg-slate-50'}`}
              >
                {currentModule === 'seo' && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-r-md bg-[#0a7a5e]"></div>}
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentModule === 'seo' ? 'bg-transparent text-[#0a7a5e]' : 'bg-transparent text-[#7ca0c5]'}`}>
                    <Flower2 size={24} strokeWidth={currentModule === 'seo' ? 2.5 : 1.5} />
                  </div>
                  {!isSidebarCollapsed && (
                    <span className={`text-[15px] ${currentModule === 'seo' ? 'font-black text-[#0a7a5e]' : 'font-bold text-slate-700'}`}>Setări SEO</span>
                  )}
                </div>
              </button>
              
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f4f6f9]">
           
           {/* Floating Toast */}
           {actionMessage && (
            <div className="fixed top-24 right-6 z-50 bg-[#00acc1] text-white px-6 py-3 rounded shadow-lg flex items-center gap-3 font-semibold text-sm animate-in fade-in">
              <span>{actionMessage}</span>
            </div>
           )}

           {/* Pending Ads Alert Banner (Hidden in Moderare module to prevent clutter) */}
           {pendingAds.length > 0 && currentModule !== 'moderare' && (
             <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-amber-500/20">
                   <AlertTriangle size={20} />
                 </div>
                 <div>
                   <h4 className="text-sm font-extrabold text-amber-900">
                     Atenție: Ai {pendingAds.length} {pendingAds.length === 1 ? 'anunț în așteptare' : 'anunțuri în așteptare'} de aprobare!
                   </h4>
                   <p className="text-xs text-amber-700 mt-0.5 font-medium">
                     Unul sau mai mulți utilizatori au publicat anunțuri noi. Aprobă-le pentru a fi vizibile live pe site.
                   </p>
                 </div>
               </div>
               <button
                 onClick={() => {
                   setCurrentModule('moderare');
                   setStatusFilter('pending');
                 }}
                 className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap shadow-sm"
               >
                 Aprobă Acum ({pendingAds.length})
               </button>
             </div>
           )}

           {/* Summary Stats Cards (Hidden in Moderare module to keep view clean & large) */}
           {currentModule !== 'moderare' && (
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
               <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0">
                   <Package size={20} />
                 </div>
                 <div>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Total Anunțuri</p>
                   <p className="text-xl font-black text-slate-800">{listings.length}</p>
                 </div>
               </div>

               <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold flex-shrink-0">
                   <AlertTriangle size={20} />
                 </div>
                 <div>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">În Așteptare</p>
                   <p className="text-xl font-black text-amber-600">{pendingAds.length}</p>
                 </div>
               </div>

               <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold flex-shrink-0">
                   <CheckCircle2 size={20} />
                 </div>
                 <div>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Active Live</p>
                   <p className="text-xl font-black text-emerald-600">{activeAds.length}</p>
                 </div>
               </div>

               <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0">
                   <XCircle size={20} />
                 </div>
                 <div>
                   <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Respinse</p>
                   <p className="text-xl font-black text-red-600">{rejectedAds.length}</p>
                 </div>
               </div>
             </div>
           )}

            <div className="bg-white rounded shadow-sm border border-slate-100 overflow-hidden min-h-[500px] flex flex-col">
              <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between bg-white flex-wrap gap-4">
                 <h2 className="text-base font-bold text-slate-800 capitalize">
                    {currentModule === 'moderare' ? 'Moderare Anunțuri Noi (Aprobare Rapidă)' : currentModule === 'dashboard' ? 'Dashboard Overview' : currentModule === 'listings' ? 'Anunțuri Active' : currentModule === 'users' ? 'Usuarios Registrados' : currentModule === 'tema' ? 'Configurare Temă & Stil Carduri' : currentModule}
                 </h2>

                 {/* Search Bar on the Right */}
                 <div className="relative min-w-[240px] md:w-80">
                   <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                   <input
                     type="text"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder="Caută anunț, categorie, utilizator..."
                     className="w-full pl-10 pr-8 py-2 bg-slate-50/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-sm"
                   />
                   {searchQuery && (
                     <button 
                       onClick={() => setSearchQuery('')}
                       className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                     >
                       ✕
                     </button>
                   )}
                 </div>
              </div>
              
              <div className="p-6 bg-white flex-1">
                
                {/* MODULE: TEMĂ & STIL CARDURI */}
                {currentModule === 'tema' && (
                  <div className="space-y-6">
                    {/* Header Banner */}
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50/40 to-white border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-sm">
                            Aspect Global
                          </span>
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Stil Activ: {activeCardTheme === 'modern' ? 'Modern Minimalist (Wallapop)' : 'Clasic Monky'}
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900">
                          Temă & Configurare Carduri
                        </h3>
                        <p className="text-sm text-slate-600">
                          Alege designul cardurilor de anunțuri și activează-l cu un clic pe întreg site-ul (Home, Căutare, Favorite, Profil Vânzător).
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleActivateGlobalTheme('modern')}
                          className={`px-5 py-2.5 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center gap-2 ${
                            activeCardTheme === 'modern'
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20'
                              : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
                          }`}
                        >
                          <Check size={16} />
                          <span>Activează Stil Modern Global</span>
                        </button>
                      </div>
                    </div>

                    {/* Style Switcher Selector Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* OPTION 1: MODERN (AS IN THE USER'S PHOTO) */}
                      <div 
                        onClick={() => handleActivateGlobalTheme('modern')}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          activeCardTheme === 'modern'
                            ? 'border-blue-500 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900">Stil Modern Minimalist (Ca în imagine)</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">RECOMANDAT</span>
                          </div>
                          {activeCardTheme === 'modern' && (
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-3">
                          Design compact inspirat de Wallapop: imagine rotunjită, preț mare accentuat, buton inimă plutitor pe cerc negru translucent, badge "Envío / Livrare", și distanță cu săgeată.
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600">
                          <span>{activeCardTheme === 'modern' ? '● ACTIV GLOBAL PE SITE' : '○ Fă clic pentru a activa'}</span>
                        </div>
                      </div>

                      {/* OPTION 2: CLASSIC */}
                      <div 
                        onClick={() => handleActivateGlobalTheme('classic')}
                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                          activeCardTheme === 'classic'
                            ? 'border-blue-500 bg-blue-50/30 shadow-md ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black text-slate-900">Stil Clasic Detaliat (Monky)</span>
                          {activeCardTheme === 'classic' && (
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-3">
                          Design tradițional extins cu etichete detaliate pentru specificații tehnice (kilometraj, combustibil, cutie de viteze, avatar vânzător și etichetă de marcă).
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600">
                          <span>{activeCardTheme === 'classic' ? '● ACTIV GLOBAL PE SITE' : '○ Fă clic pentru a activa'}</span>
                        </div>
                      </div>

                    </div>

                    {/* LIVE PREVIEW SECTION (EXACTLY 4 CARS FROM USER PHOTO) */}
                    <div className="border border-slate-200 rounded-3xl p-6 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <div>
                          <h4 className="text-base font-extrabold text-slate-900">
                            Previzualizare Live a Cardurilor (Exact ca în fotografie)
                          </h4>
                          <p className="text-xs text-slate-500">
                            Așa vor arăta anunțurile tale pe site atunci când acest stil este activat.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleActivateGlobalTheme(activeCardTheme === 'modern' ? 'classic' : 'modern')}
                            className="px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
                          >
                            Comută pe {activeCardTheme === 'modern' ? 'Stil Clasic' : 'Stil Modern'}
                          </button>
                        </div>
                      </div>

                      {/* 4 CARDS GRID (EXACT VEHICLES FROM PHOTO) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                        
                        {/* CARD 1: Audi A5 Sportback */}
                        <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden group">
                          <div className="p-2 pb-0">
                            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-[18px]">
                              <img 
                                src="https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=600&auto=format&fit=crop&q=80" 
                                alt="Audi A5 Sportback"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/42.svg'; }}
                              />
                              {/* Dark Circular Heart Button (Top Right) */}
                              <div className="absolute top-2.5 right-2.5 w-[34px] h-[34px] rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                                <Heart size={16} className="text-white" />
                              </div>
                              {/* Dark Pill Year Badge (Bottom Left) */}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11.5px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <Calendar size={13} className="text-white" />
                                <span>2019</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3.5 pt-2.5">
                            <div className="text-[16px] font-bold text-slate-900 mb-0.5">19000 €</div>
                            <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-1 mb-1">Audi A5 Sportback</h3>
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-normal mb-2">
                              <Navigation size={12} className="rotate-45 text-slate-400" />
                              <span>Timisoara · 1.5 km</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">A</div>
                                <span className="text-[11px] font-medium text-slate-700 truncate">Alexandru M.</span>
                              </div>
                              <span className="text-[10px] text-slate-400">acum 2h</span>
                            </div>
                          </div>
                        </div>

                        {/* CARD 2: Renault Twingo */}
                        <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden group">
                          <div className="p-2 pb-0">
                            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-[18px]">
                              <img 
                                src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&auto=format&fit=crop&q=80" 
                                alt="Renault Twingo"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/42.svg'; }}
                              />
                              {/* Dark Circular Heart Button (Top Right) */}
                              <div className="absolute top-2.5 right-2.5 w-[34px] h-[34px] rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                                <Heart size={16} className="text-white" />
                              </div>
                              {/* Dark Pill Year Badge (Bottom Left) */}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11.5px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <Calendar size={13} className="text-white" />
                                <span>2012</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3.5 pt-2.5">
                            <div className="text-[16px] font-bold text-slate-900 mb-0.5">2490 €</div>
                            <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-1 mb-1">Renault Twingo</h3>
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-normal mb-2">
                              <Navigation size={12} className="rotate-45 text-slate-400" />
                              <span>Slatina, Olt · 1.5 km</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">E</div>
                                <span className="text-[11px] font-medium text-slate-700 truncate">Elena P.</span>
                              </div>
                              <span className="text-[10px] text-slate-400">acum 1 zi</span>
                            </div>
                          </div>
                        </div>

                        {/* CARD 3: Audi A8 */}
                        <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden group">
                          <div className="p-2 pb-0">
                            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-[18px]">
                              <img 
                                src="https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=600&auto=format&fit=crop&q=80" 
                                alt="Audi A8"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/42.svg'; }}
                              />
                              {/* Dark Circular Heart Button (Top Right) */}
                              <div className="absolute top-2.5 right-2.5 w-[34px] h-[34px] rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                                <Heart size={16} className="text-white" />
                              </div>
                              {/* Dark Pill Year Badge (Bottom Left) */}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11.5px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <Calendar size={13} className="text-white" />
                                <span>2008</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3.5 pt-2.5">
                            <div className="text-[16px] font-bold text-slate-900 mb-0.5">4200 €</div>
                            <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-1 mb-1">Audi A8</h3>
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-normal mb-2">
                              <Navigation size={12} className="rotate-45 text-slate-400" />
                              <span>Timisoara · 2.1 km</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">M</div>
                                <span className="text-[11px] font-medium text-slate-700 truncate">Marius Auto</span>
                              </div>
                              <span className="text-[10px] text-slate-400">acum 3 zile</span>
                            </div>
                          </div>
                        </div>

                        {/* CARD 4: BMW 116 */}
                        <div className="bg-white rounded-[22px] border border-slate-200/80 shadow-xs hover:shadow-lg transition-all duration-200 overflow-hidden group">
                          <div className="p-2 pb-0">
                            <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden rounded-[18px]">
                              <img 
                                src="https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&auto=format&fit=crop&q=80" 
                                alt="BMW 116"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/42.svg'; }}
                              />
                              {/* Dark Circular Heart Button (Top Right) */}
                              <div className="absolute top-2.5 right-2.5 w-[34px] h-[34px] rounded-full bg-black/45 backdrop-blur-md text-white flex items-center justify-center shadow-sm">
                                <Heart size={16} className="text-white" />
                              </div>
                              {/* Dark Pill Year Badge (Bottom Left) */}
                              <div className="absolute bottom-2.5 left-2.5 bg-black/60 backdrop-blur-md text-white text-[11.5px] font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                                <Calendar size={13} className="text-white" />
                                <span>2010</span>
                              </div>
                            </div>
                          </div>
                          <div className="p-3.5 pt-2.5">
                            <div className="text-[16px] font-bold text-slate-900 mb-0.5">3200 €</div>
                            <h3 className="text-[14px] font-semibold text-slate-800 line-clamp-1 mb-1">BMW 116</h3>
                            <div className="flex items-center gap-1.5 text-[12px] text-slate-400 font-normal mb-2">
                              <Navigation size={12} className="rotate-45 text-slate-400" />
                              <span>Craiova · 1.8 km</span>
                            </div>
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px] font-bold">I</div>
                                <span className="text-[11px] font-medium text-slate-700 truncate">Ionel R.</span>
                              </div>
                              <span className="text-[10px] text-slate-400">acum 5 zile</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {(currentModule === 'dashboard' || currentModule === 'rapoarte' || currentModule === 'mesaje' || currentModule === 'analitice' || currentModule === 'tranzactii' || currentModule === 'seo') && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
                    <Package size={64} className="mb-4 text-slate-200" />
                    <p className="text-lg font-medium">Dashboard Vacio</p>
                    <p className="text-sm">Sección en construcción</p>
                  </div>
                )}

                 {/* MODULE: MODERARE (LARGE CARDS LIST FOR RAPID APPROVAL) */}
                 {currentModule === 'moderare' && (
                   <div className="space-y-4">
                     {pendingAds.length === 0 ? (
                       <div className="py-20 text-center text-slate-400 font-medium bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                         <CheckCircle2 size={56} className="text-emerald-500 mx-auto mb-3 opacity-90" />
                         <p className="text-lg font-extrabold text-slate-800">Toate anunțurile au fost verificate!</p>
                         <p className="text-xs text-slate-400 mt-1">Nu există anunțuri noi în așteptare pentru moderare.</p>
                       </div>
                     ) : (
                       <div className="grid grid-cols-1 gap-4">
                         {pendingAds.map(ad => (
                           <div 
                             key={ad.id} 
                             onClick={() => window.open(getListingUrl(ad), '_blank')}
                             className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-blue-400 hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group relative overflow-hidden cursor-pointer"
                           >
                             
                             {/* Hover Left Accent Line */}
                             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#0a7a5e] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                             {/* Left: Thumbnail & Details */}
                             <div className="flex items-start gap-4 flex-1 min-w-0">
                               <div className="w-24 h-24 rounded-2xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 relative shadow-sm">
                                 {ad.image ? (
                                   <img src={ad.image} alt="" className="w-full h-full object-cover" />
                                 ) : (
                                   <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={28}/></div>
                                 )}
                                 <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">{ad.photoCount || 1}📷</span>
                               </div>
                               
                               <div className="space-y-1.5 flex-1 min-w-0">
                                 <div className="flex items-center gap-2 flex-wrap">
                                   <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                                     ⏳ În Așteptare Aprobare
                                   </span>
                                   <span className="text-[10px] font-mono font-medium text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/80">
                                     #{ad.id?.slice(0, 8)}
                                   </span>
                                   <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                     {ad.category}
                                   </span>
                                 </div>

                                 <div className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 group-hover:underline line-clamp-1 flex items-center gap-1.5 transition-colors">
                                   <span>{ad.title}</span>
                                   <ExternalLink size={16} className="text-slate-400 flex-shrink-0" />
                                 </div>

                                 <div className="text-xs text-slate-500 flex items-center gap-3 flex-wrap font-medium">
                                   <span>📍 {ad.location || 'România'}</span>
                                   <span>•</span>
                                   <span>🕒 Publicat {formatTimeAgo(ad.createdAt)}</span>
                                   <span>•</span>
                                   <span>👤 Vânzător: <strong className="text-slate-700">{ad.seller?.name || 'Utilizator'}</strong></span>
                                 </div>

                                 <div className="flex items-center gap-3 pt-1 text-xs flex-wrap">
                                   <button 
                                     onClick={(e) => { e.stopPropagation(); setInspectAd(ad); }}
                                     className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200/60"
                                     title="Deschide Panou Inspecție Vânzător"
                                   >
                                     <Eye size={12} />
                                     <span>Vezi Detalii Vânzător</span>
                                   </button>

                                   <button 
                                     onClick={(e) => { e.stopPropagation(); handleToggleAutoReactivate(ad.id!, ad.autoReactivate); }}
                                     className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${ad.autoReactivate ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                     title="Comută Reactivare Automată la expirare"
                                   >
                                     <span>{ad.autoReactivate ? '🔄 Auto-Reactivare: DA' : '⚪ Auto-Reactivare: NU'}</span>
                                   </button>

                                   <button
                                     onClick={(e) => { e.stopPropagation(); handleTogglePromoted(ad.id!, ad.title, !!ad.isPromoted); }}
                                     className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${ad.isPromoted ? 'bg-amber-400 text-slate-900 font-black shadow-sm' : 'text-slate-400 hover:text-amber-600'}`}
                                     title="Comută statutul de Promovat VIP"
                                   >
                                     <Zap size={12} className={ad.isPromoted ? 'fill-slate-900' : ''} />
                                     <span>{ad.isPromoted ? '⚡ PROMOVAT VIP' : 'Standard'}</span>
                                   </button>
                                 </div>
                               </div>
                             </div>

                             {/* Right: Price & Large Action Buttons */}
                             <div className="flex flex-row md:flex-col items-end justify-between md:justify-center gap-4 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 flex-shrink-0">
                               <div className="text-left md:text-right">
                                 <span className="text-2xl font-black text-slate-900">{ad.price} {ad.currency || 'EUR'}</span>
                                 {(() => {
                                    const exp = getExpirationCountdownInfo(ad);
                                    return (
                                      <p className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border mt-1 inline-flex items-center gap-1.5 ${exp.badgeClass}`}>
                                        <Clock size={12} className="flex-shrink-0" />
                                        <span>{exp.text}</span>
                                      </p>
                                    );
                                  })()}
                               </div>

                               <div className="flex items-center gap-2">
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleApproveAd(ad.id!, ad.title); }} 
                                   className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all hover:scale-105"
                                   title="Aprobă Anunț și publică live"
                                 >
                                   <Check size={18} strokeWidth={3} />
                                   <span>APROBĂ</span>
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleRejectAd(ad.id!, ad.title); }} 
                                   className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-extrabold text-sm rounded-2xl flex items-center gap-1.5 transition-colors border border-red-200"
                                   title="Respinge Anunț"
                                 >
                                   <X size={18} strokeWidth={2.5} />
                                   <span>RESPINGE</span>
                                 </button>
                                 <button 
                                   onClick={(e) => { e.stopPropagation(); handleDeleteAd(ad.id!, ad.title); }} 
                                   className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-colors" 
                                   title="Șterge definitiv"
                                 >
                                   <Trash2 size={18} />
                                 </button>
                               </div>
                             </div>

                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                 )}

                 {/* MODULE: ANUNȚURI ACTIVE (STANDARD LISTINGS TABLE) */}
                 {currentModule === 'listings' && (
                   <div className="space-y-4">
                     <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                       <div className="flex items-center gap-2">
                         <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${statusFilter === 'all' ? 'bg-[#1e88e5] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Toate ({listings.length})</button>
                         <button onClick={() => setStatusFilter('pending')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${statusFilter === 'pending' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>În așteptare ({pendingAds.length})</button>
                         <button onClick={() => setStatusFilter('active')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${statusFilter === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Active ({activeAds.length})</button>
                         <button onClick={() => setStatusFilter('rejected')} className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${statusFilter === 'rejected' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Respinse ({rejectedAds.length})</button>
                       </div>
                     </div>

                     <div className="overflow-x-auto">
                       <table className="w-full text-left border-collapse">
                         <thead>
                           <tr className="border-b-2 border-slate-100 text-slate-500 text-xs font-semibold tracking-wider">
                             <th className="py-3 px-4">Anunț</th>
                             <th className="py-3 px-4">Publicat De</th>
                             <th className="py-3 px-4">Preț</th>
                             <th className="py-3 px-4">Status</th>
                             <th className="py-3 px-4">Contor Expirare</th>
                             <th className="py-3 px-4 text-right">Acțiuni</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100 text-sm">
                           {filteredListings.length === 0 ? (
                             <tr><td colSpan={6} className="py-8 text-center text-slate-400">Niciun anunț găsit.</td></tr>
                           ) : (
                             filteredListings.map(ad => {
                               const expInfo = getExpirationCountdownInfo(ad);
                               return (
                                 <tr key={ad.id} className="hover:bg-slate-50/80 transition-colors group">
                                   <td className="py-3 px-4">
                                     <div className="flex items-center gap-3">
                                       <Link href={getListingUrl(ad)} target="_blank" className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden border border-slate-200 hover:opacity-80 transition-opacity shadow-sm">
                                         {ad.image ? <img src={ad.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package size={20}/></div>}
                                       </Link>
                                       <div>
                                         <Link href={getListingUrl(ad)} target="_blank" className="font-semibold text-slate-800 hover:text-blue-600 hover:underline line-clamp-1 transition-colors flex items-center gap-1">
                                           <span>{ad.title}</span>
                                           <ExternalLink size={12} className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                         </Link>
                                         <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                           <span className="font-mono text-[10px] text-slate-400 font-medium bg-slate-50 px-1 py-0.2 rounded border border-slate-200/80">#{ad.id?.slice(0, 8)}</span>
                                           <span>•</span>
                                           <span>{formatTimeAgo(ad.createdAt)}</span>
                                         </div>
                                       </div>
                                     </div>
                                   </td>
                                   <td className="py-3 px-4">
                                     <div className="flex items-center gap-2">
                                       <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-black border border-blue-200 flex-shrink-0">
                                         {ad.seller?.name?.charAt(0) || 'U'}
                                       </div>
                                       <div className="min-w-0">
                                         <p className="text-xs font-extrabold text-slate-800 line-clamp-1">{ad.seller?.name || 'Utilizator'}</p>
                                         {ad.seller?.phone && <p className="text-[10px] text-slate-400 font-medium">📞 {ad.seller.phone}</p>}
                                       </div>
                                     </div>
                                   </td>
                                   <td className="py-3 px-4 font-semibold text-slate-600">{ad.price} {ad.currency || 'EUR'}</td>
                                   <td className="py-3 px-4">
                                     <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${ad.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-300' : ad.status === 'active' ? 'bg-emerald-100 text-emerald-700' : ad.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                                       {ad.status === 'pending' ? 'În așteptare' : ad.status === 'active' ? 'Activ' : ad.status === 'rejected' ? 'Respins' : (ad.status || 'active')}
                                     </span>
                                   </td>
                                   <td className="py-3 px-4 text-xs font-semibold whitespace-nowrap">
                                     <span className={`px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 font-bold ${expInfo.badgeClass}`}>
                                       <Clock size={13} className="flex-shrink-0" />
                                       {expInfo.text}
                                     </span>
                                   </td>
                                   <td className="py-3 px-4 text-right">
                                     <div className="flex items-center justify-end gap-1.5">
                                       <button 
                                         onClick={() => setInspectAd(ad)} 
                                         className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold" 
                                         title="Inspecție Detalii Vânzător"
                                       >
                                         <Eye size={16} />
                                       </button>
                                       <Link 
                                         href={getListingUrl(ad)} 
                                         target="_blank" 
                                         className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors" 
                                         title="Deschide Anunț Live"
                                       >
                                         <ExternalLink size={16} />
                                       </Link>
                                       <button 
                                         onClick={() => handleDeleteAd(ad.id!, ad.title)} 
                                         className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" 
                                         title="Șterge Anunț"
                                       >
                                         <Trash2 size={16} />
                                       </button>
                                     </div>
                                   </td>
                                 </tr>
                               );
                             })
                           )}
                         </tbody>
                       </table>
                     </div>
                   </div>
                 )}

                {/* MODULE: USERS */}
                {currentModule === 'users' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b-2 border-slate-100 text-slate-500 text-xs font-semibold tracking-wider">
                          <th className="py-3 px-4">Utilizator</th>
                          <th className="py-3 px-4">Rol</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 text-right">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredUsers.length === 0 ? (
                          <tr><td colSpan={4} className="py-8 text-center text-slate-400">Niciun utilizator găsit.</td></tr>
                        ) : (
                          filteredUsers.map(u => (
                            <tr key={u.uid} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img src={`https://ui-avatars.com/api/?name=${u.email}`} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
                                  <div>
                                    <div className="font-semibold text-slate-800">{u.displayName || 'Utilizator'}</div>
                                    <div className="text-xs text-slate-500">{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${u.role === 'admin' ? 'bg-[#00acc1] text-white' : 'bg-slate-100 text-slate-700'}`}>
                                  {u.role || 'user'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${u.status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                  {u.status || 'active'}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => handleToggleUserStatus(u)} className={`p-1.5 rounded transition-colors ${u.status === 'blocked' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`} title={u.status === 'blocked' ? 'Deblochează' : 'Blochează'}>
                                    {u.status === 'blocked' ? <UserCheck size={16}/> : <UserX size={16}/>}
                                  </button>
                                  <button onClick={() => handleToggleUserRole(u)} className="p-1.5 bg-slate-50 text-slate-600 rounded hover:bg-slate-200 transition-colors" title="Schimbă Rol">
                                    <Shield size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}
