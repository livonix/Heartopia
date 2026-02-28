
import React from 'react';
import { ArrowLeft, ShieldAlert, Loader2, AlertCircle, Lock } from 'lucide-react';

interface AdminLoginProps {
  onBack: () => void;
  onLoginSuccess: (user: any) => void;
  isLoading?: boolean;
  error?: string | null;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBack, onLoginSuccess, isLoading, error }) => {
  const CLIENT_ID = '1459651039945818122';
  const REDIRECT_URI = encodeURIComponent(window.location.origin);
  
  const handleDiscordLogin = () => {
    localStorage.setItem('auth_mode', 'admin');
    // Scope 'identify' is sufficient now, as roles are managed in local DB
    const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify`;
    window.location.href = discordUrl;
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-['Quicksand']">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#55a4dd]/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px]"></div>

      <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold uppercase text-xs tracking-widest">
        <ArrowLeft size={16} /> Retour au site
      </button>

      <div className="max-w-md w-full animate-wiki-in">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-10 lg:p-14 shadow-2xl text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-slate-700">
             <Lock className="text-[#55a4dd]" size={32} />
          </div>

          <h1 className="text-3xl font-black text-white mb-4">Panel Administration</h1>
          <p className="text-slate-400 font-medium mb-10 leading-relaxed text-sm">
            Connectez-vous via Discord pour accéder au Dashboard. <br/>
            <span className="text-slate-500 italic">Si c'est votre première connexion, votre compte sera créé en tant que "Visiteur" et devra être validé par un administrateur.</span>
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-left animate-shake">
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-xs font-bold leading-normal">{error}</p>
            </div>
          )}

          <button 
            onClick={handleDiscordLogin}
            disabled={isLoading}
            className={`w-full bg-[#5865F2] hover:bg-[#4752C4] text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-[#5865F2]/20 group ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                Connexion...
              </>
            ) : (
              <>
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495a18.2736 18.2736 0 00-5.4877 0 11.7496 11.7496 0 00-.6174-1.2495.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.077.077 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/>
                </svg>
                S'identifier
              </>
            )}
          </button>
        </div>
        
        <p className="mt-8 text-slate-600 text-[10px] font-bold text-center uppercase tracking-widest">
          Heartopia Wiki Dev Panel v2.1.0
        </p>
      </div>
    </div>
  );
};
