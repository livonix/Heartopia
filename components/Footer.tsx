
import React from 'react';
import { ASSETS } from '../constants';
import { Settings, ExternalLink, Globe, Cookie, MessageCircle, Github } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';

interface FooterProps {
  onAdminClick?: () => void;
  onTeamClick?: () => void;
  onLegalClick?: () => void;
  onPrivacyClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onAdminClick, onTeamClick, onLegalClick, onPrivacyClick }) => {
  const { t } = useLanguage();

  const resetCookies = () => {
    localStorage.removeItem('heartopia_consent');
    window.location.reload();
  };

  return (
    <footer className="bg-[#f3f3f3] py-12 sm:py-16 text-center text-[#7c6a55] text-sm border-t border-gray-200" id="footer">
      <div className="container mx-auto px-6 flex flex-col items-center gap-8 sm:gap-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 w-full max-w-5xl mb-6">
          <div className="flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2b7dad]/10 rounded-lg flex items-center justify-center text-[#2b7dad]">
                <Globe size={18} />
              </div>
              <h2 className="text-[#2b7dad] font-black text-lg uppercase tracking-tighter">Wiki Heartopia</h2>
            </div>
            <p className="opacity-90 text-xs font-semibold leading-relaxed text-[#7c6a55]">
              {t("footer.rights")}
            </p>
          </div>

          <div className="flex flex-col gap-3 text-left">
            <h3 className="text-[#7c6a55] font-black text-xs uppercase tracking-[0.2em] mb-1">{t("footer.resources")}</h3>
            <ul className="flex flex-col gap-2 text-sm font-bold text-[#5e4d3b]">
              <li><a href="#" className="hover:text-[#2b7dad] transition-colors flex items-center gap-2">{t("footer.guides")} <ExternalLink size={12} className="opacity-60" /></a></li>
              <li><a href="#" className="hover:text-[#2b7dad] transition-colors flex items-center gap-2">{t("footer.db")} <ExternalLink size={12} className="opacity-60" /></a></li>
                          </ul>
          </div>

          <div className="flex flex-col gap-4 text-left sm:col-span-2 lg:col-span-1">
            <h3 className="text-[#7c6a55] font-black text-xs uppercase tracking-[0.2em]">{t("footer.community")}</h3>
            <ul className="flex flex-col gap-3 text-sm font-bold text-[#5e4d3b]">
              <li>
                <a
                  href="https://discord.gg/3Gk9WexUNM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-[#5865F2] text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-[#4752C4] shadow-xl shadow-[#5865F2]/20 hover:-translate-y-1"
                >
                  <MessageCircle size={18} className="fill-white/20" />
                  {t("footer.join_discord")}
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/livonix/Heartopia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 bg-gray-800 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-gray-700 shadow-xl shadow-gray-800/20 hover:-translate-y-1"
                >
                  <Github size={18} className="fill-white/20" />
                  Code Source Open Source
                </a>
              </li>
              <li>
                <button onClick={onTeamClick} className="hover:text-[#2b7dad] transition-colors text-left pl-1">
                  {t("footer.meet_team")}
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="w-full h-px bg-gray-300"></div>

        <div className="w-full max-w-4xl">
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center mb-6 text-xs font-black uppercase tracking-widest text-[#5e4d3b]">
            <button onClick={onLegalClick} className="hover:text-[#2b7dad] transition">{t("footer.legal")}</button>
            <span className="hidden sm:block w-px h-3 bg-gray-400"></span>
            <button onClick={onPrivacyClick} className="hover:text-[#2b7dad] transition">{t("footer.privacy")}</button>
            <span className="hidden sm:block w-px h-3 bg-gray-400"></span>
            <button onClick={resetCookies} className="hover:text-[#2b7dad] transition flex items-center gap-1"><Cookie size={12} /> {t("footer.cookies")}</button>
            <span className="hidden sm:block w-px h-3 bg-gray-400"></span>
                        {onAdminClick && (
              <>
                <span className="hidden sm:block w-px h-3 bg-gray-400"></span>
                <button onClick={onAdminClick} className="flex items-center gap-1.5 hover:text-[#2b7dad] transition opacity-80 hover:opacity-100">
                  <Settings size={14} /> Admin
                </button>
              </>
            )}
          </div>

          <div className="px-5 py-5 bg-white/60 rounded-[1.5rem] border border-gray-200 text-[10px] sm:text-xs leading-relaxed text-left sm:text-center shadow-inner text-[#5e4d3b]">
            <p className="font-black text-[#2b7dad] mb-2 uppercase tracking-[0.2em] flex items-center justify-start sm:justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#2b7dad] rounded-full"></span>
              {t("common.official")}
              <span className="w-1.5 h-1.5 bg-[#2b7dad] rounded-full"></span>
            </p>
            <p className="font-semibold text-[#7c6a55]">
              {t("footer.rights")} Heartopia et ses visuels sont la propriété de leurs auteurs respectifs.
              Site officiel du jeu : <a href="https://heartopia.xd.com/" target="_blank" rel="noopener noreferrer" className="text-[#2b7dad] underline font-bold">heartopia.xd.com</a>.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <p className="opacity-80 text-[9px] font-bold uppercase tracking-[0.3em] text-[#7c6a55]">
            © 2026 Wiki Heartopia • {t("footer.madeby")} <a href="https://livonix.fr" target="_blank" rel="noopener noreferrer" className="hover:text-[#2b7dad] transition-colors">Livonix.fr</a>
          </p>
        </div>
      </div>
    </footer>
  );
};
