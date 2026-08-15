import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';

export default function Finished({
  state,
  isHost,
  onRestart,
}: {
  state: RoomState;
  isHost: boolean;
  onRestart: () => void;
}) {
  const best = Math.max(0, ...state.players.map((p) => p.score));
  const leaders = state.players.filter((p) => p.score === best);
  const winner = best > 0 && leaders.length === 1 ? leaders[0] : null;
  const names = leaders.map((p) => p.name);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12 text-center">
      <h2 className="text-4xl font-black">Partie terminée</h2>
      {winner ? (
        <p className="text-2xl">
          🏆 <span className="font-bold text-neon">{winner.name}</span> gagne avec {winner.score} pts
        </p>
      ) : (
        <p className="text-2xl">
          🤝 <span className="font-bold text-neon">Égalité</span>{' '}
          {best === 0
            ? ', personne n’a marqué'
            : `entre ${names.slice(0, -1).join(', ')} et ${names[names.length - 1]} avec ${best} pts`}
        </p>
      )}
      <div className="card text-left">
        <Scores players={state.players} highlight={winner?.id} />
      </div>
      {isHost && (
        <button className="btn-primary" onClick={onRestart}>
          Rejouer
        </button>
      )}
    </div>
  );
}
