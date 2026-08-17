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
  const scoring = state.settings.buzzerEnabled;
  const teamMode = state.settings.mode === 'teams';
  const best = Math.max(0, ...(teamMode ? state.teamScores.map((team) => team.score) : state.players.map((p) => p.score)));
  const leaders = teamMode
    ? state.teamScores.filter((team) => team.score === best)
    : state.players.filter((p) => p.score === best);
  const winner = best > 0 && leaders.length === 1 ? leaders[0] : null;
  const names = leaders.map((leader) => leader.name);
  const winningPlayer = winner && 'id' in winner ? winner : null;
  const winningTeam = winner && 'team' in winner ? winner : null;

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12 text-center">
      <h2 className="text-4xl font-black">Partie terminée</h2>
      {!scoring ? (
        <p className="text-xl text-white/70">Tous les extraits sont passés.</p>
      ) : winner ? (
        <p className="text-2xl">
          🏆 <span className="font-bold text-neon">{winner.name}</span> gagne avec {winner.score} pts
        </p>
      ) : (
        <p className="text-2xl">
          🤝 <span className="font-bold text-neon">Égalité</span>
          {best === 0
            ? ', personne n’a marqué'
            : ` entre ${names.slice(0, -1).join(', ')} et ${names[names.length - 1]} avec ${best} pts`}
        </p>
      )}
      {scoring && (
        <div className="card text-left">
          <Scores
            players={state.players}
            teams={state.teamScores}
            mode={state.settings.mode}
            highlight={winningPlayer?.id}
            highlightTeam={winningTeam?.team}
          />
        </div>
      )}
      {isHost && (
        <button className="btn-primary" onClick={onRestart}>
          Rejouer
        </button>
      )}
    </div>
  );
}
