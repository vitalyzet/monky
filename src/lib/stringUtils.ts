/**
 * Normalizes a string by stripping Romanian diacritics and accents (ă, â, î, ș, ț, Ş, Ţ)
 * and converting to lowercase for seamless diacritic-insensitive searching.
 */
export const normalizeText = (str: string = ''): string => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/ș/g, 's')
    .replace(/ț/g, 't')
    .replace(/ş/g, 's')
    .replace(/ţ/g, 't')
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .trim();
};

const COMMON_FIRST_NAMES = [
  'cristina', 'alexandru', 'alexandra', 'andrei', 'andreea',
  'maria', 'elena', 'ioana', 'ionut', 'ion', 'mihaela', 'mihai',
  'gabriel', 'gabriela', 'radu', 'stefan', 'stefania', 'ana',
  'bogdan', 'daniel', 'daniela', 'dan', 'george', 'georgiana',
  'florin', 'florentina', 'cristian', 'catalin', 'catalina',
  'adrian', 'adriana', 'vlad', 'victor', 'victoria', 'paul',
  'paula', 'cosmin', 'cosmina', 'laura', 'diana', 'alina',
  'roxana', 'simona', 'monica', 'carmen', 'bianca', 'claudiu',
  'claudia', 'razvan', 'marius', 'sorin', 'sorina', 'liviu',
  'silviu', 'dragos', 'lucian', 'luciana', 'valentin', 'valentina'
];

/**
 * Formats any username, email prefix, or full name into a professional public display name,
 * e.g., "cristinatanase" -> "Cristina.T", "Cristina Tanase" -> "Cristina.T".
 */
export const formatPublicName = (rawName?: string): string => {
  if (!rawName || typeof rawName !== 'string') return 'Vânzător';

  let clean = rawName.trim();
  if (clean.includes('@')) {
    clean = clean.split('@')[0].trim();
  }

  // If already formatted like "Name.I" or "Name. I." or "Name I."
  const dotPattern = /^([A-Za-zĂÂÎȘȚăâîșț]+)\s*[\.\s]\s*([A-Za-zĂÂÎȘȚăâîșț])\.?$/;
  const dotMatch = clean.match(dotPattern);
  if (dotMatch) {
    const first = dotMatch[1].charAt(0).toUpperCase() + dotMatch[1].slice(1).toLowerCase();
    const initial = dotMatch[2].toUpperCase();
    return `${first}.${initial}`;
  }

  // Check separators: space, dot, underscore, dash
  const parts = clean.split(/[\s\.\-_]+/).filter(Boolean);
  if (parts.length >= 2) {
    const first = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const initial = parts[1].charAt(0).toUpperCase();
    return `${first}.${initial}`;
  }

  // Check PascalCase / camelCase e.g. "CristinaTanase"
  const camelMatch = clean.match(/^([A-Z][a-z]+)([A-Z].*)$/);
  if (camelMatch) {
    const first = camelMatch[1];
    const initial = camelMatch[2].charAt(0).toUpperCase();
    return `${first}.${initial}`;
  }

  // Single word lowercase like "cristinatanase"
  const lower = clean.toLowerCase();
  for (const firstName of COMMON_FIRST_NAMES) {
    if (lower.startsWith(firstName) && lower.length > firstName.length) {
      const first = firstName.charAt(0).toUpperCase() + firstName.slice(1);
      const remainder = lower.slice(firstName.length);
      const initial = remainder.charAt(0).toUpperCase();
      return `${first}.${initial}`;
    }
  }

  // Fallback: capitalize single word
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};
