import { useState } from 'react';

interface Props {
  initialCode: string;
  error: string | null;
  onCreate: () => void;
  onJoin: (code: string, name: string) => void;
}

export default function Home({ initialCode, error, onCreate, onJoin }: Props) {
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState('');

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-4 py-10">
      <header className="text-center">
        <h1 className="text-5xl font-black tracking-tight">
          Blind<span className="text-neon">test</span>
        </h1>
        <p className="mt-2 text-white/60">
          Un écran héberge la partie, tout le monde buzze depuis son téléphone.
        </p>
      </header>

      {error && <p className="rounded-xl bg-red-500/20 px-4 py-3 text-center text-red-200">{error}</p>}

      <div className="grid gap-5 md:grid-cols-2">
        <section className="card flex flex-col justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Héberger une partie</h2>
            <p className="mt-1 text-sm text-white/60">
              Sur la TV, le PC ou la tablette qui diffuse la musique. Un QR code s&apos;affiche pour les joueurs.
            </p>
          </div>
          <button className="btn-primary" onClick={onCreate}>
            Créer une partie
          </button>
        </section>

        <section className="card flex flex-col gap-4">
          <div>
            <h2 className="text-xl font-bold">Rejoindre</h2>
            <p className="mt-1 text-sm text-white/60">Votre téléphone devient un buzzer.</p>
          </div>
          <input
            className="rounded-xl bg-white/10 px-4 py-3 font-mono text-2xl uppercase tracking-[0.3em] outline-none focus:ring-2 focus:ring-accent"
            placeholder="CODE"
            maxLength={4}
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
          />
          <input
            className="rounded-xl bg-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
            placeholder="Votre pseudo"
            maxLength={16}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <button
            className="btn-primary"
            disabled={code.length !== 4 || name.trim().length === 0}
            onClick={() => onJoin(code, name)}
          >
            Rejoindre
          </button>
        </section>
      </div>

      <p className="text-center text-xs text-white/30">
        Extraits de 30 s fournis par les API publiques Deezer et Apple Music.
      </p>
    </div>
  );
}
