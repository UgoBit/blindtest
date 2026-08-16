import { answerMatches, normalizeAnswer } from '../server/dist/server/src/music.js';

const cases = [
  ['accent', answerMatches('Beyonce', 'Beyoncé', 'artist')],
  ['typo', answerMatches('Bohemian Rhapsoddy', 'Bohemian Rhapsody', 'title')],
  ['article', answerMatches('Beatles', 'The Beatles', 'artist')],
  ['feat', answerMatches('Daft Punk feat. Pharrell Williams', 'Daft Punk', 'artist')],
  ['version', answerMatches('Billie Jean', 'Billie Jean - Remastered 2008', 'title')],
  ['partial artist', answerMatches('beatles', 'The Beatles', 'artist')],
  ['other title', !answerMatches('Africa', 'Thriller', 'title')],
  ['other artist', !answerMatches('ABBA', 'The Beatles', 'artist')],
  ['short input', !answerMatches('a', 'Africa', 'title')],
  ['empty input', !answerMatches('', 'Africa', 'title')],
];

for (const [label, passed] of cases) {
  if (!passed) throw new Error(`answer matcher failed: ${label}`);
}

if (normalizeAnswer("L'été - Live (Remastered)") !== 'ete') {
  throw new Error('answer normalization failed');
}

console.log(`ANSWER MATCHER OK (${cases.length} cas)`);
