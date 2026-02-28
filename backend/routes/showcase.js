
const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// GET all posts (descending order)
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM showcase_posts ORDER BY created_at DESC');
        res.json(rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// POST a new creation
router.post('/', async (req, res) => {
    const { title, image_url, author_username, author_avatar } = req.body;
    if (!title || !image_url || !author_username) {
        return res.status(400).json({ error: "Champs manquants" });
    }
    try {
        const [result] = await pool.query(
            'INSERT INTO showcase_posts (title, image_url, author_username, author_avatar) VALUES (?, ?, ?, ?)',
            [title, image_url, author_username, author_avatar]
        );
        res.json({ id: result.insertId, success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// LIKE a post
router.post('/:id/like', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('UPDATE showcase_posts SET likes = likes + 1 WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// DELETE a post (Admin only logically, but keep it simple for now or don't expose if not needed)
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM showcase_posts WHERE id = ?', [req.params.id]);
        res.status(204).end();
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;
