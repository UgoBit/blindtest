import { useState } from 'react';
import type { HostTrack, RoomState } from '../../../shared/types';
import Scores from '../components/Scores';
import ConfirmModal from '../components/ConfirmModal';

interface Props {
  state: RoomState;
  track: HostTrack | null;
  onJudge: (title: boolean, artist: boolean) => void;
  onSkip: () => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function HostGame({ state, track, onJudge, onSkip, onNext, onCancel }: Props) {
  const buzzer = state.players.find((player) => player.id === state.buzzedBy) ?? null;
  const buzzerTeam = buzzer?.team
    ? state.teamScores.find((team) => team.team === buzzer.team)
    : null;
  const answer = state.answer;
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <div className="card flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
        <p className="text-sm uppercase tracking-widest text-white/40">
          Manche {state.track?.index ?? 0} / {state.track?.total ?? 0}
        </p>

        {state.phase === 'countdown' && (
          <p className="animate-pulse text-5xl font-black">Préparez-vous…</p>
        )}

        {state.phase === 'listening' && (
          <>
            <div className="flex h-32 items-end gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((bar) => (
                <span
                  key={bar}
                  className="w-4 animate-bounce rounded-full bg-gradient-to-t from-accent to-neon"
                  style={{ height: `${30 + ((bar * 37) % 70)}%`, animationDelay: `${bar * 90}ms` }}
                />
              ))}
            </div>
            <p className="text-2xl font-bold">Ça joue ! Qui buzze ?</p>
          </>
        )}

        {state.phase === 'buzzed' && buzzer && (
          <>
            <p className="text-4xl font-black text-neon">{buzzer.name} a buzzé !</p>
            {state.settings.mode === 'teams' && buzzerTeam && (
              <p className="text-lg font-semibold text-white/70">Équipe {buzzerTeam.name}</p>
            )}
            <p className="text-white/60">Réponse attendue : titre et/ou artiste</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button className="btn-primary" onClick={() => onJudge(true, true)}>
                Titre + artiste (+2)
              </button>
              <button className="btn-ghost" onClick={() => onJudge(true, false)}>
                Titre seul (+1)
              </button>
              <button className="btn-ghost" onClick={() => onJudge(false, true)}>
                Artiste seul (+1)
              </button>
              <button className="btn bg-red-500/80" onClick={() => onJudge(false, false)}>
                Raté
              </button>
            </div>
            {track && (
              <details className="text-sm text-white/40">
                <summary className="cursor-pointer">Voir la réponse</summary>
                <p className="mt-2">
                  {track.title} — {track.artist}
                </p>
              </details>
            )}
          </>
        )}

        {state.phase === 'reveal' && answer && (
          <>
            {answer.cover && <img src={answer.cover} alt="" className="h-40 w-40 rounded-2xl shadow-glow" />}
            <div>
              <p className="text-3xl font-black">{answer.title}</p>
              <p className="text-xl text-white/60">{answer.artist}</p>
            </div>
            <button className="btn-primary" onClick={onNext}>
              Manche suivante
            </button>
          </>
        )}

        {(state.phase === 'listening' || state.phase === 'countdown') && (
          <button className="btn-ghost" onClick={onSkip}>
            Passer / révéler
          </button>
        )}
      </div>

      <aside className="card">
        <h3 className="mb-3 font-bold">Scores</h3>
        <Scores
          players={state.players}
          teams={state.teamScores}
          mode={state.settings.mode}
          highlight={state.buzzedBy}
        />
        <div className="mt-4">
          <>
            <button className="btn bg-red-600 w-full" onClick={() => setConfirmOpen(true)}>
              Annuler la partie
            </button>
            <ConfirmModal
              open={confirmOpen}
              title="Annuler la partie"
              description="Tous les joueurs seront déconnectés et la partie sera supprimée."
              confirmLabel="Annuler la partie"
              onConfirm={() => {
                setConfirmOpen(false);
                onCancel();
              }}
              onCancel={() => setConfirmOpen(false)}
            />
          </>
        </div>
      </aside>
    </div>
  );
}
