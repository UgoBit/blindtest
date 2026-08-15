import type { Difficulty } from '../../shared/types.js';
import { THEME_BY_ID, type ThemeDefinition } from './themes.js';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  previewUrl: string;
  /** Deezer popularity score (0-1 000 000), used to grade difficulty. */
  rank: number;
}

interface DeezerTrack {
  id: number;
  title: string;
  title_short?: string;
  preview?: string;
  rank?: number;
  artist?: { name?: string };
  album?: { cover_medium?: string; cover_big?: string };
}

interface DeezerPlaylist {
  id: number;
  nb_tracks?: number;
}

const DEEZER = 'https://api.deezer.com';
const POOL_TTL_MS = 30 * 60 * 1000;

const poolCache = new Map<string, { at: number; tracks: Track[] }>();

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function toTrack(t: DeezerTrack): Track | null {
  if (!t.preview || !t.artist?.name) return null;
  return {
    id: String(t.id),
    title: t.title_short ?? t.title,
    artist: t.artist.name,
    cover: t.album?.cover_big ?? t.album?.cover_medium ?? null,
    previewUrl: t.preview,
    rank: t.rank ?? 0,
  };
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

async function loadPool(theme: ThemeDefinition): Promise<Track[]> {
  const cached = poolCache.get(theme.id);
  if (cached && Date.now() - cached.at < POOL_TTL_MS) return cached.tracks;

  const tracks: Track[] = [];
  if (theme.source.kind === 'chart') {
    const genreId = theme.source.genreId;
    const data = await fetchJson<{ data?: DeezerTrack[] }>(`${DEEZER}/chart/${genreId}/tracks?limit=100`);
    for (const t of data?.data ?? []) {
      const track = toTrack(t);
      if (track) tracks.push(track);
    }
    // Genre radios widen the popularity spread so the hard tier is not just chart hits.
    const radios = await fetchJson<{ data?: { id: number }[] }>(`${DEEZER}/genre/${genreId}/radios`);
    for (const radio of (radios?.data ?? []).slice(0, 3)) {
      const radioTracks = await fetchJson<{ data?: DeezerTrack[] }>(
        `${DEEZER}/radio/${radio.id}/tracks?limit=50`,
      );
      for (const t of radioTracks?.data ?? []) {
        const track = toTrack(t);
        if (track) tracks.push(track);
      }
    }
  } else {
    for (const query of theme.source.queries) {
      const found = await fetchJson<{ data?: DeezerPlaylist[] }>(
        `${DEEZER}/search/playlist?q=${encodeURIComponent(query)}&limit=5`,
      );
      const playlists = (found?.data ?? []).filter((p) => (p.nb_tracks ?? 0) >= 25).slice(0, 2);
      for (const playlist of playlists) {
        const data = await fetchJson<{ data?: DeezerTrack[] }>(
          `${DEEZER}/playlist/${playlist.id}/tracks?limit=100`,
        );
        for (const t of data?.data ?? []) {
          const track = toTrack(t);
          if (track) tracks.push(track);
        }
      }
    }
  }

  const unique = new Map(tracks.map((track) => [`${normalize(track.title)}|${normalize(track.artist)}`, track]));
  const pool = [...unique.values()];
  poolCache.set(theme.id, { at: Date.now(), tracks: pool });
  return pool;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Keeps the slice of a theme's pool matching the requested difficulty: tracks are
 * ranked by popularity, then split into three bands (easiest = most popular).
 */
function gradeByDifficulty(pool: Track[], difficulty: Difficulty): Track[] {
  if (difficulty === 'mixte' || pool.length < 12) return pool;
  const ranked = [...pool].sort((a, b) => b.rank - a.rank);
  const band = Math.ceil(ranked.length / 3);
  if (difficulty === 'facile') return ranked.slice(0, band);
  if (difficulty === 'moyen') return ranked.slice(band, band * 2);
  return ranked.slice(band * 2);
}

/** Builds a playlist of unique tracks drawn evenly from every selected theme. */
export async function buildPlaylist(
  themeIds: string[],
  count: number,
  difficulty: Difficulty = 'mixte',
): Promise<Track[]> {
  const themes = themeIds.map((id) => THEME_BY_ID.get(id)).filter((t): t is ThemeDefinition => !!t);
  if (themes.length === 0) return [];

  const pools = await Promise.all(
    themes.map((theme) => loadPool(theme).then((pool) => shuffle(gradeByDifficulty(pool, difficulty)))),
  );
  const seen = new Set<string>();
  const picked: Track[] = [];

  let exhausted = false;
  while (picked.length < count && !exhausted) {
    exhausted = true;
    for (const pool of pools) {
      const next = pool.pop();
      if (!next) continue;
      exhausted = false;
      const key = `${normalize(next.title)}|${normalize(next.artist)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      picked.push(next);
      if (picked.length >= count) break;
    }
  }
  return picked;
}

/** Apple's preview catalogue, used when a Deezer preview URL cannot be played. */
export async function itunesPreview(title: string, artist: string): Promise<string | null> {
  const term = encodeURIComponent(`${artist} ${title}`);
  const data = await fetchJson<{ results?: { previewUrl?: string; trackName?: string }[] }>(
    `https://itunes.apple.com/search?term=${term}&entity=song&limit=5`,
  );
  const match = (data?.results ?? []).find(
    (r) => r.previewUrl && normalize(r.trackName ?? '').includes(normalize(title).slice(0, 12)),
  );
  return match?.previewUrl ?? data?.results?.find((r) => r.previewUrl)?.previewUrl ?? null;
}
