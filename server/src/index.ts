import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import type {
  ClientToServerEvents,
  Difficulty,
  RoomSettings,
  ServerToClientEvents,
} from '../../shared/types.js';
import { DIFFICULTIES } from '../../shared/types.js';
import { publicThemes, THEME_BY_ID } from './themes.js';
import { Room, rooms } from './room.js';

const PORT = Number(process.env.PORT ?? 3001);
const ROOM_TTL_MS = 6 * 60 * 60 * 1000;

const app = express();
const httpServer = createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: { origin: true },
});

app.get('/api/themes', (_req, res) => {
  res.json(publicThemes);
});

app.get('/api/rooms/:code', (req, res) => {
  const room = rooms.get(req.params.code.toUpperCase());
  if (!room) {
    res.status(404).json({ error: 'Room introuvable' });
    return;
  }
  res.json({ code: room.code, phase: room.phase, players: room.players.size });
});

const here = fileURLToPath(new URL('.', import.meta.url));
// Works both from src (tsx) and from the compiled dist/server/src output.
const candidates = [
  path.resolve(here, '../../client/dist'),
  path.resolve(here, '../../../../client/dist'),
];
const clientDist = candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
app.use(express.static(clientDist));
app.get(/^(?!\/api|\/socket\.io).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

function sanitizeSettings(input: Partial<RoomSettings>): RoomSettings {
  const themes = (input.themes ?? []).filter((id) => THEME_BY_ID.has(id));
  const yearRanges = Array.isArray(input.yearRanges) ? input.yearRanges.filter((y) => typeof y === 'string') : [];
  const genres = Array.isArray(input.genres) ? input.genres.filter((g) => typeof g === 'string') : [];
  const difficulty: Difficulty = DIFFICULTIES.some((d) => d.id === input.difficulty)
    ? (input.difficulty as Difficulty)
    : 'mixte';
  const mode: RoomSettings['mode'] =
    input.mode === 'solo' || input.mode === 'teams' || input.mode === 'course' ? input.mode : 'phones';
  const teamCount = Math.min(8, Math.max(2, Math.round(input.teamCount ?? 2)));
  const sanitizedNames = Array.from({ length: teamCount }, (_, index) => {
    const provided = input.teamNames?.[index]?.trim();
    return provided && provided.length > 0 ? provided.slice(0, 20) : `Équipe ${index + 1}`;
  });
  const hostPlays = mode === 'solo' || input.hostPlays === true;
  const requestedHostAudio = input.audioHostEnabled !== false;
  const audioPlayersEnabled = input.audioPlayersEnabled === true;
  return {
    themes: themes.slice(0, 12),
    yearRanges,
    genres,
    difficulty,
    rounds: Math.min(30, Math.max(1, Math.round(input.rounds ?? 10))),
    clipSeconds: Math.min(30, Math.max(5, Math.round(input.clipSeconds ?? 30))),
    mode,
    teamCount,
    teamNames: sanitizedNames,
    hostPlays,
    audioHostEnabled: requestedHostAudio || !audioPlayersEnabled,
    audioPlayersEnabled,
    // Playing without a buzzer only makes sense when a single screen listens.
    buzzerEnabled: mode === 'solo' ? input.buzzerEnabled !== false : true,
  };
}

function sanitizePlayerName(name: string, fallback: string): string {
  return name.trim().slice(0, 16) || fallback;
}

io.on('connection', (socket) => {
  let roomCode: string | null = null;
  let playerId: string | null = null;

  const room = () => (roomCode ? (rooms.get(roomCode) ?? null) : null);
  const isHost = () => {
    const current = room();
    return !!current && !!playerId && current.hostId === playerId;
  };

  socket.on('create_room', (settings, ack) => {
    const created = new Room(io, sanitizeSettings(settings));
    playerId = randomUUID();
    roomCode = created.code;
    created.addPlayer(playerId, 'Sur place', socket.id, true);
    socket.join(created.code);
    ack({ ok: true, code: created.code, playerId });
    created.broadcast();
  });

  socket.on('join_room', ({ code, name, playerId: knownId }, ack) => {
    const target = rooms.get(code.toUpperCase());
    if (!target) {
      ack({ ok: false, error: 'Aucune partie avec ce code' });
      return;
    }
    const cleanName = sanitizePlayerName(name, 'Joueur');
    const rejoining = knownId ? target.players.get(knownId) : undefined;
    if (!rejoining && target.phase !== 'lobby') {
      ack({ ok: false, error: 'La partie a déjà commencé' });
      return;
    }
    playerId = rejoining?.id ?? knownId ?? randomUUID();
    roomCode = target.code;
    target.addPlayer(playerId, rejoining?.isHost ? rejoining.name : cleanName, socket.id, !!rejoining?.isHost);
    socket.join(target.code);
    ack({ ok: true, playerId });
    target.broadcast();
    if (rejoining) target.resyncPlayer(playerId, socket.id);
  });

  socket.on('update_settings', (settings) => {
    const current = room();
    if (!current || !isHost() || current.phase !== 'lobby') return;
    current.settings = sanitizeSettings({ ...current.settings, ...settings });
    current.resizeTeamScores();
    current.broadcast();
  });

  socket.on('rename_team', (name) => {
    const current = room();
    if (!current || !isHost() || current.phase !== 'lobby' || !playerId) return;
    current.renameHost(playerId, sanitizePlayerName(name, 'Sur place'));
  });

  socket.on('assign_team', ({ playerId: target, team }) => {
    const current = room();
    if (!current || current.phase !== 'lobby' || !target || !playerId) return;
    if (!isHost() && target !== playerId) return;
    current.assignTeam(target, team);
  });

  socket.on('start_game', () => {
    if (!isHost()) return;
    void room()?.start();
  });

  socket.on('buzz', () => {
    if (playerId) room()?.buzz(playerId);
  });

  socket.on('submit_answer', ({ title, artist }) => {
    if (playerId) room()?.submitAnswer(playerId, { title, artist });
  });

  socket.on('correct_answer', ({ field, playerId: target }) => {
    if (isHost()) room()?.correctAnswer(field, target);
  });

  socket.on('skip', () => {
    if (isHost()) room()?.reveal();
  });

  socket.on('next_round', () => {
    if (isHost()) room()?.nextRound();
  });

  socket.on('restart', () => {
    if (isHost()) room()?.restart();
  });

  socket.on('close_room', () => {
    if (!isHost()) return;
    const current = room();
    if (!current) return;
    io.to(current.code).emit('error_message', "La partie a été annulée par l'hôte.");
    current.close();
  });

  socket.on('preview_failed', () => {
    const current = room();
    if (!current) return;
    if (isHost()) {
      void current.retryPreview();
      return;
    }
    const member = playerId ? current.players.get(playerId) : undefined;
    const playerCanRetry =
      member &&
      !member.isHost &&
      current.settings.audioPlayersEnabled &&
      !current.settings.audioHostEnabled &&
      ['countdown', 'listening', 'buzzed'].includes(current.phase);
    if (playerCanRetry) void current.retryPreview();
  });

  socket.on('resync', () => {
    if (playerId) room()?.resyncPlayer(playerId, socket.id);
  });

  socket.on('kick', (target) => {
    if (isHost()) room()?.kick(target);
  });

  socket.on('disconnect', () => {
    room()?.removeSocket(socket.id);
  });
});

setInterval(() => {
  for (const room of rooms.values()) {
    if (Date.now() - room.lastActivity > ROOM_TTL_MS) room.dispose();
  }
}, 10 * 60 * 1000);

httpServer.listen(PORT, () => {
  console.log(`Blindtest server listening on http://localhost:${PORT}`);
});
