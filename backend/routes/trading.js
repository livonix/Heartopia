
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// Récupérer les annonces actives
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM trading_ads WHERE status = "open" ORDER BY created_at DESC LIMIT 100');
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur récupération annonces" });
    }
});

// Créer une annonce
router.post('/', async (req, res) => {
    const { discord_id, username, avatar, type, item_wanted, item_offered } = req.body;
    
    if (!discord_id || !username || !type) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    // Validation type strict
    if (!['trade', 'gift'].includes(type)) {
        return res.status(400).json({ error: "Type d'annonce invalide. Seuls les échanges et dons sont autorisés." });
    }

    try {
        // Limite anti-spam: Max 3 annonces ouvertes par personne
        const [count] = await pool.query('SELECT COUNT(*) as count FROM trading_ads WHERE discord_id = ? AND status = "open"', [discord_id]);
        if (count[0].count >= 3) {
            return res.status(429).json({ error: "Limite de 3 annonces simultanées atteinte." });
        }

        const [result] = await pool.query(
            'INSERT INTO trading_ads (discord_id, username, avatar, type, item_wanted, item_offered) VALUES (?, ?, ?, ?, ?, ?)',
            [discord_id, username, avatar, type, item_wanted || '', item_offered || '']
        );
        
        res.json({ 
            id: result.insertId, 
            discord_id, username, avatar, type, item_wanted, item_offered, 
            status: 'open', 
            created_at: new Date() 
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur création annonce" });
    }
});

// Supprimer une annonce
router.delete('/:id', async (req, res) => {
    const { discord_id, isAdmin } = req.body; 
    const id = req.params.id;

    if (!discord_id) return res.status(403).json({ error: "Non autorisé" });

    try {
        const [ad] = await pool.query('SELECT discord_id FROM trading_ads WHERE id = ?', [id]);
        
        if (ad.length === 0) return res.status(404).json({ error: "Annonce introuvable" });
        
        // Autoriser si c'est le propriétaire OU si c'est un admin
        if (ad[0].discord_id !== discord_id && !isAdmin) {
            return res.status(403).json({ error: "Vous ne pouvez supprimer que vos annonces" });
        }

        await pool.query('DELETE FROM trading_ads WHERE id = ?', [id]);
        res.status(204).end();
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur suppression" });
    }
});

module.exports = router;
