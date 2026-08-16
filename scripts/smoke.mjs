// End-to-end smoke test: host + two players, one full round with a buzz.
import { io } from 'socket.io-client';

const URL = process.env.URL ?? 'http://localhost:3001';
const connect = () => io(URL, { transports: ['websocket'] });
const wait = (socket, event, predicate = () => true) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`timeout waiting for ${event}`)), 20000);
    const handler = (payload) => {
      if (!predicate(payload)) return;
      clearTimeout(timer);
      socket.off(event, handler);
      resolve(payload);
    };
    socket.on(event, handler);
  });

const host = connect();
await wait(host, 'connect');
const created = await new Promise((resolve) =>
  host.emit('create_room', { themes: ['top', 'annees80'], difficulty: 'facile', rounds: 3, clipSeconds: 10, hostPlays: false }, resolve),
);
console.log('room created', created.code);

const players = [];
for (const name of ['Ugo', 'Marie']) {
  const socket = connect();
  await wait(socket, 'connect');
  const res = await new Promise((resolve) => socket.emit('join_room', { code: created.code, name }, resolve));
  if (!res.ok) throw new Error(res.error);
  players.push({ name, socket, id: res.playerId });
}
console.log('players joined');

const trackPromise = wait(host, 'host_track');
host.emit('start_game');
const track = await trackPromise;
console.log('track:', track.title, '—', track.artist, '| preview', track.previewUrl.slice(0, 60));
if (!track.previewUrl.startsWith('http')) throw new Error('no preview url');

await wait(players[0].socket, 'room_state', (state) => state.phase === 'listening');
players[0].socket.emit('buzz');
players[1].socket.emit('buzz');
const buzzed = await wait(host, 'room_state', (state) => state.phase === 'buzzed');
if (buzzed.buzzedBy !== players[0].id) throw new Error('wrong buzzer won the race');
console.log('buzz locked by', players[0].name);

host.emit('judge', { title: true, artist: true });
const reveal = await wait(host, 'room_state', (state) => state.phase === 'reveal');
const scored = reveal.players.find((p) => p.id === players[0].id);
if (scored.score !== 2) throw new Error(`expected 2 points, got ${scored.score}`);
if (reveal.answer.title !== track.title) throw new Error('answer mismatch');
console.log('scoring ok:', reveal.players.map((p) => `${p.name}=${p.score}`).join(' '));

// A player state must never leak the answer or the audio url.
const leaked = JSON.stringify(reveal.players) + JSON.stringify(reveal.track);
if (leaked.includes(track.previewUrl)) throw new Error('preview url leaked to players');

host.emit('next_round');
await wait(host, 'room_state', (state) => state.phase === 'countdown' && state.round === 1);
host.emit('skip');
host.emit('next_round');
await wait(host, 'room_state', (state) => state.round === 2);
host.emit('skip');
host.emit('next_round');
const finished = await wait(host, 'room_state', (state) => state.phase === 'finished');
console.log('finished, final scores:', finished.players.map((p) => `${p.name}=${p.score}`).join(' '));

for (const player of players) player.socket.close();
host.close();

const teamHost = connect();
await wait(teamHost, 'connect');
const teamRoom = await new Promise((resolve) =>
  teamHost.emit(
    'create_room',
    {
      themes: ['top', 'annees80'],
      difficulty: 'facile',
      rounds: 3,
      clipSeconds: 10,
      hostPlays: false,
      mode: 'teams',
      teamCount: 2,
      teamNames: ['Les Bleus', 'Les Rouges'],
    },
    resolve,
  ),
);
const teamPlayers = [];
for (const name of ['Alice', 'Chloé', 'Bastien']) {
  const socket = connect();
  await wait(socket, 'connect');
  const res = await new Promise((resolve) =>
    socket.emit('join_room', { code: teamRoom.code, name }, resolve),
  );
  if (!res.ok) throw new Error(res.error);
  teamPlayers.push({ name, socket, id: res.playerId });
}
teamHost.emit('assign_team', { playerId: teamPlayers[0].id, team: 1 });
teamHost.emit('assign_team', { playerId: teamPlayers[1].id, team: 1 });
teamHost.emit('assign_team', { playerId: teamPlayers[2].id, team: 2 });
await wait(teamPlayers[0].socket, 'room_state', (state) =>
  state.phase === 'lobby' &&
  state.players
    .filter((player) => !player.isHost)
    .every((player) => player.team !== null && player.team !== undefined),
);

const teamTrackPromise = wait(teamHost, 'host_track');
teamHost.emit('start_game');
await teamTrackPromise;
await wait(teamPlayers[0].socket, 'room_state', (state) => state.phase === 'listening');
const privateState = await new Promise((resolve) => {
  teamPlayers[0].socket.once('room_state', resolve);
  teamPlayers[0].socket.emit('resync');
});
if (privateState.answer !== null || privateState.track?.cover !== null) {
  throw new Error('team player answer leaked before reveal');
}

teamPlayers[0].socket.emit('buzz');
const wrongBuzz = await wait(teamHost, 'room_state', (state) => state.phase === 'buzzed');
if (wrongBuzz.buzzedBy !== teamPlayers[0].id) throw new Error('team player A did not win the buzz');
teamHost.emit('judge', { title: false, artist: false });
const afterWrong = await wait(teamHost, 'room_state', (state) => state.phase === 'listening');
const alice = afterWrong.players.find((player) => player.id === teamPlayers[0].id);
const chloe = afterWrong.players.find((player) => player.id === teamPlayers[1].id);
const bastien = afterWrong.players.find((player) => player.id === teamPlayers[2].id);
if (!alice.lockedOut || !chloe.lockedOut) throw new Error('entire team A was not locked out');
if (bastien.lockedOut) throw new Error('other team was incorrectly locked out');
console.log('team elimination ok');

teamPlayers[2].socket.emit('buzz');
const rightBuzz = await wait(teamHost, 'room_state', (state) => state.phase === 'buzzed');
if (rightBuzz.buzzedBy !== teamPlayers[2].id) throw new Error('team player B could not buzz');
teamHost.emit('judge', { title: true, artist: true });
const teamReveal = await wait(teamHost, 'room_state', (state) => state.phase === 'reveal');
const winningTeam = teamReveal.teamScores.find((team) => team.team === 2);
const losingTeam = teamReveal.teamScores.find((team) => team.team === 1);
if (winningTeam?.score !== 2) throw new Error(`expected team B score 2, got ${winningTeam?.score}`);
if (losingTeam?.score !== 0) throw new Error(`expected team A score 0, got ${losingTeam?.score}`);
console.log('team scoring ok:', teamReveal.teamScores.map((team) => `${team.name}=${team.score}`).join(' '));

const countdownPromise = wait(teamHost, 'room_state', (state) => state.phase === 'countdown' && state.round === 1);
teamHost.emit('next_round');
await countdownPromise;
const nextTeamRoundPromise = wait(teamHost, 'room_state', (state) => state.phase === 'listening');
teamHost.emit('skip');
teamHost.emit('next_round');
const nextTeamRound = await nextTeamRoundPromise;
if (nextTeamRound.players.some((player) => player.lockedOut)) throw new Error('team locks were not reset');
console.log('team round reset ok');

for (const player of teamPlayers) player.socket.close();
teamHost.close();
console.log('SMOKE OK');
process.exit(0);
