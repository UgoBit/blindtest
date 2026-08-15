import React from 'react';

interface Props {
  open: boolean;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title = 'Confirmer',
  description,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="card z-10 max-w-lg p-6">
        <h3 className="mb-2 text-lg font-bold">{title}</h3>
        {description && <p className="mb-4 text-sm text-white/70">{description}</p>}
        <div className="flex justify-end gap-3">
          <button className="btn-ghost" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button className="btn bg-red-600" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
