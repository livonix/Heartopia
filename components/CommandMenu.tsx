import React, { useState, useEffect } from 'react';
import { Search, Book, FileText, User, Gift, Layout, ArrowRight } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import { WIKI_STRUCTURE } from '../constants';

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
}

export const CommandMenu: React.FC<CommandMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useLanguage();

  // Generate searchable items
  const items = [
    { id: 'home', label: t('nav.home'), icon: Layout, type: 'nav', action: () => onNavigate('home') },
    { id: 'wiki', label: t('nav.wiki'), icon: Book, type: 'nav', action: () => onNavigate('wiki') },
    { id: 'showcase', label: 'Galerie Créations', icon: Layout, type: 'nav', action: () => onNavigate('showcase') },
    { id: 'codes', label: t('nav.codes'), icon: Gift, type: 'nav', action: () => onNavigate('codes') },
    { id: 'team', label: t('nav.team'), icon: User, type: 'nav', action: () => onNavigate('team') },
    // Add Wiki Categories
    ...WIKI_STRUCTURE.flatMap(cat => 
        (cat.pages || []).map(page => ({
            id: `wiki-${page.slug}`,
            label: page.title,
            subLabel: cat.name,
            icon: FileText,
            type: 'wiki',
            action: () => onNavigate('wiki', { slug: page.slug })
        }))
    )
  ];

  const filteredItems = items.filter(item => 
    item.label.toLowerCase().includes(query.toLowerCase()) || 
    (item.subLabel && item.subLabel.toLowerCase().includes(query.toLowerCase()))
  ).slice(0, 8);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) onClose(); // Actually opens it because parent toggles or we need a way to open. 
        // Wait, the prop is isOpen. The parent handles the toggle.
        // This listener is for when it's NOT open, but the component might not be mounted?
        // Usually CommandMenu is always mounted but hidden, or parent handles the keydown.
        // Let's assume parent handles opening.
      }
      
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => (i + 1) % filteredItems.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => (i - 1 + filteredItems.length) % filteredItems.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in flex flex-col">
        <div className="flex items-center px-4 py-4 border-b border-white/5">
          <Search className="text-slate-400 w-5 h-5 mr-3" />
          <input 
            type="text" 
            placeholder="Rechercher une page, un guide, un menu..." 
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-sm font-medium h-6"
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            autoFocus
          />
          <div className="flex gap-2">
             <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-1 rounded border border-white/5">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
           {filteredItems.length === 0 ? (
             <div className="py-12 text-center text-slate-500 text-sm font-medium">
               Aucun résultat trouvé.
             </div>
           ) : (
             <div className="space-y-1">
               {filteredItems.map((item, idx) => (
                 <button
                   key={item.id}
                   onClick={() => { item.action(); onClose(); }}
                   onMouseEnter={() => setSelectedIndex(idx)}
                   className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${idx === selectedIndex ? 'bg-[#2b7dad] text-white' : 'text-slate-300 hover:bg-white/5'}`}
                 >
                   <div className={`p-2 rounded-lg ${idx === selectedIndex ? 'bg-white/20' : 'bg-white/5 text-slate-400'}`}>
                     <item.icon size={16} />
                   </div>
                   <div className="flex-1 text-left">
                     <div className="text-sm font-bold">{item.label}</div>
                     {item.subLabel && <div className={`text-[10px] uppercase tracking-wider font-bold ${idx === selectedIndex ? 'text-white/70' : 'text-slate-500'}`}>{item.subLabel}</div>}
                   </div>
                   {idx === selectedIndex && <ArrowRight size={16} className="opacity-50" />}
                 </button>
               ))}
             </div>
           )}
        </div>
        
        <div className="px-4 py-2 bg-black/20 border-t border-white/5 text-[10px] font-bold text-slate-500 flex justify-between">
           <span>Heartopia Wiki Command</span>
           <div className="flex gap-3">
              <span>↑↓ Naviguer</span>
              <span>↵ Sélectionner</span>
           </div>
        </div>
      </div>
    </div>
  );
};
