'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import '@/app/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MOCK_LISTINGS, Listing } from '@/data/mockData';
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
  CheckCircle,
} from 'lucide-react';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [userListings, setUserListings] = React.useState<Listing[]>([]);

  React.useEffect(() => {
    try {
      const savedUserAds = localStorage.getItem('monky_user_listings');
      if (savedUserAds) {
        setUserListings(JSON.parse(savedUserAds));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const allListings = React.useMemo(() => {
    return [...userListings, ...MOCK_LISTINGS];
  }, [userListings]);

  const listing: Listing | undefined = allListings.find((item) => item.id === id);

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar favoriteCount={0} />
        <main className="main-container flex-grow py-16 text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Anunțul nu a fost găsit</h1>
          <p className="text-slate-500 mb-6">Ne pare rău, dar anunțul căutat nu mai este disponibil sau a fost șters.</p>
          <Link
            href="/"
            className="ad-btn-primary inline-flex max-w-xs mx-auto"
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar favoriteCount={isFavorite ? 1 : 0} />

      <main className="main-container flex-grow">
        {/* Navigation & Action Bar */}
        <div className="ad-detail-nav">
          <Link href="/" className="ad-back-link">
            <ArrowLeft size={16} />
            Înapoi la lista de anunțuri
          </Link>

          <div className="ad-action-btns">
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="ad-action-btn"
            >
              <Heart
                size={18}
                fill={isFavorite ? '#f9423a' : 'none'}
                color={isFavorite ? '#f9423a' : 'currentColor'}
              />
              <span>{isFavorite ? 'Salvat' : 'Salvează'}</span>
            </button>
            <button className="ad-action-btn">
              <Share2 size={18} />
              <span>Distribuie</span>
            </button>
          </div>
        </div>

        {/* 2-Column Detail Grid */}
        <div className="ad-detail-grid">
          {/* Main Card (Left Column) */}
          <div className="ad-main-card">
            {/* Gallery Box */}
            <div className="ad-gallery-box">
              <img
                src={galleryImages[activeImageIdx]}
                alt={listing.title}
              />
            </div>

            {/* Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="ad-thumbnails">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`ad-thumb-btn ${activeImageIdx === idx ? 'active' : ''}`}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Metadata */}
            <div>
              <h1 className="ad-title">{listing.title}</h1>
              <div className="ad-meta-row" style={{ marginTop: '8px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={15} style={{ color: 'var(--sbt-primary-color)' }} />
                  {listing.location}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={15} />
                  {listing.createdAt}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Eye size={15} />
                  245 vizualizări
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="ad-price-row">
              <span>{listing.price.toLocaleString('ro-RO')} €</span>
              {listing.hasShipping && (
                <span className="ad-shipping-badge">
                  <Truck size={15} /> Livrare disponibilă
                </span>
              )}
            </div>

            {/* Specifications Grid */}
            <div className="ad-specs-table">
              <div>
                <span className="ad-spec-label">Stare</span>
                <span className="ad-spec-value">{listing.condition}</span>
              </div>
              {listing.brand && (
                <div>
                  <span className="ad-spec-label">Marca</span>
                  <span className="ad-spec-value">{listing.brand}</span>
                </div>
              )}
              {listing.model && (
                <div>
                  <span className="ad-spec-label">Model</span>
                  <span className="ad-spec-value">{listing.model}</span>
                </div>
              )}
              <div>
                <span className="ad-spec-label">Garanție</span>
                <span className="ad-spec-value">6 luni</span>
              </div>
              <div>
                <span className="ad-spec-label">Tip Anunț</span>
                <span className="ad-spec-value">Persoană fizică</span>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginTop: '8px' }}>
              <h3 className="ad-description-title">Descrierea anunțului</h3>
              <p className="ad-description-text">{listing.description}</p>
            </div>
          </div>

          {/* Sidebar Card (Right Column) */}
          <div className="ad-sidebar-card">
            <div className="ad-seller-header">
              <div className="ad-seller-avatar">
                {listing.seller.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <h4 className="ad-seller-name">{listing.seller.name}</h4>
                  {listing.seller.verified && (
                    <ShieldCheck size={18} style={{ color: 'var(--sbt-primary-color)' }} />
                  )}
                </div>
                <div className="ad-seller-rating">
                  <Star size={14} fill="currentColor" />
                  <span>{listing.seller.rating}</span>
                  <span style={{ color: 'var(--sbt-grey2)', fontWeight: 400 }}>({listing.seller.responseRate} răspuns)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPhone(!showPhone)}
              className="ad-btn-primary"
            >
              <Phone size={18} />
              {showPhone ? '0742 891 304' : 'Afișează numărul de telefon'}
            </button>

            <button className="ad-btn-secondary">
              <MessageCircle size={18} />
              Trimite mesaj vânzătorului
            </button>

            <div style={{ background: 'var(--sbt-grey5)', padding: '14px', borderRadius: '12px', border: 'var(--sbt-border-default)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <CheckCircle size={20} style={{ color: 'var(--sbt-accent-green)', flexShrink: 0, marginTop: '2px' }} />
              <div style={{ fontSize: '12px', color: 'var(--sbt-grey1)', lineHeight: '1.4' }}>
                <strong style={{ display: 'block', marginBottom: '2px' }}>Tranzacționează în siguranță</strong>
                Nu plăti în avans și verifică produsul personal înainte de cumpărare.
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button style={{ fontSize: '12px', color: 'var(--sbt-grey3)', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Flag size={14} />
                Raportează acest anunț
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
