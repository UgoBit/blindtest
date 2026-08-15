export type Phase = 'lobby' | 'countdown' | 'listening' | 'buzzed' | 'reveal' | 'finished';

export interface Theme {
  id: string;
  label: string;
  emoji: string;
  category: 'genre' | 'epoque' | 'culture';
}

export interface Player {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  lockedOut: boolean;
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
}

export interface RoomSettings {
  themes: string[];
  rounds: number;
  clipSeconds: number;
  hostPlays: boolean;
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
}

export interface ServerToClientEvents {
  room_state: (state: RoomState) => void;
  host_track: (track: HostTrack) => void;
  error_message: (message: string) => void;
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
  start_game: () => void;
  buzz: () => void;
  judge: (payload: { title: boolean; artist: boolean }) => void;
  skip: () => void;
  next_round: () => void;
  restart: () => void;
  preview_failed: () => void;
  kick: (playerId: string) => void;
}

export const POINTS = { title: 1, artist: 1 } as const;
