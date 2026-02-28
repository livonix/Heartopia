
import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/apiService';
import { 
  Send, 
  MessageCircle, 
  ArrowLeft, 
  X, 
  User, 
  Loader2 
} from 'lucide-react';

interface Message {
  id: number;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: number;
}

interface Conversation {
  contact_id: string;
  username: string;
  avatar: string;
  last_message_time: string;
  unread_count: number;
}

interface MessagingSystemProps {
  user: any;
  onClose: () => void;
  initialContact?: any; // Pour ouvrir directement une conv
}

export const MessagingSystem: React.FC<MessagingSystemProps> = ({ user, onClose, initialContact }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeContact, setActiveContact] = useState<any>(initialContact || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Charger la liste des conversations
  useEffect(() => {
    fetchConversations();
    // Poll pour les nouveaux messages toutes les 10s
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  // Charger les messages quand un contact est actif
  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact.id || activeContact.contact_id);
      const interval = setInterval(() => fetchMessages(activeContact.id || activeContact.contact_id), 5000);
      return () => clearInterval(interval);
    }
  }, [activeContact]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const data = await api.fetch(`/messages/conversations/${user.id}`);
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConv(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    // Ne pas mettre loadingMsg à true à chaque poll pour éviter le clignotement
    if(messages.length === 0) setLoadingMsg(true);
    try {
      const data = await api.fetch(`/messages/${user.id}/${contactId}`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMsg(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;

    const tempContent = newMessage;
    setNewMessage(''); // Optimistic update

    try {
      const contactId = activeContact.id || activeContact.contact_id;
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: contactId,
          content: tempContent
        })
      });
      fetchMessages(contactId); // Refresh immediate
      fetchConversations(); // Update list order
    } catch (e) {
      console.error(e);
      alert("Erreur d'envoi");
      setNewMessage(tempContent); // Restore on error
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col md:flex-row font-['Quicksand'] animate-fade-in">
        {/* Sidebar (List) */}
        <div className={`w-full md:w-80 bg-slate-50 border-r border-slate-200 flex flex-col ${activeContact ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
                <h2 className="font-black text-slate-800 text-lg flex items-center gap-2">
                    <MessageCircle className="text-[#2b7dad]" /> Messagerie
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full md:hidden">
                    <X size={20} />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {loadingConv ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#2b7dad]" /></div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-sm font-bold">Aucune conversation</div>
                ) : (
                    conversations.map(conv => (
                        <div 
                            key={conv.contact_id} 
                            onClick={() => setActiveContact({ id: conv.contact_id, username: conv.username, avatar: conv.avatar })}
                            className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all ${activeContact?.id === conv.contact_id || activeContact?.contact_id === conv.contact_id ? 'bg-[#2b7dad] text-white shadow-md' : 'hover:bg-slate-200 text-slate-700'}`}
                        >
                            <div className="relative">
                                <img src={conv.avatar} className="w-10 h-10 rounded-full bg-white border border-white/20" alt={conv.username} />
                                {conv.unread_count > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{conv.username}</h4>
                                <p className={`text-xs truncate ${activeContact?.id === conv.contact_id ? 'text-white/70' : 'text-slate-400'}`}>
                                    {new Date(conv.last_message_time).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            {/* Desktop Close */}
            <div className="p-4 border-t border-slate-200 hidden md:block">
                <button onClick={onClose} className="w-full py-3 border border-slate-300 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors">
                    Fermer la messagerie
                </button>
            </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white ${!activeContact ? 'hidden md:flex' : 'flex'}`}>
            {activeContact ? (
                <>
                    <div className="p-4 border-b border-slate-100 flex items-center gap-3 shadow-sm bg-white/80 backdrop-blur-md z-10">
                        <button onClick={() => setActiveContact(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
                            <ArrowLeft size={20} />
                        </button>
                        <img src={activeContact.avatar} className="w-10 h-10 rounded-full border border-slate-200" alt="" />
                        <div>
                            <h3 className="font-black text-slate-800 text-sm">{activeContact.username}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En ligne</p>
                        </div>
                        <div className="ml-auto md:hidden">
                            <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
                        {loadingMsg && messages.length === 0 ? (
                            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-[#2b7dad]" /></div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-20 text-slate-400 text-sm">
                                <MessageCircle size={40} className="mx-auto mb-2 opacity-20" />
                                <p>Démarrez la conversation avec {activeContact.username} !</p>
                                <p className="text-xs mt-2 opacity-60">Rappel : Soyez courtois et respectez le règlement.</p>
                            </div>
                        ) : (
                            messages.map(msg => {
                                const isMe = msg.sender_id === user.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm font-medium leading-relaxed ${isMe ? 'bg-[#2b7dad] text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                                            {msg.content}
                                            <div className={`text-[9px] mt-1 text-right ${isMe ? 'text-white/60' : 'text-slate-300'}`}>
                                                {formatDate(msg.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-white">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#2b7dad] focus:ring-2 focus:ring-[#2b7dad]/10 transition-all"
                                placeholder="Écrivez votre message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                disabled={!newMessage.trim()}
                                className="bg-[#2b7dad] text-white p-3 rounded-xl hover:bg-[#20648f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#2b7dad]/20"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </form>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 bg-slate-50/50">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                        <MessageCircle size={40} />
                    </div>
                    <p className="text-lg font-black text-slate-400">Sélectionnez une conversation</p>
                </div>
            )}
        </div>
    </div>
  );
};
