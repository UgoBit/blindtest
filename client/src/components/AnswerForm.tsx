interface Props {
  title: string;
  artist: string;
  onTitle: (value: string) => void;
  onArtist: (value: string) => void;
  onSubmit: () => void;
  hint?: string;
  className?: string;
}

export default function AnswerForm({
  title,
  artist,
  onTitle,
  onArtist,
  onSubmit,
  hint,
  className = 'w-full max-w-md space-y-3 rounded-xl bg-white/5 p-4 text-left',
}: Props) {
  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <h2 className="text-lg font-bold">Ta réponse</h2>
        {hint && <p className="mt-1 text-sm text-white/60">{hint}</p>}
      </div>
      <label className="block">
        <span className="text-sm text-white/60">Titre</span>
        <input
          autoFocus
          value={title}
          onChange={(event) => onTitle(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-neon"
          maxLength={120}
        />
      </label>
      <label className="block">
        <span className="text-sm text-white/60">Artiste</span>
        <input
          value={artist}
          onChange={(event) => onArtist(event.target.value)}
          className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-white outline-none focus:border-neon"
          maxLength={120}
        />
      </label>
      <button type="submit" className="btn-primary w-full">
        Valider ma réponse
      </button>
    </form>
  );
}
