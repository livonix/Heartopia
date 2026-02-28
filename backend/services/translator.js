
const translate = require('google-translate-api-x');
const { pool } = require('../config/db');
const { getIO } = require('../socketManager');

// Configuration complète des champs à traduire par table
const TRANSLATION_CONFIG = {
    categories: ['name', 'label'],
    pages: ['title'],
    sections: ['title', 'content'], // Content est souvent du JSON complexe
    guide_portals: ['name', 'description'],
    announcements: ['title', 'content'],
    promo_codes: ['reward', 'description'],
    team_members: ['role', 'description'],
    academy_videos: ['title']
};

// Liste des clés JSON à traduire spécifiquement (pour les objets dans les sections)
const JSON_KEYS_TO_TRANSLATE = [
    'name', 'nom', 'desc', 'description', 'title', 'titre', 'content', 'text',
    'role', 'reward', 'ingredients', 'lieu', 'zone', 'place',
    'periode', 'period', 'meteo', 'weather', 'heure', 'time', 'rarity', 'taille', 'foods'
];

// Liste des valeurs techniques à ne JAMAIS traduire même si la clé correspond
const IGNORED_VALUES = [
    'infobox', 'insect_infobox', 'recipe_infobox', 'animal_infobox', 'promo_codes', 'grid',
    'active', 'expired', 'open', 'closed', 'Tuto', 'Event'
];

// Langues cibles disponibles
const AVAILABLE_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'es', name: 'Español' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '简体中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'id', name: 'Bahasa Indonesia' }
];

function isJsonString(str) {
    if (typeof str !== 'string') return false;
    try {
        const o = JSON.parse(str);
        return (o && typeof o === 'object');
    } catch (e) {
        return false;
    }
}

/**
 * Traduction récursive intelligente pour JSON
 */
async function translateRecursive(input, targetLang) {
    // 1. Cas : Chaîne de caractères
    if (typeof input === 'string') {
        // Ignorer vide, URLs, chemins fichiers, valeurs techniques ignorées
        if (!input.trim() || 
            input.startsWith('http') || 
            input.startsWith('/') || 
            input.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) ||
            IGNORED_VALUES.includes(input)
        ) {
            return input;
        }
        
        try {
            const res = await translate(input, { to: targetLang, forceBatch: false });
            return res.text;
        } catch (e) {
            // En cas d'erreur (ex: rate limit), on retourne l'original
            return input;
        }
    } 
    
    // 2. Cas : Tableau
    else if (Array.isArray(input)) {
        const translatedArray = await Promise.all(input.map(item => translateRecursive(item, targetLang)));
        return translatedArray;
    } 
    
    // 3. Cas : Objet
    else if (typeof input === 'object' && input !== null) {
        const translatedObj = {};
        for (const key of Object.keys(input)) {
            // On ne traduit QUE si la clé est dans notre liste blanche OU si c'est un champ générique connu
            // Et on ne traduit jamais les clés techniques (id, image, url, slug, type, color...)
            if (JSON_KEYS_TO_TRANSLATE.includes(key)) {
                translatedObj[key] = await translateRecursive(input[key], targetLang);
            } else {
                // On garde la valeur originale pour les clés techniques (image, type, etc.)
                // Mais si la valeur est un objet/tableau, on doit quand même descendre dedans
                if (typeof input[key] === 'object' && input[key] !== null) {
                     translatedObj[key] = await translateRecursive(input[key], targetLang);
                } else {
                     translatedObj[key] = input[key];
                }
            }
        }
        return translatedObj;
    }
    
    return input;
}

/**
 * Traduit un contenu (Texte ou JSON stringifié)
 */
async function translateContent(content, targetLang) {
    if (!content) return content;

    // Si c'est du JSON (Structures Grid, Infoboxes)
    if (isJsonString(content)) {
        try {
            const parsedData = JSON.parse(content);
            const translatedData = await translateRecursive(parsedData, targetLang);
            return JSON.stringify(translatedData);
        } catch (e) {
            return content;
        }
    }

    // Texte simple
    return await translateRecursive(content, targetLang);
}

/**
 * Fonction Batch pour le panel Admin
 */
async function runBatchTranslation(targetLangCodes = []) {
    const report = { total: 0, success: 0, failed: 0, details: [] };
    const langsToProcess = targetLangCodes.length > 0 
        ? targetLangCodes 
        : AVAILABLE_LANGUAGES.map(l => l.code);

    // 1. Estimation du total pour la barre de progression
    let totalItemsToProcess = 0;
    for (const [table, fields] of Object.entries(TRANSLATION_CONFIG)) {
        const [countRes] = await pool.query(`SELECT COUNT(*) as c FROM ${table}`);
        totalItemsToProcess += countRes[0].c * fields.length * langsToProcess.length;
    }

    let processedItems = 0;
    const io = getIO();

    console.log(`🚀 Starting Translation Batch for: ${langsToProcess.join(', ')}. Est. Total items: ${totalItemsToProcess}`);

    for (const [table, fields] of Object.entries(TRANSLATION_CONFIG)) {
        const [rows] = await pool.query(`SELECT id, ${fields.join(', ')} FROM ${table}`);
        
        for (const row of rows) {
            for (const lang of langsToProcess) {
                // Ignore French as source
                if (lang === 'fr') continue;

                for (const field of fields) {
                    const sourceContent = row[field];
                    processedItems++;
                    
                    // Emit progress
                    const progress = Math.min(100, (processedItems / totalItemsToProcess) * 100);
                    io.emit('translation_progress', { progress, current: processedItems, total: totalItemsToProcess });

                    if (!sourceContent) continue;

                    // Vérification existante
                    const [existing] = await pool.query(
                        `SELECT id FROM content_translations 
                         WHERE table_name = ? AND record_id = ? AND language_code = ? AND field_name = ?`,
                        [table, row.id, lang, field]
                    );

                    if (existing.length > 0) {
                        continue; 
                    }

                    report.total++;
                    try {
                        const translated = await translateContent(sourceContent, lang);
                        
                        if (translated) {
                            await pool.query(
                                `INSERT INTO content_translations (table_name, record_id, language_code, field_name, translated_value)
                                 VALUES (?, ?, ?, ?, ?)
                                 ON DUPLICATE KEY UPDATE translated_value = VALUES(translated_value)`,
                                [table, row.id, lang, field, translated]
                            );
                            report.success++;
                            await new Promise(r => setTimeout(r, 200)); // Anti-rate limit
                        }
                    } catch (err) {
                        report.failed++;
                        console.error(`Trans Error ${table} #${row.id}:`, err.message);
                    }
                }
            }
        }
    }
    
    io.emit('translation_progress', { progress: 100, current: processedItems, total: totalItemsToProcess });
    return report;
}

/**
 * HELPER : Applique les traductions sur un jeu de résultats
 */
async function fetchAndApplyTranslations(tableName, originalRows, lang) {
    if (!originalRows || originalRows.length === 0 || !lang || lang === 'fr') {
        return originalRows;
    }

    const ids = originalRows.map(r => r.id);
    if (ids.length === 0) return originalRows;

    const [translations] = await pool.query(
        `SELECT record_id, field_name, translated_value 
         FROM content_translations 
         WHERE table_name = ? AND language_code = ? AND record_id IN (?)`,
        [tableName, lang, ids]
    );

    const transMap = {};
    translations.forEach(t => {
        if (!transMap[t.record_id]) transMap[t.record_id] = {};
        transMap[t.record_id][t.field_name] = t.translated_value;
    });

    return originalRows.map(row => {
        const trans = transMap[row.id];
        if (!trans) return row;

        const newRow = { ...row };
        for (const [field, val] of Object.entries(trans)) {
            if (val && (val.startsWith('[') || val.startsWith('{'))) {
                try {
                    newRow[field] = JSON.parse(val);
                } catch(e) {
                    newRow[field] = val;
                }
            } else {
                newRow[field] = val;
            }
        }
        return newRow;
    });
}

module.exports = { translateContent, runBatchTranslation, fetchAndApplyTranslations, AVAILABLE_LANGUAGES };
