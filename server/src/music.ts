import type { Difficulty } from '../../shared/types.js';
import { DECADE_QUERIES, GENRE_SOURCES, THEME_BY_ID, type ThemeDefinition, type ThemeSource } from './themes.js';
import { lookupWork } from './cultWorks.js';

export interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string | null;
  previewUrl: string;
  /** Deezer popularity score (0-1 000 000), used to grade difficulty. */
  rank: number;
  work?: string | null;
  workCategory?: string | null;
  workAliases?: string[];
  isSingleField?: boolean;
  difficulty?: 'facile' | 'moyen' | 'difficile' | null;
}

interface DeezerTrack {
  id: number;
  title: string;
  title_short?: string;
  preview?: string;
  rank?: number;
  artist?: { name?: string };
  album?: { id?: number; title?: string; cover_medium?: string; cover_big?: string; release_date?: string };
}

interface DeezerPlaylist {
  id: number;
  title?: string;
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

function toTrack(t: DeezerTrack, themeCategory?: string): Track | null {
  if (!t.preview || !t.artist?.name) return null;
  const isCulture = ['films', 'series', 'dessins-animes', 'animes', 'disney', 'jeux-video', 'pub'].includes(themeCategory ?? '');
  const cult = isCulture ? lookupWork(t.title_short ?? t.title, t.artist.name, t.album?.title, themeCategory) : null;

  let rank = t.rank ?? 0;
  if (cult?.difficulty === 'facile') {
    rank = Math.max(rank, 850000);
  } else if (cult?.difficulty === 'moyen') {
    rank = rank ? Math.min(Math.max(rank, 450000), 750000) : 550000;
  } else if (cult?.difficulty === 'difficile') {
    rank = Math.min(rank, 250000);
  }

  return {
    id: String(t.id),
    title: t.title_short ?? t.title,
    artist: t.artist.name,
    cover: t.album?.cover_big ?? t.album?.cover_medium ?? null,
    previewUrl: t.preview,
    rank,
    work: cult?.work ?? null,
    workCategory: cult?.category ?? (isCulture ? themeCategory : null),
    workAliases: cult?.aliases ?? [],
    isSingleField: !!cult || isCulture,
    difficulty: cult?.difficulty ?? null,
  };
}

export function normalizeAnswer(value: string): string {
  if (!value) return '';
  const withoutDecorations = value
    .replace(/\(.*?\)|\[.*?\]/g, '')
    .replace(/\b(?:feat\.?|ft\.?|with|avec|featuring|pres\.?|presents|vs\.?|prod\.?\s*by)\b.*$/i, '')
    .replace(/\s[-–—]\s*(?:live|radio edit|remaster(?:ed)?|\d{4}|album version|single version|acoustic|edit|deluxe|version|clip).*$/i, '');
  return withoutDecorations
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(?:the|le|la|les|l|un|une|des|a|an|el|los|las)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(left: string, right: string): number {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0];
    previous[0] = row;
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column];
      previous[column] = left[row - 1] === right[column - 1]
        ? diagonal
        : Math.min(diagonal, previous[column - 1], above) + 1;
      diagonal = above;
    }
  }
  return previous[right.length];
}

const COMMON_ALIASES: Record<string, string[]> = {
  rhcp: ['red hot chili peppers', 'red hot'],
  soad: ['system of a down'],
  ratm: ['rage against the machine'],
  ccr: ['creedence clearwater revival', 'creedence'],
  bep: ['black eyed peas'],
  acdc: ['ac dc', 'ac/dc'],
  gnr: ['guns n roses', 'guns and roses'],
  gims: ['maitre gims'],
  chris: ['christine and the queens'],
  redcar: ['christine and the queens'],
  shm: ['swedish house mafia'],
  m: ['matthieu chedid', '-m-'],
};

const ARTIST_PREFIX_REGEX = /^(?:dj|mc|dr|doctor|lil|big|young|saint|st|sir|lord|maitre)\s+/i;

function phonetic(str: string): string {
  return str
    .replace(/ph/g, 'f')
    .replace(/ch(?=[aeiou])/g, 'sh')
    .replace(/qu|ck|k/g, 'c')
    .replace(/y/g, 'i')
    .replace(/w/g, 'v')
    .replace(/(.)\1+/g, '$1');
}

export function singleAnswerMatches(input: string, expected: string): boolean {
  const left = normalizeAnswer(input);
  const right = normalizeAnswer(expected);
  if (!left || !right) return false;

  // Exact normalized match
  if (left === right) return true;

  // Space-stripped match (e.g. "acdc" vs "ac dc", "u 2" vs "u2")
  if (left.replace(/\s+/g, '') === right.replace(/\s+/g, '')) return true;

  // Short answers (length <= 2, e.g. "U2", "IAM", "NTM", "M")
  if (right.length <= 2 || left.length <= 2) {
    return left === right;
  }

  // Phonetic match (handles double consonants, ph/f, ck/c, y/i, etc.)
  const pLeft = phonetic(left);
  const pRight = phonetic(right);
  if (pLeft === pRight || (pLeft.length >= 4 && (pRight.includes(pLeft) || pLeft.includes(pRight)))) {
    return true;
  }

  // Substring inclusion if substantial (e.g. "beatles" in "the beatles", "jackson" in "michael jackson")
  if (left.length >= 3 && right.length >= 3) {
    if (right.includes(left) || left.includes(right)) {
      const ratio = Math.min(left.length, right.length) / Math.max(left.length, right.length);
      if (ratio >= 0.35 || Math.min(left.length, right.length) >= 4) {
        return true;
      }
    }
  }

  const dist = levenshtein(left, right);
  const maxLen = Math.max(left.length, right.length);

  // Generous Levenshtein thresholds for typoes
  if (maxLen >= 8 && dist <= 3) return true;
  if (maxLen >= 6 && dist <= 2) return true;
  if (maxLen >= 4 && dist <= 1) return true;

  const similarity = 1 - dist / maxLen;
  if (similarity >= 0.70) return true;

  // Also check phonetic distance
  const pDist = levenshtein(pLeft, pRight);
  const pMaxLen = Math.max(pLeft.length, pRight.length);
  return pMaxLen >= 4 && (pDist <= 1 || (1 - pDist / pMaxLen >= 0.70));
}

/**
 * Artist answers are extra lenient: accepts surnames alone (e.g. "Jackson" for "Michael Jackson",
 * "Goldman" for "Jean-Jacques Goldman", "Bowie" for "David Bowie"), common aliases,
 * prefixes dropped (e.g. "Snake" for "DJ Snake"), featurings, and typo tolerance.
 */
export function answerMatches(
  input: string,
  expected: string,
  kind: 'title' | 'artist' | 'work',
  aliases?: string[],
): boolean {
  if (kind === 'work') {
    if (singleAnswerMatches(input, expected)) return true;
    if (aliases?.some((alias) => singleAnswerMatches(input, alias))) return true;
    return false;
  }

  if (kind === 'artist') {
    const rawInput = normalizeAnswer(input);
    if (!rawInput) return false;

    // Check alias dictionaries
    for (const [acronym, targets] of Object.entries(COMMON_ALIASES)) {
      if (rawInput === acronym) {
        if (targets.some((target) => singleAnswerMatches(target, expected))) return true;
      }
      for (const target of targets) {
        if (rawInput === target && singleAnswerMatches(acronym, expected)) return true;
      }
    }

    // Split candidate collaborating artists (feat, &, et, with, comma, slash, etc.)
    const candidates = expected.split(
      /\s*(?:,|&|\+|\/|\bet\b|\band\b|\bx\b|\bvs\.?\b|\bfeat\.?\b|\bft\.?\b|\bfeaturing\b|\bwith\b|\bavec\b)\s*/i,
    );

    return candidates.some((candidate) => {
      // 1. Direct candidate matching
      if (singleAnswerMatches(input, candidate)) return true;

      // 2. Candidate without honorific/prefix (e.g. "DJ Snake" -> "Snake", "Dr Dre" -> "Dre")
      const candidateNorm = normalizeAnswer(candidate);
      const strippedCandidate = candidateNorm.replace(ARTIST_PREFIX_REGEX, '');
      if (strippedCandidate !== candidateNorm && singleAnswerMatches(input, strippedCandidate)) {
        return true;
      }

      // Input without prefix (e.g. player typed "DJ Snake" for "Snake")
      const strippedInput = rawInput.replace(ARTIST_PREFIX_REGEX, '');
      if (strippedInput !== rawInput && singleAnswerMatches(strippedInput, candidateNorm)) {
        return true;
      }

      // 3. Match individual significant words / names in candidate (e.g. "Goldman", "Jackson", "Celine", "Hallyday")
      const candidateWords = candidateNorm.split(' ').filter((w) => w.length >= 3);
      if (candidateWords.some((word) => singleAnswerMatches(rawInput, word))) {
        return true;
      }

      // 4. Token subset match: all words typed by the user match words in the artist
      const inputWords = rawInput.split(' ').filter((w) => w.length >= 2);
      if (
        inputWords.length > 1 &&
        inputWords.every((inWord) => candidateWords.some((candWord) => singleAnswerMatches(inWord, candWord)))
      ) {
        return true;
      }

      return false;
    });
  }

  // Title matching
  return singleAnswerMatches(input, expected);
}

const CONFLICTING_DECADE_REGEX: Record<string, RegExp> = {
  '2020s': /\b(80s?|90s?|70s?|60s?|2000s?|00s?|19[5-9]\d|throwback|retro|oldies)\b/i,
  '2010s': /\b(202\d|80s?|90s?|70s?|60s?|19[5-9]\d|oldies)\b/i,
  '2000s': /\b(202\d|201\d|80s?|90s?|70s?|60s?|19[5-9]\d)\b/i,
  '90s': /\b(202\d|201\d|2000s?|00s?|80s?|70s?|60s?)\b/i,
  '80s': /\b(202\d|201\d|2000s?|00s?|90s?|70s?|60s?)\b/i,
  '70s': /\b(202\d|201\d|2000s?|00s?|90s?|80s?|60s?)\b/i,
  '60s': /\b(202\d|201\d|2000s?|00s?|90s?|80s?|70s?)\b/i,
};

const CONFLICTING_GENRE_REGEX: Record<string, RegExp> = {
  pop: /\b(rock|metal|hardrock|hard-rock|punk|grunge|indie rock|metalcore|heavy metal|classic rock|pop-rock|pop rock|rock & pop|rock and pop)\b/i,
  rock: /\b(rap|hip hop|hip-hop|r&b|rnb|k-?pop|reggaeton|disco funk|techno)\b/i,
  rap: /\b(rock|metal|punk|country|electro|techno|variété)\b/i,
  electro: /\b(rock|metal|acoustic|country|reggae|variété|chanson)\b/i,
  metal: /\b(pop|rap|hip-hop|disco|dance|k-?pop|reggae|variété)\b/i,
  disco: /\b(rock|metal|rap|grunge|hard|punk|electro dance)\b/i,
  kpop: /\b(j-?pop|c-?pop|anime|western|rock classics)\b/i,
  reggae: /\b(rock|metal|pop hits|techno|electro)\b/i,
  jazz: /\b(rock|metal|rap|electro|techno|pop hits)\b/i,
  'variete-fr': /\b(rock international|metal|rap us|hip hop us|k-?pop)\b/i,
};

const PURE_ROCK_ARTISTS = new Set([
  'ac/dc', 'ac dc', 'acdc', 'metallica', 'iron maiden', 'guns n roses', 'guns n\' roses', 'guns and roses',
  'nirvana', 'rammstein', 'system of a down', 'slipknot', 'motorhead', 'motörhead', 'mötley crüe',
  'judas priest', 'black sabbath', 'led zeppelin', 'deep purple', 'megadeth', 'slayer', 'pantera',
  'avenged sevenfold', 'linkin park', 'limp bizkit', 'korn', 'rage against the machine', 'disturbed',
  'marilyn manson', 'green day', 'blink-182', 'blink 182', 'the offspring', 'offspring', 'foo fighters',
  'red hot chili peppers', 'scorpions', 'aerosmith', 'kiss', 'bon jovi', 'def leppard', 'zz top',
  'van halen', 'ozzy osbourne', 'alice cooper', 'the smashing pumpkins', 'smashing pumpkins',
  'soundgarden', 'pearl jam', 'alice in chains', 'queens of the stone age', 'muse', 'arctic monkeys',
  'the rolling stones', 'the who', 'the doors', 'the clash', 'sex pistols', 'ramones', 'the cure',
  'dire straits', 'pink floyd', 'oasis', 'blur', 'radiohead', 'u2', 'nickelback', 'sum 41',
  'sum41', 'simple plan', 'papa roach', 'three days grace', 'evanescence', 'skillet',
]);

const FAKE_ARTIST_REGEX = /^(?:various artists|multi-interprètes|les meilleurs|party hits|top hits|best of|summer hits|hit tracks|hits 20\d\d)\b/i;

function isAcceptableTrack(track: Track, themeId?: string): boolean {
  if (!track.title || !track.artist || !track.previewUrl) return false;
  if (FAKE_ARTIST_REGEX.test(track.artist.trim())) return false;
  if (themeId === 'pop') {
    const norm = normalizeAnswer(track.artist);
    if (PURE_ROCK_ARTISTS.has(norm)) return false;
    for (const rockArtist of PURE_ROCK_ARTISTS) {
      if (norm === rockArtist || norm.startsWith(rockArtist + ' ') || norm.endsWith(' ' + rockArtist)) {
        return false;
      }
    }
  }
  return true;
}

async function fetchFromSource(
  source: ThemeSource,
  themeId: string,
  category: string,
  extraQuery = '',
): Promise<Track[]> {
  const tracks: Track[] = [];
  if (source.kind === 'chart' && !extraQuery) {
    const genreId = source.genreId;
    const data = await fetchJson<{ data?: DeezerTrack[] }>(`${DEEZER}/chart/${genreId}/tracks?limit=100`);
    for (const t of data?.data ?? []) {
      const track = toTrack(t, themeId);
      if (track && isAcceptableTrack(track, themeId)) tracks.push(track);
    }
    const radios = await fetchJson<{ data?: { id: number }[] }>(`${DEEZER}/genre/${genreId}/radios`);
    for (const radio of (radios?.data ?? []).slice(0, 3)) {
      const radioTracks = await fetchJson<{ data?: DeezerTrack[] }>(
        `${DEEZER}/radio/${radio.id}/tracks?limit=50`,
      );
      for (const t of radioTracks?.data ?? []) {
        const track = toTrack(t, themeId);
        if (track && isAcceptableTrack(track, themeId)) tracks.push(track);
      }
    }
  } else {
    const queries = source.kind === 'playlists' ? source.queries : [`${themeId} ${extraQuery}`];
    const conflictDecade = CONFLICTING_DECADE_REGEX[themeId];
    const conflictGenre = CONFLICTING_GENRE_REGEX[themeId];

    for (const query of queries) {
      const composed = extraQuery && !query.includes(extraQuery) ? `${query} ${extraQuery}`.trim() : query;

      // 1) Search playlists
      const found = await fetchJson<{ data?: DeezerPlaylist[] }>(
        `${DEEZER}/search/playlist?q=${encodeURIComponent(composed)}&limit=6`,
      );
      const playlists = (found?.data ?? []).filter((p) => {
        const title = p.title ?? '';
        if (conflictDecade && conflictDecade.test(title)) return false;
        if (conflictGenre && conflictGenre.test(title)) return false;
        const count = p.nb_tracks ?? 0;
        return count >= 15 && count <= 250;
      }).slice(0, 4);

      for (const playlist of playlists) {
        const data = await fetchJson<{ data?: DeezerTrack[] }>(
          `${DEEZER}/playlist/${playlist.id}/tracks?limit=100`,
        );
        for (const t of data?.data ?? []) {
          const track = toTrack(t, themeId);
          if (track && isAcceptableTrack(track, themeId)) tracks.push(track);
        }
      }

      // 2) Direct search only for cultural themes (films, disney, pub, etc.), NOT for decades
      if (category === 'culture') {
        const direct = await fetchJson<{ data?: DeezerTrack[] }>(
          `${DEEZER}/search?q=${encodeURIComponent(composed)}&limit=40`,
        );
        for (const t of direct?.data ?? []) {
          const track = toTrack(t, themeId);
          if (track && isAcceptableTrack(track)) tracks.push(track);
        }
      }
    }
  }
  return tracks;
}

async function loadPool(theme: ThemeDefinition, opts?: { yearRanges?: string[]; genres?: string[] }): Promise<Track[]> {
  const optsKey = JSON.stringify(opts ?? {});
  const cacheKey = `${theme.id}|${optsKey}`;
  const cached = poolCache.get(cacheKey);
  if (cached && Date.now() - cached.at < POOL_TTL_MS) return cached.tracks;

  // Append decade extra query when combining genres or culture themes with decades
  let extraQuery = '';
  if ((theme.category === 'genre' || theme.category === 'culture') && opts?.yearRanges?.length) {
    extraQuery = opts.yearRanges.join(' ');
  }

  const tracks = await fetchFromSource(theme.source, theme.id, theme.category, extraQuery);

  const unique = new Map(
    tracks.map((track) => [`${normalizeAnswer(track.title)}|${normalizeAnswer(track.artist)}`, track]),
  );
  const pool = [...unique.values()];
  poolCache.set(cacheKey, { at: Date.now(), tracks: pool });
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
 * ranked by popularity and explicit difficulty tags, then split into bands.
 */
function gradeByDifficulty(pool: Track[], difficulty: Difficulty): Track[] {
  if (difficulty === 'mixte') return pool;

  const explicitMatches = pool.filter((t) => t.difficulty === difficulty);
  const untaggedOrOther = pool.filter((t) => t.difficulty !== difficulty);

  // If we have enough tracks with explicit matching difficulty, prioritize them and complete with the rest
  if (explicitMatches.length >= 4) {
    const rankedOthers = [...untaggedOrOther].sort((a, b) => b.rank - a.rank);
    const band = Math.ceil(rankedOthers.length / 3);
    const slice =
      difficulty === 'facile'
        ? rankedOthers.slice(0, band)
        : difficulty === 'moyen'
          ? rankedOthers.slice(band, band * 2)
          : rankedOthers.slice(band * 2);
    return [...explicitMatches, ...slice];
  }

  if (pool.length < 12) return pool;
  const ranked = [...pool].sort((a, b) => b.rank - a.rank);
  const band = Math.ceil(ranked.length / 3);
  if (difficulty === 'facile') return ranked.slice(0, band);
  if (difficulty === 'moyen') return ranked.slice(band, band * 2);
  return ranked.slice(band * 2);
}

export function extractDeezerPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (/^\d+$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/playlist\/(\d+)/i);
  if (match) return match[1];
  return null;
}

export async function fetchDeezerPlaylistInfo(
  query: string,
): Promise<{ id: string; title: string; count: number; picture: string | null } | null> {
  const id = extractDeezerPlaylistId(query);
  if (!id) return null;
  const data = await fetchJson<{ id?: number; title?: string; nb_tracks?: number; picture_medium?: string }>(
    `${DEEZER}/playlist/${id}`,
  );
  if (!data || !data.id || !data.title) return null;
  return {
    id: String(data.id),
    title: data.title,
    count: data.nb_tracks ?? 0,
    picture: data.picture_medium ?? null,
  };
}

/** Builds a playlist of unique tracks drawn evenly from every selected theme, decade, and genre. */
export async function buildPlaylist(
  themeIds: string[],
  count: number,
  difficulty: Difficulty = 'mixte',
  opts?: { yearRanges?: string[]; genres?: string[]; customPlaylistId?: string | null },
): Promise<Track[]> {
  // If custom playlist is provided, load its tracks directly!
  if (opts?.customPlaylistId) {
    const data = await fetchJson<{ data?: DeezerTrack[] }>(
      `${DEEZER}/playlist/${opts.customPlaylistId}/tracks?limit=200`,
    );
    const tracks: Track[] = [];
    for (const t of data?.data ?? []) {
      const track = toTrack(t);
      if (track && isAcceptableTrack(track)) tracks.push(track);
    }
    if (tracks.length > 0) {
      return shuffle(tracks).slice(0, count);
    }
  }

  const definitions: ThemeDefinition[] = [];

  // 1. Explicit theme IDs
  for (const id of themeIds) {
    const theme = THEME_BY_ID.get(id);
    if (theme && !definitions.some((d) => d.id === theme.id)) {
      definitions.push(theme);
    }
  }

  // 2. Genre selections
  if (opts?.genres) {
    for (const genre of opts.genres) {
      const source = GENRE_SOURCES[genre];
      if (source && !definitions.some((d) => d.id === genre)) {
        definitions.push({
          id: genre,
          label: genre,
          emoji: '🎵',
          category: 'genre',
          source,
        });
      }
    }
  }

  // 3. Decade ranges: only added as standalone pools if NO themes and NO genres were selected
  // Otherwise, decade ranges act as filters on the selected themes and genres!
  if (definitions.length === 0 && opts?.yearRanges?.length) {
    for (const decade of opts.yearRanges) {
      const queries = DECADE_QUERIES[decade];
      if (queries && !definitions.some((d) => d.id === decade)) {
        definitions.push({
          id: decade,
          label: `Années ${decade}`,
          emoji: '📅',
          category: 'epoque',
          source: { kind: 'playlists', queries },
        });
      }
    }
  }

  // Fallback if empty: Top hits
  if (definitions.length === 0) {
    const top = THEME_BY_ID.get('top');
    if (top) definitions.push(top);
  }

  const pools = await Promise.all(
    definitions.map((theme) => loadPool(theme, opts).then((pool) => shuffle(gradeByDifficulty(pool, difficulty)))),
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
      const key = `${normalizeAnswer(next.title)}|${normalizeAnswer(next.artist)}`;
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
    (r) => r.previewUrl && normalizeAnswer(r.trackName ?? '').includes(normalizeAnswer(title).slice(0, 12)),
  );
  return match?.previewUrl ?? data?.results?.find((r) => r.previewUrl)?.previewUrl ?? null;
}
