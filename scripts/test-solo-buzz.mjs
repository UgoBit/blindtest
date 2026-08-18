import { io } from 'socket.io-client';

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function run() {
  const socket = io('http://localhost:3001');
  await new Promise((res) => socket.on('connect', res));
  console.log('connected as client', socket.id);

  socket.on('room_state', (s) => {
    console.log('room_state', { phase: s.phase, buzzedBy: s.buzzedBy, remainingSeconds: s.remainingSeconds });
  });
  socket.on('host_track', (t) => console.log('host_track', t));

  // create room as host
  const settings = {
    themes: ['top'],
    difficulty: 'moyen',
    rounds: 1,
    clipSeconds: 6,
    hostPlays: true,
    mode: 'solo',
    teamCount: 2,
    teamNames: ['A','B'],
    audioHostEnabled: false,
    audioPlayersEnabled: false,
    buzzerEnabled: true,
  };

  socket.emit('create_room', settings, (res) => {
    if (!res.ok) { console.error('create_room failed', res); process.exit(1); }
    console.log('room created', res.code, res.playerId);
    // start game
    socket.emit('start_game');
  });

  // wait for listening
  await wait(5_000);
  console.log('Attempting buzz');
  socket.emit('buzz');

  await wait(1000);
  // send partial answer: title only
  console.log('Submitting partial answer');
  socket.emit('submit_answer', { title: 'iff', artist: '' });

  // wait some seconds to observe behavior
  await wait(8000);
  console.log('done');
  socket.close();
}

run().catch((e) => { console.error(e); process.exit(1); });
