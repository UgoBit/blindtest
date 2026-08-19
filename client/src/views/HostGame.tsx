import { useEffect, useState, useRef } from 'react';
import type { RoomState } from '../../../shared/types';
import Scores from '../components/Scores';
import ConfirmModal from '../components/ConfirmModal';
import AnswerForm from '../components/AnswerForm';
import VolumeControl from '../components/VolumeControl';

interface Props {
  state: RoomState;
  onCorrectAnswer: (field: 'title' | 'artist', playerId?: string) => void;
  canSubmitAnswer: boolean;
  onSubmitAnswer: (answer: { title: string; artist: string }) => void;
  onSkip: () => void;
  onNext: () => void;
  onCancel: () => void;
  volume?: number;
  onVolumeChange?: (v: number) => void;
}

export default function HostGame({
  state,
  onCorrectAnswer,
  canSubmitAnswer,
  onSubmitAnswer,
  onSkip,
  onNext,
  onCancel,
  volume = 0.8,
  onVolumeChange,
}: Props) {
  // Debug UI removed — hidden in normal runs
  const debug = false;
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
  // Smooth local interpolation of remaining seconds to avoid visible ticks.
  const [smoothRemaining, setSmoothRemaining] = useState<number>(state.remainingSeconds);
  const lastServerAt = useRef<number>(Date.now());
  const lastServerRemaining = useRef<number>(state.remainingSeconds);

  useEffect(() => {
    lastServerAt.current = Date.now();
    lastServerRemaining.current = state.remainingSeconds;
    setSmoothRemaining(state.remainingSeconds);
  }, [state.remainingSeconds]);

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      if (state.phase !== 'listening') return;
      const elapsed = (Date.now() - lastServerAt.current) / 1000;
      const next = Math.max(0, lastServerRemaining.current - elapsed);
      setSmoothRemaining(next);
      raf = requestAnimationFrame(tick);
    };
    if (state.phase === 'listening') raf = requestAnimationFrame(tick);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [state.phase]);

  const pct = Math.max(0, Math.min(100, (smoothRemaining / clipTotal) * 100));

  useEffect(() => {
    if (!state.responseDeadline) {
      setRemainingResponseSeconds(0);
      return;
    }
    const update = () => setRemainingResponseSeconds(Math.max(0, Math.ceil((state.responseDeadline! - Date.now()) / 1000)));
    update();
    const timer = window.setInterval(update, 250);
    return () => window.clearInterval(timer);
  }, [state.phase, state.responseDeadline]);

  useEffect(() => {
    if (!canSubmitAnswer) {
      setAnswerTitle('');
      setAnswerArtist('');
    }
  }, [canSubmitAnswer]);

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1fr_300px]">
      <div className="card flex min-h-[420px] flex-col items-center justify-center gap-6 text-center">
        <div className="flex w-full items-center justify-between px-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Manche {state.track?.index ?? 0} / {state.track?.total ?? 0}
          </p>
          {onVolumeChange && (
            <VolumeControl volume={volume} onVolumeChange={onVolumeChange} />
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
                style={{ width: `${pct}%`, transition: 'width 120ms linear' }}
              />
            </div>
            {isCourse && canSubmitAnswer && (
              <AnswerForm
                hint="Un seul champ suffit · plus tu buzzes tôt, plus ça rapporte"
                title={answerTitle}
                artist={answerArtist}
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
              <div className="mt-6 w-full max-w-2xl rounded-xl bg-gradient-to-r from-rose-600/30 via-purple-700/20 to-accent/20 p-6 text-left text-sm shadow-lg z-50">
                <div className="mb-2 text-sm text-white/60">Réponse envoyée par {buzzer?.name ?? 'Sur place'}</div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-2xl font-bold text-white">{state.submittedAnswer.title || '—'}</div>
                    <div className="text-white/70">{state.submittedAnswer.artist || '—'}</div>
                  </div>
                  <div className="text-right">
                    <div className={state.answerVerdict.title ? 'text-emerald-300' : 'text-rose-400'}>{state.answerVerdict.title ? 'Titre OK' : 'Titre ✗'}</div>
                    <div className={state.answerVerdict.artist ? 'text-emerald-300' : 'text-rose-400'}>{state.answerVerdict.artist ? 'Artiste OK' : 'Artiste ✗'}</div>
                  </div>
                </div>
              </div>
            ) : (
              canSubmitAnswer && (
                <AnswerForm
                  title={answerTitle}
                  artist={answerArtist}
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
            <div>
              <p className="text-3xl font-black">{answer.title}</p>
              <p className="text-xl text-white/60">{answer.artist}</p>
            </div>
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
                            <span className="shrink-0 text-emerald-300">Validé</span>
                          ) : (
                            <button
                              type="button"
                              className="btn-ghost shrink-0 px-2 py-1 text-xs"
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
        {scoring && (
          <>
            <h3 className="mb-3 font-bold">Scores</h3>
            <Scores
              players={state.players}
              teams={state.teamScores}
              mode={state.settings.mode}
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
      {debug && (
        <div style={{ position: 'fixed', right: 12, bottom: 12, width: 520, maxHeight: '50vh', overflow: 'auto', background: 'rgba(0,0,0,0.6)', color: 'white', padding: 12, borderRadius: 8, zIndex: 60 }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>DEBUG room_state</div>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12 }}>{JSON.stringify(state, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
