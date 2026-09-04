import { extractListingId } from './slugUtils';
import { AdListing } from './db';

declare global {
  interface Window {
    __MONKY_AD_CACHE?: Record<string, AdListing>;
    __MONKY_IMG_PREFETCHED?: Set<string>;
  }
}

/**
 * Pre-warms an ad in browser memory, sessionStorage, and browser image cache
 */
export function prewarmListing(item: any) {
  if (typeof window === 'undefined' || !item || !item.id) return;

  try {
    window.__MONKY_AD_CACHE = window.__MONKY_AD_CACHE || {};
    window.__MONKY_AD_CACHE[item.id] = item;

    // Store in sessionStorage for cross-navigation persistence
    sessionStorage.setItem(`monky_ad_${item.id}`, JSON.stringify(item));
    sessionStorage.setItem('monky_ad_active', JSON.stringify(item));
    sessionStorage.setItem('lastViewedAdId', item.id);

    // Preload main image into browser memory so it renders in 0ms on click
    const mainImg = item.image || (item.gallery && item.gallery[0]);
    if (mainImg && typeof window !== 'undefined') {
      window.__MONKY_IMG_PREFETCHED = window.__MONKY_IMG_PREFETCHED || new Set();
      if (!window.__MONKY_IMG_PREFETCHED.has(mainImg)) {
        window.__MONKY_IMG_PREFETCHED.add(mainImg);
        const img = new Image();
        img.src = mainImg;
      }
    }
  } catch (e) {
    // Ignore storage quota
  }
}

/**
 * Bulk pre-warms all listings when entering search page or homepage
 */
export function prewarmAllListings(listings: any[]) {
  if (typeof window === 'undefined' || !listings || listings.length === 0) return;
  try {
    window.__MONKY_AD_CACHE = window.__MONKY_AD_CACHE || {};
    listings.forEach((item) => {
      if (item && item.id) {
        window.__MONKY_AD_CACHE![item.id] = item;
        try {
          sessionStorage.setItem(`monky_ad_${item.id}`, JSON.stringify(item));
        } catch (e) {}
      }
    });
  } catch (e) {}
}

/**
 * Instantly retrieves a listing from memory or sessionStorage (0ms)
 */
export function getCachedListing(targetId: string): AdListing | null {
  if (typeof window === 'undefined' || !targetId) return null;
  try {
    const cleanId = extractListingId(targetId);

    // 1. Check in-memory global cache (fastest, 0.01ms)
    if (window.__MONKY_AD_CACHE) {
      if (window.__MONKY_AD_CACHE[cleanId]) return window.__MONKY_AD_CACHE[cleanId];
      if (window.__MONKY_AD_CACHE[targetId]) return window.__MONKY_AD_CACHE[targetId];
      for (const key of Object.keys(window.__MONKY_AD_CACHE)) {
        if (key === cleanId || key === targetId || targetId.endsWith(key)) {
          return window.__MONKY_AD_CACHE[key];
        }
      }
    }

    // 2. Check sessionStorage
    const raw =
      sessionStorage.getItem(`monky_ad_${cleanId}`) ||
      sessionStorage.getItem(`monky_ad_${targetId}`) ||
      sessionStorage.getItem('monky_ad_active');

    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) {
        const parsedId = parsed.id || '';
        if (parsedId === cleanId || parsedId === targetId || targetId.endsWith(parsedId) || cleanId.endsWith(parsedId)) {
          return parsed;
        }
      }
    }
  } catch (e) {}
  return null;
}
