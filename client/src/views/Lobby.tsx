import { useEffect, useState } from 'react';
import type { Player, RoomState, Theme } from '../../../shared/types';
import { DECADES_LIST, DIFFICULTIES, GENRES_LIST } from '../../../shared/types';
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
  isStarting?: boolean;
}

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
  isStarting = false,
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

  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [playlistError, setPlaylistError] = useState<string | null>(null);

  const selectedDecadesCount = settings.yearRanges?.length ?? 0;
  const selectedGenresCount = settings.genres?.length ?? 0;
  const selectedThemesCount = settings.themes.length;
  const hasCustomPlaylist = !!settings.customPlaylistId;
  const totalMusicSelected = selectedDecadesCount + selectedGenresCount + selectedThemesCount;

  const canStart =
    (totalMusicSelected > 0 || hasCustomPlaylist) &&
    (mode === 'solo'
      ? true
      : mode === 'teams'
        ? teamBuzzers > 0 && populatedTeams >= 2
        : teamBuzzers > 0);

  useEffect(() => {
    if (host?.name) setTeamName(host.name);
  }, [host?.name]);

  useEffect(() => {
    setTeamDrafts(teamNamesKey.split('\u0000'));
  }, [teamNamesKey]);

  const toggleDecade = (id: string) => {
    const current = settings.yearRanges ?? [];
    const next = current.includes(id) ? current.filter((y) => y !== id) : [...current, id];
    onUpdate({ yearRanges: next });
  };

  const selectAllDecades = () => {
    const allIds = DECADES_LIST.map((d) => d.id);
    const areAllSelected = allIds.every((id) => settings.yearRanges?.includes(id));
    onUpdate({ yearRanges: areAllSelected ? [] : allIds });
  };

  const toggleGenre = (id: string) => {
    const current = settings.genres ?? [];
    const next = current.includes(id) ? current.filter((g) => g !== id) : [...current, id];
    onUpdate({ genres: next });
  };

  const selectAllGenres = () => {
    const allIds = GENRES_LIST.map((g) => g.id);
    const areAllSelected = allIds.every((id) => settings.genres?.includes(id));
    onUpdate({ genres: areAllSelected ? [] : allIds });
  };

  const toggleTheme = (id: string) => {
    const next = settings.themes.includes(id)
      ? settings.themes.filter((theme) => theme !== id)
      : [...settings.themes, id];
    onUpdate({ themes: next });
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

  const cultureThemes = themes.filter((t) => t.category === 'culture');

  if (!isHost) {
    if (mode === 'teams') {
      const currentPlayer = players.find((player) => player.id === currentPlayerId);
      return (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-8 text-center">
          <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-accent to-neon" />
          <div>
            <h2 className="text-2xl font-bold">En attente du lancement…</h2>
            <p className="mt-1 text-sm text-white/60">
              L’hôte prépare la partie.
            </p>
          </div>

          <SelectionSummary settings={settings} themes={themes} />

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
      <div className="mx-auto flex max-w-lg flex-col items-center gap-6 px-4 py-8 text-center">
        <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-r from-accent to-neon" />
        <div>
          <h2 className="text-2xl font-bold">En attente du lancement…</h2>
          <p className="mt-1 text-sm text-white/60">L'hôte va bientôt lancer la partie !</p>
        </div>

        <SelectionSummary settings={settings} themes={themes} />

        <div className="card w-full text-left">
          <h3 className="mb-2 text-sm font-bold text-white/70">Joueurs connectés ({players.length})</h3>
          <ul className="flex flex-wrap gap-2">
            {players.map((player) => (
              <li
                key={player.id}
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  player.id === currentPlayerId
                    ? 'border border-neon/40 bg-neon/20 text-neon'
                    : 'bg-white/10 text-white/80'
                }`}
              >
                {player.name} {player.isHost && <span className="text-xs text-white/50">(Hôte)</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {/* Époques / Décennies */}
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">📅 Époques & Décennies</h2>
              <p className="mt-1 text-sm text-white/60">Choisis une ou plusieurs décennies musicales.</p>
            </div>
            <button
              type="button"
              onClick={selectAllDecades}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {DECADES_LIST.every((d) => settings.yearRanges?.includes(d.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {DECADES_LIST.map((dec) => {
              const active = settings.yearRanges?.includes(dec.id);
              return (
                <button
                  key={dec.id}
                  type="button"
                  onClick={() => toggleDecade(dec.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition ${
                    active
                      ? 'border-neon bg-neon/20 text-white shadow-glow'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{dec.emoji}</span>
                  <div className="min-w-0">
                    <span className="block font-bold leading-tight">{dec.label}</span>
                    <span className="block text-xs text-white/50">{dec.years}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Styles musicaux */}
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">🎸 Styles musicaux</h2>
              <p className="mt-1 text-sm text-white/60">Choisis un ou plusieurs genres.</p>
            </div>
            <button
              type="button"
              onClick={selectAllGenres}
              className="btn-ghost px-3 py-1.5 text-xs"
            >
              {GENRES_LIST.every((g) => settings.genres?.includes(g.id)) ? 'Tout désélectionner' : 'Tout sélectionner'}
            </button>
          </div>
          <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {GENRES_LIST.map((g) => {
              const active = settings.genres?.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  aria-pressed={active}
                  className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                    active
                      ? 'border-neon bg-neon/20 text-white shadow-glow'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="font-semibold">{g.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Thèmes cultes */}
        {cultureThemes.length > 0 && (
          <section className="card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">🎬 Thèmes cultes</h2>
                <p className="mt-1 text-sm text-white/60">Bandes originales, cinéma, jeux vidéo, pubs…</p>
              </div>
              <button
                type="button"
                onClick={() => onUpdate({ themes: [] })}
                disabled={settings.themes.length === 0}
                className="btn-ghost px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                Désélectionner
              </button>
            </div>
            <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {cultureThemes.map((theme) => {
                const active = settings.themes.includes(theme.id);
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => toggleTheme(theme.id)}
                    aria-pressed={active}
                    className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-sm transition ${
                      active
                        ? 'border-neon bg-neon/20 text-white shadow-glow'
                        : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-2xl">{theme.emoji}</span>
                    <span className="font-semibold">{theme.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Playlist Deezer personnalisée */}
        <section className="card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <span>🎵</span> Playlist Deezer personnalisée
              </h2>
              <p className="mt-1 text-sm text-white/60">
                Colle le lien ou l'ID d'une playlist Deezer publique pour jouer avec ta propre sélection !
              </p>
            </div>
            {settings.customPlaylistId && (
              <button
                type="button"
                onClick={() => {
                  setPlaylistUrl('');
                  setPlaylistError(null);
                  onUpdate({ customPlaylistId: null, customPlaylistTitle: null });
                }}
                className="btn-ghost px-3 py-1.5 text-xs text-rose-300 hover:text-rose-200"
              >
                Retirer la playlist
              </button>
            )}
          </div>

          {settings.customPlaylistId ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🎧</span>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                    Playlist active
                  </span>
                  <div className="text-lg font-bold text-white">
                    {settings.customPlaylistTitle ?? `Playlist #${settings.customPlaylistId}`}
                  </div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">
                Sélectionnée ✓
              </span>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => {
                    setPlaylistUrl(e.target.value);
                    setPlaylistError(null);
                  }}
                  placeholder="https://www.deezer.com/fr/playlist/12345678 ou ID..."
                  className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none focus:border-neon focus:ring-1 focus:ring-neon"
                />
                <button
                  type="button"
                  disabled={loadingPlaylist || !playlistUrl.trim()}
                  onClick={async () => {
                    if (!playlistUrl.trim()) return;
                    setLoadingPlaylist(true);
                    setPlaylistError(null);
                    try {
                      const res = await fetch(`/api/deezer-playlist?q=${encodeURIComponent(playlistUrl.trim())}`);
                      const data = await res.json();
                      if (!data.ok) {
                        setPlaylistError(data.error || 'Playlist introuvable');
                        return;
                      }
                      onUpdate({
                        customPlaylistId: data.id,
                        customPlaylistTitle: data.title,
                      });
                      setPlaylistUrl('');
                    } catch {
                      setPlaylistError('Erreur de connexion au serveur');
                    } finally {
                      setLoadingPlaylist(false);
                    }
                  }}
                  className="btn-primary px-5 py-2.5 text-sm shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loadingPlaylist ? 'Chargement…' : 'Importer'}
                </button>
              </div>
              {playlistError && (
                <p className="text-xs text-rose-400 font-medium">{playlistError}</p>
              )}
            </div>
          )}
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
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                id: 'phones' as const,
                label: 'Téléphones',
                hint: 'un seul buzz par manche',
                action: () => onUpdate({ mode: 'phones' }),
              },
              {
                id: 'solo' as const,
                label: 'Solo',
                hint: 'sur cet écran uniquement',
                action: () => onUpdate({ mode: 'solo', hostPlays: true }),
              },
              {
                id: 'teams' as const,
                label: 'Équipes',
                hint: 'score commun par équipe',
                action: () => onUpdate({ mode: 'teams', teamCount: teamCount }),
              },
              {
                id: 'course' as const,
                label: 'Course',
                hint: 'tout le monde tape sa réponse',
                action: () => onUpdate({ mode: 'course' }),
              },
            ].map((format) => (
              <button
                key={format.id}
                type="button"
                onClick={format.action}
                className={`rounded-xl border px-3 py-3 text-left text-sm transition ${
                  mode === format.id
                    ? 'border-neon bg-neon/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                <span className="block font-semibold">{format.label}</span>
                <span className="mt-1 block text-xs text-white/55">{format.hint}</span>
              </button>
            ))}
          </div>
          {mode === 'course' && (
            <p className="mt-3 text-sm text-white/60">
              Chacun tape sa réponse directement : plus tu réponds tôt, plus la réponse rapporte (3 pts
              avant 10s, 2 pts avant 20s, 1 pt ensuite).
            </p>
          )}
          {isHost && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <h3 className="font-semibold">Sortie du son</h3>
              <p className="mt-1 text-sm text-white/60">
                Active au moins une sortie. Pour jouer à distance, active le son sur chaque appareil.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onUpdate({ audioHostEnabled: !settings.audioHostEnabled })}
                  className={`rounded-xl border px-3 py-3 text-left text-sm ${
                    settings.audioHostEnabled
                      ? 'border-neon bg-neon/20'
                      : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                >
                  <span className="block font-semibold">Son sur cet écran</span>
                  <span className="mt-1 block text-xs text-white/55">L’écran de l’hôte diffuse la musique.</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ audioPlayersEnabled: !settings.audioPlayersEnabled })}
                  className={`rounded-xl border px-3 py-3 text-left text-sm ${
                    settings.audioPlayersEnabled
                      ? 'border-neon bg-neon/20'
                      : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                >
                  <span className="block font-semibold">Son sur chaque appareil</span>
                  <span className="mt-1 block text-xs text-white/55">Pour jouer chacun chez soi.</span>
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="text-xl font-bold">Réglages du format</h2>
          {mode === 'solo' ? (
            <div className="mt-4">
              <span className="text-sm text-white/60">Buzzer</span>
              <div className="mt-2 grid max-w-md grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate({ buzzerEnabled: true })}
                  className={`rounded-xl border px-3 py-2 text-left text-sm ${
                    settings.buzzerEnabled ? 'border-neon bg-neon/20' : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                >
                  <span className="block font-semibold">Avec buzzer</span>
                  <span className="mt-1 block text-xs text-white/55">On buzze et on tape la réponse.</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ buzzerEnabled: false })}
                  className={`rounded-xl border px-3 py-2 text-left text-sm ${
                    !settings.buzzerEnabled ? 'border-neon bg-neon/20' : 'border-white/10 bg-white/5 text-white/70'
                  }`}
                >
                  <span className="block font-semibold">Sans buzzer</span>
                  <span className="mt-1 block text-xs text-white/55">
                    Les extraits passent, on crie à voix haute, pas de score.
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <span className="text-sm text-white/60">Rôle de l’hôte (cet écran)</span>
              <div className="mt-2 grid max-w-md grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdate({ hostPlays: false })}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    !settings.hostPlays
                      ? 'border-neon bg-neon/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-semibold">Arbitre / DJ</span>
                  <span className="mt-0.5 block text-xs text-white/50">
                    Diffuse la musique, seuls les joueurs sur téléphone buzzent.
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdate({ hostPlays: true })}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    settings.hostPlays
                      ? 'border-neon bg-neon/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span className="block font-semibold">Joue aussi</span>
                  <span className="mt-0.5 block text-xs text-white/50">
                    L’hôte a aussi un buzzer sur l’écran pour participer.
                  </span>
                </button>
              </div>
            </div>
          )}

          {settings.hostPlays && (
            <label className="mt-4 block max-w-md">
              <span className="text-sm text-white/60">
                {mode === 'solo' ? 'Nom de l’équipe' : 'Pseudo de l’hôte'}
              </span>
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

        <button
          className="btn-primary relative w-full overflow-hidden text-lg"
          disabled={!canStart || isStarting}
          onClick={onStart}
        >
          {isStarting ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Préparation de la playlist…
            </span>
          ) : canStart
            ? `Lancer la partie (${mode === 'solo' ? '1 joueur' : `${teamBuzzers} buzzer${teamBuzzers > 1 ? 's' : ''}`})`
            : totalMusicSelected === 0
              ? 'Choisissez au moins une époque, un style ou un thème'
            : mode === 'teams'
              ? 'Répartissez les joueurs dans au moins 2 équipes'
              : 'En attente de joueurs…'}
        </button>
        {!canStart && totalMusicSelected === 0 && (
          <p className="text-center text-sm text-white/50">
            Sélectionnez au moins une époque, un style musical ou un thème avant de lancer la partie.
          </p>
        )}
        {mode === 'teams' && !canStart && totalMusicSelected > 0 && (
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
                  {mode === 'teams' ? (
                    <span className="text-xs text-white/45">
                      {player.isHost && !settings.hostPlays
                        ? 'Arbitre'
                        : teamLabels[(player.team ?? 0) - 1] ?? 'Sans équipe'}
                    </span>
                  ) : (
                    player.isHost && (
                      <span className="text-xs text-white/45">
                        {mode === 'solo'
                          ? 'Joueur (écran)'
                          : settings.hostPlays
                            ? 'Joueur (hôte)'
                            : 'Arbitre / DJ'}
                      </span>
                    )
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

function SelectionSummary({
  settings,
  themes,
}: {
  settings: RoomState['settings'];
  themes: Theme[];
}) {
  const selectedDecades = DECADES_LIST.filter((d) => settings.yearRanges?.includes(d.id));
  const selectedGenres = GENRES_LIST.filter((g) => settings.genres?.includes(g.id));
  const selectedThemes = themes.filter((t) => settings.themes?.includes(t.id));
  const difficultyObj = DIFFICULTIES.find((d) => d.id === settings.difficulty);

  const modeLabels: Record<string, string> = {
    phones: '📱 Téléphones',
    teams: '👥 Équipes',
    course: '🏁 Course contre la montre',
    solo: '🕹️ Solo',
  };

  const hasSelections =
    selectedDecades.length > 0 || selectedGenres.length > 0 || selectedThemes.length > 0;

  return (
    <section className="card w-full space-y-4 border border-white/10 bg-white/5 p-5 text-left shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="flex items-center gap-2 font-bold text-neon">
          <span>⚙️</span> Configuration de la partie
        </h3>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold text-white/70">
          {settings.rounds} manches · {settings.clipSeconds}s
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-black/20 p-2.5">
          <span className="mb-0.5 block text-white/50">Mode</span>
          <span className="font-semibold text-white">{modeLabels[settings.mode] ?? settings.mode}</span>
        </div>
        <div className="rounded-lg bg-black/20 p-2.5">
          <span className="mb-0.5 block text-white/50">Difficulté</span>
          <span className="font-semibold text-white">
            {difficultyObj?.label ?? settings.difficulty}
          </span>
        </div>
      </div>

      <div className="space-y-3 pt-1">
        {selectedDecades.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-white/50">📅 Époques & Décennies</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedDecades.map((dec) => (
                <span
                  key={dec.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white"
                >
                  <span>{dec.emoji}</span>
                  <span>{dec.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedGenres.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-white/50">🎸 Styles musicaux</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedGenres.map((gen) => (
                <span
                  key={gen.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white"
                >
                  <span>{gen.emoji}</span>
                  <span>{gen.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {selectedThemes.length > 0 && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-white/50">🎬 Thèmes culturels</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedThemes.map((thm) => (
                <span
                  key={thm.id}
                  className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-xs font-medium text-white"
                >
                  <span>{thm.emoji}</span>
                  <span>{thm.label}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {settings.customPlaylistId && (
          <div>
            <span className="mb-1.5 block text-xs font-semibold text-emerald-400">🎵 Playlist Deezer sur-mesure</span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-200 border border-emerald-500/30">
              <span>🎧</span>
              <span>{settings.customPlaylistTitle ?? `Playlist #${settings.customPlaylistId}`}</span>
            </span>
          </div>
        )}

        {!hasSelections && !settings.customPlaylistId && (
          <p className="text-xs italic text-white/40">Aucune sélection spécifique (Top hits généraux).</p>
        )}
      </div>
    </section>
  );
}
