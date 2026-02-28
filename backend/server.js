
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http'); // Import HTTP
const axios = require('axios'); // Import Axios pour le proxy ads.txt
const { initDB } = require('./config/db');
const cookieParser = require('cookie-parser');
const { initSocket } = require('./socketManager'); // Import Socket Manager
const { fetchAndApplyTranslations } = require('./services/translator'); // Import Translator Helper
const { initDiscordBot } = require('./services/discordBot'); // Import Discord Bot

// Import des routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const auditRoutes = require('./routes/audit');
const teamRoutes = require('./routes/team');
const wikiRoutes = require('./routes/wiki');
const interactionRoutes = require('./routes/interactions');
const twitchRoutes = require('./routes/twitch');
const tradingRoutes = require('./routes/trading');
const messagesRoutes = require('./routes/messages');
const supportRoutes = require('./routes/support'); // NEW
const showcaseRoutes = require('./routes/showcase');

const app = express();
const server = http.createServer(app); // Wrap express app in HTTP server
const PORT = process.env.PORT || 5000;

// Init WebSockets
const io = initSocket(server);

// Middlewares
app.use(cors({
    origin: true,
    credentials: true
}));
// Augmentation de la limite du body pour accepter les images en Base64 (100mb)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
app.use(cookieParser());

// Inject IO into request object for API routes (if needed to emit from REST calls)
app.use((req, res, next) => {
    req.io = io;
    next();
});

// --- MIDDLEWARE REDIRECTION I18N WIKI ---
app.use((req, res, next) => {
    if (req.path === '/wiki' || req.path === '/wiki/') {
        const savedLang = req.cookies['heartopia_lang'];
        if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
            return res.redirect(`/wiki/${savedLang}`);
        }
        const acceptLanguage = req.headers['accept-language'];
        let targetLang = 'en';
        if (acceptLanguage && acceptLanguage.includes('fr')) {
            targetLang = 'fr';
        }
        return res.redirect(`/wiki/${targetLang}`);
    }
    next();
});

// --- API ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/wiki', wikiRoutes);
app.use('/api', auditRoutes);
app.use('/api', interactionRoutes);
app.use('/api/twitch', twitchRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/support', supportRoutes); // NEW
app.use('/api/showcase', showcaseRoutes);

// Public Status Route
app.get('/api/status', async (req, res) => {
    const { pool } = require('./config/db');
    try {
        const [rows] = await pool.query("SELECT setting_value FROM settings WHERE setting_key = 'maintenance'");
        res.json({ maintenance: rows[0]?.setting_value === 'true' });
    } catch (e) {
        console.error("Status Check Error:", e.message);
        res.json({ maintenance: false, error: "DB Error" });
    }
});

// Mapping direct pour les routes publiques AVEC TRADUCTION
app.get('/api/guides', async (req, res) => {
    const { pool } = require('./config/db');
    const lang = req.query.lang || 'fr';
    try {
        const [rows] = await pool.query('SELECT * FROM guide_portals ORDER BY order_index ASC');
        const translatedRows = await fetchAndApplyTranslations('guide_portals', rows, lang);
        res.json(translatedRows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/academy', async (req, res) => {
    const { pool } = require('./config/db');
    const lang = req.query.lang || 'fr';
    try {
        const [rows] = await pool.query('SELECT * FROM academy_videos ORDER BY order_index ASC');
        const translatedRows = await fetchAndApplyTranslations('academy_videos', rows, lang);
        res.json(translatedRows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/codes', async (req, res) => {
    const { pool } = require('./config/db');
    const lang = req.query.lang || 'fr';
    try {
        const [rows] = await pool.query('SELECT * FROM promo_codes ORDER BY status ASC, id DESC');
        const translatedRows = await fetchAndApplyTranslations('promo_codes', rows, lang);
        res.json(translatedRows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/news', async (req, res) => {
    const { pool } = require('./config/db');
    const lang = req.query.lang || 'fr';
    try {
        const [rows] = await pool.query('SELECT * FROM announcements ORDER BY is_pinned DESC, created_at DESC');
        const translatedRows = await fetchAndApplyTranslations('announcements', rows, lang);
        res.json(translatedRows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- SERVING FRONTEND ---
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// Initialisation DB et démarrage (Note: server.listen au lieu de app.listen)
initDB().then(() => {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`
  🚀 HEARTOPA WIKI FULLSTACK SERVER 🚀
  ------------------------------------
  Frontend: http://localhost:${PORT}
  API: http://localhost:${PORT}/api
  WS: Socket.IO Active
  Database: Connectée
  Status: Opérationnel
        `);

        // Démarrage du Bot Discord Stats
        initDiscordBot();
    });
}).catch(err => {
    console.error("❌ ÉCHEC DU DÉMARRAGE DU SERVEUR:", err.message);
    process.exit(1);
});