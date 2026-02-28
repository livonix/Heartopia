
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, X, Save, Loader2, ChevronRight, FileText, Layout, FolderOpen, ArrowRight, Lock, User } from 'lucide-react';
import { SectionEditor } from './SectionEditor';
import { api } from '../../lib/apiService';
import { useSocket } from '../../lib/socketContext';

export const WikiTab: React.FC = () => {
  const [view, setView] = useState<'categories' | 'pages' | 'sections'>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedPage, setSelectedPage] = useState<any>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formType, setFormType] = useState<'category' | 'page' | 'section'>('category');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Socket & Locks
  const { socket, locks } = useSocket();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => { 
      fetchCategories(); 
      // Get current user info from local storage to identify myself
      const userStr = localStorage.getItem('heartopia_user');
      if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await api.fetch('/admin/categories');
      setCategories(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchPages = async (catId: number) => {
    setLoading(true);
    try {
      const data = await api.fetch(`/admin/${getTableEndpoint('page')}/${catId}`);
      setPages(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const fetchSections = async (pageId: number) => {
    setLoading(true);
    try {
      const data = await api.fetch(`/admin/${getTableEndpoint('section')}/${pageId}`);
      setSections(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const getTableEndpoint = (type: string) => {
    const map: { [key: string]: string } = {
      'category': 'categories',
      'page': 'pages', 
      'section': 'sections',
      'guide': 'guide_portals',
      'academy': 'academy_videos',
      'comment': 'comments',
      'code': 'promo_codes',
      'announcement': 'announcements',
      'user': 'users'
    };
    return map[type] || `${type}s`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
        const method = editingId ? 'PUT' : 'POST';
        const endpoint = editingId ? `/admin/${getTableEndpoint(formType)}/${editingId}` : `/admin/${getTableEndpoint(formType)}`;
        
        // Copie sécurisée du payload
        const payload = { ...formData };

        // Sécurisation spécifique pour les sections : le contenu peut être un objet (via l'éditeur visuel) ou une string
        if (formType === 'section') {
            // Si c'est déjà un objet (depuis GridEditor/InfoboxEditor), on le laisse tel quel (axios stringify automatiquement en JSON)
            // Si c'est une string qui ressemble à du JSON, on tente de la parser pour que le backend reçoive du JSON propre
            if (typeof payload.content === 'string') {
                const trimmed = payload.content.trim();
                if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                    try {
                        payload.content = JSON.parse(trimmed);
                    } catch(e) {
                        // Si échec du parse, on envoie comme string (le backend gérera)
                        console.warn("Contenu section non-parsable, envoi comme texte brut");
                    }
                }
            }
            // S'assurer que page_id est bien défini
            if (!payload.page_id && selectedPage) {
                payload.page_id = selectedPage.id;
            }
        }

        await api.fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        // Rafraîchissement des données selon le contexte
        if (formType === 'category') await fetchCategories();
        if (formType === 'page' && selectedCategory) await fetchPages(selectedCategory.id);
        if (formType === 'section' && selectedPage) {
            await fetchSections(selectedPage.id);
            // UNLOCK ON SAVE
            if (socket && editingId) {
                socket.emit('unlock_section', { sectionId: editingId });
            }
        }
        
        setIsModalOpen(false);
    } catch (err: any) { 
        console.error("Save Error:", err);
        alert(`Erreur lors de la sauvegarde : ${err.message || "Erreur inconnue"}.\nVérifiez que le contenu (images) n'est pas trop lourd.`);
    } finally { 
        setLoading(false); 
    }
  };

  const handleDelete = async (type: string, id: number) => {
    if (!confirm("Supprimer définitivement cet élément ?")) return;
    try {
      await api.fetch(`/admin/${getTableEndpoint(type)}/${id}`, { method: 'DELETE' });
      if (type === 'category') fetchCategories();
      if (type === 'page' && selectedCategory) fetchPages(selectedCategory.id);
      if (type === 'section' && selectedPage) fetchSections(selectedPage.id);
    } catch (e) { console.error(e); }
  };

  const closeModal = () => {
      // UNLOCK ON CANCEL
      if (formType === 'section' && editingId && socket) {
          socket.emit('unlock_section', { sectionId: editingId });
      }
      setIsModalOpen(false);
  };

  const openAdd = (type: any) => {
    setFormType(type);
    setEditingId(null);
    if (type === 'category') setFormData({ name: '', label: '' });
    if (type === 'page') setFormData({ title: '', slug: '', category_id: selectedCategory?.id });
    if (type === 'section') setFormData({ title: '', content: '', order_index: sections.length, page_id: selectedPage?.id });
    setIsModalOpen(true);
  };

  const openEdit = (type: any, item: any) => {
    // CHECK LOCK
    if (type === 'section') {
        const lock = locks[item.id];
        // If locked by someone else
        if (lock && lock.userId !== currentUser?.internal_id) {
            alert(`⛔ Cette section est en cours de modification par ${lock.username}.`);
            return;
        }
        // LOCK IT
        if (socket && currentUser) {
            socket.emit('lock_section', { 
                sectionId: item.id, 
                user: { id: currentUser.internal_id, username: currentUser.username } 
            });
        }
    }

    setFormType(type);
    setEditingId(item.id);
    const processedItem = { ...item };
    
    // Tenter de parser le contenu pour l'éditeur si c'est une string JSON
    if (type === 'section' && typeof processedItem.content === 'string') {
      try {
        if (processedItem.content.trim().startsWith('[') || processedItem.content.trim().startsWith('{')) {
          processedItem.content = JSON.parse(processedItem.content);
        }
      } catch (e) { /* ignore */ }
    }
    setFormData(processedItem);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border border-gray-200 p-4 rounded-lg flex flex-wrap items-center gap-3">
        <button 
          onClick={() => { setView('categories'); setSelectedCategory(null); setSelectedPage(null); }} 
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'categories' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Layout size={14} /> Structure
        </button>
        
        {selectedCategory && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <button 
              onClick={() => { setView('pages'); setSelectedPage(null); fetchPages(selectedCategory.id); }} 
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === 'pages' ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <FolderOpen size={14} /> {selectedCategory.name}
            </button>
          </>
        )}
        
        {selectedPage && (
          <>
            <ChevronRight size={14} className="text-gray-400" />
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium">
              <FileText size={14} /> {selectedPage.title}
            </div>
          </>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={40} />
        </div>
      )}

      {/* VIEW: CATEGORIES */}
      {!loading && view === 'categories' && (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">Catégories Principales</h3>
                <button onClick={() => openAdd('category')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <Plus size={14} /> Ajouter
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                    <div key={cat.id} className="group bg-white border border-gray-200 hover:border-gray-300 p-6 rounded-lg cursor-pointer transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
                                <Layout size={24} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => { e.stopPropagation(); openEdit('category', cat); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"><Edit2 size={14}/></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete('category', cat.id); }} className="p-2 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600"><Trash2 size={14}/></button>
                            </div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{cat.name}</h3>
                        <p className="text-gray-500 text-sm mb-4">{cat.label}</p>
                        
                        <button 
                            onClick={() => { setSelectedCategory(cat); setView('pages'); fetchPages(cat.id); }} 
                            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 group-hover:text-blue-600 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            Gérer les pages <ArrowRight size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* VIEW: PAGES */}
      {!loading && view === 'pages' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900">Pages</h3>
                <p className="text-gray-600 text-sm">Gérez les pages de la catégorie <span className="text-blue-600 font-medium">{selectedCategory?.name}</span></p>
             </div>
             <button onClick={() => openAdd('page')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
               <Plus size={16}/> Nouvelle Page
             </button>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {pages.map((p, idx) => (
              <div key={p.id} className={`p-4 flex items-center justify-between group hover:bg-gray-50 transition-colors ${idx !== pages.length - 1 ? 'border-b border-gray-200' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-mono text-sm font-medium">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{p.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">SLUG</span>
                        <span className="text-gray-600 text-sm font-mono">/{p.slug}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => { setSelectedPage(p); setView('sections'); fetchSections(p.id); }} 
                    className="px-3 py-2 bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-600 rounded-lg text-sm font-medium transition-colors"
                  >
                    Sections
                  </button>
                  <div className="h-6 w-px bg-gray-300"></div>
                  <button onClick={() => openEdit('page', p)} className="p-2 text-gray-500 hover:text-gray-700 transition-colors"><Edit2 size={16}/></button>
                  <button onClick={() => handleDelete('page', p.id)} className="p-2 text-gray-500 hover:text-red-600 transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
            {pages.length === 0 && <div className="p-10 text-center text-gray-500 text-sm">Aucune page dans cette catégorie.</div>}
          </div>
        </div>
      )}

      {/* VIEW: SECTIONS */}
      {!loading && view === 'sections' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-gray-900">Contenu</h3>
                <p className="text-gray-600 text-sm">Édition de <span className="text-blue-600 font-medium">{selectedPage?.title}</span></p>
             </div>
             <button onClick={() => openAdd('section')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
               <Plus size={16}/> Nouvelle Section
             </button>
          </div>

          <div className="space-y-4">
            {sections.map(s => {
              const isLocked = locks[s.id];
              const isLockedByMe = isLocked && currentUser && isLocked.userId === currentUser.internal_id;
              
              return (
              <div key={s.id} className={`bg-white border ${isLocked ? 'border-amber-300' : 'border-gray-200'} p-6 rounded-lg relative group transition-all hover:border-gray-300 hover:shadow-md`}>
                {/* LOCKED INDICATOR */}
                {isLocked && (
                    <div className="absolute top-0 right-0 bg-amber-50 border-l border-b border-amber-200 rounded-bl-lg px-3 py-2 flex items-center gap-2">
                        <Lock size={12} className="text-amber-600" />
                        <span className="text-xs font-medium text-amber-600">
                            Édité par {isLockedByMe ? 'Moi' : isLocked.username}
                        </span>
                    </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-200">
                      #{s.order_index}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900">{s.title}</h4>
                  </div>
                  <div className={`flex gap-2 ${isLocked && !isLockedByMe ? 'opacity-30 pointer-events-none' : ''}`}>
                    <button onClick={() => openEdit('section', s)} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex items-center gap-2">
                        {isLocked ? <><Lock size={10} /> Verrouillé</> : 'Éditer'}
                    </button>
                    <button onClick={() => handleDelete('section', s.id)} className="p-1.5 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
                
                <div className={`bg-gray-50 p-4 rounded-lg border border-gray-200 ${isLocked && !isLockedByMe ? 'opacity-50 grayscale' : ''}`}>
                   <p className="text-sm text-gray-600 font-mono line-clamp-2">
                     {typeof s.content === 'string' ? s.content : JSON.stringify(s.content).substring(0, 150) + '...'}
                   </p>
                   {typeof s.content !== 'string' && (
                      <div className="mt-2 flex gap-2">
                         <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">DATA COMPLEXE</span>
                         <span className="text-xs font-medium text-gray-500">{Array.isArray(s.content) ? `${s.content.length} éléments` : 'Objet JSON'}</span>
                      </div>
                   )}
                </div>
              </div>
            )})}
            {sections.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-lg">
                    <Layout size={40} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 font-medium">Cette page est vide.</p>
                </div>
            )}
          </div>
        </div>
      )}

      {/* SHARED MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`bg-white border border-gray-200 w-full p-6 rounded-lg shadow-xl relative max-h-[90vh] flex flex-col ${formType === 'section' ? 'max-w-4xl' : 'max-w-md'}`}>
            <div className="flex justify-between items-center mb-6">
              <div>
                 <p className="text-xs font-medium text-blue-600 mb-1">{editingId ? 'Modification' : 'Création'}</p>
                 <h3 className="text-xl font-semibold text-gray-900">{formType}</h3>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto space-y-4">
              {formType === 'category' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nom</label>
                    <input type="text" placeholder="Ex: Encyclopédie" required className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 transition-colors" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Label</label>
                    <input type="text" placeholder="Ex: Tout répertorier" required className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 transition-colors" value={formData.label || ''} onChange={e => setFormData({...formData, label: e.target.value})} />
                  </div>
                </div>
              )}
              {formType === 'page' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Titre</label>
                    <input type="text" placeholder="Ex: Guide Pêche" required className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 transition-colors" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Slug URL</label>
                    <input type="text" placeholder="Ex: guide-peche" required className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-gray-900 font-mono text-sm transition-colors" value={formData.slug || ''} onChange={e => setFormData({...formData, slug: e.target.value})} />
                  </div>
                </div>
              )}
              {formType === 'section' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="sm:col-span-3 space-y-2">
                       <label className="text-sm font-medium text-gray-700">Titre Section</label>
                       <input type="text" placeholder="Titre..." required className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" value={formData.title || ''} onChange={e => setFormData({...formData, title: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-700">Ordre</label>
                       <input type="number" className="w-full bg-gray-50 border border-gray-300 p-3 rounded-lg text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-center" value={formData.order_index || 0} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value)})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Contenu</label>
                    <SectionEditor value={formData.content || ''} onChange={(val) => setFormData({...formData, content: val})} />
                  </div>
                </div>
              )}
            </form>

            <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button type="button" onClick={closeModal} className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors">Annuler</button>
                <button onClick={(e) => handleSave(e as any)} type="submit" disabled={loading} className="flex-[2] py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16}/>} Enregistrer
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
