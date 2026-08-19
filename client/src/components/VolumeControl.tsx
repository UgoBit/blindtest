import { useEffect, useState } from 'react';

interface Props {
  volume: number;
  onVolumeChange: (vol: number) => void;
  className?: string;
}

export default function VolumeControl({ volume, onVolumeChange, className = '' }: Props) {
  const [prevVolume, setPrevVolume] = useState(volume > 0 ? volume : 0.8);
  const isMuted = volume === 0;

  useEffect(() => {
    if (volume > 0) {
      setPrevVolume(volume);
    }
  }, [volume]);

  const toggleMute = () => {
    if (isMuted) {
      onVolumeChange(prevVolume > 0 ? prevVolume : 0.8);
    } else {
      setPrevVolume(volume);
      onVolumeChange(0);
    }
  };

  const getVolumeIcon = () => {
    if (isMuted) return '🔇';
    if (volume <= 0.35) return '🔈';
    if (volume <= 0.75) return '🔉';
    return '🔊';
  };

  const pct = Math.round(volume * 100);

  return (
    <div
      className={`inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md transition hover:border-white/20 hover:bg-white/10 ${className}`}
      title={`Volume sonore : ${pct}%`}
    >
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Rétablir le son' : 'Couper le son'}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-base transition hover:scale-110 active:scale-95"
      >
        {getVolumeIcon()}
      </button>

      <div className="relative flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="h-1.5 w-20 cursor-pointer appearance-none rounded-lg bg-white/20 accent-neon sm:w-28"
          aria-label="Contrôle du volume"
        />
      </div>

      <span className="min-w-[2.2rem] text-right text-xs font-semibold tabular-nums text-white/70">
        {pct}%
      </span>
    </div>
  );
}
