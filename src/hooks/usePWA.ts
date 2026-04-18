import { useState, useEffect } from 'react';

export function usePWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  useEffect(() => {
    // Check if app is already in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    if (isStandalone) {
      setShowInstallGuide(false);
      setShowInstallBtn(false);
      return;
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
      setShowInstallGuide(false);
      console.log('PWA: install prompt captured');
    };
    
    const installedHandler = () => {
      setShowInstallBtn(false);
      setShowInstallGuide(false);
      console.log('PWA: application installed');
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);
    
    const guideTimer = setTimeout(() => {
      if (!deferredPrompt && !isStandalone) {
        setShowInstallGuide(true);
      }
    }, 15000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
      clearTimeout(guideTimer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallBtn(false);
      return;
    }
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Install Outcome: ${outcome}`);
    } catch (err) {
      console.error('PWA Prompt Error:', err);
    } finally {
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
