"use client";
import { createContext, useContext, useEffect, useState } from 'react';
const PwaContext = createContext(null);
export default function PwaProvider({children}) {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  useEffect(() => {
    const display = window.matchMedia('(display-mode: standalone)');
    const full = window.matchMedia('(display-mode: fullscreen)');
    const check = () => setInstalled(display.matches || full.matches || navigator.standalone === true);
    check();
    setIos(/iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    const before = event => { event.preventDefault(); setPrompt(event); };
    const done = () => {setInstalled(true);setPrompt(null);};
    window.addEventListener('beforeinstallprompt', before);
    window.addEventListener('appinstalled', done);
    display.addEventListener('change', check); full.addEventListener('change', check);
    if ('serviceWorker' in navigator && window.isSecureContext && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js', {scope:'/', updateViaCache:'none'}).catch(() => {});
    }
    return () => {window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);display.removeEventListener('change',check);full.removeEventListener('change',check);};
  }, []);
  async function install() {
    if (!prompt) return;
    try { await prompt.prompt(); await prompt.userChoice; } finally {setPrompt(null);}
  }
  return <PwaContext.Provider value={{installed,ios,prompt,install}}>{children}</PwaContext.Provider>;
}
export function InstallApp() {
  const state = useContext(PwaContext);
  const [help, setHelp] = useState(false);
  if (!state || state.installed || (!state.prompt && !state.ios)) return null;
  return <div><button type="button" className="pwa-install" onClick={() => state.prompt ? state.install().catch(()=>{}) : setHelp(!help)} aria-expanded={state.ios ? help : undefined}>Instalar app</button>{help && <p className="muted small pwa-help" role="status">No Safari, toque em Compartilhar → Adicionar à Tela de Início. Depois, abra o LifeOS pelo novo ícone.</p>}</div>;
}
