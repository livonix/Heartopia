
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const axios = require('axios');
const { translateContent: translateSingle, runBatchTranslation, AVAILABLE_LANGUAGES } = require('../services/translator');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const COOKIE_NAME = 'heartopia_session';

const requireAccess = (roles = ['admin']) => async (req, res, next) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Non authentifié' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const discordId = decoded?.discord_id;
        if (!discordId) return res.status(401).json({ error: 'Session invalide' });

        const [rows] = await pool.query('SELECT id, discord_id, role FROM users WHERE discord_id = ?', [discordId]);
        if (rows.length === 0) return res.status(401).json({ error: 'Session invalide' });

        const user = rows[0];
        if (!roles.includes(user.role)) return res.status(403).json({ error: 'Accès interdit' });

        req.user = user;
        return next();
    } catch (e) {
        return res.status(401).json({ error: 'Session invalide' });
    }
};

const WEBHOOK_CODES = 'https://discord.com/api/webhooks/1464259027625054262/U0F71KNCfXFMkYLALEcDAWUS2tq_jnMe4fVNnkr5KZ0PaRnLGylR7clRkWevMdTnacUK';

const getTable = (type) => {
    const map = {
        'category': 'categories', 'categories': 'categories',
        'page': 'pages', 'pages': 'pages',
        'section': 'sections', 'sections': 'sections',
        'guide': 'guide_portals', 'guides': 'guide_portals',
        'team': 'team_members', 'academy': 'academy_videos', 'videos': 'academy_videos',
        'comment': 'comments', 'comments': 'comments',
        'code': 'promo_codes', 'codes': 'promo_codes',
        'announcement': 'announcements', 'announcements': 'announcements', 'news': 'announcements',
        'user': 'users', 'users': 'users'
    };
    return map[type.toLowerCase()] || type;
};

router.use(requireAccess(['support', 'moderator', 'admin']));

// --- REAL-TIME BROADCAST ---

router.post('/broadcast', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message vide" });

    // Emission via l'instance IO attachée à la requête (voir server.js)
    req.io.emit('global_notification', message);
    
    console.log(`📢 Notification globale envoyée : "${message}"`);
    res.json({ success: true });
});

// --- TRANSLATION MANAGER ---

router.get('/translations/languages', (req, res) => {
    res.json(AVAILABLE_LANGUAGES);
});

router.post('/translations/generate', async (req, res) => {
    const { languages } = req.body; 
    try {
        const report = await runBatchTranslation(languages);
        res.json({ success: true, report });
    } catch (e) {
        console.error("Translation Batch Error:", e);
        res.status(500).json({ error: "Erreur lors de la génération des traductions." });
    }
});

router.get('/translations/stats', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT language_code, COUNT(*) as count 
            FROM content_translations 
            GROUP BY language_code
        `);
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- MAINTENANCE MANAGEMENT ---

router.get('/maintenance', async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'maintenance'");
        res.json({ enabled: rows[0]?.setting_value === 'true' });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.post('/maintenance', async (req, res) => {
    const { enabled } = req.body;
    try {
        await pool.query("UPDATE settings SET setting_value = ? WHERE setting_key = 'maintenance'", [enabled ? 'true' : 'false']);
        res.json({ success: true, enabled });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- USERS MANAGEMENT ---

router.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, discord_id, username, avatar, role, last_login, created_at FROM users ORDER BY last_login DESC');
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.put('/users/:id/role', async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['guest', 'support', 'moderator', 'admin'].includes(role)) {
        return res.status(400).json({ error: "Rôle invalide" });
    }

    try {
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- ANALYTICS & STATS ---

router.get('/analytics', async (req, res) => {
    try {
        // Top Pages
        const [pages] = await pool.query(`
            SELECT page_path, COUNT(*) as views 
            FROM site_visits 
            WHERE action_type = 'view' 
            GROUP BY page_path 
            ORDER BY views DESC 
            LIMIT 10
        `);

        // Visiteurs Uniques sur 7 jours
        const [dailyUnique] = await pool.query(`
            SELECT DATE(visited_at) as date, COUNT(DISTINCT visitor_id) as visitors 
            FROM site_visits 
            WHERE visited_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) 
            GROUP BY DATE(visited_at) 
            ORDER BY date ASC
        `);

        // Actions
        const [actions] = await pool.query(`
            SELECT action_type, COUNT(*) as count 
            FROM site_visits 
            GROUP BY action_type
        `);

        // Browsers
        const [browsers] = await pool.query(`
            SELECT 
                CASE 
                    WHEN user_agent LIKE '%Chrome%' THEN 'Chrome'
                    WHEN user_agent LIKE '%Firefox%' THEN 'Firefox'
                    WHEN user_agent LIKE '%Safari%' AND user_agent NOT LIKE '%Chrome%' THEN 'Safari'
                    ELSE 'Autre'
                END as browser,
                COUNT(*) as count
            FROM site_visits
            GROUP BY browser
        `);

        res.json({ pages, dailyUnique, actions, browsers });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.get('/stats', async (req, res) => {
    try {
        const [pRows] = await pool.query('SELECT COUNT(*) as count FROM pages');
        const [cRows] = await pool.query('SELECT COUNT(*) as count FROM categories');
        const [tRows] = await pool.query('SELECT COUNT(*) as count FROM team_members');
        const [vRows] = await pool.query('SELECT COUNT(*) as count FROM site_visits');
        const [uRows] = await pool.query('SELECT COUNT(DISTINCT ip_address) as count FROM site_visits');
        const [tdRows] = await pool.query('SELECT COUNT(*) as count FROM site_visits WHERE visited_at > CURRENT_DATE');
        const [aRows] = await pool.query('SELECT COUNT(*) as count FROM academy_videos');
        const [coRows] = await pool.query('SELECT COUNT(*) as count FROM comments');
        const [userRows] = await pool.query('SELECT COUNT(*) as count FROM users');
        const [newVisitorsRows] = await pool.query(`SELECT COUNT(*) as count FROM (SELECT ip_address FROM site_visits GROUP BY ip_address HAVING MIN(visited_at) >= CURRENT_DATE) as subquery`);

        res.json({ 
            pages: pRows[0]?.count || 0, categories: cRows[0]?.count || 0, team: tRows[0]?.count || 0, 
            totalVisits: vRows[0]?.count || 0, uniqueVisitors: uRows[0]?.count || 0, todayVisits: tdRows[0]?.count || 0,
            newUniqueToday: newVisitorsRows[0]?.count || 0, academyVideos: aRows[0]?.count || 0, comments: coRows[0]?.count || 0,
            users: userRows[0]?.count || 0
        });
    } catch (e) { console.error(e); res.status(500).json({ error: e.message }); }
});

router.get('/comments', async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const status = (req.query.status || 'open').toString();
    const allowedStatuses = ['open', 'handled', 'all'];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Paramètre status invalide' });
    }

    try {
        const where = status === 'all' ? '' : 'WHERE c.status = ?';
        const args = status === 'all' ? [] : [status];

        const [countRows] = await pool.query(
            `SELECT COUNT(*) as count FROM comments c ${where}`,
            args
        );

        const [rows] = await pool.query(
            `SELECT c.*, s.title as section_title
             FROM comments c
             LEFT JOIN sections s ON c.section_id = s.id
             ${where}
             ORDER BY c.created_at DESC
             LIMIT ? OFFSET ?`,
            [...args, limit, offset]
        );

        res.json({
            items: rows,
            total: countRows[0]?.count || 0,
            limit,
            offset
        });
    } catch (e) {
        res.status(500).json({ error: "Erreur récupération commentaires" });
    }
});

router.put('/comments/:id/handle', async (req, res) => {
    try {
        await pool.query(
            "UPDATE comments SET status = 'handled', handled_at = NOW() WHERE id = ?",
            [req.params.id]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.get('/categories', async (req, res) => { 
    try { 
        const [rows] = await pool.query('SELECT * FROM categories'); 
        res.json(rows); 
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    } 
});
router.get('/pages/:catId', async (req, res) => { 
    try { 
        const [rows] = await pool.query('SELECT * FROM pages WHERE category_id = ?', [req.params.catId]); 
        res.json(rows); 
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    } 
});
router.get('/sections/:pageId', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM sections WHERE page_id = ? ORDER BY order_index ASC', [req.params.pageId]);
        const parsedRows = rows.map(row => {
            try {
                if (row.content && typeof row.content === 'string' && (row.content.startsWith('[') || row.content.startsWith('{'))) {
                    row.content = JSON.parse(row.content);
                }
                if (row.content_en && typeof row.content_en === 'string' && (row.content_en.startsWith('[') || row.content_en.startsWith('{'))) {
                    row.content_en = JSON.parse(row.content_en);
                }
            } catch (err) {}
            return row;
        });
        res.json(parsedRows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});
router.get('/academy', async (req, res) => { 
    try { 
        const [rows] = await pool.query('SELECT * FROM academy_videos ORDER BY order_index ASC'); 
        res.json(rows); 
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    } 
});
router.get('/codes', async (req, res) => { 
    try { 
        const [rows] = await pool.query('SELECT * FROM promo_codes ORDER BY status ASC, id DESC'); 
        res.json(rows); 
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    } 
});
router.get('/announcements', async (req, res) => { 
    try { 
        const [rows] = await pool.query('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC'); 
        res.json(rows); 
    } catch (e) { 
        res.status(500).json({ error: e.message }); 
    } 
});

// --- POSTERS AVEC TRADUCTION AUTO (Legacy + Future Proof) ---

router.post('/categories', async (req, res) => {
    const { name, label } = req.body;
    const name_en = await translateSingle(name, 'en');
    const label_en = await translateSingle(label, 'en');
    const [result] = await pool.query('INSERT INTO categories (name, name_en, label, label_en) VALUES (?, ?, ?, ?)', [name, name_en, label, label_en]);
    res.json({ id: result.insertId });
});

router.post('/pages', async (req, res) => {
    const { title, slug, category_id } = req.body;
    const title_en = await translateSingle(title, 'en');
    const [result] = await pool.query('INSERT INTO pages (title, title_en, slug, category_id) VALUES (?, ?, ?, ?)', [title, title_en, slug, category_id]);
    res.json({ id: result.insertId });
});

router.post('/sections', async (req, res) => {
    const { title, content, order_index, page_id } = req.body;
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content || ''); // Fallback empty string
    
    const title_en = await translateSingle(title, 'en');
    const content_en = await translateSingle(contentStr, 'en');

    const [result] = await pool.query('INSERT INTO sections (title, title_en, content, content_en, order_index, page_id) VALUES (?, ?, ?, ?, ?, ?)', [title, title_en, contentStr, content_en, order_index, page_id]);
    res.json({ id: result.insertId });
});

router.post('/guides', async (req, res) => {
    const { name, description, icon_url, bubble_url, order_index } = req.body;
    const name_en = await translateSingle(name, 'en');
    const description_en = await translateSingle(description, 'en');
    const [result] = await pool.query('INSERT INTO guide_portals (name, name_en, description, description_en, icon_url, bubble_url, order_index) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, name_en, description, description_en, icon_url, bubble_url, order_index || 0]);
    res.json({ id: result.insertId });
});

router.post('/announcements', async (req, res) => {
    const { title, tag, content, image_url, is_pinned } = req.body;
    const title_en = await translateSingle(title, 'en');
    const content_en = await translateSingle(content, 'en');
    const [result] = await pool.query(
        'INSERT INTO announcements (title, title_en, tag, content, content_en, image_url, is_pinned) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [title, title_en, tag || 'Info', content, content_en, image_url, is_pinned || false]
    );
    res.json({ id: result.insertId });
});

router.post('/academy', async (req, res) => {
    const { title, duration, type, video_url, poster_url, order_index } = req.body;
    const [result] = await pool.query('INSERT INTO academy_videos (title, duration, type, video_url, poster_url, order_index) VALUES (?, ?, ?, ?, ?, ?)', [title, duration, type, video_url, poster_url, order_index || 0]);
    res.json({ id: result.insertId });
});

router.post('/codes', async (req, res) => {
    const { code, reward, status, description } = req.body;
    const [result] = await pool.query('INSERT INTO promo_codes (code, reward, status, description) VALUES (?, ?, ?, ?)', [code, reward, status, description]);
    
    // Discord Webhook
    axios.post(WEBHOOK_CODES, {
        embeds: [{
            title: "🎁 Nouveau Code Cadeau Ajouté !",
            color: 5763717,
            fields: [
                { name: "Code", value: `\`${code}\``, inline: true },
                { name: "Récompense", value: reward, inline: true },
                { name: "Statut", value: status, inline: true },
                { name: "Description", value: description || "Aucune description" }
            ],
            footer: { text: "Heartopia Wiki Admin" },
            timestamp: new Date().toISOString()
        }]
    }).catch(err => console.error("Webhook Code Error:", err.message));

    // WebSocket Alert to Users
    if (status === 'active') {
        req.io.emit('new_code_alert', {
            id: result.insertId,
            code: code,
            reward: reward
        });
    }

    res.json({ id: result.insertId });
});

router.post('/team', async (req, res) => {
    const { discord_id, role, description } = req.body;
    let name = 'Membre Inconnu';
    let avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
    async function fetchDiscordUser(discordId) {
        const token = process.env.DISCORD_BOT_TOKEN; 
        if (!token) return null;
        try {
            const res = await axios.get(`https://discord.com/api/users/${discordId}`, { headers: { Authorization: `Bot ${token}` } });
            return { name: res.data.global_name || res.data.username, avatar: res.data.avatar ? `https://cdn.discordapp.com/avatars/${res.data.id}/${res.data.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${(res.data.id >> 22) % 6}.png` };
        } catch (e) { return null; }
    }
    if (discord_id) {
        const discordData = await fetchDiscordUser(discord_id);
        if (discordData) { name = discordData.name; avatar = discordData.avatar; }
    }
    const [result] = await pool.query('INSERT INTO team_members (name, role, description, avatar, discord_id) VALUES (?, ?, ?, ?, ?)', [name, role, description, avatar, discord_id]);
    res.json({ id: result.insertId, name, avatar });
});

// PUTers
router.put('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const table = getTable(type);
    const data = req.body;
    
    // Auto-translation logic - Uniquement pour les tables qui le supportent
    const translatableTables = ['categories', 'pages', 'sections', 'guide_portals', 'announcements'];
    if (translatableTables.includes(table)) {
        if (data.title) data.title_en = await translateSingle(data.title, 'en');
        if (data.name) data.name_en = await translateSingle(data.name, 'en');
        
        // CONTENT HANDLING: Ensure content isn't null and stringified if object
        if (data.hasOwnProperty('content')) {
            let contentVal = data.content;
            if (contentVal === null || contentVal === undefined) contentVal = '';
            const contentStr = typeof contentVal === 'string' ? contentVal : JSON.stringify(contentVal);
            data.content = contentStr; // Update payload for SQL query
            data.content_en = await translateSingle(contentStr, 'en');
        }

        if (data.description) data.description_en = await translateSingle(data.description, 'en');
        if (data.label) data.label_en = await translateSingle(data.label, 'en');
    }

    let sets = [];
    let values = [];
    
    for (let key in data) {
        if (key === 'id' || key === 'created_at') continue;
        sets.push(`${key} = ?`);
        let val = data[key];
        // Note: content is already processed above, but double check
        if (key === 'content' && typeof val !== 'string') val = JSON.stringify(val);
        values.push(val);
    }
    
    if (sets.length === 0) return res.status(400).json({ error: "Aucune donnée à mettre à jour" });
    
    values.push(id);

    try {
        await pool.query(`UPDATE ${table} SET ${sets.join(', ')} WHERE id = ?`, values);
        res.status(200).json({ success: true });
    } catch (e) {
        console.error(`Update Error (${table}):`, e.message);
        res.status(500).json({ error: e.message });
    }
});

// DELETE
router.delete('/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const table = getTable(type);
    try {
        await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
        await pool.query(`DELETE FROM content_translations WHERE table_name = ? AND record_id = ?`, [table, id]);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
