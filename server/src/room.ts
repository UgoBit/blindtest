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
import { answerMatches, buildPlaylist, itunesPreview, type Track } from './music.js';

type Io = Server<ClientToServerEvents, ServerToClientEvents>;

interface Member extends Player {
  socketId: string | null;
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const COUNTDOWN_MS = 3000;
const RESPONSE_TIMEOUT_MS = 25_000;

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
  teamScores: number[];
  lastActivity = Date.now();

  private io: Io;
  private timer: NodeJS.Timeout | null = null;
  private responseTimer: NodeJS.Timeout | null = null;
  private clipEndsAt = 0;
  private remainingMs = 0;
  private awarded = { title: false, artist: false };
  private submittedAnswer: { title: string; artist: string } | null = null;
  private answerVerdict: { title: boolean; artist: boolean } | null = null;
  private submittedBy: string | null = null;
  private responseDeadline: number | null = null;

  constructor(io: Io, settings: RoomSettings) {
    this.io = io;
    this.settings = settings;
    this.teamScores = Array.from({ length: settings.teamCount }, () => 0);
    rooms.set(this.code, this);
  }

  get currentTrack(): Track | null {
    return this.playlist[this.round] ?? null;
  }

  private get hostSocketId(): string | null {
    return this.hostId ? (this.players.get(this.hostId)?.socketId ?? null) : null;
  }

  private emitAudio(action: 'play' | 'pause' | 'stop'): void {
    const socketIds: string[] = [];
    const hostSocketId = this.hostSocketId;
    if (this.settings.audioHostEnabled && hostSocketId) socketIds.push(hostSocketId);
    if (this.settings.audioPlayersEnabled) {
      for (const member of this.players.values()) {
        if (!member.isHost && member.socketId) socketIds.push(member.socketId);
      }
    }
    for (const socketId of socketIds) {
      this.io.to(socketId).emit('audio', { action, at: Date.now() });
    }
  }

  addPlayer(playerId: string, name: string, socketId: string, isHost = false): Member {
    const existing = this.players.get(playerId);
    const nextTeamIndex = this.settings.mode === 'teams' && !isHost
      ? (([...this.players.values()].filter((player) => !player.isHost).length % Math.max(1, this.settings.teamCount)) + 1)
      : null;
    const member: Member = existing
      ? { ...existing, name, socketId, connected: true, team: existing.team ?? (nextTeamIndex ?? existing.team ?? null) }
      : {
          id: playerId,
          name,
          score: 0,
          connected: true,
          isHost,
          lockedOut: false,
          socketId,
          team: nextTeamIndex,
        };
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
    if (member.isHost) {
      this.resyncHost();
    } else {
      this.sendPlayerTrack(socketId);
      if (this.settings.audioPlayersEnabled && this.phase === 'listening') {
        this.io.to(socketId).emit('audio', { action: 'play', at: Date.now() });
      }
    }
    return true;
  }

  renameHost(playerId: string, name: string): boolean {
    const member = this.players.get(playerId);
    if (!member || !member.isHost || playerId !== this.hostId || this.phase !== 'lobby') return false;
    member.name = name;
    this.touch();
    this.broadcast();
    return true;
  }

  kick(playerId: string): void {
    if (playerId === this.hostId) return;
    this.players.delete(playerId);
    if (this.buzzedBy === playerId) this.buzzedBy = null;
    this.broadcast();
  }

  assignTeam(playerId: string, team: number | null): void {
    const member = this.players.get(playerId);
    if (!member) return;
    if (team === null) {
      member.team = null;
      this.touch();
      this.broadcast();
      return;
    }
    member.team = Math.min(this.settings.teamCount, Math.max(1, Number(team) || 1));
    this.touch();
    this.broadcast();
  }

  resizeTeamScores(): void {
    this.teamScores = Array.from({ length: this.settings.teamCount }, (_, index) => this.teamScores[index] ?? 0);
    this.broadcast();
  }

  canBuzz(playerId: string): boolean {
    const member = this.players.get(playerId);
    if (!member || member.lockedOut) return false;
    if (this.settings.mode === 'solo') return member.isHost;
    if (this.settings.mode === 'teams') return member.isHost ? this.settings.hostPlays : true;
    return !member.isHost;
  }

  state(): RoomState {
    const track = this.currentTrack;
    return {
      code: this.code,
      phase: this.phase,
      settings: this.settings,
      players: [...this.players.values()]
        .map(({ socketId: _socketId, ...player }) => player)
        .filter(
          (player) =>
            this.phase === 'lobby' ||
            !player.isHost ||
            this.settings.mode === 'solo' ||
            this.settings.mode === 'teams' ||
            this.settings.hostPlays,
        ),
      buzzedBy: this.buzzedBy,
      answer:
        this.phase === 'reveal' && track
          ? { title: track.title, artist: track.artist, cover: track.cover }
          : null,
      track: track ? { index: this.round + 1, total: this.playlist.length, cover: null } : null,
      round: this.round,
      teamScores: this.settings.mode === 'teams'
        ? this.teamScores.map((score, index) => ({ team: index + 1, name: this.settings.teamNames[index] ?? `Équipe ${index + 1}`, score }))
        : [],
      submittedAnswer: this.phase === 'reveal' ? this.submittedAnswer : null,
      answerVerdict: this.phase === 'reveal' ? this.answerVerdict : null,
      responseDeadline: this.phase === 'buzzed' ? this.responseDeadline : null,
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

  private clearResponseTimer(): void {
    if (this.responseTimer) clearTimeout(this.responseTimer);
    this.responseTimer = null;
    this.responseDeadline = null;
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

  private sendPlayerTrack(socketId: string, previewUrl?: string): void {
    const track = this.currentTrack;
    if (!track || !this.settings.audioPlayersEnabled) return;
    this.io.to(socketId).emit('player_track', {
      index: this.round + 1,
      total: this.playlist.length,
      cover: null,
      previewUrl: previewUrl ?? track.previewUrl,
      startAt: this.elapsedSeconds(),
    });
  }

  private sendRoundTracks(previewUrl?: string): void {
    this.sendHostTrack(previewUrl);
    if (!this.settings.audioPlayersEnabled) return;
    for (const member of this.players.values()) {
      if (!member.isHost && member.socketId) this.sendPlayerTrack(member.socketId, previewUrl);
    }
  }

  /** Restores audio on a host device that reconnected in the middle of a round. */
  resyncHost(): void {
    if (!['countdown', 'listening', 'buzzed', 'reveal'].includes(this.phase)) return;
    this.sendHostTrack();
    const socketId = this.hostSocketId;
    if (this.phase === 'listening' && socketId && this.settings.audioHostEnabled) {
      this.io.to(socketId).emit('audio', { action: 'play', at: Date.now() });
    }
  }

  async start(): Promise<void> {
    if (this.phase !== 'lobby') return;
    if (this.settings.themes.length === 0) {
      this.io.to(this.code).emit('error_message', 'Choisissez au moins un thème avant de lancer la partie.');
      return;
    }
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
    this.teamScores = Array.from({ length: this.settings.teamCount }, () => 0);
    this.round = -1;
    this.nextRound();
  }

  nextRound(): void {
    this.emitAudio('stop');
    this.clearTimer();
    this.clearResponseTimer();
    this.buzzedBy = null;
    this.awarded = { title: false, artist: false };
    this.submittedAnswer = null;
    this.answerVerdict = null;
    this.submittedBy = null;
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
    this.sendRoundTracks();

    this.timer = setTimeout(() => {
      this.phase = 'listening';
      this.remainingMs = this.settings.clipSeconds * 1000;
      this.startClock();
      this.broadcast();
      this.emitAudio('play');
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
    this.submittedBy = playerId;
    this.phase = 'buzzed';
    this.submittedAnswer = null;
    this.answerVerdict = null;
    this.responseDeadline = Date.now() + RESPONSE_TIMEOUT_MS;
    this.responseTimer = setTimeout(
      () => this.submitAnswer(playerId, { title: '', artist: '' }),
      RESPONSE_TIMEOUT_MS,
    );
    this.touch();
    this.emitAudio('pause');
    this.broadcast();
  }

  submitAnswer(playerId: string, answer: { title: string; artist: string }): void {
    if (this.phase !== 'buzzed' || !this.buzzedBy || this.buzzedBy !== playerId) return;
    const member = this.players.get(playerId);
    if (!member) return;
    this.clearResponseTimer();
    this.submittedAnswer = {
      title: answer.title.trim().slice(0, 120),
      artist: answer.artist.trim().slice(0, 120),
    };
    this.answerVerdict = {
      title:
        !!this.submittedAnswer.title &&
        answerMatches(this.submittedAnswer.title, this.currentTrack?.title ?? '', 'title'),
      artist:
        !!this.submittedAnswer.artist &&
        answerMatches(this.submittedAnswer.artist, this.currentTrack?.artist ?? '', 'artist'),
    };

    if (this.answerVerdict.title && !this.awarded.title) {
      member.score += POINTS.title;
      if (this.settings.mode === 'teams' && member.team) this.teamScores[member.team - 1] += POINTS.title;
      this.awarded.title = true;
    }
    if (this.answerVerdict.artist && !this.awarded.artist) {
      member.score += POINTS.artist;
      if (this.settings.mode === 'teams' && member.team) this.teamScores[member.team - 1] += POINTS.artist;
      this.awarded.artist = true;
    }

    if (this.answerVerdict.title || this.answerVerdict.artist) {
      this.reveal();
      return;
    }

    // Partial or wrong answer: the player is out for this track, the clip resumes.
    if (this.settings.mode === 'teams' && member.team) {
      for (const teammate of this.players.values()) {
        if (teammate.team === member.team) teammate.lockedOut = true;
      }
    } else {
      member.lockedOut = true;
    }
    this.buzzedBy = null;
    const stillPlaying = [...this.players.values()].some((p) => this.canBuzz(p.id));
    if (!stillPlaying) {
      this.reveal();
      return;
    }
    this.phase = 'listening';
    this.startClock();
    this.broadcast();
    this.emitAudio('play');
  }

  correctAnswer(field: 'title' | 'artist'): void {
    if (this.phase !== 'reveal' || !this.submittedBy || !this.submittedAnswer || !this.answerVerdict) return;
    if (this.awarded[field] || !this.submittedAnswer[field]) return;
    const member = this.players.get(this.submittedBy);
    if (!member) return;
    member.score += POINTS[field];
    if (this.settings.mode === 'teams' && member.team) this.teamScores[member.team - 1] += POINTS[field];
    this.awarded[field] = true;
    this.answerVerdict[field] = true;
    this.broadcast();
  }

  reveal(): void {
    this.clearTimer();
    this.clearResponseTimer();
    this.phase = 'reveal';
    this.buzzedBy = null;
    this.touch();
    this.emitAudio('pause');
    this.broadcast();
  }

  restart(): void {
    this.clearTimer();
    this.clearResponseTimer();
    this.phase = 'lobby';
    this.round = -1;
    this.playlist = [];
    this.buzzedBy = null;
    this.submittedAnswer = null;
    this.answerVerdict = null;
    this.submittedBy = null;
    for (const member of this.players.values()) {
      member.score = 0;
      member.lockedOut = false;
    }
    this.teamScores = Array.from({ length: this.settings.teamCount }, () => 0);
    this.broadcast();
  }

  /** Falls back to Apple previews when the host device cannot play the Deezer clip. */
  async retryPreview(): Promise<void> {
    const track = this.currentTrack;
    if (!track) return;
    const url = await itunesPreview(track.title, track.artist);
    if (url) {
      this.sendRoundTracks(url);
      return;
    }
    this.nextRound();
  }

  dispose(): void {
    this.clearTimer();
    rooms.delete(this.code);
  }

  /** Close the room: notify clients, disconnect sockets and remove from registry. */
  close(): void {
    this.clearTimer();
    try {
      this.io.to(this.code).emit('room_closed');
      for (const member of this.players.values()) {
        if (!member.socketId) continue;
        // Try to get the socket instance and disconnect it.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const socket = (this.io as any).sockets?.sockets?.get?.(member.socketId as string);
        if (socket && typeof socket.disconnect === 'function') {
          try {
            socket.disconnect(true);
          } catch {
            // ignore
          }
        }
      }
    } finally {
      rooms.delete(this.code);
    }
  }
}
