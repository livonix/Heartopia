import React from 'react';
import { MessageCircle, Instagram, Twitter, Twitch, ExternalLink, Heart } from 'lucide-react';

const SocialCard = ({ icon: Icon, label, handle, link, color, hoverColor }: any) => (
    <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] transition-all duration-500 hover:-translate-y-2 hover:bg-white/10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
    >
        {/* Decoration gradient background */}
        <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-gradient-to-br ${color}`}
        ></div>

        <div className={`relative z-10 p-5 rounded-3xl ${color} shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500`}>
            <Icon size={32} className="text-white drop-shadow-md" />
        </div>

        <div className="relative z-10 text-center">
            <h3 className="text-white font-black text-xs uppercase tracking-[0.2em] mb-1 opacity-60 group-hover:opacity-100 transition-opacity">{label}</h3>
            <p className="text-white font-bold text-lg tracking-tight">{handle}</p>
        </div>

        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
            <ExternalLink size={16} className="text-white/40" />
        </div>
    </a>
);

// Custom TikTok Icon as Lucide doesn't have it
const TikTokIcon = (props: any) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
);

// Custom Ko-fi icon
const KofiIcon = (props: any) => (
    <Heart {...props} fill="currentColor" />
);

export const SocialSection = () => {
    const socials = [
        {
            icon: MessageCircle,
            label: "Discord",
            handle: "Communauté",
            link: "https://discord.gg/4XUA9GcCub",
            color: "from-[#5865F2] to-[#4752C4]"
        },
        {
            icon: KofiIcon,
            label: "Ko-fi",
            handle: "Nous soutenir",
            link: "https://ko-fi.com/heartopia",
            color: "from-[#FF5E5B] to-[#D44A47]"
        },
        {
            icon: Instagram,
            label: "Instagram",
            handle: "@heartopia.fr",
            link: "https://www.instagram.com/heartopia.fr",
            color: "from-[#E4405F] to-[#C13584]"
        },
        {
            icon: TikTokIcon,
            label: "TikTok",
            handle: "@heartopia.fr",
            link: "https://www.tiktok.com/@heartopia.fr",
            color: "from-[#000000] to-[#25F4EE]"
        },
        {
            icon: Twitter,
            label: "X / Twitter",
            handle: "@heartopiafr",
            link: "https://x.com/heartopiafr",
            color: "from-[#1DA1F2] to-[#0D8BD9]"
        },
        {
            icon: Twitch,
            label: "Twitch",
            handle: "heartopiafr",
            link: "https://twitch.tv/heartopiafr",
            color: "from-[#9146FF] to-[#772CE8]"
        }
    ];

    return (
        <section className="bg-[#1e4e6d] py-24 px-6 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-400 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col items-center text-center mb-16 animate-wiki-in">
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Rejoignez la <span className="text-sky-300">Communauté</span>
                    </h2>
                    <p className="text-white/60 font-medium text-lg max-w-2xl mx-auto">
                        Suivez-nous sur nos différents réseaux pour ne manquer aucune actualité,
                        partager vos créations et participer à nos événements exclusifs.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6 animate-slide-up">
                    {socials.map((social, index) => (
                        <SocialCard key={index} {...social} />
                    ))}
                </div>
            </div>
        </section>
    );
};
