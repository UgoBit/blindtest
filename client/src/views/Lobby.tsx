import { useEffect, useRef, useState } from 'react';
import type { RoomState, Theme } from '../../../shared/types';
import { DIFFICULTIES } from '../../../shared/types';
import QrJoin from '../components/QrJoin';
import TeamAssignmentModal from '../components/TeamAssignmentModal';

interface Props {
  state: RoomState;
  isHost: boolean;
  currentPlayerId?: string;
  onUpdate: (settings: Partial<RoomState['settings']>) => void;
  onRenameTeam: (name: string) => void;
  onAssignTeam: (playerId: string, team: number | null) => void;
  onStart: () => void;
  onKick: (playerId: string) => void;
}

const CATEGORY_LABELS: Record<Theme['category'], string> = {
  genre: 'Genres',
  epoque: 'Époques',
  culture: 'Culture',
};

export default function Lobby({ state, isHost, currentPlayerId, onUpdate, onRenameTeam, onAssignTeam, onStart, onKick }: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [teamName, setTeamName] = useState('Sur place');
  const [teamDrafts, setTeamDrafts] = useState<string[]>([]);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [playerModalOpen, setPlayerModalOpen] = useState(true);
  const { settings, players } = state;

  useEffect(() => {
    void fetch('/api/themes')
      .then((res) => res.json())
      .then(setThemes)
      .catch(() => setThemes([]));
  }, []);

  const toggleTheme = (id: string) => {
    const next = settings.themes.includes(id)
      ? settings.themes.filter((theme) => theme !== id)
      : [...settings.themes, id];
    onUpdate({ themes: next.length > 0 ? next : ['top'] });
  };

  const guests = players.filter((player) => !player.isHost);
  const host = players.find((player) => player.isHost);
  const mode = settings.mode ?? 'phones';
  const canStart = mode === 'solo' ? true : guests.length > 0;

  useEffect(() => {
    if (host?.name) setTeamName(host.name);
  }, [host?.name]);

  useEffect(() => {
    const nextDrafts = Array.from({ length: Math.max(1, settings.teamCount ?? 2) }, (_, index) => {
      const value = settings.teamNames?.[index];
      return value && value.trim().length > 0 ? value : `Équipe ${index + 1}`;
    });
    setTeamDrafts((previous) => {
      if (previous.length === nextDrafts.length && previous.every((value, index) => value === nextDrafts[index])) {
        return previous;
      }
      return nextDrafts;
    });
  }, [settings.teamCount, settings.teamNames]);

  const syncTeamDrafts = () => {
    const nextNames = Array.from({ length: Math.max(1, settings.teamCount ?? 2) }, (_, index) => {
      const value = teamDrafts[index] ?? settings.teamNames?.[index] ?? `Équipe ${index + 1}`;
      return value && value.trim().length > 0 ? value.trim() : `Équipe ${index + 1}`;
    });
    onUpdate({ teamNames: nextNames });
  };

  const teamLabels = Array.from({ length: Math.max(1, settings.teamCount ?? 2) }, (_, index) => {
    const rawName = teamDrafts[index] ?? settings.teamNames?.[index];
    return rawName && rawName.trim().length > 0 ? rawName.trim() : `Équipe ${index + 1}`;
  });

  const playersByTeam = Array.from({ length: Math.max(1, settings.teamCount ?? 2) }, (_, index) => {
    const teamNumber = index + 1;
    return players.filter((player) => (player.team ?? 1) === teamNumber && !(player.isHost && !settings.hostPlays));
  });

  const prevTeamsRef = useRef<Record<string, number | null>>({});
  const [changedPlayers, setChangedPlayers] = useState<string[]>([]);

  useEffect(() => {
    const prev = prevTeamsRef.current;
    const nextMap: Record<string, number | null> = {};
    state.players.forEach((p) => (nextMap[p.id] = p.team ?? 1));
    const changed: string[] = [];
    for (const p of state.players) {
      const prevTeam = prev[p.id] ?? null;
      const curTeam = nextMap[p.id];
      if (prevTeam !== null && prevTeam !== curTeam) changed.push(p.id);
    }
    if (changed.length > 0) {
      setChangedPlayers(changed);
      const t = setTimeout(() => setChangedPlayers([]), 1400);
      return () => clearTimeout(t);
    }
    prevTeamsRef.current = nextMap;
  }, [state.players]);

  

  if (!isHost) {
    if (settings.mode === 'teams') {
      const currentPlayer = players.find((p) => p.id === currentPlayerId);
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-accent to-neon" />
          <h2 className="text-2xl font-bold">En attente du lancement…</h2>
          <p className="text-white/60">{settings.themes.length} thèmes · {settings.rounds} manches · niveau {settings.difficulty}</p>

          <div className="w-full max-w-xs mt-6">
            <button
              className="btn-primary w-full py-3"
              onClick={() => setPlayerModalOpen(true)}
            >
              Choisir mon équipe
            </button>
          </div>

          {currentPlayer?.team && (
            <div className="mt-3">
              <span className="team-badge">Tu es dans l'équipe {teamLabels[(currentPlayer.team ?? 1) - 1]}</span>
            </div>
          )}

          <p className="mt-4 text-sm text-white/60">Ou attends l'hôte pour lancer la partie.</p>

          <TeamAssignmentModal
            open={playerModalOpen}
            onClose={() => setPlayerModalOpen(false)}
            state={state}
            currentPlayerId={currentPlayerId}
            isHost={false}
            allowClose={true}
            onAssignTeam={(playerId, team) => {
              onAssignTeam(playerId, team);
              setPlayerModalOpen(false);
            }}
          />
        </div>
      );
    }
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-16 text-center">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-accent to-neon" />
        <h2 className="text-2xl font-bold">En attente du lancement…</h2>
        <p className="text-white/60">
          {settings.themes.length} thèmes · {settings.rounds} manches · niveau {settings.difficulty}
        </p>
        <ul className="flex flex-wrap justify-center gap-2">
          {guests.map((player) => (
            <li key={player.id} className="rounded-full bg-white/10 px-3 py-1 text-sm">
              {player.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <section className="card">
          <h2 className="mb-3 text-xl font-bold">Thèmes</h2>
          {(['genre', 'epoque', 'culture'] as const).map((category) => (
            <div key={category} className="mb-4">
              <p className="mb-2 text-xs uppercase tracking-widest text-white/40">
                {CATEGORY_LABELS[category]}
              </p>
              <div className="flex flex-wrap gap-2">
                {themes
                  .filter((theme) => theme.category === category)
                  .map((theme) => {
                    const active = settings.themes.includes(theme.id);
                    return (
                      <button
                        key={theme.id}
                        onClick={() => toggleTheme(theme.id)}
                        className={`rounded-xl border px-3 py-2 text-sm transition ${
                          active
                            ? 'border-neon bg-neon/20 text-white'
                            : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="mr-1">{theme.emoji}</span>
                        {theme.label}
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </section>

        <section className="card">
          <h2 className="mb-3 text-xl font-bold">Niveau</h2>
          <div className="grid gap-2 sm:grid-cols-4">
            {DIFFICULTIES.map((level) => {
              const active = settings.difficulty === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => onUpdate({ difficulty: level.id })}
                  className={`rounded-xl border p-3 text-left transition ${
                    active
                      ? 'border-neon bg-neon/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-semibold">{level.label}</span>
                  <span className="block text-xs text-white/50">{level.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-sm text-white/60">Manches : {settings.rounds}</span>
            <input
              type="range"
              min={3}
              max={30}
              value={settings.rounds}
              onChange={(event) => onUpdate({ rounds: Number(event.target.value) })}
              className="mt-2 w-full accent-neon"
            />
          </label>
          <label className="block">
            <span className="text-sm text-white/60">Durée extrait : {settings.clipSeconds}s</span>
            <input
              type="range"
              min={5}
              max={30}
              value={settings.clipSeconds}
              onChange={(event) => onUpdate({ clipSeconds: Number(event.target.value) })}
              className="mt-2 w-full accent-neon"
            />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-sm text-white/60">Format</span>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdate({ mode: 'phones', hostPlays: false })}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  mode === 'phones'
                    ? 'border-neon bg-neon/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Téléphones
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ mode: 'solo', hostPlays: true })}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  mode === 'solo'
                    ? 'border-neon bg-neon/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Solo
              </button>
              <button
                type="button"
                onClick={() => onUpdate({ mode: 'teams', hostPlays: false, teamCount: settings.teamCount || 2 })}
                className={`rounded-xl border px-3 py-2 text-sm transition ${
                  mode === 'teams'
                    ? 'border-neon bg-neon/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                Équipes
              </button>
            </div>
          </label>
          {mode === 'teams' && (
            <div className="space-y-3 lg:col-span-1">
              <label className="block h-full">
                <span className="text-sm text-white/60">Nombre d'équipes</span>
                <input
                  type="number"
                  min={2}
                  max={8}
                  value={settings.teamCount || 2}
                  onChange={(event) => {
                    const nextCount = Math.min(8, Math.max(2, Number(event.target.value) || 2));
                    const nextNames = Array.from({ length: nextCount }, (_, index) => settings.teamNames?.[index]?.trim() || `Équipe ${index + 1}`);
                    onUpdate({ teamCount: nextCount, teamNames: nextNames });
                  }}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-neon"
                />
              </label>
            </div>
          )}
          {mode === 'teams' && (
            <div className="space-y-3 lg:col-span-1">
              <label className="block h-full">
                <span className="text-sm text-white/60">Rôle de l’hôte</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ hostPlays: false })}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      !settings.hostPlays
                        ? 'border-neon bg-neon/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Arbitre
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ hostPlays: true })}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      settings.hostPlays
                        ? 'border-neon bg-neon/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    Joue
                  </button>
                </div>
              </label>
            </div>
          )}
          {(mode === 'solo' || (mode === 'teams' && settings.hostPlays)) && (
            <label className="block lg:col-span-1">
              <span className="text-sm text-white/60">{mode === 'solo' ? 'Nom de l’équipe' : 'Pseudo de l’hôte'}</span>
              <input
                type="text"
                maxLength={16}
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                onBlur={() => onRenameTeam(teamName.trim() || 'Sur place')}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-neon"
              />
            </label>
          )}
        </section>

        {mode === 'teams' && (
          <section className="card">
            <h2 className="mb-3 text-xl font-bold">Noms des équipes</h2>
            <div className="grid gap-3 md:grid-cols-2">
              {teamLabels.map((teamNameLabel, index) => (
                <label key={`team-edit-${index}`} className="block rounded-xl border border-white/10 bg-white/5 p-3">
                  <span className="mb-2 block text-xs uppercase tracking-widest text-white/40">{teamNameLabel}</span>
                  <input
                    type="text"
                    maxLength={20}
                    value={teamDrafts[index] ?? teamNameLabel}
                    onChange={(event) => {
                      const nextDrafts = [...teamDrafts];
                      nextDrafts[index] = event.target.value;
                      setTeamDrafts(nextDrafts);
                    }}
                    onBlur={syncTeamDrafts}
                    className="w-full rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-white outline-none focus:border-neon"
                  />
                </label>
              ))}
            </div>
          </section>
        )}

        <button className="btn-primary w-full text-lg" disabled={!canStart} onClick={onStart}>
          {canStart
            ? `Lancer la partie (${mode === 'solo' ? '1 joueur' : guests.length + (mode === 'teams' ? 0 : 0)} ${
                mode === 'solo' ? '' : guests.length > 1 ? 'buzzers' : 'buzzer'
              })`
            : 'En attente de joueurs…'}
        </button>
      </div>

      <aside className="space-y-6">
        <div className="card">
          <QrJoin code={state.code} />
        </div>
        <div className="card">
          <h3 className="mb-3 font-bold">{mode === 'teams' ? 'Affectation des équipes' : 'Joueurs connectés'}</h3>
          {mode === 'teams' && (
            <div className="mb-3">
              <button type="button" className="btn-ghost w-full" onClick={() => setTeamModalOpen(true)}>
                Gérer les équipes
              </button>
            </div>
          )}
          {mode === 'teams' ? (
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-widest text-white/40">Définir qui va dans quelle équipe</p>
              {settings.hostPlays && host && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-widest text-white/40">Hôte</p>
                    <span className="rounded bg-neon/20 px-2 py-0.5 text-[10px] uppercase tracking-widest text-neon">Joue</span>
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{host.name} <span className="ml-2 text-xs text-white/50">{teamLabels[(host.team ?? 1) - 1]}</span></span>
                  </div>
                </div>
              )}
              {playersByTeam.map((teamPlayers, index) => (
                <div key={`team-${index + 1}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-widest text-white/40">
                      {teamLabels[index] ?? `Équipe ${index + 1}`}
                    </p>
                    <span className="text-xs text-white/50">{teamPlayers.length} joueur(s)</span>
                  </div>
                  <ul className="space-y-2">
                      {teamPlayers.length === 0 ? (
                        <li className="text-sm text-white/40">Aucune personne dans cette équipe.</li>
                      ) : (
                        teamPlayers.map((player) => (
                          <li
                            key={player.id}
                            className={`flex items-center justify-between gap-3 rounded-lg bg-black/10 px-2 py-1.5 ${changedPlayers.includes(player.id) ? 'team-flash' : ''}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="truncate">{player.name}</span>
                              {!player.isHost && (
                                <button className="text-xs text-white/40 hover:text-red-300" onClick={() => onKick(player.id)}>
                                  retirer
                                </button>
                              )}
                            </div>
                          </li>
                        ))
                      )}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {guests.map((player) => (
                <li key={player.id} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                  <span>{player.name}</span>
                  <button className="text-xs text-white/40 hover:text-red-300" onClick={() => onKick(player.id)}>
                    retirer
                  </button>
                </li>
              ))}
              {guests.length === 0 && <li className="text-sm text-white/40">Scannez le QR code pour rejoindre.</li>}
            </ul>
          )}
        </div>
        {teamModalOpen && (
          <TeamAssignmentModal
            open={teamModalOpen}
            onClose={() => setTeamModalOpen(false)}
            state={state}
            /** Host opens manager view (no personal id) */
            isHost={true}
            onAssignTeam={onAssignTeam}
          />
        )}
      </aside>
    </div>
  );
}
