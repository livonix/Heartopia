
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { fetchAndApplyTranslations } = require('../services/translator');

// Route: /api/team
router.get('/', async (req, res) => {
    const lang = req.query.lang || 'fr';
    try {
        const [members] = await pool.query('SELECT * FROM team_members ORDER BY id ASC');
        // Appliquer les traductions si nécessaire
        const translatedMembers = await fetchAndApplyTranslations('team_members', members, lang);
        res.json(translatedMembers);
    } catch (error) {
        console.error("Team Route Error:", error);
        res.status(500).json({ error: "Erreur chargement équipe" });
    }
});

module.exports = router;
