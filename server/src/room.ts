import type { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  Phase,
  Player,
  RoomSettings,
  RoomState,
  ServerToClientEvents,
} from '../../shared/types.js';
import { POINTS } from '../../shared/types.js';
import { buildPlaylist, itunesPreview, type Track } from './music.js';

type Io = Server<ClientToServerEvents, ServerToClientEvents>;

interface Member extends Player {
  socketId: string | null;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const COUNTDOWN_MS = 3000;

export const rooms = new Map<string, Room>();

export function createCode(): string {
  let code = '';
  do {
    code = Array.from({ length: 4 }, () =>
      CODE_ALPHABET.charAt(Math.floor(Math.random() * CODE_ALPHABET.length)),
    ).join('');
  } while (rooms.has(code));
  return code;
}

export class Room {
  readonly code = createCode();
  readonly createdAt = Date.now();
  settings: RoomSettings;
  phase: Phase = 'lobby';
  players = new Map<string, Member>();
  hostId: string | null = null;
  playlist: Track[] = [];
  round = -1;
  buzzedBy: string | null = null;
  lastActivity = Date.now();

  private io: Io;
  private timer: NodeJS.Timeout | null = null;
  private clipEndsAt = 0;
  private remainingMs = 0;
  private awarded = { title: false, artist: false };

  constructor(io: Io, settings: RoomSettings) {
    this.io = io;
    this.settings = settings;
    rooms.set(this.code, this);
  }

  get currentTrack(): Track | null {
    return this.playlist[this.round] ?? null;
  }

  private get hostSocketId(): string | null {
    return this.hostId ? (this.players.get(this.hostId)?.socketId ?? null) : null;
  }

  addPlayer(playerId: string, name: string, socketId: string, isHost = false): Member {
    const existing = this.players.get(playerId);
    const member: Member = existing
      ? { ...existing, name, socketId, connected: true }
      : { id: playerId, name, score: 0, connected: true, isHost, lockedOut: false, socketId };
    this.players.set(playerId, member);
    if (isHost) this.hostId = playerId;
    this.touch();
    return member;
  }

  removeSocket(socketId: string): void {
    for (const member of this.players.values()) {
      if (member.socketId !== socketId) continue;
      member.connected = false;
      member.socketId = null;
      // A player who never played is dropped so the lobby stays clean.
      if (this.phase === 'lobby' && !member.isHost) this.players.delete(member.id);
    }
    this.touch();
    this.broadcast();
  }

  resyncPlayer(playerId: string, socketId: string): boolean {
    const member = this.players.get(playerId);
    if (!member) return false;
    member.socketId = socketId;
    member.connected = true;
    this.touch();
    this.broadcast();
    if (member.isHost) this.resyncHost();
    return true;
  }

  kick(playerId: string): void {
    if (playerId === this.hostId) return;
    this.players.delete(playerId);
    if (this.buzzedBy === playerId) this.buzzedBy = null;
    this.broadcast();
  }

  canBuzz(playerId: string): boolean {
    const member = this.players.get(playerId);
    if (!member || member.lockedOut) return false;
    return member.isHost ? this.settings.hostPlays : true;
  }

  state(): RoomState {
    const track = this.currentTrack;
    return {
      code: this.code,
      phase: this.phase,
      settings: this.settings,
      players: [...this.players.values()]
        .map(({ socketId: _socketId, ...player }) => player)
        .filter((player) => !player.isHost || this.settings.hostPlays || this.phase === 'lobby'),
      buzzedBy: this.buzzedBy,
      answer:
        this.phase === 'reveal' && track
          ? { title: track.title, artist: track.artist, cover: track.cover }
          : null,
      track: track ? { index: this.round + 1, total: this.playlist.length, cover: null } : null,
      round: this.round,
    };
  }

  broadcast(): void {
    this.io.to(this.code).emit('room_state', this.state());
  }

  private touch(): void {
    this.lastActivity = Date.now();
  }

  private clearTimer(): void {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }

  /** Seconds of the clip already elapsed, used to resume a host that reconnected. */
  private elapsedSeconds(): number {
    if (this.phase !== 'listening' && this.phase !== 'buzzed') return 0;
    const remainingMs = this.phase === 'buzzed' ? this.remainingMs : Math.max(0, this.clipEndsAt - Date.now());
    return Math.max(0, this.settings.clipSeconds - remainingMs / 1000);
  }

  private sendHostTrack(previewUrl?: string): void {
    const track = this.currentTrack;
    const socketId = this.hostSocketId;
    if (!track || !socketId) return;
    this.io.to(socketId).emit('host_track', {
      index: this.round + 1,
      total: this.playlist.length,
      cover: track.cover,
      id: track.id,
      title: track.title,
      artist: track.artist,
      previewUrl: previewUrl ?? track.previewUrl,
      startAt: this.elapsedSeconds(),
    });
  }

  /** Restores audio on a host device that reconnected in the middle of a round. */
  resyncHost(): void {
    if (!['countdown', 'listening', 'buzzed', 'reveal'].includes(this.phase)) return;
    this.sendHostTrack();
    const socketId = this.hostSocketId;
    if (this.phase === 'listening' && socketId) {
      this.io.to(socketId).emit('audio', { action: 'play', at: Date.now() });
    }
  }

  async start(): Promise<void> {
    if (this.phase !== 'lobby') return;
    this.playlist = await buildPlaylist(
      this.settings.themes,
      this.settings.rounds,
      this.settings.difficulty,
    );
    if (this.playlist.length === 0) {
      this.io.to(this.code).emit('error_message', "Impossible de charger des extraits pour ces thèmes.");
      return;
    }
    for (const member of this.players.values()) member.score = 0;
    this.round = -1;
    this.nextRound();
  }

  nextRound(): void {
    this.clearTimer();
    this.buzzedBy = null;
    this.awarded = { title: false, artist: false };
    for (const member of this.players.values()) member.lockedOut = false;

    if (this.round + 1 >= this.playlist.length) {
      this.phase = 'finished';
      this.broadcast();
      return;
    }

    this.round += 1;
    this.phase = 'countdown';
    this.touch();
    this.broadcast();
    this.sendHostTrack();

    this.timer = setTimeout(() => {
      this.phase = 'listening';
      this.remainingMs = this.settings.clipSeconds * 1000;
      this.startClock();
      this.broadcast();
      this.io.to(this.code).emit('audio', { action: 'play', at: Date.now() });
    }, COUNTDOWN_MS);
  }

  private startClock(): void {
    this.clearTimer();
    this.clipEndsAt = Date.now() + this.remainingMs;
    this.timer = setTimeout(() => this.reveal(), this.remainingMs);
  }

  buzz(playerId: string): void {
    if (this.phase !== 'listening' || !this.canBuzz(playerId)) return;
    this.clearTimer();
    this.remainingMs = Math.max(2000, this.clipEndsAt - Date.now());
    this.buzzedBy = playerId;
    this.phase = 'buzzed';
    this.touch();
    this.io.to(this.code).emit('audio', { action: 'pause', at: Date.now() });
    this.broadcast();
  }

  judge(title: boolean, artist: boolean): void {
    if (this.phase !== 'buzzed' || !this.buzzedBy) return;
    const member = this.players.get(this.buzzedBy);
    if (!member) return;

    if (title && !this.awarded.title) {
      member.score += POINTS.title;
      this.awarded.title = true;
    }
    if (artist && !this.awarded.artist) {
      member.score += POINTS.artist;
      this.awarded.artist = true;
    }

    if (this.awarded.title && this.awarded.artist) {
      this.reveal();
      return;
    }

    // Partial or wrong answer: the player is out for this track, the clip resumes.
    member.lockedOut = true;
    this.buzzedBy = null;
    const stillPlaying = [...this.players.values()].some((p) => this.canBuzz(p.id));
    if (!stillPlaying) {
      this.reveal();
      return;
    }
    this.phase = 'listening';
    this.startClock();
    this.broadcast();
    this.io.to(this.code).emit('audio', { action: 'play', at: Date.now() });
  }

  reveal(): void {
    this.clearTimer();
    this.phase = 'reveal';
    this.buzzedBy = null;
    this.touch();
    this.io.to(this.code).emit('audio', { action: 'pause', at: Date.now() });
    this.broadcast();
  }

  restart(): void {
    this.clearTimer();
    this.phase = 'lobby';
    this.round = -1;
    this.playlist = [];
    this.buzzedBy = null;
    for (const member of this.players.values()) {
      member.score = 0;
      member.lockedOut = false;
    }
    this.broadcast();
  }

  /** Falls back to Apple previews when the host device cannot play the Deezer clip. */
  async retryPreview(): Promise<void> {
    const track = this.currentTrack;
    if (!track) return;
    const url = await itunesPreview(track.title, track.artist);
    if (url) {
      this.sendHostTrack(url);
      return;
    }
    this.nextRound();
  }

  dispose(): void {
    this.clearTimer();
    rooms.delete(this.code);
  }
}
