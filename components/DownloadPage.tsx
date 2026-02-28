
import React, { useEffect } from 'react';
import { ArrowLeft, Apple, Smartphone, Gamepad2, Monitor, Download, CheckCircle, HelpCircle } from 'lucide-react';

interface DownloadPageProps {
  onBack: () => void;
}

export const DownloadPage: React.FC<DownloadPageProps> = ({ onBack }) => {

  // --- SEO DYNAMIC INJECTION ---
  useEffect(() => {
    document.title = "Télécharger Heartopia PC & Mobile | Liens de Téléchargement (2026)";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Comment télécharger Heartopia sur PC, iOS et Android ? Suivez le guide. Liens de téléchargement directs et sécurisés pour jouer gratuitement.");

    // Schema.org HowTo pour "Comment télécharger Heartopia"
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "Comment télécharger et installer Heartopia sur PC ?",
      "description": "Guide étape par étape pour installer le jeu Heartopia sur Windows via le launcher TapTap ou Steam.",
      "image": {
        "@type": "ImageObject",
        "url": "https://website.xdcdn.net/poster/133737826/home/s1/MEj0dry9.jpg",
        "height": "1080",
        "width": "1920"
      },
      "totalTime": "PT5M",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Choisir sa plateforme",
          "text": "Sélectionnez la version PC (Windows) via TapTap ou Steam.",
          "url": "https://heartopia.fr/telecharger"
        },
        {
          "@type": "HowToStep",
          "name": "Télécharger le client",
          "text": "Cliquez sur le bouton de téléchargement pour obtenir l'installeur.",
          "image": "https://website.xdcdn.net/poster/.system/store-btn/googleplay/download/fr_FR.svg"
        },
        {
          "@type": "HowToStep",
          "name": "Installation",
          "text": "Lancez l'exécutable et suivez les instructions à l'écran. Une connexion internet est requise."
        }
      ]
    };

    let script = document.querySelector('#seo-schema-download');
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-schema-download';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

    return () => {
      if (script) script.remove();
      document.title = "Heartopia - Wiki & Site Communautaire";
    };
  }, []);

  const platforms = [
    {
      id: 'steam',
      name: 'Heartopia PC (Steam)',
      icon: Gamepad2,
      desc: 'Version optimisée pour Windows 10/11',
      color: 'bg-[#1b2838] text-white',
      link: 'https://store.steampowered.com/app/4025700/Heartopia/',
      badge: 'Recommandé'
    },
    {
      id: 'taptap',
      name: 'Launcher PC (TapTap)',
      icon: Monitor,
      desc: 'Installeur officiel indépendant',
      color: 'bg-[#00C0D4] text-white',
      link: 'https://d.tap.io/pc/latest/coop-pc?jid=id231364'
    },
    {
      id: 'ios',
      name: 'App Store (iOS)',
      icon: Apple,
      desc: 'iPhone et iPad (iOS 14+)',
      color: 'bg-black text-white',
      link: 'https://apps.apple.com/us/app/heartopia/id6746151928'
    },
    {
      id: 'android',
      name: 'Google Play (Android)',
      icon: Smartphone,
      desc: 'Smartphones et Tablettes',
      color: 'bg-[#3DDC84] text-white',
      link: 'https://play.google.com/store/apps/details?id=com.xd.xdtglobal.gp&pli=1'
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Quicksand'] flex flex-col relative overflow-hidden">
      {/* SEO Content: Hidden Headline for structure */}
      <h1 className="sr-only">Télécharger Heartopia PC et Mobile - Wiki Communautaire</h1>

      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#2b7dad]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <nav className="relative z-10 p-6 flex justify-between items-center max-w-6xl mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#2b7dad] transition-colors bg-white/50 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/50">
          <ArrowLeft size={18} />
          <span>Retour à l'accueil</span>
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center py-12 px-6 relative z-10 animate-wiki-in">
        <div className="text-center mb-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2b7dad]/10 text-[#2b7dad] rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-[#2b7dad]/20">
            <Download size={14} /> Version 1.0 - Free to Play
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Jouez à <span className="text-[#2b7dad]">Heartopia</span> maintenant
          </h2>
          <p className="text-slate-500 font-bold text-lg leading-relaxed">
            L'aventure vous attend ! Choisissez votre plateforme ci-dessous pour télécharger le client du jeu.
            Heartopia est <strong>cross-platform</strong> : jouez sur PC et continuez sur mobile avec le même compte.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-16">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col justify-between h-48"
              title={`Télécharger ${platform.name}`}
            >
              <div className={`absolute top-0 right-0 w-40 h-40 ${platform.color} opacity-5 rounded-bl-[100%] transition-transform group-hover:scale-125 origin-top-right pointer-events-none`}></div>

              <div className="relative z-10 flex items-start justify-between">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${platform.color}`}>
                  <platform.icon size={32} />
                </div>
                {platform.badge && (
                  <span className="bg-[#2b7dad] text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                    {platform.badge}
                  </span>
                )}
              </div>

              <div className="relative z-10 mt-auto">
                <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center gap-2">
                  {platform.name}
                </h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider opacity-80">{platform.desc}</p>
              </div>

              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                <div className="w-12 h-12 bg-[#2b7dad] rounded-full flex items-center justify-center text-white shadow-lg">
                  <Download size={24} />
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* SEO CONTENT SECTION - FAQ & GUIDES */}
        <div className="max-w-4xl w-full space-y-8">
          <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <HelpCircle size={28} className="text-[#2b7dad]" />
              <h3 className="text-2xl font-black text-slate-800">Installation & Configuration Requise</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Monitor size={16} /> Configuration PC (Windows)</h4>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>OS : Windows 10/11 (64-bit)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>Processeur : Intel i5 / Ryzen 5 ou mieux</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>RAM : 8 GB minimum</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>Stockage : 10 GB d'espace libre</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><Smartphone size={16} /> Configuration Mobile</h4>
                <ul className="space-y-2 text-sm text-slate-600 font-medium">
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>Android : Version 10.0 ou supérieure</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>iOS : iOS 14.0 ou supérieur (iPhone XS+)</span></li>
                  <li className="flex items-start gap-2"><CheckCircle size={14} className="text-emerald-500 mt-1" /> <span>RAM : 4 GB minimum recommandé</span></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-2xl mx-auto">
              Heartopia est un jeu gratuit (Free-to-Play). Téléchargez le jeu via les liens ci-dessus pour garantir la sécurité de votre compte et bénéficier des dernières mises à jour automatiques.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};
