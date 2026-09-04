import { MetadataRoute } from 'next';
import { OFFICIAL_CATEGORIES } from '@/data/categories';
import { getListings } from '@/lib/db';
import { getListingUrl } from '@/lib/slugUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tevinde.ro';
  const now = new Date();

  // Core Static Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/cautare`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/adauga-anunt`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/favorite`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/autentificare`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/inregistrare`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Official Category Search Pages for Google Deep Indexing
  const categoryRoutes: MetadataRoute.Sitemap = OFFICIAL_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/cautare?category=${encodeURIComponent(cat.id)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }));

  // Dynamic Real Listings from Database
  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const listings = await getListings();
    listingRoutes = listings.slice(0, 1000).map((ad) => {
      const path = getListingUrl(ad as any);
      let lastMod = now;
      const raw = (ad as any).createdAtTime || ad.createdAt || (ad as any).timestamp;
      if (typeof raw === 'number' && raw > 0) {
        lastMod = new Date(raw);
      } else if (typeof raw === 'object' && raw?.seconds) {
        lastMod = new Date(raw.seconds * 1000);
      } else if (typeof raw === 'string') {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          lastMod = d;
        }
      }

      return {
        url: `${baseUrl}${path}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: ad.isPromoted ? 0.8 : 0.7,
      };
    });
  } catch (e) {
    console.error('Error fetching listings for sitemap:', e);
  }

  return [...staticRoutes, ...categoryRoutes, ...listingRoutes];
}
