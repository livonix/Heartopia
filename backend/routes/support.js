
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const axios = require('axios');

// Route pour générer les previews de liens (Open Graph)
router.get('/preview', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL manquante" });

    try {
        // Timeout court pour ne pas bloquer le serveur
        const response = await axios.get(url, { 
            timeout: 3000,
            headers: { 'User-Agent': 'HeartopiaBot/1.0' } 
        });
        const html = response.data;

        // Extraction basique via Regex pour éviter d'ajouter Cheerio comme dépendance lourde
        const getMetaTag = (prop) => {
            const regex = new RegExp(`<meta (?:property|name)="${prop}" content="(.*?)"`, 'i');
            const match = html.match(regex);
            return match ? match[1] : null;
        };

        const getTitle = () => {
            const ogTitle = getMetaTag('og:title');
            if (ogTitle) return ogTitle;
            const titleMatch = html.match(/<title>(.*?)<\/title>/i);
            return titleMatch ? titleMatch[1] : url;
        };

        const title = getTitle();
        const description = getMetaTag('og:description') || getMetaTag('description') || '';
        const image = getMetaTag('og:image') || '';

        res.json({
            title: title ? title.substring(0, 100) : '',
            description: description ? description.substring(0, 200) : '',
            image: image,
            url: url
        });
    } catch (e) {
        res.json({ title: '', description: '', image: '', url, error: true });
    }
});

// Envoyer un message (User ou Admin)
router.post('/send', async (req, res) => {
    const { user_id, sender_role, content, media } = req.body;
    
    if (!user_id || (!content && !media) || !sender_role) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO support_messages (user_id, sender_role, content, media_url) VALUES (?, ?, ?, ?)',
            [user_id, sender_role, content || '', media || null]
        );

        const newMessage = {
            id: result.insertId,
            user_id,
            sender_role,
            content: content || '',
            media_url: media || null,
            is_read: false,
            created_at: new Date()
        };

        // Emission Socket.IO vers la room spécifique de l'utilisateur
        req.io.emit(`support_message_${user_id}`, newMessage);
        
        // Notification globale pour les admins
        if (sender_role === 'user') {
            req.io.emit('admin_new_support_msg', { user_id });
        }

        res.json(newMessage);
    } catch (e) {
        console.error("Support Send Error:", e);
        res.status(500).json({ error: "Erreur envoi message" });
    }
});

// Récupérer l'historique d'une conversation (User ID) + Info Assignation
router.get('/history/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Récupérer les messages
        const [messages] = await pool.query(
            'SELECT * FROM support_messages WHERE user_id = ? ORDER BY created_at ASC',
            [userId]
        );

        // Récupérer les infos de l'admin assigné
        const [assignInfo] = await pool.query(
            `SELECT u.id, u.username, u.avatar, u.discord_id 
             FROM users u 
             JOIN users client ON client.support_assigned_to = u.id 
             WHERE client.id = ?`,
            [userId]
        );

        res.json({
            messages,
            assigned_admin: assignInfo[0] || null
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ADMIN: Assigner un ticket
router.post('/assign', async (req, res) => {
    const { user_id, admin_id } = req.body;
    try {
        await pool.query('UPDATE users SET support_assigned_to = ? WHERE id = ?', [admin_id, user_id]);
        
        // Notifier les admins (pour verrouiller l'UI)
        req.io.emit('support_assigned', { user_id, admin_id });
        // Notifier le client (pour afficher l'admin)
        req.io.emit(`support_assigned_client_${user_id}`, { admin_id });
        
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ADMIN: Marquer comme lu
router.put('/read/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await pool.query(
            "UPDATE support_messages SET is_read = 1 WHERE user_id = ? AND sender_role = 'user'",
            [userId]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ADMIN & USER: Supprimer une conversation
router.delete('/conversation/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await pool.query('DELETE FROM support_messages WHERE user_id = ?', [userId]);
        // Reset l'assignation
        await pool.query('UPDATE users SET support_assigned_to = NULL WHERE id = ?', [userId]);
        
        req.io.emit('admin_support_closed', { user_id: parseInt(userId) });
        req.io.emit(`support_closed_${userId}`, { closed: true });

        res.json({ success: true });
    } catch (e) {
        console.error("Delete conversation error:", e);
        res.status(500).json({ error: e.message });
    }
});

// ADMIN: Lister toutes les conversations
router.get('/conversations', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id as user_id, 
                u.username, 
                u.avatar, 
                u.discord_id,
                u.support_assigned_to,
                admin.username as assigned_to_name,
                MAX(m.created_at) as last_message_at,
                (SELECT content FROM support_messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_message,
                (SELECT media_url FROM support_messages WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as last_media,
                SUM(CASE WHEN m.sender_role = 'user' AND m.is_read = 0 THEN 1 ELSE 0 END) as unread_count
            FROM users u
            JOIN support_messages m ON u.id = m.user_id
            LEFT JOIN users admin ON u.support_assigned_to = admin.id
            GROUP BY u.id
            ORDER BY last_message_at DESC
        `;
        const [rows] = await pool.query(query);
        const formattedRows = rows.map(r => ({
            ...r,
            last_message: r.last_message || (r.last_media ? '📷 [Image]' : '')
        }));
        res.json(formattedRows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
