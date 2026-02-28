
import React, { useState, useEffect } from 'react';
import { api } from '../lib/apiService';
import { useLanguage } from '../lib/languageContext';
import { MessagingSystem } from './MessagingSystem';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  Trash2, 
  User, 
  MessageCircle, 
  Loader2, 
  Gift, 
  ArrowRight,
  Filter,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';

interface Ad {
  id: number;
  discord_id: string;
  username: string;
  avatar: string;
  type: 'gift' | 'trade';
  item_wanted: string;
  item_offered: string;
  created_at: string;
}

interface TradingPostProps {
  onBack: () => void;
  user?: any;
  onLoginRequest: () => void;
}

export const TradingPost: React.FC<TradingPostProps> = ({ onBack, user, onLoginRequest }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'gift' | 'trade'>('all');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessagingOpen, setIsMessagingOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [targetContact, setTargetContact] = useState<any>(null); // Pour ouvrir la messagerie sur un utilisateur précis
  
  const [formData, setFormData] = useState({
    type: 'trade',
    item_wanted: '',
    item_offered: ''
  });

  const { t } = useLanguage();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const data = await api.fetch('/trading');
      setAds(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discord_id: user.id,
          username: user.username,
          avatar: user.avatar
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ type: 'trade', item_wanted: '', item_offered: '' });
        fetchAds();
      } else {
        const err = await res.json();
        alert(err.error || "Erreur");
      }
    } catch (e) {
      alert("Erreur réseau");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("Supprimer cette annonce ?", "Delete this ad?"))) return;
    try {
      const res = await fetch(`/api/trading/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discord_id: user.id, isAdmin: user.isAdmin }) // On envoie isAdmin pour le backend
      });
      if (res.ok) {
        setAds(prev => prev.filter(ad => ad.id !== id));
      } else {
        alert("Impossible de supprimer cette annonce.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleContact = (ad: Ad) => {
      if (!user) {
          onLoginRequest();
          return;
      }
      setTargetContact({ id: ad.discord_id, username: ad.username, avatar: ad.avatar });
      setIsMessagingOpen(true);
  };

  const filteredAds = ads.filter(ad => {
    const matchesType = filter === 'all' || ad.type === filter;
    const matchesSearch = !search || 
      ad.item_wanted.toLowerCase().includes(search.toLowerCase()) || 
      ad.item_offered.toLowerCase().includes(search.toLowerCase()) ||
      ad.username.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeStyle = (type: string) => {
    switch(type) {
        case 'gift': return { label: t('Don', 'Gift'), color: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', icon: Gift };
        default: return { label: t('Échange', 'Trade'), color: 'bg-purple-500', text: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: ArrowLeftRight };
    }
  };

  if (isMessagingOpen && user) {
      return <MessagingSystem user={user} onClose={() => setIsMessagingOpen(false)} initialContact={targetContact} />;
  }

  return (
    <div className="w-full flex-1 flex flex-col items-center py-12 px-4 sm:px-6 bg-[var(--wiki-bg)]">
      <div className="max-w-6xl w-full">
        
        {/* Header */}
        <div className="text-center mb-12 animate-wiki-in">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#2b7dad]/10 text-[#2b7dad] rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-[#2b7dad]/20">
             <ArrowLeftRight size={14} /> {t("Troc & Entraide", "Trade & Help")}
           </div>
           <h1 className="text-4xl lg:text-6xl font-black text-[var(--wiki-text-main)] mb-6 tracking-tight">
             Espace d'<span className="text-[#2b7dad]">Échange</span>
           </h1>
           <p className="text-[var(--wiki-text-muted)] font-bold text-lg max-w-2xl mx-auto leading-relaxed">
             {t(
               "Échangez ou donnez des objets à la communauté. Les ventes sont interdites.",
               "Trade or gift items to the community. Sales are prohibited."
             )}
           </p>
        </div>

        {/* Warning Banner */}
        <div className="mb-10 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex gap-4 items-start animate-slide-up">
            <ShieldAlert className="text-amber-600 shrink-0 mt-1" size={24} />
            <div>
                <h4 className="font-black text-amber-700 text-sm uppercase tracking-wide mb-1">Règlement Strict</h4>
                <p className="text-xs text-amber-800/80 font-bold leading-relaxed">
                    La vente et l'achat d'objets (contre monnaie réelle ou virtuelle) sont strictement interdits par le jeu.
                    Cet espace est réservé uniquement au troc (objet contre objet) et aux dons. 
                    Utilisez la messagerie sécurisée du site pour contacter les joueurs.
                </p>
            </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 sticky top-24 z-20 bg-[var(--wiki-bg)]/80 backdrop-blur-md p-4 rounded-3xl border border-[var(--wiki-border)] shadow-sm">
           <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === 'all' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'}`}>
                  {t("Tout", "All")}
              </button>
              <button onClick={() => setFilter('trade')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${filter === 'trade' ? 'bg-purple-500 text-white' : 'bg-white text-purple-600 hover:bg-purple-50 border border-purple-100'}`}>
                  <ArrowLeftRight size={14} /> {t("Échanges", "Trades")}
              </button>
              <button onClick={() => setFilter('gift')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${filter === 'gift' ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-600 hover:bg-emerald-50 border border-emerald-100'}`}>
                  <Gift size={14} /> {t("Dons", "Gifts")}
              </button>
           </div>

           <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                 <input 
                    type="text" 
                    placeholder={t("Objet, joueur...", "Item, player...")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:border-[#2b7dad] focus:ring-2 focus:ring-[#2b7dad]/10 transition-all"
                 />
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
              
              {user && (
                  <button 
                    onClick={() => { setTargetContact(null); setIsMessagingOpen(true); }}
                    className="bg-white border border-slate-200 text-slate-600 px-3 py-2.5 rounded-xl hover:text-[#2b7dad] hover:border-[#2b7dad] transition-all"
                    title="Mes Messages"
                  >
                    <MessageCircle size={20} />
                  </button>
              )}

              <button 
                onClick={() => user ? setIsModalOpen(true) : onLoginRequest()}
                className="bg-[#2b7dad] text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-[#2b7dad]/20 hover:bg-[#20648f] transition-all active:scale-95 whitespace-nowrap text-xs uppercase tracking-wider"
              >
                <Plus size={16} /> {t("Poster", "Post Ad")}
              </button>
           </div>
        </div>

        {/* Ads Grid */}
        {loading ? (
            <div className="flex justify-center py-20">
                <Loader2 size={40} className="animate-spin text-[#2b7dad]" />
            </div>
        ) : filteredAds.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
                <Filter size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-400">{t("Aucune annonce trouvée", "No ads found")}</h3>
                <p className="text-slate-400/80 text-sm mt-2">{t("Soyez le premier à poster !", "Be the first to post!")}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAds.map(ad => {
                    const style = getTypeStyle(ad.type);
                    const isOwner = user && user.id === ad.discord_id;
                    const isAdmin = user && user.isAdmin;
                    
                    return (
                        <div key={ad.id} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden">
                            {/* Top Stripe */}
                            <div className={`absolute top-0 left-0 w-full h-1.5 ${style.color}`}></div>

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <img src={ad.avatar} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" alt={ad.username} />
                                        <div className="absolute -bottom-1 -right-1 bg-[#5865F2] rounded-full p-0.5 border border-white">
                                            <User size={8} className="text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 text-sm leading-tight">{ad.username}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold">{new Date(ad.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className={`px-2.5 py-1 rounded-lg border ${style.bg} ${style.border} ${style.text} flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest`}>
                                    <style.icon size={10} /> {style.label}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 mb-6">
                                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Donne / Echange', 'Giving / Trading')}</p>
                                    <p className="text-slate-800 font-bold text-sm">{ad.item_offered}</p>
                                </div>
                                
                                {ad.type === 'trade' && (
                                    <>
                                        <div className="flex justify-center -my-2 relative z-10">
                                            <div className="bg-white border border-slate-100 rounded-full p-1.5 text-slate-400 shadow-sm">
                                                <ArrowRight size={14} className="rotate-90" />
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Contre (Recherche)', 'For (Looking for)')}</p>
                                            <p className="text-slate-800 font-bold text-sm">{ad.item_wanted}</p>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="mt-auto flex gap-3">
                                {isOwner ? (
                                    <button 
                                        onClick={() => handleDelete(ad.id)}
                                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Trash2 size={16} /> Supprimer
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => handleContact(ad)}
                                        className="flex-1 bg-[#2b7dad] hover:bg-[#20648f] text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#2b7dad]/20 active:scale-95"
                                    >
                                        <MessageCircle size={14} /> Envoyer un message
                                    </button>
                                )}
                                
                                {isAdmin && !isOwner && (
                                    <button 
                                        onClick={() => handleDelete(ad.id)}
                                        className="p-3 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                                        title="Admin Delete"
                                    >
                                        <ShieldAlert size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
      </div>

      {/* Modal Creation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-wiki-in">
            <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative">
                <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors"><Trash2 size={20} className="opacity-0" /><div className="absolute inset-0 flex items-center justify-center text-slate-400">✕</div></button>
                
                <h3 className="text-2xl font-black text-slate-800 mb-1">{t("Poster une annonce", "Post an Ad")}</h3>
                <p className="text-sm text-slate-500 font-bold mb-6">{t("Votre annonce sera visible par tous.", "Your ad will be visible to everyone.")}</p>

                <div className="mb-6 p-3 bg-amber-50 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-bold">
                    Rappel : La vente d'objets (argent réel ou virtuel) est interdite. Seuls les échanges et dons sont autorisés.
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t("Type d'annonce", "Ad Type")}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setFormData({...formData, type: 'trade'})} className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.type === 'trade' ? 'bg-purple-500 text-white border-purple-500' : 'bg-white text-slate-500 border-slate-200'}`}>{t("J'Échange", "I Trade")}</button>
                            <button type="button" onClick={() => setFormData({...formData, type: 'gift'})} className={`py-3 rounded-xl text-xs font-bold transition-all border ${formData.type === 'gift' ? 'bg-emerald-500 text-white border-emerald-500' : 'bg-white text-slate-500 border-slate-200'}`}>{t("Je Donne", "I Give")}</button>
                        </div>
                    </div>

                    <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                {t("Ce que je propose", "What I offer")}
                            </label>
                            <input 
                                type="text" 
                                required 
                                placeholder="Ex: 50x Bois, Canapé Bleu..." 
                                className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#2b7dad] focus:ring-2 focus:ring-[#2b7dad]/10"
                                value={formData.item_offered}
                                onChange={e => setFormData({...formData, item_offered: e.target.value})}
                            />
                        </div>

                        {formData.type === 'trade' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {t("Ce que je cherche", "What I want")}
                                </label>
                                <input 
                                    type="text" 
                                    required 
                                    placeholder="Ex: Bureau Blanc, Fer..." 
                                    className="w-full p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 focus:outline-none focus:border-[#2b7dad] focus:ring-2 focus:ring-[#2b7dad]/10"
                                    value={formData.item_wanted}
                                    onChange={e => setFormData({...formData, item_wanted: e.target.value})}
                                />
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="w-full py-4 bg-[#2b7dad] text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-[#20648f] transition-all shadow-xl shadow-[#2b7dad]/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        {submitting && <Loader2 size={16} className="animate-spin" />}
                        {t("Publier l'annonce", "Post Ad")}
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
