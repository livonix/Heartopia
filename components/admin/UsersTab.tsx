
import React, { useState, useEffect } from 'react';
import { Loader2, Search, UserCheck, Shield, ShieldAlert, User, Save, Check } from 'lucide-react';
import { api } from '../../lib/apiService';

const ROLES = ['guest', 'support', 'moderator', 'admin'];

const RoleBadge = ({ role }: { role: string }) => {
    switch (role) {
        case 'admin': return <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded text-xs font-medium flex items-center gap-1 w-fit"><ShieldAlert size={10}/> Admin</span>;
        case 'moderator': return <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-xs font-medium flex items-center gap-1 w-fit"><Shield size={10}/> Modérateur</span>;
        case 'support': return <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded text-xs font-medium flex items-center gap-1 w-fit"><UserCheck size={10}/> Support</span>;
        default: return <span className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded text-xs font-medium flex items-center gap-1 w-fit"><User size={10}/> Visiteur</span>;
    }
};

export const UsersTab: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [savingId, setSavingId] = useState<number | null>(null);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await api.fetch('/admin/users');
            setUsers(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        setSavingId(userId);
        try {
            await api.fetch(`/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole })
            });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (e) {
            alert("Erreur lors de la mise à jour du rôle");
        } finally {
            setSavingId(null);
        }
    };

    const filteredUsers = users.filter(u => 
        u.username.toLowerCase().includes(search.toLowerCase()) || 
        u.discord_id.includes(search)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900">Gestion Utilisateurs</h2>
                    <p className="text-gray-600 text-sm">Gérez les rôles et accès au dashboard.</p>
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Rechercher un utilisateur..." 
                        className="bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none w-64"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 text-xs font-medium text-gray-700 uppercase">
                                <tr>
                                    <th className="px-6 py-3 text-left">Utilisateur</th>
                                    <th className="px-6 py-3 text-left">Discord ID</th>
                                    <th className="px-6 py-3 text-left">Dernière Connexion</th>
                                    <th className="px-6 py-3 text-left">Rôle</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img src={user.avatar} className="w-10 h-10 rounded-lg bg-gray-200 object-cover" alt="" />
                                                <span className="font-medium text-gray-900">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-sm text-gray-600">{user.discord_id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.last_login).toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="relative group">
                                                    <select 
                                                        className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer hover:bg-gray-50 transition-colors"
                                                        value={user.role}
                                                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        disabled={savingId === user.id}
                                                    >
                                                        {ROLES.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                                    </select>
                                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                        {savingId === user.id ? <Loader2 size={12} className="animate-spin text-blue-600"/> : <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-400"></div>}
                                                    </div>
                                                </div>
                                                <RoleBadge role={user.role} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredUsers.length === 0 && (
                        <div className="p-10 text-center text-gray-500 text-sm">Aucun utilisateur trouvé.</div>
                    )}
                </div>
            )}
        </div>
    );
};
