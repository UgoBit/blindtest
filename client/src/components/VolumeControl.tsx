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
      className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-2.5 py-1 text-xs shadow-lg backdrop-blur-md transition hover:border-white/20 hover:bg-slate-900 ${className}`}
      title={`Volume : ${pct}%`}
    >
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? 'Rétablir le son' : 'Couper le son'}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-sm transition hover:scale-110 active:scale-95"
      >
        {getVolumeIcon()}
      </button>

      <div className="relative flex items-center">
        <input
          type="range"
          min="0"
          max="1"
          step="0.02"
          value={volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="h-1.5 w-16 cursor-pointer appearance-none rounded-lg bg-white/20 accent-neon transition sm:w-20"
          aria-label="Volume audio"
        />
      </div>

      <span className="min-w-[2rem] text-right font-mono text-[11px] font-semibold text-white/70">
        {pct}%
      </span>
    </div>
  );
}
