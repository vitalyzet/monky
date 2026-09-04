import React, { cache } from 'react';
import { Metadata } from 'next';
import { getListingById } from '@/lib/db';
import ListingDetailClient from './ListingDetailClient';

const getCachedListing = cache(async (id: string) => {
  return getListingById(id);
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const listing = await getCachedListing(params.id);
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
    ? listing.description.replace(/\s+/g, ' ').substring(0, 160).trim()
    : `${listing.title} de vânzare în ${listing.location || 'România'}. Vezi poze, specificații, preț și contact direct pe Tevinde.ro.`;

  const images = listing.gallery && listing.gallery.length > 0
    ? listing.gallery
    : listing.image
    ? [listing.image]
    : ['/tevinde-logo-thumb.png'];

  return {
    title,
    description,
    alternates: {
      canonical: `/anunt/${listing.id}`,
    },
    openGraph: {
      type: 'article',
      url: `https://tevinde.ro/anunt/${listing.id}`,
      title,
      description,
      images: images.map((img) => ({ url: img })),
      siteName: 'Tevinde.ro',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images,
    },
  };
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getCachedListing(params.id);

  // Generate Product / Vehicle Rich Snippet for Google Search
  let jsonLdProduct: any = null;
  let jsonLdBreadcrumbs: any = null;

  if (listing) {
    const images = listing.gallery && listing.gallery.length > 0
      ? listing.gallery
      : listing.image
      ? [listing.image]
      : [];

    const numPrice = Number(listing.price);

    jsonLdProduct = {
      '@context': 'https://schema.org',
      '@type': ['Product', 'Car'],
      name: listing.title,
      description: listing.description || listing.title,
      image: images,
      brand: listing.brand ? { '@type': 'Brand', name: listing.brand } : undefined,
      model: listing.model || undefined,
      offers: {
        '@type': 'Offer',
        url: `https://tevinde.ro/anunt/${listing.id}`,
        priceCurrency: listing.currency === 'RON' ? 'RON' : 'EUR',
        price: !isNaN(numPrice) && numPrice > 0 ? numPrice : 0,
        availability: 'https://schema.org/InStock',
        itemCondition: 'https://schema.org/UsedCondition',
        seller: {
          '@type': 'Person',
          name: listing.seller?.name || 'Vânzător Tevinde',
        },
      },
      itemCondition: 'https://schema.org/UsedCondition',
      mileageFromOdometer: listing.mileage ? `${listing.mileage} km` : undefined,
      vehicleModelDate: listing.year ? String(listing.year) : undefined,
      fuelType: listing.fuel || undefined,
      vehicleTransmission: listing.transmission || undefined,
    };

    jsonLdBreadcrumbs = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Acasă',
          item: 'https://tevinde.ro',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: listing.category || 'Anunțuri',
          item: `https://tevinde.ro/cautare?category=${encodeURIComponent(listing.category || 'all')}`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: listing.title,
          item: `https://tevinde.ro/anunt/${listing.id}`,
        },
      ],
    };
  }

  return (
    <>
      {jsonLdProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdProduct) }}
        />
      )}
      {jsonLdBreadcrumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdBreadcrumbs) }}
        />
      )}
      <ListingDetailClient initialListing={listing || null} targetId={params.id} />
    </>
  );
}
