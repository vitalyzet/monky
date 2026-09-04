import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Timestamp,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  limit,
  where,
  serverTimestamp
} from 'firebase/firestore';

export interface AdListing {
  id?: string;
  userId?: string;
  title: string;
  price: number;
  currency?: 'EUR' | 'RON';
  hasShipping: boolean;
  hasInspection?: boolean;
  isNegotiable?: boolean;
  isExchange?: boolean;
  location: string;
  photoCount: number;
  category: string;
  brand?: string;
  model?: string;
  phoneColor?: string;
  storageCapacity?: string;
  batteryHealth?: string;
  subType?: string;
  itemSize?: string;
  warranty?: string;
  image: string;
  gallery: string[];
  description: string;
  condition: string;
  createdAt: string;
  createdAtTime?: number;
  timestamp?: Timestamp;
  year?: string;
  mileage?: string;
  fuel?: string;
  transmission?: string;
  euroClass?: string;
  caroserie?: string;
  bodyType?: string;
  enginePower?: string;
  putere?: string;
  registrationStatus?: string;
  engineCapacity?: string;
  maxPower?: string;
  isPromoted?: boolean;
  autoReactivate?: boolean;
  expiresAt?: string;
  status?: 'pending' | 'active' | 'rejected' | 'deactivated' | 'expired' | 'sold';
  seller: {
    name: string;
    rating: number;
    responseRate: string;
    verified: boolean;
    phone: string;
    isDealer: boolean;
  };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'blocked';
  phone?: string;
}

const LISTINGS_COLLECTION = 'listings';

export const saveListing = async (listingData: Omit<AdListing, 'id'>) => {
  try {
    // Recursive function to remove undefined values
    const cleanObject = (obj: any): any => {
      if (Array.isArray(obj)) {
        return obj.map(cleanObject).filter((v) => v !== undefined);
      } else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj)
            .filter(([_, v]) => v !== undefined)
            .map(([k, v]) => [k, cleanObject(v)])
        );
      }
      return obj;
    };

    const cleanData = cleanObject(listingData);

    const docRef = await addDoc(collection(db, LISTINGS_COLLECTION), {
      status: cleanData.status || 'active', // Direct activ pentru a apărea instant pe site și în aplicație
      ...cleanData,
      timestamp: Timestamp.now(),
    });
    listingsCache = null;
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};

let listingsCache: AdListing[] | null = null;
let cacheTimestamp = 0;
const individualListingCache = new Map<string, { listing: AdListing; expires: number }>();

export const getListings = async (forceRefresh = false): Promise<AdListing[]> => {
  const now = Date.now();
  if (!forceRefresh && listingsCache && now - cacheTimestamp < 60000) {
    return listingsCache;
  }

  try {
    const q = query(collection(db, LISTINGS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const listings: AdListing[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.title || String(data.title).trim() === '' || data.image === '/images/bici.png' || !data.price) {
        return; // Ignore incomplete or invalid documents
      }
      // Doar anunțurile respinse sau dezactivate manual de admin sunt ascunse
      if (data.status === 'rejected' || data.status === 'deactivated' || data.status === 'expired') {
        return;
      }
      const timestamp = data.timestamp?.seconds ? { seconds: data.timestamp.seconds } : data.timestamp;
      const item = {
        status: data.status || 'active',
        ...data,
        id: docSnap.id,
        timestamp,
      } as AdListing;
      listings.push(item);
      individualListingCache.set(docSnap.id, { listing: item, expires: now + 300000 });
      if (item.id) {
        individualListingCache.set(item.id, { listing: item, expires: now + 300000 });
      }
    });
    const sorted = listings.sort((a, b) => {
      const timeA = a.createdAtTime || (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0);
      const timeB = b.createdAtTime || (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0);
      return timeB - timeA;
    });
    listingsCache = sorted;
    cacheTimestamp = now;
    return sorted;
  } catch (error) {
    console.error("Error getting documents: ", error);
    return listingsCache || [];
  }
};


export const getListingsByUserId = async (userId: string): Promise<AdListing[]> => {
  try {
    const q = query(collection(db, LISTINGS_COLLECTION), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    const listings: AdListing[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const timestamp = data.timestamp?.seconds ? { seconds: data.timestamp.seconds } : data.timestamp;
      listings.push({
        status: data.status || 'active',
        ...data,
        id: docSnap.id,
        timestamp,
      } as AdListing);
    });
    return listings.sort((a, b) => {
      const timeA = a.timestamp?.seconds || 0;
      const timeB = b.timestamp?.seconds || 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting user documents: ", error);
    return [];
  }
};

import { extractListingId } from './slugUtils';

export const getListingById = async (slugOrId: string): Promise<AdListing | null> => {
  if (!slugOrId) return null;
  const targetId = extractListingId(slugOrId);
  const now = Date.now();

  // 1. Instant in-memory cache lookup (0ms)
  const cachedIndiv = individualListingCache.get(targetId) || individualListingCache.get(slugOrId);
  if (cachedIndiv && cachedIndiv.expires > now) {
    return cachedIndiv.listing;
  }

  // 2. Search in global listings cache if available
  if (listingsCache) {
    const cachedFound = listingsCache.find(
      (item) => item.id === targetId || item.id === slugOrId || (item.id && slugOrId.endsWith(item.id))
    );
    if (cachedFound) {
      individualListingCache.set(targetId, { listing: cachedFound, expires: now + 300000 });
      return cachedFound;
    }
  }

  // 3. Direct Firestore document query
  try {
    let docRef = doc(db, LISTINGS_COLLECTION, targetId);
    let docSnap = await getDoc(docRef);

    if (!docSnap.exists() && targetId !== slugOrId) {
      docRef = doc(db, LISTINGS_COLLECTION, slugOrId);
      docSnap = await getDoc(docRef);
    }

    if (docSnap.exists()) {
      const data = docSnap.data();
      const timestamp = data.timestamp?.seconds ? { seconds: data.timestamp.seconds } : data.timestamp;
      const res = { 
        ...data, 
        id: docSnap.id,
        timestamp,
      } as AdListing;
      individualListingCache.set(targetId, { listing: res, expires: now + 300000 });
      individualListingCache.set(docSnap.id, { listing: res, expires: now + 300000 });
      return res;
    }

    // 4. Fallback search among all listings
    const allListings = await getListings();
    const shortSearch = slugOrId.split('-').pop()?.toLowerCase() || '';

    const found = allListings.find((item) => {
      if (!item.id) return false;
      const itemId = item.id.toLowerCase();
      return (
        itemId === targetId.toLowerCase() ||
        itemId === slugOrId.toLowerCase() ||
        slugOrId.toLowerCase().endsWith(itemId) ||
        (shortSearch.length >= 4 && itemId.includes(shortSearch))
      );
    });

    if (found) {
      individualListingCache.set(targetId, { listing: found, expires: now + 300000 });
      return found;
    }
    return null;
  } catch (error) {
    console.error("Error getting document:", error);
    return null;
  }
};

export const deleteListingFromDb = async (id: string) => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await deleteDoc(docRef);

    // Dacă id-ul era un ID generat local de client (user-ad-...), căutăm și ștergem și documentul din Firestore cu acest câmp
    if (id.startsWith('user-ad-') || id.startsWith('local-')) {
      try {
        const q = query(collection(db, LISTINGS_COLLECTION), where('id', '==', id));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await deleteDoc(d.ref);
        });
      } catch (err) {
        // Ignoră erorile minore de interogare
      }
    }

    listingsCache = null;
    cacheTimestamp = 0;

    if (typeof window !== 'undefined') {
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

        // Evenimente globale pentru actualizarea instantanee a tuturor paginilor deschise
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('monky_listing_deleted', { detail: { id } }));
      } catch (e) {
        console.error(e);
      }
    }
  } catch (error) {
    console.error("Error deleting document from Firestore: ", error);
  }
};

export const updateListingInDb = async (id: string, updatedData: Partial<AdListing>) => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await setDoc(docRef, {
      ...updatedData,
      timestamp: serverTimestamp(),
    }, { merge: true });
    listingsCache = null;
    return true;
  } catch (error) {
    console.error("Error updating document in Firestore: ", error);
    throw error;
  }
};

export const updateSellerAvatarInAllListings = async (userId: string, sellerName: string, avatarUrl: string) => {
  try {
    const q = query(collection(db, LISTINGS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const updates: Promise<any>[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (
        (userId && data.userId === userId) ||
        (sellerName && data.seller?.name?.toLowerCase() === sellerName.toLowerCase())
      ) {
        const docRef = doc(db, LISTINGS_COLLECTION, docSnap.id);
        updates.push(
          setDoc(
            docRef,
            {
              seller: {
                ...data.seller,
                avatar: avatarUrl,
                avatarUrl: avatarUrl,
              },
            },
            { merge: true }
          )
        );
      }
    });
    await Promise.all(updates);
    listingsCache = null;
  } catch (err) {
    console.error("Error updating seller avatar in all listings:", err);
  }
};

export const getAllListingsForAdmin = async (): Promise<AdListing[]> => {
  try {
    const q = query(collection(db, LISTINGS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const listings: AdListing[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (!data.title || String(data.title).trim() === '' || !data.price) {
        return;
      }
      const timestamp = data.timestamp?.seconds ? { seconds: data.timestamp.seconds } : data.timestamp;
      listings.push({
        status: data.status || 'active',
        ...data,
        id: docSnap.id,
        timestamp,
      } as AdListing);
    });
    return listings.sort((a, b) => {
      const timeA = a.createdAtTime || (a.timestamp?.seconds ? a.timestamp.seconds * 1000 : 0);
      const timeB = b.createdAtTime || (b.timestamp?.seconds ? b.timestamp.seconds * 1000 : 0);
      return timeB - timeA;
    });
  } catch (error) {
    console.error("Error getting admin listings: ", error);
    return [];
  }
};

export const updateListingStatusInDb = async (id: string, status: 'pending' | 'active' | 'rejected') => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await setDoc(docRef, { status }, { merge: true });
    listingsCache = null;
    return true;
  } catch (error) {
    console.error("Error updating listing status: ", error);
    throw error;
  }
};

const USERS_COLLECTION = 'users';

export const saveOrUpdateUserInDb = async (profile: UserProfile) => {
  try {
    const docRef = doc(db, USERS_COLLECTION, profile.uid);
    await setDoc(docRef, {
      ...profile,
      role: profile.role || 'user',
      status: profile.status || 'active',
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving user: ", error);
  }
};

let usersCache: UserProfile[] | null = null;
let usersCacheTimestamp = 0;

export const getAllUsersFromDb = async (forceRefresh = false): Promise<UserProfile[]> => {
  const now = Date.now();
  if (!forceRefresh && usersCache && now - usersCacheTimestamp < 300000) {
    return usersCache;
  }
  try {
    const q = query(collection(db, USERS_COLLECTION));
    const querySnapshot = await getDocs(q);
    const users: UserProfile[] = [];
    querySnapshot.forEach((docSnap) => {
      users.push({
        ...docSnap.data(),
        uid: docSnap.id,
      } as UserProfile);
    });
    usersCache = users;
    usersCacheTimestamp = now;
    return users;
  } catch (error) {
    console.error("Error getting users: ", error);
    return usersCache || [];
  }
};

export const updateUserStatusInDb = async (uid: string, status: 'active' | 'blocked') => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, { status }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user status: ", error);
    throw error;
  }
};

export const updateUserRoleInDb = async (uid: string, role: 'admin' | 'user') => {
  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await setDoc(docRef, { role }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating user role: ", error);
    throw error;
  }
};

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  userEmail: string;
  userName: string;
  listingTitle?: string;
  amount: number;
  currency: 'EUR' | 'RON';
  serviceType: 'Promovare VIP 7 zile' | 'Promovare Standard' | 'Pachet Anunțuri Business';
  status: 'Plătit' | 'În așteptare' | 'Anulat';
  date: string;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  robotsTxt: string;
  enableSitemap: boolean;
  googleAnalyticsId: string;
}

export const toggleListingPromotedInDb = async (id: string, isPromoted: boolean) => {
  try {
    const docRef = doc(db, LISTINGS_COLLECTION, id);
    await setDoc(docRef, { isPromoted }, { merge: true });
    listingsCache = null;
    return true;
  } catch (error) {
    console.error("Error updating listing promotion: ", error);
    throw error;
  }
};
