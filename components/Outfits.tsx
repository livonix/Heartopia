import React, { useState } from 'react';
import { OUTFITS, ASSETS } from '../constants';

export const Outfits: React.FC = () => {
  const [current, setCurrent] = useState(2);

  return (
    <div id="i_e" className="page page3 i_e widget swiper-slide">
      <div id="i_v" className="wrap i_v widget h-full w-full">
        <div id="i_1t" className="bg _s i_1t widget absolute inset-0" style={{backgroundImage: `url(${ASSETS.section3.bg})`, backgroundSize: 'cover'}}>
           <div id="i_31" className="curtain _s i_31 widget absolute right-0 top-0 h-full w-24" style={{backgroundImage: `url(${ASSETS.section3.curtain})`, backgroundSize: 'contain'}}></div>
           <div id="i_32" className="curtainLeft curtain _s i_32 widget absolute left-0 top-0 h-full w-24 transform scale-x-[-1]" style={{backgroundImage: `url(${ASSETS.section3.curtain})`, backgroundSize: 'contain'}}></div>
        </div>

        <div id="i_1u" className="content i_1u widget relative z-10 flex flex-col items-center h-full">
          <div id="i_33" className="_s i_33 widget absolute inset-0" style={{backgroundImage: `url(${ASSETS.section3.decoLeft})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
          <div id="i_34" className="_s i_34 widget absolute inset-0" style={{backgroundImage: `url(${ASSETS.section3.decoRight})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat'}}></div>
          
          <div id="i_35" className="title _s i_35 widget mt-16">
            <img src={ASSETS.section3.title} className="h-20" alt="title" />
          </div>

          <div id="i_36" className="displayArea i_36 widget flex-1 flex items-center justify-center relative w-full">
            <img 
              src={OUTFITS[current].pc.main} 
              className="h-[60%] object-contain drop-shadow-2xl animate-scaleIn1" 
              key={current}
              alt="outfit"
            />
            
            {/* Parts Decor original */}
            <div className="absolute inset-0 pointer-events-none">
               <img src={OUTFITS[current].pc.lt} className="absolute left-[15%] top-[20%] w-32" alt="part" />
               <img src={OUTFITS[current].pc.rt} className="absolute right-[15%] top-[20%] w-32" alt="part" />
               <img src={OUTFITS[current].pc.lb} className="absolute left-[15%] bottom-[20%] w-32" alt="part" />
               <img src={OUTFITS[current].pc.rb} className="absolute right-[15%] bottom-[20%] w-32" alt="part" />
            </div>
          </div>

          <div id="i_37" className="switchArea i_37 widget mb-16 flex gap-4 bg-black/5 p-4 rounded-full backdrop-blur-md">
            {OUTFITS.map((item, idx) => (
              <div 
                key={idx} 
                className={`item m-tap i_4m widget w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${current === idx ? 'border-yellow-400 scale-110' : 'border-white/50 opacity-70'}`}
                onClick={() => setCurrent(idx)}
              >
                <div className="absolute inset-0" style={{backgroundImage: `url(${current === idx ? item.pc.active : item.pc.thumb})`, backgroundSize: 'cover'}}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};