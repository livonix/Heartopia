import React, { useState, useEffect } from 'react';
import { Heart, Image as ImageIcon, Upload, Loader2, ArrowLeft, Plus, Trophy } from 'lucide-react';
import { api } from '../lib/apiService';
import { useLanguage } from '../lib/languageContext';

interface ShowcasePost {
    id: string;
    image: string;
    title: string;
    author: string;
    avatar: string;
    likes: number;
    likedByMe?: boolean;
}

interface ShowcaseProps {
    onBack: () => void;
    user?: any;
    onLoginRequest: () => void;
}

export const Showcase: React.FC<ShowcaseProps> = ({ onBack, user, onLoginRequest }) => {
    const [posts, setPosts] = useState<ShowcasePost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', image: '' });
    const [uploading, setUploading] = useState(false);
    const { t } = useLanguage();

    // Fetch from API
    const fetchPosts = async () => {
        setLoading(true);
        try {
            const data = await api.fetch('/showcase');
            const mapped = (Array.isArray(data) ? data : []).map((p: any) => ({
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

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleLike = async (id: string) => {
        try {
            await api.fetch(`/showcase/${id}/like`, { method: 'POST' });
            setPosts(prev => prev.map(p => {
                if (p.id === id) {
                    const alreadyLiked = p.likedByMe;
                    if (alreadyLiked) return p;
                    return { ...p, likes: p.likes + 1, likedByMe: true };
                }
                return p;
            }));
        } catch (e) { console.error(e); }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewPost({ ...newPost, image: ev.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return onLoginRequest();

        setUploading(true);
        try {
            await api.fetch('/showcase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newPost.title,
                    image_url: newPost.image,
                    author_username: user.username,
                    author_avatar: user.avatar
                })
            });

            setNewPost({ title: '', image: '' });
            setIsUploadOpen(false);
            fetchPosts();
        } catch (e) {
            console.error(e);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-['Quicksand']">
            {/* Navigation */}
            <nav className="sticky top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
                    <button onClick={onBack} className="flex items-center gap-2 text-slate-500 font-bold hover:text-[#2b7dad] transition-colors bg-slate-50 hover:bg-[#2b7dad]/10 px-4 py-2 rounded-xl">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-bold">{t("common.back", "Retour")}</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <ImageIcon className="text-[#2b7dad]" />
                        <span className="font-black text-slate-800">{t("showcase.gallery", "Galerie Créations")}</span>
                    </div>
                    <button
                        onClick={() => user ? setIsUploadOpen(true) : onLoginRequest()}
                        className="bg-[#2b7dad] text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#20648f] transition-all shadow-lg shadow-[#2b7dad]/20 flex items-center gap-2"
                    >
                        <Plus size={16} /> {t("showcase.post_btn", "Poster")}
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-12">

                <div className="text-center mb-16 animate-wiki-in">
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-800 mb-4">{t("showcase.title_prefix", "Vos plus belles")} <span className="text-[#2b7dad]">{t("showcase.title_suffix", "Créations")}</span></h1>
                    <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">
                        {t("showcase.desc", "Partagez vos aménagements, vos tenues et vos moments préférés avec la communauté.")}
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20"><Loader2 size={40} className="animate-spin text-[#2b7dad]" /></div>
                ) : (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {posts.map((post) => (
                            <div key={post.id} className="break-inside-avoid bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group animate-slide-up">
                                <div className="relative">
                                    <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                        <div className="text-white">
                                            <h3 className="font-bold text-lg leading-tight">{post.title}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <img src={post.avatar} className="w-5 h-5 rounded-full border border-white" alt="" />
                                                <span className="text-xs font-medium">{post.author}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Trophy size={14} className="text-amber-500" />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleLike(post.id)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${post.likedByMe ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                                    >
                                        <Heart size={16} className={post.likedByMe ? 'fill-red-500' : ''} />
                                        {post.likes}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Upload Modal */}
            {isUploadOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-wiki-in">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl relative">
                        <h3 className="text-2xl font-black text-slate-800 mb-6">{t("showcase.new_post", "Nouvelle Publication")}</h3>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("showcase.form_title", "Titre")}</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 font-bold focus:border-[#2b7dad] outline-none"
                                    placeholder={t("showcase.form_title_placeholder", "Donnez un titre à votre création...")}
                                    value={newPost.title}
                                    onChange={e => setNewPost({ ...newPost, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">{t("showcase.form_image", "Image")}</label>
                                <div className="relative w-full aspect-video bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2b7dad] hover:bg-[#2b7dad]/5 transition-all overflow-hidden group">
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleImageUpload} />
                                    {newPost.image ? (
                                        <img src={newPost.image} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <Upload size={32} className="text-slate-400 mb-2 group-hover:text-[#2b7dad] transition-colors" />
                                            <span className="text-xs font-bold text-slate-400 group-hover:text-[#2b7dad]">{t("showcase.form_image_placeholder", "Cliquez pour ajouter une image")}</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsUploadOpen(false)} className="flex-1 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">{t("showcase.cancel", "Annuler")}</button>
                                <button type="submit" disabled={uploading || !newPost.image} className="flex-[2] bg-[#2b7dad] text-white rounded-xl font-black uppercase tracking-widest hover:bg-[#20648f] transition-all shadow-lg shadow-[#2b7dad]/20 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : t("showcase.publish", "Publier")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
