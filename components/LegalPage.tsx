
import React from 'react';
import { ArrowLeft, Shield, Scale, Info, CheckCircle, Globe } from 'lucide-react';

interface LegalPageProps {
  type: 'legal' | 'privacy';
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onBack }) => {
  const isLegal = type === 'legal';

  return (
    <div className="relative bg-[#f8fafc] min-h-screen font-['Quicksand'] flex flex-col transition-colors duration-300 overflow-hidden">

      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#2b7dad]/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* Navigation */}
      <nav className="sticky top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 transition-colors duration-300">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#2b7dad] transition-colors bg-slate-50 hover:bg-[#2b7dad]/10 px-4 py-2 rounded-xl">
            <ArrowLeft size={18} />
            <span className="text-sm font-bold">Retour</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs font-black text-[#2b7dad] uppercase tracking-widest bg-[#2b7dad]/10 px-3 py-1 rounded-lg border border-[#2b7dad]/20">
              {isLegal ? 'Juridique' : 'GDPR'}
            </span>
          </div>
        </div>
      </nav>

      {/* Contenu Principal */}
      <main className="flex-1 flex flex-col items-center py-16 px-6 animate-wiki-in relative z-10">
        <div className="max-w-4xl w-full">

          <div className="glass-panel p-8 sm:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden bg-white/60 border border-white/60">
            {/* Header */}
            <header className="relative z-10 mb-16 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#2b7dad] to-[#20648f] rounded-[2.5rem] flex items-center justify-center text-white mb-8 shadow-xl shadow-[#2b7dad]/20 rotate-3">
                {isLegal ? <Scale size={40} /> : <Shield size={40} />}
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 mb-6 tracking-tight leading-tight">
                {isLegal ? 'Mentions Légales' : 'Confidentialité'}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-4 py-2 rounded-full border border-slate-200">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <p className="font-bold uppercase tracking-widest text-[10px]">
                  Mise à jour : 26 Janvier 2026
                </p>
              </div>
            </header>

            <div className="relative z-10 space-y-12">

              {isLegal ? (
                <>
                  {/* Section 1 */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                      <span className="w-10 h-10 bg-[#2b7dad]/10 rounded-xl flex items-center justify-center text-[#2b7dad]"><Globe size={20} /></span>
                      Édition & Statut du Site
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-4">
                      Le site <strong>Heartopia Wiki</strong> (heartopia.fr) est une plateforme communautaire indépendante dédiée au jeu Heartopia.
                    </p>
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
                      <CheckCircle className="text-amber-500 shrink-0 mt-1" size={20} />
                      <p className="text-sm text-slate-700 font-medium">
                        Ce site est un <strong>projet communautaire indépendant</strong>. Il n'entretient aucun lien officiel, partenariat ou affiliation avec <strong>XD Interactive Entertainment Co., Ltd.</strong> (l'éditeur du jeu). Les contenus sont produits par et pour la communauté des joueurs.
                      </p>
                    </div>
                  </section>

                  {/* Section 2 */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                      <span className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-500"><Shield size={20} /></span>
                      Propriété Intellectuelle
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-4">
                      L'ensemble des éléments graphiques, images, vidéos, logos et noms associés au jeu "Heartopia" sont la propriété exclusive de <strong>XD Interactive Entertainment Co., Ltd</strong>.
                    </p>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      Leur utilisation sur ce site s'inscrit dans le cadre d'un usage communautaire à titre informatif, sans lien officiel avec l'éditeur. Toute reproduction non autorisée par des tiers est strictement interdite sans l'accord préalable de l'éditeur.
                    </p>
                  </section>

                  {/* Section 3 */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                      <span className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500"><Info size={20} /></span>
                      Responsabilité
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      Ce site est géré exclusivement par l'équipe administrative de la communauté, sans intervention ni validation de XD Interactive. Le studio ne saurait être tenu responsable des contenus, opinions ou informations publiés sur ce site.
                    </p>
                  </section>
                </>
              ) : (
                <>
                  {/* Privacy Intro */}
                  <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl text-center">
                    <p className="text-emerald-700 font-bold text-sm">
                      Nous prenons votre vie privée très au sérieux. Aucune donnée n'est vendue à des tiers.
                    </p>
                  </div>

                  {/* Section 1 */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                      <div className="w-2 h-8 bg-[#2b7dad] rounded-full"></div>
                      Collecte des Données
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-4">
                      Dans le cadre de l'amélioration de notre service, nous collectons les données suivantes uniquement avec votre consentement explicite (via le bandeau cookies) :
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">1</span>
                        <span className="text-slate-600 text-sm font-medium"><strong>Audit de visite :</strong> Adresse IP anonymisée pour les statistiques de fréquentation.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">2</span>
                        <span className="text-slate-600 text-sm font-medium"><strong>Authentification :</strong> Données publiques Discord (Pseudo, Avatar, ID) lors de la connexion.</span>
                      </li>
                    </ul>
                  </section>

                  {/* Section 2 */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                      <div className="w-2 h-8 bg-[#2b7dad] rounded-full"></div>
                      Cookies & Traceurs
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      Nous utilisons un cookie technique unique (`heartopia_session`) pour maintenir votre connexion. Aucun cookie publicitaire tiers n'est utilisé sur ce site.
                    </p>
                  </section>

                  {/* Section 3 */}
                  <section className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <h2 className="text-2xl font-black text-slate-800 mb-4 flex items-center gap-3">
                      <div className="w-2 h-8 bg-[#2b7dad] rounded-full"></div>
                      Droit à l'oubli
                    </h2>
                    <p className="text-slate-600 font-medium leading-relaxed mb-4">
                      Conformément au RGPD, vous pouvez demander la suppression intégrale de vos données.
                    </p>
                    <button className="px-6 py-3 bg-red-50 text-red-500 font-bold text-sm rounded-xl border border-red-100 hover:bg-red-100 transition-colors w-full sm:w-auto text-left">
                      Procédure : Cliquez sur "Refuser & Supprimer" dans le bandeau de cookies ou contactez un administrateur.
                    </button>
                  </section>
                </>
              )}

            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onBack}
              className="bg-[#2b7dad] text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-[#2b7dad]/20 hover:bg-[#20648f] transition-all active:scale-95 group"
            >
              Compris, retour au site
            </button>
          </div>
        </div>
      </main>

      <footer className="py-10 text-center relative z-10">
        <p className="opacity-40 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">
          © 2026 Wiki Heartopia - Projet Communautaire
        </p>
      </footer>
    </div>
  );
};