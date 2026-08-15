# Blindtest

Blindtest interactif multijoueur : un appareil héberge la partie et diffuse la musique,
les autres rejoignent en scannant un QR code et utilisent leur téléphone comme buzzer.

## Comment la musique est gérée

Aucun fichier audio n'est hébergé. Le serveur interroge les **API publiques Deezer**
(extraits MP3 de 30 s, sans clé ni compte) et retombe sur les **previews Apple Music/iTunes**
si un extrait est injouable. Le son sort uniquement sur l'appareil hôte ; les joueurs ne
reçoivent jamais ni l'URL audio ni la réponse.

## Fonctionnalités

- Salon avec code à 4 lettres + QR code de connexion
- L'hôte est arbitre, ou joueur lui aussi (case « Je joue aussi »)
- Thèmes cumulables : genres, époques (80/90/2000), films, Disney, dessins animés, jeux vidéo, pubs
- Buzzer temps réel (premier arrivé verrouille l'audio), validation titre / artiste par l'hôte
- Mauvaise réponse = joueur éliminé pour la manche, l'extrait reprend
- Reconnexion automatique (rafraîchissement, téléphone verrouillé), scores et podium

### Ajouter un thème

Une entrée dans `server/src/themes.ts` suffit : soit un chart Deezer par genre,
soit des requêtes de playlists.

## Développement

```bash
npm install
npm run dev     # client sur :5173, serveur sur :3001
```

## Production

```bash
npm run build
npm start       # sert le client et l'API sur :3001
```

Pour jouer avec des téléphones sur le même réseau, ouvrez le site via l'IP locale de
l'hôte (par ex. `http://192.168.1.20:3001`) ou déployez-le (Render, Fly.io, Railway…).
