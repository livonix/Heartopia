
const BASE_URL = 'https://website.xdcdn.net/poster/133737826/';

// Use relative path for production/proxy compatibility
export const API_URL = '/api';

export const ASSETS = {
  logo: `https://i.ibb.co/kgjnV9QN/Generated-Image-January-10-2026-11-31-PM.png`,
  mobileLogo: `https://i.ibb.co/kgjnV9QN/Generated-Image-January-10-2026-11-31-PM.png`,
  hero: {
    bg: `${BASE_URL}home/s1/MEj0dry9.jpg`,
    mobileBg: `${BASE_URL}home/s1/MEjPW1rx.jpg`,
    characters: `${BASE_URL}home/s1/MEj0dsi0.png`,
    slogan: `${BASE_URL}home/fr/slgW.png`, 
    sunlight: `${BASE_URL}home/s1/MEj0dry9.jpg`,
  },
  buttons: {
    appStore: "https://website.xdcdn.net/poster/.system/store-btn/appstore/download/fr_FR.svg",
    googlePlay: "https://website.xdcdn.net/poster/.system/store-btn/googleplay/download/fr_FR.svg",
    tapTap: `${BASE_URL}home/fr/N1Vcqtvw.svg`
  },
  section3: {
    bg: `${BASE_URL}home/s3/bg.jpg`,
    curtain: `${BASE_URL}home/s3/curtain.png`,
    decoLeft: `${BASE_URL}home/s3/decoLeft.png`,
    decoRight: `${BASE_URL}home/s3/decoRight.png`,
    title: `${BASE_URL}home/s3/title.png`,
  },
  preReg: {
    cloud1: `${BASE_URL}home/common/LnWrv0Sx.gif`,
    cloud2: `${BASE_URL}home/common/LnWrvjiH.gif`,
    items: [
      `${BASE_URL}home/s2/item1.png`,
      `${BASE_URL}home/s2/item2.png`,
      `${BASE_URL}home/s2/item3.png`,
      `${BASE_URL}home/s2/item4.png`,
    ],
    bubbles: [
      `${BASE_URL}home/s2/bubble1.png`,
      `${BASE_URL}home/s2/bubble2.png`,
      `${BASE_URL}home/s2/bubble3.png`,
      `${BASE_URL}home/s2/bubble4.png`,
    ],
  },
  section4: {
    balloon: `${BASE_URL}home/common/LnWrvuGo.gif`,
    videoPoster: `${BASE_URL}home/s1/MEj0dry9.jpg`,
  }
};

export interface WikiPage {
  id: string | number;
  title: string;
  title_en?: string;
  slug?: string;
  category_id?: number;
  sections?: { 
    id: string | number; 
    title: string; 
    title_en?: string;
    content: string | any[];
    content_en?: string | any[];
  }[];
}

export interface WikiCategory {
  id: string | number;
  name: string;
  name_en?: string;
  label: string;
  label_en?: string;
  pages: WikiPage[];
}

export const WIKI_STRUCTURE: WikiCategory[] = [
  {
    id: "intro",
    name: "Introduction",
    label: "Commencer l'aventure",
    pages: [
      {
        id: "bienvenue",
        title: "Bienvenue sur Heartopia",
        sections: [
          { id: "concept", title: "Le Concept", content: "Heartopia est un simulateur de vie conçu pour la détente. Ici, pas de stress, seulement de la créativité et de l'exploration." },
          { id: "commencer", title: "Vos premiers pas", content: "Dès votre arrivée, vous recevrez les clés de votre première maison. Explorez le quartier pour rencontrer vos voisins !" }
        ]
      },
      {
        id: "regles",
        title: "Règles de Vie",
        sections: [
          { id: "commu", title: "Communauté", content: "Le respect est au cœur de Heartopia. Aidez vos voisins pour débloquer des récompenses sociales." }
        ]
      }
    ]
  },
  {
    id: "gameplay",
    name: "Systèmes de Jeu",
    label: "Maîtriser le monde",
    pages: [
      {
        id: "metiers",
        title: "Métiers & Passions",
        sections: [
          { id: "peche", title: "La Pêche", content: "Équipez votre canne à pêche près des zones de remous. Chaque poisson a une rareté et une saison spécifique." },
          { id: "cuisine", title: "Cuisine", content: "Combinez des ingrédients frais pour créer des plats qui boostent votre énergie ou votre décoration." }
        ]
      }
    ]
  },
  {
    id: "database",
    name: "Encyclopédie",
    label: "Tout répertorier",
    pages: [
      {
        id: "faune",
        title: "Faune locale",
        sections: [
          { 
            id: "insectes", 
            title: "Insectes", 
            content: [
              { name: "Papillon Monarque", image: "https://images.unsplash.com/photo-1545415254-47c3e3906d9d?auto=format&fit=crop&q=80&w=200", rarity: "Commun", desc: "Se trouve près des fleurs." },
              { name: "Scarabée de Jade", image: "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?auto=format&fit=crop&q=80&w=200", rarity: "Rare", desc: "Rarement vu sur les troncs." }
            ] 
          }
        ]
      }
    ]
  }
];

export const FEATURES = [
  `${BASE_URL}home/fr/MLBEsJcR.jpg`,
  `${BASE_URL}home/fr/MLBEsyNW.jpg`,
  `${BASE_URL}home/fr/MLBEse37.jpg`,
  `${BASE_URL}home/fr/MLBEsKOs.jpg`,
  `${BASE_URL}home/fr/MLBEst9b.jpg`
];

export const OUTFITS = [
  { pc: { main: `${BASE_URL}home/s3/1/pc.png`, thumb: `${BASE_URL}home/s3/1/a.png`, active: `${BASE_URL}home/s3/1/aa.png`, lt: `${BASE_URL}home/s3/1/lt.png`, lb: `${BASE_URL}home/s3/1/lb.png`, rt: `${BASE_URL}home/s3/1/rt.png`, rb: `${BASE_URL}home/s3/1/rb.png` } }
];
