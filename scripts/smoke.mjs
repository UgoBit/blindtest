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

players[0].socket.emit('submit_answer', { title: track.title, artist: track.artist });
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

const absenceHost = connect();
await wait(absenceHost, 'connect');
const absenceRoom = await new Promise((resolve) =>
  absenceHost.emit(
    'create_room',
    { themes: ['top'], difficulty: 'facile', rounds: 2, clipSeconds: 10, hostPlays: false },
    resolve,
  ),
);
const absencePlayers = [];
for (const name of ['Buzzer', 'Autre']) {
  const socket = connect();
  await wait(socket, 'connect');
  const res = await new Promise((resolve) =>
    socket.emit('join_room', { code: absenceRoom.code, name }, resolve),
  );
  if (!res.ok) throw new Error(res.error);
  absencePlayers.push({ socket, id: res.playerId });
}
const absenceTrackPromise = wait(absenceHost, 'host_track');
absenceHost.emit('start_game');
await absenceTrackPromise;
await wait(absencePlayers[0].socket, 'room_state', (state) => state.phase === 'listening');
absencePlayers[0].socket.emit('buzz');
await wait(absenceHost, 'room_state', (state) => state.phase === 'buzzed');
const resumedAfterKick = wait(absenceHost, 'room_state', (state) => state.phase === 'listening');
absenceHost.emit('kick', absencePlayers[0].id);
await resumedAfterKick;
console.log('kicked buzzer resumed listening');
for (const player of absencePlayers) player.socket.close();
absenceHost.close();

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
      audioHostEnabled: false,
      audioPlayersEnabled: true,
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
const playerTrackPromise = wait(teamPlayers[0].socket, 'player_track');
let hostAudioCommand = false;
teamHost.on('audio', () => {
  hostAudioCommand = true;
});
teamHost.emit('start_game');
const teamTrack = await teamTrackPromise;
const playerTrack = await playerTrackPromise;
if (!playerTrack.previewUrl.startsWith('http')) throw new Error('player preview url missing');
if (typeof playerTrack.startAt !== 'number') throw new Error('player startAt missing');
if ('title' in playerTrack || 'artist' in playerTrack || playerTrack.cover !== null) {
  throw new Error('private fields leaked in player_track');
}
await wait(teamPlayers[0].socket, 'room_state', (state) => state.phase === 'listening');
await new Promise((resolve) => setTimeout(resolve, 3500));
if (hostAudioCommand) throw new Error('arbitrating host received a player-output audio command');
const privateState = await new Promise((resolve) => {
  teamPlayers[0].socket.once('room_state', resolve);
  teamPlayers[0].socket.emit('resync');
});
if (
  privateState.answer !== null ||
  privateState.submittedAnswer !== null ||
  privateState.answerVerdict !== null ||
  privateState.track?.cover !== null
) {
  throw new Error('team player answer leaked before reveal');
}
const resyncPlayerTrackPromise = wait(teamPlayers[0].socket, 'player_track');
teamPlayers[0].socket.emit('resync');
const resyncPlayerTrack = await resyncPlayerTrackPromise;
if (resyncPlayerTrack.index !== playerTrack.index || typeof resyncPlayerTrack.startAt !== 'number') {
  throw new Error('player track resync mismatch');
}
console.log('player audio track and resync ok');
const fallbackTrackPromise = wait(teamPlayers[0].socket, 'player_track');
teamPlayers[0].socket.emit('preview_failed');
await fallbackTrackPromise;
console.log('player preview fallback ok');

teamPlayers[0].socket.emit('buzz');
const wrongBuzz = await wait(teamHost, 'room_state', (state) => state.phase === 'buzzed');
if (wrongBuzz.buzzedBy !== teamPlayers[0].id) throw new Error('team player A did not win the buzz');
teamPlayers[0].socket.emit('submit_answer', { title: 'Réponse totalement fausse', artist: 'Artiste inconnu' });
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
teamPlayers[2].socket.emit('submit_answer', { title: teamTrack.title, artist: 'Artiste inconnu' });
const teamReveal = await wait(teamHost, 'room_state', (state) => state.phase === 'reveal');
const winningTeam = teamReveal.teamScores.find((team) => team.team === 2);
const losingTeam = teamReveal.teamScores.find((team) => team.team === 1);
if (winningTeam?.score !== 1) throw new Error(`expected team B score 1, got ${winningTeam?.score}`);
if (losingTeam?.score !== 0) throw new Error(`expected team A score 0, got ${losingTeam?.score}`);
console.log('team scoring ok:', teamReveal.teamScores.map((team) => `${team.name}=${team.score}`).join(' '));
const correctionPromise = wait(teamHost, 'room_state', (state) =>
  state.phase === 'reveal' && state.answerVerdict?.artist === true,
);
teamHost.emit('correct_answer', { field: 'artist' });
const correctedTeamReveal = await correctionPromise;
if (correctedTeamReveal.teamScores.find((team) => team.team === 2)?.score !== 2) {
  throw new Error('host correction did not credit the missing artist point');
}
console.log('host correction ok');

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

const hostOnlyHost = connect();
await wait(hostOnlyHost, 'connect');
const hostOnlyRoom = await new Promise((resolve) =>
  hostOnlyHost.emit(
    'create_room',
    { themes: ['top'], difficulty: 'facile', rounds: 1, clipSeconds: 10, hostPlays: false },
    resolve,
  ),
);
const hostOnlyPlayer = connect();
await wait(hostOnlyPlayer, 'connect');
const hostOnlyJoin = await new Promise((resolve) =>
  hostOnlyPlayer.emit('join_room', { code: hostOnlyRoom.code, name: 'Sans son' }, resolve),
);
if (!hostOnlyJoin.ok) throw new Error(hostOnlyJoin.error);
let unexpectedPlayerTrack = false;
hostOnlyPlayer.on('player_track', () => {
  unexpectedPlayerTrack = true;
});
const hostOnlyTrackPromise = wait(hostOnlyHost, 'host_track');
hostOnlyHost.emit('start_game');
const hostOnlyTrack = await hostOnlyTrackPromise;
let unexpectedHostRetry = false;
const onUnexpectedHostRetry = (nextTrack) => {
  if (nextTrack.index === hostOnlyTrack.index) unexpectedHostRetry = true;
};
hostOnlyHost.on('host_track', onUnexpectedHostRetry);
hostOnlyPlayer.emit('preview_failed');
await new Promise((resolve) => setTimeout(resolve, 500));
if (unexpectedPlayerTrack) throw new Error('player received preview in host output mode');
if (unexpectedHostRetry) throw new Error('player retried preview while host output was active');
console.log('host-only audio privacy ok');
hostOnlyPlayer.close();
hostOnlyHost.close();

const noThemeHost = connect();
await wait(noThemeHost, 'connect');
const noThemeRoom = await new Promise((resolve) =>
  noThemeHost.emit(
    'create_room',
    { themes: [], difficulty: 'facile', rounds: 1, clipSeconds: 10, hostPlays: false },
    resolve,
  ),
);
if (!noThemeRoom.ok) throw new Error(noThemeRoom.error);
const noThemeError = wait(noThemeHost, 'error_message');
noThemeHost.emit('start_game');
const noThemeMessage = await noThemeError;
if (noThemeMessage !== 'Choisissez au moins un thème avant de lancer la partie.') {
  throw new Error(`unexpected no-theme error: ${noThemeMessage}`);
}
console.log('empty theme start rejected');
noThemeHost.close();

const courseHost = connect();
await wait(courseHost, 'connect');
const courseRoom = await new Promise((resolve) =>
  courseHost.emit(
    'create_room',
    {
      mode: 'course',
      themes: ['top'],
      difficulty: 'facile',
      rounds: 1,
      clipSeconds: 10,
      hostPlays: false,
      audioHostEnabled: true,
    },
    resolve,
  ),
);
const coursePlayers = [];
for (const name of ['Course 1', 'Course 2']) {
  const socket = connect();
  await wait(socket, 'connect');
  const res = await new Promise((resolve) =>
    socket.emit('join_room', { code: courseRoom.code, name }, resolve),
  );
  if (!res.ok) throw new Error(res.error);
  coursePlayers.push({ socket, id: res.playerId });
}
const courseAudioEvents = [];
courseHost.on('audio', (event) => courseAudioEvents.push(event));
const courseTrackPromise = wait(courseHost, 'host_track');
courseHost.emit('start_game');
const courseTrack = await courseTrackPromise;
const courseListening = await wait(coursePlayers[0].socket, 'room_state', (state) => state.phase === 'listening');
if (courseListening.raceAnswers.length !== 0) throw new Error('course answer leaked during listening');
coursePlayers[0].socket.emit('buzz');
coursePlayers[1].socket.emit('buzz');
const bothRacers = await wait(courseHost, 'room_state', (state) => state.phase === 'listening' && state.racers.length === 2);
if (bothRacers.raceAnswers.length !== 0) throw new Error('course answer leaked after buzzes');
if (courseAudioEvents.some((event) => event.action === 'pause')) {
  throw new Error('course audio paused after a buzz');
}
coursePlayers[0].socket.emit('submit_answer', { title: courseTrack.title, artist: courseTrack.artist });
coursePlayers[1].socket.emit('submit_answer', { title: 'Réponse totalement fausse', artist: 'Artiste inconnu' });
const courseReveal = await wait(courseHost, 'room_state', (state) => state.phase === 'reveal');
if (courseReveal.raceAnswers.length !== 2) throw new Error('course did not collect both answers');
const courseCorrect = courseReveal.players.find((player) => player.id === coursePlayers[0].id);
const courseWrong = courseReveal.players.find((player) => player.id === coursePlayers[1].id);
if (courseCorrect?.score !== 3) throw new Error(`expected course player 1 score 3, got ${courseCorrect?.score}`);
if (courseWrong?.score !== 0 || !courseWrong.lockedOut) throw new Error('course wrong answer was not locked with zero points');
const courseAnswerCount = courseReveal.raceAnswers.length;
const duplicateCourseStatePromise = wait(coursePlayers[0].socket, 'room_state', (state) => state.phase === 'reveal');
coursePlayers[0].socket.emit('submit_answer', { title: courseTrack.title, artist: courseTrack.artist });
coursePlayers[0].socket.emit('resync');
const duplicateCourseState = await duplicateCourseStatePromise;
if (duplicateCourseState.raceAnswers.length !== courseAnswerCount || duplicateCourseState.players.find((player) => player.id === coursePlayers[0].id)?.score !== 3) {
  throw new Error('course duplicate answer changed the score');
}
const courseCorrectionPromise = wait(courseHost, 'room_state', (state) =>
  state.phase === 'reveal' && state.raceAnswers.find((answer) => answer.playerId === coursePlayers[1].id)?.verdict.title === true,
);
courseHost.emit('correct_answer', { field: 'title', playerId: coursePlayers[1].id });
const correctedCourseReveal = await courseCorrectionPromise;
const correctedCourseWrong = correctedCourseReveal.players.find((player) => player.id === coursePlayers[1].id);
if (correctedCourseWrong?.score !== 1) throw new Error(`expected corrected course score 1, got ${correctedCourseWrong?.score}`);
courseHost.emit('correct_answer', { field: 'title', playerId: coursePlayers[1].id });
const idempotentCorrectionPromise = wait(courseHost, 'room_state', (state) => state.phase === 'reveal');
courseHost.emit('resync');
const idempotentCorrection = await idempotentCorrectionPromise;
if (idempotentCorrection.players.find((player) => player.id === coursePlayers[1].id)?.score !== 1) {
  throw new Error('course correction was not idempotent');
}
console.log('course mode scoring and privacy ok');
for (const player of coursePlayers) player.socket.close();
courseHost.close();

const soloHost = connect();
await wait(soloHost, 'connect');
const soloRoom = await new Promise((resolve) =>
  soloHost.emit(
    'create_room',
    {
      mode: 'solo',
      buzzerEnabled: false,
      themes: ['top'],
      difficulty: 'facile',
      rounds: 1,
      clipSeconds: 5,
    },
    resolve,
  ),
);
const soloTrackPromise = wait(soloHost, 'host_track');
soloHost.emit('start_game');
await soloTrackPromise;
let soloLatestState = await wait(soloHost, 'room_state', (state) => state.phase === 'listening');
soloHost.on('room_state', (state) => {
  soloLatestState = state;
});
soloHost.emit('buzz');
await new Promise((resolve) => setTimeout(resolve, 100));
if (soloLatestState.phase !== 'listening' || soloLatestState.buzzedBy !== null) {
  throw new Error('solo buzzer was not ignored');
}
const soloReveal = await wait(soloHost, 'room_state', (state) => state.phase === 'reveal');
const soloMember = soloReveal.players.find((player) => player.isHost);
if (soloReveal.buzzedBy !== null || soloMember?.score !== 0) {
  throw new Error('solo no-buzzer round did not reveal with zero score');
}
console.log('solo no-buzzer mode ok');
soloHost.close();

console.log('SMOKE OK');
process.exit(0);
