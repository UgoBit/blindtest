export type Phase = 'lobby' | 'countdown' | 'listening' | 'buzzed' | 'reveal' | 'finished';

export interface Theme {
  id: string;
  label: string;
  emoji: string;
  category: 'genre' | 'epoque' | 'culture';
}

export type GameMode = 'phones' | 'solo' | 'teams' | 'course';

export interface DecadeOption {
  id: string;
  label: string;
  emoji: string;
  years: string;
}

export const DECADES_LIST: DecadeOption[] = [
  { id: '60s', label: 'Années 60', emoji: '🎙️', years: '1960-1969' },
  { id: '70s', label: 'Années 70', emoji: '🕺', years: '1970-1979' },
  { id: '80s', label: 'Années 80', emoji: '📼', years: '1980-1989' },
  { id: '90s', label: 'Années 90', emoji: '💿', years: '1990-1999' },
  { id: '2000s', label: 'Années 2000', emoji: '📱', years: '2000-2009' },
  { id: '2010s', label: 'Années 2010', emoji: '🎧', years: '2010-2019' },
  { id: '2020s', label: 'Années 2020+', emoji: '🚀', years: '2020 à aujourd\'hui' },
];

export interface GenreOption {
  id: string;
  label: string;
  emoji: string;
}

export const GENRES_LIST: GenreOption[] = [
  { id: 'pop', label: 'Pop', emoji: '🎤' },
  { id: 'rock', label: 'Rock', emoji: '🎸' },
  { id: 'rap', label: 'Rap / Hip-hop', emoji: '🧢' },
  { id: 'electro', label: 'Électro / Dance', emoji: '🪩' },
  { id: 'rnb', label: 'R&B / Soul', emoji: '💜' },
  { id: 'metal', label: 'Metal', emoji: '🤘' },
  { id: 'variete-fr', label: 'Variété française', emoji: '🇫🇷' },
  { id: 'disco', label: 'Disco / Funk', emoji: '✨' },
  { id: 'reggae', label: 'Reggae', emoji: '🌴' },
  { id: 'jazz', label: 'Jazz / Blues', emoji: '🎷' },
];

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  lockedOut: boolean;
  team?: number | null;
}

/** Track info as seen by everyone, including players: never contains the answer. */
export interface PublicTrack {
  index: number;
  total: number;
  cover: string | null;
}

/** Track info sent to the host only: contains the answer and the audio URL. */
export interface HostTrack extends PublicTrack {
  id: string;
  title: string;
  artist: string;
  previewUrl: string;
  /** Offset in seconds the host should resume the clip from (0 for a fresh round). */
  startAt: number;
}

/** Track info sent to players when their devices output the audio. */
export interface PlayerTrack extends PublicTrack {
  previewUrl: string;
  /** Offset in seconds the player should resume the clip from. */
  startAt: number;
}

export type Difficulty = 'facile' | 'moyen' | 'difficile' | 'mixte';

export const DIFFICULTIES: { id: Difficulty; label: string; hint: string }[] = [
  { id: 'facile', label: 'Facile', hint: 'les tubes que tout le monde connaît' },
  { id: 'moyen', label: 'Moyen', hint: 'des titres connus, mais moins évidents' },
  { id: 'difficile', label: 'Difficile', hint: 'les morceaux plus pointus du thème' },
  { id: 'mixte', label: 'Mixte', hint: 'un peu de tout' },
];

export interface RoomSettings {
  themes: string[];
  difficulty: Difficulty;
  rounds: number;
  clipSeconds: number;
  hostPlays: boolean;
  mode: GameMode;
  teamCount: number;
  teamNames: string[];
  audioHostEnabled: boolean;
  audioPlayersEnabled: boolean;
  /** Solo only: when false the round just plays and reveals, without buzzer nor score. */
  buzzerEnabled: boolean;
  /** Decade ranges (e.g. "70-80", "80-90", "2020+") */
  yearRanges?: string[];
  /** Preferred genres (e.g. rock, pop, rap) */
  genres?: string[];
}

export interface RoundAttempt {
  playerId: string;
  name: string;
  team?: number | null;
  title: string;
  artist: string;
  verdict: { title: boolean; artist: boolean };
  points: number;
  seconds: number;
}

export interface RoomState {
  code: string;
  phase: Phase;
  settings: RoomSettings;
  players: Player[];
  /** Player who currently holds the buzzer, if any. */
  buzzedBy: string | null;
  /** Revealed answer, only set during the `reveal` phase. */
  answer: { title: string; artist: string; cover: string | null } | null;
  track: PublicTrack | null;
  round: number;
  teamScores: TeamScore[];
  /** Answer typed by the buzzer, revealed only with the answer. */
  submittedAnswer: { title: string; artist: string } | null;
  /** Accepted fields for the submitted answer, revealed only with the answer. */
  answerVerdict: { title: boolean; artist: boolean } | null;
  /** Deadline for the buzzer's answer, or end of the clip in `course` mode. */
  responseDeadline: number | null;
  /** Course mode: players who buzzed and are still typing their answer. */
  racers: string[];
  /** Course mode: players who already sent an answer this round. */
  answeredBy: string[];
  /** Course mode: every answer of the round, revealed only with the answer. */
  raceAnswers: RaceAnswer[];
  /** Standard/Phones/Teams/Solo mode: all attempts submitted during the round. */
  roundAttempts: RoundAttempt[];
  /** Fields already correctly found in the current round. */
  awarded: { title: boolean; artist: boolean };
  /** Text of fields already correctly found in the current round. */
  foundFields: { title: string | null; artist: string | null };
  /** Timestamp when clip finishes playing, or null when paused/countdown/reveal. */
  clipEndsAt: number | null;
  /** Remaining seconds on the current clip (0 when not playing). */
  remainingSeconds: number;
}

/** One answer sent during a `course` round, revealed at the end of the round. */
export interface RaceAnswer {
  playerId: string;
  name: string;
  title: string;
  artist: string;
  verdict: { title: boolean; artist: boolean };
  points: number;
  /** Seconds elapsed in the clip when the player buzzed. */
  seconds: number;
}

export interface TeamScore {
  team: number;
  name: string;
  score: number;
}

export interface ServerToClientEvents {
  room_state: (state: RoomState) => void;
  host_track: (track: HostTrack) => void;
  player_track: (track: PlayerTrack) => void;
  error_message: (message: string) => void;
  /** Emitted when the room is closed by the host. */
  room_closed: () => void;
  /** Tells the host device to (re)start or stop audio playback. */
  audio: (command: { action: 'play' | 'pause' | 'stop'; at: number }) => void;
}

export interface ClientToServerEvents {
  create_room: (
    settings: RoomSettings,
    ack: (res: { ok: true; code: string; playerId: string } | { ok: false; error: string }) => void,
  ) => void;
  join_room: (
    payload: { code: string; name: string; playerId?: string },
    ack: (res: { ok: true; playerId: string } | { ok: false; error: string }) => void,
  ) => void;
  update_settings: (settings: Partial<RoomSettings>) => void;
  rename_team: (name: string) => void;
  assign_team: (payload: { playerId: string; team: number | null }) => void;
  start_game: () => void;
  buzz: () => void;
  submit_answer: (payload: { title: string; artist: string }) => void;
  correct_answer: (payload: { field: 'title' | 'artist'; playerId?: string }) => void;
  skip: () => void;
  next_round: () => void;
  restart: () => void;
  close_room: () => void;
  preview_failed: () => void;
  resync: () => void;
  kick: (playerId: string) => void;
}

export const POINTS = { title: 1, artist: 1 } as const;

/** Course mode: points for a full answer, depending on how fast the player buzzed. */
export const SPEED_TIERS = [
  { seconds: 10, points: 3 },
  { seconds: 20, points: 2 },
] as const;

export const SPEED_TIER_FLOOR = 1;

export function speedPoints(seconds: number): number {
  return SPEED_TIERS.find((tier) => seconds < tier.seconds)?.points ?? SPEED_TIER_FLOOR;
}
