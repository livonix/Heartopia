
import React, { useState, useEffect } from 'react';
import { useSocket } from '../lib/socketContext';
import { WifiOff, Wifi, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

export const ConnectionOverlay: React.FC = () => {
  const { isConnected } = useSocket();
  const [showOverlay, setShowOverlay] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'reconnected'>('disconnected');
  // Nouvel état pour savoir si on a déjà établi une connexion au moins une fois
  const [hasConnectedOnce, setHasConnectedOnce] = useState(false);

  // Gère l'état de connexion/déconnexion
  useEffect(() => {
    if (isConnected) {
      // On marque que l'utilisateur a bien été connecté au site
      if (!hasConnectedOnce) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasConnectedOnce(true);
      }

      // Si l'overlay était affiché (donc on était déconnecté), on passe au vert
      if (showOverlay && status === 'disconnected') {
        setStatus('reconnected');
      }
    } else {
      // On ne montre l'écran rouge QUE si l'utilisateur avait déjà établi une connexion
      // Cela évite l'écran rouge au chargement initial de la page
      if (hasConnectedOnce) {
        setStatus('disconnected');
        setShowOverlay(true);
      }
    }
  }, [isConnected, showOverlay, status, hasConnectedOnce]);

  // Gère le timer de disparition UNIQUEMENT quand le statut passe à 'reconnected'
  useEffect(() => {
    if (status === 'reconnected') {
      const timer = setTimeout(() => {
        setShowOverlay(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!showOverlay) return null;

  return (
    <div 
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 text-center transition-colors duration-500 font-['Quicksand'] overflow-y-auto
      ${status === 'disconnected' ? 'bg-red-600' : 'bg-emerald-500'}`}
    >
      <div className="max-w-4xl w-full flex flex-col items-center animate-fade-in my-auto">
        
        {/* ICON */}
        <div className="mb-6 md:mb-8 shrink-0">
          {status === 'disconnected' ? (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <WifiOff className="text-white w-12 h-12 md:w-16 md:h-16" />
            </div>
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 rounded-full flex items-center justify-center animate-bounce">
              <Wifi className="text-white w-12 h-12 md:w-16 md:h-16" />
            </div>
          )}
        </div>

        {/* CONTENT */}
        {status === 'disconnected' ? (
          <>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight drop-shadow-lg leading-none">
              CONNEXION PERDUE
            </h1>
            
            <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-3xl p-6 md:p-12 shadow-2xl w-full max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-white mb-6">
                <AlertTriangle className="animate-bounce shrink-0 w-8 h-8 md:w-10 md:h-10" />
                <span className="text-lg sm:text-xl md:text-2xl font-black uppercase tracking-widest text-center">Action Requise</span>
              </div>

              <p className="text-white font-bold text-lg sm:text-xl md:text-2xl leading-relaxed mb-6 md:mb-8">
                NE RECHARGEZ SURTOUT PAS LA PAGE !
              </p>

              <div className="space-y-4 text-white/90 font-medium text-sm sm:text-base md:text-lg text-left bg-black/20 p-4 md:p-6 rounded-2xl">
                <p>⚠️ Cette coupure peut être due à :</p>
                <ul className="list-disc pl-5 space-y-1 sm:space-y-2">
                  <li>Une micro-coupure réseau temporaire.</li>
                  <li>Une mise à jour système effectuée par un administrateur.</li>
                  <li>Un redémarrage du serveur de données.</li>
                </ul>
              </div>

              <div className="mt-6 md:mt-8 flex flex-col items-center gap-3 md:gap-4">
                <div className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs sm:text-sm bg-white/20 px-4 py-2 sm:px-6 sm:py-3 rounded-full whitespace-nowrap">
                  <Loader2 size={16} className="animate-spin shrink-0" />
                  <span>Tentative de reconnexion...</span>
                </div>
                <p className="text-white/60 text-[10px] sm:text-xs font-bold">Veuillez patienter, le système va revenir tout seul.</p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-white mb-4 uppercase tracking-tight drop-shadow-lg leading-tight">
              CONNEXION RÉTABLIE
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/20 px-6 py-3 sm:px-8 sm:py-4 rounded-full">
              <CheckCircle className="text-white w-8 h-8 md:w-10 md:h-10 shrink-0" />
              <span className="text-white font-bold text-base sm:text-lg md:text-xl uppercase tracking-widest">Système Opérationnel</span>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
