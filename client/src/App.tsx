import { useCallback, useEffect, useRef, useState } from 'react';
import type { HostTrack, RoomSettings, RoomState } from '../../shared/types';
import { socket } from './socket';
import { clearSession, loadSession, saveSession } from './storage';
import Home from './views/Home';
import Lobby from './views/Lobby';
import HostGame from './views/HostGame';
import PlayerGame from './views/PlayerGame';
import Finished from './views/Finished';

const codeFromUrl = (): string => {
  const match = window.location.pathname.match(/^\/join\/([A-Za-z0-9]{4})/);
  return match ? match[1].toUpperCase() : '';
};

const isAutoplayBlocked = (reason: unknown): boolean =>
  typeof reason === 'object' &&
  reason !== null &&
  'name' in reason &&
  reason.name === 'NotAllowedError';

export default function App() {
  const [state, setState] = useState<RoomState | null>(null);
  const [track, setTrack] = useState<HostTrack | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    void audio
      .play()
      .then(() => setAutoplayBlocked(false))
      .catch((reason: unknown) => {
        // A browser refusing to autoplay is not a broken preview: ask for a click instead.
        if (isAutoplayBlocked(reason)) setAutoplayBlocked(true);
        else socket.emit('preview_failed');
      });
  }, []);

  useEffect(() => {
    const onState = (next: RoomState) => setState(next);
    const onTrack = (next: HostTrack) => setTrack(next);
    const onError = (message: string) => setError(message);
    const onAudio = ({ action }: { action: 'play' | 'pause' | 'stop' }) => {
      const audio = audioRef.current;
      if (!audio) return;
      if (action === 'play') playAudio();
      else audio.pause();
    };

    socket.on('room_state', onState);
    socket.on('host_track', onTrack);
    socket.on('error_message', onError);
    socket.on('audio', onAudio);
    return () => {
      socket.off('room_state', onState);
      socket.off('host_track', onTrack);
      socket.off('error_message', onError);
      socket.off('audio', onAudio);
    };
  }, [playAudio]);

  // Reconnects a returning device (refresh, phone locked) to its previous seat.
  useEffect(() => {
    const stored = loadSession();
    if (!stored) return;
    const rejoin = () =>
      socket.emit('join_room', { code: stored.code, name: stored.name, playerId: stored.playerId }, (res) => {
        if (!res.ok) {
          clearSession();
          return;
        }
        setPlayerId(res.playerId);
        setIsHost(stored.isHost);
      });
    if (socket.connected) rejoin();
    socket.on('connect', rejoin);
    return () => {
      socket.off('connect', rejoin);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.getAttribute('src') === track.previewUrl) return;

    const seek = () => {
      audio.currentTime = track.startAt;
    };
    audio.addEventListener('loadedmetadata', seek, { once: true });
    audio.src = track.previewUrl;
    audio.load();
    if (audio.readyState >= HTMLMediaElement.HAVE_METADATA) seek();
    return () => audio.removeEventListener('loadedmetadata', seek);
  }, [track]);

  const createRoom = useCallback(() => {
    const settings: RoomSettings = {
      themes: ['top'],
      difficulty: 'moyen',
      rounds: 10,
      clipSeconds: 30,
      hostPlays: false,
    };
    socket.emit('create_room', settings, (res) => {
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setPlayerId(res.playerId);
      setIsHost(true);
      saveSession({ code: res.code, playerId: res.playerId, name: 'Hôte', isHost: true });
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

  const hostPlaying = isHost && state.settings.hostPlays;

  return (
    <>
      {/* Only the host device outputs sound; players just buzz. */}
      {isHost && <audio ref={audioRef} preload="auto" onError={() => socket.emit('preview_failed')} />}

      {error && (
        <p className="mx-auto mt-4 max-w-lg rounded-xl bg-red-500/20 px-4 py-2 text-center text-red-200">
          {error}
        </p>
      )}

      {isHost && autoplayBlocked && (
        <div className="mx-auto mt-4 max-w-lg px-4">
          <button className="btn-primary w-full" onClick={playAudio}>
            Reprendre le son
          </button>
        </div>
      )}

      {state.phase === 'lobby' && (
        <Lobby
          state={state}
          isHost={isHost}
          onUpdate={(settings) => socket.emit('update_settings', settings)}
          onStart={() => socket.emit('start_game')}
          onKick={(target) => socket.emit('kick', target)}
        />
      )}

      {['countdown', 'listening', 'buzzed', 'reveal'].includes(state.phase) &&
        (isHost ? (
          <>
            <HostGame
              state={state}
              track={track}
              onJudge={(title, artist) => socket.emit('judge', { title, artist })}
              onSkip={() => socket.emit('skip')}
              onNext={() => socket.emit('next_round')}
            />
            {hostPlaying && (
              <div className="mx-auto max-w-6xl px-4 pb-10">
                <button
                  className="btn-primary w-full text-2xl"
                  disabled={state.phase !== 'listening'}
                  onClick={() => socket.emit('buzz')}
                >
                  BUZZ
                </button>
              </div>
            )}
          </>
        ) : (
          <PlayerGame state={state} playerId={playerId} onBuzz={() => socket.emit('buzz')} />
        ))}

      {state.phase === 'finished' && (
        <Finished state={state} isHost={isHost} onRestart={() => socket.emit('restart')} />
      )}
    </>
  );
}
