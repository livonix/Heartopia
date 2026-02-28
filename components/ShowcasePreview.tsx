
import React, { useState, useEffect } from 'react';
import { Heart, ArrowRight, Loader2, ImageIcon } from 'lucide-react';
import { api } from '../lib/apiService';
import { useLanguage } from '../lib/languageContext';

interface ShowcasePreviewProps {
    onNavigateToShowcase: () => void;
}

export const ShowcasePreview: React.FC<ShowcasePreviewProps> = ({ onNavigateToShowcase }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        const loadPosts = async () => {
            setLoading(true);
            try {
                const data = await api.fetch('/showcase');
                const mapped = (Array.isArray(data) ? data : []).slice(0, 5).map((p: any) => ({
                    id: p.id.toString(),
                    image: p.image_url,
                    title: p.title,
                    author: p.author_username,
                    avatar: p.author_avatar,
                    likes: p.likes
                }));
                setPosts(mapped);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        loadPosts();
    }, []);

    return (
        <section className="py-24 px-6 bg-[#fafbfc] relative overflow-hidden font-['Quicksand'] border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl lg:text-5xl font-black text-[#5e4d3b] mb-4 tracking-tight">
                            {t("showcase.title_prefix")} <span className="text-[#2b7dad]">{t("showcase.title_suffix")}</span>
                        </h2>
                        <p className="text-slate-500 font-medium text-lg">
                            {t("showcase.desc")}
                        </p>
                    </div>
                    <button
                        onClick={onNavigateToShowcase}
                        className="group flex items-center gap-2 text-[#2b7dad] font-bold text-sm uppercase tracking-widest hover:bg-[#2b7dad]/10 px-6 py-3 rounded-2xl transition-all"
                    >
                        {t("nav.showcase")} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-[#2b7dad]" /></div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                        {posts.map((post, idx) => (
                            <div
                                key={post.id}
                                className={`group relative aspect-[3/4] bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 animate-slide-up`}
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">{post.title}</h3>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={post.avatar} className="w-6 h-6 rounded-full border border-white/20" alt="" />
                                            <span className="text-[10px] font-bold truncate max-w-[80px]">{post.author}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-[#2b7dad]">
                                            <Heart size={14} className="fill-[#2b7dad]" />
                                            <span className="text-xs font-black">{post.likes}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Si moins de 5 postes, on peut mettre une carte d'incitation */}
                        {posts.length < 5 && (
                            <button
                                onClick={onNavigateToShowcase}
                                className="aspect-[3/4] bg-white/50 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center p-6 text-center hover:border-[#2b7dad] hover:bg-white transition-all group"
                            >
                                <div className="w-12 h-12 bg-[#2b7dad]/10 rounded-2xl flex items-center justify-center text-[#2b7dad] mb-4 group-hover:scale-110 transition-transform">
                                    <ImageIcon size={24} />
                                </div>
                                <p className="text-xs font-bold text-slate-500">{t("showcase.post_btn")}</p>
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
