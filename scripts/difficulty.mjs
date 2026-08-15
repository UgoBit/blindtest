import { buildPlaylist } from '../server/dist/server/src/music.js';

const levels = await Promise.all([
  buildPlaylist(['pop'], 10, 'facile'),
  buildPlaylist(['pop'], 10, 'moyen'),
  buildPlaylist(['pop'], 10, 'difficile'),
]);
if (levels.some((tracks) => tracks.length < 3)) throw new Error('Not enough tracks for a difficulty level');
const averages = levels.map((tracks) => tracks.reduce((sum, track) => sum + track.rank, 0) / tracks.length);
if (!(averages[0] > averages[1] && averages[1] > averages[2])) {
  throw new Error(`Difficulty ordering failed: ${averages.join(', ')}`);
}
console.log('DIFFICULTY OK', averages.map((value) => Math.round(value)).join(' > '));
