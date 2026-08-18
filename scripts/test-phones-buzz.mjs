import { io } from 'socket.io-client';

function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function run() {
  const host = io('http://localhost:3001');
  const p1 = io('http://localhost:3001');
  const p2 = io('http://localhost:3001');
  await Promise.all([new Promise((r)=>host.on('connect',r)), new Promise((r)=>p1.on('connect',r)), new Promise((r)=>p2.on('connect',r))]);
  console.log('connected sockets');

  host.on('room_state', (s) => console.log('host state', s.phase, 'buzzedBy', s.buzzedBy));
  p1.on('room_state', (s) => console.log('p1 state', s.phase, 'buzzedBy', s.buzzedBy));
  p2.on('room_state', (s) => console.log('p2 state', s.phase, 'buzzedBy', s.buzzedBy));

  // create room as host
  const settings = {
    themes: ['top'],
    difficulty: 'moyen',
    rounds: 1,
    clipSeconds: 6,
    hostPlays: false,
    mode: 'phones',
    teamCount: 2,
    teamNames: ['A','B'],
    audioHostEnabled: false,
    audioPlayersEnabled: false,
    buzzerEnabled: true,
  };

  host.emit('create_room', settings, (res) => {
    console.log('created', res);
    const code = res.code;
    // join p1 and p2
    p1.emit('join_room', { code, name: 'P1' }, (r) => console.log('p1 joined', r));
    p2.emit('join_room', { code, name: 'P2' }, (r) => console.log('p2 joined', r));
    // start game after a short delay
    setTimeout(()=>host.emit('start_game'), 2000);
  });

  await wait(7000);
  console.log('p1 buzzing');
  p1.emit('buzz');
  await wait(1000);
  console.log('p1 submit wrong');
  p1.emit('submit_answer', { title: 'wrong', artist: '' });

  await wait(8000);
  host.close(); p1.close(); p2.close();
}
run().catch(e=>{console.error(e);process.exit(1)});
