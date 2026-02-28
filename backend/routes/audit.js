
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');
const axios = require('axios');

// Enregistrement d'une visite ou action (Uniquement si consenti)
router.post('/visit', async (req, res) => {
    try {
        const { visitor_id, page_path, action_type } = req.body;
        
        // Si pas de visitor_id, on considère que le consentement n'est pas donné pour le tracking précis
        // On ne loggue rien ou juste une stat anonyme sans IP ni ID
        if (!visitor_id) {
            return res.status(200).send("No tracking");
        }

        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const ip = rawIp.split(',')[0].trim();
        const ua = req.headers['user-agent'];

        // On enregistre avec l'ID visiteur
        await pool.query(
            'INSERT INTO site_visits (visitor_id, ip_address, page_path, action_type, user_agent) VALUES (?, ?, ?, ?, ?)', 
            [visitor_id, ip, page_path || '/', action_type || 'view', ua]
        );
        
        res.status(204).send();
    } catch (e) {
        console.error("Erreur audit:", e);
        res.status(500).end();
    }
});

// DROIT À L'OUBLI : Suppression des données
router.post('/tracking/delete', async (req, res) => {
    const { visitor_id } = req.body;
    
    if (!visitor_id) {
        return res.status(400).json({ error: "ID visiteur manquant" });
    }

    try {
        await pool.query('DELETE FROM site_visits WHERE visitor_id = ?', [visitor_id]);
        console.log(`🗑️ Données supprimées pour le visiteur ${visitor_id}`);
        res.json({ success: true, message: "Toutes vos données ont été supprimées." });
    } catch (e) {
        console.error("Erreur suppression tracking:", e);
        res.status(500).json({ error: "Erreur serveur" });
    }
});

module.exports = router;
