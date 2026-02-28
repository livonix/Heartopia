
import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, Loader2, ArrowLeft, Tag, HelpCircle, Smartphone, Terminal, Sparkles, Calendar, ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';
import { API_URL } from '../constants';

interface RedeemCodesProps {
  onBack: () => void;
  highlightId?: number;
}

export const RedeemCodes: React.FC<RedeemCodesProps> = ({ onBack, highlightId }) => {
  const [codes, setCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [interacting, setInteracting] = useState<number | null>(null);

  // --- SEO OPTIMIZATION ---
  useEffect(() => {
    // 1. Titre de page optimisé (Keyword stuffing intelligent)
    document.title = "Codes Heartopia 2026 | Liste des Codes Cadeaux Actifs & Gratuits";

    // 2. Méta Description dynamique
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Retrouvez tous les codes cadeaux actifs pour Heartopia en 2026. Obtenez gratuitement des pièces, meubles et vêtements exclusifs. Guide d'activation inclus.");

    // 3. Données structurées JSON-LD (FAQ + VideoGameContext)
    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "FAQPage",
          "mainEntity": [
            {
              "@type": "Question",
              "name": "Comment utiliser un code cadeau dans Heartopia ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Ouvrez le jeu Heartopia, allez dans les Paramètres (roue crantée), sélectionnez l'onglet 'Compte' puis cliquez sur 'Code Cadeau'. Entrez le code et validez."
              }
            },
            {
              "@type": "Question",
              "name": "Où trouver des codes Heartopia gratuits ?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Les codes sont distribués sur le Discord officiel et lors d'événements spéciaux. Cette page recense tous les codes actifs mis à jour quotidiennement."
              }
            }
          ]
        },
        {
          "@type": "Article",
          "headline": "Liste des Codes Heartopia Actifs (2026)",
          "datePublished": new Date().toISOString(),
          "dateModified": new Date().toISOString(),
          "author": {
            "@type": "Organization",
            "name": "Heartopia Wiki Communautaire"
          }
        }
      ]
    };

    let script = document.querySelector('#seo-schema-codes');
    if (!script) {
      script = document.createElement('script');
      script.id = 'seo-schema-codes';
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schemaData);

    return () => {
      document.title = "Heartopia - Wiki & Site Communautaire"; // Reset on unmount
      if (script) script.remove();
    };
  }, []);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch(`${API_URL}/codes`);
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Scroll to highlight if needed
  useEffect(() => {
    if (!loading && highlightId) {
      const el = document.getElementById(`code-${highlightId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-4', 'ring-[#2b7dad]', 'scale-[1.02]');
        setTimeout(() => {
          el.classList.remove('ring-4', 'ring-[#2b7dad]', 'scale-[1.02]');
        }, 3000);
      }
    }
  }, [loading, highlightId]);

  const handleInteraction = async (id: number, action: 'copy' | 'like' | 'dislike') => {
    // Optimistic Update
    setCodes(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (action === 'copy') return { ...c, usage_count: (c.usage_count || 0) + 1 };
      if (action === 'like') return { ...c, likes: (c.likes || 0) + 1 };
      if (action === 'dislike') return { ...c, dislikes: (c.dislikes || 0) + 1 };
      return c;
    }));

    // API Call
    try {
      await fetch(`${API_URL}/wiki/codes/${id}/${action}`, { method: 'POST' });
    } catch (e) {
      console.error("Interaction error", e);
    }
  };

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    handleInteraction(id, 'copy');
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  return (
    <div className="relative bg-[#fafbfc] min-h-screen font-['Quicksand'] flex flex-col">
      <nav className="sticky top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#2b7dad] transition-colors">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Retour à l'accueil</span>
          </button>
          <div className="flex items-center gap-2">
            <Gift className="text-[#2b7dad]" />
            <span className="font-black text-slate-800">Codes Cadeaux</span>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-12 animate-wiki-in">

        {/* H1 SEO-OPTIMIZED */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2b7dad]/10 text-[#2b7dad] rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <Tag size={14} /> Rewards 2026
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Codes <span className="text-[#2b7dad]">Heartopia</span> Actifs
          </h1>
          <p className="text-slate-500 font-medium text-lg max-w-3xl mx-auto leading-relaxed">
            Voici la liste complète et mise à jour des <strong>codes promotionnels (redeem codes)</strong> pour le jeu Heartopia.
            Copiez-les pour débloquer des pièces d'or, des diamants et des objets exclusifs gratuitement.
          </p>
        </div>

        {/* CODES GRID */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={40} className="animate-spin text-[#2b7dad]" />
          </div>
        ) : codes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {codes.map((code) => {
              const isActive = code.status === 'active';
              const likes = code.likes || 0;
              const dislikes = code.dislikes || 0;
              const totalVotes = likes + dislikes;
              const likePercent = totalVotes > 0 ? (likes / totalVotes) * 100 : 50;

              return (
                <div
                  key={code.id}
                  id={`code-${code.id}`}
                  className={`group relative flex flex-col sm:flex-row bg-white rounded-[2rem] border overflow-hidden transition-all duration-300 ${isActive ? 'border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1' : 'border-gray-100 opacity-60 grayscale'}`}
                >
                  {/* Left Side (Visual) */}
                  <div className={`w-full sm:w-32 p-6 flex items-center justify-center relative overflow-hidden ${isActive ? 'bg-[#2b7dad]' : 'bg-slate-200'}`}>
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite_linear]"></div>
                    <Gift className={`w-12 h-12 text-white drop-shadow-md ${isActive ? 'animate-bounce' : ''}`} style={{ animationDuration: '3s' }} />

                    {/* Perforation effect */}
                    <div className="absolute right-0 top-0 bottom-0 w-4 translate-x-1/2 flex flex-col justify-between py-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="w-3 h-3 rounded-full bg-[#fafbfc]"></div>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6 flex flex-col justify-center gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${isActive ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'}`}>
                            {isActive ? 'Actif' : 'Expiré'}
                          </span>
                          {isActive && <span className="text-[10px] font-bold text-[#2b7dad] bg-[#2b7dad]/10 px-2 py-0.5 rounded-md flex items-center gap-1"><Sparkles size={8} /> Nouveau</span>}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(code.created_at)}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-800 leading-tight mb-1">{code.reward}</h3>
                      {code.description && <p className="text-xs text-slate-500 font-medium">{code.description}</p>}
                    </div>

                    <button
                      onClick={() => isActive && handleCopy(code.id, code.code)}
                      disabled={!isActive}
                      className={`flex items-center justify-between p-3 rounded-xl border-2 border-dashed transition-all group/btn ${isActive ? 'bg-slate-50 border-slate-200 hover:border-[#2b7dad] hover:bg-[#2b7dad]/5 cursor-pointer' : 'bg-slate-50 border-slate-200 cursor-not-allowed'}`}
                      title={isActive ? "Cliquez pour copier le code" : "Ce code a expiré"}
                    >
                      <span className={`font-mono font-black text-xl tracking-wider ${isActive ? 'text-[#2b7dad]' : 'text-slate-400'}`}>
                        {code.code}
                      </span>
                      {isActive && (
                        <div className={`p-2 rounded-lg transition-colors ${copied === code.code ? 'bg-emerald-100 text-emerald-600' : 'bg-white text-slate-400 group-hover/btn:text-[#2b7dad]'}`}>
                          {copied === code.code ? <Check size={18} /> : <Copy size={18} />}
                        </div>
                      )}
                    </button>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <BarChart2 size={14} />
                        <span>{code.usage_count || 0} utilisations</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleInteraction(code.id, 'like')} className="p-1 hover:text-emerald-500 text-slate-400 transition-colors"><ThumbsUp size={14} /></button>
                          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all" style={{ width: `${likePercent}%` }}></div>
                          </div>
                          <button onClick={() => handleInteraction(code.id, 'dislike')} className="p-1 hover:text-red-500 text-slate-400 transition-colors"><ThumbsDown size={14} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm mb-20">
            <Gift size={48} className="text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-400">Aucun code disponible</h3>
            <p className="text-slate-400/80 text-sm">Revenez plus tard pour de nouvelles récompenses !</p>
          </div>
        )}

        {/* HOW TO ACTIVATE SECTION (SEO Rich) */}
        <div className="bg-white rounded-[3rem] p-8 lg:p-12 border border-slate-100 shadow-xl mb-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-[#2b7dad]/10 p-3 rounded-2xl text-[#2b7dad]">
              <HelpCircle size={32} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-black text-slate-800">Comment activer un Code Heartopia ?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-lg border-4 border-white shadow-md">1</div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Smartphone size={18} /> Ouvrez les Paramètres</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Lancez le jeu et cliquez sur l'icône d'engrenage située en haut à droite de l'écran pour accéder au menu.
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-lg border-4 border-white shadow-md">2</div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Tag size={18} /> Sélectionnez Code Cadeau</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Dans le menu de gauche, choisissez l'onglet <strong>"Compte"</strong> ou <strong>"Général"</strong>, puis cliquez sur le bouton "Code Cadeau" (Redeem Code).
              </p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 bg-[#2b7dad] rounded-full flex items-center justify-center text-white font-black text-lg border-4 border-[#2b7dad]/30 shadow-md">3</div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Terminal size={18} /> Entrez le Code</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Copiez un code depuis notre liste ci-dessus et collez-le dans le champ. Validez pour recevoir vos récompenses dans la boîte aux lettres !
              </p>
            </div>
          </div>
        </div>

        {/* SEO FOOTER TEXT (Hidden keywords for context) */}
        <div className="max-w-4xl mx-auto text-center space-y-6 opacity-70">
          <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">À propos des récompenses</h3>
          <p className="text-xs text-slate-400 leading-loose">
            Les <strong>codes cadeaux Heartopia</strong> (aussi appelés <em>Redeem Codes</em> ou <em>Gift Codes</em>) sont offerts par le studio <strong>XD Entertainment</strong> lors de mises à jour, de maintenances ou d'événements communautaires. Ils permettent aux joueurs sur Android, iOS et PC d'obtenir gratuitement des ressources précieuses comme des pièces d'or, des tickets de gacha, des meubles rares et des tenues exclusives. Consultez cette page régulièrement pour ne manquer aucun <strong>nouveau code Heartopia</strong> valide en 2026.
          </p>
        </div>

      </main>
    </div>
  );
};
