
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'heartopia',
    port: parseInt(process.env.DB_PORT) || 3306,
    waitForConnections: process.env.DB_WAIT_FOR_CONNECTIONS === 'true',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
    queueLimit: parseInt(process.env.DB_QUEUE_LIMIT) || 0
};

const pool = mysql.createPool(dbConfig);

async function initDB() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log("🛠️  Initialisation de la base de données...");

        // Creation tables standard
        await connection.query(`CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, name_en VARCHAR(255), label VARCHAR(255), label_en VARCHAR(255)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        await connection.query(`CREATE TABLE IF NOT EXISTS pages (id INT AUTO_INCREMENT PRIMARY KEY, category_id INT NOT NULL, title VARCHAR(255) NOT NULL, title_en VARCHAR(255), slug VARCHAR(255), FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        await connection.query(`CREATE TABLE IF NOT EXISTS sections (id INT AUTO_INCREMENT PRIMARY KEY, page_id INT NOT NULL, title VARCHAR(255) NOT NULL, title_en VARCHAR(255), content LONGTEXT, content_en LONGTEXT, order_index INT DEFAULT 0, FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        await connection.query(`CREATE TABLE IF NOT EXISTS team_members (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, role VARCHAR(255) NOT NULL, avatar VARCHAR(500), description TEXT, color VARCHAR(50) DEFAULT '#55a4dd', discord_id VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        await connection.query(`CREATE TABLE IF NOT EXISTS guide_portals (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(255) NOT NULL, name_en VARCHAR(255), description TEXT, description_en TEXT, icon_url TEXT, bubble_url TEXT, order_index INT DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        await connection.query(`CREATE TABLE IF NOT EXISTS academy_videos (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, duration VARCHAR(50), type VARCHAR(50), video_url TEXT NOT NULL, poster_url TEXT, order_index INT DEFAULT 0) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        // Mise à jour table visites pour GDPR
        await connection.query(`CREATE TABLE IF NOT EXISTS site_visits (id INT AUTO_INCREMENT PRIMARY KEY, visitor_id VARCHAR(100), ip_address VARCHAR(45), page_path VARCHAR(255) DEFAULT '/', action_type VARCHAR(50) DEFAULT 'view', user_agent TEXT, visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        await connection.query(`CREATE TABLE IF NOT EXISTS comments (id INT AUTO_INCREMENT PRIMARY KEY, section_id INT NOT NULL, username VARCHAR(255) NOT NULL, avatar VARCHAR(500), content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        await connection.query(`CREATE TABLE IF NOT EXISTS feedbacks (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(255) NOT NULL, avatar VARCHAR(500), type VARCHAR(50) NOT NULL, content TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        // PROMO CODES (Updated with stats)
        await connection.query(`CREATE TABLE IF NOT EXISTS promo_codes (id INT AUTO_INCREMENT PRIMARY KEY, code VARCHAR(50) NOT NULL, reward VARCHAR(255) NOT NULL, status VARCHAR(20) DEFAULT 'active', description TEXT, usage_count INT DEFAULT 0, likes INT DEFAULT 0, dislikes INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        await connection.query(`CREATE TABLE IF NOT EXISTS announcements (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, title_en VARCHAR(255), tag VARCHAR(50) DEFAULT 'Info', content LONGTEXT, content_en LONGTEXT, image_url TEXT, is_pinned BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        await connection.query(`CREATE TABLE IF NOT EXISTS trading_ads (id INT AUTO_INCREMENT PRIMARY KEY, discord_id VARCHAR(100) NOT NULL, username VARCHAR(255) NOT NULL, avatar VARCHAR(500), type VARCHAR(50) DEFAULT 'trade', item_wanted VARCHAR(255), item_offered VARCHAR(255), status VARCHAR(20) DEFAULT 'open', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);
        await connection.query(`CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, sender_id VARCHAR(100) NOT NULL, receiver_id VARCHAR(100) NOT NULL, content TEXT NOT NULL, ad_id INT, is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`);

        // NOUVELLE TABLE USERS
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                discord_id VARCHAR(100) NOT NULL UNIQUE,
                username VARCHAR(255) NOT NULL,
                avatar VARCHAR(500),
                role ENUM('guest', 'support', 'moderator', 'admin') DEFAULT 'guest',
                last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                support_assigned_to INT DEFAULT NULL -- ID de l'admin qui gère le ticket
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // TABLE SETTINGS (Maintenance & Config Globale)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS settings (
                setting_key VARCHAR(50) PRIMARY KEY,
                setting_value VARCHAR(255)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // TABLE TRADUCTIONS CENTRALISÉE (Polymorphique)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS content_translations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                table_name VARCHAR(50) NOT NULL, -- 'sections', 'pages', etc.
                record_id INT NOT NULL,          -- ID de l'entrée dans la table d'origine
                language_code VARCHAR(10) NOT NULL, -- 'en', 'de', 'es', 'zh', 'ja'
                field_name VARCHAR(50) NOT NULL, -- 'title', 'content', 'description'
                translated_value LONGTEXT,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_translation (table_name, record_id, language_code, field_name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // TABLE SUPPORT LIVE CHAT
        await connection.query(`
            CREATE TABLE IF NOT EXISTS support_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL, -- L'ID interne de l'utilisateur qui demande de l'aide
                sender_role ENUM('user', 'admin') NOT NULL, -- Qui a envoyé ce message
                content TEXT NOT NULL,
                media_url LONGTEXT, -- Pour stocker le Base64 de l'image
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // TABLE CODE INTERACTIONS (Tracking Copy/Like/Dislike)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS code_interactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                code_id INT NOT NULL,
                ip_address VARCHAR(45) NOT NULL,
                action_type ENUM('copy', 'like', 'dislike') NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (code_id) REFERENCES promo_codes(id) ON DELETE CASCADE,
                UNIQUE KEY unique_action (code_id, ip_address, action_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // TABLE SHOWCASE POSTS (Galerie)
        await connection.query(`
            CREATE TABLE IF NOT EXISTS showcase_posts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image_url LONGTEXT NOT NULL,
                author_username VARCHAR(255) NOT NULL,
                author_avatar VARCHAR(500),
                likes INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        `);

        // Initialisation de la clé maintenance si elle n'existe pas
        await connection.query(`INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('maintenance', 'false')`);

        // MIGRATION AUTOMATIQUE
        const addColumnIfNotExists = async (table, column, type) => {
            try {
                await connection.query(`SELECT ${column} FROM ${table} LIMIT 1`);
            } catch (e) {
                console.log(`Doing migration: Adding ${column} to ${table}`);
                await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
            }
        };

        await addColumnIfNotExists('categories', 'name_en', 'VARCHAR(255)');
        await addColumnIfNotExists('categories', 'label_en', 'VARCHAR(255)');
        await addColumnIfNotExists('pages', 'title_en', 'VARCHAR(255)');
        await addColumnIfNotExists('sections', 'title_en', 'VARCHAR(255)');
        await addColumnIfNotExists('sections', 'content_en', 'LONGTEXT');
        await addColumnIfNotExists('guide_portals', 'name_en', 'VARCHAR(255)');
        await addColumnIfNotExists('guide_portals', 'description_en', 'TEXT');
        await addColumnIfNotExists('announcements', 'title_en', 'VARCHAR(255)');
        await addColumnIfNotExists('announcements', 'content_en', 'LONGTEXT');
        await addColumnIfNotExists('site_visits', 'visitor_id', 'VARCHAR(100)');
        await addColumnIfNotExists('site_visits', 'page_path', 'VARCHAR(255) DEFAULT "/"');
        await addColumnIfNotExists('site_visits', 'action_type', "VARCHAR(50) DEFAULT 'view'");
        await addColumnIfNotExists('support_messages', 'media_url', 'LONGTEXT');
        await addColumnIfNotExists('users', 'support_assigned_to', 'INT DEFAULT NULL');

        // Comments moderation migration (keep history instead of deleting)
        await addColumnIfNotExists('comments', 'status', "VARCHAR(20) DEFAULT 'open'");
        await addColumnIfNotExists('comments', 'handled_at', 'TIMESTAMP NULL');

        // Stats codes migration
        await addColumnIfNotExists('promo_codes', 'usage_count', 'INT DEFAULT 0');
        await addColumnIfNotExists('promo_codes', 'likes', 'INT DEFAULT 0');
        await addColumnIfNotExists('promo_codes', 'dislikes', 'INT DEFAULT 0');

        console.log("✅ Base de données prête et à jour.");
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation DB:", error.message);
        throw error;
    } finally {
        if (connection) connection.release();
    }
}

module.exports = { pool, initDB };
