import { answerMatches, normalizeAnswer } from '../server/dist/server/src/music.js';

const cases = [
  ['accent', answerMatches('Beyonce', 'Beyoncé', 'artist')],
  ['typo', answerMatches('Bohemian Rhapsoddy', 'Bohemian Rhapsody', 'title')],
  ['article', answerMatches('Beatles', 'The Beatles', 'artist')],
  ['feat Daft Punk', answerMatches('Daft Punk', 'Daft Punk feat. Pharrell Williams', 'artist')],
  ['feat Pharrell', answerMatches('Pharrell Williams', 'Daft Punk feat. Pharrell Williams', 'artist')],
  ['feat Dua Lipa', answerMatches('Dua Lipa', 'Calvin Harris & Dua Lipa', 'artist')],
  ['version', answerMatches('Billie Jean', 'Billie Jean - Remastered 2008', 'title')],
  ['partial artist', answerMatches('beatles', 'The Beatles', 'artist')],
  
  // New lenient artist tests
  ['surname Goldman', answerMatches('Goldman', 'Jean-Jacques Goldman', 'artist')],
  ['surname Jackson', answerMatches('Jackson', 'Michael Jackson', 'artist')],
  ['firstname Michael', answerMatches('Michael', 'Michael Jackson', 'artist')],
  ['surname Bowie', answerMatches('Bowie', 'David Bowie', 'artist')],
  ['surname Hallyday', answerMatches('Hallyday', 'Johnny Hallyday', 'artist')],
  ['surname Halliday typo', answerMatches('Halliday', 'Johnny Hallyday', 'artist')],
  ['firstname Johnny', answerMatches('Johnny', 'Johnny Hallyday', 'artist')],
  ['surname Dion', answerMatches('Dion', 'Céline Dion', 'artist')],
  ['prefix DJ Snake', answerMatches('Snake', 'DJ Snake', 'artist')],
  ['prefix Dr Dre', answerMatches('Dre', 'Dr. Dre', 'artist')],
  ['prefix Lil Wayne', answerMatches('Wayne', 'Lil Wayne', 'artist')],
  ['prefix Maitre Gims', answerMatches('Gims', 'Maître Gims', 'artist')],
  ['short artist U2', answerMatches('U2', 'U2', 'artist')],
  ['short artist IAM', answerMatches('IAM', 'IAM', 'artist')],
  ['short artist NTM', answerMatches('NTM', 'Suprême NTM', 'artist')],
  ['short artist Sia', answerMatches('Sia', 'Sia', 'artist')],
  ['acronym RHCP', answerMatches('RHCP', 'Red Hot Chili Peppers', 'artist')],
  ['acronym ACDC', answerMatches('ACDC', 'AC/DC', 'artist')],
  ['acronym SOAD', answerMatches('SOAD', 'System of a Down', 'artist')],
  ['acronym BEP', answerMatches('BEP', 'The Black Eyed Peas', 'artist')],
  ['typo Avicii -> Avici', answerMatches('Avici', 'Avicii', 'artist')],
  ['typo Britney -> Britny', answerMatches('Britny', 'Britney Spears', 'artist')],
  ['typo Eminem -> Eminene', answerMatches('Eminene', 'Eminem', 'artist')],
  ['typo Pharrell -> Farell', answerMatches('Farell', 'Pharrell Williams', 'artist')],

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

console.log(`ANSWER MATCHER OK (${cases.length} cas validés avec succès)`);
