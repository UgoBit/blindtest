import { useEffect, useState } from 'react';
import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';

interface Props {
  state: RoomState;
  playerId: string;
  onBuzz: () => void;
}

export default function PlayerGame({ state, playerId, onBuzz }: Props) {
  const me = state.players.find((player) => player.id === playerId);
  const buzzer = state.players.find((player) => player.id === state.buzzedBy) ?? null;
  const iBuzzed = state.buzzedBy === playerId;
  const canBuzz = state.phase === 'listening' && !me?.lockedOut;
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!iBuzzed) return;
    setFlash(true);
    if (navigator.vibrate) navigator.vibrate(120);
    const id = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(id);
  }, [iBuzzed]);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between text-sm text-white/60">
        <span>{me?.name}</span>
        <span>
          Manche {state.track?.index ?? 0}/{state.track?.total ?? 0} · {me?.score ?? 0} pts
        </span>
      </header>

      <button
        onClick={onBuzz}
        disabled={!canBuzz}
        className={`relative aspect-square w-full rounded-full text-4xl font-black uppercase tracking-widest transition ${
          canBuzz
            ? 'bg-gradient-to-br from-neon to-accent shadow-glow active:scale-95'
            : 'bg-white/10 text-white/40'
        } ${flash ? 'ring-8 ring-white' : ''}`}
      >
        {state.phase === 'countdown' && 'Prêt…'}
        {state.phase === 'listening' && (me?.lockedOut ? 'Éliminé' : 'BUZZ')}
        {state.phase === 'buzzed' && (iBuzzed ? 'À toi !' : `${buzzer?.name ?? ''} buzze`)}
        {state.phase === 'reveal' && 'Réponse'}
      </button>

      {state.phase === 'reveal' && state.answer && (
        <div className="card text-center">
          <p className="text-xl font-bold">{state.answer.title}</p>
          <p className="text-white/60">{state.answer.artist}</p>
        </div>
      )}

      <section className="card">
        <h3 className="mb-3 font-bold">Scores</h3>
        <Scores players={state.players} highlight={playerId} />
      </section>
    </div>
  );
}
