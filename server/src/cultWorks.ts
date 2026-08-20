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
    aliases: ['Miss Dior', 'Jadore Dior', 'Parfum Dior'],
    category: 'pub',
    difficulty: 'facile',
  },
  {
    matcher: { title: 'Dont Stop Me Now', artist: 'Queen' },
    work: 'Peugeot',
    aliases: ['Google', 'Peugeot 208', 'Pub Peugeot'],
    category: 'pub',
    difficulty: 'moyen',
  },
  {
    matcher: { title: 'Quelqu un m a dit', artist: 'Carla Bruni' },
    work: "L'Oréal",
    aliases: ['Loreal', 'Pub Loreal', 'Parce que je le vaux bien'],
    category: 'pub',
    difficulty: 'facile',
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
    matcher: { keywords: ['my heart will go on', 'celine dion titanic', 'near far wherever you are', 'rose dawson', 'jack dawson'] },
    work: 'Titanic',
    aliases: ['Le Titanic'],
    category: 'films',
  },
  {
    matcher: { keywords: ['eye of the tiger', 'survivor rocky', 'gonna fly now', 'bill conti rocky', 'burning heart', 'robert tepper'] },
    work: 'Rocky',
    aliases: ['Rocky 3', 'Rocky III', 'Rocky 1', 'Rocky Balboa', 'Creed'],
    category: 'films',
  },
  {
    matcher: { keywords: ['stayin alive', 'night fever', 'how deep is your love', 'more than a woman', 'bee gees saturday night fever'] },
    work: 'La Fièvre du samedi soir',
    aliases: ['Saturday Night Fever', 'La Fievre du samedi soir'],
    category: 'films',
  },
  {
    matcher: { keywords: ['danger zone', 'take my breath away', 'kenny loggins danger zone', 'berlin take my breath away', 'great balls of fire top gun'] },
    work: 'Top Gun',
    aliases: ['Top Gun Maverick', 'Top Gun 1'],
    category: 'films',
  },
  {
    matcher: { keywords: ['ghostbusters', 'ray parker jr', 'who you gonna call', 'sos fantomes'] },
    work: 'SOS Fantômes',
    aliases: ['Ghostbusters', 'SOS Fantomes'],
    category: 'films',
  },
  {
    matcher: { keywords: ['the power of love huey lewis', 'back in time huey lewis', 'johnny b goode chuck berry', 'back to the future', 'retour vers le futur', 'alan silvestri back to the future'] },
    work: 'Retour vers le futur',
    aliases: ['Back to the Future', 'Retour vers le futur 1', 'Retour vers le futur 2'],
    category: 'films',
  },
  {
    matcher: { keywords: ['what a feeling', 'irene cara flashdance', 'maniac michael sembello'] },
    work: 'Flashdance',
    aliases: ['Flash dance'],
    category: 'films',
  },
  {
    matcher: { keywords: ['time of my life', 'bill medley jennifer warnes', 'she s like the wind patrick swayze', 'hungry eyes eric carmen', 'dirty dancing'] },
    work: 'Dirty Dancing',
    aliases: ['Dirty dance'],
    category: 'films',
  },
  {
    matcher: { keywords: ['lose yourself', 'eminem 8 mile', 'eight mile', 'rabbit run eminem'] },
    work: '8 Mile',
    aliases: ['Eight Mile', '8 miles'],
    category: 'films',
  },
  {
    matcher: { keywords: ['i will always love you', 'whitney houston bodyguard', 'i have nothing whitney houston', 'queen of the night whitney', 'run to you whitney'] },
    work: 'Bodyguard',
    aliases: ['The Bodyguard', 'Le Garde du corps'],
    category: 'films',
  },
  {
    matcher: { keywords: ['all star smash mouth', 'i m a believer smash mouth', 'hallelujah rufus wainwright shrek', 'holding out for a hero frou frou shrek', 'accidentally in love counting crows'] },
    work: 'Shrek',
    aliases: ['Shrek 1', 'Shrek 2'],
    category: 'films',
  },
  {
    matcher: { keywords: ['gangsta s paradise', 'coolio gangsta', 'dangerous minds', 'esprits rebelles'] },
    work: 'Esprits rebelles',
    aliases: ['Dangerous Minds', 'Esprits rebelle'],
    category: 'films',
  },
  {
    matcher: { keywords: ['men in black will smith', 'here come the men in black', 'black suits comin will smith'] },
    work: 'Men in Black',
    aliases: ['MIB', 'Hommes en noir'],
    category: 'films',
  },
  {
    matcher: { keywords: ['skyfall adele', 'no time to die billie eilish', 'goldeneye tina turner', 'live and let die paul mccartney', 'writings on the wall sam smith', 'you know my name chris cornell', 'james bond theme', 'monty norman', 'john barry 007'] },
    work: 'James Bond',
    aliases: ['007', 'Skyfall', 'Goldeneye', 'Mourir peut attendre', 'Spectre', 'Casino Royale', 'No Time To Die'],
    category: 'films',
  },
  {
    matcher: { keywords: ['see you again wiz khalifa', 'charlie puth see you again', 'fast and furious', 'danza kuduro don omar', 'tokyo drift teriyaki boyz', 'bandoleros don omar'] },
    work: 'Fast and Furious',
    aliases: ['Fast & Furious', 'Fast and Furious 7', 'Tokyo Drift', 'Fast 7'],
    category: 'films',
  },
  {
    matcher: { keywords: ['you re the one that i want', 'grease lightning', 'hopelessly devoted to you', 'summer nights grease', 'sandy john travolta grease'] },
    work: 'Grease',
    aliases: ['Grease 1'],
    category: 'films',
  },
  {
    matcher: { keywords: ['misirlou dick dale', 'you never can tell chuck berry', 'girl you ll be a woman soon urge overkill', 'son of a preacher man dusty springfield', 'jungle boogie kool the gang', 'pulp fiction'] },
    work: 'Pulp Fiction',
    aliases: ['Pulp fiction film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['jailhouse rock', 'elvis presley jailhouse rock', 'le rock du bagne'] },
    work: 'Jailhouse Rock',
    aliases: ['Le Rock du bagne', 'Le Rock du Bagne'],
    category: 'films',
  },
  {
    matcher: { keywords: ['push it to the limit', 'paul engemann scarface', 'scarface push it to the limit', 'giorgio moroder scarface', 'tony s theme scarface'] },
    work: 'Scarface',
    aliases: ['Scarface film', 'Tony Montana'],
    category: 'films',
  },
  {
    matcher: { keywords: ['nightcall kavinsky', 'a real hero college', 'under your spell desire', 'drive kavinsky', 'cliff martinez drive'] },
    work: 'Drive',
    aliases: ['Drive film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['footloose kenny loggins', 'holding out for a hero bonnie tyler', 'lets hear it for the boy deniece williams'] },
    work: 'Footloose',
    aliases: ['Footloose film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['everybody needs somebody to love blues brothers', 'sweet home chicago blues brothers', 'soul man blues brothers', 'the blues brothers theme'] },
    work: 'The Blues Brothers',
    aliases: ['Les Blues Brothers', 'Blues Brothers'],
    category: 'films',
  },
  {
    matcher: { keywords: ['unchained melody righteous brothers', 'ghost movie theme', 'patrick swayze demi moore ghost'] },
    work: 'Ghost',
    aliases: ['Ghost film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['don t you forget about me', 'simple minds breakfast club'] },
    work: 'The Breakfast Club',
    aliases: ['Breakfast Club'],
    category: 'films',
  },
  {
    matcher: { keywords: ['oh pretty woman roy orbison', 'it must have been love roxette', 'pretty woman soundtrack'] },
    work: 'Pretty Woman',
    aliases: ['Pretty Woman film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['i believe i can fly', 'r kelly space jam', 'space jam quad city', 'fly like an eagle seal'] },
    work: 'Space Jam',
    aliases: ['Space Jam 1', 'Space Jam nouvelle ere'],
    category: 'films',
  },
  {
    matcher: { keywords: ['shallow lady gaga', 'always remember us this way', 'a star is born', 'i ll never love again lady gaga'] },
    work: 'A Star Is Born',
    aliases: ['Star is Born', 'A Star is Born'],
    category: 'films',
  },
  {
    matcher: { keywords: ['city of stars ryan gosling', 'another day of sun la la land', 'audition emma stone la la land', 'la la land'] },
    work: 'La La Land',
    aliases: ['Laland'],
    category: 'films',
  },
  {
    matcher: { keywords: ['this is me greatest showman', 'the greatest show hugh jackman', 'rewrite the stars greatest showman', 'a million dreams greatest showman'] },
    work: 'The Greatest Showman',
    aliases: ['Greatest Showman'],
    category: 'films',
  },
  {
    matcher: { keywords: ['hedwig s theme', 'harry potter theme', 'john williams harry potter', 'leaving hogwarts', 'potter waltz'] },
    work: 'Harry Potter',
    aliases: ['Harry Potter à l école des sorciers', 'Harry Potter et la Chambre des Secrets', 'Harry Potter film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['the imperial march', 'star wars main title', 'duel of the fates', 'across the stars', 'cantina band star wars', 'john williams star wars'] },
    work: 'Star Wars',
    aliases: ['La Guerre des étoiles', 'L Empire contre attaque', 'Darth Vader', 'Star Wars film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['he s a pirate', 'klaus badelt pirates of the caribbean', 'jack sparrow theme', 'hans zimmer pirates'] },
    work: 'Pirates des Caraïbes',
    aliases: ['Pirates of the Caribbean', 'Pirates des Caraibes', 'Jack Sparrow'],
    category: 'films',
  },
  {
    matcher: { keywords: ['concerning hobbits', 'the lord of the rings theme', 'howard shore lord of the rings', 'the shire howard shore', 'seigneur des anneaux'] },
    work: 'Le Seigneur des Anneaux',
    aliases: ['The Lord of the Rings', 'LOTR', 'Le Hobbit', 'Le Seigneur des anneaux'],
    category: 'films',
  },
  {
    matcher: { keywords: ['now we are free gladiator', 'hans zimmer gladiator', 'lisa gerrard gladiator', 'the battle gladiator'] },
    work: 'Gladiator',
    aliases: ['Gladiateur'],
    category: 'films',
  },
  {
    matcher: { keywords: ['cornfield chase interstellar', 'first step hans zimmer interstellar', 'stay interstellar', 'hans zimmer interstellar'] },
    work: 'Interstellar',
    aliases: ['Interstellar film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['time hans zimmer inception', 'dream is collapsing inception', 'hans zimmer inception'] },
    work: 'Inception',
    aliases: ['Inception film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['why so serious hans zimmer', 'the dark knight theme', 'hans zimmer batman dark knight'] },
    work: 'The Dark Knight',
    aliases: ['Batman', 'The Dark Knight Le Chevalier Noir', 'Batman The Dark Knight'],
    category: 'films',
  },
  {
    matcher: { keywords: ['the good the bad and the ugly', 'le bon la brute et le truand', 'ennio morricone bon brute truand', 'ecstasy of gold ennio morricone'] },
    work: 'Le Bon, la Brute et le Truand',
    aliases: ['The Good the Bad and the Ugly', 'Le Bon la Brute et le Truand'],
    category: 'films',
  },
  {
    matcher: { keywords: ['once upon a time in the west', 'il etait une fois dans l ouest', 'ennio morricone ouest', 'man with a harmonica'] },
    work: "Il était une fois dans l'Ouest",
    aliases: ['Once Upon a Time in the West', 'Il etait une fois dans l ouest'],
    category: 'films',
  },
  {
    matcher: { keywords: ['chi mai ennio morricone', 'le professionnel morricone', 'chi mai professionnel'] },
    work: 'Le Professionnel',
    aliases: ['Le Professionnel film', 'Chi Mai'],
    category: 'films',
  },
  {
    matcher: { keywords: ['la valse d amelie', 'comptine d un autre ete', 'yann tiersen amelie poulain', 'le fabuleux destin d amelie poulain'] },
    work: "Le Fabuleux Destin d'Amélie Poulain",
    aliases: ['Amelie Poulain', 'Le Fabuleux Destin d Amelie Poulain', 'Amélie'],
    category: 'films',
  },
  {
    matcher: { keywords: ['una mattina ludovico einaudi', 'fly ludovico einaudi', 'intouchables soundtrack', 'september earth wind fire intouchables'] },
    work: 'Intouchables',
    aliases: ['Intouchables film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['eric serra le grand bleu', 'the big blue overture', 'my lady blue eric serra'] },
    work: 'Le Grand Bleu',
    aliases: ['The Big Blue', 'Le Grand bleu'],
    category: 'films',
  },
  {
    matcher: { keywords: ['shape of my heart sting', 'leon soundtrack', 'eric serra leon'] },
    work: 'Léon',
    aliases: ['Leon', 'Leon the Professional'],
    category: 'films',
  },
  {
    matcher: { keywords: ['the diva dance eric serra', 'le cinquieme element', 'inva mula diva dance', 'fifth element theme'] },
    work: 'Le Cinquième Élément',
    aliases: ['The Fifth Element', 'Le Cinquieme Element'],
    category: 'films',
  },
  {
    matcher: { keywords: ['quand te reverrai je pays merveilleux', 'just because of you pierre bachelet', 'les bronzes font du ski'] },
    work: 'Les Bronzés font du ski',
    aliases: ['Les Bronzes font du ski', 'Les Bronzes'],
    category: 'films',
  },
  {
    matcher: { keywords: ['reality richard sanderson', 'dreams are my reality', 'la boum soundtrack', 'vladimir cosma la boum'] },
    work: 'La Boum',
    aliases: ['La Boum 1', 'La Boum 2'],
    category: 'films',
  },
  {
    matcher: { keywords: ['paris latino camping', 'bandolero paris latino camping', 'franck dubosc camping'] },
    work: 'Camping',
    aliases: ['Camping 1', 'Camping 2', 'Camping film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['les aventures de rabbi jacob', 'vladimir cosma rabbi jacob', 'danse hassidique rabbi jacob'] },
    work: 'Rabbi Jacob',
    aliases: ['Les Aventures de Rabbi Jacob', 'Les Aventures de Rabbi Jacob film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['la soupe aux choux', 'raymond lefevre la soupe aux choux', 'theme soupe aux choux'] },
    work: 'La Soupe aux choux',
    aliases: ['La Soupe aux Choux', 'La Soupe aux choux film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['marche des gendarmes', 'douliou douliou saint tropez', 'le gendarme de saint tropez'] },
    work: 'Le Gendarme de Saint-Tropez',
    aliases: ['Le Gendarme de Saint Tropez', 'Les Gendarmes'],
    category: 'films',
  },
  {
    matcher: { keywords: ['i got you i feel good asterix', 'mission cleopatre', 'asterix et obelix mission cleopatre', 'ti amo umberto tozzi asterix'] },
    work: 'Astérix & Obélix : Mission Cléopâtre',
    aliases: ['Asterix et Obelix Mission Cleopatre', 'Mission Cleopatre', 'Asterix Mission Cleopatre'],
    category: 'films',
  },
  {
    matcher: { keywords: ['le diner de cons vladimir cosma', 'theme le diner de cons'] },
    work: 'Le Dîner de Cons',
    aliases: ['Le Diner de Cons', 'Le Diner de cons film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['bad boys inner circle', 'bad boys bad boys whatcha gonna do'] },
    work: 'Bad Boys',
    aliases: ['Bad Boys film', 'Bad Boys 2', 'Bad Boys for Life'],
    category: 'films',
  },
  {
    matcher: { keywords: ['wild wild west will smith', 'kool moe dee wild wild west'] },
    work: 'Wild Wild West',
    aliases: ['Wild wild west film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['purple rain prince', 'lets go crazy prince purple rain'] },
    work: 'Purple Rain',
    aliases: ['Purple rain film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['streets of philadelphia bruce springsteen', 'philadelphia soundtrack'] },
    work: 'Philadelphia',
    aliases: ['Philadelphia film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['cant stop the feeling justin timberlake', 'trolls soundtrack'] },
    work: 'Les Trolls',
    aliases: ['Trolls', 'Trolls film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['happy pharrell williams', 'despicable me 2', 'moi moche et mechant 2'] },
    work: 'Moi, moche et méchant',
    aliases: ['Moi moche et mechant', 'Despicable Me', 'Les Minions', 'Minions'],
    category: 'films',
  },
  {
    matcher: { keywords: ['hero chad kroeger', 'spider man 2002 soundtrack', 'spider-man chad kroeger'] },
    work: 'Spider-Man',
    aliases: ['Spiderman', 'Spider-Man 1', 'Spider Man'],
    category: 'films',
  },
  {
    matcher: { keywords: ['hooked on a feeling blue swede', 'come and get your love redbone', 'guardians of the galaxy', 'gardiens de la galaxie', 'awesome mix'] },
    work: 'Les Gardiens de la Galaxie',
    aliases: ['Guardians of the Galaxy', 'Les Gardiens de la galaxie'],
    category: 'films',
  },
  {
    matcher: { keywords: ['sunflower post malone swae lee', 'spider-man into the spider-verse', 'spider-man new generation'] },
    work: 'Spider-Man: New Generation',
    aliases: ['Spider-Man into the Spider-Verse', 'Into the Spider-Verse', 'Spider-Man New Generation'],
    category: 'films',
  },
  {
    matcher: { keywords: ['love is all around wet wet wet', 'four weddings and a funeral', 'quatre mariages et un enterrement'] },
    work: 'Quatre mariages et un enterrement',
    aliases: ['Four Weddings and a Funeral', 'Quatre Mariages et un Enterrement'],
    category: 'films',
  },
  {
    matcher: { keywords: ['she elvis costello', 'notting hill soundtrack', 'aint no sunshine bill withers notting hill', 'coup de foudre a notting hill'] },
    work: 'Coup de foudre à Notting Hill',
    aliases: ['Notting Hill', 'Coup de Foudre a Notting Hill'],
    category: 'films',
  },
  {
    matcher: { keywords: ['kiss me sixpence none the richer', 'she s all that', 'elle est trop bien'] },
    work: 'Elle est trop bien',
    aliases: ['She s All That', 'Elle est Trop Bien'],
    category: 'films',
  },
  {
    matcher: { keywords: ['iris goo goo dolls', 'city of angels', 'la cite des anges'] },
    work: 'La Cité des anges',
    aliases: ['City of Angels', 'La Cite des Anges'],
    category: 'films',
  },
  {
    matcher: { keywords: ['bitter sweet symphony the verve', 'cruel intentions', 'sexe intentions'] },
    work: 'Sexe Intentions',
    aliases: ['Cruel Intentions', 'Sexe Intentions film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['where is my mind pixies', 'fight club soundtrack'] },
    work: 'Fight Club',
    aliases: ['Fight club film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['mad world gary jules', 'donnie darko soundtrack'] },
    work: 'Donnie Darko',
    aliases: ['Donnie darko film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['bang bang nancy sinatra', 'battle without honor or humanity', 'kill bill soundtrack', 'twisted nerve bernard herrmann'] },
    work: 'Kill Bill',
    aliases: ['Kill Bill Vol 1', 'Kill Bill Vol 2', 'Kill Bill 1'],
    category: 'films',
  },
  {
    matcher: { keywords: ['the pink panther theme', 'henry mancini pink panther', 'la panthere rose'] },
    work: 'La Panthère Rose',
    aliases: ['The Pink Panther', 'La Panthere Rose'],
    category: 'films',
  },
  {
    matcher: { keywords: ['the godfather theme', 'speak softly love nino rota', 'le parrain nino rota'] },
    work: 'Le Parrain',
    aliases: ['The Godfather', 'Le Parrain film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['raiders march john williams', 'indiana jones theme', 'raiders of the lost ark'] },
    work: 'Indiana Jones',
    aliases: ['Les Aventuriers de l arche perdue', 'Indiana Jones film'],
    category: 'films',
  },
  {
    matcher: { keywords: ['jurassic park theme john williams', 'welcome to jurassic park'] },
    work: 'Jurassic Park',
    aliases: ['Jurassic World', 'Parc Jurassique'],
    category: 'films',
  },
  {
    matcher: { keywords: ['jaws main title john williams', 'les dents de la mer'] },
    work: 'Les Dents de la Mer',
    aliases: ['Jaws', 'Les Dents de la mer'],
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
  // 📺 SÉRIES TV CULTES
  // ==========================================
  {
    matcher: { keywords: ['i ll be there for you', 'friends theme', 'the rembrandts'] },
    work: 'Friends',
    aliases: ['Friends serie', 'Serie Friends'],
    category: 'series',
  },
  {
    matcher: { keywords: ['game of thrones theme', 'main title game of thrones', 'ramin djawadi', 'trone de fer'] },
    work: 'Game of Thrones',
    aliases: ['GOT', 'Le Trone de Fer', 'House of the Dragon'],
    category: 'series',
  },
  {
    matcher: { keywords: ['stranger things theme', 'kyle dixon', 'stranger things'] },
    work: 'Stranger Things',
    aliases: ['Stranger Things serie'],
    category: 'series',
  },
  {
    matcher: { keywords: ['peaky blinders', 'red right hand', 'nick cave'] },
    work: 'Peaky Blinders',
    aliases: ['Serie Peaky Blinders'],
    category: 'series',
  },
  {
    matcher: { keywords: ['bella ciao la casa de papel', 'my life is going on', 'cecilia krull', 'casa de papel'] },
    work: 'La Casa de Papel',
    aliases: ['Money Heist', 'Casa de Papel'],
    category: 'series',
  },
  {
    matcher: { keywords: ['boss of me', 'they might be giants', 'malcolm in the middle', 'generique malcolm'] },
    work: 'Malcolm',
    aliases: ['Malcolm in the Middle', 'Malcolm serie'],
    category: 'series',
  },
  {
    matcher: { keywords: ['x-files', 'x files theme', 'mark snow', 'aux frontieres du reel'] },
    work: 'X-Files',
    aliases: ['The X-Files', 'Aux frontières du réel', 'X Files'],
    category: 'series',
  },
  {
    matcher: { keywords: ['how soon is now', 'love spit love', 'charmed theme', 'generique charmed'] },
    work: 'Charmed',
    aliases: ['Serie Charmed'],
    category: 'series',
  },
  {
    matcher: { keywords: ['nerf herder', 'buffy the vampire slayer', 'generique buffy', 'buffy contre les vampires'] },
    work: 'Buffy contre les vampires',
    aliases: ['Buffy', 'Buffy the Vampire Slayer'],
    category: 'series',
  },
  {
    matcher: { keywords: ['hey beautiful', 'the solids', 'how i met your mother', 'himym'] },
    work: 'How I Met Your Mother',
    aliases: ['HIMYM'],
    category: 'series',
  },
  {
    matcher: { keywords: ['breaking bad theme', 'dave porter breaking bad'] },
    work: 'Breaking Bad',
    aliases: ['Better Call Saul'],
    category: 'series',
  },
  {
    matcher: { keywords: ['the walking dead theme', 'bear mccreary walking dead'] },
    work: 'The Walking Dead',
    aliases: ['TWD', 'Walking Dead'],
    category: 'series',
  },
  {
    matcher: { keywords: ['kaamelott', 'alexandre astier kaamelott'] },
    work: 'Kaamelott',
    aliases: ['Kaamelott serie'],
    category: 'series',
  },
  {
    matcher: { keywords: ['suicide is painless', 'mash theme'] },
    work: 'M*A*S*H',
    aliases: ['MASH'],
    category: 'series',
  },

  // ==========================================
  // 🎨 DESSINS ANIMÉS CULTES
  // ==========================================
  {
    matcher: { keywords: ['the simpsons theme', 'danny elfman simpsons', 'les simpson'] },
    work: 'Les Simpson',
    aliases: ['The Simpsons', 'Les Simpsons', 'Simpson'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['goldorak', 'cours vers jupiter', 'bernard minet goldorak', 'enriqué goldorak', 'noam goldorak'] },
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
    matcher: { keywords: ['mysterieuses cites d or', 'enfants du soleil', 'esteban zia tao', 'cités d or'] },
    work: "Les Mystérieuses Cités d'Or",
    aliases: ['Mysterieuses Cites d Or', 'Les Cites d Or', 'Cités d Or'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['totally spies', 'here we go totally spies', 'trois espionnes de choc'] },
    work: 'Totally Spies',
    aliases: ['Totally Spies!'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['code lyoko', 'un monde sans danger', 'julien lamassonne'] },
    work: 'Code Lyoko',
    aliases: ['Code Lioko'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['scooby doo where are you', 'scooby-doo', 'scooby-doo generique'] },
    work: 'Scooby-Doo',
    aliases: ['Scooby Doo', 'ScoobyDoo'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['inspecteur gadget', 'eh la qui va la', 'gadget au chapeau'] },
    work: 'Inspecteur Gadget',
    aliases: ['Inspector Gadget'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['titeuf', 'ca m epate', 'generique titeuf'] },
    work: 'Titeuf',
    aliases: ['Titeuf dessin anime'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['bob l eponge', 'qui vit dans un ananas', 'spongebob theme'] },
    work: "Bob l'Éponge",
    aliases: ['Bob l Eponge', 'SpongeBob', 'Spongebob Squarepants'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['oggy et les cafards', 'hugues le bars oggy'] },
    work: 'Oggy et les Cafards',
    aliases: ['Oggy and the Cockroaches', 'Oggy'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['les razmoket', 'rugrats theme', 'mark mothersbaugh'] },
    work: 'Les Razmoket',
    aliases: ['Rugrats', 'Razmoket'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['denver le dernier dinosaure', 'c est mon ami et bien plus encore'] },
    work: 'Denver, le dernier dinosaure',
    aliases: ['Denver', 'Denver le dinosaure'],
    category: 'dessins-animes',
  },
  {
    matcher: { keywords: ['il etait une fois la vie', 'hymne a la vie', 'michel legrand la vie'] },
    work: 'Il était une fois... la Vie',
    aliases: ['Il etait une fois la vie', 'La vie la vie la vie'],
    category: 'dessins-animes',
  },

  // ==========================================
  // 🇯🇵 ANIMÉS & MANGAS CULTES
  // ==========================================
  {
    matcher: { keywords: ['un jour je serai le meilleur dresseur', 'pokemon theme', 'attrapez les tous', 'pokemon', 'gotta catch em all'] },
    work: 'Pokémon',
    aliases: ['Pokemon', 'Pocket Monsters'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['cha la head cha la', 'dragon ball', 'dbz', 'kamehameha', 'dragon ball z', 'dan dan kokoro', 'makafushigi adventure'] },
    work: 'Dragon Ball Z',
    aliases: ['DBZ', 'Dragon Ball', 'Dragon Ball Super', 'Dragon Ball GT'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['we are one piece', 'one piece opening', 'hiroshi kitadani', 'hikari e', 'kokoro no chizu', 'over the top one piece'] },
    work: 'One Piece',
    aliases: ['One piece anime'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['blue bird ikimono', 'silhouette kana boon', 'naruto opening', 'naruto shippuden', 'haruka kanata', 'sign flow naruto'] },
    work: 'Naruto',
    aliases: ['Naruto Shippuden', 'Boruto'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['guren no yumiya', 'attack on titan', 'attaque des titans', 'shingeki no kyojin', 'shinzou wo sasageyo', 'the rumbling'] },
    work: "L'Attaque des Titans",
    aliases: ['Attack on Titan', 'Shingeki no Kyojin', 'SNK', 'Attaque des titans'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['the world nightmare', 'death note opening', 'what s up people', 'maximum the hormone death note'] },
    work: 'Death Note',
    aliases: ['Death Note anime'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['gurenge', 'demon slayer', 'kimetsu no yaiba', 'zankyou sanka', 'lisa demon slayer'] },
    work: 'Demon Slayer',
    aliases: ['Kimetsu no Yaiba', 'Demon Slayer Kimetsu no Yaiba'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['kaikai kitan', 'jujutsu kaisen opening', 'eve jujutsu kaisen', 'specialz king gnu'] },
    work: 'Jujutsu Kaisen',
    aliases: ['JJK', 'Jujutsu Kaisen anime'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['the day porno graffitti', 'peace sign kenshi yonezu', 'my hero academia opening', 'mha opening'] },
    work: 'My Hero Academia',
    aliases: ['MHA', 'Boku no Hero Academia'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['unravel tk', 'tokyo ghoul opening', 'unravel tokyo ghoul'] },
    work: 'Tokyo Ghoul',
    aliases: ['Tokyo Ghoul anime'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['again yui', 'fullmetal alchemist brotherhood', 'fma opening', 'hologram nico touches'] },
    work: 'Fullmetal Alchemist',
    aliases: ['FMA', 'Fullmetal Alchemist Brotherhood', 'FMAB'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['a cruel angel s thesis', 'evangelion opening', 'yoko takahashi evangelion', 'neon genesis evangelion'] },
    work: 'Neon Genesis Evangelion',
    aliases: ['Evangelion', 'NGE'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['pegasus fantasy', 'les chevaliers du zodiaque', 'saint seiya opening', 'make up pegasus'] },
    work: 'Les Chevaliers du Zodiaque',
    aliases: ['Saint Seiya', 'Chevaliers du Zodiaque'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['moonlight densetsu', 'sailor moon opening', 'sailor moon generique'] },
    work: 'Sailor Moon',
    aliases: ['Pretty Guardian Sailor Moon'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['departure masatoshi ono', 'hunter x hunter opening', 'hxh opening'] },
    work: 'Hunter x Hunter',
    aliases: ['HxH', 'Hunter X Hunter 2011'],
    category: 'animes',
  },
  {
    matcher: { keywords: ['asterisk orange range', 'bleach opening', 'velonica aqua timez', 'ranbu no melody'] },
    work: 'Bleach',
    aliases: ['Bleach anime', 'Bleach Thousand Year Blood War'],
    category: 'animes',
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
    // 1. Explicit quotes : (De "Film"), (From "Movie"), (Bande originale de "Film")
    const matchQuote = src.match(/(?:from|de|du film|de la série|de la serie|tiré de|tire de|extrait de)\s+["'«]([^"'»]+)["'»]/i);
    if (matchQuote?.[1] && matchQuote[1].trim().length > 1) return matchQuote[1].trim();

    // 2. Parentheses/brackets : (From Movie), (Theme from Movie), (From the Original Soundtrack ...)
    const matchParen = src.match(/\((?:from the motion picture|from the original soundtrack|from the soundtrack|from|de la série|de la serie|du film|de|music from|ost|soundtrack|b\.?o\.?)\s+([^)]+)\)/i);
    if (matchParen?.[1] && matchParen[1].trim().length > 1) {
      return matchParen[1].replace(/^(?:the|le|la|les|l'|un|une)\s+/i, '').trim();
    }

    // 3. Theme / Main Title from [Movie]
    const matchThemeFrom = src.match(/^(?:theme|main title|love theme|prologue|suite|overture|score)\s+(?:from|de|du film|of)\s+["'«]?([^"'»(\[-]+)/i);
    if (matchThemeFrom?.[1] && matchThemeFrom[1].trim().length > 1) {
      return matchThemeFrom[1].trim();
    }
  }

  // 4. Clean Album Title from soundtrack / OST markers
  if (albumTitle) {
    const cleaned = albumTitle
      .replace(/\s*[:\-(–—]\s*(?:original motion picture|original soundtrack|music from the motion picture|music from|the motion picture|bande originale du film|bande originale|soundtrack album|soundtrack|original score|the album|ost|b\.?o\.?).*$/i, '')
      .replace(/\s*\((?:original motion picture|original soundtrack|music from the motion picture|music from|the motion picture|bande originale du film|bande originale|soundtrack album|soundtrack|original score|the album|ost|b\.?o\.?)[^)]*\)/i, '')
      .replace(/\s*\[(?:original motion picture|original soundtrack|music from the motion picture|music from|the motion picture|bande originale du film|bande originale|soundtrack album|soundtrack|original score|the album|ost|b\.?o\.?)[^\]]*\]/i, '')
      .replace(/\s+(?:original motion picture soundtrack|original soundtrack|bande originale du film|soundtrack album|soundtrack|score|b\.?o\.?|ost)$/i, '')
      .trim();

    if (cleaned.length > 1 && !GENERIC_ALBUM_WORDS.test(cleaned)) {
      const hadOstMarker = /\b(?:soundtrack|motion picture|bande originale|b\.?o\.?|score|ost|awesome mix)\b/i.test(albumTitle);
      if (hadOstMarker) {
        return cleaned;
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

  // 2. Extraction automatique depuis les métadonnées (album/titre)
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

  // 3. Fallback pour thèmes cultes spécifiques (films, séries, etc.)
  if (themeCategory && ['films', 'series', 'disney', 'dessins-animes', 'animes', 'jeux-video'].includes(themeCategory)) {
    if (albumTitle) {
      const cleanAlb = albumTitle
        .replace(/\s*[:\-(–—]\s*(?:original motion picture|original soundtrack|music from|soundtrack|bande originale|the album|ost).*$/i, '')
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
