import { useEffect, useState } from 'react';
import type { Player, RoomState, Theme } from '../../../shared/types';
import { DIFFICULTIES } from '../../../shared/types';
import QrJoin from '../components/QrJoin';

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

const teamNameFor = (names: string[] | undefined, index: number): string =>
  names?.[index]?.trim() || `Équipe ${index + 1}`;

const memberLabel = (count: number): string => `${count} membre${count > 1 ? 's' : ''}`;

export default function Lobby({
  state,
  isHost,
  currentPlayerId,
  onUpdate,
  onRenameTeam,
  onAssignTeam,
  onStart,
  onKick,
}: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [teamName, setTeamName] = useState('Sur place');
  const [teamDrafts, setTeamDrafts] = useState<string[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const { settings, players } = state;
  const mode = settings.mode ?? 'phones';
  const teamCount = Math.min(8, Math.max(2, settings.teamCount ?? 2));

  useEffect(() => {
    void fetch('/api/themes')
      .then((res) => res.json())
      .then(setThemes)
      .catch(() => setThemes([]));
  }, []);

  const guests = players.filter((player) => !player.isHost);
  const host = players.find((player) => player.isHost);
  const teamLabels = Array.from({ length: teamCount }, (_, index) => teamNameFor(settings.teamNames, index));
  const teamNamesKey = teamLabels.join('\u0000');
  const assignablePlayers = players.filter((player) => settings.hostPlays || !player.isHost);
  const teams = Array.from({ length: teamCount }, (_, index) => ({
    number: index + 1,
    name: teamLabels[index],
    members: assignablePlayers.filter((player) => player.team === index + 1),
  }));
  const unassignedPlayers = assignablePlayers.filter((player) => !player.team || player.team > teamCount);
  const populatedTeams = teams.filter((team) => team.members.length > 0).length;
  const teamBuzzers = guests.length + (settings.hostPlays ? 1 : 0);
  const canStart =
    mode === 'solo' ? true : mode === 'teams' ? teamBuzzers > 0 && populatedTeams >= 2 : guests.length > 0;

  useEffect(() => {
    if (host?.name) setTeamName(host.name);
  }, [host?.name]);

  useEffect(() => {
    setTeamDrafts(teamNamesKey.split('\u0000'));
  }, [teamNamesKey]);

  const toggleTheme = (id: string) => {
    const next = settings.themes.includes(id)
      ? settings.themes.filter((theme) => theme !== id)
      : [...settings.themes, id];
    onUpdate({ themes: next.length > 0 ? next : ['top'] });
  };

  const updateTeamCount = (value: number) => {
    const nextCount = Math.min(8, Math.max(2, value));
    const nextNames = Array.from({ length: nextCount }, (_, index) => teamNameFor(settings.teamNames, index));
    onUpdate({ teamCount: nextCount, teamNames: nextNames });
    players.forEach((player) => {
      if (player.team && player.team > nextCount) {
        onAssignTeam(player.id, ((player.team - 1) % nextCount) + 1);
      }
    });
    setSelectedPlayerId(null);
  };

  const commitTeamName = (index: number) => {
    const nextNames = teamLabels.map((label, teamIndex) =>
      teamIndex === index
        ? teamDrafts[index]?.trim() || settings.teamNames[index]?.trim() || `Équipe ${teamIndex + 1}`
        : label,
    );
    onUpdate({ teamNames: nextNames });
  };

  const distributeTeams = () => {
    assignablePlayers.forEach((player, index) => onAssignTeam(player.id, (index % teamCount) + 1));
    setSelectedPlayerId(null);
  };

  const selectPlayer = (player: Player) => {
    setSelectedPlayerId((current) => (current === player.id ? null : player.id));
  };

  const assignSelected = (team: number) => {
    if (!selectedPlayerId) return;
    onAssignTeam(selectedPlayerId, team);
    setSelectedPlayerId(null);
  };

  if (!isHost) {
    if (mode === 'teams') {
      const currentPlayer = players.find((player) => player.id === currentPlayerId);
      return (
        <div className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 py-12 text-center">
          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-accent to-neon" />
          <div>
            <h2 className="text-2xl font-bold">En attente du lancement…</h2>
            <p className="mt-2 text-white/60">
              {settings.themes.length} thèmes · {settings.rounds} manches · niveau {settings.difficulty}
            </p>
          </div>
          <section className="card w-full text-left">
            <h3 className="text-lg font-bold">Choisis ton équipe</h3>
            <p className="mt-1 text-sm text-white/60">Tu peux encore changer d’équipe avant le lancement.</p>
            <div className="mt-4 space-y-2">
              {teams.map((team) => {
                const selected = currentPlayer?.team === team.number;
                return (
                  <button
                    key={team.number}
                    type="button"
                    onClick={() => currentPlayerId && onAssignTeam(currentPlayerId, team.number)}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? 'border-neon bg-neon/20 text-white'
                        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="font-semibold">{team.name}</span>
                    <span className="text-sm text-white/60">{memberLabel(team.members.length)}</span>
                  </button>
                );
              })}
            </div>
          </section>
          <p className="text-sm text-white/60">Ou attends l’hôte pour lancer la partie.</p>
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
            <div key={category} className="mb-4 last:mb-0">
              <p className="mb-2 text-xs uppercase tracking-widest text-white/40">{CATEGORY_LABELS[category]}</p>
              <div className="flex flex-wrap gap-2">
                {themes.filter((theme) => theme.category === category).map((theme) => {
                  const active = settings.themes.includes(theme.id);
                  return (
                    <button
                      key={theme.id}
                      type="button"
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
                  type="button"
                  onClick={() => onUpdate({ difficulty: level.id })}
                  className={`rounded-xl border p-3 text-left transition ${
                    active ? 'border-neon bg-neon/20' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-semibold">{level.label}</span>
                  <span className="block text-xs text-white/50">{level.hint}</span>
                </button>
              );
            })}
          </div>
        </section>

        <section className="card grid gap-5 sm:grid-cols-2">
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
        </section>

        <section className="card">
          <h2 className="text-xl font-bold">Format</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            {[
              { id: 'phones' as const, label: 'Téléphones', action: () => onUpdate({ mode: 'phones', hostPlays: false }) },
              { id: 'solo' as const, label: 'Solo', action: () => onUpdate({ mode: 'solo', hostPlays: true }) },
              { id: 'teams' as const, label: 'Équipes', action: () => onUpdate({ mode: 'teams', hostPlays: false, teamCount: teamCount }) },
            ].map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={format.action}
                className={`rounded-xl border px-3 py-3 text-sm transition ${
                  mode === format.id
                    ? 'border-neon bg-neon/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {format.label}
              </button>
            ))}
          </div>
        </section>

        {(mode === 'solo' || mode === 'teams') && (
          <section className="card">
            <h2 className="text-xl font-bold">Réglages du format</h2>
            {mode === 'teams' && (
              <div className="mt-4">
                <span className="text-sm text-white/60">Rôle de l’hôte</span>
                <div className="mt-2 grid max-w-sm grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate({ hostPlays: false })}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      !settings.hostPlays ? 'border-neon bg-neon/20' : 'border-white/10 bg-white/5 text-white/70'
                    }`}
                  >
                    Arbitre
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdate({ hostPlays: true })}
                    className={`rounded-xl border px-3 py-2 text-sm ${
                      settings.hostPlays ? 'border-neon bg-neon/20' : 'border-white/10 bg-white/5 text-white/70'
                    }`}
                  >
                    Joue
                  </button>
                </div>
              </div>
            )}
            <label className="mt-4 block max-w-md">
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
          </section>
        )}

        {mode === 'teams' && (
          <section className="card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Équipes</h2>
                <p className="mt-1 text-sm text-white/60">Sélectionne un joueur, puis une équipe pour le déplacer.</p>
              </div>
              <button type="button" className="btn-ghost" onClick={distributeTeams}>
                Répartir équitablement
              </button>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
              <span className="text-sm text-white/60">Nombre d’équipes</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  aria-label="Retirer une équipe"
                  disabled={teamCount <= 2}
                  onClick={() => updateTeamCount(teamCount - 1)}
                  className="btn-ghost h-9 w-9 px-0 text-xl disabled:opacity-30"
                >
                  −
                </button>
                <span className="min-w-6 text-center text-lg font-bold">{teamCount}</span>
                <button
                  type="button"
                  aria-label="Ajouter une équipe"
                  disabled={teamCount >= 8}
                  onClick={() => updateTeamCount(teamCount + 1)}
                  className="btn-ghost h-9 w-9 px-0 text-xl disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
            {selectedPlayerId && (
              <p className="mt-4 rounded-xl border border-neon/40 bg-neon/10 px-3 py-2 text-sm text-neon">
                Choisis son équipe, ou retape le joueur pour annuler.
              </p>
            )}
            {unassignedPlayers.length > 0 && (
              <div className="mt-4 rounded-xl border border-dashed border-white/20 bg-white/[0.03] p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-white/45">Sans équipe</span>
                  <span className="text-xs text-white/50">{memberLabel(unassignedPlayers.length)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {unassignedPlayers.map((player) => (
                    <PlayerPill
                      key={player.id}
                      player={player}
                      selected={selectedPlayerId === player.id}
                      onSelect={() => selectPlayer(player)}
                      onKick={onKick}
                    />
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {teams.map((team) => (
                <div
                  key={team.number}
                  role="button"
                  tabIndex={selectedPlayerId ? 0 : undefined}
                  onClick={() => assignSelected(team.number)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') assignSelected(team.number);
                  }}
                  className={`rounded-xl border p-3 transition ${
                    selectedPlayerId
                      ? 'cursor-pointer border-neon/40 bg-neon/5 hover:bg-neon/15'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="min-w-0 flex-1" onClick={(event) => event.stopPropagation()}>
                      <span className="sr-only">Nom de l’équipe {team.number}</span>
                      <input
                        type="text"
                        maxLength={20}
                        value={teamDrafts[team.number - 1] ?? team.name}
                        onChange={(event) => {
                          const next = [...teamDrafts];
                          next[team.number - 1] = event.target.value;
                          setTeamDrafts(next);
                        }}
                        onBlur={() => commitTeamName(team.number - 1)}
                        className="w-full truncate bg-transparent font-semibold text-white outline-none placeholder:text-white/40 focus:border-b focus:border-neon"
                      />
                    </label>
                    <span className="shrink-0 text-xs text-white/50">{memberLabel(team.members.length)}</span>
                  </div>
                  <div className="mt-3 flex min-h-9 flex-wrap gap-2">
                    {team.members.length > 0 ? (
                      team.members.map((player) => (
                        <PlayerPill
                          key={player.id}
                          player={player}
                          selected={selectedPlayerId === player.id}
                          onSelect={() => selectPlayer(player)}
                          onKick={onKick}
                        />
                      ))
                    ) : (
                      <span className="text-sm text-white/35">
                        {selectedPlayerId ? 'Dépose le joueur ici' : 'Aucun membre'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {settings.hostPlays && host && (
              <p className="mt-4 text-sm text-white/55">
                Le buzzer de l’hôte <span className="font-semibold text-white">{host.name}</span> est affectable comme un membre.
              </p>
            )}
            {!settings.hostPlays && (
              <p className="mt-4 text-sm text-white/55">
                <span className="rounded bg-white/10 px-2 py-1 text-xs">Arbitre</span> L’hôte ne participe pas aux équipes.
              </p>
            )}
          </section>
        )}

        <button className="btn-primary w-full text-lg" disabled={!canStart} onClick={onStart}>
          {canStart
            ? `Lancer la partie (${mode === 'solo' ? '1 joueur' : `${teamBuzzers} buzzer${teamBuzzers > 1 ? 's' : ''}`})`
            : mode === 'teams'
              ? 'Répartissez les joueurs dans au moins 2 équipes'
              : 'En attente de joueurs…'}
        </button>
        {mode === 'teams' && !canStart && (
          <p className="text-center text-sm text-white/50">
            Au moins deux équipes doivent avoir un membre avant de lancer.
          </p>
        )}
      </div>

      <aside className="space-y-6">
        <div className="card">
          <QrJoin code={state.code} />
        </div>
        <div className="card">
          <h3 className="mb-3 font-bold">Joueurs connectés</h3>
          <ul className="space-y-2">
            {players.map((player) => (
              <li key={player.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
                <div className="min-w-0">
                  <span className="block truncate">{player.name}</span>
                  {mode === 'teams' && (
                    <span className="text-xs text-white/45">
                      {player.isHost && !settings.hostPlays
                        ? 'Arbitre'
                        : teamLabels[(player.team ?? 0) - 1] ?? 'Sans équipe'}
                    </span>
                  )}
                </div>
                {!player.isHost && (
                  <button
                    type="button"
                    className="shrink-0 text-xs text-white/40 hover:text-red-300"
                    onClick={() => onKick(player.id)}
                  >
                    retirer
                  </button>
                )}
              </li>
            ))}
            {players.length === 0 && <li className="text-sm text-white/40">Scannez le QR code pour rejoindre.</li>}
          </ul>
        </div>
      </aside>
    </div>
  );
}

interface PlayerPillProps {
  player: Player;
  selected: boolean;
  onSelect: () => void;
  onKick: (playerId: string) => void;
}

function PlayerPill({ player, selected, onSelect, onKick }: PlayerPillProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
        selected
          ? 'border-neon bg-neon/25 text-white ring-2 ring-neon/30'
          : 'border-white/10 bg-black/10 text-white/80 hover:border-white/25 hover:bg-white/10'
      }`}
    >
      <span className="max-w-32 truncate">{player.name}</span>
      {!player.isHost && (
        <span
          role="button"
          tabIndex={0}
          className="text-xs text-white/35 hover:text-red-300"
          onClick={(event) => {
            event.stopPropagation();
            onKick(player.id);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
              onKick(player.id);
            }
          }}
          aria-label={`Retirer ${player.name}`}
        >
          ×
        </span>
      )}
    </button>
  );
}
