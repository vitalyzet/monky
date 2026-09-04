export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function getShortId(id?: string): string {
  if (!id) return '';
  if (id.length <= 8) return id;
  if (id.startsWith('user-ad-')) {
    const num = id.replace('user-ad-', '');
    return num.substring(num.length - 6);
  }
  if (id.includes('-')) {
    const parts = id.split('-');
    const last = parts[parts.length - 1];
    return last.length > 6 ? last.substring(0, 6) : last;
  }
  return id.substring(id.length - 6);
}

export function getListingUrl(item: { id?: string; title?: string }): string {
  if (!item || !item.id) return '/';
  if (!item.title) return `/anunt/${item.id}`;
  const slug = slugify(item.title);
  return `/anunt/${slug}-${item.id}`;
}

export function extractListingId(slugOrId: string): string {
  if (!slugOrId) return '';
  
  if (slugOrId.includes('imoob-car-')) {
    return `imoob-car-${slugOrId.split('imoob-car-')[1]}`;
  }
  
  if (slugOrId.includes('user-ad-')) {
    return `user-ad-${slugOrId.split('user-ad-')[1]}`;
  }

  const lastHyphenIdx = slugOrId.lastIndexOf('-');
  if (lastHyphenIdx !== -1 && lastHyphenIdx < slugOrId.length - 1) {
    return slugOrId.substring(lastHyphenIdx + 1);
  }

  return slugOrId;
}
