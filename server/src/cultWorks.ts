/**
 * Dictionnaire et extracteur pour les thèmes cultes (Pubs, Films, Disney, Séries, Dessins animés, Animés, Jeux vidéo).
 * Ce fichier est modifiable et extensible librement pour ajouter de nouvelles œuvres et marques.
 */

export interface CultWorkEntry {
  /** Titre ou mots-clés du morceau / artiste pour la recherche */
  matcher: {
    title?: string;
    artist?: string;
    keywords?: string[];
  };
  /** Nom principal de l'œuvre (Film, Marque de pub, Disney, Série, Dessin animé, Animé, Jeu vidéo) */
  work: string;
  /** Alias et variantes acceptés (ex: titre en anglais, diminutifs, sous-marques) */
  aliases?: string[];
  /** Catégorie de l'œuvre */
  category: 'pub' | 'films' | 'series' | 'dessins-animes' | 'animes' | 'disney' | 'jeux-video';
  /** Niveau de difficulté : 'facile' (archi-connu), 'moyen' (classique), 'difficile' (pointu / connaisseurs) */
  difficulty?: 'facile' | 'moyen' | 'difficile';
}

/**
 * Dictionnaire des musiques et œuvres cultes.
 * Tu peux ajouter ici autant de lignes que tu veux avec la difficulté de ton choix !
 */
export const CULT_WORKS_DICTIONARY: CultWorkEntry[] = [
  // ==========================================
  // 📢 PUBLICITÉS & MARQUES CULTES
  // ==========================================

  {
    matcher: { title: 'Chandelier', artist: 'Sia' },
    work: 'Dior',
    aliases: ['Miss Dior', "J'adore Dior", 'Parfum Dior'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: "Don't Stop Me Now", artist: 'Queen' },
    work: 'Peugeot',
    aliases: ['Peugeot 208', 'Pub Peugeot'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: "Quelqu'un m'a dit", artist: 'Carla Bruni' },
    work: "L'Oréal",
    aliases: ['Loreal', 'Pub Loreal', 'Parce que je le vaux bien'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: "That's Not My Name", artist: 'The Ting Tings' },
    work: 'Showroomprivé',
    aliases: ['Showroomprive.com', 'Showroom privé'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: '1901', artist: 'Phoenix' },
    work: 'Cadillac',
    aliases: ['Pub Cadillac'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: "Ça (C'est vraiment toi)", artist: 'Téléphone' },
    work: 'Boulanger',
    aliases: ['Pub Boulanger', 'Boulanger électroménager'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: 'Midnight City', artist: 'M83' },
    work: 'Renault',
    aliases: ['Renault Captur', 'Pub Renault'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Sweet Dreams (Are Made of This)', artist: 'Eurythmics' },
    work: 'Renault',
    aliases: ['Pub Renault', 'Renault fin des années 90'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'We Will Rock You', artist: 'Queen' },
    work: 'Evian',
    aliases: ['Pub Evian', 'Evian bébés'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: 'A Little Less Conversation', artist: 'Elvis Presley' },
    work: 'Nike',
    aliases: ['Pub Nike', 'Nike Football', 'Nike cage'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Feel Good Inc.', artist: 'Gorillaz' },
    work: 'Nike',
    aliases: ['Pub Nike'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Whatever', artist: 'Oasis' },
    work: 'Coca-Cola',
    aliases: ['Coca Cola', 'Coke'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'Happy', artist: 'Pharrell Williams' },
    work: 'Coca-Cola',
    aliases: ['Coca Cola', 'Coke'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: 'Seven Nation Army', artist: 'The White Stripes' },
    work: 'Renault',
    aliases: ['Pub Renault'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Day-O (The Banana Boat Song)', artist: 'Harry Belafonte' },
    work: 'Nutella',
    aliases: ['Pub Nutella'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Gloria', artist: 'Umberto Tozzi' },
    work: 'Nutella',
    aliases: ['Pub Nutella', 'Nutella 2000'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: 'Rhapsody in Blue', artist: 'George Gershwin' },
    work: 'United Airlines',
    aliases: ['United Airlines'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'Gimme Shelter', artist: 'The Rolling Stones' },
    work: 'Air France',
    aliases: ['Pub Air France'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'As It Was', artist: 'Harry Styles' },
    work: 'Apple',
    aliases: ['AirPods', 'Pub Apple', 'iPhone'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: 'Come Together', artist: 'The Beatles' },
    work: 'Apple',
    aliases: ['Pub Apple', 'iPhone'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Down the Road', artist: 'C2C' },
    work: 'Bouygues Telecom',
    aliases: ['Bouygues', 'Pub Bouygues'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'Aerodynamic', artist: 'Daft Punk' },
    work: 'Audi',
    aliases: ['Pub Audi', 'Audi A3'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'Get Lucky', artist: 'Daft Punk' },
    work: 'Pepsi',
    aliases: ['Pub Pepsi', 'Pepsi Max'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Jerk It Out', artist: 'Caesars' },
    work: 'Apple iPod',
    aliases: ['iPod', 'Pub iPod'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Flat Beat', artist: 'Mr. Oizo' },
    work: "Levi's",
    aliases: ['Levis', 'Flat Eric', 'Pub Levis'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Mr. Sandman', artist: 'The Chordettes' },
    work: 'Auchan',
    aliases: ['Pub Auchan'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'You Really Got Me', artist: 'The Kinks' },
    work: 'Citroën',
    aliases: ['Citroen', 'Pub Citroen'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'Here Comes the Sun', artist: 'The Beatles' },
    work: 'SNCF',
    aliases: ['Pub SNCF'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Ode à la joie (Symphonie n°9)', artist: 'Ludwig van Beethoven' },
    work: 'Orange',
    aliases: ['Pub Orange', 'France Télécom'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'All You Need Is Love', artist: 'The Beatles' },
    work: 'SFR',
    aliases: ['Pub SFR'],
    category: 'pub',
    difficulty: 'difficile',
  },
  {
    matcher: { title: 'Take On Me', artist: 'a-ha' },
    work: "McDonald's",
    aliases: ['Pub McDo', 'McDo'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'La Vie en rose', artist: 'Édith Piaf' },
    work: 'Chanel',
    aliases: ['Pub Chanel N°5'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: "I'm a Believer", artist: 'The Monkees' },
    work: 'Smash',
    aliases: ['Pub Smash'],
    category: 'pub',
    difficulty: 'difficile',
  },

  // ==========================================
  // 🎬 FILMS CULTES
  // ==========================================

  {
    matcher: { keywords: ['my heart will go on', 'celine dion titanic', 'near far wherever you are', 'rose dawson', 'jack dawson'] },
    work: 'Titanic',
    aliases: ['Le Titanic'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['eye of the tiger', 'survivor rocky', 'gonna fly now', 'bill conti rocky'] },
    work: 'Rocky',
    aliases: ['Rocky 1', 'Rocky Balboa', 'Creed'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['eye of the tiger survivor rocky 3', 'rocky iii soundtrack'] },
    work: 'Rocky III',
    aliases: ['Rocky 3'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['burning heart', 'robert tepper', 'rocky iv soundtrack'] },
    work: 'Rocky IV',
    aliases: ['Rocky 4'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['stayin alive', 'night fever', 'how deep is your love', 'more than a woman', 'bee gees saturday night fever'] },
    work: 'La Fièvre du samedi soir',
    aliases: ['Saturday Night Fever'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['danger zone', 'kenny loggins danger zone', 'great balls of fire top gun'] },
    work: 'Top Gun',
    aliases: ['Top Gun 1'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['take my breath away', 'berlin take my breath away', 'top gun maverick soundtrack'] },
    work: 'Top Gun: Maverick',
    aliases: ['Top Gun Maverick'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['ghostbusters', 'ray parker jr', 'who you gonna call', 'sos fantomes'] },
    work: 'SOS Fantômes',
    aliases: ['Ghostbusters'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['the power of love huey lewis', 'back to the future', 'retour vers le futur', 'alan silvestri back to the future'] },
    work: 'Retour vers le futur',
    aliases: ['Back to the Future', 'Retour vers le futur 1'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['back in time huey lewis', 'retour vers le futur 2 soundtrack'] },
    work: 'Retour vers le futur 2',
    aliases: ['Back to the Future Part II'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['what a feeling', 'irene cara flashdance', 'maniac michael sembello'] },
    work: 'Flashdance',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['time of my life', 'bill medley jennifer warnes', 'she s like the wind patrick swayze', 'hungry eyes eric carmen', 'dirty dancing'] },
    work: 'Dirty Dancing',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['lose yourself', 'eminem 8 mile', 'eight mile', 'rabbit run eminem'] },
    work: '8 Mile',
    aliases: ['Eight Mile'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['i will always love you', 'whitney houston bodyguard', 'i have nothing whitney houston'] },
    work: 'Bodyguard',
    aliases: ['The Bodyguard', 'Le Garde du corps'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['all star smash mouth', 'i m a believer smash mouth', 'shrek'] },
    work: 'Shrek',
    aliases: ['Shrek 1'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['accidentally in love counting crows', 'shrek 2 soundtrack'] },
    work: 'Shrek 2',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['gangsta s paradise', 'coolio gangsta', 'dangerous minds', 'esprits rebelles'] },
    work: 'Esprits rebelles',
    aliases: ['Dangerous Minds'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['men in black will smith', 'here come the men in black'] },
    work: 'Men in Black',
    aliases: ['MIB', 'Hommes en noir'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['skyfall adele', 'james bond theme', 'monty norman', 'john barry 007'] },
    work: 'James Bond',
    aliases: ['007', 'Skyfall'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['no time to die billie eilish'] },
    work: 'Mourir peut attendre',
    aliases: ['No Time To Die'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['writings on the wall sam smith', 'spectre soundtrack'] },
    work: 'Spectre',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['see you again wiz khalifa', 'charlie puth see you again', 'fast and furious 7', 'fast 7'] },
    work: 'Fast and Furious 7',
    aliases: ['Fast 7'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['danza kuduro don omar', 'fast five soundtrack'] },
    work: 'Fast and Furious 5',
    aliases: ['Fast Five'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['tokyo drift teriyaki boyz', 'bandoleros don omar'] },
    work: 'Fast and Furious : Tokyo Drift',
    aliases: ['Tokyo Drift'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['you re the one that i want', 'grease lightning', 'summer nights grease'] },
    work: 'Grease',
    aliases: ['Grease 1'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['misirlou dick dale', 'you never can tell chuck berry', 'pulp fiction'] },
    work: 'Pulp Fiction',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['jailhouse rock', 'elvis presley jailhouse rock', 'le rock du bagne'] },
    work: 'Jailhouse Rock',
    aliases: ['Le Rock du bagne'],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['push it to the limit', 'paul engemann scarface', 'giorgio moroder scarface'] },
    work: 'Scarface',
    aliases: ['Tony Montana'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['nightcall kavinsky', 'a real hero college', 'drive kavinsky'] },
    work: 'Drive',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['footloose kenny loggins', 'holding out for a hero bonnie tyler'] },
    work: 'Footloose',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['everybody needs somebody to love blues brothers', 'sweet home chicago blues brothers'] },
    work: 'The Blues Brothers',
    aliases: ['Les Blues Brothers'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['unchained melody righteous brothers', 'ghost movie theme'] },
    work: 'Ghost',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['don t you forget about me', 'simple minds breakfast club'] },
    work: 'The Breakfast Club',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['oh pretty woman roy orbison', 'pretty woman soundtrack'] },
    work: 'Pretty Woman',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['i believe i can fly', 'r kelly space jam'] },
    work: 'Space Jam',
    aliases: ['Space Jam 1'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['shallow lady gaga', 'a star is born'] },
    work: 'A Star Is Born',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['city of stars ryan gosling', 'la la land'] },
    work: 'La La Land',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['this is me greatest showman', 'the greatest show hugh jackman'] },
    work: 'The Greatest Showman',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['hedwig s theme', 'harry potter theme', 'john williams harry potter'] },
    work: 'Harry Potter',
    aliases: ["Harry Potter à l'école des sorciers"],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['the imperial march', 'star wars main title', 'john williams star wars'] },
    work: 'Star Wars',
    aliases: ['La Guerre des étoiles', 'Darth Vader'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['he s a pirate', 'klaus badelt pirates of the caribbean'] },
    work: 'Pirates des Caraïbes',
    aliases: ['Pirates of the Caribbean', 'Jack Sparrow'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['concerning hobbits', 'the shire howard shore', 'seigneur des anneaux'] },
    work: 'Le Seigneur des Anneaux',
    aliases: ['The Lord of the Rings', 'LOTR', 'Le Hobbit'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['now we are free gladiator', 'hans zimmer gladiator'] },
    work: 'Gladiator',
    aliases: ['Gladiateur'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['cornfield chase interstellar', 'hans zimmer interstellar'] },
    work: 'Interstellar',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['time hans zimmer inception', 'dream is collapsing inception'] },
    work: 'Inception',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['why so serious hans zimmer', 'the dark knight theme'] },
    work: 'The Dark Knight',
    aliases: ['Batman', 'Le Chevalier Noir'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the good the bad and the ugly', 'le bon la brute et le truand', 'ecstasy of gold ennio morricone'] },
    work: 'Le Bon, la Brute et le Truand',
    aliases: ['The Good the Bad and the Ugly'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['once upon a time in the west', 'il etait une fois dans l ouest', 'man with a harmonica'] },
    work: "Il était une fois dans l'Ouest",
    aliases: ['Once Upon a Time in the West'],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['chi mai ennio morricone', 'le professionnel morricone'] },
    work: 'Le Professionnel',
    aliases: ['Chi Mai'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['la valse d amelie', 'comptine d un autre ete', 'yann tiersen amelie poulain'] },
    work: "Le Fabuleux Destin d'Amélie Poulain",
    aliases: ['Amélie Poulain', 'Amélie'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['una mattina ludovico einaudi', 'fly ludovico einaudi', 'intouchables soundtrack'] },
    work: 'Intouchables',
    aliases: [],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['eric serra le grand bleu', 'the big blue overture'] },
    work: 'Le Grand Bleu',
    aliases: ['The Big Blue'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['shape of my heart sting', 'leon soundtrack', 'eric serra leon'] },
    work: 'Léon',
    aliases: ['Léon the Professional'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the diva dance eric serra', 'le cinquieme element', 'inva mula diva dance'] },
    work: 'Le Cinquième Élément',
    aliases: ['The Fifth Element'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['quand te reverrai je pays merveilleux', 'les bronzes font du ski'] },
    work: 'Les Bronzés font du ski',
    aliases: ['Les Bronzés'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['reality richard sanderson', 'la boum soundtrack', 'vladimir cosma la boum'] },
    work: 'La Boum',
    aliases: ['La Boum 1'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['paris latino camping', 'franck dubosc camping'] },
    work: 'Camping',
    aliases: ['Camping 1'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['les aventures de rabbi jacob', 'vladimir cosma rabbi jacob'] },
    work: 'Rabbi Jacob',
    aliases: ['Les Aventures de Rabbi Jacob'],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['la soupe aux choux', 'raymond lefevre la soupe aux choux'] },
    work: 'La Soupe aux choux',
    aliases: [],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['marche des gendarmes', 'douliou douliou saint tropez'] },
    work: 'Le Gendarme de Saint-Tropez',
    aliases: ['Les Gendarmes'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['i got you i feel good asterix', 'mission cleopatre', 'ti amo umberto tozzi asterix'] },
    work: 'Astérix & Obélix : Mission Cléopâtre',
    aliases: ['Mission Cléopâtre'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['le diner de cons vladimir cosma'] },
    work: 'Le Dîner de Cons',
    aliases: [],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['bad boys inner circle', 'bad boys bad boys whatcha gonna do'] },
    work: 'Bad Boys',
    aliases: ['Bad Boys 2', 'Bad Boys for Life'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['wild wild west will smith', 'kool moe dee wild wild west'] },
    work: 'Wild Wild West',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['purple rain prince', 'lets go crazy prince purple rain'] },
    work: 'Purple Rain',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['streets of philadelphia bruce springsteen'] },
    work: 'Philadelphia',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['cant stop the feeling justin timberlake', 'trolls soundtrack'] },
    work: 'Les Trolls',
    aliases: ['Trolls'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['happy pharrell williams despicable me', 'moi moche et mechant 2'] },
    work: 'Moi, moche et méchant 2',
    aliases: ['Despicable Me 2'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['hero chad kroeger', 'spider man 2002 soundtrack'] },
    work: 'Spider-Man',
    aliases: ['Spiderman 1'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['hooked on a feeling blue swede', 'come and get your love redbone', 'guardians of the galaxy'] },
    work: 'Les Gardiens de la Galaxie',
    aliases: ['Guardians of the Galaxy'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['sunflower post malone swae lee', 'spider-man into the spider-verse'] },
    work: 'Spider-Man: New Generation',
    aliases: ['Into the Spider-Verse'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['love is all around wet wet wet', 'four weddings and a funeral'] },
    work: 'Quatre mariages et un enterrement',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['she elvis costello', 'notting hill soundtrack', 'coup de foudre a notting hill'] },
    work: 'Coup de foudre à Notting Hill',
    aliases: ['Notting Hill'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['kiss me sixpence none the richer', 'she s all that'] },
    work: 'Elle est trop bien',
    aliases: ["She's All That"],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['iris goo goo dolls', 'city of angels', 'la cite des anges'] },
    work: 'La Cité des anges',
    aliases: ['City of Angels'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['bitter sweet symphony the verve', 'cruel intentions'] },
    work: 'Sexe Intentions',
    aliases: ['Cruel Intentions'],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['where is my mind pixies', 'fight club soundtrack'] },
    work: 'Fight Club',
    aliases: [],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['mad world gary jules', 'donnie darko soundtrack'] },
    work: 'Donnie Darko',
    aliases: [],
    category: 'films',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['bang bang nancy sinatra', 'kill bill soundtrack'] },
    work: 'Kill Bill',
    aliases: ['Kill Bill Vol. 1'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the pink panther theme', 'henry mancini pink panther'] },
    work: 'La Panthère Rose',
    aliases: ['The Pink Panther'],
    category: 'films',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the godfather theme', 'speak softly love nino rota'] },
    work: 'Le Parrain',
    aliases: ['The Godfather'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['raiders march john williams', 'indiana jones theme'] },
    work: 'Indiana Jones',
    aliases: ["Les Aventuriers de l'arche perdue"],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['jurassic park theme john williams'] },
    work: 'Jurassic Park',
    aliases: ['Jurassic World'],
    category: 'films',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['jaws main title john williams', 'les dents de la mer'] },
    work: 'Les Dents de la Mer',
    aliases: ['Jaws'],
    category: 'films',
    difficulty: 'facile',
  },

  // ==========================================
  // 🏰 DISNEY & PIXAR
  // ==========================================

  {
    matcher: { keywords: ['histoire de la vie', 'circle of life', 'lion king', 'roi lion', 'hakuna matata'] },
    work: 'Le Roi Lion',
    aliases: ['The Lion King'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['liberee delivree', 'let it go', 'frozen', 'reine des neiges'] },
    work: 'La Reine des Neiges',
    aliases: ['Frozen', 'La Reine des Neiges 2'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['ce reve bleu', 'whole new world', 'aladdin', 'prince ali'] },
    work: 'Aladdin',
    aliases: ['Aladin'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['il en faut peu pour etre heureux', 'bare necessities', 'livre de la jungle'] },
    work: 'Le Livre de la Jungle',
    aliases: ['The Jungle Book'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['sous l ocean', 'under the sea', 'petite sirene'] },
    work: 'La Petite Sirène',
    aliases: ['The Little Mermaid'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['histoire eternelle', 'beauty and the beast', 'belle et la bete'] },
    work: 'La Belle et la Bête',
    aliases: ['Beauty and the Beast'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['comme un homme', 'make a man out of you', 'mulan'] },
    work: 'Mulan',
    aliases: [],
    category: 'disney',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['bleu lumiere', 'how far i ll go', 'vaiana', 'moana'] },
    work: 'Vaiana',
    aliases: ['Moana'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['strangers like me', 'you ll be in my heart', 'tarzan', 'phil collins tarzan'] },
    work: 'Tarzan',
    aliases: [],
    category: 'disney',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['de zero en heros', 'zero to hero', 'hercule', 'hercules'] },
    work: 'Hercule',
    aliases: ['Hercules'],
    category: 'disney',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['l air du vent', 'colors of the wind', 'pocahontas'] },
    work: 'Pocahontas',
    aliases: [],
    category: 'disney',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['ne parlons pas de bruno', 'we don t talk about bruno', 'encanto'] },
    work: 'Encanto',
    aliases: [],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['ne m oublie pas', 'remember me', 'coco', 'recuerdame'] },
    work: 'Coco',
    aliases: [],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['ou est la vraie vie', 'when will my life begin', 'raiponce'] },
    work: 'Raiponce',
    aliases: ['Tangled'],
    category: 'disney',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['un ami qui vous veut du bien', 'friend in me', 'toy story'] },
    work: 'Toy Story',
    aliases: ['Toy Story 1'],
    category: 'disney',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['when she loved me', 'toy story 2 soundtrack'] },
    work: 'Toy Story 2',
    aliases: [],
    category: 'disney',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['married life up soundtrack', 'la haut michael giacchino'] },
    work: 'La Haut',
    aliases: ['Up'],
    category: 'disney',
    difficulty: 'moyen',
  },

  // ==========================================
  // 📺 SÉRIES TV CULTES
  // ==========================================

  {
    matcher: { keywords: ['i ll be there for you', 'friends theme', 'the rembrandts'] },
    work: 'Friends',
    aliases: [],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['game of thrones theme', 'main title game of thrones', 'ramin djawadi'] },
    work: 'Game of Thrones',
    aliases: ['GOT', 'Le Trône de Fer'],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['house of the dragon theme'] },
    work: 'House of the Dragon',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['stranger things theme', 'kyle dixon'] },
    work: 'Stranger Things',
    aliases: [],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['peaky blinders', 'red right hand', 'nick cave'] },
    work: 'Peaky Blinders',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['bella ciao la casa de papel', 'my life is going on', 'casa de papel'] },
    work: 'La Casa de Papel',
    aliases: ['Money Heist'],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['boss of me', 'they might be giants', 'malcolm in the middle'] },
    work: 'Malcolm',
    aliases: ['Malcolm in the Middle'],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['x-files', 'x files theme', 'mark snow', 'aux frontieres du reel'] },
    work: 'X-Files',
    aliases: ['Aux frontières du réel'],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['how soon is now', 'love spit love', 'charmed theme'] },
    work: 'Charmed',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['nerf herder', 'buffy the vampire slayer', 'buffy contre les vampires'] },
    work: 'Buffy contre les vampires',
    aliases: ['Buffy'],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['hey beautiful', 'the solids', 'how i met your mother', 'himym'] },
    work: 'How I Met Your Mother',
    aliases: ['HIMYM'],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['breaking bad theme', 'dave porter breaking bad'] },
    work: 'Breaking Bad',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the walking dead theme', 'bear mccreary walking dead'] },
    work: 'The Walking Dead',
    aliases: ['TWD'],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['kaamelott', 'alexandre astier kaamelott'] },
    work: 'Kaamelott',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['suicide is painless', 'mash theme'] },
    work: 'M*A*S*H',
    aliases: ['MASH'],
    category: 'series',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['who are you the who', 'les experts las vegas theme'] },
    work: 'Les Experts',
    aliases: ['CSI', 'CSI Las Vegas'],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['baba o riley the who', 'les experts manhattan theme'] },
    work: 'Les Experts : Manhattan',
    aliases: ['CSI NY'],
    category: 'series',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['jai pas le temps faf larage', 'prison break generique francais'] },
    work: 'Prison Break',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['bad things jace everett', 'true blood theme'] },
    work: 'True Blood',
    aliases: [],
    category: 'series',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['tuyo rodrigo amarante', 'narcos theme'] },
    work: 'Narcos',
    aliases: [],
    category: 'series',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['aventuri koh lanta', 'yeke leke laï lo mama jo'] },
    work: 'Koh-Lanta',
    aliases: [],
    category: 'series',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['dallas ton univers impitoyable', 'jerrold immel dallas'] },
    work: 'Dallas',
    aliases: [],
    category: 'series',
    difficulty: 'difficile',
  },

  // ==========================================
  // 🎨 DESSINS ANIMÉS CULTES
  // ==========================================

  {
    matcher: { keywords: ['the simpsons theme', 'danny elfman simpsons', 'les simpson'] },
    work: 'Les Simpson',
    aliases: ['The Simpsons'],
    category: 'dessins-animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['goldorak', 'cours vers jupiter', 'bernard minet goldorak'] },
    work: 'Goldorak',
    aliases: ['Grendizer'],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['olive et tom', 'ils sont toujours en forme', 'captain tsubasa'] },
    work: 'Olive et Tom',
    aliases: ['Captain Tsubasa'],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['mysterieuses cites d or', 'enfants du soleil', 'cités d or'] },
    work: "Les Mystérieuses Cités d'Or",
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['totally spies', 'here we go totally spies'] },
    work: 'Totally Spies',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['code lyoko', 'un monde sans danger'] },
    work: 'Code Lyoko',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['scooby doo where are you', 'scooby-doo'] },
    work: 'Scooby-Doo',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['inspecteur gadget', 'eh la qui va la'] },
    work: 'Inspecteur Gadget',
    aliases: ['Inspector Gadget'],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['titeuf', 'ca m epate'] },
    work: 'Titeuf',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['bob l eponge', 'qui vit dans un ananas', 'spongebob theme'] },
    work: "Bob l'Éponge",
    aliases: ['SpongeBob'],
    category: 'dessins-animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['oggy et les cafards', 'hugues le bars oggy'] },
    work: 'Oggy et les Cafards',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['les razmoket', 'rugrats theme'] },
    work: 'Les Razmoket',
    aliases: ['Rugrats'],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['denver le dernier dinosaure'] },
    work: 'Denver, le dernier dinosaure',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['il etait une fois la vie', 'hymne a la vie'] },
    work: 'Il était une fois... la Vie',
    aliases: [],
    category: 'dessins-animes',
    difficulty: 'moyen',
  },

  // ==========================================
  // 🇯🇵 ANIMÉS & MANGAS CULTES
  // ==========================================

  {
    matcher: { keywords: ['un jour je serai le meilleur dresseur', 'pokemon theme', 'gotta catch em all'] },
    work: 'Pokémon',
    aliases: ['Pocket Monsters'],
    category: 'animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['cha la head cha la', 'dragon ball z', 'kamehameha'] },
    work: 'Dragon Ball Z',
    aliases: ['DBZ', 'Dragon Ball'],
    category: 'animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['we are one piece', 'one piece opening', 'hiroshi kitadani'] },
    work: 'One Piece',
    aliases: [],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['blue bird ikimono', 'naruto opening', 'naruto shippuden'] },
    work: 'Naruto',
    aliases: ['Naruto Shippuden'],
    category: 'animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['guren no yumiya', 'attack on titan', 'shingeki no kyojin'] },
    work: "L'Attaque des Titans",
    aliases: ['Attack on Titan', 'Shingeki no Kyojin'],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the world nightmare', 'death note opening'] },
    work: 'Death Note',
    aliases: [],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['gurenge', 'demon slayer', 'kimetsu no yaiba'] },
    work: 'Demon Slayer',
    aliases: ['Kimetsu no Yaiba'],
    category: 'animes',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['kaikai kitan', 'jujutsu kaisen opening'] },
    work: 'Jujutsu Kaisen',
    aliases: ['JJK'],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['the day porno graffitti', 'my hero academia opening'] },
    work: 'My Hero Academia',
    aliases: ['MHA'],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['unravel tk', 'tokyo ghoul opening'] },
    work: 'Tokyo Ghoul',
    aliases: [],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['again yui', 'fullmetal alchemist brotherhood'] },
    work: 'Fullmetal Alchemist',
    aliases: ['FMA', 'FMAB'],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['a cruel angel s thesis', 'evangelion opening'] },
    work: 'Neon Genesis Evangelion',
    aliases: ['Evangelion', 'NGE'],
    category: 'animes',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['pegasus fantasy', 'les chevaliers du zodiaque', 'saint seiya opening'] },
    work: 'Les Chevaliers du Zodiaque',
    aliases: ['Saint Seiya'],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['moonlight densetsu', 'sailor moon opening'] },
    work: 'Sailor Moon',
    aliases: [],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['departure masatoshi ono', 'hunter x hunter opening'] },
    work: 'Hunter x Hunter',
    aliases: ['HxH'],
    category: 'animes',
    difficulty: 'difficile',
  },
  {
    matcher: { keywords: ['asterisk orange range', 'bleach opening'] },
    work: 'Bleach',
    aliases: [],
    category: 'animes',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['tank kenji kawai', 'cowboy bebop opening'] },
    work: 'Cowboy Bebop',
    aliases: [],
    category: 'animes',
    difficulty: 'difficile',
  },

  // ==========================================
  // 🎮 JEUX VIDÉO CULTES
  // ==========================================

  {
    matcher: { keywords: ['ground theme', 'super mario bros', 'overworld', 'koji kondo mario'] },
    work: 'Super Mario',
    aliases: ['Mario', 'Super Mario Bros'],
    category: 'jeux-video',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['zelda main theme', 'zelda', 'ocarina of time', 'breath of the wild'] },
    work: 'The Legend of Zelda',
    aliases: ['Zelda', 'Breath of the Wild', 'Tears of the Kingdom'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['pokemon battle', 'lavender town', 'pokemon red', 'pokemon blue'] },
    work: 'Pokémon (Jeu Vidéo)',
    aliases: ['Pokemon Rouge', 'Pokémon Bleu'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['green hill zone', 'sonic theme', 'sonic the hedgehog'] },
    work: 'Sonic the Hedgehog',
    aliases: ['Sonic'],
    category: 'jeux-video',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['tetris theme', 'korobeiniki'] },
    work: 'Tetris',
    aliases: [],
    category: 'jeux-video',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['megalovania', 'undertale', 'toby fox'] },
    work: 'Undertale',
    aliases: [],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['one winged angel', 'sephiroth theme', 'final fantasy vii'] },
    work: 'Final Fantasy VII',
    aliases: ['FF7'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['dragonborn', 'skyrim theme', 'dovahkiin'] },
    work: 'Skyrim',
    aliases: ['The Elder Scrolls V'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['halo theme', 'mjolnir mix', 'master chief halo'] },
    work: 'Halo',
    aliases: ['Halo Combat Evolved'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['sweden c418', 'wet hands', 'minecraft theme'] },
    work: 'Minecraft',
    aliases: [],
    category: 'jeux-video',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['guile theme', 'street fighter ii', 'hadouken'] },
    work: 'Street Fighter II',
    aliases: ['SF2'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['gta san andreas theme', 'grand theft auto', 'san andreas theme'] },
    work: 'GTA: San Andreas',
    aliases: ['Grand Theft Auto', 'GTA San Andreas'],
    category: 'jeux-video',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['welcome to los santos gta v', 'gta 5 theme'] },
    work: 'GTA V',
    aliases: ['Grand Theft Auto V'],
    category: 'jeux-video',
    difficulty: 'facile',
  },
  {
    matcher: { keywords: ['still alive portal', 'jonathan coulton portal', 'cara mia addio'] },
    work: 'Portal',
    aliases: [],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['main theme the last of us', 'gustavo santaolalla the last of us'] },
    work: 'The Last of Us',
    aliases: ['TLOU'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['assassins creed ezio family', 'jesper kyd assassins creed'] },
    work: "Assassin's Creed",
    aliases: ['Ezio Family'],
    category: 'jeux-video',
    difficulty: 'moyen',
  },
  {
    matcher: { keywords: ['green green kirby theme', 'jun ishikawa kirby'] },
    work: 'Kirby',
    aliases: [],
    category: 'jeux-video',
    difficulty: 'difficile',
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

const GENERIC_ALBUM_WORDS = /\b(?:greatest hits|best of|the best|anthology|compilation|collection|platinum|gold|hits|singles|definitive|remastered|live at|live in|concert|studio album|deluxe|anniversary|tour|volume|vol\b|edition)\b/i;

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
    const matchQuote = src.match(/(?:from|de|du film|de la série|de la serie|tiré de|tire de|extrait de)\s+["'«]([^"'»]+)["'»]/i);
    if (matchQuote?.[1] && matchQuote[1].trim().length > 1) return matchQuote[1].trim();

    const matchParen = src.match(/\((?:from the motion picture|from the original soundtrack|from the soundtrack|from|de la série|de la serie|du film|de|music from|ost|soundtrack|b\.?o\.?)\s+([^)]+)\)/i);
    if (matchParen?.[1] && matchParen[1].trim().length > 1) {
      return matchParen[1].replace(/^(?:the|le|la|les|l'|un|une)\s+/i, '').trim();
    }

    const matchThemeFrom = src.match(/^(?:theme|main title|love theme|prologue|suite|overture|score)\s+(?:from|de|du film|of)\s+["'«]?([^"'»(\[-]+)/i);
    if (matchThemeFrom?.[1] && matchThemeFrom[1].trim().length > 1) {
      return matchThemeFrom[1].trim();
    }

    if (albumTitle) {
      const cleaned = albumTitle
        .replace(/\s*[:(–—\-]\s*(?:original motion picture|original soundtrack|music from the motion picture|music from|the motion picture|bande originale du film|bande originale|soundtrack album|soundtrack|original score|the album|ost|b\.?o\.).*$/i, '')
        .replace(/\s*\((?:original motion picture|original soundtrack|music from the motion picture|music from|the motion picture|bande originale du film|bande originale|soundtrack album|soundtrack|original score|the album|ost|b\.?o\.)[^)]*\)/i, '')
        .replace(/\s*\[(?:original motion picture|original soundtrack|music from the motion picture|music from|the motion picture|bande originale du film|bande originale|soundtrack album|soundtrack|original score|the album|ost|b\.?o\.)[^\]]*\]/i, '')
        .replace(/\s+(?:original motion picture soundtrack|original soundtrack|bande originale du film|soundtrack album|soundtrack|score|b\.?o\.|ost)$/i, '')
        .trim();

      if (cleaned.length > 1 && !GENERIC_ALBUM_WORDS.test(cleaned)) {
        const hadOstMarker = /\b(?:soundtrack|motion picture|bande originale|b\.?o\.|score|ost|awesome mix)\b/i.test(albumTitle);
        if (hadOstMarker) {
          return cleaned;
        }
      }
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
): {
  work: string;
  aliases: string[];
  category: 'pub' | 'films' | 'series' | 'dessins-animes' | 'animes' | 'disney' | 'jeux-video';
  difficulty?: 'facile' | 'moyen' | 'difficile';
} | null {
  const normTitle = normalizeWorkText(title);
  const normArtist = normalizeWorkText(artist);
  const fullText = `${normTitle} ${normArtist} ${normalizeWorkText(albumTitle ?? '')}`;

  for (const entry of CULT_WORKS_DICTIONARY) {
    if (themeCategory && entry.category !== themeCategory) continue;
    const { title: eTitle, artist: eArtist, keywords: eKeywords } = entry.matcher;

    if (eTitle && eArtist) {
      const matchT = normTitle.includes(normalizeWorkText(eTitle)) || normalizeWorkText(eTitle).includes(normTitle);
      const matchA = normArtist.includes(normalizeWorkText(eArtist)) || normalizeWorkText(eArtist).includes(normArtist);
      if (matchT && matchA) {
        return {
          work: entry.work,
          aliases: entry.aliases ?? [],
          category: entry.category,
          difficulty: entry.difficulty,
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
          difficulty: entry.difficulty,
        };
      }
    }
  }

  const extracted = extractWorkFromMetadata(title, albumTitle);
  if (extracted && extracted.length > 1) {
    let cat: 'pub' | 'films' | 'series' | 'dessins-animes' | 'animes' | 'disney' | 'jeux-video' = 'films';
    if (themeCategory === 'disney') cat = 'disney';
    else if (themeCategory === 'jeux-video') cat = 'jeux-video';
    else if (themeCategory === 'dessins-animes') cat = 'dessins-animes';
    else if (themeCategory === 'animes') cat = 'animes';
    else if (themeCategory === 'series') cat = 'series';
    else if (themeCategory === 'pub') cat = 'pub';

    return {
      work: extracted,
      aliases: [],
      category: cat,
    };
  }

  if (themeCategory && ['films', 'series', 'disney', 'dessins-animes', 'animes', 'jeux-video'].includes(themeCategory)) {
    if (albumTitle) {
      const cleanAlb = albumTitle
        .replace(/\s*[:(–—\-]\s*(?:original motion picture|original soundtrack|music from|soundtrack|bande originale|the album|ost).*$/i, '')
        .replace(/\s*\([^)]*\)/g, '')
        .replace(/\s*\[[^\]]*\]/g, '')
        .trim();
      if (
        cleanAlb.length > 2 &&
        !GENERIC_ALBUM_WORDS.test(cleanAlb) &&
        normalizeWorkText(cleanAlb) !== normalizeWorkText(artist)
      ) {
        return {
          work: cleanAlb,
          aliases: [],
          category: themeCategory as any,
        };
      }
    }

    const cleanTit = title.replace(/\s*\([^)]*\)/g, '').replace(/\s*\[[^\]]*\]/g, '').trim();
    if (cleanTit.length > 2) {
      return {
        work: cleanTit,
        aliases: [],
        category: themeCategory as any,
      };
    }
  }

  return null;
}