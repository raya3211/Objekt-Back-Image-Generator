import { toSlug, detectGroup, type CardColors } from './theme';

export interface CollectionItem {
  id: string;
  slug: string;
  season: string;
  member: string;
  artist: string;
  collectionNo: string;
  className: string;
  hasBackImage: boolean;
  backImageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  createdAt?: number;
}

export interface CollectionSeries {
  group: string;
  season: string;
  collectionNo: string;
  className: string;
  latestTimestamp: number;
  members: Array<{
    member: string;
    slug: string;
    hasBackImage: boolean;
    backgroundColor?: string;
    textColor?: string;
  }>;
  totalMembers: number;
  missingCount: number;
}

interface CacheEntry {
  items: CollectionItem[];
  cachedAt: number;
}

const collectionsCache = new Map<string, CacheEntry>();
const seriesCache = new Map<string, Map<string, CollectionSeries>>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes auto-refresh TTL

/**
 * Fetches and caches full collection catalog from objekt.top for an artist.
 * Automatically refreshes every 5 minutes so new seasons/collections are picked up dynamically.
 */
export async function fetchArtistCollections(group = 'tripleS', forceRefresh = false): Promise<CollectionItem[]> {
  const artist = group.toLowerCase() === 'artms' ? 'artms' : group.toLowerCase() === 'idntt' ? 'idntt' : 'triples';
  const cached = collectionsCache.get(artist);
  const isFresh = cached && (Date.now() - cached.cachedAt < CACHE_TTL_MS);

  if (!forceRefresh && isFresh) {
    return cached.items;
  }

  try {
    const res = await fetch(`https://objekt.top/api/v1/collections?artist=${encodeURIComponent(artist)}`, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const data = (await res.json()) as any;
      const rawList = Array.isArray(data?.collections) ? data.collections : [];
      const items: CollectionItem[] = [];

      for (const item of rawList) {
        if (!item || !item.slug) continue;
        const hasBackImage = Boolean(item.backImage && String(item.backImage).trim() !== '');
        const createdAt = item.createdAt ? new Date(item.createdAt).getTime() : 0;
        items.push({
          id: String(item.id || ''),
          slug: String(item.slug),
          season: String(item.season || ''),
          member: String(item.member || ''),
          artist: String(item.artist || artist),
          collectionNo: String(item.collectionNo || ''),
          className: String(item.class || 'Double'),
          hasBackImage,
          backImageUrl: item.backImage ? String(item.backImage).trim() : undefined,
          backgroundColor: item.backgroundColor ? String(item.backgroundColor).trim() : undefined,
          textColor: item.textColor ? String(item.textColor).trim() : undefined,
          createdAt,
        });
      }

      collectionsCache.set(artist, { items, cachedAt: Date.now() });
      indexSeries(artist, items);
      return items;
    }
  } catch (err) {
    console.warn(`[Collections] Could not fetch objekt.top for ${artist}:`, (err as any)?.message || err);
  }

  return cached?.items || [];
}

function indexSeries(artist: string, items: CollectionItem[]) {
  const seriesMap = new Map<string, CollectionSeries>();

  for (const item of items) {
    const key = `${item.season}-${item.collectionNo}`.toLowerCase();
    const itemTime = item.createdAt || 0;

    if (!seriesMap.has(key)) {
      seriesMap.set(key, {
        group: artist === 'artms' ? 'ARTMS' : artist === 'idntt' ? 'idntt' : 'tripleS',
        season: item.season,
        collectionNo: item.collectionNo,
        className: item.className,
        latestTimestamp: itemTime,
        members: [],
        totalMembers: 0,
        missingCount: 0,
      });
    }

    const s = seriesMap.get(key)!;
    if (itemTime > s.latestTimestamp) {
      s.latestTimestamp = itemTime;
    }

    s.members.push({
      member: item.member,
      slug: item.slug,
      hasBackImage: item.hasBackImage,
      backgroundColor: item.backgroundColor,
      textColor: item.textColor,
    });
    s.totalMembers++;
    if (!item.hasBackImage) {
      s.missingCount++;
    }
  }

  seriesCache.set(artist, seriesMap);
}

/**
 * Returns series info (including all members) for a specific season and collection number.
 */
export async function getCollectionSeries(
  group: string,
  season: string,
  collectionNo: string
): Promise<CollectionSeries | null> {
  const artist = group.toLowerCase() === 'artms' ? 'artms' : group.toLowerCase() === 'idntt' ? 'idntt' : 'triples';
  if (!seriesCache.has(artist)) {
    await fetchArtistCollections(group);
  }

  const seriesMap = seriesCache.get(artist);
  if (!seriesMap) return null;

  const key = `${season}-${collectionNo}`.toLowerCase();
  return seriesMap.get(key) || null;
}

/**
 * Returns all collection series for a group, sorted by latest release date descending.
 */
export async function getSeriesList(options: {
  group: string;
  season?: string;
  onlyMissing?: boolean;
}): Promise<CollectionSeries[]> {
  const artist = options.group.toLowerCase() === 'artms' ? 'artms' : options.group.toLowerCase() === 'idntt' ? 'idntt' : 'triples';
  if (!seriesCache.has(artist)) {
    await fetchArtistCollections(options.group);
  }

  const seriesMap = seriesCache.get(artist);
  if (!seriesMap) return [];

  let list = Array.from(seriesMap.values());

  if (options.season && options.season.toLowerCase() !== 'all') {
    const sLow = options.season.toLowerCase();
    list = list.filter((s) => s.season.toLowerCase() === sLow);
  }

  if (options.onlyMissing) {
    list = list.filter((s) => s.missingCount > 0);
  }

  // Sort by latest release date descending (newest release first)
  list.sort((a, b) => b.latestTimestamp - a.latestTimestamp);

  return list;
}

/**
 * Returns distinct seasons for a group, dynamically extracted from collections
 * and sorted from newest release date to oldest release date.
 */
export async function getSeasonsList(group = 'tripleS'): Promise<string[]> {
  const items = await fetchArtistCollections(group);
  const seasonMap = new Map<string, number>();

  for (const item of items) {
    if (!item.season) continue;
    const time = item.createdAt || 0;
    const prev = seasonMap.get(item.season) || 0;
    if (time > prev) {
      seasonMap.set(item.season, time);
    }
  }

  const sorted = Array.from(seasonMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([season]) => season);

  return sorted.length > 0 ? sorted : ['Cream02'];
}

/**
 * Returns a summary of collection stats for a group.
 */
export async function getCollectionStats(group: string): Promise<{ totalCards: number; totalSeries: number }> {
  const items = await fetchArtistCollections(group);
  const artist = group.toLowerCase() === 'artms' ? 'artms' : group.toLowerCase() === 'idntt' ? 'idntt' : 'triples';
  const seriesMap = seriesCache.get(artist);

  return {
    totalCards: items.length,
    totalSeries: seriesMap ? seriesMap.size : 0,
  };
}
