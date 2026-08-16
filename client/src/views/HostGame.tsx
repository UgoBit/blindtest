import { useEffect, useState } from 'react';
import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';
import ConfirmModal from '../components/ConfirmModal';

interface Props {
  state: RoomState;
  onCorrectAnswer: (field: 'title' | 'artist') => void;
  canSubmitAnswer: boolean;
  onSubmitAnswer: (answer: { title: string; artist: string }) => void;
  onSkip: () => void;
  onNext: () => void;
  onCancel: () => void;
}

export default function HostGame({
  state,
  onCorrectAnswer,
  canSubmitAnswer,
  onSubmitAnswer,
  onSkip,
  onNext,
  onCancel,
}: Props) {
  const buzzer = state.players.find((player) => player.id === state.buzzedBy) ?? null;
  const buzzerTeam = buzzer?.team
    ? state.teamScores.find((team) => team.team === buzzer.team)
    : null;
  const answer = state.answer;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerArtist, setAnswerArtist] = useState('');
  const [remainingResponseSeconds, setRemainingResponseSeconds] = useState(0);

  useEffect(() => {
    if (state.phase !== 'buzzed' || !state.responseDeadline) {
      setRemainingResponseSeconds(0);
      return;
    }
    const update = () => setRemainingResponseSeconds(Math.max(0, Math.ceil((state.responseDeadline! - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [state.phase, state.responseDeadline]);

  useEffect(() => {
    if (state.phase !== 'buzzed') {
      setAnswerTitle('');
      setAnswerArtist('');
    }
  }, [state.phase]);

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
            <p className="text-white/60">
              {remainingResponseSeconds > 0
                ? `Réponse en cours… ${remainingResponseSeconds}s restantes`
                : 'La personne tape sa réponse sur son appareil.'}
            </p>
            {canSubmitAnswer && (
              <form
                className="w-full max-w-md space-y-3 rounded-xl bg-white/5 p-4 text-left"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSubmitAnswer({ title: answerTitle, artist: answerArtist });
                }}
              >
                <h2 className="text-lg font-bold">Ta réponse</h2>
                <label className="block">
                  <span className="text-sm text-white/60">Titre</span>
                  <input
                    autoFocus
                    value={answerTitle}
                    onChange={(event) => setAnswerTitle(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-neon"
                    maxLength={120}
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-white/60">Artiste</span>
                  <input
                    value={answerArtist}
                    onChange={(event) => setAnswerArtist(event.target.value)}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-neon"
                    maxLength={120}
                  />
                </label>
                <button type="submit" className="btn-primary w-full">
                  Valider ma réponse
                </button>
              </form>
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
            {state.submittedAnswer && state.answerVerdict && (
              <div className="w-full max-w-md rounded-xl bg-white/5 p-4 text-left text-sm">
                <p className="mb-2 font-semibold text-white/70">Réponse tapée</p>
                {(['title', 'artist'] as const).map((field) => {
                  const label = field === 'title' ? 'Titre' : 'Artiste';
                  const value = state.submittedAnswer?.[field];
                  const accepted = state.answerVerdict?.[field];
                  return (
                    <div key={field} className="mt-2 flex items-center justify-between gap-3">
                      <span className="min-w-0 truncate">
                        <span className="text-white/50">{label} : </span>
                        {value || 'non renseigné'}
                      </span>
                      {value && (
                        accepted ? (
                          <span className="shrink-0 text-emerald-300">Validé</span>
                        ) : (
                          <button
                            type="button"
                            className="btn-ghost shrink-0 px-2 py-1 text-xs"
                            onClick={() => onCorrectAnswer(field)}
                          >
                            En fait c’était bon
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <button className="btn-primary" onClick={onNext}>
              Manche suivante
            </button>
          </>
        )}

        {(state.phase === 'listening' || state.phase === 'countdown' || state.phase === 'buzzed') && (
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
