import React from 'react';
import { Metadata } from 'next';
import { getListingById } from '@/lib/db';
import ListingDetailClient from './ListingDetailClient';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getListingById(params.id);
  if (!listing) {
    return {
      title: 'Anunț negăsit | Tevinde.ro',
      description: 'Anunțul căutat nu este disponibil pe Tevinde.ro.',
    };
  }

  const priceText = listing.price && !isNaN(Number(listing.price))
    ? `${Number(listing.price).toLocaleString('ro-RO')} ${listing.currency || '€'}`
    : 'Preț la cerere';
  const title = `${listing.title} - ${priceText} | Tevinde.ro`;
  const description = listing.description
    ? listing.description.substring(0, 160)
    : `${listing.title} de vânzare în ${listing.location || 'România'}. Vezi poze, preț și detalii pe Tevinde.ro.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: listing.image ? [{ url: listing.image }] : [],
    },
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListingById(params.id);
  
  return <ListingDetailClient initialListing={listing || null} targetId={params.id} />;
}
