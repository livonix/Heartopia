
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// --- COMMENTAIRES ---

// Récupérer les commentaires d'une section
router.get('/comments/:sectionId', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT * FROM comments WHERE section_id = ? ORDER BY created_at DESC',
            [req.params.sectionId]
        );
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur récupération commentaires" });
    }
});

// Poster un commentaire
router.post('/comments', async (req, res) => {
    const { section_id, username, avatar, content } = req.body;
    if (!content || !username) return res.status(400).json({ error: "Contenu manquant" });

    try {
        const [result] = await pool.query(
            'INSERT INTO comments (section_id, username, avatar, content) VALUES (?, ?, ?, ?)',
            [section_id, username, avatar, content]
        );
        res.json({ id: result.insertId, section_id, username, avatar, content, created_at: new Date() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Erreur envoi commentaire" });
    }
});

module.exports = router;
