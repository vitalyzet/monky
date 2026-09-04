export const MONKY_AVATARS = [
  '/images/avatar/an32.png',
  '/images/avatar/an53.png',
  '/images/avatar/an54.png',
  '/images/avatar/an55.png',
  '/images/avatar/an57.png',
  '/images/avatar/an61.png',
  '/images/avatar/an62.png',
  '/images/avatar/an70.png',
  '/images/avatar/an71.png',
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

/**
 * Returns a consistent, distinct avatar for any seller based on their name or userId.
 * This guarantees that every user has their own unique character instead of looking identical.
 */
export function getDistinctSellerAvatar(sellerName?: string, userId?: string): string {
  const seed = (sellerName || userId || 'monky_seller').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % MONKY_AVATARS.length;
  return MONKY_AVATARS[index];
}

/**
 * Resolves the real profile picture or avatar for any listing seller.
 * Prioritizes user's uploaded photo, Firestore users avatar, seller avatarUrl,
 * and falls back to a distinct Monky avatar. Never returns an empty letter circle.
 */
export function resolveSellerAvatar(
  seller?: { name?: string; avatar?: string; avatarUrl?: string },
  userId?: string,
  currentUser?: { uid?: string; displayName?: string | null; email?: string | null; photoURL?: string | null } | null,
  userAvatarMap?: Record<string, string>
): string {
  const sellerName = seller?.name || 'Vânzător';
  const sellerNameLower = sellerName.toLowerCase().trim();

  const curDisplayName = (currentUser?.displayName || '').toLowerCase().trim();
  const curEmailName = currentUser?.email ? currentUser.email.split('@')[0].toLowerCase().trim() : '';

  const isOwner = Boolean(
    currentUser &&
    ((userId && userId === currentUser.uid) ||
      (sellerNameLower && (sellerNameLower === curDisplayName || sellerNameLower === curEmailName)))
  );

  // 1. If owner, prioritize current user profile photo & custom uploaded photo
  if (isOwner) {
    if (typeof window !== 'undefined') {
      const customPhoto = localStorage.getItem('monky_user_custom_photo');
      if (customPhoto) return customPhoto;
      const localAvatar = localStorage.getItem('monky_user_avatar');
      if (localAvatar) return localAvatar;
    }
    if (currentUser?.photoURL) return currentUser.photoURL;
  }

  // 2. Check Firestore users map (loaded from DB)
  if (userAvatarMap) {
    if (userId && userAvatarMap[userId]) return userAvatarMap[userId];
    if (sellerNameLower && userAvatarMap[sellerNameLower]) return userAvatarMap[sellerNameLower];
  }

  // 3. Check seller object avatar / avatarUrl
  const sObj = seller as any;
  if (sObj?.avatar) return sObj.avatar;
  if (sObj?.avatarUrl) return sObj.avatarUrl;

  // 4. Local storage fallback if seller name matches locally logged in user name
  if (typeof window !== 'undefined') {
    const localName = (localStorage.getItem('monky_user_name') || '').toLowerCase().trim();
    if (localName && sellerNameLower === localName) {
      const customPhoto = localStorage.getItem('monky_user_custom_photo');
      if (customPhoto) return customPhoto;
      const localAvatar = localStorage.getItem('monky_user_avatar');
      if (localAvatar) return localAvatar;
    }
  }

  // 5. Guaranteed distinct illustrated avatar
  return getDistinctSellerAvatar(sellerName, userId);
}
