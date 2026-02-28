
import React, { useState } from 'react';
import { FEATURES, WIKI_STRUCTURE } from '../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../lib/languageContext';
import { SmartImage } from './SmartImage';

export const Features: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const { lang, t } = useLanguage();

  return (
    <div className="w-full flex-1 flex flex-col items-center justify-center py-32 px-6 overflow-hidden relative">
      <div className="w-full max-w-7xl relative z-10 flex flex-col items-center mx-auto">

        <div className="text-center mb-10 w-full">
          <h2 className="text-4xl lg:text-6xl font-bold text-[#2b7dad] mb-6">{t("feat.db")}</h2>

          <div className="flex flex-wrap justify-center gap-3 lg:gap-4 max-w-4xl mx-auto">
            {WIKI_STRUCTURE.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`px-6 py-2.5 rounded-full font-bold text-sm lg:text-base transition-all duration-300 border-2 
                  ${current === idx
                    ? 'bg-[#2b7dad] text-white border-[#2b7dad] shadow-lg scale-110'
                    : 'bg-white/60 text-[#7c6a55] border-white/80 hover:bg-white'
                  }`}
              >
                {lang === 'fr' ? cat.name : (cat.name_en || cat.name)}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full max-w-5xl aspect-[16/9] lg:aspect-[21/9] flex items-center justify-center mx-auto">
          {FEATURES.map((img, idx) => {
            const cat = WIKI_STRUCTURE[idx % WIKI_STRUCTURE.length];
            const catName = lang === 'fr' ? cat.name : (cat.name_en || cat.name);
            const catLabel = lang === 'fr' ? cat.label : (cat.label_en || cat.label);

            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-all duration-700 ease-in-out px-4 
                ${idx === current % FEATURES.length
                    ? 'opacity-100 translate-x-0 scale-100 z-20'
                    : 'opacity-0 translate-x-20 scale-95 z-10 pointer-events-none'
                  }`}
              >
                <div className="w-full h-full glass-panel rounded-[3rem] overflow-hidden group">
                  <SmartImage
                    src={img}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    alt="Encyclopédie"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8 lg:p-12">
                    <h3 className="text-white text-3xl lg:text-5xl font-bold mb-2 text-shadow-md">
                      {catName}
                    </h3>
                    <p className="text-white/90 text-lg lg:text-xl font-medium">
                      {t("feat.explore")} : {catLabel}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          {/* Controls */}
          <button
            onClick={() => setCurrent(p => (p - 1 + FEATURES.length) % FEATURES.length)}
            className="absolute -left-4 lg:-left-20 z-30 p-4 glass-panel rounded-full text-[#2b7dad] hover:scale-110 transition-transform shadow-xl bg-white/80"
            aria-label="Image précédente"
          >
            <ChevronLeft size={36} />
          </button>
          <button
            onClick={() => setCurrent(p => (p + 1) % FEATURES.length)}
            className="absolute -right-4 lg:-right-20 z-30 p-4 glass-panel rounded-full text-[#2b7dad] hover:scale-110 transition-transform shadow-xl bg-white/80"
            aria-label="Image suivante"
          >
            <ChevronRight size={36} />
          </button>
        </div>
      </div>
    </div>
  );
};
