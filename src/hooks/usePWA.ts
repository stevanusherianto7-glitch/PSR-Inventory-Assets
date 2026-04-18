import { useState, useEffect } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // 1. Deteksi status standalone (sudah terinstal)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    console.log('PWA: Status Standalone =', isStandalone);

    if (isStandalone) {
      setShowInstallGuide(false);
      setShowInstallBtn(false);
      return;
    }

    // 2. Handler tangkap sinyal instalasi
    const handler = (e: any) => {
      // Mencegah prompt otomatis muncul tiba-tiba
      e.preventDefault();
      // Simpan event untuk digunakan nanti saat tombol diklik
      setDeferredPrompt(e);
      setShowInstallBtn(true);
      setShowInstallGuide(false);
      console.log('PWA: Event beforeinstallprompt berhasil ditangkap!');
    };
    
    const installedHandler = () => {
      setShowInstallBtn(false);
      setShowInstallGuide(false);
      setDeferredPrompt(null);
      console.log('PWA: Aplikasi berhasil terinstal ke sistem.');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    
    // 3. Panduan manual jika dalam 10 detik sinyal tidak muncul (biasanya iOS atau sudah tolak)
    const guideTimer = setTimeout(() => {
      // Kita gunakan ref atau state check di sini
      // Jika deferredPrompt masih null setelah 12 detik, mungkin ini iOS atau browser non-chromium
      if (!isStandalone) {
        // Kita tidak langsung set true, tapi biarkan logika ini siaga
        console.log('PWA: Sinyal otomatis tidak terdeteksi, panduan manual disiagakan.');
      }
    }, 12000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      clearTimeout(guideTimer);
    };
  }, []); // Hanya jalankan sekali saat mount

  const handleInstallClick = async () => {
    console.log('PWA: Tombol instal TENTU ditekan.');
    
    if (!deferredPrompt) {
      console.warn('PWA: Tidak ada deferredPrompt yang tersimpan.');
      // Jika tidak ada prompt tapi user klik, mungkin tampilkan panduan manual saja
      setShowInstallGuide(true);
      setShowInstallBtn(false);
      return;
    }
    
    // Munculkan prompt asli browser
    try {
      console.log('PWA: Memicu dialog instalasi native...');
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA: Respon pengguna = ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('PWA: Pengguna menyetujui instalasi.');
      } else {
        console.log('PWA: Pengguna menolak instalasi.');
      }
    } catch (err) {
      console.error('PWA: Gagal memicu prompt:', err);
    } finally {
      // Apapun hasilnya, kita bersihkan prompt karena hanya bisa dipakai sekali
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    }
  };

  return {
    showInstallBtn,
    setShowInstallBtn,
    showInstallGuide,
    setShowInstallGuide,
    handleInstallClick
  };
}
