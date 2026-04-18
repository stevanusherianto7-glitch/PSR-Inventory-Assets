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

  const handleInstallClick = () => {
    if (!deferredPrompt) {
      setShowInstallBtn(false);
      return;
    }
    
    // Panggil prompt secara sinkron untuk mematuhi aturan gesture keamanan browser
    try {
      deferredPrompt.prompt();
    } catch (err) {
      console.error('Failed to trigger prompt:', err);
    }
    
    // Lanjutkan dengan janji asinkron (Promise) secara native
    if (deferredPrompt.userChoice) {
      deferredPrompt.userChoice
        .then((choiceResult: any) => {
          console.log(`PWA Install Outcome: ${choiceResult.outcome}`);
        })
        .catch((err: any) => {
          console.error('PWA Prompt Error:', err);
        })
        .finally(() => {
          setDeferredPrompt(null);
          setShowInstallBtn(false);
        });
    } else {
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
