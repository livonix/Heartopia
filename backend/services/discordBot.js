
const axios = require('axios');
const { pool } = require('../config/db');

const CHANNEL_ID = process.env.DISCORD_STATS_CHANNEL_ID;
const TOKEN = process.env.DISCORD_BOT_TOKEN;

/**
 * Met à jour le nom du salon Discord avec le nombre total de vues
 */
async function updateDiscordStats() {
    if (!CHANNEL_ID || !TOKEN) {
        console.warn("⚠️ Bot Discord: Token ou Channel ID manquant dans le .env");
        return;
    }

    try {
        // 1. Récupérer le nombre total de vues
        const [rows] = await pool.query('SELECT COUNT(*) as count FROM site_visits');
        const totalViews = rows[0]?.count || 0;

        // Formatter le nombre (ex: 1 200)
        const formattedViews = new Intl.NumberFormat('fr-FR').format(totalViews);
        const channelName = `Wiki Views : ${formattedViews}`;

        // 2. Envoyer la requête à Discord
        await axios.patch(
            `https://discord.com/api/v10/channels/${CHANNEL_ID}`,
            { name: channelName },
            { 
                headers: { 
                    'Authorization': `Bot ${TOKEN}`,
                    'Content-Type': 'application/json'
                } 
            }
        );

        console.log(`🤖 Discord Stats Updated: "${channelName}"`);

    } catch (error) {
        // Ignorer les erreurs courantes de Rate Limit pour ne pas spammer les logs
        if (error.response && error.response.status === 429) {
            console.warn("⚠️ Discord Rate Limit hit (Stats update skipped)");
        } else {
            console.error("❌ Erreur mise à jour Discord Stats:", error.message);
        }
    }
}

/**
 * Initialise le service de stats
 * Lance une mise à jour immédiate puis planifie toutes les 10 minutes
 */
function initDiscordBot() {
    console.log("🤖 Initialisation du Bot Discord Stats...");
    
    // Premier appel au démarrage (attendre 5s que la DB soit chaude)
    setTimeout(updateDiscordStats, 5000);

    // Répéter toutes les 10 minutes (600,000 ms)
    // Discord limite les renommages de channels à 2 requêtes / 10 min
    setInterval(updateDiscordStats, 10 * 60 * 1000);
}

module.exports = { initDiscordBot, updateDiscordStats };
