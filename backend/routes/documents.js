const express = require('express');
const multer = require('multer');
const db = require('../db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Use memory storage so we can store buffer in DB
const upload = multer({ storage: multer.memoryStorage() });

// ─── Public routes ───────────────────────────────────────────
// GET /api/documents – list current (latest) versions
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT document_id, name, description, version, file_name, upload_date
            FROM documents
            WHERE is_current = 1
            ORDER BY name
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch documents.' });
    }
});

// GET /api/documents/:id/download – download file
router.get('/:id/download', async (req, res) => {
    try {
        const [rows] = await db.execute(
            'SELECT name, file_name, file_data FROM documents WHERE document_id = ?',
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Document not found.' });
        }
        const doc = rows[0];
        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${doc.file_name}"`);
        res.send(doc.file_data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to download document.' });
    }
});

// ─── Admin routes (protected) ─────────────────────────────────
router.use(authMiddleware); // all following routes require admin

// GET /api/documents/all – list all versions (for admin)
router.get('/all', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT document_id, name, description, version, file_name, upload_date, is_current
            FROM documents
            ORDER BY name, upload_date DESC
        `);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch documents.' });
    }
});

// POST /api/documents – upload new version (sets old version's is_current=0)
router.post('/', upload.single('file'), async (req, res) => {
    const { name, description, version } = req.body;
    if (!name || !version || !req.file) {
        return res.status(400).json({ message: 'Name, version, and file are required.' });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        // Mark any existing current version of this document as not current
        await connection.execute(
            'UPDATE documents SET is_current = 0 WHERE name = ? AND is_current = 1',
            [name]
        );

        // Insert new version
        await connection.execute(
            `INSERT INTO documents (name, description, version, file_name, file_data, is_current)
             VALUES (?, ?, ?, ?, ?, 1)`,
            [name, description || null, version, req.file.originalname, req.file.buffer]
        );

        await connection.commit();
        res.status(201).json({ message: 'Document uploaded successfully.' });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error(err);
        res.status(500).json({ message: 'Failed to upload document.' });
    } finally {
        if (connection) connection.release();
    }
});

// DELETE /api/documents/:id – delete a specific version (admin only)
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM documents WHERE document_id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Document not found.' });
        res.json({ message: 'Document deleted.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to delete document.' });
    }
});

module.exports = router;