import React from 'react';
import { Download } from 'lucide-react';

interface PWAInstallBarProps {
  showInstallBtn: boolean;
  setShowInstallBtn: (show: boolean) => void;
  showInstallGuide: boolean;
  setShowInstallGuide: (show: boolean) => void;
  onInstall: () => void;
}

export function PWAInstallBar({ 
  showInstallBtn, 
  setShowInstallBtn, 
  showInstallGuide, 
  setShowInstallGuide, 
  onInstall 
}: PWAInstallBarProps) {
  return (
    <>
      {showInstallBtn && (
        <div className="bg-blue-600 p-3 flex items-center justify-between text-white shadow-lg sticky top-0 z-[101]">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Download size={20} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Instal Aplikasi?</p>
              <p className="text-[10px] opacity-80">Akses lebih cepat & offline</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowInstallBtn(false)}
              className="text-white/60 text-[10px] font-medium px-2"
            >
              NANTI
            </button>
            <button 
              onClick={onInstall}
              className="bg-white text-blue-600 text-xs font-bold px-4 py-2 rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              TENTU
            </button>
          </div>
        </div>
      )}

      {showInstallGuide && (
        <div className="bg-slate-800 p-3 flex items-center justify-between text-white shadow-lg sticky top-0 z-[101]">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-1.5 rounded-lg text-emerald-400">
              <Download size={20} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Gunakan Aplikasi?</p>
              <p className="text-[10px] opacity-80">Klik tombol Menu (...) lalu "Instal App"</p>
            </div>
          </div>
          <button 
            onClick={() => setShowInstallGuide(false)}
            className="text-white/40 text-[10px] font-medium px-2"
          >
            TUTUP
          </button>
        </div>
      )}
    </>
  );
}
