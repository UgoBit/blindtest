import { useEffect, useRef, useState } from 'react';

interface Props {
  initialCode: string;
  error: string | null;
  onCreate: () => void;
  onJoin: (code: string, name: string) => void;
  onClearError?: () => void;
}

export default function Home({ initialCode, error, onCreate, onJoin, onClearError }: Props) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(() => {
    try {
      return localStorage.getItem('blindtest_pseudo') ?? '';
    } catch {
      return '';
    }
  });
  const [showFullMenu, setShowFullMenu] = useState(!initialCode);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialCode) {
      setCode(initialCode.toUpperCase());
      setShowFullMenu(false);
    }
  }, [initialCode]);

  useEffect(() => {
    if (!showFullMenu && initialCode) {
      nameInputRef.current?.focus();
    }
  }, [showFullMenu, initialCode]);

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => {
      onClearError?.();
    }, 5000);
    return () => clearTimeout(timer);
  }, [error, onClearError]);

  const handleSubmitJoin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    if (cleanCode.length === 4 && cleanName.length > 0) {
      try {
        localStorage.setItem('blindtest_pseudo', cleanName);
      } catch {
        // ignore
      }
      onJoin(cleanCode, cleanName);
    }
  };

  const handleSwitchToFullMenu = () => {
    onClearError?.();
    setShowFullMenu(true);
    setCode('');
    window.history.replaceState(null, '', '/');
  };

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 overflow-x-hidden">
      <header className="text-center">
        <h1 className="text-5xl font-black tracking-tight">
          Blind<span className="text-neon">test</span>
        </h1>
        <p className="mt-2 text-white/60">
          Un écran héberge la partie, tout le monde buzze depuis son téléphone.
        </p>
      </header>

      {error && (
        <div className="relative mx-auto flex w-full max-w-lg items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-3 text-red-200 shadow-lg">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="rounded-lg p-1 text-red-300 hover:bg-white/10 hover:text-white"
            onClick={() => onClearError?.()}
            title="Fermer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Vue dédiée quand on arrive avec un lien direct ou QR code */}
      {!showFullMenu && code.length === 4 ? (
        <div className="mx-auto w-full max-w-md">
          <form
            onSubmit={handleSubmitJoin}
            className="card flex flex-col gap-5 border border-neon/30 bg-slate-900/90 p-6 shadow-glow backdrop-blur-xl"
          >
            <div className="text-center">
              <span className="inline-block rounded-full bg-neon/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-neon">
                Invitation reçue
              </span>
              <h2 className="mt-2 text-2xl font-black">Rejoindre le salon</h2>
              <div className="mt-2 inline-flex items-center justify-center rounded-xl bg-white/5 px-4 py-1.5 font-mono text-3xl font-black tracking-[0.25em] text-accent">
                {code}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="player-pseudo-input" className="text-sm font-semibold text-white/70">
                Choisis ton pseudo
              </label>
              <input
                id="player-pseudo-input"
                ref={nameInputRef}
                className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-lg font-medium text-white outline-none placeholder:text-white/40 focus:border-neon focus:ring-2 focus:ring-neon/30"
                placeholder="Ex: Lucas, Marie, Alex..."
                maxLength={16}
                value={name}
                onChange={(event) => {
                  onClearError?.();
                  setName(event.target.value);
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3.5 text-lg font-bold shadow-lg"
              disabled={name.trim().length === 0}
            >
              Rejoindre la partie 🎮
            </button>

            <button
              type="button"
              onClick={handleSwitchToFullMenu}
              className="btn-ghost text-xs text-white/50 hover:text-white"
            >
              Changer de salon ou héberger une partie
            </button>
          </form>
        </div>
      ) : (
        /* Vue d'accueil complète (Créer ou Rejoindre) */
        <div className="grid gap-5 md:grid-cols-2">
          <section className="card flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">Héberger une partie</h2>
              <p className="mt-1 text-sm text-white/60">
                Sur la TV, le PC ou la tablette qui diffuse la musique. Un QR code s&apos;affiche pour les joueurs.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => {
                onClearError?.();
                onCreate();
              }}
            >
              Créer une partie
            </button>
          </section>

          <form onSubmit={handleSubmitJoin} className="card flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-bold">Rejoindre</h2>
              <p className="mt-1 text-sm text-white/60">Votre téléphone devient un buzzer.</p>
            </div>
            <input
              className="w-full rounded-xl bg-white/10 px-4 py-3 font-mono text-2xl uppercase tracking-[0.3em] outline-none focus:ring-2 focus:ring-accent"
              placeholder="CODE"
              maxLength={4}
              value={code}
              onChange={(event) => {
                onClearError?.();
                setCode(event.target.value.toUpperCase());
              }}
            />
            <input
              className="w-full rounded-xl bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
              placeholder="Votre pseudo"
              maxLength={16}
              value={name}
              onChange={(event) => {
                onClearError?.();
                setName(event.target.value);
              }}
            />
            <button
              type="submit"
              className="btn-primary"
              disabled={code.trim().length !== 4 || name.trim().length === 0}
            >
              Rejoindre
            </button>
          </form>
        </div>
      )}

      <p className="text-center text-xs text-white/30">
        Extraits de 30 s fournis par les API publiques Deezer et Apple Music.
      </p>
    </div>
  );
}
