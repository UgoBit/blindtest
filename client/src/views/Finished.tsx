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
  const winner = [...state.players].sort((a, b) => b.score - a.score)[0];

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12 text-center">
      <h2 className="text-4xl font-black">Partie terminée</h2>
      {winner && (
        <p className="text-2xl">
          🏆 <span className="font-bold text-neon">{winner.name}</span> gagne avec {winner.score} pts
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
