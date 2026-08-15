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

export const THEMES: ThemeDefinition[] = [
  { id: 'top', label: 'Top hits', emoji: '🔥', category: 'genre', source: { kind: 'chart', genreId: 0 } },
  { id: 'pop', label: 'Pop', emoji: '🎤', category: 'genre', source: { kind: 'chart', genreId: 132 } },
  { id: 'rock', label: 'Rock', emoji: '🎸', category: 'genre', source: { kind: 'chart', genreId: 152 } },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🎧', category: 'genre', source: { kind: 'chart', genreId: 116 } },
  { id: 'electro', label: 'Électro', emoji: '🪩', category: 'genre', source: { kind: 'chart', genreId: 106 } },
  { id: 'metal', label: 'Metal', emoji: '🤘', category: 'genre', source: { kind: 'chart', genreId: 464 } },
  { id: 'rnb', label: 'R&B / Soul', emoji: '💜', category: 'genre', source: { kind: 'chart', genreId: 165 } },
  { id: 'reggae', label: 'Reggae', emoji: '🌴', category: 'genre', source: { kind: 'chart', genreId: 144 } },
  { id: 'jazz', label: 'Jazz', emoji: '🎷', category: 'genre', source: { kind: 'chart', genreId: 129 } },
  {
    id: 'annees80',
    label: 'Années 80',
    emoji: '📼',
    category: 'epoque',
    source: { kind: 'playlists', queries: ['hits années 80', '80s hits'] },
  },
  {
    id: 'annees90',
    label: 'Années 90',
    emoji: '💿',
    category: 'epoque',
    source: { kind: 'playlists', queries: ['hits années 90', '90s hits'] },
  },
  {
    id: 'annees2000',
    label: 'Années 2000',
    emoji: '📱',
    category: 'epoque',
    source: { kind: 'playlists', queries: ['hits années 2000', '2000s hits'] },
  },
  {
    id: 'variete-fr',
    label: 'Variété française',
    emoji: '🇫🇷',
    category: 'genre',
    source: { kind: 'playlists', queries: ['variété française', 'chanson française cultes'] },
  },
  {
    id: 'films',
    label: 'Musiques de films',
    emoji: '🎬',
    category: 'culture',
    source: { kind: 'playlists', queries: ['musiques de films cultes', 'bandes originales films'] },
  },
  {
    id: 'disney',
    label: 'Disney',
    emoji: '🏰',
    category: 'culture',
    source: { kind: 'playlists', queries: ['disney français', 'disney classics'] },
  },
  {
    id: 'dessins-animes',
    label: 'Dessins animés & animés',
    emoji: '📺',
    category: 'culture',
    source: { kind: 'playlists', queries: ['génériques dessins animés', 'anime openings'] },
  },
  {
    id: 'jeux-video',
    label: 'Jeux vidéo',
    emoji: '🎮',
    category: 'culture',
    source: { kind: 'playlists', queries: ['musiques jeux vidéo', 'video game soundtracks'] },
  },
  {
    id: 'pub',
    label: 'Musiques de pub',
    emoji: '📢',
    category: 'culture',
    source: { kind: 'playlists', queries: ['musiques de pub', 'musique de publicité'] },
  },
];

export const THEME_BY_ID = new Map(THEMES.map((t) => [t.id, t]));

export const publicThemes: Theme[] = THEMES.map(({ id, label, emoji, category }) => ({
  id,
  label,
  emoji,
  category,
}));
