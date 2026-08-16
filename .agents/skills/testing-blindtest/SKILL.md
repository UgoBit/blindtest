---
name: testing-blindtest
description: How to run and end-to-end test the Blindtest multiplayer app (Express + Socket.IO server on :3001, Vite React client, French UI) with a host window plus isolated player browser contexts.
---

# Testing the Blindtest app

## Run it
- Repo root uses npm workspaces. `npm install` once, then `npm run build` (builds client + server), then `npm start`
  → serves API + built client on `http://localhost:3001` (server entry `dist/server/src/index.js`).
- Dev alternative: `npm run dev` (client on :5173 with a proxy to :3001). Prefer the production build for E2E so the host and
  players hit one origin.
- A server may already be listening on 3001 from another session: check with `lsof -i :3001` / `curl -sI localhost:3001`
  and only restart it if you rebuilt.
- No secrets/keys needed. Tracks come from the public Deezer API; audio previews may come from Deezer *or* the iTunes
  fallback, so accept either host in `<audio>.src`.

## Isolated player contexts (important)
The client stores the seat in `localStorage` under `blindtest.session`, so two tabs in the same profile rejoin the SAME
player. Launch each player with its own profile:
`google-chrome --user-data-dir=/tmp/p1 --window-size=... http://localhost:3001/join/CODE` (repeat with /tmp/p2, /tmp/p3).
Use `wmctrl -r <title> -e 0,x,y,w,h` to tile the host and player windows so one screenshot shows all of them.

## Useful flows / exact French labels
- Host: `/` → `Créer une partie` → lobby at `/host/CODE` with 4-char code, QR, theme tiles, `Niveau`
  (Facile/Moyen/Difficile/Mixte), `Manches : N`, `Durée extrait : Ns`, `Buzzer sur cet écran`,
  `Lancer la partie (N joueurs)`, `retirer` (kick).
- Screen buzzer: activate `Buzzer sur cet écran`, choose the team name, then use the large host button or the `Espace` shortcut during `listening`.
- The screen buzzer is shared by everyone present and uses one team score; verify the chosen name in host and player scores.
- A screen-only game is valid: with no phones connected, activate the screen buzzer and launch the game; without it, the launch button stays disabled.
- Audio output may target the host screen, player devices, or both; verify player playback and host muting when each destination is toggled.
- Player: `/join/CODE` prefills the code; enter pseudo → `Rejoindre` → big `BUZZ` (states `Prêt…`, `BUZZ`, `Éliminé`,
  `X buzze`, `Réponse`).
- Host game: `Préparez-vous…` → `Ça joue ! Qui buzze ?` → `X a buzzé !`; the buzzer types a title and/or artist
  on their own device, with a 25-second response limit. Matching is tolerant to accents, punctuation, articles,
  versions and small typos. The host sees the typed answer only at reveal and can use `En fait c’était bon` once
  per field; `Passer / révéler` remains available.
- Errors to assert: `Aucune partie avec ce code`, `La partie a déjà commencé`.

## Audio verification
Only the host page renders `<audio>`. Verify playback by evaluating on the host page (this is the one legitimate use of
console eval):
`const a=document.querySelector('audio'); JSON.stringify({paused:a.paused,t:a.currentTime,src:a.src,err:a.error})`
Sample twice ~2s apart: `paused === false`, `currentTime` increasing, `error === null`. On buzz it must pause and freeze;
after a wrong/partial judgement it must resume.
Host reconnect: reloading the HOST mid-round must resume the SAME round's clip. The server re-emits `host_track` with a
`startAt` offset (`Room.resyncHost`), and the client seeks there. Re-check this after any reconnect/audio change; if the
browser blocks autoplay the host shows a `Reprendre le son` button instead of skipping the preview.

## Reloading a page reliably
`key F5` and clicking the reload button after a page click do not always reload in this environment. Confirm a reload
actually happened before asserting: `performance.now()` should be small (and `performance.getEntriesByType('navigation')[0].type`
alone is not proof, since it persists in a previously reloaded page).

## Scripted signal
- `npm run test:smoke` → multi-client socket flow, prints `SMOKE OK`.
- `npm run test:difficulty` → prints `DIFFICULTY OK <facile> > <moyen> > <difficile>` average popularity ranks.
- A leak probe (join as player, dump `room_state` during `listening`) is a good way to prove player state contains no
  `previewUrl`, no title/artist and `track.cover === null`.
- During `buzzed`, verify only the buzzer sees the answer fields; before `reveal`, no typed answer or true answer
  may appear in any player's `room_state`.

## Devin Secrets Needed
none
