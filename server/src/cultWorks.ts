/**
 * Dictionnaire et extracteur pour les thèmes cultes (Pubs, Films, Disney, Séries, Dessins animés, Jeux vidéo).
 * Ce fichier est modifiable et extensible librement pour ajouter de nouvelles œuvres et marques.
 */

export interface CultWorkEntry {
  /** Titre ou mots-clés du morceau / artiste pour la recherche */
  matcher: {
    title?: string;
    artist?: string;
    keywords?: string[];
  };
  /** Nom principal de l'œuvre (Film, Marque de pub, Disney, Série, Jeu vidéo) */
  work: string;
  /** Alias et variantes acceptés (ex: titre en anglais, diminutifs, sous-marques) */
  aliases?: string[];
  /** Catégorie de l'œuvre */
  category: 'pub' | 'films' | 'disney' | 'dessins-animes' | 'jeux-video';
}

/**
 * Dictionnaire des musiques et œuvres cultes.
 * Tu peux ajouter ici autant de lignes que tu veux !
 */
export const CULT_WORKS_DICTIONARY: CultWorkEntry[] = [
  // ==========================================
  // 📢 PUBLICITÉS & MARQUES CULTES
  // ==========================================
  {
    matcher: { title: 'Chandelier', artist: 'Sia' },
    work: 'Dior',
    aliases: ['Miss Dior', 'Jadore Dior', 'Parfum Dior'],
    category: 'pub',
  },
  {
    matcher: { title: 'Dont Stop Me Now', artist: 'Queen' },
    work: 'Peugeot',
    aliases: ['Google', 'Peugeot 208', 'Pub Peugeot'],
    category: 'pub',
  },
  {
    matcher: { title: 'I Want to Break Free', artist: 'Queen' },
    work: 'Cillit Bang',
    aliases: ['Pub Cillit Bang', 'Coca Cola'],
    category: 'pub',
  },
  {
    matcher: { title: 'Quelqu un m a dit', artist: 'Carla Bruni' },
    work: "L'Oréal",
    aliases: ['Loreal', 'Pub Loreal', 'Parce que je le vaux bien'],
    category: 'pub',
  },
  {
    matcher: { title: 'Thats Not My Name', artist: 'The Ting Tings' },
    work: 'Showroomprive',
    aliases: ['Showroomprive.com', 'Showroom prive'],
    category: 'pub',
  },
  {
    matcher: { title: '1901', artist: 'Phoenix' },
    work: 'Cadillac',
    aliases: ['Pub Cadillac', 'Playstation'],
    category: 'pub',
  },
  {
    matcher: { title: 'Ca (C est Vraiment Toi)', artist: 'Telephone' },
    work: 'Boulanger',
    aliases: ['Pub Boulanger', 'Boulanger électroménager'],
    category: 'pub',
  },
  {
    matcher: { title: 'Midnight City', artist: 'M83' },
    work: 'Renault',
    aliases: ['Renault Captur', 'Pub Renault'],
    category: 'pub',
  },
  {
    matcher: { title: 'We Will Rock You', artist: 'Queen' },
    work: 'Evian',
    aliases: ['Pub Evian', 'Pepsi', 'Evian bébés'],
    category: 'pub',
  },
  {
    matcher: { title: 'A Little Less Conversation', artist: 'Elvis Presley' },
    work: 'Nike',
    aliases: ['Pub Nike', 'Nike Football', 'Nike cage'],
    category: 'pub',
  },
  {
    matcher: { title: 'Whatever', artist: 'Oasis' },
    work: 'Coca-Cola',
    aliases: ['Coca Cola', 'Coke'],
    category: 'pub',
  },
  {
    matcher: { title: 'Seven Nation Army', artist: 'The White Stripes' },
    work: 'Renault',
    aliases: ['Pub Renault', 'Playstation'],
    category: 'pub',
  },
  {
    matcher: { title: 'Day-O (The Banana Boat Song)', artist: 'Harry Belafonte' },
    work: 'Nutella',
    aliases: ['Pub Nutella'],
    category: 'pub',
  },
  {
    matcher: { title: 'Rhapsody in Blue', artist: 'George Gershwin' },
    work: 'United Airlines',
    aliases: ['United Airlines', 'Air France'],
    category: 'pub',
  },
  {
    matcher: { title: 'Gimme Shelter', artist: 'The Rolling Stones' },
    work: 'Air France',
    aliases: ['Pub Air France'],
    category: 'pub',
  },
  {
    matcher: { title: 'As It Was', artist: 'Harry Styles' },
    work: 'Apple',
    aliases: ['AirPods', 'Pub Apple', 'iPhone'],
    category: 'pub',
  },
  {
    matcher: { title: 'Down the Road', artist: 'C2C' },
    work: 'Bouygues Telecom',
    aliases: ['Bouygues', 'Pub Bouygues'],
    category: 'pub',
  },
  {
    matcher: { title: 'Aerodynamic', artist: 'Daft Punk' },
    work: 'Audi',
    aliases: ['Pub Audi', 'Audi A3'],
    category: 'pub',
  },
  {
    matcher: { title: 'Jerk It Out', artist: 'Caesars' },
    work: 'Apple iPod',
    aliases: ['iPod', 'Apple', 'Pub iPod'],
    category: 'pub',
  },
  {
    matcher: { title: 'Flat Beat', artist: 'Mr. Oizo' },
    work: "Levi's",
    aliases: ['Levis', 'Flat Eric', 'Pub Levis'],
    category: 'pub',
  },
  {
    matcher: { title: 'Mr. Sandman', artist: 'The Chordettes' },
    work: 'Auchan',
    aliases: ['Pub Auchan'],
    category: 'pub',
  },
  {
    matcher: { title: 'You Really Got Me', artist: 'The Kinks' },
    work: 'Citroën',
    aliases: ['Citroen', 'Pub Citroen'],
    category: 'pub',
  },
  {
    matcher: { title: 'Here Comes the Sun', artist: 'The Beatles' },
    work: 'SNCF',
    aliases: ['Pub SNCF', 'Danone'],
    category: 'pub',
  },

  // ==========================================
  // 🎬 FILMS CULTES
  // ==========================================
  {
    matcher: { title: 'My Heart Will Go On', artist: 'Celine Dion' },
    work: 'Titanic',
    aliases: ['Le Titanic'],
    category: 'films',
  },
  {
    matcher: { title: 'Eye of the Tiger', artist: 'Survivor' },
    work: 'Rocky',
    aliases: ['Rocky 3', 'Rocky III', 'Rocky Balboa'],
    category: 'films',
  },
  {
    matcher: { title: 'Gonna Fly Now', artist: 'Bill Conti' },
    work: 'Rocky',
    aliases: ['Rocky 1', 'Rocky Balboa'],
    category: 'films',
  },
  {
    matcher: { title: 'Stayin Alive', artist: 'Bee Gees' },
    work: 'La Fièvre du samedi soir',
    aliases: ['Saturday Night Fever', 'La Fievre du samedi soir'],
    category: 'films',
  },
  {
    matcher: { title: 'Danger Zone', artist: 'Kenny Loggins' },
    work: 'Top Gun',
    aliases: ['Top Gun Maverick'],
    category: 'films',
  },
  {
    matcher: { title: 'Take My Breath Away', artist: 'Berlin' },
    work: 'Top Gun',
    aliases: ['Top Gun 1'],
    category: 'films',
  },
  {
    matcher: { title: 'Ghostbusters', artist: 'Ray Parker Jr.' },
    work: 'SOS Fantômes',
    aliases: ['Ghostbusters', 'SOS Fantomes'],
    category: 'films',
  },
  {
    matcher: { title: 'The Power of Love', artist: 'Huey Lewis and the News' },
    work: 'Retour vers le futur',
    aliases: ['Back to the Future', 'Retour vers le futur 1'],
    category: 'films',
  },
  {
    matcher: { title: 'What a Feeling', artist: 'Irene Cara' },
    work: 'Flashdance',
    aliases: ['Flash dance'],
    category: 'films',
  },
  {
    matcher: { title: 'Time of My Life', artist: 'Bill Medley' },
    work: 'Dirty Dancing',
    aliases: ['Dirty dance'],
    category: 'films',
  },
  {
    matcher: { title: 'Lose Yourself', artist: 'Eminem' },
    work: '8 Mile',
    aliases: ['Eight Mile', '8 miles'],
    category: 'films',
  },
  {
    matcher: { title: 'I Will Always Love You', artist: 'Whitney Houston' },
    work: 'Bodyguard',
    aliases: ['The Bodyguard', 'Le Garde du corps'],
    category: 'films',
  },
  {
    matcher: { title: 'All Star', artist: 'Smash Mouth' },
    work: 'Shrek',
    aliases: ['Shrek 1'],
    category: 'films',
  },
  {
    matcher: { title: 'I m a Believer', artist: 'Smash Mouth' },
    work: 'Shrek',
    aliases: ['Shrek 1'],
    category: 'films',
  },
  {
    matcher: { title: 'Gangsta s Paradise', artist: 'Coolio' },
    work: 'Esprits rebelles',
    aliases: ['Dangerous Minds', 'Esprits rebelle'],
    category: 'films',
  },
  {
    matcher: { title: 'Men in Black', artist: 'Will Smith' },
    work: 'Men in Black',
    aliases: ['MIB', 'Hommes en noir'],
    category: 'films',
  },
  {
    matcher: { title: 'Skyfall', artist: 'Adele' },
    work: 'James Bond',
    aliases: ['Skyfall', '007', 'James Bond Skyfall'],
    category: 'films',
  },
  {
    matcher: { title: 'No Time To Die', artist: 'Billie Eilish' },
    work: 'James Bond',
    aliases: ['007', 'Mourir peut attendre', 'No Time To Die'],
    category: 'films',
  },
  {
    matcher: { title: 'GoldenEye', artist: 'Tina Turner' },
    work: 'James Bond',
    aliases: ['007', 'Goldeneye'],
    category: 'films',
  },
  {
    matcher: { title: 'See You Again', artist: 'Wiz Khalifa' },
    work: 'Fast and Furious',
    aliases: ['Fast & Furious', 'Fast and Furious 7', 'Fast 7'],
    category: 'films',
  },
  {
    matcher: { title: 'Mrs. Robinson', artist: 'Simon & Garfunkel' },
    work: 'Le Lauréat',
    aliases: ['The Graduate', 'Le Laureat'],
    category: 'films',
  },
  {
    matcher: { title: 'You re the One That I Want', artist: 'John Travolta' },
    work: 'Grease',
    aliases: ['Grease 1'],
    category: 'films',
  },
  {
    matcher: { title: 'Misirlou', artist: 'Dick Dale' },
    work: 'Pulp Fiction',
    aliases: ['Taxi', 'Pulp Fiction / Taxi'],
    category: 'films',
  },
  {
    matcher: { title: 'Hedwig s Theme', artist: 'John Williams' },
    work: 'Harry Potter',
    aliases: ['Harry Potter à l école des sorciers'],
    category: 'films',
  },
  {
    matcher: { title: 'The Imperial March', artist: 'John Williams' },
    work: 'Star Wars',
    aliases: ['La Guerre des étoiles', 'L Empire contre attaque', 'Darth Vader'],
    category: 'films',
  },
  {
    matcher: { title: 'He s a Pirate', artist: 'Klaus Badelt' },
    work: 'Pirates des Caraïbes',
    aliases: ['Pirates of the Caribbean', 'Pirates des Caraibes', 'Jack Sparrow'],
    category: 'films',
  },

  // ==========================================
  // 🏰 DISNEY & PIXAR
  // ==========================================
  {
    matcher: { keywords: ['histoire de la vie', 'circle of life', 'lion king', 'roi lion', 'hakuna matata', 'amour brille sous les etoiles', 'je voudrais deja etre roi'] },
    work: 'Le Roi Lion',
    aliases: ['The Lion King', 'Roi Lion'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['liberee delivree', 'let it go', 'frozen', 'reine des neiges', 'je voudrais un bonhomme de neige', 'renouveau'] },
    work: 'La Reine des Neiges',
    aliases: ['Frozen', 'Reine des Neiges', 'Reine des neiges 2'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['ce reve bleu', 'whole new world', 'aladdin', 'ami comme moi', 'prince ali', 'nuits d arabie'] },
    work: 'Aladdin',
    aliases: ['Aladin'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['il en faut peu pour etre heureux', 'bare necessities', 'livre de la jungle', 'jungle book', 'etre un homme comme vous'] },
    work: 'Le Livre de la Jungle',
    aliases: ['The Jungle Book', 'Livre de la Jungle'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['sous l ocean', 'under the sea', 'petite sirene', 'little mermaid', 'partir la bas'] },
    work: 'La Petite Sirène',
    aliases: ['The Little Mermaid', 'Petite Sirene'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['histoire eternelle', 'beauty and the beast', 'belle et la bete', 'c est la fete', 'gaston'] },
    work: 'La Belle et la Bête',
    aliases: ['Beauty and the Beast', 'Belle et la Bete'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['comme un homme', 'make a man out of you', 'mulan', 'reflexion', 'une belle fille a aimer'] },
    work: 'Mulan',
    aliases: ['Mulan 1'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['bleu lumiere', 'how far i ll go', 'vaiana', 'moana', 'pour les hommes', 'shiny'] },
    work: 'Vaiana',
    aliases: ['Moana', 'Vaiana la légende du bout du monde'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['strangers like me', 'you ll be in my heart', 'tarzan', 'enfanfant de l homme', 'phil collins tarzan'] },
    work: 'Tarzan',
    aliases: ['Tarzan 1'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['de zero en heros', 'zero to hero', 'hercule', 'hercules', 'le monde qui est le mien', 'jamais je n avouerai'] },
    work: 'Hercule',
    aliases: ['Hercules'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['l air du vent', 'colors of the wind', 'pocahontas', 'des sauvages'] },
    work: 'Pocahontas',
    aliases: ['Pocahontas une légende indienne'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['ne parlons pas de bruno', 'we don t talk about bruno', 'encanto', 'famille madrigal', 'sous les apparences'] },
    work: 'Encanto',
    aliases: ['Encanto la fantastique famille Madrigal'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['ne m oublie pas', 'remember me', 'coco', 'un poco loco', 'recuerdame'] },
    work: 'Coco',
    aliases: ['Disney Coco'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['ou est la vraie vie', 'when will my life begin', 'raiponce', 'tangled', 'je veux y croire', 'moi j ai un reve'] },
    work: 'Raiponce',
    aliases: ['Tangled'],
    category: 'disney',
  },
  {
    matcher: { keywords: ['un ami qui vous veut du bien', 'friend in me', 'toy story', 'histoire de jouets', 'buzz l eclair'] },
    work: 'Toy Story',
    aliases: ['Toy Story 1', 'Toy Story 2', 'Toy Story 3'],
    category: 'disney',
  },

  // ==========================================
  // 📺 SÉRIES & DESSINS ANIMÉS CULTES
  // ==========================================
  {
    matcher: { keywords: ['un jour je serai le meilleur dresseur', 'pokemon theme', 'attrapez les tous', 'pokemon', 'gotta catch em all'] },
    work: 'Pokémon',
    aliases: ['Pokemon', 'Pocket Monsters'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['cha la head cha la', 'dragon ball', 'dbz', 'kamehameha', 'dragon ball z'] },
    work: 'Dragon Ball Z',
    aliases: ['DBZ', 'Dragon Ball', 'Dragon Ball Super'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['we are', 'one piece', 'luffy', 'straw hat'] },
    work: 'One Piece',
    aliases: ['One piece anime'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['blue bird', 'silhouette', 'naruto', 'naruto shippuden', 'sasuke'] },
    work: 'Naruto',
    aliases: ['Naruto Shippuden', 'Boruto'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['guren no yumiya', 'attack on titan', 'attaque des titans', 'shingeki no kyojin'] },
    work: "L'Attaque des Titans",
    aliases: ['Attack on Titan', 'Shingeki no Kyojin', 'SNK', 'Attaque des titans'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['i ll be there for you', 'friends theme', 'the rembrandts'] },
    work: 'Friends',
    aliases: ['Friends serie'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['game of thrones theme', 'main title game of thrones', 'ramin djawadi'] },
    work: 'Game of Thrones',
    aliases: ['GOT', 'Le Trone de Fer', 'House of the Dragon'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['stranger things theme', 'kyle dixon'] },
    work: 'Stranger Things',
    aliases: ['Stranger Things serie'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['the simpsons theme', 'danny elfman simpsons', 'les simpson'] },
    work: 'Les Simpson',
    aliases: ['The Simpsons', 'Les Simpsons', 'Simpson'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['goldorak', 'cours vers jupiter', 'bernard minet goldorak'] },
    work: 'Goldorak',
    aliases: ['Grendizer'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['olive et tom', 'ils sont toujours en forme', 'captain tsubasa'] },
    work: 'Olive et Tom',
    aliases: ['Captain Tsubasa', 'Olive et Tom champions de foot'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['mysterieuses cites d or', 'enfants du soleil', 'esteban zia tao'] },
    work: "Les Mystérieuses Cités d'Or",
    aliases: ['Mysterieuses Cites d Or', 'Les Cites d Or'],
    category: 'dessins-animes',
  },

  // ==========================================
  // 🎮 JEUX VIDÉO CULTES
  // ==========================================
  {
    matcher: { keywords: ['ground theme', 'super mario bros', 'overworld', 'mario theme', 'koji kondo mario', 'jump up super star'] },
    work: 'Super Mario',
    aliases: ['Mario', 'Super Mario Bros', 'Mario Kart', 'Super Mario Odyssey'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['zelda main theme', 'zelda', 'great fairy fountain', 'ocarina of time', 'breath of the wild', 'gerudo valley'] },
    work: 'The Legend of Zelda',
    aliases: ['Zelda', 'The Legend of Zelda Ocarina of Time', 'Breath of the Wild', 'Tears of the Kingdom'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['pokemon battle', 'lavender town', 'pokemon red', 'pokemon blue', 'pallet town', 'route 1 pokemon'] },
    work: 'Pokémon (Jeu Vidéo)',
    aliases: ['Pokemon', 'Pokemon Rouge', 'Pokemon Bleu', 'Pokémon'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['green hill zone', 'sonic theme', 'sonic the hedgehog'] },
    work: 'Sonic the Hedgehog',
    aliases: ['Sonic', 'Sonic le hérisson'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['tetris theme', 'korobeiniki', 'theme a tetris'] },
    work: 'Tetris',
    aliases: ['Jeu Tetris'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['megalovania', 'undertale', 'toby fox'] },
    work: 'Undertale',
    aliases: ['Sans Undertale', 'Undertale Game'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['one winged angel', 'sephiroth theme', 'final fantasy vii', 'nobuo uematsu', 'final fantasy theme', 'chocobo'] },
    work: 'Final Fantasy',
    aliases: ['FF7', 'Final Fantasy VII', 'Final Fantasy 7', 'FF'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['dragonborn', 'skyrim theme', 'dovahkiin', 'the elder scrolls v'] },
    work: 'Skyrim',
    aliases: ['The Elder Scrolls', 'The Elder Scrolls V Skyrim', 'TES Skyrim'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['halo theme', 'mjolnir mix', 'master chief halo', 'martin o donnell'] },
    work: 'Halo',
    aliases: ['Halo Combat Evolved', 'Halo 3', 'Halo Infinite'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['sweden c418', 'wet hands', 'minecraft theme', 'c418 minecraft'] },
    work: 'Minecraft',
    aliases: ['Jeu Minecraft'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['guile theme', 'street fighter ii', 'hadouken', 'ryu theme'] },
    work: 'Street Fighter',
    aliases: ['Street Fighter 2', 'Street Fighter II', 'SF2'],
    category: 'jeux-video',
  },
  {
    matcher: { keywords: ['gta san andreas theme', 'grand theft auto', 'san andreas theme'] },
    work: 'GTA',
    aliases: ['Grand Theft Auto', 'GTA San Andreas', 'GTA 5', 'GTA V'],
    category: 'jeux-video',
  },
];

/**
 * Nettoyage standard pour comparaison tolérante
 */
export function normalizeWorkText(value: string): string {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/^(?:the|le|la|les|l|un|une|des|a|an|el|los|las|de|du|d)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tente d'extraire automatiquement le nom de l'œuvre depuis le titre ou l'album Deezer
 * Exemples :
 * - "Libérée, délivrée (De \"La Reine des Neiges\")" -> "La Reine des Neiges"
 * - "Hedwig's Theme (From \"Harry Potter\")" -> "Harry Potter"
 * - "Titanic (Music from the Motion Picture)" -> "Titanic"
 * - "The Lion King (Original Motion Picture Soundtrack)" -> "The Lion King"
 */
export function extractWorkFromMetadata(title: string, albumTitle?: string): string | null {
  const sources = [title, albumTitle ?? ''].filter(Boolean);

  for (const src of sources) {
    // Motifs : (De "Film"), (From "Movie"), (Bande originale de "Film")
    const matchQuote = src.match(/(?:from|de|du film|de la serie|tiré de|tire de|extrait de)\s+["'«]([^"'»]+)["'»]/i);
    if (matchQuote?.[1]) return matchQuote[1].trim();

    const matchParen = src.match(/\((?:from|de|du film|de la série|de la serie|ost|soundtrack)\s+([^)]+)\)/i);
    if (matchParen?.[1]) return matchParen[1].replace(/^(?:the|le|la|les|l')\s+/i, '').trim();

    // Motifs d'albums : "Film (Original Soundtrack)", "Film (Bande Originale du Film)"
    const matchAlbumOst = src.match(/^([^([–-]+)\s*(?:\(|\[|-|–)\s*(?:original|bande originale|b\.?o\.?|soundtrack|motion picture|music from|ost)/i);
    if (matchAlbumOst?.[1] && matchAlbumOst[1].trim().length > 2) {
      return matchAlbumOst[1].trim();
    }
  }

  return null;
}

/**
 * Recherche une œuvre dans le dictionnaire ou via extraction automatique
 */
export function lookupWork(
  title: string,
  artist: string,
  albumTitle?: string,
  themeCategory?: string,
): { work: string; aliases: string[]; category: 'pub' | 'films' | 'disney' | 'dessins-animes' | 'jeux-video' } | null {
  const normTitle = normalizeWorkText(title);
  const normArtist = normalizeWorkText(artist);
  const fullText = `${normTitle} ${normArtist} ${normalizeWorkText(albumTitle ?? '')}`;

  // 1. Recherche prioritaire dans le dictionnaire
  for (const entry of CULT_WORKS_DICTIONARY) {
    const { title: eTitle, artist: eArtist, keywords: eKeywords } = entry.matcher;

    if (eTitle && eArtist) {
      const matchT = normTitle.includes(normalizeWorkText(eTitle)) || normalizeWorkText(eTitle).includes(normTitle);
      const matchA = normArtist.includes(normalizeWorkText(eArtist)) || normalizeWorkText(eArtist).includes(normArtist);
      if (matchT && matchA) {
        return {
          work: entry.work,
          aliases: entry.aliases ?? [],
          category: entry.category,
        };
      }
    }

    if (eKeywords) {
      const matchKeyword = eKeywords.some((kw) => fullText.includes(normalizeWorkText(kw)));
      if (matchKeyword) {
        return {
          work: entry.work,
          aliases: entry.aliases ?? [],
          category: entry.category,
        };
      }
    }
  }

  // 2. Extraction automatique depuis les métadonnées (album/titre)
  const extracted = extractWorkFromMetadata(title, albumTitle);
  if (extracted && extracted.length > 1) {
    let cat: 'pub' | 'films' | 'disney' | 'dessins-animes' | 'jeux-video' = 'films';
    if (themeCategory === 'disney') cat = 'disney';
    else if (themeCategory === 'jeux-video') cat = 'jeux-video';
    else if (themeCategory === 'dessins-animes') cat = 'dessins-animes';
    else if (themeCategory === 'pub') cat = 'pub';

    return {
      work: extracted,
      aliases: [],
      category: cat,
    };
  }

  return null;
}
