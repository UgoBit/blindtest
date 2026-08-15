import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function QrJoin({ code }: { code: string }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const joinUrl = `${window.location.origin}/join/${code}`;

  useEffect(() => {
    void QRCode.toDataURL(joinUrl, {
      margin: 1,
      width: 512,
      color: { dark: '#0b0718', light: '#ffffff' },
    }).then(setDataUrl);
  }, [joinUrl]);

  return (
    <div className="flex flex-col items-center gap-3">
      {dataUrl && <img src={dataUrl} alt="QR code pour rejoindre" className="w-44 rounded-xl bg-white p-2" />}
      <div className="text-center">
        <p className="text-sm text-white/60">Rejoignez avec le code</p>
        <p className="font-mono text-4xl font-black tracking-[0.35em] text-neon">{code}</p>
        <p className="mt-1 break-all text-xs text-white/40">{joinUrl}</p>
      </div>
    </div>
  );
}
