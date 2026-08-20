interface Props {
  title: string;
  artist: string;
  onTitle: (value: string) => void;
  onArtist: (value: string) => void;
  onSubmit: () => void;
  hint?: string;
  className?: string;
  titleLocked?: boolean;
  artistLocked?: boolean;
  singleField?: boolean;
  fieldLabel?: string;
  fieldPlaceholder?: string;
}

export default function AnswerForm({
  title,
  artist,
  onTitle,
  onArtist,
  onSubmit,
  hint,
  className = 'w-full max-w-md space-y-3 rounded-xl bg-white/5 p-4 text-left',
  titleLocked = false,
  artistLocked = false,
  singleField = false,
  fieldLabel = 'Œuvre / Titre / Artiste',
  fieldPlaceholder = 'Nom du film, disney, jeu, pub, titre ou artiste…',
}: Props) {
  const allLocked = singleField ? (titleLocked || artistLocked) : (titleLocked && artistLocked);

  return (
    <form
      className={className}
      onSubmit={(event) => {
        event.preventDefault();
        if (!allLocked) {
          onSubmit();
        }
      }}
    >
      <div>
        <h2 className="text-lg font-bold">Ta réponse</h2>
        {hint && <p className="mt-1 text-sm text-white/60">{hint}</p>}
      </div>

      {singleField ? (
        <label className="block">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">{fieldLabel}</span>
            {allLocked && (
              <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                Déjà trouvé ✓
              </span>
            )}
          </div>
          <input
            autoFocus={!allLocked}
            disabled={allLocked}
            value={title || artist}
            onChange={(event) => {
              onTitle(event.target.value);
              onArtist(event.target.value);
            }}
            placeholder={allLocked ? undefined : fieldPlaceholder}
            className={`mt-1 w-full rounded-xl border px-4 py-3.5 text-lg text-white outline-none transition ${
              allLocked
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 cursor-not-allowed'
                : 'border-white/15 bg-white/10 focus:border-neon focus:ring-2 focus:ring-neon/30'
            }`}
            maxLength={120}
          />
        </label>
      ) : (
        <>
          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Titre</span>
              {titleLocked && (
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  Déjà trouvé ✓
                </span>
              )}
            </div>
            <input
              autoFocus={!titleLocked}
              disabled={titleLocked}
              value={title}
              onChange={(event) => onTitle(event.target.value)}
              placeholder={titleLocked ? undefined : 'Nom du morceau…'}
              className={`mt-1 w-full rounded-xl border px-3 py-3 text-white outline-none transition ${
                titleLocked
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 cursor-not-allowed'
                  : 'border-white/10 bg-white/5 focus:border-neon'
              }`}
              maxLength={120}
            />
          </label>
          <label className="block">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Artiste</span>
              {artistLocked && (
                <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                  Déjà trouvé ✓
                </span>
              )}
            </div>
            <input
              autoFocus={titleLocked && !artistLocked}
              disabled={artistLocked}
              value={artist}
              onChange={(event) => onArtist(event.target.value)}
              placeholder={artistLocked ? undefined : 'Nom de l’artiste ou groupe…'}
              className={`mt-1 w-full rounded-xl border px-3 py-3 text-white outline-none transition ${
                artistLocked
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200 cursor-not-allowed'
                  : 'border-white/10 bg-white/5 focus:border-neon'
              }`}
              maxLength={120}
            />
          </label>
        </>
      )}

      <button type="submit" className="btn-primary w-full shadow-lg" disabled={allLocked}>
        Valider ma réponse
      </button>
    </form>
  );
}
