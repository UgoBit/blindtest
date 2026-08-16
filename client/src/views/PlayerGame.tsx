import { useEffect, useRef, useState } from 'react';
import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';

interface Props {
  state: RoomState;
  playerId: string;
  onBuzz: () => void;
  onSubmitAnswer: (answer: { title: string; artist: string }) => void;
}

export default function PlayerGame({ state, playerId, onBuzz, onSubmitAnswer }: Props) {
  const me = state.players.find((player) => player.id === playerId);
  const buzzer = state.players.find((player) => player.id === state.buzzedBy) ?? null;
  const buzzerTeam = buzzer?.team
    ? state.teamScores.find((team) => team.team === buzzer.team)
    : null;
  const currentTeamScore = me?.team
    ? state.teamScores.find((team) => team.team === me.team)?.score ?? 0
    : 0;
  const displayedScore = state.settings.mode === 'teams' ? currentTeamScore : me?.score ?? 0;
  const iBuzzed = state.buzzedBy === playerId;
  const canBuzz = state.phase === 'listening' && !me?.lockedOut;
  const [flash, setFlash] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const previousPhase = useRef(state.phase);
  const previousScore = useRef(displayedScore);
  const [revealDelta, setRevealDelta] = useState(0);
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerArtist, setAnswerArtist] = useState('');
  const [remainingResponseSeconds, setRemainingResponseSeconds] = useState(0);

  useEffect(() => {
    if (!iBuzzed || state.phase !== 'buzzed' || !state.responseDeadline) {
      setRemainingResponseSeconds(0);
      return;
    }
    const update = () => setRemainingResponseSeconds(Math.max(0, Math.ceil((state.responseDeadline! - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [iBuzzed, state.phase, state.responseDeadline]);

  useEffect(() => {
    if (state.phase !== 'buzzed') {
      setAnswerTitle('');
      setAnswerArtist('');
    }
  }, [state.phase]);

  useEffect(() => {
    if (!iBuzzed) return;
    setFlash(true);
    if (navigator.vibrate) navigator.vibrate(120);
    const id = setTimeout(() => setFlash(false), 600);
    return () => clearTimeout(id);
  }, [iBuzzed]);

  useEffect(() => {
    if (state.phase === 'reveal' && previousPhase.current !== 'reveal') {
      setRevealDelta(displayedScore - previousScore.current);
    }
    previousPhase.current = state.phase;
    previousScore.current = displayedScore;
  }, [displayedScore, state.phase]);

  useEffect(() => {
    setCoverFailed(false);
  }, [state.answer?.cover]);

  const phaseClass =
    state.phase === 'countdown'
      ? 'buzzer-countdown'
      : state.phase === 'listening' && me?.lockedOut
        ? 'buzzer-locked'
        : state.phase === 'listening'
          ? 'buzzer-listening'
          : state.phase === 'reveal'
            ? 'buzzer-reveal'
            : 'buzzer-settled';
  const hasCover = state.phase === 'reveal' && state.answer?.cover && !coverFailed;
  const buzzerInitial = buzzer?.name.trim().charAt(0).toUpperCase();

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between text-sm text-white/60">
        <span>{me?.name}</span>
        <span>
          Manche {state.track?.index ?? 0}/{state.track?.total ?? 0} · {displayedScore} pts
        </span>
      </header>

      <button
        onClick={onBuzz}
        disabled={!canBuzz}
        className={`buzzer relative isolate aspect-square w-full overflow-hidden rounded-full text-4xl font-black uppercase tracking-widest transition active:scale-95 disabled:active:scale-100 ${phaseClass} ${
          flash ? 'ring-8 ring-white' : ''
        }`}
      >
        {state.phase !== 'reveal' && (
          <>
            <span aria-hidden className="buzzer-ring buzzer-ring-one" />
            <span aria-hidden className="buzzer-ring buzzer-ring-two" />
            <span aria-hidden className="buzzer-ring buzzer-ring-three" />
          </>
        )}

        {state.phase === 'reveal' && hasCover ? (
          <img
            src={state.answer?.cover ?? undefined}
            alt=""
            className="absolute inset-0 h-full w-full rounded-full object-cover"
            onError={() => setCoverFailed(true)}
          />
        ) : state.phase === 'reveal' ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/80 to-neon/70 text-7xl">
            🎵
          </div>
        ) : null}

        {/* Keeps the answer readable on top of a bright cover. */}
        {state.phase === 'reveal' && <span className="absolute inset-0 bg-black/55" />}
        <span className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
          {state.phase === 'countdown' && 'Prêt…'}
          {state.phase === 'listening' && (me?.lockedOut ? 'Éliminé' : 'BUZZ')}
          {state.phase === 'buzzed' && (
            <>
              {iBuzzed ? (
                <>
                  <span className="text-4xl">À toi !</span>
                  <span className="buzzer-avatar">{me?.name.trim().charAt(0).toUpperCase()}</span>
                </>
              ) : (
                <>
                  <span className="buzzer-avatar text-3xl">{buzzerInitial}</span>
                  <span className="max-w-full break-words text-3xl leading-tight">{buzzer?.name ?? 'Quelqu’un'}</span>
                  <span className="text-base font-semibold normal-case tracking-normal text-white/70">
                    {state.settings.mode === 'teams' ? buzzerTeam?.score ?? 0 : buzzer?.score ?? 0} pts
                  </span>
                  {state.settings.mode === 'teams' && buzzerTeam && (
                    <span className="text-sm font-semibold normal-case tracking-normal text-white/65">
                      Équipe {buzzerTeam.name}
                    </span>
                  )}
                </>
              )}
            </>
          )}
          {state.phase === 'reveal' && (
            <>
              <span className="text-2xl normal-case tracking-normal">{state.answer?.title ?? 'Réponse'}</span>
              {state.answer?.artist && (
                <span className="text-base font-medium normal-case tracking-normal text-white/75">
                  {state.answer.artist}
                </span>
              )}
              {revealDelta > 0 && <span className="buzzer-points">+{revealDelta}</span>}
            </>
          )}
        </span>
      </button>

      {state.phase === 'buzzed' && iBuzzed && (
        <form
          className="card space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmitAnswer({ title: answerTitle, artist: answerArtist });
          }}
        >
          <div>
            <h2 className="text-lg font-bold">Ta réponse</h2>
            <p className="mt-1 text-sm text-white/60">
              Un seul champ suffit · {remainingResponseSeconds}s restantes
            </p>
          </div>
          <label className="block text-left">
            <span className="text-sm text-white/60">Titre</span>
            <input
              autoFocus
              value={answerTitle}
              onChange={(event) => setAnswerTitle(event.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-neon"
              maxLength={120}
            />
          </label>
          <label className="block text-left">
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

      <section className="card">
        <h3 className="mb-3 font-bold">Scores</h3>
        <Scores
          players={state.players}
          teams={state.teamScores}
          mode={state.settings.mode}
          highlight={playerId}
        />
      </section>
    </div>
  );
}
