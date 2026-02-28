
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../lib/apiService';
import { useSocket } from '../../lib/socketContext';
import { MessageSquare, User, Send, Loader2, RefreshCw, CheckCircle, Clock, Plus, X, ExternalLink, Image as ImageIcon, Trash2, Hand, ShieldAlert, Lock } from 'lucide-react';
import { API_URL } from '../../constants';

// Composant visuel pour les points de frappe
const TypingDots = () => (
  <div className="flex gap-1 px-2 py-1">
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
  </div>
);

// Fonction extraction URL
const extractFirstUrl = (text: string) => {
    const match = text.match(/(https?:\/\/[^\s]+)/g);
    return match ? match[0] : null;
};

// Composant Link Preview (Admin Version - Dark Mode compatible)
const LinkPreview = ({ url }: { url: string }) => {
    const [meta, setMeta] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchMeta = async () => {
            try {
                const res = await fetch(`${API_URL}/support/preview?url=${encodeURIComponent(url)}`);
                const data = await res.json();
                if (isMounted && data && !data.error) setMeta(data);
            } catch (e) { /* ignore */ } finally { if (isMounted) setLoading(false); }
        };
        fetchMeta();
        return () => { isMounted = false; };
    }, [url]);

    if (loading) return <div className="mt-2 h-16 bg-white/10 rounded-xl animate-pulse w-full"></div>;
    if (!meta || !meta.title) return null;

    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="mt-2 block bg-[#020617] border border-white/10 rounded-xl overflow-hidden hover:border-[#55a4dd]/50 transition-all group">
            <div className="flex">
                {meta.image && (
                    <div className="w-24 h-auto bg-black flex-shrink-0">
                        <img src={meta.image} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
                <div className="p-3 min-w-0">
                    <h4 className="font-bold text-white text-xs line-clamp-1 mb-1">{meta.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">{meta.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[9px] text-[#55a4dd] font-bold uppercase">
                        <ExternalLink size={10} /> {new URL(url).hostname}
                    </div>
                </div>
            </div>
        </a>
    );
};

const FormattedMessage = ({ content }: { content: string }) => {
    const parts = content.split(/(https?:\/\/[^\s]+)/g);
    return (
        <span className="whitespace-pre-wrap break-words">
            {parts.map((part, i) => {
                if (part.match(/https?:\/\/[^\s]+/)) {
                    return (
                        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-white underline underline-offset-2">
                            {part}
                        </a>
                    );
                }
                return part;
            })}
        </span>
    );
};

export const SupportTab: React.FC = () => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeUser, setActiveUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState('');
  const [media, setMedia] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userTyping, setUserTyping] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { socket } = useSocket();

  useEffect(() => {
      const userStr = localStorage.getItem('heartopia_user');
      if (userStr) {
          const u = JSON.parse(userStr);
          setCurrentAdmin(u);
          if (socket) socket.emit('register_admin', u.internal_id);
      }
  }, [socket]);

  const fetchConversations = async () => {
      setLoading(true);
      try {
          const data = await api.fetch('/support/conversations');
          setConversations(Array.isArray(data) ? data : []);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
      fetchConversations();
      if (socket) {
          socket.on('admin_new_support_msg', ({ user_id }) => {
              fetchConversations(); 
          });
          socket.on('support_assigned', () => {
              fetchConversations();
              // Update active user state if it's the one being assigned
              if (activeUser) {
                  // Re-fetch to get updated assigned_to
                  api.fetch('/support/conversations').then(data => {
                      const updated = data.find((c: any) => c.user_id === activeUser.user_id);
                      if (updated) setActiveUser(updated);
                  });
              }
          });
          socket.on('admin_support_closed', ({ user_id }) => {
              setConversations(prev => prev.filter(c => c.user_id !== user_id));
              if (activeUser?.user_id === user_id) {
                  setActiveUser(null);
                  setMessages([]);
              }
          });
          return () => { 
              socket.off('admin_new_support_msg');
              socket.off('support_assigned');
              socket.off('admin_support_closed'); 
          };
      }
  }, [socket, activeUser]);

  useEffect(() => {
      if (activeUser) {
          // Fetch messages (now returns object with messages + assigned_admin)
          // But we already have assignment info from conversations list or updated via socket
          fetchMessages(activeUser.user_id);
          markAsRead(activeUser.user_id);
          setUserTyping(false);

          if (socket) {
              const messageChannel = `support_message_${activeUser.user_id}`;
              const typingChannel = `support_typing_${activeUser.user_id}`;

              const handleNewMessage = (msg: any) => {
                  setMessages(prev => [...prev, msg]);
                  setUserTyping(false);
                  setTimeout(scrollToBottom, 100);
                  if (msg.sender_role === 'user') markAsRead(activeUser.user_id);
              };

              const handleTyping = ({ isTyping, role }: any) => {
                  if (role === 'user') {
                      setUserTyping(isTyping);
                      if(isTyping) setTimeout(scrollToBottom, 100);
                  }
              };

              socket.on(messageChannel, handleNewMessage);
              socket.on(typingChannel, handleTyping);

              return () => {
                  socket.off(messageChannel, handleNewMessage);
                  socket.off(typingChannel, handleTyping);
              };
          }
      }
  }, [activeUser, socket]);

  const fetchMessages = async (userId: number) => {
      try {
          const data = await api.fetch(`/support/history/${userId}`);
          // data structure changed: { messages: [], assigned_admin: ... }
          setMessages(Array.isArray(data.messages) ? data.messages : []);
          setTimeout(scrollToBottom, 100);
      } catch (e) { console.error(e); }
  };

  const markAsRead = async (userId: number) => {
      try {
          await api.fetch(`/support/read/${userId}`, { method: 'PUT' });
          setConversations(prev => prev.map(c => 
              c.user_id === userId ? { ...c, unread_count: 0 } : c
          ));
      } catch(e) { console.error(e); }
  };

  const handleTakeCharge = async () => {
      if (!activeUser || !currentAdmin) return;
      try {
          await api.fetch('/support/assign', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: activeUser.user_id, admin_id: currentAdmin.internal_id })
          });
          // Optimistic update
          setActiveUser({ ...activeUser, support_assigned_to: currentAdmin.internal_id, assigned_to_name: currentAdmin.username });
      } catch(e) {
          alert("Erreur lors de l'assignation");
      }
  };

  const handleCloseTicket = async () => {
      if (!activeUser || !confirm("Voulez-vous vraiment clôturer ce ticket ? Tout l'historique sera supprimé.")) return;
      try {
          await api.fetch(`/support/conversation/${activeUser.user_id}`, { method: 'DELETE' });
          setActiveUser(null);
          setMessages([]);
      } catch(e) {
          alert("Erreur lors de la clôture du ticket");
      }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setReply(e.target.value);
      if (activeUser && socket) {
          socket.emit('typing_start', { userId: activeUser.user_id, role: 'admin' });
          
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
              socket.emit('typing_end', { userId: activeUser.user_id, role: 'admin' });
          }, 2000);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
              setMedia(ev.target?.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSend = async (e: React.FormEvent) => {
      e.preventDefault();
      if ((!reply.trim() && !media) || !activeUser) return;

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket?.emit('typing_end', { userId: activeUser.user_id, role: 'admin' });

      const payload = {
          user_id: activeUser.user_id,
          sender_role: 'admin',
          content: reply,
          media: media
      };

      setReply('');
      setMedia(null);

      try {
          await api.fetch('/support/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
          });
      } catch (e) {
          alert("Erreur envoi");
      }
  };

  const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Logic for locking input
  const isAssignedToMe = activeUser && currentAdmin && activeUser.support_assigned_to === currentAdmin.internal_id;
  const isUnassigned = activeUser && !activeUser.support_assigned_to;
  const isLocked = activeUser && activeUser.support_assigned_to && !isAssignedToMe;

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col md:flex-row gap-6 animate-slide-up">
      
      {/* Sidebar List */}
      <div className="w-full md:w-80 bg-[#0f172a] border border-white/5 rounded-3xl flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#020617]">
              <h3 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={16} className="text-[#55a4dd]"/> Conversations
              </h3>
              <button onClick={fetchConversations} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors">
                  <RefreshCw size={14} />
              </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {loading ? (
                  <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#55a4dd]" /></div>
              ) : conversations.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs font-bold">Aucune demande de support</div>
              ) : (
                  conversations.map(conv => (
                      <button
                          key={conv.user_id}
                          onClick={() => setActiveUser(conv)}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left group ${activeUser?.user_id === conv.user_id ? 'bg-[#55a4dd] text-white shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}
                      >
                          <div className="relative">
                              <img src={conv.avatar} className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-white/10" alt="" />
                              {conv.unread_count > 0 && (
                                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-[#0f172a]">
                                      {conv.unread_count}
                                  </div>
                              )}
                              {conv.support_assigned_to && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f172a]" title="Pris en charge"></div>
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-center mb-0.5">
                                  <h4 className={`font-bold text-sm truncate ${activeUser?.user_id === conv.user_id ? 'text-white' : 'text-slate-200'}`}>{conv.username}</h4>
                                  <span className="text-[9px] opacity-60 font-mono">{new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              </div>
                              <p className={`text-xs truncate ${activeUser?.user_id === conv.user_id ? 'text-white/80' : 'text-slate-500'}`}>
                                  {conv.last_message}
                              </p>
                          </div>
                      </button>
                  ))
              )}
          </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-[#0f172a] border border-white/5 rounded-3xl flex flex-col overflow-hidden relative">
          {activeUser ? (
              <>
                  {/* Header */}
                  <div className="p-4 border-b border-white/5 bg-[#020617] flex items-center justify-between shadow-sm z-10">
                      <div className="flex items-center gap-4">
                        <img src={activeUser.avatar} className="w-12 h-12 rounded-xl bg-slate-800 object-cover border border-white/10" alt="" />
                        <div>
                            <h2 className="text-white font-black text-lg">{activeUser.username}</h2>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span>Discord ID: {activeUser.discord_id}</span>
                                {activeUser.assigned_to_name && (
                                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                        Géré par {activeUser.assigned_to_name}
                                    </span>
                                )}
                            </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                          {isUnassigned && (
                              <button 
                                onClick={handleTakeCharge}
                                className="bg-[#55a4dd] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#4493cc] transition-all flex items-center gap-2 shadow-lg shadow-[#55a4dd]/20"
                              >
                                <Hand size={14} /> Prendre en charge
                              </button>
                          )}
                          <button 
                            onClick={handleCloseTicket}
                            className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 border border-red-500/20"
                          >
                            <Trash2 size={14} /> Clôturer
                          </button>
                      </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#0f172a]">
                      {messages.map((msg, i) => {
                          const isAdmin = msg.sender_role === 'admin';
                          const link = msg.content ? extractFirstUrl(msg.content) : null;

                          return (
                              <div key={i} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                  <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${isAdmin ? 'bg-[#55a4dd] text-white rounded-br-none' : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'}`}>
                                      {msg.media_url && (
                                          <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                                              <img src={msg.media_url} alt="attachement" className="w-full h-auto max-h-60 object-cover" />
                                          </div>
                                      )}
                                      
                                      {msg.content && <FormattedMessage content={msg.content} />}
                                      
                                      {/* Link Preview (Always show for context) */}
                                      {link && <LinkPreview url={link} />}

                                      <div className={`text-[10px] mt-2 flex items-center justify-end gap-1 ${isAdmin ? 'text-white/60' : 'text-slate-500'}`}>
                                          {formatDate(msg.created_at)}
                                          {isAdmin && msg.is_read ? <CheckCircle size={10} /> : null}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                      
                      {userTyping && (
                          <div className="flex justify-start items-center animate-pulse">
                              <div className="bg-white/10 border border-white/5 rounded-2xl rounded-bl-none p-2 shadow-sm">
                                  <TypingDots />
                              </div>
                          </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                  </div>

                  {/* Input / Locked State */}
                  <div className="p-4 bg-[#020617] border-t border-white/5">
                      {isLocked ? (
                          <div className="flex items-center justify-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-bold text-sm">
                              <Lock size={16} />
                              Ce ticket est géré par {activeUser.assigned_to_name}. Vous ne pouvez pas intervenir.
                          </div>
                      ) : isUnassigned ? (
                          <div className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 border border-white/10 rounded-xl text-slate-400 text-sm">
                              <p className="font-bold">Vous devez prendre en charge ce ticket pour répondre.</p>
                              <button onClick={handleTakeCharge} className="text-[#55a4dd] font-black uppercase text-xs hover:underline">Prendre en charge</button>
                          </div>
                      ) : (
                          <>
                            {media && (
                                <div className="mb-2 relative inline-block">
                                    <img src={media} alt="preview" className="h-16 w-auto rounded-lg border border-white/10" />
                                    <button 
                                        onClick={() => setMedia(null)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            )}
                            
                            <form onSubmit={handleSend} className="flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />

                                <input 
                                    type="text" 
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#55a4dd] transition-all placeholder:text-slate-600"
                                    placeholder="Écrivez votre réponse..."
                                    value={reply}
                                    onChange={handleInputChange}
                                />
                                <button 
                                    type="submit" 
                                    disabled={(!reply.trim() && !media)}
                                    className="bg-[#55a4dd] text-white p-3 rounded-xl hover:bg-[#4493cc] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#55a4dd]/20"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                          </>
                      )}
                  </div>
              </>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                      <User size={40} className="opacity-50" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">Sélectionnez une conversation</p>
              </div>
          )}
      </div>
    </div>
  );
};
