/**
 * Geographic utilities for calculating real distances in kilometers (km)
 * across Romanian cities, counties, and geolocation coordinates.
 */

export interface Coordinates {
  lat: number;
  lon: number;
}

// Major Romanian cities and county seats coordinates
export const ROMANIAN_LOCATIONS: Record<string, Coordinates> = {
  'bucuresti': { lat: 44.4323, lon: 26.1063 },
  'bucurești': { lat: 44.4323, lon: 26.1063 },
  'sector 1': { lat: 44.4698, lon: 26.0745 },
  'sector 2': { lat: 44.4475, lon: 26.1366 },
  'sector 3': { lat: 44.4215, lon: 26.1685 },
  'sector 4': { lat: 44.3850, lon: 26.1130 },
  'sector 5': { lat: 44.4065, lon: 26.0645 },
  'sector 6': { lat: 44.4345, lon: 26.0230 },
  'ilfov': { lat: 44.5320, lon: 26.1010 },
  'otopeni': { lat: 44.5510, lon: 26.0790 },
  'voluntari': { lat: 44.4920, lon: 26.1890 },
  'sinaia': { lat: 45.3525, lon: 25.5510 },
  'prahova': { lat: 44.9400, lon: 26.0200 },
  'ploiesti': { lat: 44.9400, lon: 26.0200 },
  'ploiești': { lat: 44.9400, lon: 26.0200 },
  'campina': { lat: 45.1270, lon: 25.7340 },
  'câmpina': { lat: 45.1270, lon: 25.7340 },
  'pitesti': { lat: 44.8565, lon: 24.8692 },
  'pitești': { lat: 44.8565, lon: 24.8692 },
  'arges': { lat: 44.8565, lon: 24.8692 },
  'argeș': { lat: 44.8565, lon: 24.8692 },
  'brasov': { lat: 45.6579, lon: 25.6012 },
  'brașov': { lat: 45.6579, lon: 25.6012 },
  'cluj': { lat: 46.7712, lon: 23.6236 },
  'cluj-napoca': { lat: 46.7712, lon: 23.6236 },
  'timisoara': { lat: 45.7537, lon: 21.2257 },
  'timișoara': { lat: 45.7537, lon: 21.2257 },
  'timis': { lat: 45.7537, lon: 21.2257 },
  'timiș': { lat: 45.7537, lon: 21.2257 },
  'iasi': { lat: 47.1585, lon: 27.6014 },
  'iași': { lat: 47.1585, lon: 27.6014 },
  'constanta': { lat: 44.1807, lon: 28.6343 },
  'constanța': { lat: 44.1807, lon: 28.6343 },
  'craiova': { lat: 44.3302, lon: 23.7949 },
  'dolj': { lat: 44.3302, lon: 23.7949 },
  'galati': { lat: 45.4353, lon: 28.0079 },
  'galați': { lat: 45.4353, lon: 28.0079 },
  'oradea': { lat: 47.0465, lon: 21.9189 },
  'bihor': { lat: 47.0465, lon: 21.9189 },
  'braila': { lat: 45.2692, lon: 27.9575 },
  'brăila': { lat: 45.2692, lon: 27.9575 },
  'arad': { lat: 46.1866, lon: 21.3123 },
  'sibiu': { lat: 45.7983, lon: 24.1256 },
  'bacau': { lat: 46.5670, lon: 26.9146 },
  'bacău': { lat: 46.5670, lon: 26.9146 },
  'targu mures': { lat: 46.5425, lon: 24.5575 },
  'târgu mureș': { lat: 46.5425, lon: 24.5575 },
  'mures': { lat: 46.5425, lon: 24.5575 },
  'mureș': { lat: 46.5425, lon: 24.5575 },
  'baia mare': { lat: 47.6592, lon: 23.5795 },
  'maramures': { lat: 47.6592, lon: 23.5795 },
  'maramureș': { lat: 47.6592, lon: 23.5795 },
  'buzau': { lat: 45.1517, lon: 26.8166 },
  'buzău': { lat: 45.1517, lon: 26.8166 },
  'botosani': { lat: 47.7407, lon: 26.6660 },
  'botoșani': { lat: 47.7407, lon: 26.6660 },
  'satu mare': { lat: 47.7900, lon: 22.8900 },
  'suceava': { lat: 47.6514, lon: 26.2556 },
  'valcea': { lat: 45.0997, lon: 24.3693 },
  'vâlcea': { lat: 45.0997, lon: 24.3693 },
  'ramnicu valcea': { lat: 45.0997, lon: 24.3693 },
  'râmnicu vâlcea': { lat: 45.0997, lon: 24.3693 },
  'mehedinti': { lat: 44.6319, lon: 22.6561 },
  'mehedinți': { lat: 44.6319, lon: 22.6561 },
  'drobeta-turnu severin': { lat: 44.6319, lon: 22.6561 },
  'piatra neamt': { lat: 46.9383, lon: 26.3686 },
  'piatra neamț': { lat: 46.9383, lon: 26.3686 },
  'neamt': { lat: 46.9383, lon: 26.3686 },
  'neamț': { lat: 46.9383, lon: 26.3686 },
  'focsani': { lat: 45.6960, lon: 27.1839 },
  'focșani': { lat: 45.6960, lon: 27.1839 },
  'vrancea': { lat: 45.6960, lon: 27.1839 },
  'targu jiu': { lat: 45.0396, lon: 23.2748 },
  'târgu jiu': { lat: 45.0396, lon: 23.2748 },
  'gorj': { lat: 45.0396, lon: 23.2748 },
  'tulcea': { lat: 45.1797, lon: 28.8045 },
  'targoviste': { lat: 44.9254, lon: 25.4568 },
  'târgoviște': { lat: 44.9254, lon: 25.4568 },
  'dambovita': { lat: 44.9254, lon: 25.4568 },
  'dâmbovița': { lat: 44.9254, lon: 25.4568 },
  'bistrita': { lat: 47.1332, lon: 24.5001 },
  'bistrița': { lat: 47.1332, lon: 24.5001 },
  'resita': { lat: 45.3008, lon: 21.8892 },
  'reșița': { lat: 45.3008, lon: 21.8892 },
  'slatina': { lat: 44.4300, lon: 24.3644 },
  'olt': { lat: 44.4300, lon: 24.3644 },
  'calarasi': { lat: 44.2000, lon: 27.3333 },
  'călărași': { lat: 44.2000, lon: 27.3333 },
  'alba iulia': { lat: 46.0667, lon: 23.5833 },
  'alba': { lat: 46.0667, lon: 23.5833 },
  'giurgiu': { lat: 43.9037, lon: 25.9699 },
  'deva': { lat: 45.8833, lon: 22.9000 },
  'hunedoara': { lat: 45.7667, lon: 22.9000 },
  'zalau': { lat: 47.1833, lon: 23.0500 },
  'zalău': { lat: 47.1833, lon: 23.0500 },
  'salaj': { lat: 47.1833, lon: 23.0500 },
  'sălaj': { lat: 47.1833, lon: 23.0500 },
  'sfantu gheorghe': { lat: 45.8667, lon: 25.7833 },
  'sfântu gheorghe': { lat: 45.8667, lon: 25.7833 },
  'covasna': { lat: 45.8667, lon: 25.7833 },
  'vaslui': { lat: 46.6383, lon: 27.7292 },
  'slobozia': { lat: 44.5639, lon: 27.3592 },
  'ialomita': { lat: 44.5639, lon: 27.3592 },
  'ialomița': { lat: 44.5639, lon: 27.3592 },
  'alexandria': { lat: 43.9686, lon: 25.3328 },
  'teleorman': { lat: 43.9686, lon: 25.3328 },
  'miercurea ciuc': { lat: 46.3600, lon: 25.8000 },
  'harghita': { lat: 46.3600, lon: 25.8000 },
};

// Default fallback coordinates (Bucharest centre)
export const DEFAULT_ROMANIA_COORDS: Coordinates = {
  lat: 44.4323,
  lon: 26.1063,
};

/**
 * Haversine formula to compute great-circle distance between two points in km
 */
export function calculateHaversineDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const dLon = ((coord2.lon - coord1.lon) * Math.PI) / 180;
  const lat1Rad = (coord1.lat * Math.PI) / 180;
  const lat2Rad = (coord2.lat * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Find coordinates for any Romanian city/county string
 * e.g. "Sinaia ( Prahova )" -> coordinates of Sinaia
 * e.g. "Sector 1 ( București )" -> coordinates of Sector 1
 */
export function findLocationCoords(locationStr?: string): Coordinates | null {
  if (!locationStr) return null;
  const clean = locationStr
    .toLowerCase()
    .replace(/[(),]/g, ' ')
    .trim();

  // 1. Direct dictionary match
  if (ROMANIAN_LOCATIONS[clean]) {
    return ROMANIAN_LOCATIONS[clean];
  }

  // 2. Multi-word search (e.g. "Sinaia ( Prahova )" -> check "sinaia", check "prahova")
  const words = clean.split(/\s+/).filter(Boolean);
  for (const w of words) {
    if (ROMANIAN_LOCATIONS[w]) {
      return ROMANIAN_LOCATIONS[w];
    }
  }

  // 3. Substring check
  for (const [key, coords] of Object.entries(ROMANIAN_LOCATIONS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coords;
    }
  }

  return null;
}

/**
 * Get listing distance in km from user's coordinates or user's city
 */
export function getListingDistanceKm(
  listingLocation?: string,
  userCoords?: Coordinates | null,
  userLocationInput?: string
): number | null {
  const itemCoords = findLocationCoords(listingLocation);
  if (!itemCoords) return null;

  // If user has GPS coordinates
  if (userCoords && typeof userCoords.lat === 'number' && typeof userCoords.lon === 'number') {
    return calculateHaversineDistance(userCoords, itemCoords);
  }

  // If user entered a city in the search bar (e.g. "Brașov")
  if (userLocationInput && userLocationInput !== 'Toată România' && userLocationInput !== 'Toată țara') {
    const userCityCoords = findLocationCoords(userLocationInput);
    if (userCityCoords) {
      return calculateHaversineDistance(userCityCoords, itemCoords);
    }
  }

  // Default reference point: Bucharest
  return calculateHaversineDistance(DEFAULT_ROMANIA_COORDS, itemCoords);
}

/**
 * Pretty format distance in kilometers
 */
export function formatDistanceKm(km: number | null): string | null {
  if (km === null || isNaN(km)) return null;
  if (km <= 1) return '< 1 km';
  return `${km} km`;
}
