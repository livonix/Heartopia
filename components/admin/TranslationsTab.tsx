
import React, { useState, useEffect } from 'react';
import { api } from '../../lib/apiService';
import { Languages, Loader2, Play, RefreshCw, CheckCircle, Globe } from 'lucide-react';
import { useSocket } from '../../lib/socketContext';

export const TranslationsTab: React.FC = () => {
  const [languages, setLanguages] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [report, setReport] = useState<any>(null);
  
  // Progress State
  const [progress, setProgress] = useState(0);
  const [currentCount, setCurrentCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  const { socket } = useSocket();

  // Listen to socket progress
  useEffect(() => {
      if (!socket) return;
      const onProgress = (data: any) => {
          setProgress(data.progress);
          setCurrentCount(data.current);
          setTotalCount(data.total);
      };
      socket.on('translation_progress', onProgress);
      return () => { socket.off('translation_progress', onProgress); };
  }, [socket]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [langs, st] = await Promise.all([
        api.fetch('/admin/translations/languages'),
        api.fetch('/admin/translations/stats')
      ]);
      setLanguages(langs);
      setStats(st);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleGenerate = async () => {
    if (!confirm("Lancer la génération des traductions ? Cela inclut le wiki, les news, l'équipe, et les portails d'accueil.")) return;
    setProcessing(true);
    setReport(null);
    setProgress(0);
    setCurrentCount(0);
    setTotalCount(0);
    
    try {
        const res = await api.fetch('/admin/translations/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ languages: [] }) // Empty array = all languages
        });
        setReport(res.report);
        fetchData();
    } catch (e) {
        alert("Erreur lors de la génération");
    } finally {
        setProcessing(false);
    }
  };

  const getStatForLang = (code: string) => {
      const stat = stats.find((s: any) => s.language_code === code);
      return stat ? stat.count : 0;
  };

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h2 className="text-3xl font-black text-white">Traduction IA</h2>
           <p className="text-slate-400 text-sm font-medium">Générez automatiquement les traductions du wiki en plusieurs langues.</p>
        </div>
        <button 
            onClick={handleGenerate} 
            disabled={processing}
            className={`bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg transition-all text-xs uppercase tracking-wider ${processing ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
        >
          {processing ? <Loader2 size={16} className="animate-spin"/> : <Play size={16}/>} 
          {processing ? 'Génération en cours...' : 'Lancer les traductions'}
        </button>
      </div>

      {/* Progress Bar */}
      {processing && (
          <div className="bg-[#0f172a] p-6 rounded-2xl border border-blue-500/30 animate-pulse">
              <div className="flex justify-between text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest">
                  <span>Traduction en cours...</span>
                  <span>{Math.round(progress)}% ({currentCount} / {totalCount})</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300 ease-out rounded-full" 
                    style={{ width: `${progress}%` }}
                  ></div>
              </div>
          </div>
      )}

      {report && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-3xl flex items-center gap-4 animate-wiki-in">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                  <CheckCircle size={24} />
              </div>
              <div>
                  <h4 className="text-white font-black text-lg">Terminé !</h4>
                  <p className="text-emerald-400 text-sm font-bold">
                      {report.success} champs traduits avec succès. {report.failed} erreurs.
                  </p>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {languages.map(lang => (
              <div key={lang.code} className="bg-[#0f172a] p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#55a4dd] transition-all">
                          <Globe size={20} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-black/20 px-2 py-1 rounded">{lang.code}</span>
                  </div>
                  
                  <h3 className="text-xl font-black text-white mb-1">{lang.name}</h3>
                  <p className="text-slate-400 text-xs font-bold mb-6">Langue supportée</p>
                  
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Entrées trad.</span>
                      <span className="text-2xl font-black text-[#55a4dd]">{getStatForLang(lang.code)}</span>
                  </div>
              </div>
          ))}
      </div>

      <div className="bg-[#0f172a] p-8 rounded-[2rem] border border-white/5">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2"><RefreshCw size={18} className="text-slate-500"/> Couverture de Traduction</h3>
          <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
              L'IA analyse et traduit le contenu dynamique suivant :
              <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li><strong>Wiki :</strong> Catégories, Pages, Sections (y compris grilles et infoboxes).</li>
                  <li><strong>Page d'accueil :</strong> Portails de guides.</li>
                  <li><strong>News :</strong> Titres et contenu des annonces.</li>
                  <li><strong>Équipe :</strong> Rôles et descriptions des membres.</li>
                  <li><strong>Académy :</strong> Titres des vidéos.</li>
                  <li><strong>Codes :</strong> Récompenses et descriptions.</li>
              </ul>
              <br/>
              Les éléments d'interface statiques (menus, footer, textes légaux) sont gérés séparément par le code frontend.
          </p>
      </div>
    </div>
  );
};
