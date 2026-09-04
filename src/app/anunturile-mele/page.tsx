'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/lib/AuthContext';
import { getListings, getListingsByUserId, AdListing, deleteListingFromDb } from '@/lib/db';
import { getListingUrl } from '@/lib/slugUtils';
import {
  Inbox,
  Search,
  PlusCircle,
  Eye,
  Edit,
  Trash2,
  Zap,
  Tag,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AnunturileMelePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [userListings, setUserListings] = useState<AdListing[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'asteptare' | 'respinse' | 'dezactivate' | 'expirate' | 'vandute'>('active');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }
    const loadData = async () => {
      const dbMine = await getListingsByUserId(currentUser.uid);
      let localMine: AdListing[] = [];
      try {
        const saved = localStorage.getItem('monky_user_listings');
        if (saved) {
          localMine = JSON.parse(saved);
        }
      } catch (e) {}

      const map = new Map<string, AdListing>();
      [...localMine, ...dbMine].forEach((item) => {
        if (item.id) {
          map.set(item.id, {
            ...item,
            status: item.status || 'active',
          });
        }
      });
      setUserListings(Array.from(map.values()));
    };
    loadData();
  }, [currentUser, loading, router]);

  const activeListings = userListings.filter(item => !item.status || item.status === 'active');
  const pendingListings = userListings.filter(item => item.status === 'pending');
  const rejectedListings = userListings.filter(item => item.status === 'rejected');

  const currentTabListings = activeTab === 'asteptare'
    ? pendingListings
    : activeTab === 'respinse'
    ? rejectedListings
    : activeListings;

  const filteredBySearch = currentTabListings.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const getTabCount = (tabKey: string) => {
    if (tabKey === 'active') return activeListings.length;
    if (tabKey === 'asteptare') return pendingListings.length;
    if (tabKey === 'respinse') return rejectedListings.length;
    return 0;
  };

  const handleDelete = async (id: string) => {
    if (confirm('Ești sigur că vrei să ștergi acest anunț? Acțiunea este ireversibilă.')) {
      try {
        await deleteListingFromDb(id);
        setUserListings(prev => prev.filter(item => item.id !== id));
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('A apărut o eroare la ștergerea anunțului.');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f6] dark:bg-[#131417] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <Navbar favoriteCount={3} />

      <main className="main-container flex-grow max-w-[1100px] mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Anunțurile mele
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Gestionează-ți anunțurile publicate
          </p>
        </div>

        {/* Status Tabs Bar */}
        <div className="bg-white dark:bg-[#242424] rounded-2xl md:rounded-full p-2 border border-slate-200 dark:border-[#333333] shadow-sm mb-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-6 px-2 min-w-max text-xs sm:text-sm font-medium">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-2 px-3 transition-colors ${
                activeTab === 'active'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Active ({getTabCount('active')})
            </button>
            <button
              onClick={() => setActiveTab('asteptare')}
              className={`py-2 px-3 transition-colors ${
                activeTab === 'asteptare'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              În așteptare ({getTabCount('asteptare')})
            </button>
            <button
              onClick={() => setActiveTab('respinse')}
              className={`py-2 px-3 transition-colors ${
                activeTab === 'respinse'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Respinse ({getTabCount('respinse')})
            </button>
            <button
              onClick={() => setActiveTab('dezactivate')}
              className={`py-2 px-3 transition-colors ${
                activeTab === 'dezactivate'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Dezactivate (0)
            </button>
            <button
              onClick={() => setActiveTab('expirate')}
              className={`py-2 px-3 transition-colors ${
                activeTab === 'expirate'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Expirate (0)
            </button>
            <button
              onClick={() => setActiveTab('vandute')}
              className={`py-2 px-3 transition-colors ${
                activeTab === 'vandute'
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold border-b-2 border-emerald-600 dark:border-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Vândute (0)
            </button>
          </div>
        </div>

        {/* Search Input Row */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Caută în ${activeTab}...`}
              className="w-full bg-white dark:bg-[#242424] border border-slate-200 dark:border-[#333333] rounded-2xl py-3 px-4 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all placeholder-slate-400"
            />
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-2xl text-sm transition-all shadow-md flex-shrink-0">
            Caută
          </button>
        </div>

        {/* Main Content Area */}
        {filteredBySearch.length > 0 ? (
          <div className="flex flex-col gap-4">
            {filteredBySearch.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#242424] rounded-3xl p-5 border border-slate-200 dark:border-[#333333] shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-24 h-24 rounded-2xl object-cover bg-slate-100 dark:bg-[#181818] border border-slate-200 dark:border-[#333333] flex-shrink-0"
                  />
                  <div className="min-w-0">
                    {item.status === 'pending' ? (
                      <span className="inline-block bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                        ⏳ În verificare manuală (24h)
                      </span>
                    ) : item.status === 'rejected' ? (
                      <span className="inline-block bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                        ❌ Respins
                      </span>
                    ) : (
                      <span className="inline-block bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold px-2.5 py-0.5 rounded-full mb-1">
                        ✅ Activ
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                      {item.title}
                    </h3>
                    <p className="text-lg font-extrabold text-blue-600 dark:text-sky-400 mt-0.5">
                      {item.price && !isNaN(Number(item.price)) ? Number(item.price).toLocaleString('ro-RO') : '0'} €
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{item.location}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye size={13} /> 245 vizualizări
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap sm:flex-col items-stretch sm:items-end gap-2 w-full sm:w-auto flex-shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-[#333333]">
                  <Link
                    href={getListingUrl(item)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#3d3d3d] text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-all"
                  >
                    <ExternalLink size={14} />
                    <span>Vezi anunț</span>
                  </Link>

                  <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
                    <Zap size={14} className="fill-white" />
                    <span>Promovează</span>
                  </button>

                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 mt-1 sm:mt-0 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-xs font-semibold transition-all"
                  >
                    <Trash2 size={14} />
                    <span>Șterge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State matching Screenshot */
          <div className="bg-white dark:bg-[#242424] rounded-3xl p-12 md:p-16 text-center border border-slate-200 dark:border-[#333333] shadow-sm flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-[#333333] rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5 shadow-inner">
              <Inbox size={32} />
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Nu ai anunțuri în această secțiune
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mb-6">
              Adaugă primul tău anunț și începe să vinzi!
            </p>

            <Link
              href="/adauga-anunt"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-600/20 transition-all text-sm inline-flex items-center gap-2"
            >
              <PlusCircle size={18} />
              <span>Adaugă anunț</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
