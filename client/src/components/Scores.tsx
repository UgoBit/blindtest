import type { Player, TeamScore } from '../../../shared/types';

interface Props {
  players: Player[];
  teams?: TeamScore[];
  mode?: 'phones' | 'solo' | 'teams';
  highlight?: string | null;
  highlightTeam?: number | null;
}

export default function Scores({ players, teams = [], mode = 'phones', highlight, highlightTeam }: Props) {
  if (mode === 'teams') {
    const highlightedPlayer = players.find((player) => player.id === highlight);
    const rankedTeams = [...teams].sort((a, b) => b.score - a.score);
    if (rankedTeams.length === 0) return <p className="text-white/50">Aucune équipe pour l'instant.</p>;

    return (
      <ul className="space-y-3">
        {rankedTeams.map((team, index) => {
          const members = players.filter((player) => player.team === team.team);
          const highlighted = highlightedPlayer?.team === team.team || highlightTeam === team.team;
          return (
            <li
              key={team.team}
              className={`rounded-xl px-4 py-3 ${
                highlighted ? 'bg-neon/20 ring-1 ring-neon' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="w-5 shrink-0 text-white/40">{index + 1}</span>
                  <span className="truncate font-semibold">{team.name}</span>
                  {highlighted && <span className="text-xs text-neon">buzz</span>}
                </span>
                <span className="shrink-0 font-bold text-accent">{team.score} pts</span>
              </div>
              <ul className="mt-2 space-y-1 pl-8 text-sm text-white/55">
                {members.length > 0 ? (
                  members.map((player) => (
                    <li key={player.id} className={player.connected ? '' : 'text-white/35 line-through'}>
                      {player.name}
                      {player.isHost && (
                        <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px]">écran</span>
                      )}{' '}
                      <span className="text-white/35">({player.score} pts)</span>
                    </li>
                  ))
                ) : (
                  <li>Aucun membre</li>
                )}
              </ul>
            </li>
          );
        })}
      </ul>
    );
  }

  const ranked = [...players].sort((a, b) => b.score - a.score);
  if (ranked.length === 0) return <p className="text-white/50">Aucun joueur pour l'instant.</p>;

  return (
    <ul className="space-y-2">
      {ranked.map((player, index) => (
        <li
          key={player.id}
          className={`flex items-center justify-between rounded-xl px-4 py-2 ${
            player.id === highlight ? 'bg-neon/20 ring-1 ring-neon' : 'bg-white/5'
          }`}
        >
          <span className="flex items-center gap-3">
            <span className="w-5 text-white/40">{index + 1}</span>
            <span className={player.connected ? '' : 'text-white/40 line-through'}>{player.name}</span>
            {player.isHost && <span className="rounded bg-white/10 px-2 py-0.5 text-xs">écran</span>}
          </span>
          <span className="font-bold text-accent">{player.score}</span>
        </li>
      ))}
    </ul>
  );
}
