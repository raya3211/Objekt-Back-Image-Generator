import { DEFAULT_SEASON_COLORS, MEMBER_SIGNS } from './constants';

export interface CardColors {
  background: string;
  textColor: string;
}

export function toSlug(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Automatically detects the group given a member name or canonical string */
export function detectGroup(member?: string, explicitGroup?: string): string {
  if (explicitGroup) {
    const clean = explicitGroup.toLowerCase().trim();
    if (clean === 'artms') return 'ARTMS';
    if (clean === 'idntt') return 'idntt';
    return 'tripleS';
  }
  if (member && MEMBER_SIGNS[member]) {
    return MEMBER_SIGNS[member].group;
  }
  return 'tripleS';
}

/** Compute relative luminance for an sRGB hex color string. */
export function getLuminance(hexColor: string): number {
  const clean = hexColor.replace(/^#/, '').trim();
  let r = 0, g = 0, b = 0;
  if (clean.length === 3) {
    r = parseInt(clean[0] + clean[0], 16) / 255;
    g = parseInt(clean[1] + clean[1], 16) / 255;
    b = parseInt(clean[2] + clean[2], 16) / 255;
  } else if (clean.length === 6) {
    r = parseInt(clean.slice(0, 2), 16) / 255;
    g = parseInt(clean.slice(2, 4), 16) / 255;
    b = parseInt(clean.slice(4, 6), 16) / 255;
  }
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Compute high-contrast text color (black or white) given a hex background color. */
export function getContrastTextColor(hexColor: string): string {
  const lum = getLuminance(hexColor);
  return lum > 0.45 ? '#000000' : '#FFFFFF';
}

/** Ensures text color is authentic and legible against background color. */
export function resolveAuthenticTextColor(
  backgroundColor?: string | null,
  textColor?: string | null
): string {
  if (!backgroundColor) return textColor?.trim() || '#000000';
  const cleanBg = backgroundColor.trim();
  const cleanText = textColor?.trim();

  if (!cleanText) {
    return getContrastTextColor(cleanBg);
  }

  const lumBg = getLuminance(cleanBg);
  const lumText = getLuminance(cleanText);

  // If background is dark (<= 0.48) and text color is also dark (< 0.35)
  if (lumBg <= 0.48 && lumText < 0.35) {
    return '#FFFFFF';
  }

  // If background is light (> 0.48) and text color is also light (> 0.70)
  if (lumBg > 0.48 && lumText > 0.70) {
    return '#000000';
  }

  return cleanText;
}

interface OnlineColorCacheEntry {
  colors: Map<string, CardColors>;
  cachedAt: number;
}

const onlineColorsCache = new Map<string, OnlineColorCacheEntry>();
const COLOR_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes auto-refresh TTL

/**
 * Fetches authentic collection colors from objekt.top if online.
 * Automatically refreshes every 5 minutes so new collection colors are picked up dynamically.
 */
export async function fetchObjektTopColors(group = 'tripleS', forceRefresh = false): Promise<Map<string, CardColors>> {
  const artist = group.toLowerCase() === 'artms' ? 'artms' : group.toLowerCase() === 'idntt' ? 'idntt' : 'triples';
  const cached = onlineColorsCache.get(artist);
  const isFresh = cached && (Date.now() - cached.cachedAt < COLOR_CACHE_TTL_MS);

  if (!forceRefresh && isFresh) {
    return cached.colors;
  }

  const map = new Map<string, CardColors>();
  try {
    const res = await fetch(`https://objekt.top/api/v1/collections?artist=${encodeURIComponent(artist)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) {
      const data = await res.json() as any;
      const list = Array.isArray(data?.collections) ? data.collections : [];
      for (const item of list) {
        if (!item || !item.slug) continue;
        const slug = toSlug(String(item.slug));
        if (item.backgroundColor) {
          map.set(slug, {
            background: String(item.backgroundColor).trim(),
            textColor: item.textColor ? String(item.textColor).trim() : '#000000',
          });
        }
      }
      onlineColorsCache.set(artist, { colors: map, cachedAt: Date.now() });
      return map;
    }
  } catch {
    // Offline or unreachable — fallback to presets
  }
  return cached?.colors || map;
}

/**
 * Resolves the authentic background and foreground color for an Objekt card.
 */
export async function resolveColors(options: {
  group?: string;
  season?: string;
  member?: string;
  className?: string;
  collectionNo?: string;
  backgroundColor?: string;
  textColor?: string;
  fetchOnline?: boolean;
}): Promise<CardColors> {
  let bg = options.backgroundColor?.trim();
  let text = options.textColor?.trim();

  const group = detectGroup(options.member, options.group);
  const season = (options.season || (group === 'idntt' ? 'Summer25' : 'Cream02')).toLowerCase();
  const className = (options.className || (group === 'idntt' ? 'Basic' : 'Double')).toLowerCase();
  const member = options.member || '';
  const collectionNo = options.collectionNo || '';

  if (!bg && options.fetchOnline !== false) {
    const onlineMap = await fetchObjektTopColors(group);
    const candidateSlugs = [
      toSlug(`${season}-${member}-${collectionNo}`),
      toSlug(`${season} ${member} ${collectionNo}`),
      toSlug(`${member}-${collectionNo}`),
    ];
    for (const slug of candidateSlugs) {
      if (onlineMap.has(slug)) {
        const hit = onlineMap.get(slug)!;
        bg = hit.background;
        if (!text) text = hit.textColor;
        break;
      }
    }
  }

  if (!bg) {
    const key = `${season}-${className}`;
    const preset = DEFAULT_SEASON_COLORS[key] || DEFAULT_SEASON_COLORS[season] || {
      background: group === 'idntt' ? '#7698F7' : group === 'ARTMS' ? '#EBEBEB' : '#5055A5',
      textColor: '#000000',
    };
    bg = preset.background;
    if (!text) text = preset.textColor;
  }

  text = resolveAuthenticTextColor(bg, text);
  return { background: bg, textColor: text };
}
