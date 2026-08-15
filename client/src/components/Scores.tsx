import type { Player } from '../../../shared/types';

export default function Scores({ players, highlight }: { players: Player[]; highlight?: string | null }) {
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
            {player.isHost && <span className="rounded bg-white/10 px-2 py-0.5 text-xs">équipe</span>}
          </span>
          <span className="font-bold text-accent">{player.score}</span>
        </li>
      ))}
    </ul>
  );
}
