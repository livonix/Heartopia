
import React from 'react';
import { Download, Book, Star } from 'lucide-react';
import { ASSETS } from '../constants';
import { useLanguage } from '../lib/languageContext';
import CountUp from './CountUp';
import ShinyText from './ShinyText';
import { SmartImage } from './SmartImage';

interface HeroProps {
  onExplore: () => void;
  onDownload: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExplore, onDownload }) => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Background with overlay */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <SmartImage
          src={ASSETS.hero.bg}
          className="absolute inset-0 w-full h-full object-cover animate-zoom-breath"
          alt="Heartopia World - Jeu de Simulation"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#2b7dad]/40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-7xl px-6 flex flex-col items-center text-center mt-20">

        {/* Main Title / Logo Area */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl mb-8 hover:bg-white/20 transition-colors cursor-default animate-fade-in-up opacity-0">
            <Star size={14} className="text-[#ffce00] fill-[#ffce00] animate-[spin_4s_infinite_linear]" />
            <h1>{t('hero.slogan')} Heartopia</h1>
          </div>

          <div className="text-6xl md:text-8xl lg:text-9xl font-black leading-[0.9] tracking-tighter drop-shadow-lg mb-6 animate-fade-in-up opacity-0 delay-100">
            <ShinyText
              text="Heartopia"
              disabled={false}
              speed={3}
              color="#ffffff"
              shineColor="#55a4dd"
            />
          </div>

          <p className="text-xl md:text-3xl lg:text-4xl font-bold text-white/90 tracking-normal font-['Quicksand'] max-w-4xl mx-auto leading-tight animate-fade-in-up opacity-0 delay-200">
            {t('hero.title')}
          </p>
          <p className="text-sm md:text-lg text-white/70 mt-6 max-w-2xl mx-auto font-medium leading-relaxed animate-fade-in-up opacity-0 delay-300">
            {t('hero.subtitle')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-lg relative z-10 animate-fade-in-up opacity-0 delay-500">
          <button
            onClick={onDownload}
            className="w-full sm:flex-1 group flex items-center justify-center gap-3 bg-[#2b7dad] hover:bg-[#20648f] text-white px-8 py-5 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-[#2b7dad]/30 transition-all transform hover:-translate-y-1 active:scale-95"
            aria-label="Télécharger Heartopia"
          >
            <Download size={22} className="group-hover:animate-bounce" />
            {t('hero.download')}
          </button>

          <button
            onClick={onExplore}
            className="w-full sm:flex-1 group flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white px-8 py-5 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
            aria-label="Wiki et Guides"
          >
            <Book size={20} />
            {t('hero.explore')}
          </button>
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 animate-fade-in-up delay-700">
          {/* Store Buttons */}
          <div className="flex items-center gap-4">
            <img src={ASSETS.buttons.appStore} className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer hover:scale-105" alt="Télécharger sur App Store" onClick={onDownload} />
            <img src={ASSETS.buttons.googlePlay} className="h-8 md:h-10 opacity-70 hover:opacity-100 transition-opacity cursor-pointer hover:scale-105" alt="Télécharger sur Google Play" onClick={onDownload} />
            <div className="h-8 w-px bg-white/30"></div>
            <div className="flex items-center gap-2 text-white/80 font-bold text-xs uppercase tracking-widest">
              <span className="bg-white/20 p-1 rounded"><Download size={12} /></span>
              {t('hero.pc')}
            </div>
          </div>

          {/* 10 Million Downloads Counter */}
          <div className="bg-white/10 backdrop-blur-md border border-white/10 px-8 py-3 rounded-2xl flex items-center gap-3 shadow-2xl hover:bg-white/15 transition-all cursor-default group">
            <Download size={24} className="text-[#ffce00] group-hover:animate-bounce" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white font-mono tracking-tighter">
                <CountUp
                  from={0}
                  to={10000000}
                  duration={3.5}
                  separator=" "
                  className="text-white"
                />
              </span>
              <span className="text-xs font-bold text-white/90 uppercase tracking-widest">
                {t('hero.downloads')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
