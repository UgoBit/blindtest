interface Props {
  open: boolean;
  title?: string;
  description?: string;
  buttonLabel?: string;
  onClose: () => void;
}

export default function InfoModal({
  open,
  title = 'Information',
  description,
  buttonLabel = 'Accueil',
  onClose,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="card z-10 max-w-lg p-6">
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
        {description && <p className="mb-4 text-sm text-white/70">{description}</p>}
        <div className="flex justify-end">
          <button className="btn-primary" onClick={onClose}>
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
