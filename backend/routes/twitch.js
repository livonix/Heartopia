
const express = require('express');
const router = express.Router();
const axios = require('axios');

let accessToken = null;
let tokenExpiry = 0;

// Helper: Obtenir Token App Twitch
async function getTwitchToken() {
    // Lecture dynamique pour s'assurer que dotenv est chargé
    const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID; 
    const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;

    if (accessToken && Date.now() < tokenExpiry) return accessToken;
    
    if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
        console.warn("⚠️  Twitch API Keys manquantes dans le .env");
        return null;
    }

    try {
        const res = await axios.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: TWITCH_CLIENT_ID,
                client_secret: TWITCH_CLIENT_SECRET,
                grant_type: 'client_credentials'
            }
        });
        accessToken = res.data.access_token;
        tokenExpiry = Date.now() + (res.data.expires_in * 1000);
        console.log("✅ Token Twitch généré avec succès");
        return accessToken;
    } catch (e) {
        console.error("❌ Erreur Token Twitch:", e.message);
        if(e.response) console.error("Détails:", e.response.data);
        return null;
    }
}

router.get('/streams', async (req, res) => {
    // Récupérer la langue depuis la requête (défaut 'fr')
    const lang = req.query.lang || 'fr';
    
    try {
        const token = await getTwitchToken();
        const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID;
        
        if (!token) {
            // Mock data si pas de token
            return res.json([]); 
        }

        // 1. Chercher l'ID du jeu Heartopia
        let gameId = null;
        try {
            const gameRes = await axios.get('https://api.twitch.tv/helix/games', {
                headers: { 'Client-ID': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token}` },
                params: { name: 'Heartopia' }
            });
            gameId = gameRes.data.data.length > 0 ? gameRes.data.data[0].id : null;
        } catch (e) {
            console.error("Erreur Game ID Twitch:", e.message);
        }

        if (!gameId) {
            return res.json([]);
        }

        // 2. Chercher les streams avec la langue spécifiée
        const streamsRes = await axios.get('https://api.twitch.tv/helix/streams', {
            headers: { 'Client-ID': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token}` },
            params: {
                game_id: gameId,
                language: lang, // Utilise la langue demandée (fr, en, es, etc.)
                first: 20
            }
        });

        // 3. Enrichir avec les avatars
        const streams = streamsRes.data.data;
        if (streams.length > 0) {
            const userIds = streams.map(s => s.user_id).join('&id=');
            try {
                const usersRes = await axios.get(`https://api.twitch.tv/helix/users?id=${userIds}`, {
                    headers: { 'Client-ID': TWITCH_CLIENT_ID, 'Authorization': `Bearer ${token}` }
                });
                
                const userMap = {};
                usersRes.data.data.forEach(u => userMap[u.id] = u.profile_image_url);
                
                streams.forEach(s => s.profile_image_url = userMap[s.user_id]);
            } catch(e) {
                console.error("Erreur enrichissement avatars:", e.message);
            }
        }

        res.json(streams);

    } catch (e) {
        console.error("Erreur API Twitch Générale:", e.message);
        res.status(500).json({ error: "Impossible de récupérer les streams" });
    }
});

module.exports = router;
