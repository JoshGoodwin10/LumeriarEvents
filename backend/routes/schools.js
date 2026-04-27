const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// GET all schools
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM School ORDER BY school_name');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch schools' });
    }
});

// POST create school
router.post('/', async (req, res) => {
    const { school_name, best_score, avg_score, province, no_teams } = req.body;
    if (!school_name) return res.status(400).json({ message: 'school_name required' });
    try {
        const [result] = await db.execute(
            'INSERT INTO School (school_name, best_score, avg_score, province, no_teams) VALUES (?, ?, ?, ?, ?)',
            [school_name, best_score ?? null, avg_score ?? null, province ?? null, no_teams ?? 0]
        );
        res.status(201).json({ message: 'School created', school_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to create school' });
    }
});

// PUT update school
router.put('/:id', async (req, res) => {
    const { school_name, best_score, avg_score, province, no_teams } = req.body;
    try {
        const [result] = await db.execute(
            'UPDATE School SET school_name=?, best_score=?, avg_score=?, province=?, no_teams=? WHERE school_id=?',
            [school_name, best_score, avg_score, province, no_teams, req.params.id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'School not found' });
        res.json({ message: 'School updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to update school' });
    }
});

// DELETE school
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM School WHERE school_id=?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'School not found' });
        res.json({ message: 'School deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete school' });
    }
});

module.exports = router;