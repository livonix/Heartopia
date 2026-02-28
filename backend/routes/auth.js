
const express = require('express');
const router = express.Router();
const axios = require('axios');
const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const COOKIE_NAME = 'heartopia_session';

function setSessionCookie(res, payload) {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
    res.cookie(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
}

function clearSessionCookie(res) {
    res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
    });
}

// Helper pour l'échange de token
async function exchangeCode(code, redirectUri) {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        const err = new Error('Discord OAuth is not configured');
        err.statusCode = 500;
        throw err;
    }
    const params = new URLSearchParams({ 
        client_id: CLIENT_ID, 
        client_secret: CLIENT_SECRET, 
        grant_type: 'authorization_code', 
        code, 
        redirect_uri: redirectUri 
    });
    
    return await axios.post('https://discord.com/api/oauth2/token', params, { 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' } 
    });
}

// Vérification de session au chargement (Sync Role DB -> Frontend)
router.get('/verify/:discordId', async (req, res) => {
    const { discordId } = req.params;
    try {
        const [rows] = await pool.query('SELECT id, username, avatar, role FROM users WHERE discord_id = ?', [discordId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }
        
        const user = rows[0];
        const hasAccess = ['support', 'moderator', 'admin'].includes(user.role);
        
        res.json({
            internal_id: user.id,
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            isAdmin: user.role === 'admin',
            hasAccess: hasAccess
        });
    } catch (e) {
        console.error("Verify Session Error:", e.message);
        res.status(500).json({ error: e.message });
    }
});

// Session info from cookie
router.get('/me', async (req, res) => {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.status(401).json({ error: 'Non authentifié' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const discordId = decoded?.discord_id;
        if (!discordId) return res.status(401).json({ error: 'Session invalide' });

        const [rows] = await pool.query('SELECT id, discord_id, username, avatar, role FROM users WHERE discord_id = ?', [discordId]);
        if (rows.length === 0) return res.status(401).json({ error: 'Session invalide' });

        const user = rows[0];
        const hasAccess = ['support', 'moderator', 'admin'].includes(user.role);
        return res.json({
            user: {
                id: user.discord_id,
                internal_id: user.id,
                username: user.username,
                avatar: user.avatar,
                role: user.role,
                isAdmin: user.role === 'admin',
                hasAccess
            }
        });
    } catch (e) {
        return res.status(401).json({ error: 'Session invalide' });
    }
});

router.post('/logout', (req, res) => {
    clearSessionCookie(res);
    res.json({ success: true });
});

// Login Admin/Dashboard (Check DB Role)
router.post('/discord', async (req, res) => {
    const { code } = req.body;
    const origin = req.get('origin') || 'http://localhost:3000';
    
    try {
        const tokenRes = await exchangeCode(code, origin);

        // Get User Info
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        const discordUser = userRes.data;
        const avatarUrl = discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${(discordUser.id >> 22) % 6}.png`;

        // UPSERT User into Database
        // We set role='guest' only on INSERT. If UPDATE, we keep existing role.
        await pool.query(`
            INSERT INTO users (discord_id, username, avatar, role, last_login)
            VALUES (?, ?, ?, 'guest', NOW())
            ON DUPLICATE KEY UPDATE 
            username = VALUES(username), 
            avatar = VALUES(avatar), 
            last_login = NOW()
        `, [discordUser.id, discordUser.username, avatarUrl]);

        // Retrieve the current role from DB
        const [rows] = await pool.query('SELECT role, id FROM users WHERE discord_id = ?', [discordUser.id]);
        const userRole = rows[0]?.role || 'guest';
        const internalId = rows[0]?.id;

        // Check permission strictly for login response (frontend will redirect if guest)
        const hasAccess = ['support', 'moderator', 'admin'].includes(userRole);

        setSessionCookie(res, { discord_id: discordUser.id });

        res.json({
            user: {
                id: discordUser.id,
                internal_id: internalId,
                username: discordUser.username,
                avatar: avatarUrl,
                role: userRole,
                isAdmin: userRole === 'admin',
                hasAccess: hasAccess
            }
        });
    } catch (error) {
        console.error("Discord Auth Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Échec de l'authentification Discord" });
    }
});

// Login Public (Pour les commentaires/feedback) - Identical to before but syncs basic info
router.post('/discord/public', async (req, res) => {
    const { code } = req.body;
    const origin = req.get('origin') || 'http://localhost:3000';
    
    try {
        const tokenRes = await exchangeCode(code, origin);

        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${tokenRes.data.access_token}` }
        });

        const discordUser = userRes.data;
        const avatarUrl = discordUser.avatar 
            ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${(discordUser.id >> 22) % 6}.png`;

        // Sync user in DB as guest if not exists
        await pool.query(`
            INSERT INTO users (discord_id, username, avatar, role, last_login)
            VALUES (?, ?, ?, 'guest', NOW())
            ON DUPLICATE KEY UPDATE 
            username = VALUES(username), 
            avatar = VALUES(avatar), 
            last_login = NOW()
        `, [discordUser.id, discordUser.username, avatarUrl]);

        setSessionCookie(res, { discord_id: discordUser.id });

        res.json({
            user: {
                id: discordUser.id,
                username: discordUser.username,
                avatar: avatarUrl,
                isAdmin: false
            }
        });

    } catch (error) {
        console.error("Discord Public Auth Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Échec de la connexion Discord" });
    }
});

module.exports = router;
