import type { Theme } from '../../shared/types.js';

/**
 * A theme resolves to Deezer tracks either through a genre chart or through
 * editorial playlists found by search. Adding a theme is a one-line change.
 */
export type ThemeSource =
  | { kind: 'chart'; genreId: number }
  | { kind: 'playlists'; queries: string[] };

export interface ThemeDefinition extends Theme {
  source: ThemeSource;
}

export const DECADE_QUERIES: Record<string, string[]> = {
  '60s': ['hits années 60', '60s hits', 'tubes années 60', 'rock 60s', 'chansons années 60'],
  '70s': ['hits années 70', '70s hits', 'disco 70s', 'tubes 70s', 'rock 70s'],
  '80s': ['hits années 80', '80s hits', 'pop rock 80s', 'tubes 80s', 'synthpop 80s'],
  '90s': ['hits années 90', '90s hits', 'dance 90s', 'tubes 90s', 'rock 90s'],
  '2000s': ['hits années 2000', '2000s hits', 'pop 2000', 'tubes 2000', 'rnb 2000'],
  '2010s': ['hits années 2010', '2010s hits', 'tubes 2010', 'pop 2010', 'dance 2010'],
  '2020s': ['hits 2020', 'hits 2021', 'hits 2022', 'hits 2023', 'hits 2024', 'hits actuels', 'tubes 2020'],
};

export const GENRE_SOURCES: Record<string, ThemeSource> = {
  pop: { kind: 'chart', genreId: 132 },
  rock: { kind: 'chart', genreId: 152 },
  rap: { kind: 'chart', genreId: 116 },
  electro: { kind: 'chart', genreId: 106 },
  rnb: { kind: 'chart', genreId: 165 },
  metal: { kind: 'chart', genreId: 464 },
  reggae: { kind: 'chart', genreId: 144 },
  jazz: { kind: 'chart', genreId: 129 },
  'variete-fr': {
    kind: 'playlists',
    queries: ['variété française', 'chanson française cultes', 'les plus grands tubes français'],
  },
  disco: {
    kind: 'playlists',
    queries: ['disco funk', 'best of disco', 'disco classics', 'tubes disco 70s 80s'],
  },
};

export const THEMES: ThemeDefinition[] = [
  { id: 'top', label: 'Top hits', emoji: '🔥', category: 'genre', source: { kind: 'chart', genreId: 0 } },
  { id: 'pop', label: 'Pop', emoji: '🎤', category: 'genre', source: GENRE_SOURCES.pop },
  { id: 'rock', label: 'Rock', emoji: '🎸', category: 'genre', source: GENRE_SOURCES.rock },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🧢', category: 'genre', source: GENRE_SOURCES.rap },
  { id: 'electro', label: 'Électro / Dance', emoji: '🪩', category: 'genre', source: GENRE_SOURCES.electro },
  { id: 'metal', label: 'Metal', emoji: '🤘', category: 'genre', source: GENRE_SOURCES.metal },
  { id: 'rnb', label: 'R&B / Soul', emoji: '💜', category: 'genre', source: GENRE_SOURCES.rnb },
  { id: 'reggae', label: 'Reggae', emoji: '🌴', category: 'genre', source: GENRE_SOURCES.reggae },
  { id: 'jazz', label: 'Jazz / Blues', emoji: '🎷', category: 'genre', source: GENRE_SOURCES.jazz },
  { id: 'variete-fr', label: 'Variété française', emoji: '🇫🇷', category: 'genre', source: GENRE_SOURCES['variete-fr'] },
  { id: 'disco', label: 'Disco / Funk', emoji: '✨', category: 'genre', source: GENRE_SOURCES.disco },

  {
    id: '60s',
    label: 'Années 60',
    emoji: '🎙️',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['60s'] },
  },
  {
    id: '70s',
    label: 'Années 70',
    emoji: '🕺',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['70s'] },
  },
  {
    id: '80s',
    label: 'Années 80',
    emoji: '📼',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['80s'] },
  },
  {
    id: '90s',
    label: 'Années 90',
    emoji: '💿',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['90s'] },
  },
  {
    id: '2000s',
    label: 'Années 2000',
    emoji: '📱',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['2000s'] },
  },
  {
    id: '2010s',
    label: 'Années 2010',
    emoji: '🎧',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['2010s'] },
  },
  {
    id: '2020s',
    label: 'Années 2020+',
    emoji: '🚀',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['2020s'] },
  },

  // Retrocompatibility aliases
  {
    id: 'annees80',
    label: 'Années 80',
    emoji: '📼',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['80s'] },
  },
  {
    id: 'annees90',
    label: 'Années 90',
    emoji: '💿',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['90s'] },
  },
  {
    id: 'annees2000',
    label: 'Années 2000',
    emoji: '📱',
    category: 'epoque',
    source: { kind: 'playlists', queries: DECADE_QUERIES['2000s'] },
  },

  {
    id: 'films',
    label: 'Musiques de films',
    emoji: '🎬',
    category: 'culture',
    source: { kind: 'playlists', queries: ['musiques de films cultes', 'bandes originales films', 'movie soundtracks'] },
  },
  {
    id: 'disney',
    label: 'Disney',
    emoji: '🏰',
    category: 'culture',
    source: { kind: 'playlists', queries: ['disney français', 'disney classics', 'musiques disney'] },
  },
  {
    id: 'dessins-animes',
    label: 'Dessins animés & animés',
    emoji: '📺',
    category: 'culture',
    source: { kind: 'playlists', queries: ['génériques dessins animés', 'anime openings', 'dessins animés cultes'] },
  },
  {
    id: 'jeux-video',
    label: 'Jeux vidéo',
    emoji: '🎮',
    category: 'culture',
    source: { kind: 'playlists', queries: ['musiques jeux vidéo', 'video game soundtracks', 'gaming music classics'] },
  },
  {
    id: 'pub',
    label: 'Musiques de pub',
    emoji: '📢',
    category: 'culture',
    source: { kind: 'playlists', queries: ['musiques de pub', 'musique de publicité', 'pub cultes musiques'] },
  },
];

export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]));

export const publicThemes: Theme[] = THEMES.filter(
  (t) => !['annees80', 'annees90', 'annees2000'].includes(t.id),
).map(({ id, label, emoji, category }) => ({
  id,
  label,
  emoji,
  category,
}));
