import type { RoomState } from '../../../shared/types';

interface Props {
  open: boolean;
  onClose: () => void;
  state: RoomState;
  /** If provided, the modal acts as a personal chooser for that player. If omitted and `isHost` is true, modal acts as manager. */
  currentPlayerId?: string;
  isHost?: boolean;
  /** If false, disallow closing the modal (used for forcing player choice) */
  allowClose?: boolean;
  onAssignTeam: (playerId: string, team: number | null) => void;
}

export default function TeamAssignmentModal({ open, onClose, state, currentPlayerId, isHost, allowClose, onAssignTeam }: Props) {
  if (!open) return null;
  const { settings, players } = state;
  const teamLabels = Array.from({ length: Math.max(1, settings.teamCount ?? 2) }, (_, index) => settings.teamNames?.[index] ?? `Équipe ${index + 1}`);

  // If host manager view, show all players; else show only non-hosts and highlight the current player
  const shownPlayers = isHost ? players : players.filter((p) => !p.isHost);
  const current = currentPlayerId ? players.find((p) => p.id === currentPlayerId) : undefined;

  const closable = allowClose !== false;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={closable ? onClose : undefined} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-card/95 p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">{isHost ? 'Gérer les équipes' : 'Choisir son équipe'}</h3>
          {closable && <button className="text-sm text-white/60" onClick={onClose}>Fermer</button>}
        </div>

        {!isHost && (
          <p className="mt-2 text-sm text-white/60">Sélectionne l'équipe à laquelle tu veux appartenir. Tu pourras la changer avant le lancement.</p>
        )}

        <div className="mt-4 space-y-3">
          {teamLabels.map((label, index) => {
            const teamNumber = index + 1;
            const count = players.filter((p) => (p.team ?? 1) === teamNumber).length;
            const selected = current ? (current.team ?? 1) === teamNumber : false;
            return (
              <div key={`modal-team-${index}`}>
                {isHost ? (
                  <div className="w-full rounded-xl p-3 text-left border border-white/10 bg-white/5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/45">Équipe {teamNumber}</div>
                        <div className="mt-1 text-sm font-semibold">{label}</div>
                      </div>
                      <div className="text-xs text-white/60">{count} joueur{count > 1 ? 's' : ''}</div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {players
                        .filter((p) => (p.team ?? 1) === teamNumber)
                        .map((p) => (
                          <div key={p.id} className="flex items-center justify-between gap-3 text-sm">
                            <span>{p.name}{p.isHost ? ' (Hôte)' : ''}</span>
                            <div className="flex items-center gap-2">
                              <select
                                value={String(p.team ?? 1)}
                                onChange={(e) => onAssignTeam(p.id, Number(e.target.value))}
                                className="rounded border border-white/10 bg-black/10 px-2 py-1 text-xs text-white outline-none"
                              >
                                {teamLabels.map((t, ti) => (
                                  <option key={`${p.id}-opt-${ti}`} value={ti + 1}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (!currentPlayerId) return;
                      onAssignTeam(currentPlayerId, teamNumber);
                    }}
                    className={`w-full rounded-xl p-3 text-left transition ${selected ? 'border-neon bg-neon/10' : 'border-white/10 bg-white/5'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-white/45">Équipe {teamNumber}</div>
                        <div className="mt-1 text-sm font-semibold">{label}</div>
                      </div>
                      <div className="text-xs text-white/60">{count} joueur{count > 1 ? 's' : ''}</div>
                    </div>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-semibold">Joueurs connectés</h4>
          <ul className="mt-2 space-y-2 text-sm text-white/60">
            {shownPlayers.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name}{p.isHost ? ' (Hôte)' : ''}</span>
                <span className="text-xs">{teamLabels[(p.team ?? 1) - 1] ?? `Équipe ${(p.team ?? 1)}`}</span>
              </li>
            ))}
            {shownPlayers.length === 0 && <li className="text-white/50">Aucun autre joueur connecté.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
