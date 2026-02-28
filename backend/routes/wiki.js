
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const { AVAILABLE_LANGUAGES } = require('../services/translator');

// Route publique pour récupérer les langues disponibles
router.get('/languages', (req, res) => {
    const languages = [{ code: 'fr', name: 'Français' }, ...AVAILABLE_LANGUAGES];
    res.json(languages);
});

// Route: /api/wiki/structure?lang=en
router.get('/structure', async (req, res) => {
    const lang = req.query.lang || 'fr';

    try {
        // 1. Récupération de la structure de base (FR)
        const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
        const [pages] = await pool.query('SELECT * FROM pages ORDER BY category_id, id ASC');
        const [sections] = await pool.query('SELECT * FROM sections ORDER BY page_id, order_index, id ASC');

        // 2. Si une autre langue est demandée, on récupère les traductions
        let translations = [];
        if (lang !== 'fr') {
            // On récupère TOUTES les traductions pertinentes d'un coup pour éviter les n+1 requêtes
            // tables: categories, pages, sections
            const [rows] = await pool.query(
                `SELECT table_name, record_id, field_name, translated_value 
                 FROM content_translations 
                 WHERE language_code = ? AND table_name IN ('categories', 'pages', 'sections')`,
                [lang]
            );
            translations = rows;
        }

        // Helper optimisé pour appliquer une traduction depuis le cache local
        const translate = (tableName, recordId, fieldName, originalValue) => {
            if (lang === 'fr') return originalValue;
            const t = translations.find(r => r.table_name === tableName && r.record_id === recordId && r.field_name === fieldName);
            return t ? t.translated_value : originalValue;
        };

        const parseJSON = (content) => {
            if (typeof content === 'string' && (content.trim().startsWith('[') || content.trim().startsWith('{'))) {
                try {
                    return JSON.parse(content);
                } catch (e) {
                    return content;
                }
            }
            return content;
        };

        // 3. Construction de l'arbre avec application des traductions
        const structure = categories.map(cat => ({
            ...cat,
            name: translate('categories', cat.id, 'name', cat.name),
            label: translate('categories', cat.id, 'label', cat.label),
            pages: pages.filter(p => p.category_id === cat.id).map(p => ({
                ...p,
                title: translate('pages', p.id, 'title', p.title),
                sections: sections.filter(s => s.page_id === p.id).map(s => {
                    const translatedTitle = translate('sections', s.id, 'title', s.title);
                    
                    // Récupération du contenu
                    let contentToParse = s.content;
                    if (lang !== 'fr') {
                        // On vérifie s'il existe une traduction pour 'content'
                        const translatedContent = translate('sections', s.id, 'content', null);
                        // Si une traduction existe, on l'utilise PRIORITAIREMENT
                        if (translatedContent) {
                            contentToParse = translatedContent;
                        }
                    }
                    
                    return {
                        ...s,
                        title: translatedTitle,
                        content: parseJSON(contentToParse)
                    };
                })
            }))
        }));

        res.json(structure);
    } catch (error) { 
        console.error("Wiki Structure Error:", error);
        res.status(500).json({ error: "Erreur lors du chargement de la structure" }); 
    }
});

// --- CODE INTERACTIONS (Copy/Like/Dislike) ---

router.post('/codes/:id/:action', async (req, res) => {
    const { id, action } = req.params;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const cleanIp = ip.split(',')[0].trim();

    if (!['copy', 'like', 'dislike'].includes(action)) {
        return res.status(400).json({ error: "Action invalide" });
    }

    try {
        // 1. Vérifier si l'IP a déjà fait cette action sur ce code
        const [existing] = await pool.query(
            'SELECT id FROM code_interactions WHERE code_id = ? AND ip_address = ? AND action_type = ?',
            [id, cleanIp, action]
        );

        // Si déjà fait, on refuse silencieusement (pour ne pas spammer la DB) ou on toggle le vote
        // Pour 'copy', on veut peut-être limiter à 1 fois par jour ? Pour l'instant 1 fois ever pour stat pure
        if (existing.length > 0) {
            return res.json({ success: true, message: "Déjà comptabilisé" });
        }

        // 2. Enregistrer l'interaction
        await pool.query(
            'INSERT INTO code_interactions (code_id, ip_address, action_type) VALUES (?, ?, ?)',
            [id, cleanIp, action]
        );

        // 3. Mettre à jour le compteur global du code
        let column = '';
        if (action === 'copy') column = 'usage_count';
        if (action === 'like') column = 'likes';
        if (action === 'dislike') column = 'dislikes';

        if (column) {
            await pool.query(`UPDATE promo_codes SET ${column} = ${column} + 1 WHERE id = ?`, [id]);
        }

        res.json({ success: true });
    } catch (e) {
        console.error("Code Interaction Error:", e);
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
