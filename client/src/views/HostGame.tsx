import { useEffect, useState } from 'react';
import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';
import ConfirmModal from '../components/ConfirmModal';
import AnswerForm from '../components/AnswerForm';

interface Props {
  state: RoomState;
  onCorrectAnswer: (field: 'title' | 'artist', playerId?: string) => void;
  canSubmitAnswer: boolean;
  onSubmitAnswer: (answer: { title: string; artist: string }) => void;
  onSkip: () => void;
  onNext: () => void;
  onCancel: () => void;
}

const CATEGORY_BADGES: Record<string, { label: string; emoji: string; color: string }> = {
  pub: { label: 'Publicité', emoji: '📢', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  films: { label: 'Musique de film', emoji: '🎬', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  disney: { label: 'Disney & Pixar', emoji: '🏰', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
  'dessins-animes': { label: 'Série & Dessin animé', emoji: '📺', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  'jeux-video': { label: 'Jeu vidéo', emoji: '🎮', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
};

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
  const isCourse = state.settings.mode === 'course';
  const scoring = state.settings.buzzerEnabled;
  const answeredNames = state.answeredBy
    .map((id) => state.players.find((player) => player.id === id)?.name)
    .filter((name): name is string => !!name);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [answerTitle, setAnswerTitle] = useState('');
  const [answerArtist, setAnswerArtist] = useState('');
  const [remainingResponseSeconds, setRemainingResponseSeconds] = useState(0);

  const clipTotal = state.settings.clipSeconds ?? 30;
  const workCat = state.workCategory ?? state.track?.workCategory;
  const badge = workCat ? CATEGORY_BADGES[workCat] : null;

  // Exact timestamp-based smooth remaining seconds with clock calibration
  const [smoothRemaining, setSmoothRemaining] = useState<number>(state.remainingSeconds);

  useEffect(() => {
    if (state.phase !== 'listening') {
      setSmoothRemaining(
        state.phase === 'buzzed' ? state.remainingSeconds : state.phase === 'countdown' ? clipTotal : 0,
      );
      return;
    }

    const serverOffset = (state.serverTime ?? Date.now()) - Date.now();
    let raf = 0;
    const tick = () => {
      if (state.phase !== 'listening') return;
      if (state.clipEndsAt) {
        const estimatedServerNow = Date.now() + serverOffset;
        const remaining = Math.max(0, (state.clipEndsAt - estimatedServerNow) / 1000);
        setSmoothRemaining(remaining);
      } else {
        setSmoothRemaining(state.remainingSeconds);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [state.phase, state.clipEndsAt, state.serverTime, clipTotal]);

  const pct = Math.max(0, Math.min(100, (smoothRemaining / clipTotal) * 100));

  useEffect(() => {
    if (!state.responseDeadline) {
      setRemainingResponseSeconds(0);
      return;
    }
    const update = () =>
      setRemainingResponseSeconds(Math.max(0, Math.ceil((state.responseDeadline! - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [state.phase, state.responseDeadline]);

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

  const titleLocked = !!state.awarded?.title && state.phase !== 'reveal';
  const artistLocked = !!state.awarded?.artist && state.phase !== 'reveal';

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <div className="card flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Manche {state.track?.index ?? 0} / {state.track?.total ?? 0}
          </p>
          {badge && (
            <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${badge.color}`}>
              <span>{badge.emoji}</span>
              <span>{badge.label}</span>
            </span>
          )}
        </div>

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
            <p className="text-2xl font-bold">
              {!scoring
                ? 'Ça joue ! Criez la réponse à voix haute'
                : isCourse
                  ? 'Ça joue ! Tout le monde peut buzzer'
                  : 'Ça joue ! Qui buzze ?'}
            </p>
            {isCourse && (
              <p className="text-white/60">
                {remainingResponseSeconds > 0 && `${remainingResponseSeconds}s d’extrait · `}
                {answeredNames.length > 0
                  ? `${answeredNames.join(', ')} ${answeredNames.length > 1 ? 'ont' : 'a'} répondu`
                  : 'personne n’a encore répondu'}
              </p>
            )}
            <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full bg-gradient-to-r from-accent to-neon"
                style={{
                  width: `${pct}%`,
                  transition: state.phase === 'listening' ? 'none' : 'width 200ms ease-out',
                  willChange: 'width',
                }}
              />
            </div>
            {isCourse && canSubmitAnswer && (
              <AnswerForm
                hint={state.isSingleField ? "Trouve l'œuvre, le titre ou l'artiste !" : "Un seul champ suffit · plus tu buzzes tôt, plus ça rapporte"}
                title={answerTitle}
                artist={answerArtist}
                singleField={state.isSingleField}
                onTitle={setAnswerTitle}
                onArtist={setAnswerArtist}
                onSubmit={() => onSubmitAnswer({ title: answerTitle, artist: answerArtist })}
              />
            )}
          </>
        )}

        {state.phase === 'buzzed' && (buzzer || state.submittedAnswer) && (
          <>
            <p className="text-4xl font-black text-neon">{buzzer?.name ?? 'Sur place'} a buzzé !</p>
            {state.settings.mode === 'teams' && buzzerTeam && (
              <p className="text-lg font-semibold text-white/70">Équipe {buzzerTeam.name}</p>
            )}
            <p className="text-white/60">
              {remainingResponseSeconds > 0
                ? `Réponse en cours… ${remainingResponseSeconds}s restantes`
                : 'La personne tape sa réponse sur son appareil.'}
            </p>
            {state.submittedAnswer && state.answerVerdict ? (
              <div className="mt-6 w-full max-w-2xl rounded-xl bg-gradient-to-r from-rose-600/30 via-purple-700/20 to-accent/20 p-6 text-left text-sm shadow-lg z-50 animate-fade-in">
                <div className="mb-2 text-sm text-white/60">Réponse envoyée par {buzzer?.name ?? 'Sur place'}</div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{state.submittedAnswer.title || '—'}</div>
                    {!state.isSingleField && <div className="text-white/70">{state.submittedAnswer.artist || '—'}</div>}
                  </div>
                  <div className="text-right">
                    {state.isSingleField ? (
                      <div className={state.answerVerdict.title || state.answerVerdict.artist ? 'text-emerald-300 font-bold text-lg' : 'text-rose-400 font-bold text-lg'}>
                        {state.answerVerdict.title || state.answerVerdict.artist ? 'Bonne réponse ✓' : 'Faux ✗'}
                      </div>
                    ) : (
                      <>
                        <div className={state.answerVerdict.title ? 'text-emerald-300 font-bold' : 'text-rose-400'}>
                          {state.answerVerdict.title ? 'Titre OK ✓' : 'Titre ✗'}
                        </div>
                        <div className={state.answerVerdict.artist ? 'text-emerald-300 font-bold' : 'text-rose-400'}>
                          {state.answerVerdict.artist ? 'Artiste OK ✓' : 'Artiste ✗'}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              canSubmitAnswer && (
                <AnswerForm
                  title={answerTitle}
                  artist={answerArtist}
                  titleLocked={titleLocked}
                  artistLocked={artistLocked}
                  singleField={state.isSingleField}
                  hint={state.isSingleField ? "Trouve l'œuvre (film, disney, pub, jeu...), le titre ou l'artiste !" : undefined}
                  onTitle={setAnswerTitle}
                  onArtist={setAnswerArtist}
                  onSubmit={() => onSubmitAnswer({ title: answerTitle, artist: answerArtist })}
                />
              )
            )}
          </>
        )}

        {state.phase === 'reveal' && answer && (
          <>
            {answer.cover && <img src={answer.cover} alt="" className="h-40 w-40 rounded-2xl shadow-glow" />}
            
            {answer.work && (
              <div className="rounded-xl border border-neon/30 bg-neon/15 px-6 py-2.5 text-center shadow-glow">
                <span className="text-xs uppercase tracking-wider text-neon font-bold">
                  {badge ? badge.label : 'Œuvre / Franchise'}
                </span>
                <p className="text-3xl font-black text-white">{answer.work}</p>
              </div>
            )}

            <div>
              <p className={answer.work ? "text-2xl font-bold text-white/90" : "text-3xl font-black"}>{answer.title}</p>
              <p className="text-lg text-white/60">{answer.artist}</p>
            </div>

            {/* Mode Course : toutes les réponses */}
            {isCourse && state.raceAnswers.length > 0 && (
              <div className="w-full max-w-md space-y-3 rounded-xl bg-white/5 p-4 text-left text-sm">
                <p className="font-semibold text-white/70">Réponses de la manche</p>
                {state.raceAnswers.map((race) => (
                  <div key={race.playerId} className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-semibold">{race.name}</span>
                      <span className="shrink-0 text-white/60">
                        buzz à {race.seconds}s ·{' '}
                        <span className={race.points > 0 ? 'font-bold text-accent' : 'text-white/50'}>
                          {race.points > 0 ? `+${race.points}` : '0'} pt{race.points > 1 ? 's' : ''}
                        </span>
                      </span>
                    </div>
                    {(['title', 'artist'] as const).map((field) => {
                      const value = race[field];
                      if (!value) return null;
                      return (
                        <div key={field} className="mt-2 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate">
                            <span className="text-white/50">{field === 'title' ? 'Titre' : 'Artiste'} : </span>
                            {value}
                          </span>
                          {race.verdict[field] ? (
                            <span className="shrink-0 text-emerald-300 font-semibold">Validé ✓</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-ghost shrink-0 px-2 py-1 text-xs text-neon hover:bg-neon/10"
                              onClick={() => onCorrectAnswer(field, race.playerId)}
                            >
                              En fait c’était bon
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {!race.title && !race.artist && <p className="mt-2 text-white/45">Réponse vide</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Modes Téléphones / Équipes / Solo : toutes les tentatives de la manche */}
            {!isCourse && state.roundAttempts && state.roundAttempts.length > 0 && (
              <div className="w-full max-w-md space-y-3 rounded-xl bg-white/5 p-4 text-left text-sm">
                <p className="font-semibold text-white/70">Réponses tentées dans la manche</p>
                {state.roundAttempts.map((attempt, index) => (
                  <div key={`${attempt.playerId}-${index}`} className="rounded-lg bg-black/20 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="truncate font-semibold">{attempt.name}</span>
                      <span className="shrink-0 text-white/60">
                        <span className={attempt.points > 0 ? 'font-bold text-accent' : 'text-white/50'}>
                          {attempt.points > 0 ? `+${attempt.points}` : '0'} pt{attempt.points > 1 ? 's' : ''}
                        </span>
                      </span>
                    </div>
                    {(['title', 'artist'] as const).map((field) => {
                      const label = field === 'title' ? 'Titre' : 'Artiste';
                      const value = attempt[field];
                      const accepted = attempt.verdict[field];
                      if (!value) return null;
                      return (
                        <div key={field} className="mt-2 flex items-center justify-between gap-3">
                          <span className="min-w-0 truncate">
                            <span className="text-white/50">{label} : </span>
                            {value}
                          </span>
                          {accepted ? (
                            <span className="shrink-0 text-emerald-300 font-semibold">Validé ✓</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-ghost shrink-0 px-2 py-1 text-xs text-neon hover:bg-neon/10"
                              onClick={() => onCorrectAnswer(field, attempt.playerId)}
                            >
                              En fait c’était bon
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {!attempt.title && !attempt.artist && <p className="mt-2 text-white/45">Réponse vide</p>}
                  </div>
                ))}
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
        {scoring && (
          <>
            <h3 className="mb-3 font-bold">Scores</h3>
            <Scores
              players={state.players}
              teams={state.teamScores}
              mode={state.settings.mode}
              hostPlays={state.settings.hostPlays}
              highlight={state.buzzedBy}
            />
          </>
        )}
        <div className="mt-4">
          <>
            <button className="btn bg-red-600/80 hover:bg-red-600 w-full" onClick={() => setConfirmOpen(true)}>
              Arrêter et revenir au salon
            </button>
            <ConfirmModal
              open={confirmOpen}
              title="Interrompre la partie"
              description="La partie sera interrompue et tous les joueurs reviendront dans le salon d'attente."
              confirmLabel="Revenir au salon"
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
