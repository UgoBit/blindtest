import { useEffect, useState } from 'react';
import type { RoomState, Theme } from '../../../shared/types';
import { DIFFICULTIES } from '../../../shared/types';
import QrJoin from '../components/QrJoin';

interface Props {
  state: RoomState;
  isHost: boolean;
  onUpdate: (settings: Partial<RoomState['settings']>) => void;
  onRenameTeam: (name: string) => void;
  onStart: () => void;
  onKick: (playerId: string) => void;
}

const CATEGORY_LABELS: Record<Theme['category'], string> = {
  genre: 'Genres',
  epoque: 'Époques',
  culture: 'Culture',
};

export default function Lobby({ state, isHost, onUpdate, onRenameTeam, onStart, onKick }: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [teamName, setTeamName] = useState('Sur place');
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
  const canStart = guests.length > 0 || settings.hostPlays;

  useEffect(() => {
    if (host?.name) setTeamName(host.name);
  }, [host?.name]);

  if (!isHost) {
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
                Solo
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
                Par équipe
              </button>
            </div>
          </label>
          {settings.hostPlays && (
            <label className="block">
              <span className="text-sm text-white/60">Nom de l'équipe</span>
              <input
                type="text"
                maxLength={16}
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
                onBlur={() => onRenameTeam(teamName)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-neon"
              />
            </label>
          )}
        </section>

        <button className="btn-primary w-full text-lg" disabled={!canStart} onClick={onStart}>
          {canStart
            ? `Lancer la partie (${guests.length + (settings.hostPlays ? 1 : 0)} ${
                guests.length + (settings.hostPlays ? 1 : 0) > 1 ? 'buzzers' : 'buzzer'
              })`
            : 'En attente de joueurs…'}
        </button>
      </div>

      <aside className="space-y-6">
        <div className="card">
          <QrJoin code={state.code} />
        </div>
        <div className="card">
          <h3 className="mb-3 font-bold">Joueurs connectés</h3>
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
        </div>
      </aside>
    </div>
  );
}
