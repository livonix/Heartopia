import React from 'react';
import { Search, Filter, Info, Star, BookOpen } from 'lucide-react';

interface WikiContentProps {
  view: string;
}

export const WikiContent: React.FC<WikiContentProps> = ({ view }) => {
  const getTitle = () => {
    switch(view) {
      case 'faune': return 'Faune d\'Heartopia';
      case 'flore': return 'Botanique & Agriculture';
      case 'artisanat': return 'Atelier d\'Artisanat';
      case 'mobilier': return 'Catalogue de Mobilier';
      case 'personnages': return 'Répertoire des Citoyens';
      case 'guides': return 'Bibliothèque de Guides';
      default: return 'Encyclopédie';
    }
  };

  // Mock data generator for visual demonstration
  const items = React.useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    id: i,
    name: `Objet ${i + 1}`,
    // eslint-disable-next-line react-hooks/purity
    rarity: Math.floor(Math.random() * 5) + 1,
    category: view,
    img: `https://website.xdcdn.net/poster/133737826/home/fr/MLBEsJcR.jpg`
  })), [view]);

  return (
    <div className="w-full">
      {/* Header de la vue */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-4xl lg:text-6xl font-bold text-[#55a4dd] mb-2 tracking-tight">
            {getTitle()}
          </h2>
          <p className="text-[#9a836b] font-medium text-lg">
            Retrouvez toutes les informations détaillées sur la catégorie {view}.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Filtrer..." 
              className="bg-white/80 border-2 border-white rounded-full px-6 py-3 pl-12 text-[#9a836b] focus:ring-4 focus:ring-[#55a4dd]/20 outline-none w-64 shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#55a4dd]" size={18} />
          </div>
          <button className="p-3 bg-white/80 border-2 border-white rounded-2xl text-[#9a836b] hover:text-[#55a4dd] transition-colors shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Grille d'objets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="group relative glass-panel p-4 rounded-[2.5rem] transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl cursor-pointer">
            <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-[#fdf8f0] border-2 border-white relative">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute top-3 right-3 flex gap-0.5">
                {Array.from({ length: item.rarity }).map((_, r) => (
                   <Star key={r} size={12} fill="#ffcc00" className="text-[#ffcc00]" />
                ))}
              </div>
            </div>
            
            <div className="px-2">
              <h3 className="font-bold text-[#9a836b] text-xl mb-1 group-hover:text-[#55a4dd] transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#55a4dd] uppercase tracking-wider bg-[#55a4dd]/10 px-3 py-1 rounded-full">
                  {item.category}
                </span>
                <Info size={16} className="text-[#9a836b] opacity-40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Aide contextuelle */}
      <div className="mt-16 bg-white/40 p-8 rounded-[3rem] border-2 border-white flex items-center gap-6">
        <div className="w-16 h-16 bg-[#55a4dd] text-white rounded-3xl flex items-center justify-center shadow-lg shrink-0">
          <BookOpen size={32} />
        </div>
        <div>
          <h4 className="font-bold text-[#9a836b] text-xl mb-1">Besoin d'aide pour cette section ?</h4>
          <p className="text-[#9a836b]/80 font-medium">
            Nos guides communautaires expliquent en détail comment obtenir chaque objet de cette liste. 
            <button className="text-[#55a4dd] underline ml-1 font-bold">Voir les tutoriels liés</button>.
          </p>
        </div>
      </div>
    </div>
  );
};