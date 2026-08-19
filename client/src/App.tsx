import { useCallback, useEffect, useRef, useState } from 'react';
import type { HostTrack, PlayerTrack, RoomSettings, RoomState } from '../../shared/types';
import { socket } from './socket';
import { clearSession, loadSession, saveSession } from './storage';
import Home from './views/Home';
import Lobby from './views/Lobby';
import HostGame from './views/HostGame';
import PlayerGame from './views/PlayerGame';
import Finished from './views/Finished';
import InfoModal from './components/InfoModal';
import VolumeControl from './components/VolumeControl';

const codeFromUrl = (): string => {
  // 1. Paramètres de requête : ?code=ABCD, ?join=ABCD, ?room=ABCD
  const params = new URLSearchParams(window.location.search);
  const queryCode = params.get('code') || params.get('join') || params.get('room');
  if (queryCode && /^[A-Za-z0-9]{4}$/i.test(queryCode.trim())) {
    return queryCode.trim().toUpperCase();
  }

  // 2. Chemins d'URL : /join/ABCD, /host/ABCD ou directement /ABCD
  const pathname = window.location.pathname.trim();
  const joinMatch = pathname.match(/^\/join\/([A-Za-z0-9]{4})(?:\/|$)/i);
  if (joinMatch) return joinMatch[1].toUpperCase();

  const hostMatch = pathname.match(/^\/host\/([A-Za-z0-9]{4})(?:\/|$)/i);
  if (hostMatch) return hostMatch[1].toUpperCase();

  const directMatch = pathname.match(/^\/([A-Za-z0-9]{4})(?:\/|$)/i);
  if (directMatch && !['join', 'host', 'api'].includes(directMatch[1].toLowerCase())) {
    return directMatch[1].toUpperCase();
  }

  return '';
};

const isAutoplayBlocked = (reason: unknown): boolean =>
  typeof reason === 'object' &&
  reason !== null &&
  'name' in reason &&
  reason.name === 'NotAllowedError';

export default function App() {
  const [state, setState] = useState<RoomState | null>(null);
  const [track, setTrack] = useState<HostTrack | null>(null);
  const [playerTrack, setPlayerTrack] = useState<PlayerTrack | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [roomClosedOpen, setRoomClosedOpen] = useState(false);
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('blindtest_volume');
      return saved !== null ? parseFloat(saved) : 0.8;
    } catch {
      return 0.8;
    }
  });
  // Debug UI removed for production testing — enable with ?debug=1 if needed
  const debug = false;
  const [audioEvent, setAudioEvent] = useState<{ action: string; at: number | null } | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolume(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
    try {
      localStorage.setItem('blindtest_volume', String(clamped));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || event.repeat) return;
      const target = event.target;
      const isTextField =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        (target instanceof HTMLElement && target.isContentEditable);
      if (isTextField) return;

      const hostPlayer = state?.players.find((player) => player.id === playerId);
      const hostMode = state?.settings.mode === 'solo' || state?.settings.hostPlays;
      if (!isHost || !hostMode || !state.settings.buzzerEnabled) return;
      event.preventDefault();
      if (state.phase === 'listening' && !hostPlayer?.lockedOut) socket.emit('buzz');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isHost, playerId, state]);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    void audio
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch((reason: unknown) => {
        // A browser refusing to autoplay is not a broken preview: ask for a click instead.
        if (isAutoplayBlocked(reason)) setAutoplayBlocked(true);
        else socket.emit('preview_failed');
      });
  }, [volume]);

  useEffect(() => {
    const onState = (next: RoomState) => setState(next);
    const onTrack = (next: HostTrack) => setTrack(next);
    const onPlayerTrack = (next: PlayerTrack) => setPlayerTrack(next);
    const onError = (message: string) => setError(message);
    const onAudio = ({ action }: { action: 'play' | 'pause' | 'stop' }) => {
      const audio = audioRef.current;
      if (!audio) return;
      setAudioEvent({ action, at: Date.now() });
      if (action === 'play') {
        playAudio();
      } else if (action === 'pause') {
        audio.pause();
      } else if (action === 'stop') {
        try {
          audio.pause();
          audio.currentTime = 0;
          // Clear src so the element stops fetching/playing the preview
          audio.removeAttribute('src');
          audio.load();
        } catch (e) {
          // ignore
        }
      }
    };

    socket.on('room_state', onState);
    socket.on('host_track', onTrack);
    socket.on('player_track', onPlayerTrack);
    socket.on('error_message', onError);
    socket.on('room_closed', () => {
      // Show modal to inform users the room was closed; they can return to home.
      setRoomClosedOpen(true);
      setError("La partie a été annulée par l'hôte.");
    });
    socket.on('audio', onAudio);
    return () => {
      socket.off('room_state', onState);
      socket.off('host_track', onTrack);
      socket.off('player_track', onPlayerTrack);
      socket.off('error_message', onError);
      socket.off('room_closed');
      socket.off('audio', onAudio);
    };
  }, [playAudio]);

  // Reconnects a returning device (refresh, phone locked) to its previous seat.
  useEffect(() => {
    const rejoin = () => {
      const stored = loadSession();
      if (!stored) return;
      const urlCode = codeFromUrl();
      // Si l'utilisateur est arrivé avec un code de salon explicite dans l'URL différent de l'ancienne session,
      // on ne tente pas de rejoindre l'ancien salon mort.
      if (urlCode && urlCode !== stored.code) {
        return;
      }
      socket.emit('join_room', { code: stored.code, name: stored.name, playerId: stored.playerId }, (res) => {
        if (!res.ok) {
          clearSession();
          return;
        }
        setPlayerId(res.playerId);
        setIsHost(stored.isHost);
      });
    };
    if (socket.connected) rejoin();
    socket.on('connect', rejoin);
    return () => {
      socket.off('connect', rejoin);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const audioTrack = isHost ? track : playerTrack;
    if (!audio || !audioTrack) return;
    if (audio.getAttribute('src') === audioTrack.previewUrl) return;

    const seek = () => {
      audio.currentTime = audioTrack.startAt;
    };
    audio.addEventListener('loadedmetadata', seek, { once: true });
    audio.src = audioTrack.previewUrl;
    audio.volume = volume;
    audio.load();
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) seek();
    return () => audio.removeEventListener('loadedmetadata', seek);
  }, [isHost, playerTrack, track, volume]);

  const lastResyncRound = useRef<number | null>(null);
  useEffect(() => {
    if (
      !state ||
      !isHost ||
      !['countdown', 'listening', 'buzzed', 'reveal'].includes(state.phase) ||
      (state.track && track?.index === state.track.index) ||
      lastResyncRound.current === state.round
    ) {
      return;
    }
    lastResyncRound.current = state.round;
    socket.emit('resync');
  }, [isHost, state, track]);

  const createRoom = useCallback(() => {
    const settings: RoomSettings = {
      themes: [],
      difficulty: 'moyen',
      rounds: 10,
      clipSeconds: 30,
      hostPlays: false,
      mode: 'phones',
      teamCount: 2,
      teamNames: ['Équipe 1', 'Équipe 2'],
      audioHostEnabled: true,
      audioPlayersEnabled: false,
      buzzerEnabled: true,
      yearRanges: ['80s', '90s', '2000s'],
      genres: [],
    };
    socket.emit('create_room', settings, (res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPlayerId(res.playerId);
      setIsHost(true);
      saveSession({ code: res.code, playerId: res.playerId, name: 'Sur place', isHost: true });
      window.history.replaceState(null, '', `/host/${res.code}`);
    });
  }, []);

  const joinRoom = useCallback((code: string, name: string) => {
    socket.emit('join_room', { code, name }, (res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPlayerId(res.playerId);
      setIsHost(false);
      saveSession({ code, playerId: res.playerId, name, isHost: false });
      window.history.replaceState(null, '', '/');
    });
  }, []);

  if (!state || !playerId) {
    return <Home initialCode={codeFromUrl()} error={error} onCreate={createRoom} onJoin={joinRoom} />;
  }

  const hostPlaying =
    isHost &&
    state.settings.buzzerEnabled &&
    (state.settings.mode === 'solo' ||
      ((state.settings.mode === 'teams' || state.settings.mode === 'course') && state.settings.hostPlays));
  const shouldPlayAudio = isHost ? state.settings.audioHostEnabled : state.settings.audioPlayersEnabled;
  const hostMember = state.players.find((player) => player.id === playerId);
  const hostRacing = state.racers.includes(playerId);
  const hostAnswered = state.answeredBy.includes(playerId);
  const hostCanBuzz =
    hostPlaying && state.phase === 'listening' && !hostMember?.lockedOut && !hostRacing && !hostAnswered;

  return (
    <>
      <InfoModal
        open={roomClosedOpen}
        title="Partie annulée"
        description="L'hôte a annulé la partie. Vous allez être redirigé vers l'accueil."
        buttonLabel="Retour à l'accueil"
        onClose={() => {
          clearSession();
          setState(null);
          setPlayerId(null);
          setIsHost(false);
          setRoomClosedOpen(false);
          window.history.replaceState(null, '', '/');
        }}
      />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <button
          className="btn-ghost text-xs text-white/70 hover:text-white"
          onClick={() => {
            clearSession();
            setState(null);
            setPlayerId(null);
            window.history.replaceState(null, '', '/');
          }}
        >
          ← Quitter
        </button>
        <div className="flex items-center gap-3 sm:gap-4">
          {shouldPlayAudio && (
            <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />
          )}
          <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white/60">
            Salon : <span className="font-mono font-bold text-neon">{state.code}</span>
          </span>
        </div>
      </div>
      {shouldPlayAudio && (
        <audio
          ref={audioRef}
          preload="auto"
          onError={() => socket.emit('preview_failed')}
        />
      )}

      {error && (
        <p className="mx-auto mt-4 max-w-lg rounded-xl bg-red-500/20 px-4 py-2 text-center text-red-200">
          {error}
        </p>
      )}

      {shouldPlayAudio && autoplayBlocked && (
        <div className="mx-auto mt-4 max-w-lg px-4">
          <button className="btn-primary w-full" onClick={playAudio}>
            Reprendre le son
          </button>
        </div>
      )}

      {debug && audioEvent && (
        <div style={{ position: 'fixed', left: 12, bottom: 12, background: 'rgba(0,0,0,0.6)', color: 'white', padding: 8, borderRadius: 6, zIndex: 100 }}>
          <div style={{ fontWeight: 700 }}>DEBUG audio</div>
          <div>action: {audioEvent.action} · at: {new Date(audioEvent.at ?? 0).toLocaleTimeString()}</div>
        </div>
      )}

      {state.phase === 'lobby' && (
        <Lobby
          state={state}
          isHost={isHost}
          currentPlayerId={playerId}
          onUpdate={(settings) => socket.emit('update_settings', settings)}
          onRenameTeam={(name) => socket.emit('rename_team', name)}
          onAssignTeam={(playerId, team) => socket.emit('assign_team', { playerId, team })}
          onStart={() => socket.emit('start_game')}
          onKick={(target) => socket.emit('kick', target)}
        />
      )}

      {['countdown', 'listening', 'buzzed', 'reveal'].includes(state.phase) &&
        (isHost ? (
          <>
            <HostGame
              state={state}
              onCorrectAnswer={(field, target) => socket.emit('correct_answer', { field, playerId: target })}
              canSubmitAnswer={state.buzzedBy === playerId || hostRacing}
              onSubmitAnswer={(answer) => socket.emit('submit_answer', answer)}
              onSkip={() => socket.emit('skip')}
              onNext={() => socket.emit('next_round')}
              onCancel={() => {
                socket.emit('restart');
              }}
            />
            {hostPlaying && (
              <div className="mx-auto max-w-6xl px-4 pb-10">
                <button
                  className={
                    hostCanBuzz
                      ? 'btn-primary flex w-full flex-col items-center gap-1 py-7 text-5xl'
                      : 'btn flex w-full flex-col items-center gap-1 bg-white/10 py-7 text-5xl text-white/40'
                  }
                  disabled={!hostCanBuzz}
                  onClick={() => socket.emit('buzz')}
                >
                  <span>
                    {hostMember?.lockedOut
                      ? 'Éliminé'
                      : hostAnswered
                        ? 'Réponse envoyée'
                        : hostRacing
                          ? 'À toi !'
                          : 'BUZZ'}
                  </span>
                  {hostCanBuzz && <span className="text-sm font-medium tracking-normal text-white/70">Espace</span>}
                </button>
              </div>
            )}
          </>
        ) : (
          <PlayerGame
            state={state}
            playerId={playerId}
            onBuzz={() => socket.emit('buzz')}
            onSubmitAnswer={(answer) => socket.emit('submit_answer', answer)}
          />
        ))}

      {state.phase === 'finished' && (
        <Finished state={state} isHost={isHost} onRestart={() => socket.emit('restart')} />
      )}
    </>
  );
}
