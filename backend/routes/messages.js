
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const axios = require('axios');

// Lister les conversations pour un utilisateur
router.get('/conversations/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        // Récupère les derniers messages pour chaque paire d'utilisateurs
        // Ceci est une requête complexe pour obtenir la liste des "contacts"
        const query = `
            SELECT 
                CASE 
                    WHEN sender_id = ? THEN receiver_id 
                    ELSE sender_id 
                END as contact_id,
                MAX(created_at) as last_message_time,
                SUM(CASE WHEN receiver_id = ? AND is_read = 0 THEN 1 ELSE 0 END) as unread_count
            FROM messages 
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY contact_id
            ORDER BY last_message_time DESC
        `;
        const [rows] = await pool.query(query, [userId, userId, userId, userId]);
        
        // Pour chaque contact, on va essayer de récupérer son avatar/pseudo via une requête API Discord ou via les infos stockées dans trading_ads s'il a posté une annonce
        // Pour simplifier ici, on va chercher dans trading_ads ou team_members, sinon placeholder
        const conversations = await Promise.all(rows.map(async (row) => {
            // Chercher info user dans trading_ads (le plus probable)
            const [userInfos] = await pool.query('SELECT username, avatar FROM trading_ads WHERE discord_id = ? LIMIT 1', [row.contact_id]);
            
            return {
                contact_id: row.contact_id,
                username: userInfos[0]?.username || 'Utilisateur',
                avatar: userInfos[0]?.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png',
                last_message_time: row.last_message_time,
                unread_count: row.unread_count
            };
        }));

        res.json(conversations);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur récupération conversations" });
    }
});

// Récupérer les messages avec un utilisateur spécifique
router.get('/:userId/:contactId', async (req, res) => {
    const { userId, contactId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC',
            [userId, contactId, contactId, userId]
        );
        
        // Marquer comme lus
        await pool.query('UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND sender_id = ?', [userId, contactId]);

        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur messages" });
    }
});

// Envoyer un message
router.post('/', async (req, res) => {
    const { sender_id, receiver_id, content, ad_id } = req.body;
    if (!sender_id || !receiver_id || !content) return res.status(400).json({ error: "Données manquantes" });

    try {
        const [result] = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content, ad_id) VALUES (?, ?, ?, ?)',
            [sender_id, receiver_id, content, ad_id || null]
        );
        res.json({ id: result.insertId, created_at: new Date() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur envoi message" });
    }
});

// Vérifier messages non lus (pour badge navbar)
router.get('/unread/:userId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND is_read = 0', [req.params.userId]);
        res.json({ count: rows[0].count });
    } catch (e) {
        res.json({ count: 0 });
    }
});

module.exports = router;
