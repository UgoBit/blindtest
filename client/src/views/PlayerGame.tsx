import { useEffect, useRef, useState } from 'react';
import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';
import AnswerForm from '../components/AnswerForm';

interface Props {
  state: RoomState;
  playerId: string;
  onBuzz: () => void;
  onSubmitAnswer: (answer: { title: string; artist: string }) => void;
}

export default function PlayerGame({
  state,
  playerId,
  onBuzz,
  onSubmitAnswer,
}: Props) {
  const me = state.players.find((player) => player.id === playerId);
  const buzzer = state.players.find((player) => player.id === state.buzzedBy) ?? null;
  const buzzerTeam = buzzer?.team
    ? state.teamScores.find((team) => team.team === buzzer.team)
    : null;
  const currentTeamScore = me?.team
    ? state.teamScores.find((team) => team.team === me.team)?.score ?? 0
    : 0;
  const displayedScore = state.settings.mode === 'teams' ? currentTeamScore : me?.score ?? 0;
  const isCourse = state.settings.mode === 'course';
  const iRace = state.racers.includes(playerId);
  const iAnswered = state.answeredBy.includes(playerId);
  const iBuzzed = state.buzzedBy === playerId || iRace;
  const canBuzz = state.phase === 'listening' && !me?.lockedOut && !iRace && !iAnswered;
  const canSubmit =
    state.phase === 'buzzed'
      ? state.buzzedBy === playerId &&
        !state.submittedAnswer &&
        (state.responseDeadline ? state.responseDeadline > Date.now() : true)
      : isCourse && state.phase === 'listening' && !iAnswered && !me?.lockedOut;

  const [flash, setFlash] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const previousPhase = useRef(state.phase);
  const previousScore = useRef(displayedScore);
  const [revealDelta, setRevealDelta] = useState(0);
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerArtist, setAnswerArtist] = useState('');
  const [remainingResponseSeconds, setRemainingResponseSeconds] = useState(0);

  const answeredNames = state.answeredBy
    .map((id) => state.players.find((player) => player.id === id)?.name)
    .filter((name): name is string => !!name);

  useEffect(() => {
    if (!canSubmit || !state.responseDeadline) {
      setRemainingResponseSeconds(0);
      return;
    }
    const update = () =>
      setRemainingResponseSeconds(Math.max(0, Math.ceil((state.responseDeadline! - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [canSubmit, state.responseDeadline]);

  useEffect(() => {
    if (state.phase === 'countdown' || state.phase === 'reveal') {
      setAnswerTitle('');
      setAnswerArtist('');
    } else {
      if (state.awarded?.title && state.foundFields?.title) {
        setAnswerTitle(state.foundFields.title);
      }
      if (state.awarded?.artist && state.foundFields?.artist) {
        setAnswerArtist(state.foundFields.artist);
      }
    }
  }, [state.phase, state.awarded, state.foundFields]);

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
  const clipTotal = state.settings.clipSeconds ?? 30;

  // Exact timestamp-based smooth remaining seconds
  const [smoothRemaining, setSmoothRemaining] = useState<number>(state.remainingSeconds);

  useEffect(() => {
    if (state.phase !== 'listening') {
      setSmoothRemaining(
        state.phase === 'buzzed' ? state.remainingSeconds : state.phase === 'countdown' ? clipTotal : 0,
      );
      return;
    }
    let raf = 0;
    const tick = () => {
      if (state.phase !== 'listening' || !state.clipEndsAt) return;
      const remaining = Math.max(0, (state.clipEndsAt - Date.now()) / 1000);
      setSmoothRemaining(remaining);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [state.phase, state.clipEndsAt, state.remainingSeconds, clipTotal]);

  const pct = Math.max(0, Math.min(100, (smoothRemaining / clipTotal) * 100));

  const titleLocked = !!state.awarded?.title && state.phase !== 'reveal';
  const artistLocked = !!state.awarded?.artist && state.phase !== 'reveal';

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-6">
      <header className="flex items-center justify-between text-sm text-white/70">
        <span className="font-semibold">{me?.name}</span>
        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-bold text-accent">
          Manche {state.track?.index ?? 0}/{state.track?.total ?? 0} · {displayedScore} pts
        </span>
      </header>

      {/* MODE COURSE : Saisie directe sans buzzer inutile */}
      {isCourse && state.phase === 'listening' ? (
        <div className="card space-y-4 text-center">
          <div className="flex items-center justify-between text-xs font-semibold text-white/50">
            <span>Course contre la montre</span>
            <span>{Math.ceil(smoothRemaining)}s</span>
          </div>

          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-accent to-neon"
              style={{ width: `${pct}%`, transition: 'width 100ms linear' }}
            />
          </div>

          {answeredNames.length > 0 && (
            <p className="text-xs text-neon">
              {answeredNames.join(', ')} {answeredNames.length > 1 ? 'ont' : 'a'} déjà répondu !
            </p>
          )}

          {me?.lockedOut ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-6">
              <p className="text-xl font-bold text-rose-300">Éliminé pour cette manche</p>
              <p className="mt-1 text-sm text-white/50">Mauvaise réponse. Attends la manche suivante !</p>
            </div>
          ) : iAnswered ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-6">
              <p className="text-2xl font-bold text-emerald-300">Réponse envoyée ✓</p>
              <p className="mt-1 text-sm text-white/60">En attente de la fin de l’extrait…</p>
            </div>
          ) : (
            <AnswerForm
              className="space-y-3 text-left"
              hint="Tape vite : 3 pts si <10s, 2 pts si <20s, 1 pt ensuite"
              title={answerTitle}
              artist={answerArtist}
              onTitle={setAnswerTitle}
              onArtist={setAnswerArtist}
              onSubmit={() => onSubmitAnswer({ title: answerTitle, artist: answerArtist })}
            />
          )}
        </div>
      ) : (
        /* MODE STANDARD OU COURSE EN REVEAL / COUNTDOWN */
        <button
          onClick={onBuzz}
          disabled={!canBuzz || isCourse}
          className={`buzzer relative isolate aspect-square w-full overflow-hidden rounded-full text-4xl font-black uppercase tracking-widest transition active:scale-95 disabled:active:scale-100 ${phaseClass} ${
            flash ? 'ring-8 ring-white' : ''
          }`}
        >
          {(state.phase === 'listening' || state.phase === 'buzzed') && (
            <svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
              style={{ zIndex: 0, position: 'absolute', left: 0, top: 0 }}
            >
              <defs>
                <linearGradient id="g1" x1="0%" x2="100%">
                  <stop offset="0%" stopColor="#7c5cff" />
                  <stop offset="100%" stopColor="#ff2e88" />
                </linearGradient>
              </defs>
              <circle cx="50" cy="50" r="44" fill="url(#g1)" fillOpacity={0.18} />

              {(() => {
                const rInner = 44;
                const circumference = Math.PI * 2 * rInner;
                const dashOffset = circumference * (pct / 100);
                return (
                  <circle
                    cx="50"
                    cy="50"
                    r={rInner}
                    fill="none"
                    stroke="#2b2b2b"
                    strokeWidth={rInner * 2}
                    strokeLinecap="butt"
                    strokeDasharray={circumference}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%',
                      strokeDashoffset: dashOffset,
                      transition: 'stroke-dashoffset 100ms linear',
                      willChange: 'stroke-dashoffset',
                    }}
                  />
                );
              })()}
            </svg>
          )}
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

          {state.phase === 'reveal' && <span className="absolute inset-0 bg-black/55" />}
          <span className="relative z-10 flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
            {state.phase === 'countdown' && 'Prêt…'}
            {state.phase === 'listening' &&
              (me?.lockedOut
                ? 'Éliminé'
                : iAnswered
                  ? 'Envoyé ✓'
                  : iRace
                    ? 'À toi !'
                    : 'BUZZ')}
            {state.phase === 'buzzed' && (
              <>
                {iBuzzed ? (
                  <span className="text-4xl">À toi !</span>
                ) : (
                  <>
                    <span className="max-w-full break-words text-3xl leading-tight">
                      {buzzer?.name ?? 'Quelqu’un'}
                    </span>
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
      )}

      {/* ENCART FEEDBACK LISIBLE LORS DU BUZZ (HORS BOUTON CIRCULAIRE) */}
      {state.phase === 'buzzed' && state.submittedAnswer && state.answerVerdict && (
        <div className="card space-y-2 border border-white/15 bg-black/50 p-4 text-left text-sm animate-fade-in shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-white/55">
            <span>Réponse proposée par {buzzer?.name ?? 'Quelqu’un'}</span>
            <span className="font-semibold text-neon">Résultat</span>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="truncate text-white/80">
                <span className="text-xs text-white/40">Titre : </span>
                {state.submittedAnswer.title || <span className="italic text-white/30">non renseigné</span>}
              </span>
              <span
                className={`ml-2 shrink-0 text-xs font-bold ${
                  state.answerVerdict.title ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                {state.answerVerdict.title ? '✓ Validé' : '✗ Incorrect'}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
              <span className="truncate text-white/80">
                <span className="text-xs text-white/40">Artiste : </span>
                {state.submittedAnswer.artist || <span className="italic text-white/30">non renseigné</span>}
              </span>
              <span
                className={`ml-2 shrink-0 text-xs font-bold ${
                  state.answerVerdict.artist ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                {state.answerVerdict.artist ? '✓ Validé' : '✗ Incorrect'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* FORMULAIRE BUZZ CLASSIQUE (Hors course) */}
      {!isCourse && canSubmit && (
        <AnswerForm
          className="card space-y-3 text-left animate-fade-in"
          hint={`Tape vite · ${remainingResponseSeconds}s restantes`}
          title={answerTitle}
          artist={answerArtist}
          titleLocked={titleLocked}
          artistLocked={artistLocked}
          onTitle={setAnswerTitle}
          onArtist={setAnswerArtist}
          onSubmit={() => onSubmitAnswer({ title: answerTitle, artist: answerArtist })}
        />
      )}

      {/* RÉCAPITULATIF TOUTES LES RÉPONSES EN REVEAL (HORS COURSE) */}
      {!isCourse && state.phase === 'reveal' && state.roundAttempts && state.roundAttempts.length > 0 && (
        <section className="card space-y-3 text-left text-sm">
          <h3 className="font-bold text-neon">🏁 Réponses de la manche</h3>
          {state.roundAttempts.map((attempt, index) => {
            const isMe = attempt.playerId === playerId;
            return (
              <div
                key={`${attempt.playerId}-${index}`}
                className={`rounded-xl p-3 transition ${
                  isMe ? 'border border-neon/40 bg-neon/15' : 'bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold">
                    {attempt.name} {isMe && <span className="text-xs text-neon">(Toi)</span>}
                  </span>
                  <span className="text-xs text-white/60">
                    <span className={attempt.points > 0 ? 'font-bold text-accent' : 'text-white/40'}>
                      {attempt.points > 0 ? `+${attempt.points}` : '0'} pt{attempt.points > 1 ? 's' : ''}
                    </span>
                  </span>
                </div>

                <div className="mt-2 space-y-1 text-xs">
                  {attempt.title && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Titre : {attempt.title}</span>
                      <span className={attempt.verdict.title ? 'font-bold text-emerald-300' : 'text-rose-400'}>
                        {attempt.verdict.title ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                  {attempt.artist && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/70">Artiste : {attempt.artist}</span>
                      <span className={attempt.verdict.artist ? 'font-bold text-emerald-300' : 'text-rose-400'}>
                        {attempt.verdict.artist ? '✓' : '✗'}
                      </span>
                    </div>
                  )}
                  {!attempt.title && !attempt.artist && (
                    <span className="italic text-white/40">Aucune réponse renseignée</span>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {/* RÉCAPITULATIF MODE COURSE EN REVEAL (TOUTES LES RÉPONSES DES JOUEURS) */}
      {isCourse && state.phase === 'reveal' && (
        <section className="card space-y-3 text-left text-sm">
          <h3 className="font-bold text-neon">🏁 Réponses de la manche</h3>
          {state.raceAnswers.length > 0 ? (
            state.raceAnswers.map((race) => {
              const isMe = race.playerId === playerId;
              return (
                <div
                  key={race.playerId}
                  className={`rounded-xl p-3 transition ${
                    isMe ? 'border border-neon/40 bg-neon/15' : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold">
                      {race.name} {isMe && <span className="text-xs text-neon">(Toi)</span>}
                    </span>
                    <span className="text-xs text-white/60">
                      buzz à {race.seconds}s ·{' '}
                      <span className={race.points > 0 ? 'font-bold text-accent' : 'text-white/40'}>
                        {race.points > 0 ? `+${race.points}` : '0'} pt{race.points > 1 ? 's' : ''}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2 space-y-1 text-xs">
                    {race.title && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Titre : {race.title}</span>
                        <span className={race.verdict.title ? 'font-bold text-emerald-300' : 'text-rose-400'}>
                          {race.verdict.title ? '✓' : '✗'}
                        </span>
                      </div>
                    )}
                    {race.artist && (
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Artiste : {race.artist}</span>
                        <span className={race.verdict.artist ? 'font-bold text-emerald-300' : 'text-rose-400'}>
                          {race.verdict.artist ? '✓' : '✗'}
                        </span>
                      </div>
                    )}
                    {!race.title && !race.artist && (
                      <span className="italic text-white/40">Aucune réponse renseignée</span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-white/50">Personne n'a répondu à cette manche.</p>
          )}
        </section>
      )}

      <section className="card">
        <h3 className="mb-3 font-bold">Scores</h3>
        <Scores
          players={state.players}
          teams={state.teamScores}
          mode={state.settings.mode}
          hostPlays={state.settings.hostPlays}
          highlight={playerId}
        />
      </section>
    </div>
  );
}
