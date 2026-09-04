/**
 * Formats dates into authentic Romanian marketplace dates (e.g., "Azi, 14:30", "Ieri, 18:20", "29 aug", "21 aug")
 * based on real Firestore timestamps and epoch milliseconds.
 */

const RO_MONTHS = [
  'ian', 'feb', 'mar', 'apr', 'mai', 'iun',
  'iul', 'aug', 'sept', 'oct', 'nov', 'dec'
];

/**
 * Extracts a real Date instance from any Firestore document or timestamp value,
 * strictly ignoring static dummy mock strings like "Acum câteva minute".
 */
export function extractRealDate(itemOrTime: any): Date | null {
  if (!itemOrTime) return null;

  // 1. If passed an object representing an ad item or Firestore doc
  if (typeof itemOrTime === 'object' && !(itemOrTime instanceof Date) && !('seconds' in itemOrTime)) {
    // Check createdAtTime (numeric milliseconds)
    if (typeof itemOrTime.createdAtTime === 'number' && !isNaN(itemOrTime.createdAtTime) && itemOrTime.createdAtTime > 1000000000000) {
      return new Date(itemOrTime.createdAtTime);
    }
    // Check timestamp ({ seconds: number } or toDate())
    if (itemOrTime.timestamp) {
      if (typeof itemOrTime.timestamp.toDate === 'function') {
        return itemOrTime.timestamp.toDate();
      }
      if (typeof itemOrTime.timestamp.seconds === 'number') {
        return new Date(itemOrTime.timestamp.seconds * 1000);
      }
    }
    // Check createdAt if it's a numeric timestamp or real ISO string
    if (typeof itemOrTime.createdAt === 'number' && itemOrTime.createdAt > 1000000000000) {
      return new Date(itemOrTime.createdAt);
    }
    if (typeof itemOrTime.createdAt === 'string' && itemOrTime.createdAt !== 'Acum câteva minute') {
      const parsed = Date.parse(itemOrTime.createdAt);
      if (!isNaN(parsed)) return new Date(parsed);
    }
    // Check date property
    if (itemOrTime.date && itemOrTime.date !== 'Acum câteva minute') {
      const parsed = Date.parse(itemOrTime.date);
      if (!isNaN(parsed)) return new Date(parsed);
    }
  }

  // 2. Direct numeric timestamp
  if (typeof itemOrTime === 'number' && !isNaN(itemOrTime) && itemOrTime > 1000000000000) {
    return new Date(itemOrTime);
  }

  // 3. Firestore Timestamp object or Date instance
  if (typeof itemOrTime === 'object' && itemOrTime !== null) {
    if (typeof itemOrTime.toDate === 'function') return itemOrTime.toDate();
    if (typeof itemOrTime.seconds === 'number') return new Date(itemOrTime.seconds * 1000);
    if (itemOrTime instanceof Date) return itemOrTime;
  }

  // 4. ISO Date string
  if (typeof itemOrTime === 'string' && itemOrTime !== 'Acum câteva minute') {
    const parsed = Date.parse(itemOrTime);
    if (!isNaN(parsed)) return new Date(parsed);
  }

  return null;
}

/**
 * Returns real, authentic publication date string:
 * - "Azi, 14:30"
 * - "Ieri, 18:20"
 * - "29 aug"
 * - "28 aug"
 * - "21 aug"
 */
export function formatRealListingDate(itemOrTime: any): string {
  const date = extractRealDate(itemOrTime);
  if (!date) return 'Azi';

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  if (isToday) {
    const diffMins = Math.floor((now.getTime() - date.getTime()) / (60 * 1000));
    if (diffMins < 2) return 'Acum câteva minute';
    if (diffMins < 60) return `Acum ${diffMins} min`;
    return `Azi, ${hours}:${minutes}`;
  }

  if (isYesterday) {
    return `Ieri, ${hours}:${minutes}`;
  }

  const day = date.getDate();
  const monthName = RO_MONTHS[date.getMonth()];

  if (date.getFullYear() === now.getFullYear()) {
    return `${day} ${monthName}`;
  }

  return `${day} ${monthName} ${date.getFullYear()}`;
}

/**
 * Formats a date or timestamp into a human-readable Romanian relative time string.
 * e.g., "Acum 2 ore", "Acum 3 zile", "29 aug"
 */
export function formatTimeAgo(rawTime?: any): string {
  const date = extractRealDate(rawTime);
  if (!date) {
    return typeof rawTime === 'string' && rawTime !== 'Acum câteva minute' ? rawTime : 'Azi';
  }

  const now = new Date();
  const diffInSeconds = Math.max(0, Math.floor((now.getTime() - date.getTime()) / 1000));

  if (diffInSeconds < 60) {
    return 'Acum câteva secunde';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    if (diffInMinutes === 1) return 'Acum 1 minut';
    return `Acum ${diffInMinutes} minute`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    if (diffInHours === 1) return 'Acum 1 oră';
    return `Acum ${diffInHours} ore`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return 'Ieri';
  }
  if (diffInDays < 7) {
    return `Acum ${diffInDays} zile`;
  }

  // For older than 7 days, show real date like "21 aug"
  const day = date.getDate();
  const monthName = RO_MONTHS[date.getMonth()];
  return `${day} ${monthName}`;
}

/**
 * Formats a date into exact "DD.MM.YYYY HH:MM" format
 */
export function formatExactDate(rawTime?: any): string {
  const date = extractRealDate(rawTime) || new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${day}.${month}.${year} ${hours}:${minutes}`;
}
